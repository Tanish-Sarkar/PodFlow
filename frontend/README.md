# PodFlow frontend

Next.js, React, TypeScript, and Tailwind application shell managed with Bun.

```powershell
Copy-Item .env.example .env.local
bun install --frozen-lockfile
bun run dev
```

Run `bun run lint`, `bun run typecheck`, and `bun run build` before review.

Only `NEXT_PUBLIC_*` values are available to browser code. Do not put Supabase
service-role keys, database URLs, JWT-signing secrets, OAuth client secrets, or
model-provider keys in `.env.local`.

## Public marketing page

`/` is the public marketing page (spec: `docs/14_Marketing_Landing_Page_UI_UX_Spec.md`).
Its product visuals are static, illustrative previews; there is no backend dependency.

### Production configuration

**Production deployments must set `NEXT_PUBLIC_SITE_URL`** to the canonical origin
(origin only, for example `https://example.com`). It drives the canonical URL, the
`sitemap.xml` entry, `robots.txt`'s sitemap line, JSON-LD `url`, and absolute
`og:image`/`twitter:image` URLs. If it is unset, a production build prints a warning,
emits no canonical URL or sitemap entry, and Next.js falls back to `localhost` for
the share-image URL, which is wrong for a public site.

Only production deployments are indexable: Vercel previews (`VERCEL_ENV` other than
`production`) and non-production builds send `noindex` and disallow crawling.

Optional: `NEXT_PUBLIC_VITALS_ENDPOINT` makes the page send Core Web Vitals to that URL
via `sendBeacon` (its origin is added to the CSP `connect-src`). Unset, nothing is sent;
in development the metrics are logged to the console.

### Security headers

`next.config.ts` sets a Content-Security-Policy (no nonces; the page is statically
prerendered), `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options` and
`Permissions-Policy` in production builds. Extend `connect-src` deliberately when the
authenticated app starts calling the API or Supabase.

### Checks

```powershell
bun run lint
bun run typecheck
bun run build
bunx playwright install chromium   # once
bun run test:e2e                   # runs against `next start`; build first
```

`test:e2e` covers horizontal overflow at 375/768/1280px, axe WCAG A/AA, the skip link,
mobile menu / tabs / citation-marker keyboard operation, touch behaviour,
`prefers-reduced-motion`, no-JavaScript visibility, metadata/JSON-LD and security
headers. If Playwright's Chromium is not installed, use an installed browser:
`$env:PW_CHANNEL="msedge"; bun run test:e2e`.
