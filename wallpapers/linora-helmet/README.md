# Linora — helmet deploy wallpaper

Animated version of the black-suit *Linora* poster set. On a 16 s cycle her nanotech helmet deploys and retracts:

1. **Open**: face visible, rain behind her, water dripping off her chin.
2. **Visor**: a wave of glowing orange hex cells spreads out from the collar and rebuilds her into the visor poster.
3. **Closed**: the mask assembles plate by plate from the back of the helmet down over her face. Sparks fly off as cells lock in, and the eye slit flares as the suit powers up.
4. **Retract**: the mask breaks back down to the visor, then the visor withdraws into the collar.

Rain falls behind her (masked to the sky of whichever poster is showing), water drips and streams off her chin or mask, and the orange suit lights pulse. In the live version, clicking or tapping skips straight to the next helmet change.

| File | Use |
| --- | --- |
| `index.html` | Live version for PC (any resolution or aspect ratio). Keep the whole folder together: it needs `cells.js`, the three posters, and the `sky_*` and `glow_*` masks. |
| `linora-helmet-desk.mp4` | 1920×1080, 16 s seamless loop for PC. |
| `linora-helmet-desk-4k.mp4` | 3840×2160, 16 s seamless loop for 4K PC monitors. |
| `linora-helmet-phone.mp4` | 1080×2340, 16 s seamless loop for phones. |

Setup on PC and phone is the same as for `../linora/` (Lively Wallpaper or Wallpaper Engine on Windows, a video live-wallpaper app on Android, a Live Photo on iPhone). See that README for details.

## Tuning
In `index.html`:
- `TIMELINE`: how long each state holds and each change takes.
- `WATER`: drip points and streams for each helmet state.
- `GLOW_W`: how long cells keep burning after they flip.

## Regenerating
`src/` holds the three original posters. From this folder, `python3 tools/prep.py` does the following:
- aligns the open-helmet poster to the other two (it's framed slightly differently);
- builds the sky masks (`sky_*.png`) and the orange light masks (`glow_*.png`);
- writes `cells.js`, the hex-cell activation times for the full-frame wave and for the helmet-only wave.

It needs `numpy`, `pillow`, `scipy` and `opencv-python-headless`. The videos were rendered from `index.html?capture&w=W&h=H&dpr=D` over 18 s, then crossfaded end-to-start with ffmpeg into a seamless 16 s loop.
