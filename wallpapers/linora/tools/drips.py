import numpy as np, cv2, sys
from PIL import Image, ImageDraw
OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
src = np.asarray(Image.open('src.png').convert('RGB'))
H, W = src.shape[:2]
L = src.mean(-1)

def ellipse_mask(cx, cy, rx, ry, ang=0):
    m = np.zeros((H, W), np.uint8)
    cv2.ellipse(m, (int(cx*4), int(cy*4)), (int(rx*4), int(ry*4)), ang, 0, 360, 255, -1, shift=2)
    return m

# Removal masks for the painted drips (image px).
sites = {
    'a':  ellipse_mask(548, 894, 11, 11) * (np.arange(H)[:, None] >= 883),  # hanging jaw drop, below the jaw line
    'c1': ellipse_mask(739, 610, 7, 13, 25),     # upper tear bead
    'c2': ellipse_mask(713, 671, 6, 10, 20),     # lower tear bead
}
# Trickle below the chin: dark pixels in a narrow strip.
strip = np.zeros((H, W), np.uint8)
x0, x1, y0, y1 = 582, 598, 900, 1068
sub = L[y0:y1, x0:x1]
bgcol = np.median(L[y0:y1, x0-12:x0-4])
strip[y0:y1, x0:x1] = ((bgcol - sub) > 6).astype(np.uint8) * 255
strip = cv2.dilate(strip, np.ones((3, 3), np.uint8), iterations=2)
sites['stream'] = strip

allm = np.zeros((H, W), np.uint8)
for m in sites.values(): allm |= m
bgr = cv2.cvtColor(src, cv2.COLOR_RGB2BGR)
clean = cv2.inpaint(bgr, allm, 6, cv2.INPAINT_TELEA)
clean = cv2.cvtColor(clean, cv2.COLOR_BGR2RGB)
# Drips hanging over the white sky: fill from nearby bright pixels only, so the
# jaw edge doesn't smear into the hole.
white = (sites['a'] | sites['stream']) > 0
w = ((L > 200) & ~white).astype(np.float32)
num = cv2.GaussianBlur(src.astype(np.float32) * w[..., None], (0, 0), 5)
den = cv2.GaussianBlur(w, (0, 0), 5)[..., None]
plate = num / np.maximum(den, 1e-3)
clean[white] = np.clip(plate[white], 0, 255).astype(np.uint8)

# Restore the thin tear streak through the bead holes so it stays continuous.
streak = [(760,575),(752,588),(745,600),(737,612),(730,626),(724,640),(718,655),(713,668),(710,680)]
lay = Image.new('RGBA', (W*4, H*4)); d = ImageDraw.Draw(lay)
d.line([(x*4, y*4) for x, y in streak], fill=(205,200,204,70), width=4, joint='curve')
lay = lay.resize((W, H), Image.LANCZOS)
ring = cv2.dilate(sites['c1'] | sites['c2'], np.ones((3,3),np.uint8))
la = np.asarray(lay).astype(np.float32); la[..., 3] *= (ring > 0)
a = la[..., 3:4] / 255
clean = (clean * (1 - a) + la[..., :3] * a).astype(np.uint8)
Image.fromarray(clean).save(f'{OUT}/scene.png')

# Sprites: original pixels, feathered alpha. White-background drips are
# un-blended against the clean plate so they stay see-through when moving.
meta = {}
def save_sprite(name, mask, unblend):
    ys, xs = np.nonzero(mask); pad = 3
    bx0, by0, bx1, by1 = xs.min()-pad, ys.min()-pad, xs.max()+pad+1, ys.max()+pad+1
    o = src[by0:by1, bx0:bx1].astype(np.float32); c = clean[by0:by1, bx0:bx1].astype(np.float32)
    feather = cv2.GaussianBlur(mask[by0:by1, bx0:bx1].astype(np.float32)/255, (5, 5), 1.2)
    if unblend:
        F = np.array([70, 72, 80], np.float32)
        diff = (c - o).mean(-1)
        alpha = np.clip(diff / np.maximum((c - F).mean(-1), 1), 0, 1)
        alpha = np.clip(alpha * 1.15, 0, 1) * feather
        rgb = np.where(alpha[..., None] > 0.01, (o - c * (1 - alpha[..., None])) / np.maximum(alpha[..., None], 0.01), o)
        rgb = np.clip(rgb, 0, 255)
    else:
        alpha, rgb = feather, o
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(f'{OUT}/drip_{name}.png')
    meta[name] = (int(bx0), int(by0), int(bx1-bx0), int(by1-by0))
save_sprite('a', sites['a'], True)
save_sprite('c1', sites['c1'], False)
save_sprite('c2', sites['c2'], False)
save_sprite('stream', sites['stream'], True)
print(meta)
