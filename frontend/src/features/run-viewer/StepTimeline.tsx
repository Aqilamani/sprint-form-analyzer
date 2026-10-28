import type { Flag, Step } from '../../types/run'

type Props = {
  steps: Step[]
  flags: Flag[]
  frame: number
  frameCount: number
  activeStepIndex: number | undefined
  onSeek: (frame: number) => void
}

/** One block per ground contact (foot strike → toe-off); click to jump to foot strike. */
export function StepTimeline({ steps, flags, frame, frameCount, activeStepIndex, onSeek }: Props) {
  const pct = (f: number) => `${(f / Math.max(frameCount - 1, 1)) * 100}%`
  const flaggedFrames = [...new Set(flags.map((f) => f.frame))]

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>Steps</span>
        <span>
          <span className="text-sky-400">■</span> left <span className="text-orange-400">■</span>{' '}
          right <span className="text-red-400">|</span> flag
        </span>
      </div>
      <div
        className="relative h-12 cursor-pointer rounded bg-slate-900"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          onSeek(Math.round(((e.clientX - rect.left) / rect.width) * (frameCount - 1)))
        }}
      >
        {flaggedFrames.map((f) => (
          <div
            key={f}
            className="absolute bottom-0 h-2 w-px bg-red-400"
            style={{ left: pct(f) }}
          />
        ))}
        {steps.map((step) => (
          <button
            key={step.index}
            type="button"
            title={`Step ${step.index + 1} (${step.side}): frames ${step.footStrikeFrame}–${step.toeOffFrame}`}
            onClick={(e) => {
              e.stopPropagation()
              onSeek(step.footStrikeFrame)
            }}
            className={[
              'absolute top-1 h-7 rounded-sm text-xs font-medium text-slate-950',
              step.side === 'left' ? 'bg-sky-400' : 'bg-orange-400',
              activeStepIndex === step.index ? 'ring-2 ring-white' : 'opacity-80 hover:opacity-100',
            ].join(' ')}
            style={{
              left: pct(step.footStrikeFrame),
              width: pct(step.toeOffFrame - step.footStrikeFrame),
            }}
          >
            {step.index + 1}
          </button>
        ))}
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white"
          style={{ left: pct(frame) }}
        />
      </div>
    </div>
  )
}
