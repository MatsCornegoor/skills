# Security Anti-Patterns

## Injection

- **SQL injection** — string-concatenated or template-interpolated SQL (`` `SELECT * FROM users WHERE id = ${id}` ``). Look for raw query builders fed with unsanitized input. Fix: parameterized queries / prepared statements, or the ORM's query builder.
- **Command injection** — user input passed to `exec`, `spawn`, `system`, `os.system`, `subprocess.run(shell=True)`. Fix: avoid shell invocation; pass args as an array, allowlist input.
- **NoSQL injection** — user-controlled objects passed directly into Mongo-style queries (`find(req.body)`), allowing operator injection (`$ne`, `$gt`). Fix: validate/whitelist keys, cast to expected types.
- **Template injection (SSTI)** — user input rendered into a template string that's then evaluated (Jinja2, Handlebars, EJS with `eval`-like helpers). Fix: never pass user input as the template itself, only as template data.
- **Path traversal** — user input concatenated into a filesystem path (`fs.readFile(base + req.query.file)`) without normalizing/validating against `..`. Fix: resolve and check the path stays within an allowed root.
- **LDAP / XML injection** — user input concatenated into LDAP filters or XML/XPath queries. Fix: escape per the target syntax or use parameterized APIs.

## Authentication & Session

- **Weak password hashing** — `md5`/`sha1`/`sha256` used directly on passwords instead of a slow adaptive hash. Fix: `bcrypt`, `scrypt`, or `argon2`.
- **Hardcoded credentials or secrets** — API keys, DB passwords, JWT secrets committed as string literals. Fix: environment variables or a secrets manager; rotate any exposed secret.
- **Missing rate limiting on auth endpoints** — login, password reset, OTP verification with no throttling, enabling brute force. Fix: rate limit by IP/account, add backoff/lockout.
- **Predictable session tokens** — session or reset tokens generated from `Math.random()`, timestamps, or incrementing IDs. Fix: cryptographically secure random generation (`crypto.randomBytes`).
- **Session fixation** — session ID not regenerated after login. Fix: issue a new session ID on privilege change (login, logout, role change).
- **Missing or weak JWT verification** — JWT decoded without signature verification, or `alg: none` accepted, or the algorithm not pinned (allowing `RS256`→`HS256` confusion). Fix: verify signature with a pinned algorithm and expected issuer/audience.

## Authorization

- **Missing object-level authorization (IDOR)** — endpoints that fetch/update a resource by ID without checking the caller owns or may access it (`/api/orders/:id` returns any order). Fix: scope the query to the authenticated user or check ownership explicitly.
- **Missing function-level authorization** — admin-only routes/actions reachable by any authenticated user because the check is only in the UI, not the handler. Fix: enforce role/permission checks server-side on every privileged route.
- **Mass assignment** — request body spread directly into a model update (`Model.update(req.body)`), letting a client set fields like `role` or `isAdmin`. Fix: whitelist updatable fields.
- **Client-trusted authorization data** — role, price, or permission flags read from a cookie, hidden form field, or JWT claim the server doesn't independently re-validate. Fix: recompute authorization server-side from a trusted source.

## Web / API

