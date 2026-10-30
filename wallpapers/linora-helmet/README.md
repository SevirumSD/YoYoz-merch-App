# Linora — helmet deploy wallpaper

Animated version of the black-suit *Linora* poster set. On a 16 s cycle her nanotech helmet deploys and retracts:

1. **Open**: face visible, rain behind her, water dripping off her chin.
2. **Visor**: a wave of glowing orange hex cells spreads out from the collar and rebuilds her into the visor poster.
3. **Closed**: the mask assembles plate by plate from the back of the helmet down over her face. Sparks fly off as cells lock in, and the eye slit flares as the suit powers up.
4. **Retract**: the mask breaks back down to the visor, then the visor withdraws into the collar.

Rain falls behind her (masked to the sky of whichever poster is showing), water drips and streams off her chin or mask, and the orange suit lights pulse. In the live version, clicking or tapping skips straight to the next helmet change.

**Phone version (fluid):** the phone video uses smooth morphs instead of the hex waves, with no glow or flash. Her head and the suit shift into place as one continuous movement, and the visor and mask plates slide forward over her face (or back off it) behind a soft leading edge. Each change takes under a second, on a 15 s cycle. The live page does the same with `index.html?morph`, once the morph frames have been generated (see below).

| File | Use |
| --- | --- |
| `index.html` | Live version for PC (any resolution or aspect ratio). Keep the whole folder together: it needs `cells.js`, the three posters, and the `sky_*` and `glow_*` masks. |
| `linora-helmet-desk.mp4` | 1920×1080, 16 s seamless loop for PC. |
| `linora-helmet-desk-4k.mp4` | 3840×2160, 16 s seamless loop for 4K PC monitors. |
| `linora-helmet-phone.mp4` | 1080×2340, 15 s seamless loop for phones, with fluid morph transitions. |

Setup on PC and phone is the same as for `../linora/` (Lively Wallpaper or Wallpaper Engine on Windows, a video live-wallpaper app on Android, a Live Photo on iPhone). See that README for details.

## Tuning
In `index.html`:
- `TIMELINE`: how long each state holds and each change takes. The morph mode has its own durations at the top of the same table.
- `WATER`: drip points and streams for each helmet state.
- `GLOW_W`: how long cells keep burning after they flip.

## Regenerating
`src/` holds the three original posters. From this folder, `python3 tools/prep.py` does the following:
- aligns the open-helmet poster to the other two (it's framed slightly differently);
- builds the sky masks (`sky_*.png`) and the orange light masks (`glow_*.png`);
- copies the visor poster's title lettering onto the open poster, so the title never shifts;
- writes `cells.js`, the hex-cell activation times for the full-frame wave and for the helmet-only wave.

`python3 tools/morph.py` then renders the fluid transitions into `morph/` (about 50 MB of JPEGs, not committed). It uses optical flow between the aligned posters, holds the title still, and slides the helmet along the head.

It needs `numpy`, `pillow`, `scipy` and `opencv-python-headless`. The PC videos were rendered from `index.html?capture&w=W&h=H&dpr=D` over 18 s, then crossfaded end-to-start with ffmpeg into a seamless 16 s loop. The phone video was rendered the same way from `index.html?capture&morph&w=1080&h=2340` over 17 s (awaiting `wp.prepare()` before each `wp.draw()` so the morph frame is loaded), into a 15 s loop.
