# Sprint Form Analyzer

FYP: pose-estimation-based sprint technique analysis.
Metric definitions live in docs/metrics.md. Follow them exactly.

## Stack
- backend/: Python 3.11+, FastAPI, OpenCV, MediaPipe, NumPy/SciPy/pandas, SQLite
- frontend/: React, TypeScript, Vite, Tailwind
- evaluation/: validity and reliability scripts (Bland-Altman, ICC, typical error)

## Commands
- Backend run: `cd backend && uvicorn app.main:app --reload`
- Backend test: `cd backend && pytest`
- Lint: `ruff check backend`
- Frontend: `cd frontend && npm run dev`

## Rules
- Never commit anything in data/ or any video file.
- Every angle calculation needs a unit test with a hand-computed case.
- Keep the pose model behind an interface so models can be swapped.
- Small commits, one feature per branch.
