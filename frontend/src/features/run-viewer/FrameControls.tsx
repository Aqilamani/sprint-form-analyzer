import { useEffect } from 'react'
import type { Flag } from '../../types/run'

type Props = {
  frame: number
  frameCount: number
  fps: number
  flags: Flag[]
  onSeek: (frame: number) => void
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/** Frame readout and stepping. ←/→ step one frame, Shift+←/→ step ten. */
export function FrameControls({ frame, frameCount, fps, flags, onSeek }: Props) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if (isTypingTarget(e.target) || e.altKey || e.ctrlKey || e.metaKey) return
      e.preventDefault()
      const step = (e.shiftKey ? 10 : 1) * (e.key === 'ArrowLeft' ? -1 : 1)
      onSeek(frame + step)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [frame, onSeek])

  const button = 'rounded border border-slate-700 px-3 py-1 hover:bg-slate-800 disabled:opacity-40'

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <button className={button} onClick={() => onSeek(frame - 1)} disabled={frame <= 0}>
          ← Prev
        </button>
        <button
          className={button}
          onClick={() => onSeek(frame + 1)}
          disabled={frame >= frameCount - 1}
        >
          Next →
        </button>
        <span className="font-mono text-sm tabular-nums">
          frame {frame} / {frameCount - 1} · t = {(frame / fps).toFixed(3)} s
        </span>
        <span className="text-xs text-slate-500">←/→ one frame, Shift for ten</span>
      </div>
      {flags.length > 0 && (
        <ul className="text-sm text-red-300">
          {flags.map((flag) => (
            <li key={`${flag.joint}-${flag.reason}`}>
              ⚑ {flag.joint.replace('_', ' ')}: {flag.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
