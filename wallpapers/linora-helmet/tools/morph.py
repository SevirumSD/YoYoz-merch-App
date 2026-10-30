# Renders the fluid helmet transitions for the phone video: optical-flow morphs
# between the aligned posters, with the helmet sliding forward over her face (or
# back off it) behind a soft leading edge. No glow or flash; the motion does it.
# Run from the linora-helmet folder after prep.py: python3 tools/morph.py [frames]
# Writes morph/<from>-<to>_<k>.jpg, k = 0..frames-1, read by index.html?morph.
import os, sys
import numpy as np, cv2
from PIL import Image
from scipy import ndimage

N = int(sys.argv[1]) if len(sys.argv) > 1 else 31
H, W = 1536, 1024
ld = lambda n: np.asarray(Image.open(f'{n}.png').convert('RGB')).astype(np.float32)
img = {n: ld(n) for n in ('open', 'visor', 'closed')}
gray = {n: cv2.cvtColor(a.astype(np.uint8), cv2.COLOR_RGB2GRAY) for n, a in img.items()}
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
# The title block stays put; only she and the suit move.
title = np.zeros((H, W), np.float32); title[960:1350, 470:] = 1
still = 1 - cv2.GaussianBlur(title, (0, 0), 12)

def flow(a, b):
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    f = dis.calc(gray[a], gray[b], None)
    # Heavy smoothing: we want one coherent shift, not per-pixel detail.
    f = cv2.medianBlur(f, 5)
    return np.dstack([cv2.GaussianBlur(f[..., i], (0, 0), 18) * still for i in range(2)])

def warp(im, dx, dy):
    return cv2.remap(im, xx + dx, yy + dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

def sweep_field(origin, direction):
    d = np.array(direction, np.float32); d /= np.linalg.norm(d)
    return (xx - origin[0]) * d[0] + (yy - origin[1]) * d[1], d

def smooth(u): return u * u * (3 - 2 * u)

def region_mask(a, b, thresh=22, grow=14):
    diff = cv2.GaussianBlur(np.abs(img[a] - img[b]).mean(-1), (0, 0), 6)
    r = ndimage.binary_dilation(ndimage.binary_opening(diff > thresh, iterations=3), iterations=grow)
    r = ndimage.binary_fill_holes(r)
    lab, n = ndimage.label(r)
    sizes = ndimage.sum(r, lab, range(1, n + 1))
    r = np.isin(lab, 1 + np.flatnonzero(sizes > 20000))
    return cv2.GaussianBlur(r.astype(np.float32), (0, 0), 12)

# Each transition: the helmet's region, the direction its plates travel, and how far
# they slide while settling.
T = {
    ('visor', 'closed'): dict(origin=(430, 100), direction=(470, 750), slide=70),
    ('open', 'visor'):   dict(origin=(300, 0), direction=(420, 760), slide=60, head_box=(180, 0, 1024, 760)),
}

def render(a, b, reverse):
    """Frames for a -> b. reverse: the same motion as b -> a, played backwards."""
    src, dst = (b, a) if reverse else (a, b)
    cfg = T[(src, dst)]
    fab, fba = flow(src, dst), flow(dst, src)
    proj, d = sweep_field(cfg['origin'], cfg['direction'])
    if 'head_box' in cfg:
        x0, y0, x1, y1 = cfg['head_box']
        box = np.zeros((H, W), np.float32); box[y0:y1, x0:x1] = 1
        region = cv2.GaussianBlur(box, (0, 0), 40)
    else:
        region = region_mask(src, dst)
    if 'head_box' not in cfg:
        # Outside the helmet the two posters match: keep everything else still.
        fab, fba = fab * region[..., None], fba * region[..., None]
    lo, hi = np.percentile(proj[region > 0.5], [1, 99])
    feather = 0.09 * (hi - lo)
    frames = []
    for k in range(N):
        t = smooth(k / (N - 1))
        # Leading edge of the helmet travelling along the head.
        front = lo - feather + t * (hi - lo + 2 * feather)
        m_sweep = np.clip((front - proj) / feather, 0, 1); m_sweep = m_sweep * m_sweep * (3 - 2 * m_sweep)
        m = region * m_sweep + (1 - region) * t
        slide = (1 - t) * cfg['slide'] * region
        A = warp(img[src], -t * fab[..., 0], -t * fab[..., 1])
        B = warp(img[dst], -(1 - t) * fba[..., 0] - slide * d[0], -(1 - t) * fba[..., 1] - slide * d[1])
        frames.append(A * (1 - m[..., None]) + B * m[..., None])
    return frames[::-1] if reverse else frames

os.makedirs('morph', exist_ok=True)
for a, b, rev in [('open', 'visor', False), ('visor', 'closed', False), ('closed', 'visor', True), ('visor', 'open', True)]:
    for k, f in enumerate(render(a, b, rev)):
        Image.fromarray(np.clip(f, 0, 255).astype(np.uint8)).save(f'morph/{a}-{b}_{k}.jpg', quality=94)
    print(a, '->', b, 'done')
