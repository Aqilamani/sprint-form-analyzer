import { useState, type ReactNode, type RefObject } from 'react'

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>
  src: string | undefined
  /** CSS aspect-ratio of the run's frames, used until the video reports its own. */
  initialAspect: string
  onPickFile: (file: File) => void
  children: ReactNode
}

/**
 * <video> with the overlay stacked on top. The box takes the video's aspect
 * ratio once metadata loads, so normalised keypoints map onto it directly.
 */
export function VideoPlayer({ videoRef, src, initialAspect, onPickFile, children }: Props) {
  const [aspect, setAspect] = useState(initialAspect)

  return (
    <div className="space-y-2">
      <div
        className="relative w-full overflow-hidden rounded-lg border border-slate-800 bg-black"
        style={{ aspectRatio: aspect }}
      >
        {src ? (
          <video
            ref={videoRef}
            src={src}
            controls
            muted
            playsInline
            className="absolute inset-0 h-full w-full"
            onLoadedMetadata={(e) => {
              const { videoWidth, videoHeight } = e.currentTarget
              if (videoWidth && videoHeight) setAspect(`${videoWidth} / ${videoHeight}`)
            }}
          />
        ) : (
          <p className="absolute inset-x-0 bottom-3 text-center text-sm text-slate-500">
            No video loaded. Showing skeleton only.
          </p>
        )}
        {children}
      </div>
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-400">
        <span className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800">
          Load local video
        </span>
        <span>Plays in this browser only; nothing is uploaded.</span>
        <input
          type="file"
          accept="video/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onPickFile(file)
          }}
        />
      </label>
    </div>
  )
}
