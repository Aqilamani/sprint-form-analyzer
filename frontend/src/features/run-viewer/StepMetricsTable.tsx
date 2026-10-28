import { METRIC_LABELS, type Step, type StepMetrics } from '../../types/run'

type Props = {
  steps: Step[]
  activeStepIndex: number | undefined
  onSelect: (step: Step) => void
}

const METRIC_KEYS = Object.keys(METRIC_LABELS) as (keyof StepMetrics)[]

/** Raw per-step values. Units are TBD until docs/metrics.md defines them. */
export function StepMetricsTable({ steps, activeStepIndex, onSelect }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-900 text-left text-slate-400">
          <tr>
            <th className="px-3 py-2 font-medium">Step</th>
            <th className="px-3 py-2 font-medium">Side</th>
            <th className="px-3 py-2 font-medium">Frames</th>
            {METRIC_KEYS.map((key) => (
              <th key={key} className="px-3 py-2 text-right font-medium">
                {METRIC_LABELS[key]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {steps.map((step) => (
            <tr
              key={step.index}
              onClick={() => onSelect(step)}
              className={
                'cursor-pointer hover:bg-slate-900 ' +
                (activeStepIndex === step.index ? 'bg-slate-800' : '')
              }
            >
              <td className="px-3 py-2">{step.index + 1}</td>
              <td className={'px-3 py-2 ' + (step.side === 'left' ? 'text-sky-400' : 'text-orange-400')}>
                {step.side}
              </td>
              <td className="px-3 py-2 font-mono tabular-nums">
                {step.footStrikeFrame}–{step.toeOffFrame}
              </td>
              {METRIC_KEYS.map((key) => (
                <td key={key} className="px-3 py-2 text-right font-mono tabular-nums">
                  {step.metrics[key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
