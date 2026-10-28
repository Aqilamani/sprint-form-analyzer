import { describe, expect, it } from 'vitest'
import { clampFrame, frameToTime, timeToFrame } from './frames'

describe('timeToFrame', () => {
  it('matches hand-computed cases', () => {
    expect(timeToFrame(0, 60)).toBe(0)
    // 0.5 s * 60 fps = 30.0
    expect(timeToFrame(0.5, 60)).toBe(30)
    // 0.508 * 60 = 30.48 -> 30
    expect(timeToFrame(0.508, 60)).toBe(30)
    // 0.509 * 60 = 30.54 -> 31
    expect(timeToFrame(0.509, 60)).toBe(31)
    // 1.0 s at 29.97 fps = 29.97 -> 30
    expect(timeToFrame(1, 29.97)).toBe(30)
    // 0.1 s at 240 fps = 24.0
    expect(timeToFrame(0.1, 240)).toBe(24)
  })
})

describe('frameToTime', () => {
  it('lands within half a frame of f / fps', () => {
    // frame 30 at 60 fps = 0.5 s
    expect(frameToTime(30, 60)).toBeCloseTo(0.5, 3)
    expect(frameToTime(0, 60)).toBe(0)
  })

  it.each([24, 25, 29.97, 30, 60, 120, 240])('round-trips every frame at %s fps', (fps) => {
    for (let f = 0; f <= 10_000; f++) {
      expect(timeToFrame(frameToTime(f, fps), fps)).toBe(f)
    }
  })
})

describe('clampFrame', () => {
  it('clamps to [0, frameCount - 1]', () => {
    expect(clampFrame(-1, 120)).toBe(0)
    expect(clampFrame(0, 120)).toBe(0)
    expect(clampFrame(50, 120)).toBe(50)
    expect(clampFrame(119, 120)).toBe(119)
    expect(clampFrame(120, 120)).toBe(119)
    expect(clampFrame(5, 0)).toBe(0)
  })
})
