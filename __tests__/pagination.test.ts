// packages/sdk/__tests__/pagination.test.ts
import { describe, it, expect, vi } from 'vitest'
import { cursorPaginate, pagePaginate } from '../src/pagination'

describe('cursorPaginate', () => {
  it('walks all pages until next_cursor is null', async () => {
    const fetch = vi
      .fn<(cursor: string | null) => Promise<{ items: number[]; nextCursor: string | null }>>()
      .mockResolvedValueOnce({ items: [1, 2], nextCursor: 'c1' })
      .mockResolvedValueOnce({ items: [3, 4], nextCursor: 'c2' })
      .mockResolvedValueOnce({ items: [5], nextCursor: null })

    const out: number[] = []
    for await (const item of cursorPaginate(fetch)) out.push(item)

    expect(out).toEqual([1, 2, 3, 4, 5])
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(fetch.mock.calls[0]?.[0] as string | null).toBeNull()
    expect(fetch.mock.calls[1]?.[0] as string | null).toBe('c1')
    expect(fetch.mock.calls[2]?.[0] as string | null).toBe('c2')
  })

  it('handles empty first page', async () => {
    const fetch = vi.fn().mockResolvedValue({ items: [], nextCursor: null })
    const out: unknown[] = []
    for await (const item of cursorPaginate(fetch)) out.push(item)
    expect(out).toEqual([])
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('propagates errors mid-iteration', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ items: [1, 2], nextCursor: 'c1' })
      .mockRejectedValueOnce(new Error('network blip'))

    const iter = cursorPaginate<number>(fetch)
    const out: number[] = []
    await expect(async () => {
      for await (const item of iter) out.push(item)
    }).rejects.toThrow('network blip')
    expect(out).toEqual([1, 2])
  })

  it('allows break to terminate iteration cleanly', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ items: [1, 2], nextCursor: 'c1' })
      .mockResolvedValueOnce({ items: [3, 4], nextCursor: 'c2' })

    const out: number[] = []
    for await (const item of cursorPaginate<number>(fetch)) {
      out.push(item)
      if (item === 2) break
    }
    expect(out).toEqual([1, 2])
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

describe('pagePaginate', () => {
  it('increments page until hasMore is false', async () => {
    const fetch = vi
      .fn<(page: number) => Promise<{ items: string[]; hasMore: boolean }>>()
      .mockResolvedValueOnce({ items: ['a', 'b'], hasMore: true })
      .mockResolvedValueOnce({ items: ['c'], hasMore: false })

    const out: string[] = []
    for await (const item of pagePaginate(fetch)) out.push(item)

    expect(out).toEqual(['a', 'b', 'c'])
    expect(fetch).toHaveBeenNthCalledWith(1, 1)
    expect(fetch).toHaveBeenNthCalledWith(2, 2)
  })

  it('stops on empty final page', async () => {
    const fetch = vi.fn().mockResolvedValue({ items: [], hasMore: false })
    const out: unknown[] = []
    for await (const item of pagePaginate(fetch)) out.push(item)
    expect(out).toEqual([])
  })

  it('stops on empty items even if hasMore is true (server bug guard)', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ items: ['a'], hasMore: true })
      .mockResolvedValueOnce({ items: [], hasMore: true }) // server bug: hasMore but no items
    const out: string[] = []
    for await (const item of pagePaginate<string>(fetch)) out.push(item)
    expect(out).toEqual(['a'])
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
