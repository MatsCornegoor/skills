# Performance Anti-Patterns

## Database / ORM

- **N+1 queries** — a loop that issues a DB query per iteration. Look for ORM calls (`.find`, `.findOne`, `.where`) inside `for`/`forEach`/`.map` loops. Fix: eager-load with `include`/`join` or batch with `WHERE id IN (...)`.
- **Missing pagination** — queries with no `LIMIT`/`take`/`first` that could return unbounded rows. Look for `.findAll()`, `.find({})`, `.all()` with no limit.
- **Select \*** — fetching all columns when only a few are used. Look for queries without explicit field selection.
- **Missing indexes** — fields used in `WHERE`, `ORDER BY`, or `JOIN` conditions that are unlikely to be indexed. Look for filter/sort on non-primary-key fields and check if migrations define indexes for them.
- **Queries inside render/request loops** — DB calls inside route handlers that iterate over a result set. Same as N+1 but in HTTP handlers.

## JavaScript / TypeScript

- **Waterfall awaits** — sequential `await` calls that are independent and could run in parallel. Look for multiple `await foo(); await bar()` where the second doesn't depend on the first. Fix: `Promise.all([foo(), bar()])`.
- **Missing memoization** — expensive computations repeated on every render or call with the same inputs. Look for heavy operations in React render functions without `useMemo`/`useCallback`, or repeated pure computations without caching.
- **Whole-library imports** — `import _ from 'lodash'` or `import * as R from 'ramda'` when only one function is needed. Fix: named imports or direct path imports.
- **Array spread in tight loops** — `[...arr, item]` inside a loop creates a new array on every iteration. Fix: `push` + spread once at the end, or pre-allocate.
- **Blocking the event loop** — CPU-heavy synchronous operations in a Node.js request handler (large JSON.parse, crypto, zip, image resize). Look for sync FS calls (`readFileSync`, `writeFileSync`) in hot paths.
- **Event listener leaks** — `addEventListener` / `.on()` calls without corresponding cleanup in component unmount or teardown. Look for listeners added in `useEffect` without a return cleanup function.

## React

- **Missing keys on lists** — `array.map(item => <Component />)` without a stable `key`. Causes full re-renders on list changes.
- **Inline object/function props** — `<Component style={{ margin: 0 }} onClick={() => fn()}` creates a new reference every render, busting memoization. Extract to constants or `useMemo`/`useCallback`.
- **Context triggering full subtree re-renders** — a single large Context value where only part of it changes. Look for large objects in `value=` props of Providers.
- **Unoptimized images** — `<img src="...">` with no `width`/`height`, or large images without `loading="lazy"`.

## Python

- **List comprehension vs generator** — building a full list when only iterating once. `[x for x in ...]` → `(x for x in ...)`.
- **Repeated attribute lookup in loops** — `obj.method()` inside a loop where `method` is looked up each iteration. Extract to a local variable before the loop.
- **String concatenation in loops** — `s += chunk` in a loop. Fix: `''.join(chunks)`.
- **Blocking I/O in async context** — `open()`, `requests.get()` etc. called from an `async def` function without `asyncio.to_thread` or an async equivalent.

## Next.js

- **Sequential data fetching in Server Components** — independent `await fetch(...)` / `await getX()` calls made one after another in a Server Component, serializing requests that could run in parallel. Fix: `Promise.all([...])` or start the fetches before their `await`s.
- **Unintentional dynamic rendering** — `cache: 'no-store'`, `export const dynamic = 'force-dynamic'`, or reading `cookies()`/`headers()` in a route that doesn't need per-request data, forcing full SSR on every request instead of static/ISR. Fix: scope dynamic APIs to the smallest component, use `revalidate` for time-based freshness.
- **Missing `generateStaticParams`** — dynamic routes (`[slug]`) that are known ahead of time (CMS pages, product lists) rendered on-demand every time instead of pre-rendered at build.
- **Client component boundary too high** — `'use client'` placed on a large component tree when only a small interactive leaf needs it, shipping unnecessary JS to the browser and losing RSC benefits.
- **Heavy library imported in a Client Component** — a large dependency (charting, date, markdown libs) imported into a `'use client'` file when it could be used in a Server Component and passed down as data/markup.
- **Barrel file imports** — `import { Button } from '@/components'` from an index file that re-exports the whole directory, pulling in far more code than needed and inflating the client bundle.

## Sanity CMS

- **Unprojected GROQ queries** — `*[_type == "post"]` fetching entire documents when only a few fields are rendered. Fix: add a projection (`{ title, slug, "image": mainImage.asset->url }`) to fetch only what's used.
- **Unbounded dereferencing** — chained `->` dereferences without projections (`author->{...}` missing) pulling full referenced documents, compounding payload size. Fix: project referenced fields explicitly.
- **No pagination on list queries** — `*[_type == "post"]` with no slice, fetching every document when a list view only shows a page at a time. Fix: `[0...12]` range plus a count query.
- **`useCdn: false` on read-only fetches** — disabling the fast, cached Sanity CDN for content that doesn't need to bypass caching (only needed for previews/drafts or immediately-fresh mutations).
- **Not using tag-based revalidation** — fetching with `next: { revalidate: N }` (pure time-based ISR) instead of `next: { tags: [...] }` combined with a webhook calling `revalidateTag`, causing either stale content or unnecessarily frequent full rebuilds.

## Appwrite

- **N+1 document fetches** — `databases.getDocument()` called in a loop over a list of IDs instead of `databases.listDocuments()` with `Query.equal('$id', [...ids])`.
- **Missing attribute indexes** — queries using `Query.equal`/`Query.orderAsc`/`Query.orderDesc` on attributes with no corresponding index, causing full collection scans.
- **Over-fetching document attributes** — `listDocuments`/`getDocument` without `Query.select([...])` when only a few fields are needed, especially on documents with large attributes.
- **Unbounded `listDocuments` pagination** — repeatedly calling `listDocuments` with a growing offset instead of cursor-based pagination (`Query.cursorAfter`), which degrades on large collections.
- **Realtime subscriptions not cleaned up** — `client.subscribe(...)` in a component with no unsubscribe on unmount, accumulating open connections and callbacks over time.

## General

- **Polling instead of push** — `setInterval` checking for state changes that could be pushed via websocket, SSE, or webhook.
- **Uncompressed responses** — HTTP responses without gzip/brotli. Check for missing compression middleware.
- **No HTTP caching headers** — responses that could be cached (static assets, stable API responses) missing `Cache-Control` or `ETag`.
- **Redundant re-computation** — the same value computed multiple times in the same request/render with the same inputs. Look for identical function calls without caching.
