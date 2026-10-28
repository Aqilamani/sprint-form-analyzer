from functools import lru_cache
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.run import Run, RunSummary
from app.services.run_store import FixtureRunStore, RunStore

router = APIRouter(prefix="/runs", tags=["runs"])


@lru_cache
def get_run_store() -> RunStore:
    return FixtureRunStore()


Store = Annotated[RunStore, Depends(get_run_store)]


@router.get("", response_model=list[RunSummary], response_model_by_alias=True)
def list_runs(store: Store) -> list[RunSummary]:
    return [RunSummary.from_metadata(run.metadata) for run in store.list_runs()]


@router.get("/{run_id}", response_model=Run, response_model_by_alias=True)
def get_run(run_id: str, store: Store) -> Run:
    run = store.get_run(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return run
