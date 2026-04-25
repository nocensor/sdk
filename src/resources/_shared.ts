// packages/sdk/src/resources/_shared.ts
// Shared wire types and mapper used by all content resource files.

import type { Job } from './jobs'

export interface ContentJobWire {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  created_at: string
  credits_charged: number
  outputs: Array<{ url: string; media_type: 'image' | 'video'; size_bytes: number }> | null
  error: { message: string } | null
  progress_percent?: number | null
}

export function fromWireJobShared(w: ContentJobWire): Job {
  return {
    id: w.id,
    status: w.status,
    createdAt: new Date(w.created_at),
    creditsCharged: w.credits_charged,
    outputs: w.outputs
      ? w.outputs.map((o) => ({ url: o.url, mediaType: o.media_type, sizeBytes: o.size_bytes }))
      : null,
    error: w.error,
    progressPercent: w.progress_percent ?? null,
  }
}
