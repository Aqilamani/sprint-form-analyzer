# Weekly log

## Week 1 (26 Oct – 1 Nov 2026)

### Done
- Repository set up: README, CLAUDE.md, `.gitignore` that keeps `data/`,
  uploads and video files out of git. `main` is the default branch; work goes
  through one branch per feature.
- Frontend scaffold (`frontend/`): Vite, React, TypeScript, Tailwind, React
  Router, TanStack Query, Zod, MSW, Vitest.
- Data contract for a processed run (`frontend/src/types/run.ts`): run
  metadata, per-frame COCO-17 keypoints (x, y, confidence; `null` = missing),
  skeleton map, steps with five metrics, and quality flags.
- Deterministic mock run (synthetic, 60 fps, 120 frames, 6 steps) with noisy
  values, a block of low-confidence frames and one frame with a missing joint.
- Run Viewer page: video with skeleton overlay (faded and dashed on low
  confidence, flagged joints ringed), frame stepping with arrow keys
  (`frame = round(time * fps)`), step timeline that jumps to foot strike,
  per-step metrics table.
- Tests for frame/time conversion (hand-computed cases plus round trip at
  24–240 fps) and for the data contract.
- Draft metric definitions in `docs/metrics.md` (conventions, formulas,
  worked examples). Not yet signed off; kickback definition not chosen.
- Backend scaffold started (`backend/`): FastAPI app serving the same run
  shape from a shared example fixture.

### Not yet verified
- Run Viewer behaviour in a browser with a real clip (overlay drawing,
  `requestVideoFrameCallback` stepping, timeline jumps).

### Decisions
- Keypoints are stored normalised (0–1); the run must also carry frame
  width/height so angles can be computed in pixels.
- No metric is calculated until its definition is marked Agreed.

### Next
- Confirm or correct the metric drafts with the supervisor; choose a kickback
  definition; add references.
- Implement the first metric with a hand-computed unit test once agreed.
- Wire a pose model behind an interface in the backend.
- Plan data collection and ethics paperwork for participant videos.
