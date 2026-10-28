import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useRun } from '../../api/runs'
import type { Run, Step } from '../../types/run'
import { FrameControls } from './FrameControls'
import { RunMetadataPanel } from './RunMetadataPanel'
import { SkeletonOverlay } from './SkeletonOverlay'
import { StepMetricsTable } from './StepMetricsTable'
import { StepTimeline } from './StepTimeline'
import { useVideoFrame } from './useVideoFrame'
import { VideoPlayer } from './VideoPlayer'

export function RunViewerPage() {
  const { runId = '' } = useParams()
  const { data: run, isPending, error } = useRun(runId)

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-6">
      <Link to="/" className="text-sm text-sky-400 hover:underline">
        ← All runs
      </Link>
      {isPending && <p className="text-slate-400">Loading run…</p>}
      {error && <p className="text-red-400">Could not load run: {error.message}</p>}
      {run && <RunViewer run={run} />}
    </main>
  )
}

function RunViewer({ run }: { run: Run }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [localVideoUrl, setLocalVideoUrl] = useState<string>()
  const videoSrc = localVideoUrl ?? run.metadata.videoUrl ?? undefined
  const frameCount = run.frames.length
  const { frame, seekToFrame } = useVideoFrame(videoRef, run.metadata.fps, frameCount, videoSrc)

  // Release the object URL when it is replaced or the page unmounts.
  useEffect(() => {
    if (!localVideoUrl) return
    return () => URL.revokeObjectURL(localVideoUrl)
  }, [localVideoUrl])

  const framesByIndex = useMemo(() => new Map(run.frames.map((f) => [f.index, f])), [run.frames])
  const flagsHere = useMemo(() => run.flags.filter((f) => f.frame === frame), [run.flags, frame])
  const flaggedJoints = useMemo(() => new Set(flagsHere.map((f) => f.joint)), [flagsHere])
  const activeStep = run.steps.find((s) => frame >= s.footStrikeFrame && frame <= s.toeOffFrame)
  const selectStep = (step: Step) => seekToFrame(step.footStrikeFrame)

  return (
    <>
      <RunMetadataPanel metadata={run.metadata} />
      <VideoPlayer
        videoRef={videoRef}
        src={videoSrc}
        initialAspect={`${run.metadata.frameWidth} / ${run.metadata.frameHeight}`}
        onPickFile={(file) => setLocalVideoUrl(URL.createObjectURL(file))}
      >
        <SkeletonOverlay
          frame={framesByIndex.get(frame)}
          keypointSet={run.keypointSet}
          flaggedJoints={flaggedJoints}
        />
      </VideoPlayer>
      <FrameControls
        frame={frame}
        frameCount={frameCount}
        fps={run.metadata.fps}
        flags={flagsHere}
        onSeek={seekToFrame}
      />
      <StepTimeline
        steps={run.steps}
        flags={run.flags}
        frame={frame}
        frameCount={frameCount}
        activeStepIndex={activeStep?.index}
        onSeek={seekToFrame}
      />
      <StepMetricsTable
        steps={run.steps}
        activeStepIndex={activeStep?.index}
        onSelect={selectStep}
      />
    </>
  )
}
