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

## Animation

- **Animating layout properties** — animating `top`/`left`/`width`/`height`/`margin`/`padding` (CSS transitions, keyframes, or JS) triggers layout every frame. Fix: animate `transform` and `opacity` only.
- **Animating expensive paint properties** — animating `box-shadow`, `filter: blur()`, `backdrop-filter`, `clip-path` or large gradients over big areas repaints every frame. Fix: animate the `opacity` of a pre-rendered layer (e.g. a pseudo-element holding the shadow), or shrink the area.
- **Layout thrashing** — reading layout (`offsetHeight`, `getBoundingClientRect()`, `getComputedStyle`, `scrollTop`) after writing styles, inside a loop or animation frame. Each read forces a synchronous layout. Fix: read everything first, then write; cache measurements.
- **Timers instead of rAF** — JS animations driven by `setInterval`/`setTimeout`, which drift from the display refresh and keep running in hidden tabs. Fix: `requestAnimationFrame`, or CSS / Web Animations API.
- **React state per frame** — `setState` (or a store update) inside `requestAnimationFrame`, a scroll handler or a pointermove handler, re-rendering a component tree every frame. Fix: write to a ref or `element.style` directly, or use motion values (Framer Motion `useMotionValue`, GSAP `quickSetter`).
- **Animations running while invisible** — infinite CSS animations, rAF loops, Lottie players or videos that keep running offscreen or under a closed menu. Fix: pause with `IntersectionObserver` and `animation-play-state` / `.pause()`.
- **`will-change` everywhere** — `will-change` (or `transform: translateZ(0)`) on many or permanent elements creates a GPU layer each, eating memory and slowing compositing. Fix: apply it only to elements that are about to animate, and remove it afterwards.
- **Heavy Lottie / SVG animation** — Lottie files with thousands of shapes, animated SVG filters, or animated path `d` morphing on large SVGs. Fix: simplify the file, use the Lottie `canvas` renderer, or swap for a video.
- **Animation instances not cleaned up** — GSAP timelines/ScrollTriggers, Framer Motion listeners or Lottie instances created in a component without `kill()`/`destroy()` on unmount, piling up on client-side navigation. Fix: `gsap.context()` + `revert()`, or cleanup in the effect's return.

## Scroll & input

- **Non-passive scroll listeners** — `wheel`/`touchstart`/`touchmove` listeners without `{ passive: true }` block scrolling until the handler finishes.
- **Work inside scroll handlers** — layout reads, DOM writes or state updates directly in a `scroll` handler, running more often than frames render. Fix: `IntersectionObserver` for visibility checks, CSS scroll-driven animations (`animation-timeline: scroll()`), or batch into one rAF per frame.
- **Multiple scroll/animation loops** — a smooth-scroll library (Lenis, Locomotive), GSAP's ticker and separate rAF loops all running independently. Fix: drive everything from one loop (e.g. `gsap.ticker.add(lenis.raf)`).
- **`background-attachment: fixed`** — forces a repaint of the whole background on every scroll frame. Fix: a `position: fixed` element with the background instead.
- **Long lists rendered in full** — hundreds of complex rows or cards in the DOM at once. Fix: virtualization, or `content-visibility: auto` with `contain-intrinsic-size`.

## Canvas & WebGL

- **Redrawing when nothing changed** — a render loop that draws every frame even when the scene is static. Fix: render on demand (React Three Fiber `frameloop="demand"` + `invalidate()`), or stop the loop when idle.
- **Render loop running offscreen** — the canvas keeps rendering after it has scrolled out of view. Fix: pause with `IntersectionObserver`.
- **Uncapped devicePixelRatio** — canvas backing size set to CSS size × `devicePixelRatio`, which is 3 on many phones (9× the pixels of 1×). Fix: cap it at 2, or lower for fullscreen effects (R3F `dpr={[1, 2]}`).
- **Allocating in the render loop** — `new Vector3()`, arrays, objects or closures created every frame cause GC pauses that show up as periodic stutters. Fix: allocate once outside the loop and reuse.
- **GPU read-backs** — `getImageData`, `readPixels` or `toDataURL` every frame stall the pipeline while the CPU waits for the GPU. Fix: do it rarely, or keep the work on the GPU.
- **Per-item 2D state changes** — setting `ctx.font`, `fillStyle` or `shadowBlur` for each item drawn. `shadowBlur` is especially slow. Fix: group draws by style, pre-render static sprites to an offscreen canvas.
- **Too many draw calls** — many separate meshes/materials for repeated objects. Fix: `InstancedMesh`, merged geometries, shared materials, texture atlases. Check `renderer.info.render.calls`.
- **Oversized or uncompressed textures** — 4K textures for things shown at 300px, or PNG/JPG textures decoded on the main thread. Fix: size textures to their display size, use KTX2/Basis compressed textures.
- **Full-resolution post-processing** — bloom, blur or DOF passes at full resolution together with `antialias: true` and high DPR. Fix: run effects at half resolution, use FXAA/SMAA instead of MSAA.
- **Expensive fullscreen shaders** — complex fragment shaders (many loop iterations, noise layers, texture lookups) running for every pixel of a fullscreen quad. Fix: render to a smaller target and upscale, or simplify.
- **Resources not disposed** — geometries, materials, textures and render targets not `.dispose()`d on unmount, leaking GPU memory across route changes.
- **Heavy simulation on the main thread** — physics, particles or pathfinding computed on the main thread alongside rendering. Fix: move it to a Web Worker, or render with `OffscreenCanvas` in a worker.
- **`preserveDrawingBuffer: true`** without needing screenshots, which stops the browser from swapping buffers efficiently.

## General

- **Polling instead of push** — `setInterval` checking for state changes that could be pushed via websocket, SSE, or webhook.
- **Uncompressed responses** — HTTP responses without gzip/brotli. Check for missing compression middleware.
- **No HTTP caching headers** — responses that could be cached (static assets, stable API responses) missing `Cache-Control` or `ETag`.
- **Redundant re-computation** — the same value computed multiple times in the same request/render with the same inputs. Look for identical function calls without caching.
