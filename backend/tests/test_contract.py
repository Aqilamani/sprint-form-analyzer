"""The Pydantic models must accept the shared example and reproduce it exactly."""

import copy
import json

import pytest
from pydantic import ValidationError

from app.schemas.run import Run
from app.services.run_store import EXAMPLE_RUN_PATH


@pytest.fixture
def example() -> dict:
    return json.loads(EXAMPLE_RUN_PATH.read_text(encoding="utf-8"))


def test_example_round_trips_unchanged(example: dict) -> None:
    run = Run.model_validate(example)
    assert run.model_dump(mode="json", by_alias=True) == example


def test_rejects_wrong_keypoint_count(example: dict) -> None:
    bad = copy.deepcopy(example)
    bad["frames"][3]["keypoints"].pop()
    with pytest.raises(ValidationError, match="Frame 3 has 16 keypoints, expected 17"):
        Run.model_validate(bad)


def test_rejects_unknown_skeleton_keypoint(example: dict) -> None:
    bad = copy.deepcopy(example)
    bad["keypointSet"]["skeleton"].append(["left_hip", "left_toe"])
    with pytest.raises(ValidationError, match="left_toe"):
        Run.model_validate(bad)


def test_rejects_toe_off_not_after_foot_strike(example: dict) -> None:
    bad = copy.deepcopy(example)
    bad["steps"][0]["toeOffFrame"] = bad["steps"][0]["footStrikeFrame"]
    with pytest.raises(ValidationError, match="toeOffFrame must be after footStrikeFrame"):
        Run.model_validate(bad)


def test_rejects_unknown_field(example: dict) -> None:
    bad = copy.deepcopy(example)
    bad["metadata"]["cameraHeight"] = 1.2
    with pytest.raises(ValidationError):
        Run.model_validate(bad)


def test_keeps_missing_joint_as_null(example: dict) -> None:
    run = Run.model_validate(example)
    ankle = run.keypoint_set.names.index("left_ankle")
    assert run.frames[47].keypoints[ankle] is None
