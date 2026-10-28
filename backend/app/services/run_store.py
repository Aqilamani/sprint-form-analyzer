"""Where processed runs come from.

Routes depend on the RunStore protocol, so the fixture store used now can be
replaced by a SQLite-backed store without touching the API layer.
"""

from pathlib import Path
from typing import Protocol

from app.schemas.run import Run

REPO_ROOT = Path(__file__).resolve().parents[3]
EXAMPLE_RUN_PATH = REPO_ROOT / "contract" / "run.example.json"


class RunStore(Protocol):
    def list_runs(self) -> list[Run]: ...

    def get_run(self, run_id: str) -> Run | None: ...


class FixtureRunStore:
    """Serves the shared contract example until real processing exists."""

    def __init__(self, paths: list[Path] | None = None) -> None:
        paths = paths if paths is not None else [EXAMPLE_RUN_PATH]
        self._runs = {
            run.metadata.id: run
            for run in (Run.model_validate_json(p.read_text(encoding="utf-8")) for p in paths)
        }

    def list_runs(self) -> list[Run]:
        return list(self._runs.values())

    def get_run(self, run_id: str) -> Run | None:
        return self._runs.get(run_id)
