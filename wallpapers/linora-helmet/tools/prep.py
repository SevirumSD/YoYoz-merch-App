# Builds the helmet wallpaper's assets from the three source posters in src/:
# aligned state images, sky masks (where rain shows), orange light masks, and the
# hex-cell field (cells.js) that drives the nanotech transitions.
# Run from the linora-helmet folder: python3 tools/prep.py
import json
import numpy as np, cv2
from PIL import Image, ImageFilter
from scipy import ndimage

W, H = 1024, 1536
ld = lambda p: np.asarray(Image.open(p).convert('RGB'))
imgs = {'open': ld('src/open.png'), 'visor': ld('src/visor.png'), 'closed': ld('src/closed.png')}

# The open-helmet poster is framed slightly differently: align it to the others
# with a similarity transform estimated from ORB feature matches.
def align(src, dst):
    g1, g2 = (cv2.cvtColor(x, cv2.COLOR_RGB2GRAY) for x in (src, dst))
    orb = cv2.ORB_create(5000)
    k1, d1 = orb.detectAndCompute(g1, None); k2, d2 = orb.detectAndCompute(g2, None)
    m = sorted(cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(d1, d2), key=lambda x: x.distance)[:600]
    A, _ = cv2.estimateAffinePartial2D(np.float32([k1[x.queryIdx].pt for x in m]), np.float32([k2[x.trainIdx].pt for x in m]),
                                       method=cv2.RANSAC, ransacReprojThreshold=4)
    return cv2.warpAffine(src, A, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
imgs['open'] = align(imgs['open'], imgs['visor'])

# The title lettering differs by a few pixels between the posters: give the open
# poster the visor poster's lettering so the title never shifts or doubles.
def sky_of(im):
    f = im.astype(np.float32)
    return (f.mean(-1) > 175) & ((f.max(-1) - f.min(-1)) < 32)
box = np.zeros((H, W), bool); box[960:1350, 505:] = True
text = box & ~(sky_of(imgs['open']) & sky_of(imgs['visor']))
text = ndimage.binary_dilation(text, iterations=4)
a = cv2.GaussianBlur(text.astype(np.float32), (0, 0), 2)[..., None]
imgs['open'] = (imgs['open'] * (1 - a) + imgs['visor'] * a).astype(np.uint8)

sky = {}
for name, im in imgs.items():
    Image.fromarray(im).save(f'{name}.png')
    f = im.astype(np.float32); L = f.mean(-1); sat = f.max(-1) - f.min(-1)
    # Sky: bright, colourless, connected to the right edge.
    lab, _ = ndimage.label((L > 175) & (sat < 32))
    seeds = (set(np.unique(lab[:, -1])) | set(np.unique(lab[-1, 600:]))) - {0}
    bg = ndimage.binary_opening(ndimage.binary_closing(np.isin(lab, list(seeds)), iterations=4), iterations=2)
    sky[name] = bg
    a = np.asarray(Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)))
    out = np.zeros((H, W, 4), np.uint8); out[..., :3] = 255; out[..., 3] = a
    Image.fromarray(out).save(f'sky_{name}.png')
    # Orange suit lights.
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    lit = (r > 170) & (r - b > 90) & (g > 60) & (g < r - 20)
    ga = np.asarray(Image.fromarray((lit * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4))).astype(np.float32) / 255
    glow = np.zeros((H, W, 4), np.uint8); glow[..., 0] = 255; glow[..., 1] = 140; glow[..., 2] = 40
    glow[..., 3] = (np.clip(ga * 1.5, 0, 1) * 255).astype(np.uint8)
    Image.fromarray(glow).save(f'glow_{name}.png')

# Hex cells. Each cell gets an activation time t in [0, 1]: when a transition's
# progress passes t, the cell flips to the next image with a glowing edge.
R = 13.0
rng = np.random.default_rng(7)
def hexgrid():
    dx, dy = R * np.sqrt(3), R * 1.5
    for j in range(int(H / dy) + 2):
        for i in range(int(W / dx) + 2):
            yield i * dx + (dx / 2 if j % 2 else 0), j * dy
cells = np.array(list(hexgrid()), np.float32)
ci = np.clip(cells.astype(int), [0, 0], [W - 1, H - 1])
noise = cv2.resize(rng.random((24, 16)).astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC)
def field(region, t):
    keep = region[ci[:, 1], ci[:, 0]]
    t = t[keep]; t = (t - t.min()) / (t.max() - t.min())
    t = np.clip(t + rng.uniform(-0.04, 0.04, t.shape), 0, 1)
    subject = ~(sky_any[ci[keep, 1], ci[keep, 0]])
    c = cells[keep]; order = np.argsort(t)
    return [[round(float(c[k, 0]), 1), round(float(c[k, 1]), 1), round(float(t[k]), 4), int(subject[k])] for k in order]
# Shared sky, with the title lettering and bokeh it encloses: these cells crossfade instead of flipping.
sky_any = ndimage.binary_fill_holes(sky['open'] & sky['visor'] & sky['closed'])

# Full frame (open <-> visor): a wave spreading from the collar.
d = np.hypot(cells[:, 0] - 400, cells[:, 1] - 820)
full = field(np.ones((H, W), bool), d + 260 * noise[ci[:, 1], ci[:, 0]])
# Helmet only (visor <-> closed): plates sweep from the back of the helmet over the face.
diff = cv2.GaussianBlur(np.abs(imgs['visor'].astype(np.float32) - imgs['closed'].astype(np.float32)).mean(-1), (0, 0), 6)
region = ndimage.binary_dilation(ndimage.binary_opening(diff > 22, iterations=3), iterations=10)
region = ndimage.binary_fill_holes(region)
lab, n = ndimage.label(region)
sizes = ndimage.sum(region, lab, range(1, n + 1))
region = np.isin(lab, 1 + np.flatnonzero(sizes > 20000))
dirv = np.array([470, 750], np.float32); dirv /= np.linalg.norm(dirv)
proj = (cells[:, 0] - 430) * dirv[0] + (cells[:, 1] - 100) * dirv[1]
helmet = field(region, proj + 160 * noise[ci[:, 1], ci[:, 0]])
with open('cells.js', 'w') as fh:
    fh.write('// Generated by tools/prep.py: hex cells [x, y, activation t, on the subject] sorted by t.\n')
    fh.write(f'window.HEX_R = {R};\nwindow.CELLS = {json.dumps({"full": full, "helmet": helmet}, separators=(",", ":"))};\n')
Image.fromarray((region * 255).astype(np.uint8)).save('/tmp/claude-0/-home-user-YoYoz-merch-App/4c0a031a-0790-5a55-b514-0dc27ebcac96/scratchpad/helmet_region.png')
print('cells full', len(full), 'helmet', len(helmet))
