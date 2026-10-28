import { z } from 'zod'

/**
 * Data contract for a processed run. The backend must return exactly this
 * shape; the frontend parses every response through RunSchema.
 *
 * Metric values are nullable numbers with no unit attached: units and
 * definitions come from docs/metrics.md once written.
 */

export const COCO17_KEYPOINTS = [
  'nose',
  'left_eye',
  'right_eye',
  'left_ear',
  'right_ear',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
  'left_ankle',
  'right_ankle',
] as const

export const COCO17_SKELETON: [string, string][] = [
  ['left_ear', 'left_eye'],
  ['left_eye', 'nose'],
  ['nose', 'right_eye'],
  ['right_eye', 'right_ear'],
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
]

const unit = z.number().min(0).max(1)

/** x, y normalised to 0–1 of video width/height; null = joint not detected. */
export const KeypointSchema = z
  .object({ x: unit, y: unit, confidence: unit })
  .nullable()

export const KeypointSetSchema = z
  .object({
    names: z.array(z.string().min(1)).min(1),
    skeleton: z.array(z.tuple([z.string(), z.string()])),
  })
  .superRefine((set, ctx) => {
    const names = new Set(set.names)
    if (names.size !== set.names.length) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate keypoint names', path: ['names'] })
    }
    set.skeleton.forEach((pair, i) => {
      pair.forEach((name, j) => {
        if (!names.has(name)) {
          ctx.addIssue({
            code: 'custom',
            message: `Unknown keypoint "${name}"`,
            path: ['skeleton', i, j],
          })
        }
      })
    })
  })

export const RunMetadataSchema = z.object({
  id: z.string().min(1),
  athlete: z.string().min(1),
  date: z.iso.date(),
  startPosition: z.enum(['block', 'three_point', 'standing', 'other']),
  cameraPosition: z.enum(['side_left', 'side_right', 'front', 'other']),
  fps: z.number().positive(),
  surface: z.string().min(1),
  videoUrl: z.string().optional(),
})

export const FrameSchema = z.object({
  index: z.int().nonnegative(),
  keypoints: z.array(KeypointSchema),
})

export const StepMetricsSchema = z.object({
  trunkAngle: z.number().nullable(),
  shinAngleAtTouchdown: z.number().nullable(),
  footToHipDistanceAtTouchdown: z.number().nullable(),
  thighAngle: z.number().nullable(),
  kickback: z.number().nullable(),
})

export const StepSchema = z
  .object({
    index: z.int().nonnegative(),
    side: z.enum(['left', 'right']),
    footStrikeFrame: z.int().nonnegative(),
    toeOffFrame: z.int().nonnegative(),
    metrics: StepMetricsSchema,
  })
  .refine((s) => s.toeOffFrame > s.footStrikeFrame, {
    message: 'toeOffFrame must be after footStrikeFrame',
    path: ['toeOffFrame'],
  })

export const FlagSchema = z.object({
  frame: z.int().nonnegative(),
  joint: z.string().min(1),
  reason: z.string().min(1),
})

export const RunSchema = z
  .object({
    metadata: RunMetadataSchema,
    keypointSet: KeypointSetSchema,
    frames: z.array(FrameSchema),
    steps: z.array(StepSchema),
    flags: z.array(FlagSchema),
  })
  .superRefine((run, ctx) => {
    const count = run.keypointSet.names.length
    const names = new Set(run.keypointSet.names)
    run.frames.forEach((frame, i) => {
      if (frame.keypoints.length !== count) {
        ctx.addIssue({
          code: 'custom',
          message: `Frame ${frame.index} has ${frame.keypoints.length} keypoints, expected ${count}`,
          path: ['frames', i, 'keypoints'],
        })
      }
    })
    run.flags.forEach((flag, i) => {
      if (!names.has(flag.joint)) {
        ctx.addIssue({
          code: 'custom',
          message: `Unknown joint "${flag.joint}"`,
          path: ['flags', i, 'joint'],
        })
      }
    })
  })

export const RunSummarySchema = RunMetadataSchema.pick({
  id: true,
  athlete: true,
  date: true,
  startPosition: true,
})

export type Keypoint = z.infer<typeof KeypointSchema>
export type KeypointSet = z.infer<typeof KeypointSetSchema>
export type RunMetadata = z.infer<typeof RunMetadataSchema>
export type Frame = z.infer<typeof FrameSchema>
export type StepMetrics = z.infer<typeof StepMetricsSchema>
export type Step = z.infer<typeof StepSchema>
export type Flag = z.infer<typeof FlagSchema>
export type Run = z.infer<typeof RunSchema>
export type RunSummary = z.infer<typeof RunSummarySchema>

export const METRIC_LABELS: Record<keyof StepMetrics, string> = {
  trunkAngle: 'Trunk angle',
  shinAngleAtTouchdown: 'Shin angle at touchdown',
  footToHipDistanceAtTouchdown: 'Foot-to-hip distance at touchdown',
  thighAngle: 'Thigh angle',
  kickback: 'Kickback',
}
