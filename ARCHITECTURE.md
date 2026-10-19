# Architecture

One Next.js 16 (App Router) application contains the website, the form backend and the e-mail integration. There is no separate backend service and no database. Everything deploys to Vercel as one project and runs on any Node.js host.

```
Browser ──► Next.js (static pages, prerendered at build)
   │
   └─ form submit ─► POST /api/inquiry (Node.js route handler, region fra1)
                        │  origin / content-type / size checks
                        ▼
                     processInquiry()   src/lib/inquiry/process.ts
                        │  envelope → honeypot → fill-time → Zod validation
                        │  → rate limits (Upstash Redis | memory)
                        ▼
                     EmailTransport     src/lib/email/
                        │  Resend REST API  |  SMTP (e.g. Zoho)
                        ▼
                     Business inbox (Zoho Mail)  ── Reply-To ──► visitor
```

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16.4 App Router, React 19.3 | Server Components; static prerendering with Cache Components |
| Language | TypeScript, `strict` | — |
| Styling | Tailwind CSS v4 + CSS custom properties (`@theme` in `globals.css`) | Tokens defined once, used as utilities |
| Forms | React Hook Form + Zod 4 (`@hookform/resolvers`) | The same schema validates in the browser and on the server |
| Icons | lucide-react | UI utility icons only; the logo is custom |
| E-mail | Resend REST API via `fetch`, or SMTP via nodemailer (lazy-loaded) | No vendor SDK needed; transport is swappable |
| Rate limiting | Upstash Redis REST API via `fetch` | Works across serverless instances; no SDK |
| Tests | Vitest (unit), Playwright (e2e) | — |

Runtime dependencies are deliberately few: `next`, `react`, `react-dom`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react`, `nodemailer`, `server-only`.

## Folder structure

```
src/
  app/                    routes (one folder per URL), metadata files, API route
    api/inquiry/route.ts  form endpoint
    automaten/[slug]/     4 category pages (snack, drink, coffee, combo) from content/machines.ts
    sitemap.ts robots.ts manifest.ts opengraph-image.png icon.svg apple-icon.png favicon.ico
  components/
    brand/                Logo, BrandSymbol, generated logo-data.ts
    illustrations/        SVG machines, region map, wrap concept (server components)
    layout/               header (server) + client islands: nav-links, mobile-nav, scroll-state; footer
    sections/             page sections reused across pages
    forms/                InquiryForm engine + declarative form configs
    legal/                Pending markers, review notice, legal address block
    ui/                   Button, SlotLabel, Breadcrumbs, FaqList, PhotoFigure
  config/                 business.ts (legal/contact – single source), site.ts (nav, URL, sitemap)
  content/                typed copy: machines, faqs, home, media (optional photos)
  lib/
    inquiry/              schema.ts (Zod), options.ts, process.ts (pipeline)
    email/                transport.ts (interface, Resend, memory), smtp.ts, templates.ts
    security/             rate-limit.ts
    server/               config.ts (env parsing), inquiry-deps.ts (wiring) – server-only
    seo/                  metadata helper, JSON-LD builders
scripts/
  brand/                  logo geometry + asset/social generators (fonts with OFL licences)
  launch-check.ts         pre-launch data check
tests/
  unit/                   Vitest
  e2e/                    Playwright
