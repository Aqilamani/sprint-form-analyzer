import { useCallback, useEffect, useState, type RefObject } from 'react'
import { clampFrame, frameToTime, timeToFrame } from '../../lib/frames'

// Checked on the prototype: DOM typings always declare it, so testing the
// element itself would narrow the fallback branch to `never`.
const SUPPORTS_RVFC =
  typeof HTMLVideoElement !== 'undefined' &&
  'requestVideoFrameCallback' in HTMLVideoElement.prototype

/**
 * Tracks the frame currently presented by a <video>. Uses
 * requestVideoFrameCallback (mediaTime is the presented frame's timestamp),
 * falling back to timeupdate/seeked where it is unsupported.
 *
 * Works without a video source too: seekToFrame then just sets the frame, so
 * the overlay can be stepped through on its own.
 */
export function useVideoFrame(
  videoRef: RefObject<HTMLVideoElement | null>,
  fps: number,
  frameCount: number,
  videoSrc: string | undefined,
) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc) return
    const update = (time: number) => setFrame(clampFrame(timeToFrame(time, fps), frameCount))

    if (SUPPORTS_RVFC) {
      let handle = 0
      const onFrame: VideoFrameRequestCallback = (_now, metadata) => {
        update(metadata.mediaTime)
        handle = video.requestVideoFrameCallback(onFrame)
      }
      handle = video.requestVideoFrameCallback(onFrame)
      return () => video.cancelVideoFrameCallback(handle)
    }

    const onTime = () => update(video.currentTime)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('seeked', onTime)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('seeked', onTime)
    }
  }, [videoRef, fps, frameCount, videoSrc])

  const seekToFrame = useCallback(
    (target: number) => {
      const next = clampFrame(target, frameCount)
      setFrame(next)
      const video = videoRef.current
      if (video && videoSrc && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        video.pause()
        video.currentTime = frameToTime(next, fps)
      }
    },
    [videoRef, fps, frameCount, videoSrc],
  )

  return { frame, seekToFrame }
}
