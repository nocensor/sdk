// packages/sdk/src/pagination.ts
// Async iterator helpers for cursor-based and page-based list endpoints.

export async function* cursorPaginate<T>(
  fetchPage: (cursor: string | null) => Promise<{ items: T[]; nextCursor: string | null }>,
): AsyncGenerator<T> {
  let cursor: string | null = null
  while (true) {
    const { items, nextCursor } = await fetchPage(cursor)
    for (const item of items) yield item
    if (nextCursor === null) return
    cursor = nextCursor
  }
}

export async function* pagePaginate<T>(
  fetchPage: (page: number) => Promise<{ items: T[]; hasMore: boolean }>,
): AsyncGenerator<T> {
  let page = 1
  while (true) {
    const { items, hasMore } = await fetchPage(page)
    for (const item of items) yield item
    // Stop if no more pages, or if server returned empty items (guards against
    // a server bug where hasMore=true never clears, causing an infinite loop).
    if (!hasMore || items.length === 0) return
    page++
  }
}