- **Reflected or stored XSS** — user input rendered into HTML/DOM without escaping (`dangerouslySetInnerHTML`, `innerHTML =`, unescaped template output, `v-html`). Fix: escape by default, sanitize any HTML that must be rendered raw (e.g. DOMPurify).
- **Missing CSRF protection** — state-changing endpoints (POST/PUT/DELETE) relying only on cookies for auth with no CSRF token or `SameSite` cookie policy. Fix: CSRF tokens or `SameSite=Strict/Lax` cookies plus origin checks.
- **Overly permissive CORS** — `Access-Control-Allow-Origin: *` (or reflecting the request origin) combined with `Access-Control-Allow-Credentials: true`. Fix: allowlist specific origins when credentials are involved.
- **SSRF** — server fetches a URL supplied by the user (webhooks, image-by-URL, PDF-from-URL features) without restricting scheme/host. Fix: allowlist destinations, block internal/link-local IP ranges, disable redirects to internal hosts.
- **Missing security headers** — no `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, or `X-Frame-Options`/`frame-ancestors`. Fix: set via middleware (e.g. `helmet`).
- **Insecure deserialization** — untrusted data passed to `pickle.loads`, `yaml.load` (unsafe loader), Java `ObjectInputStream`, PHP `unserialize`. Fix: use safe/restricted loaders (`yaml.safe_load`) or plain data formats (JSON).
- **Open redirect** — redirect target taken from a query param without validating it's a relative path or allowlisted host. Fix: validate against an allowlist or restrict to relative paths.

## Data Handling

- **Sensitive data logged** — passwords, tokens, full card numbers, or PII written to logs. Fix: redact/mask before logging.
- **Secrets in client-side code** — private API keys or signing secrets bundled into frontend JS. Fix: keep secret operations server-side, expose only public/publishable keys.
- **Plaintext sensitive storage** — PII, tokens, or payment details stored unencrypted at rest where encryption is warranted. Fix: encrypt sensitive fields, use provider tokenization for payment data.
- **Verbose error responses** — stack traces, SQL errors, or internal paths returned to the client in production. Fix: generic error messages externally, detailed logs internally.

## Next.js

- **Unvalidated Server Actions** — a `'use server'` action treated as a trusted internal call, missing input validation or a re-check of the caller's session/permissions. Server Actions are public HTTP endpoints regardless of where they're called from. Fix: validate input (e.g. zod) and re-verify authorization inside every Server Action.
- **Middleware matcher gaps** — `middleware.ts` intended to gate auth on protected routes, but its `matcher` config excludes a route that should be covered (e.g. a new `/admin/*` path added without updating the matcher). Fix: default to protecting everything and explicitly allowlist public routes, not the reverse.
- **Route Handler missing auth check** — an API route (`app/api/.../route.ts`) that mirrors a UI action but doesn't independently verify the session, reachable directly by anyone who knows the URL.
- **Over-returning data from Server Actions/Route Handlers** — returning a full DB/model object (including password hashes, internal flags, other users' data) when the client only needs a subset. Fix: map to an explicit response shape.
- **Secrets leaking via `NEXT_PUBLIC_`** — a private key, DB URL, or signing secret prefixed with `NEXT_PUBLIC_`, bundling it into client-side JS.

## Sanity CMS

- **Unauthenticated revalidation webhook** — `app/api/revalidate/route.ts` (or similar) callable by anyone with no verification of the `sanity-webhook-signature` header, letting an attacker trigger cache invalidation/rebuild storms.
- **Write-capable token exposed to the client** — a Sanity API token with `write`/`editor` permissions used in client-side code or a `NEXT_PUBLIC_` env var. Only the viewer/read token (if any) belongs client-side; write tokens must stay server-only.
- **GROQ built by string concatenation** — a GROQ query string built via template interpolation of user input (`` client.fetch(`*[_type == "post" && slug.current == "${input}"]`) ``) instead of parameters, risking query injection. Fix: use the parameters argument, `client.fetch(query, { slug: input })`.
- **Overly permissive dataset CORS** — the Sanity project's CORS origins configured with a wildcard or overly broad origin, allowing any site to read the dataset with the public API.

## Appwrite

- **Overly permissive collection/document roles** — collections or documents granting `Role.any()` write (or read, for sensitive data) instead of scoping to `Role.user(id)`/`Role.team(id)`, letting any authenticated (or anonymous) user read or modify other users' data.
- **API key used client-side** — an Appwrite API key (server secret with broad scopes) embedded in frontend code or a `NEXT_PUBLIC_` env var. Only the endpoint URL and project ID are meant to be public; the client SDK should authenticate via user sessions, not API keys.
- **Trusting client-supplied user/account IDs** — a server route that takes a `userId` from the request body and queries/mutates that user's data without checking it matches the authenticated session. Fix: derive the user ID from the verified session, never from client input.
- **Overly broad Function execution permissions** — an Appwrite Function configured with `execute: any` when it performs privileged operations, letting any user trigger it directly instead of only authorized roles or server-to-server calls.
- **Missing session verification before privileged Appwrite calls** — a Next.js server component/route handler using a server client (API key) to act on behalf of a user without first validating that user's session cookie/JWT.

## Dependencies & Config

- **Known-vulnerable dependencies** — lockfile pinning a package version with a published CVE. Fix: `npm audit`/`pip-audit`/`bundler-audit`, upgrade the dependency.
- **Debug mode enabled in production** — framework debug/dev mode (`DEBUG=True`, Express `NODE_ENV` not set to `production`) left on, exposing internals or disabling protections.
- **Default or weak credentials** — default admin passwords, unauthenticated internal services (Redis, admin panels) reachable without a password.
- **Outdated TLS / weak crypto config** — TLS 1.0/1.1 allowed, weak ciphers enabled, or certificate validation disabled (`rejectUnauthorized: false`, `verify=False`).
