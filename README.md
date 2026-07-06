# Ghost Wheel


Try it: [https://ghost-wheel.surge.sh/](https://ghost-wheel.surge.sh/)

Steer a truck through trees using an invisible steering wheel — hold both hands up to the webcam and tilt. Hand detection runs on [Roboflow inferencejs](https://docs.roboflow.com/deploy/sdks/web-browser). A YOLOv8 hand-detection model (`egohands-public/9` from Roboflow Universe) runs entirely in the browser via WebGL; steering tilt is computed from the line between the two detected hand-box centers.

Built with [Svelte 5](https://svelte.dev) + [Vite](https://vite.dev) + [Tailwind CSS](https://tailwindcss.com).

## Setup

1. Get your **publishable** API key (starts with `rf_`, not the private key) from the Roboflow dashboard → Settings → API Keys.
2. Put it in `.env.local`:

```
VITE_ROBOFLOW_PUBLISHABLE_KEY=rf_xxxxxxxx
```

3. Run the dev server:

```bash
bun install
bun run dev
```

4. Open the printed localhost URL, allow camera access, then hold both hands up to the webcam and tilt like a steering wheel.

To use your own trained model, set `VITE_ROBOFLOW_MODEL` and `VITE_ROBOFLOW_MODEL_VERSION` (the version must have TF.js/web weights, i.e. trained with Roboflow Train YOLOv8/v5).

## Build

```bash
bun run build    # outputs a static site to dist/
bun run preview  # serve the production build locally
```

The build is a fully static SPA — deploy `dist/` to any static host.

## Project layout

- `src/App.svelte` — game loop: spawning, distance, lives, collision handling, soft reset
- `src/lib/SteeringWheel.svelte` — webcam + Roboflow inferencejs worker, steering-tilt math
- `src/lib/Obstacle.svelte` / `src/lib/Vehicle.svelte` — falling trees and the truck
- `src/lib/Dashboard.svelte` — HUD (distance, lives, pause/game-over, music mute)
- `src/lib/audio.ts` — Web Audio background loop + collision FX

## Credits

- Music and sound effects by Eric Matyas — [soundimage.org](https://soundimage.org/)
