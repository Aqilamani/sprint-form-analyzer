import { describe, expect, it } from 'vitest'
import { createMockRun } from '../mocks/fixtures/run'
import { RunSchema } from './run'

describe('RunSchema', () => {
  it('accepts the mock run', () => {
    expect(RunSchema.safeParse(createMockRun()).success).toBe(true)
  })

  it('rejects a frame with the wrong number of keypoints', () => {
    const run = createMockRun()
    run.frames[3].keypoints.pop()
    const result = RunSchema.safeParse(run)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['frames', 3, 'keypoints'])
  })

  it('rejects a skeleton edge naming an unknown keypoint', () => {
    const run = createMockRun()
    run.keypointSet.skeleton.push(['left_hip', 'left_toe'])
    expect(RunSchema.safeParse(run).success).toBe(false)
  })

  it('rejects a step whose toe-off is not after foot strike', () => {
    const run = createMockRun()
    run.steps[0].toeOffFrame = run.steps[0].footStrikeFrame
    expect(RunSchema.safeParse(run).success).toBe(false)
  })
})
