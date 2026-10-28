import {
  COCO17_KEYPOINTS,
  COCO17_SKELETON,
  type Flag,
  type Frame,
  type Keypoint,
  type Run,
  type Step,
} from '../../types/run'

/**
 * Deterministic synthetic sprint start, side-on camera, athlete moving left to
 * right. Geometry is a rough stick figure, not biomechanically accurate, and
 * the metric values are illustrative numbers only (see docs/metrics.md).
 */

export const MOCK_RUN_ID = 'mock-1'

const FPS = 60
const FRAME_COUNT = 120
const LOW_CONFIDENCE_FRAMES = [70, 71, 72, 73, 74, 75, 76, 77, 78, 79]
const MISSING_JOINT = { frame: 47, joint: 'left_ankle' } as const

// Small seeded PRNG (mulberry32) so tests see the same data every run.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const deg = (d: number) => (d * Math.PI) / 180
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1)
const round = (v: number, dp: number) => Math.round(v * 10 ** dp) / 10 ** dp

type Point = { x: number; y: number }

function generateFrames(rand: () => number): Frame[] {
  const noise = (scale: number) => (rand() - 0.5) * 2 * scale
  const frames: Frame[] = []

  for (let f = 0; f < FRAME_COUNT; f++) {
    const progress = f / (FRAME_COUNT - 1)
    // Two steps per stride, one step every 20 frames.
    const phase = (2 * Math.PI * f) / 40
    const lean = deg(45 - 20 * progress)

    const hip: Point = { x: 0.15 + 0.7 * progress, y: 0.58 - 0.08 * progress }
    const shoulder: Point = {
      x: hip.x + 0.2 * Math.sin(lean),
      y: hip.y - 0.2 * Math.cos(lean),
    }
    const head: Point = {
      x: shoulder.x + 0.06 * Math.sin(lean),
      y: shoulder.y - 0.06 * Math.cos(lean),
    }

    const leg = (offset: number) => {
      const thigh = deg(15 + 40 * Math.sin(phase + offset))
      const knee: Point = { x: hip.x + 0.17 * Math.sin(thigh), y: hip.y + 0.17 * Math.cos(thigh) }
      const flex = deg(25 + 55 * (1 - Math.cos(phase + offset + 1)) * 0.5)
      const shin = thigh - flex
      const ankle: Point = { x: knee.x + 0.17 * Math.sin(shin), y: knee.y + 0.17 * Math.cos(shin) }
      return { knee, ankle }
    }
    const arm = (offset: number) => {
      const swing = deg(-50 * Math.sin(phase + offset))
      const elbow: Point = {
        x: shoulder.x + 0.11 * Math.sin(swing),
        y: shoulder.y + 0.11 * Math.cos(swing),
      }
      const wrist: Point = {
        x: elbow.x + 0.1 * Math.sin(swing + deg(70)),
        y: elbow.y + 0.1 * Math.cos(swing + deg(70)),
      }
      return { elbow, wrist }
    }

    const left = leg(0)
    const right = leg(Math.PI)
    const leftArm = arm(Math.PI)
    const rightArm = arm(0)

    const positions: Record<string, Point> = {
      nose: { x: head.x + 0.02, y: head.y },
      left_eye: { x: head.x + 0.012, y: head.y - 0.008 },
      right_eye: { x: head.x + 0.014, y: head.y - 0.009 },
      left_ear: { x: head.x - 0.012, y: head.y - 0.004 },
      right_ear: { x: head.x - 0.01, y: head.y - 0.005 },
      left_shoulder: shoulder,
      right_shoulder: { x: shoulder.x - 0.01, y: shoulder.y },
      left_elbow: leftArm.elbow,
      right_elbow: rightArm.elbow,
      left_wrist: leftArm.wrist,
      right_wrist: rightArm.wrist,
      left_hip: hip,
      right_hip: { x: hip.x - 0.01, y: hip.y },
      left_knee: left.knee,
      right_knee: right.knee,
      left_ankle: left.ankle,
      right_ankle: right.ankle,
    }

    const lowConfidence = LOW_CONFIDENCE_FRAMES.includes(f)
    const keypoints: Keypoint[] = COCO17_KEYPOINTS.map((name) => {
      if (f === MISSING_JOINT.frame && name === MISSING_JOINT.joint) return null
      const p = positions[name]
      const distalLeg = /knee|ankle/.test(name)
      const confidence =
        lowConfidence && distalLeg ? 0.2 + rand() * 0.2 : 0.8 + rand() * 0.19
      return {
        x: round(clamp01(p.x + noise(0.004)), 4),
        y: round(clamp01(p.y + noise(0.004)), 4),
        confidence: round(confidence, 3),
      }
    })

    frames.push({ index: f, keypoints })
  }
  return frames
}

function generateSteps(rand: () => number): Step[] {
  const noise = (scale: number) => (rand() - 0.5) * 2 * scale
  const contactFrames = [14, 13, 12, 11, 10, 10]
  return contactFrames.map((contact, i) => {
    const footStrikeFrame = 8 + i * 20
    const progress = i / (contactFrames.length - 1)
    return {
      index: i,
      side: i % 2 === 0 ? 'left' : 'right',
      footStrikeFrame,
      toeOffFrame: footStrikeFrame + contact,
      metrics: {
        trunkAngle: round(44 - 18 * progress + noise(2.5), 1),
        shinAngleAtTouchdown: round(48 + 20 * progress + noise(3), 1),
        footToHipDistanceAtTouchdown: round(-0.06 + 0.1 * progress + noise(0.02), 3),
        thighAngle: round(62 - 8 * progress + noise(4), 1),
        kickback: round(70 + 25 * progress + noise(5), 1),
      },
    }
  })
}

function generateFlags(): Flag[] {
  return [
    { frame: MISSING_JOINT.frame, joint: MISSING_JOINT.joint, reason: 'Joint not detected' },
    ...LOW_CONFIDENCE_FRAMES.map((frame) => ({
      frame,
      joint: 'right_ankle',
      reason: 'Low confidence (occluded far-side leg)',
    })),
  ]
}

export function createMockRun(seed = 42): Run {
  const rand = mulberry32(seed)
  return {
    metadata: {
      id: MOCK_RUN_ID,
      athlete: 'Athlete A',
      date: '2026-10-21',
      startPosition: 'block',
      cameraPosition: 'side_left',
      fps: FPS,
      frameWidth: 1920,
      frameHeight: 1080,
      surface: 'Synthetic track',
      videoUrl: null,
    },
    keypointSet: { names: [...COCO17_KEYPOINTS], skeleton: COCO17_SKELETON },
    frames: generateFrames(rand),
    steps: generateSteps(rand),
    flags: generateFlags(),
  }
}
