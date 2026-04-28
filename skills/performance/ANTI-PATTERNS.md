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

## General

- **Polling instead of push** — `setInterval` checking for state changes that could be pushed via websocket, SSE, or webhook.
- **Uncompressed responses** — HTTP responses without gzip/brotli. Check for missing compression middleware.
- **No HTTP caching headers** — responses that could be cached (static assets, stable API responses) missing `Cache-Control` or `ETag`.
- **Redundant re-computation** — the same value computed multiple times in the same request/render with the same inputs. Look for identical function calls without caching.
