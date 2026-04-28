# Best Practices Checklist

## SEO

- **Sitemap** — `sitemap.xml` generated and accessible. In Next.js: `app/sitemap.ts` or a static file in `/public`.
- **Robots.txt** — `robots.txt` present in `/public` or generated via `app/robots.ts`.
- **Favicon** — favicon present (`/public/favicon.ico` or `<link rel="icon">`). Check for apple-touch-icon too.
- **Page titles** — every page sets a unique `<title>`. In Next.js: `metadata.title` in each `page.tsx`, not just the root layout.
- **Meta descriptions** — every page sets a `<meta name="description">`. Descriptions should be dynamic (loaded from CMS), not hardcoded.
- **Open Graph tags** — `og:title`, `og:description`, `og:image`, `og:url` present on all public pages.
- **Twitter card tags** — `twitter:card`, `twitter:title`, `twitter:image` present.
- **Canonical URLs** — `<link rel="canonical">` set, especially on pages that can be reached via multiple URLs.
- **Image alt text** — all `<img>` and `next/image` components have meaningful `alt` attributes. Empty `alt=""` is valid for decorative images.
- **Heading hierarchy** — pages use a single `<h1>`, followed by `<h2>`, `<h3>` in order. No skipped levels.

## Images

- **next/image usage** — raw `<img>` tags avoided in favour of `next/image` for automatic optimisation.
- **Explicit dimensions** — all images have `width` and `height` props (or `fill` with a sized container) to prevent layout shift (CLS).
- **Lazy loading** — images below the fold use `loading="lazy"` or are not marked `priority`.
- **Hero/LCP image priority** — the largest above-the-fold image uses `priority` to load eagerly.
- **Image format** — Sanity CDN or next/image serving WebP/AVIF rather than raw PNG/JPG.

## Sanity CMS

- **On-demand revalidation via webhook** — a Sanity webhook calls a revalidation endpoint on publish, rather than relying solely on time-based ISR. Look for a route handler at `app/api/revalidate/route.ts` or similar that calls `revalidatePath`/`revalidateTag`.
- **Webhook secret validation** — the revalidation endpoint validates the `sanity-webhook-signature` header. A public endpoint with no auth is a cache-busting vulnerability.
- **Typed queries** — Sanity queries use generated TypeScript types (GROQ-codegen, `defineQuery`, or Sanity TypeGen). Raw untyped `client.fetch<any>()` is a risk.
- **Image via Sanity CDN** — Sanity image assets use `@sanity/image-url` or the image pipeline, not raw `asset.url` which bypasses CDN and transformations.
- **Draft / preview mode** — a preview route exists for editors to see unpublished content. Look for `draftMode()` usage or a `/api/draft` route.
- **Metadata from CMS** — page titles and descriptions come from Sanity documents, not hardcoded strings. Check that `metadata.title` and `metadata.description` are derived from fetched data.

## Next.js

- **Not-found page** — `app/not-found.tsx` exists for custom 404 handling.
- **Error boundary** — `app/error.tsx` (and `app/global-error.tsx`) exists for runtime error handling.
- **Loading states** — `app/loading.tsx` or Suspense boundaries are used for async routes to prevent blank screens.
- **Environment variable hygiene** — secrets are not prefixed with `NEXT_PUBLIC_`. Audit all `NEXT_PUBLIC_` variables and confirm none are sensitive.
- **Font optimisation** — fonts loaded via `next/font` rather than `@import` or a `<link>` tag in the layout, to avoid render-blocking.

## Security

- **Security headers** — `next.config.ts` sets HTTP security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. Optionally a Content Security Policy.
- **No secrets in client bundle** — `NEXT_PUBLIC_` env vars contain only non-sensitive values (public API keys are acceptable; private keys are not).

## Accessibility

- **Form labels** — all `<input>`, `<select>`, `<textarea>` elements have an associated `<label>` or `aria-label`.
- **Focus visible** — interactive elements have a visible focus ring. Check that `outline: none` / `outline: 0` isn't applied globally without a replacement.
- **Landmark regions** — page uses `<main>`, `<nav>`, `<header>`, `<footer>` so screen readers can navigate by landmark.