```

## Frontend

- **Rendering.** `cacheComponents: true` + `partialPrefetching: true`. Category pages read `params` inside a `<Suspense>` boundary, and the line-up cards link with `prefetch`, so navigation to them is instant. All 14 pages are prerendered static HTML at build time. The only time-dependent value (the copyright year) is a `"use cache"` component with `cacheLife("days")`. `/api/inquiry` is the only dynamic route.
- **Client JavaScript** is limited to small islands:
  - `nav-links` (active state)
  - `scroll-state` (header border)
  - `mobile-nav` (native `<dialog>`: focus trap, Escape and inert background come from the browser)
  - `inquiry-form` (only on form pages)
- **Activity / state preservation.** With Cache Components, Next keeps up to three visited routes mounted but hidden. The mobile menu closes itself in a `useLayoutEffect` cleanup, so it never reappears open after *back*. Form drafts survive navigation on purpose.
- **Accordions** use native `<details>/<summary>`: accessible without JavaScript, and animated with CSS where `::details-content` is supported.
- **Motion** is CSS only: entry animations, scroll-driven reveals behind `@supports (animation-timeline: view())`, and everything disabled under `prefers-reduced-motion`. Content is fully visible without animation support.
- **Fonts** (Bricolage Grotesque, DM Sans, DM Mono) are self-hosted via `next/font`, with `latin-ext` for "ş". The browser never contacts Google.
- **Images.** Machines, region map and wrap concept are inline SVG components (no requests, crisp at any size). Optional photos are configured in `src/content/media.ts` and rendered with `next/image`.

## Form processing

Three forms (`anfrage`, `standort`, `kontakt`) share one engine:

1. `form-configs.ts` declares fields, groups and labels. `InquiryForm` renders them with labels, hints, `aria-invalid`/`aria-describedby`, inline errors and focus on the first error.
2. Client validation uses the same Zod schema as the server (`src/lib/inquiry/schema.ts`).
3. The client sends JSON to `/api/inquiry`:
   ```json
   { "form": "anfrage", "fields": { … }, "meta": { "submissionId": "<uuid>", "startedAt": 1760781600000, "website": "" } }
   ```
4. The response contract (`ApiResponse` in `schema.ts`):
   - `200 { ok: true, inquiryId: "SNK-261018-AB2CD" }`
   - `4xx/5xx { ok: false, error, message, fieldErrors? }`, where `error` is one of `bad_request`, `forbidden`, `too_large`, `too_fast`, `validation` (422), `rate_limited` (429, with `Retry-After`), `unavailable` (503, e-mail not configured), `delivery_failed` (502), `server_error`.
5. UI states: idle → submitting (button disabled, `aria-busy`, spinner) → success (confirmation with reference number, focus moved) or error (`role="alert"`, data kept, "Erneut senden").
   - **Duplicate protection:** the button is locked while pending, and the `submissionId` is reused as the provider's `Idempotency-Key`. After a network error (outcome unknown) the same ID is kept, so a retry cannot produce a second e-mail.
   - Success is shown **only** after the provider accepted the business notification. Without a configured provider the API answers 503. It never fakes success.

## Backend pipeline (`processInquiry`)

Framework-independent and dependency-injected (transport, limiter, logger, clock), so it is unit-tested without HTTP or real e-mail.

1. **Transport checks** (route handler): same-origin `Origin` header required (blocks cross-site posts), `application/json` only, body ≤ 16 KB.
2. **Envelope** schema check.
3. **Honeypot**: if the hidden `website` field is filled, the request is accepted with 200 and dropped silently.
4. **Fill time**: submissions faster than 2.5 s after render get 400 `too_fast`.
5. **Validation**: Zod, per form. Single-line fields reject CR/LF and control characters (header injection). No links in names, at most 3 links in messages, length limits on every field.
6. **Rate limits** with pseudonymised keys (salted SHA-256 of IP): 5 per IP per 10 min, 20 per IP per day, 300 globally per day. If the limiter is down, the request is allowed but the failure is logged.
7. **Delivery**: business notification to the form's inbox (`src/lib/inquiry/routing.ts`: Kontakt → kontakt@, Standort → standort@, Anfrage → kontakt@ or standort@ by type), `From` = configured sender, `Reply-To` = visitor, idempotency key.
8. **Optional acknowledgment** (`AUTO_REPLY_ENABLED`): at most 3 per recipient per day. It doesn't echo the free-text message (so it can't relay spam), and its failure never affects the result.

**Logging** is structured JSON with event names only (`inquiry.delivered`, `inquiry.email.failed`, …) plus form type and reference number. No names, addresses, IPs or message content. Provider error bodies are discarded.

## E-mail

- `EmailTransport` interface with `createResendTransport` (REST, 10 s timeout, idempotency), `createSmtpTransport` (nodemailer, lazy import; Zoho: `smtppro.zoho.eu:465`) and `createMemoryTransport` (tests).
- Provider selection in `src/lib/server/config.ts`: `RESEND_API_KEY` wins; otherwise `SMTP_*`; otherwise e-mail is disabled (503).
- Templates (`templates.ts`): table-based HTML with inline styles plus a plain-text part. Every value is escaped, subjects are header-safe, and there are no remote images or tracking. Timestamps use Europe/Berlin.
- To change providers, add one transport file and one branch in `inquiry-deps.ts`.

## Data storage decision

**No database in v1.** Every inquiry is delivered to the business mailbox, which is the system of record. This avoids storing personal data in another system and needs no migrations, backups or access control.

Trade-off: if the provider rejects a message, the user sees an error and can retry or use e-mail. Nothing is lost silently.

If durable storage becomes necessary (dashboard, CRM, reporting): add a hosted Postgres (Neon or Supabase, EU region), persist the record in `processInquiry` *before* sending, and add a `deliveryStatus` column with a retry job. Also update the privacy policy (storage, retention) and protect the dashboard with authentication.

## Security

- No secrets in client code. Server modules import `server-only`, and only `NEXT_PUBLIC_SITE_URL` is public.
- Headers (`next.config.ts`):
  - `Content-Security-Policy`, production only: `default-src 'self'`, no third-party origins, `frame-ancestors 'none'`. `script-src` needs `'unsafe-inline'` for Next.js streaming without nonces.
  - `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`.
  - `X-Powered-By` removed.
- `/api/*` is `noindex` and disallowed in robots.txt.
- JSON-LD is serialised with `<` escaped.

## SEO

- Per-page `title`, `description`, canonical, Open Graph and Twitter metadata (`src/lib/seo/metadata.ts`). The shared 1200×630 social image is referenced explicitly, because a page's own `openGraph` replaces the parent's.
- Structured data:
  - `Organization` (no fabricated address or opening hours; `areaServed` = focus towns) and `WebSite` on every page
  - `BreadcrumbList` on inner pages
  - `Service` on category pages
  - `FAQPage` on `/faq` (content visible on the page)
- `sitemap.xml` from `indexableRoutes`, `robots.txt`, `manifest.webmanifest`. www → apex redirect.

## Testing

- **Unit (Vitest, 44 tests):** schemas, escaping/templates, the full pipeline (success, validation, honeypot, timing, rate limits, 503/502, acknowledgment, no PII in logs), Resend/Upstash clients with mocked `fetch`, env parsing, route-handler guards.
- **E2E (Playwright, desktop + Pixel 7):** every route (status, one `h1`, `lang`, legal links, no horizontal overflow, no page errors), all internal links, the 404 page, desktop navigation and skip link, mobile dialog menu (Escape, navigation, back), FAQ keyboard use, SEO tags/sitemap/robots, security headers, and form validation, prefill, success, delivery failure + retry, network error, the honest 503 and cross-origin rejection.

## Extending

| Goal | Where |
| --- | --- |
| New machine category | `src/content/machines.ts` + `indexableRoutes` |
| New page | `src/app/<route>/page.tsx` using `PageHero`, sections, `pageMetadata`; add to sitemap & nav |
| Real photos | `src/content/media.ts` (files in `public/images/`) |
| Locations page / case studies | new typed content file + route; only with real, verified data |
| Blog | MDX route group or a headless CMS; keep `pageMetadata` |
| Protected inquiry dashboard | add database (see above) + auth |
| CRM | call the CRM API inside `processInquiry` after successful delivery |
| English version | move copy from `src/content` into per-locale files and add a `[locale]` segment or `/en` routes |
