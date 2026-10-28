import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { RunSchema, RunSummarySchema } from '../types/run'

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${url}`)
  return res.json()
}

export async function fetchRuns() {
  return z.array(RunSummarySchema).parse(await getJson('/api/runs'))
}

export async function fetchRun(runId: string) {
  return RunSchema.parse(await getJson(`/api/runs/${encodeURIComponent(runId)}`))
}

export function useRuns() {
  return useQuery({ queryKey: ['runs'], queryFn: fetchRuns })
}

export function useRun(runId: string) {
  return useQuery({ queryKey: ['runs', runId], queryFn: () => fetchRun(runId) })
}
