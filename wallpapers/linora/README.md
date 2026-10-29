# Linora — animated rain wallpaper

Animated version of the Sevirum *Linora* poster. Rain falls behind her (masked to the sky only), water drops slide down her face with wet trails and drip off her chin and nose, glints sparkle on wet skin, and the blue armor lights pulse.

| File | Use |
| --- | --- |
| `index.html` | Live, endlessly varied version for PC (any resolution or aspect ratio). Needs `src.png`, `bgmask.png`, `glow.png` next to it. |
| `linora-desk.mp4` | 1920×1080, 12 s seamless loop for PC. |
| `linora-phone.mp4` | 1080×2340, 12 s seamless loop for phones. |

## PC (Windows)
- **Lively Wallpaper** (free, Microsoft Store): *Add wallpaper* → choose `index.html` (keep the whole folder together), or drop in `linora-desk.mp4`.
- **Wallpaper Engine**: Wallpaper Editor → *Create wallpaper* → pick `index.html` (web) or `linora-desk.mp4` (video).
- **macOS**: use an app such as Plash (HTML) or any video-wallpaper app with `linora-desk.mp4`.

## Phone
- **Android**: a video live-wallpaper app (e.g. *Video Live Wallpaper*), select `linora-phone.mp4`. Some launchers support video wallpapers natively.
- **iPhone**: iOS has no looping video wallpaper. Convert the MP4 to a Live Photo (e.g. with *intoLive*) and set it as the Lock Screen wallpaper; it animates on long-press.

## Regenerating
`bgmask.png` (sky region) and `glow.png` (blue lights) were derived from `src.png`. The videos were rendered from `index.html?capture&w=W&h=H`, which exposes `window.wp.step(dt)` / `wp.draw()` for deterministic frame capture, then crossfaded end-to-start with ffmpeg for a seamless loop.
