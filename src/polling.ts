// packages/sdk/src/polling.ts
// Shared polling generator behind createAndWait(), poll(), and waitForCompletion().

import { NoCensorJobFailedError, NoCensorTimeoutError } from './errors'

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

export interface PollableJob {
  id: string
  status: JobStatus
  error?: { message: string } | null
}

export interface PollOptions<J extends PollableJob = PollableJob> {
  /** Total polling deadline in ms. Default 300_000 (5 min). */
  timeout?: number
  signal?: AbortSignal
  onProgress?: (job: J) => void
  /** Minimum exp-backoff base interval. Default 2_000. */
  minIntervalMs?: number
  /** Cap on any single interval. Default 30_000. */
  maxIntervalMs?: number
}

export async function* pollJob<T extends PollableJob>(
  getJob: (id: string) => Promise<{ job: T; retryAfterMs: number | null }>,
  jobId: string,
  opts: PollOptions<T> = {},
): AsyncGenerator<T, T, void> {
  const timeout = opts.timeout ?? 300_000
  const deadline = Date.now() + timeout
  const minMs = opts.minIntervalMs ?? 2_000
  const maxMs = opts.maxIntervalMs ?? 30_000
  let attempt = 0

  while (true) {
    if (Date.now() > deadline) {
      throw new NoCensorTimeoutError(`poll deadline (${timeout}ms) exceeded for job ${jobId}`, {
        code: 'POLL_TIMEOUT',
        status: null,
      })
    }
    opts.signal?.throwIfAborted()

    const { job, retryAfterMs } = await getJob(jobId)

    if (opts.onProgress) {
      try {
        opts.onProgress(job)
      } catch {
        /* swallow */
      }
    }

    yield job

    if (job.status === 'completed') return job
    if (job.status === 'failed' || job.status === 'cancelled') {
      throw new NoCensorJobFailedError(`job ${job.status}: ${job.error?.message ?? 'no message'}`, {
        code: 'JOB_FAILED',
        status: null,
        jobId,
        job,
      })
    }

    const backoffMs = Math.min(maxMs, minMs * 2 ** attempt)
    const jitter = backoffMs * 0.2 * (Math.random() * 2 - 1)
    const waitMs = retryAfterMs ?? Math.max(0, Math.floor(backoffMs + jitter))
    const clamped = Math.min(waitMs, Math.max(0, deadline - Date.now()))
    await sleepAbortable(clamped, opts.signal)
    attempt++
  }
}

export function sleepAbortable(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (signal) signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('aborted', 'AbortError'))
    }
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer)
        reject(new DOMException('aborted', 'AbortError'))
        return
      }
      signal.addEventListener('abort', onAbort, { once: true })
    }
  })
}
