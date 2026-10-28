import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createMockRun } from '../mocks/fixtures/run'
import { RunSchema } from './run'

/**
 * contract/run.example.json is the shared example run that the backend's
 * Pydantic models are tested against. It must stay identical to the mock.
 * Regenerate after a contract change with: UPDATE_CONTRACT=1 npm test
 */
// Vitest runs from frontend/ (import.meta.url is not a file URL under jsdom).
const examplePath = resolve(process.cwd(), '../contract/run.example.json')

describe('shared contract example', () => {
  const run = createMockRun()

  if (process.env.UPDATE_CONTRACT === '1') {
    writeFileSync(examplePath, JSON.stringify(run) + '\n')
  }

  it('matches the mock run', () => {
    const example: unknown = JSON.parse(readFileSync(examplePath, 'utf8'))
    expect(example).toEqual(run)
  })

  it('parses with RunSchema', () => {
    const example: unknown = JSON.parse(readFileSync(examplePath, 'utf8'))
    expect(RunSchema.safeParse(example).success).toBe(true)
  })
})
