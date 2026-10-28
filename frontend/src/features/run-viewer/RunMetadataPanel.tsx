import type { RunMetadata } from '../../types/run'

const pretty = (value: string) => value.replace(/_/g, ' ')

export function RunMetadataPanel({ metadata }: { metadata: RunMetadata }) {
  const rows: [string, string][] = [
    ['Athlete', metadata.athlete],
    ['Date', metadata.date],
    ['Start', pretty(metadata.startPosition)],
    ['Camera', pretty(metadata.cameraPosition)],
    ['FPS', String(metadata.fps)],
    ['Surface', metadata.surface],
  ]
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3 lg:grid-cols-6">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-slate-500">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
