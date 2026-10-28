"""Data contract for a processed run.

Mirrors frontend/src/types/run.ts (Zod). Field names are snake_case in Python
and camelCase on the wire. Both sides are tested against
contract/run.example.json, so a change here must be made there too.

Metric values are nullable floats with no unit attached: units and
definitions come from docs/metrics.md once agreed.
"""

from datetime import date
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator
from pydantic.alias_generators import to_camel

Unit = Annotated[float, Field(ge=0, le=1)]
NonNegInt = Annotated[int, Field(ge=0)]


class ContractModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="forbid")


class Keypoint(ContractModel):
    """x, y normalised to 0-1 of frame width/height."""

    x: Unit
    y: Unit
    confidence: Unit


class KeypointSet(ContractModel):
    names: Annotated[list[Annotated[str, Field(min_length=1)]], Field(min_length=1)]
    skeleton: list[tuple[str, str]]

    @model_validator(mode="after")
    def _check_names(self) -> "KeypointSet":
        known = set(self.names)
        if len(known) != len(self.names):
            raise ValueError("Duplicate keypoint names")
        for a, b in self.skeleton:
            for name in (a, b):
                if name not in known:
                    raise ValueError(f'Unknown keypoint "{name}" in skeleton')
        return self


class RunMetadata(ContractModel):
    id: Annotated[str, Field(min_length=1)]
    athlete: Annotated[str, Field(min_length=1)]
    date: date
    start_position: Literal["block", "three_point", "standing", "other"]
    camera_position: Literal["side_left", "side_right", "front", "other"]
    fps: Annotated[float, Field(gt=0)]
    frame_width: Annotated[int, Field(gt=0)]
    frame_height: Annotated[int, Field(gt=0)]
    surface: Annotated[str, Field(min_length=1)]
    video_url: str | None


class Frame(ContractModel):
    index: NonNegInt
    # None = joint not detected in this frame.
    keypoints: list[Keypoint | None]


class StepMetrics(ContractModel):
    trunk_angle: float | None
    shin_angle_at_touchdown: float | None
    foot_to_hip_distance_at_touchdown: float | None
    thigh_angle: float | None
    kickback: float | None


class Step(ContractModel):
    index: NonNegInt
    side: Literal["left", "right"]
    foot_strike_frame: NonNegInt
    toe_off_frame: NonNegInt
    metrics: StepMetrics

    @model_validator(mode="after")
    def _toe_off_after_strike(self) -> "Step":
        if self.toe_off_frame <= self.foot_strike_frame:
            raise ValueError("toeOffFrame must be after footStrikeFrame")
        return self


class Flag(ContractModel):
    frame: NonNegInt
    joint: Annotated[str, Field(min_length=1)]
    reason: Annotated[str, Field(min_length=1)]


class Run(ContractModel):
    metadata: RunMetadata
    keypoint_set: KeypointSet
    frames: list[Frame]
    steps: list[Step]
    flags: list[Flag]

    @model_validator(mode="after")
    def _check_frames_and_flags(self) -> "Run":
        count = len(self.keypoint_set.names)
        for frame in self.frames:
            if len(frame.keypoints) != count:
                raise ValueError(
                    f"Frame {frame.index} has {len(frame.keypoints)} keypoints, expected {count}"
                )
        known = set(self.keypoint_set.names)
        for flag in self.flags:
            if flag.joint not in known:
                raise ValueError(f'Unknown joint "{flag.joint}" in flags')
        return self


class RunSummary(ContractModel):
    id: str
    athlete: str
    date: date
    start_position: Literal["block", "three_point", "standing", "other"]

    @classmethod
    def from_metadata(cls, metadata: RunMetadata) -> "RunSummary":
        return cls(
            id=metadata.id,
            athlete=metadata.athlete,
            date=metadata.date,
            start_position=metadata.start_position,
        )
