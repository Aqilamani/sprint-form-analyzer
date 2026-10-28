import { http, HttpResponse } from 'msw'
import { RunSchema, RunSummarySchema } from '../types/run'
import { createMockRun } from './fixtures/run'

// Parse fixtures through the contract so a broken mock fails loudly.
const runs = [RunSchema.parse(createMockRun())]

export const handlers = [
  http.get('/api/runs', () =>
    HttpResponse.json(runs.map((run) => RunSummarySchema.parse(run.metadata))),
  ),

  http.get('/api/runs/:runId', ({ params }) => {
    const run = runs.find((r) => r.metadata.id === params.runId)
    if (!run) return HttpResponse.json({ detail: 'Run not found' }, { status: 404 })
    return HttpResponse.json(run)
  }),
]
