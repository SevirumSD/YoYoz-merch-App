# Linora — animated rain wallpaper

Animated version of the Sevirum *Linora* poster. Rain falls behind her (masked to the sky only). The drips painted into the poster come alive: the drop hanging off her jaw fills, swells and falls, then re-forms; the beads on her tear streak grow, slide down into each other and run off; the trickle under her chin flows. Water streams down her face, armor and hair: drops slide down her skin and the armor plates, gather at her jaw, the plate tips and the hair tips, and drip or pour off in thin streams that splash on the armor below. Her hair sways in the wind: gusts blow it to the left, like the rain, and the loose strands against the sky move most while her face stays perfectly still. Glints sparkle on wet skin, and the blue armor lights pulse. Rates and positions are tables near the top of the face-drops section of `index.html` (`PATHS`, `SITES`, `POURS`).

| File | Use |
| --- | --- |
| `index.html` | Live, endlessly varied version for PC (any resolution or aspect ratio). Needs `scene.png`, `bgmask.png`, `glow.png` and the `drip_*.png` files next to it. |
| `linora-desk.mp4` | 1920×1080, 12 s seamless loop for PC. |
| `linora-desk-4k.mp4` | 3840×2160, 12 s seamless loop for 4K PC monitors. |
| `linora-phone.mp4` | 1080×2340, 12 s seamless loop for phones (heavy water, no hair motion). |
| `linora-phone-wind.mp4` | 1080×2340, 12 s seamless loop for phones: lighter water (`?water=light`) and hair moving in the wind. |

## PC (Windows)
- **Lively Wallpaper** (free, Microsoft Store): *Add wallpaper* → choose `index.html` (keep the whole folder together), or drop in `linora-desk.mp4` (`linora-desk-4k.mp4` on a 4K monitor).
- **Wallpaper Engine**: Wallpaper Editor → *Create wallpaper* → pick `index.html` (web) or `linora-desk.mp4` (video).
- **macOS**: use an app such as Plash (HTML) or any video-wallpaper app with `linora-desk.mp4`.

## Phone
- **Android**: a video live-wallpaper app (e.g. *Video Live Wallpaper*), select `linora-phone.mp4`. Some launchers support video wallpapers natively.
- **iPhone**: iOS has no looping video wallpaper. Convert the MP4 to a Live Photo (e.g. with *intoLive*) and set it as the Lock Screen wallpaper; it animates on long-press.

## Regenerating
`src.png` is the original poster. From this folder, `python3 tools/masks.py` builds `bgmask.png` (sky region) and `glow.png` (blue lights); `python3 tools/drips.py` erases the painted drips to make `scene.png` and cuts them out as `drip_*.png` sprites (their boxes are the `SPRITES` table in `index.html`). `python3 tools/hair.py` builds `hair_amp.png`, the map of how far each pixel of hair may sway (the warp itself is a WebGL shader in `index.html`, with its strength set by `HAIR_AMP`; without WebGL the hair just stays still). All of them need `numpy`, `pillow`, `scipy` and `opencv-python-headless`.

`index.html?water=light` uses the calmer first water set: runoff on her face and the poster's own drips, with no streams off the armor or hair. The videos were rendered from `index.html?capture&w=W&h=H&dpr=D` (the 4K video is `w=1920&h=1080&dpr=2`, so it matches the 1080p layout at double resolution), which exposes `window.wp.step(dt)` / `wp.draw()` for deterministic frame capture, then crossfaded end-to-start with ffmpeg for a seamless loop.
