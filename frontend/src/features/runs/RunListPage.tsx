import { Link } from 'react-router'
import { useRuns } from '../../api/runs'

export function RunListPage() {
  const { data: runs, isPending, error } = useRuns()

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Sprint Form Analyzer</h1>
      <h2 className="mb-3 text-sm font-medium tracking-wide text-slate-400 uppercase">Runs</h2>
      {isPending && <p className="text-slate-400">Loading…</p>}
      {error && <p className="text-red-400">Could not load runs: {error.message}</p>}
      {runs && runs.length === 0 && <p className="text-slate-400">No runs yet.</p>}
      <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800">
        {runs?.map((run) => (
          <li key={run.id}>
            <Link
              to={`/runs/${encodeURIComponent(run.id)}`}
              className="flex justify-between px-4 py-3 hover:bg-slate-900"
            >
              <span>{run.athlete}</span>
              <span className="text-slate-400">
                {run.date} · {run.startPosition.replace('_', ' ')} start
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
