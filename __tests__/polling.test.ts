// packages/sdk/__tests__/polling.test.ts
import { describe, it, expect, vi } from 'vitest'
import { pollJob, type PollOptions, type PollableJob } from '../src/polling'
import { NoCensorJobFailedError, NoCensorTimeoutError } from '../src/errors'

function mockGetJob(states: PollableJob[]) {
  let i = 0
  return vi.fn(async () => {
    const job = states[Math.min(i++, states.length - 1)]!
    return { job, retryAfterMs: 1 }
  })
}

describe('pollJob', () => {
  it('yields every state and returns on completed', async () => {
    const get = mockGetJob([
      { id: 'j1', status: 'pending' },
      { id: 'j1', status: 'processing' },
      { id: 'j1', status: 'completed' },
    ])
    const out: PollableJob[] = []
    for await (const j of pollJob(get, 'j1', { minIntervalMs: 1, maxIntervalMs: 5 })) {
      out.push(j)
    }
    expect(out.map((j) => j.status)).toEqual(['pending', 'processing', 'completed'])
    expect(get).toHaveBeenCalledTimes(3)
  })

  it('throws NoCensorJobFailedError on failed', async () => {
    const get = mockGetJob([
      { id: 'j1', status: 'pending' },
      { id: 'j1', status: 'failed', error: { message: 'oops' } },
    ])
    try {
      for await (const _ of pollJob(get, 'j1', { minIntervalMs: 1, maxIntervalMs: 5 })) {
        /* drain */
      }
      throw new Error('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(NoCensorJobFailedError)
      expect((e as NoCensorJobFailedError).jobId).toBe('j1')
    }
  })

  it('throws NoCensorJobFailedError on cancelled', async () => {
    const get = mockGetJob([{ id: 'j1', status: 'cancelled' }])
    await expect(async () => {
      for await (const _ of pollJob(get, 'j1', { minIntervalMs: 1 })) {
        /* drain */
      }
    }).rejects.toBeInstanceOf(NoCensorJobFailedError)
  })

  it('throws NoCensorTimeoutError when deadline exceeded', async () => {
    const get = vi.fn(async () => ({
      job: { id: 'j1', status: 'pending' as const },
      retryAfterMs: 50,
    }))
    try {
      for await (const _ of pollJob(get, 'j1', { timeout: 30, minIntervalMs: 5, maxIntervalMs: 20 })) {
        /* drain */
      }
      throw new Error('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(NoCensorTimeoutError)
      expect((e as Error).message).toContain('j1')
    }
  })

  it('propagates AbortSignal as AbortError', async () => {
    const ac = new AbortController()
    const get = vi.fn(async () => {
      ac.abort()
      return { job: { id: 'j1', status: 'pending' as const }, retryAfterMs: 10 }
    })
    try {
      for await (const _ of pollJob(get, 'j1', { signal: ac.signal, minIntervalMs: 5 })) {
        /* drain */
      }
      throw new Error('should have thrown')
    } catch (e) {
      expect((e as Error).name).toBe('AbortError')
    }
  })

  it('fires onProgress per tick and swallows its errors', async () => {
    const calls: unknown[] = []
    const onProgress = vi.fn((j: PollableJob) => {
      calls.push(j)
      throw new Error('instrumentation broken')
    })
    const get = mockGetJob([
      { id: 'j1', status: 'pending' },
      { id: 'j1', status: 'completed' },
    ])
    for await (const _ of pollJob(get, 'j1', { onProgress, minIntervalMs: 1 })) {
      /* drain */
    }
    expect(calls).toHaveLength(2)
    expect(onProgress).toHaveBeenCalledTimes(2)
  })
})
