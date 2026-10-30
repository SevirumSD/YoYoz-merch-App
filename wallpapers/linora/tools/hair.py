# Builds hair_amp.png: how far each pixel of the poster may sway in the wind
# (0 = still, 255 = the full amplitude set in index.html). Loose strands against the
# sky move most, the hair mass on her head a little, and her face, eye, the wet
# strands stuck to her cheek and the armor not at all.
# Run from the linora folder: python3 tools/hair.py
import numpy as np, cv2
from PIL import Image

src = np.asarray(Image.open('scene.png').convert('RGB')).astype(np.float32)
H, W = src.shape[:2]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

# Hair zone, traced around the top hair mass, the fringe and the strands on the right.
zone = np.zeros((H, W), np.uint8)
cv2.fillPoly(zone, [np.array([
    (450, 0), (1024, 0), (1024, 940), (975, 940), (960, 800), (945, 700), (945, 600), (930, 520), (900, 445),
    (905, 420), (900, 330), (860, 290), (780, 280), (720, 290), (650, 300), (600, 300), (580, 260), (540, 190), (470, 100),
], np.int32)], 1)
amp = cv2.GaussianBlur(zone.astype(np.float32), (0, 0), 12)

# Keep skin still: warm, mid-bright pixels (the face between the fringe strands).
r, g, b = src[..., 0], src[..., 1], src[..., 2]
L = src.mean(-1)
skin = ((r > g + 10) & (r > b + 18) & (L > 60) & (L < 235)).astype(np.uint8)
skin = cv2.GaussianBlur(cv2.dilate(skin, np.ones((5, 5), np.uint8)).astype(np.float32), (0, 0), 8)
amp *= 1 - np.clip(skin * 1.3, 0, 0.97)
# And the eye, completely.
eye = np.zeros((H, W), np.float32); cv2.ellipse(eye, (830, 372), (95, 60), 0, 0, 360, 1, -1)
amp *= 1 - cv2.GaussianBlur(eye, (0, 0), 14)

# Strands against the sky are free to move; toward their tips (lower right) most of all.
sky = np.asarray(Image.open('bgmask.png'))[..., 3].astype(np.float32) / 255
near_sky = cv2.GaussianBlur(sky, (0, 0), 22)
near_sky /= near_sky[zone > 0].max()
weight = 0.3 + 0.7 * near_sky
tips = np.where(xx > 880, 0.55 + 0.45 * np.clip((yy - 380) / 450, 0, 1), 1)
amp *= weight * tips
amp = cv2.GaussianBlur(amp, (0, 0), 5)
amp /= amp.max()
Image.fromarray((amp * 255).astype(np.uint8)).save('hair_amp.png')
print('hair_amp.png: mean in zone', round(float(amp[zone > 0].mean()), 3))
