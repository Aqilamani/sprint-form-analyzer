# Metric definitions

Source of truth for every metric the system reports. Code must follow these
definitions exactly.

> **Status: DRAFT, not yet signed off.** These are candidate definitions
> written so that each metric is computable and testable. Every metric marked
> DRAFT still needs: (1) confirmation against the project's chosen literature
> or supervisor, (2) a reference, (3) resolution of its open choices. Do not
> implement a metric calculation until its status reads **Agreed**.

All metrics are computed per step, from 2D keypoints of a single fixed,
side-on camera.

## Conventions (apply to every metric)

- **Coordinates.** Keypoints arrive normalised (0–1). Convert to pixels before
  any geometry: `X = x * frameWidth`, `Y = y * frameHeight`. Angles computed on
  normalised coordinates are wrong unless the frame is square. Image axes:
  X to the right, Y **down**.
- **Direction of travel** `d`: `+1` if the athlete moves towards +X, `-1`
  otherwise, from the sign of the hip midpoint's X displacement between the
  first and last frame. "Forward" always means along `d`.
- **Midpoints.** `hip_mid` = mean of left and right hip; `shoulder_mid` = mean
  of left and right shoulder.
- **Stance leg** of a step = `step.side`. **Swing leg** = the other side.
- **Event frames.** Touchdown = `step.footStrikeFrame`. Toe-off =
  `step.toeOffFrame`.
- **Missing data.** If any keypoint a metric needs is `null` or has
  confidence < 0.5 at the event frame, that metric is `null` for that step.
  No interpolation in the first version.
- **Rounding.** Angles in degrees, reported to 1 decimal place. Ratios to 3.
- **Smoothing.** None in the first version (open choice, see end).

Angle helper used below, with `v = (vx, vy)` in pixel coordinates:

- `angle_from_forward_horizontal(v) = atan2(-vy, d * vx)` in degrees.
  0° = pointing forward, 90° = pointing straight up, 180° = pointing backward.

## 1. Trunk angle
- status: DRAFT
- definition: angle between the trunk segment and the forward horizontal at
  touchdown. `v = shoulder_mid - hip_mid`,
  `trunk = angle_from_forward_horizontal(v)`.
- unit: degrees. 90° = upright; smaller = more forward lean.
- event: touchdown.
- worked example: `d = +1`, `hip_mid = (200, 400)`, `shoulder_mid = (300, 300)`
  gives `v = (100, -100)` and `atan2(100, 100) = 45.0°`.
- open choices: horizontal or vertical reference; touchdown or mean over
  ground contact; midpoints or near-side shoulder/hip only.
- reference: TBD

## 2. Shin angle at touchdown
- status: DRAFT
- definition: angle between the stance-leg shank and the forward horizontal at
  touchdown. `v = knee - ankle` (stance side),
  `shin = angle_from_forward_horizontal(v)`.
- unit: degrees. Below 90° = knee ahead of ankle (forward shin lean);
  90° = vertical shin; above 90° = ankle ahead of knee.
- event: touchdown.
- worked example: `d = +1`, `ankle = (100, 400)`, `knee = (160, 340)` gives
  `v = (60, -60)` and `atan2(60, 60) = 45.0°`.
- open choices: horizontal or vertical reference.
- reference: TBD

## 3. Foot-to-hip distance at touchdown
- status: DRAFT
- definition: horizontal distance along the direction of travel from the hip
  midpoint to the stance ankle at touchdown, normalised by leg length.
  `foot_to_hip = d * (ankle.X - hip_mid.X) / L`.
  `L` = median over all frames of `|hip - knee| + |knee - ankle|` for the
  stance side, using only frames where all three keypoints have
  confidence ≥ 0.5.
- unit: dimensionless (leg lengths). Positive = foot ahead of hip;
  negative = foot behind hip.
- event: touchdown.
- worked example: `d = +1`, `hip_mid.X = 200`, `ankle.X = 230`, `L = 300`
  gives `+0.100`.
- open choices: ankle as the foot point (COCO-17 has no heel or toe) or a foot
  keypoint from a model that provides one (e.g. MediaPipe heel / foot index);
  leg-length normalisation or metres via a calibration object of known size.
- reference: TBD

## 4. Thigh angle
- status: DRAFT
- definition: angle of the swing-leg thigh from the downward vertical at
  touchdown, positive when the knee is ahead of the hip.
  `v = knee - hip` (swing side), `thigh = atan2(d * vx, vy)` in degrees.
- unit: degrees. 0° = knee directly below hip; 90° = thigh horizontal in
  front; negative = knee behind hip.
- event: touchdown.
- worked example: `d = +1`, `hip = (200, 300)`, `knee = (260, 360)` gives
  `v = (60, 60)` and `atan2(60, 60) = 45.0°`.
- open choices: swing thigh at touchdown, or swing thigh at toe-off, or
  thigh separation (angle between both thighs) at touchdown.
- reference: TBD

## 5. Kickback
- status: DRAFT, **definition not chosen**
- definition: TBD. The term is used for different things; pick one:
  - **A. Heel recovery:** maximum swing-leg knee flexion between toe-off and
    the next touchdown of the same leg, as the knee angle
    `angle(hip - knee, ankle - knee)` at its minimum. Unit: degrees; smaller
    = heel recovered closer to the buttock.
  - **B. Backward foot motion before touchdown:** horizontal distance the
    stance ankle travels backward (relative to `hip_mid`) between its most
    forward position in late swing and touchdown, normalised by `L`. Unit:
    leg lengths.
- unit: depends on the choice.
- reference: TBD

## Open choices that affect all metrics
- Smoothing of keypoint trajectories (none, or e.g. a low-pass filter with a
  stated cut-off) before metrics are computed.
- Whether "side_left" camera means the camera is on the athlete's left
  (left side is nearest the camera) and whether near-side keypoints should be
  preferred.
- Confidence threshold (0.5 here) and whether it should be per keypoint model.
