# Sprint Form Analyzer: backend

FastAPI service that serves processed runs. For now it serves the shared
example run in `contract/run.example.json`; pose estimation and metric
calculation are not implemented yet.

Python 3.11+ (pinned to 3.12 in `.python-version`). Dependencies are managed
with [uv](https://docs.astral.sh/uv/).

```bash
uv sync                                   # create .venv and install
uv run uvicorn app.main:app --reload      # http://localhost:8000/api, docs at /docs
uv run pytest
uv run ruff check .
```

With the venv activated, the commands in CLAUDE.md (`uvicorn ...`, `pytest`)
work as written.

## Endpoints
- `GET /api/health`
- `GET /api/runs`: run summaries
- `GET /api/runs/{run_id}`: full run (contract shape, camelCase JSON)

## Layout
- `app/schemas/run.py`: Pydantic contract, mirrors `frontend/src/types/run.ts`
- `app/services/run_store.py`: `RunStore` protocol and the fixture-backed store
- `app/api/runs.py`: routes
- `tests/`: contract round-trip and API tests

## Using it from the frontend
```bash
cd frontend && VITE_USE_MOCKS=false npm run dev
```
Vite proxies `/api` to `http://localhost:8000`. If that port is taken, run
uvicorn with `--port 8001` and set `VITE_API_PROXY_TARGET=http://localhost:8001`.
