# Best Practices Review: <project or scope>

**Date**: YYYY-MM-DD
**Stack**: <framework, CMS, deployment>
**Scope**: <directories or modules reviewed>

---

## Summary

| Category | Present | Partial | Missing |
|----------|---------|---------|---------|
| SEO | X | X | X |
| Images | X | X | X |
| Sanity CMS | X | X | X |
| Next.js | X | X | X |
| Security | X | X | X |
| Accessibility | X | X | X |

---

## SEO

| Item | Status | Notes |
|------|--------|-------|
| Sitemap | ✅ Present | `app/sitemap.ts` |
| Robots.txt | ✅ Present | `/public/robots.txt` |
| Favicon | ⚠️ Partial | Missing apple-touch-icon |
| Page titles | ❌ Missing | Layout sets a static title; no per-page override |
| Meta descriptions | ❌ Missing | Not set anywhere |
| Open Graph tags | ⚠️ Partial | `og:title` present, `og:image` missing |
| Twitter card | ❌ Missing | |
| Canonical URLs | ❌ Missing | |
| Image alt text | ⚠️ Partial | Some images missing alt |
| Heading hierarchy | ✅ Present | |

**Action items:**

1. **Meta descriptions from Sanity** — add a `seo.description` field to your Sanity page schema and wire it into `generateMetadata`:
   ```ts
   export async function generateMetadata({ params }) {
     const page = await getPage(params.slug)
     return { description: page.seo?.description }
   }
   ```

2. **Open Graph image** — add `og:image` pointing to a Sanity-hosted image or a static fallback.

---

## Images

| Item | Status | Notes |
|------|--------|-------|
| next/image usage | | |
| Explicit dimensions | | |
| Lazy loading | | |
| Hero image priority | | |
| Image format | | |

**Action items:** ...

---

## Sanity CMS

| Item | Status | Notes |
|------|--------|-------|
| On-demand revalidation webhook | | |
| Webhook secret validation | | |
| Typed queries | | |
| Image via Sanity CDN | | |
| Draft / preview mode | | |
| Metadata from CMS | | |

**Action items:** ...

---

## Next.js

| Item | Status | Notes |
|------|--------|-------|
| Not-found page | | |
| Error boundary | | |
| Loading states | | |
| Environment variable hygiene | | |
| Font optimisation | | |

**Action items:** ...

---

## Security

| Item | Status | Notes |
|------|--------|-------|
| Security headers | | |
| No secrets in client bundle | | |

**Action items:** ...

---

## Accessibility

| Item | Status | Notes |
|------|--------|-------|
| Form labels | | |
| Focus visible | | |
| Landmark regions | | |

**Action items:** ...

---

## Out of scope

<Anything noticed but not reviewed>
