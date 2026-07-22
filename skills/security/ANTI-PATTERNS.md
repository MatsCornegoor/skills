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

## Dependencies & Config

- **Known-vulnerable dependencies** — lockfile pinning a package version with a published CVE. Fix: `npm audit`/`pip-audit`/`bundler-audit`, upgrade the dependency.
- **Debug mode enabled in production** — framework debug/dev mode (`DEBUG=True`, Express `NODE_ENV` not set to `production`) left on, exposing internals or disabling protections.
- **Default or weak credentials** — default admin passwords, unauthenticated internal services (Redis, admin panels) reachable without a password.
- **Outdated TLS / weak crypto config** — TLS 1.0/1.1 allowed, weak ciphers enabled, or certificate validation disabled (`rejectUnauthorized: false`, `verify=False`).
