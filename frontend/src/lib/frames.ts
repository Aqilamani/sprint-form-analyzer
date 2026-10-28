/**
 * Frame/time conversion. Frame f is presented at time f / fps, so a media
 * time t belongs to frame round(t * fps).
 */

// Seek slightly past the frame's timestamp so float error in f / fps never
// lands on the previous frame. Must stay well under half a frame at any fps.
const SEEK_EPSILON_S = 1e-4

export function timeToFrame(time: number, fps: number): number {
  return Math.round(time * fps)
}

export function frameToTime(frame: number, fps: number): number {
  return frame / fps + (frame > 0 ? SEEK_EPSILON_S : 0)
}

export function clampFrame(frame: number, frameCount: number): number {
  if (frameCount <= 0) return 0
  return Math.min(Math.max(frame, 0), frameCount - 1)
}
