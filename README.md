# Snackora – snackora.de

Website for **Snackora** (Inhaber: Mehtap Durmus), a vending business in the Stuttgart region. Slogan: **„Deine Pause. Jederzeit."**

It is a single Next.js application covering the brand website, the lead forms, the server-side inquiry handling and e-mail delivery. It deploys to Vercel as one project.

| Document | Contents |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How the frontend, form processing, e-mail and security work |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Vercel, GoDaddy DNS, Resend, Upstash, rollback, AWS notes |
| [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) | Everything that must be done before going live |
| [BRAND_GUIDELINES.md](BRAND_GUIDELINES.md) | Logo system, colours, typography, components, art direction |

---

## Requirements

- Node.js **22.18 or newer** (see `.nvmrc`). Next.js 16 needs ≥ 20.9, and the launch-check script runs TypeScript natively, which needs ≥ 22.18.
- npm 10+

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in what you have
npm run dev                    # http://localhost:3000
```

The forms work locally only once a Resend API key is set (see [E-mail](#e-mail)). Without one, they correctly answer *„Das Formular ist vorübergehend nicht verfügbar"* and keep the entered data. They never report a fake success.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve the build |
| `npm run typecheck` | `tsc --noEmit` (strict mode) |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm test` | Vitest unit tests (validation, templates, pipeline, rate limiting, route handler) |
| `npm run test:e2e` | Playwright end-to-end tests against a production build on port 3210 (desktop + mobile) |
| `npm run check` | typecheck + lint + unit tests |
| `npm run check:launch` | Lists missing legal/business data; exits with code 1 until everything is complete |
| `npm run env:push` | Pushes `.env.vercel.local` (git-ignored) to Vercel; `-- --preview`, `-- --redeploy`, `-- --dry-run` |
| `npm run brand:assets` | Regenerates every logo file, favicon and icon from the geometry source |
| `npm run brand:social` | Regenerates the social sharing image and machine-wrap exports (needs `npm run dev` running) |

First-time e2e setup: `npx playwright install chromium`.

## Environment variables

All variables are documented in [.env.example](.env.example).

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical URL, `https://snackora.de` in production |
| `RESEND_API_KEY` | for forms* | Resend API key (server-only) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` | for forms* | Alternative to Resend, e.g. Zoho Mail SMTP (paid plans) |
| `CONTACT_EMAIL` | no | **Test override only**: if set, all forms go there. Normal routing is per form in `src/config/business.ts` (`inboxes`) |
| `EMAIL_FROM` | for forms | Sender on the verified domain: `Snackora <info@snackora.de>` |
| `AUTO_REPLY_ENABLED` | no | `true` sends a confirmation to the visitor (default `false`) |
| `EMAIL_REPLY_TO` | no | Reply-To of that confirmation (default: the form's inbox) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | production | Distributed rate limiting |
| `RATE_LIMIT_SALT` | no | Secret salt for pseudonymised rate-limit keys |

\* Either Resend **or** SMTP. Resend takes precedence if both are set. No secret is ever sent to the browser; only `NEXT_PUBLIC_SITE_URL` is public.

## Where to edit what

| What | File |
| --- | --- |
| **Legal & contact data** (address, e-mail, phone, VAT ID, mailbox provider, review flag) | `src/config/business.ts` |
| **Which inbox gets which form** (kontakt@, standort@, kundenservice@) | `src/config/business.ts` (`inboxes`) + rules in `src/lib/inquiry/routing.ts` |
| Navigation, sitemap routes, default SEO text | `src/config/site.ts` |
| Machine categories – currently 4: Snack, Getränke, Kaffee, Kombi (creates `/automaten/[slug]` pages) | `src/content/machines.ts` |
| FAQs (homepage preview via `home: true`) | `src/content/faqs.ts` |
| Homepage copy, process steps, use cases | `src/content/home.ts` |
| Form fields and option lists | `src/components/forms/form-configs.ts`, `src/lib/inquiry/options.ts` |
| Validation rules | `src/lib/inquiry/schema.ts` |
| E-mail templates | `src/lib/email/templates.ts` |
| Colour & type tokens | `src/app/globals.css` (`@theme`) |
| Rate-limit policy | `src/lib/security/rate-limit.ts` (`RATE_LIMITS`) |

### Adding a machine category

1. Add an entry to `machines` in `src/content/machines.ts`. The page and overview card are generated from it. Add the matching column values in the comparison table (`src/app/automaten/page.tsx`), a stage colour in `machine-lineup.tsx` and a photo slot in `src/content/media.ts`.
2. Add `/automaten/<slug>` to `indexableRoutes` in `src/config/site.ts`.
3. Optionally add it to `machineTypes` in `src/lib/inquiry/options.ts` so the forms offer it.

## E-mail

Forms → `POST /api/inquiry` → validation + spam/rate-limit checks → **Resend** (recommended) or **SMTP** → business inbox. The visitor's address is used only as *Reply-To*, never as *From*, so *Reply* in the mailbox answers the visitor directly.

The business mailbox `kontakt@snackora.de` is hosted at **Zoho Mail (EU)**. Zoho receives all mail through its MX records. Resend only sends the website's notifications into that inbox. See [DEPLOYMENT.md](DEPLOYMENT.md#5-e-mail-two-separate-things) for MX, SPF, DKIM and DMARC.

## Deployment (short version)

1. Push to GitHub (`AhmetIOS/snackora`) and import the repo in Vercel.
2. Set the environment variables (Production + Preview).
3. Add the domains `snackora.de` and `www.snackora.de`, with www redirecting to the apex.
4. Point GoDaddy DNS to Vercel and verify the sending domain in Resend.
5. Work through [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md).

Full guide: [DEPLOYMENT.md](DEPLOYMENT.md).

## Maintenance

- **Legal data changes** (address, phone, VAT ID): edit `src/config/business.ts`. Impressum, Datenschutz, footer and structured data update automatically.
- **New services or providers** (analytics, maps, CRM, new e-mail provider): update the Datenschutzerklärung (`src/app/datenschutz/page.tsx`) *before* going live with them. Anything that needs consent also needs a consent mechanism.
- **Dependencies**: `npm outdated` monthly. After upgrading Next.js, read `node_modules/next/dist/docs/` (see `AGENTS.md`).
- **Logo changes**: edit `scripts/brand/glyphs.mjs` / `symbol.mjs`, then run `npm run brand:assets`. Never hand-edit the generated SVGs or `logo-data.ts`.
- **Real photography**: place optimised files in `public/images/` and use `next/image`. Only use real photos of actual Snackora machines or licensed images, and record the licences in `BRAND_GUIDELINES.md`.

## Credits & licences

- Logo, symbol, illustrations: original work for Snackora, generated from code in `scripts/brand/`.
- Fonts: Bricolage Grotesque, DM Sans, DM Mono (SIL Open Font License 1.1), self-hosted via `next/font`. Licence texts are in `scripts/brand/fonts/`.
- UI icons: [Lucide](https://lucide.dev) (ISC licence).
- No stock photography is used.
