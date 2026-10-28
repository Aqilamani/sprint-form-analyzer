import json

from fastapi.testclient import TestClient

from app.main import app
from app.services.run_store import EXAMPLE_RUN_PATH

client = TestClient(app)


def test_health() -> None:
    assert client.get("/api/health").json() == {"status": "ok"}


def test_list_runs() -> None:
    res = client.get("/api/runs")
    assert res.status_code == 200
    assert res.json() == [
        {"id": "mock-1", "athlete": "Athlete A", "date": "2026-10-21", "startPosition": "block"}
    ]


def test_get_run_returns_contract_shape() -> None:
    res = client.get("/api/runs/mock-1")
    assert res.status_code == 200
    assert res.json() == json.loads(EXAMPLE_RUN_PATH.read_text(encoding="utf-8"))


def test_get_unknown_run_is_404() -> None:
    res = client.get("/api/runs/nope")
    assert res.status_code == 404
    assert res.json() == {"detail": "Run not found"}
