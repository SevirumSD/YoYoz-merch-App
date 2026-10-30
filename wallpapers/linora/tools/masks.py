import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
im = np.asarray(Image.open('src.png').convert('RGB')).astype(np.float32)
r,g,b = im[...,0],im[...,1],im[...,2]
L = (r+g+b)/3; sat = im.max(-1)-im.min(-1)
bright = (L > 185) & (sat < 30)
lab, n = ndimage.label(bright)
# components touching right edge or bottom-right
seeds = set(np.unique(lab[:, -1])) | set(np.unique(lab[-1, 600:]))
seeds.discard(0)
bg = np.isin(lab, list(seeds))
bg = ndimage.binary_closing(bg, iterations=4)
bg = ndimage.binary_opening(bg, iterations=2)
m = Image.fromarray((bg*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
out = np.zeros((*bg.shape,4),np.uint8); out[...,:3]=255; out[...,3]=np.asarray(m)
Image.fromarray(out).save('bgmask.png')
# glow mask: saturated blue lights
blue = (b > 110) & (b - r > 45) & (b - g > 20)
gm = Image.fromarray((blue*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4))
ga = np.asarray(gm).astype(np.float32)/255
glow = np.zeros((*bg.shape,4),np.uint8); glow[...,0]=80; glow[...,1]=150; glow[...,2]=255; glow[...,3]=(np.clip(ga*1.4,0,1)*255).astype(np.uint8)
Image.fromarray(glow).save('glow.png')
print(bg.mean(), blue.mean())
