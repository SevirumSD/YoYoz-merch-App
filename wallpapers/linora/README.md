# Linora — animated rain wallpaper

Animated version of the Sevirum *Linora* poster. Rain falls behind her (masked to the sky only). The drips painted into the poster come alive: the drop hanging off her jaw fills, swells and falls, then re-forms; the beads on her tear streak grow, slide down into each other and run off; the trickle under her chin flows. Extra runoff slides down her face with wet trails, glints sparkle on wet skin, and the blue armor lights pulse.

| File | Use |
| --- | --- |
| `index.html` | Live, endlessly varied version for PC (any resolution or aspect ratio). Needs `scene.png`, `bgmask.png`, `glow.png` and the `drip_*.png` files next to it. |
| `linora-desk.mp4` | 1920×1080, 12 s seamless loop for PC. |
| `linora-desk-4k.mp4` | 3840×2160, 12 s seamless loop for 4K PC monitors. |
| `linora-phone.mp4` | 1080×2340, 12 s seamless loop for phones. |

## PC (Windows)
- **Lively Wallpaper** (free, Microsoft Store): *Add wallpaper* → choose `index.html` (keep the whole folder together), or drop in `linora-desk.mp4` (`linora-desk-4k.mp4` on a 4K monitor).
- **Wallpaper Engine**: Wallpaper Editor → *Create wallpaper* → pick `index.html` (web) or `linora-desk.mp4` (video).
- **macOS**: use an app such as Plash (HTML) or any video-wallpaper app with `linora-desk.mp4`.

## Phone
- **Android**: a video live-wallpaper app (e.g. *Video Live Wallpaper*), select `linora-phone.mp4`. Some launchers support video wallpapers natively.
- **iPhone**: iOS has no looping video wallpaper. Convert the MP4 to a Live Photo (e.g. with *intoLive*) and set it as the Lock Screen wallpaper; it animates on long-press.

## Regenerating
`src.png` is the original poster. From this folder, `python3 tools/masks.py` builds `bgmask.png` (sky region) and `glow.png` (blue lights); `python3 tools/drips.py` erases the painted drips to make `scene.png` and cuts them out as `drip_*.png` sprites (their boxes are the `SPRITES` table in `index.html`). Both need `numpy`, `pillow`, `scipy` and `opencv-python-headless`. The videos were rendered from `index.html?capture&w=W&h=H&dpr=D` (the 4K video is `w=1920&h=1080&dpr=2`, so it matches the 1080p layout at double resolution), which exposes `window.wp.step(dt)` / `wp.draw()` for deterministic frame capture, then crossfaded end-to-start with ffmpeg for a seamless loop.
