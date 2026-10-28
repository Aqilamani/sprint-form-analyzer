from fastapi import FastAPI

from app.api import runs

app = FastAPI(title="Sprint Form Analyzer API", version="0.1.0")
app.include_router(runs.router, prefix="/api")


@app.get("/api/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
