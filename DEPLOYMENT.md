# Deployment guide – snackora.de on Vercel

This guide takes the repository `github.com/AhmetIOS/snackora` to production at **https://snackora.de**.

Setup has three independent parts. Don't mix them up:

| Part | Service | DNS records |
| --- | --- | --- |
| Website hosting | Vercel | `A @`, `CNAME www` |
| Business mailbox (receive and reply) | Zoho Mail (EU) | `MX`, SPF `TXT`, DKIM `TXT` |
| Website form e-mails (send) | Resend (recommended) *or* Zoho SMTP | Resend: DKIM `TXT`, `MX`/`TXT` on `send.` subdomain |

Connecting the domain to Vercel does **not** create a mailbox, and Resend does **not** receive mail.

---

## 1. Prerequisites

- GitHub repository `AhmetIOS/snackora` containing this project
- Vercel account (Hobby works to start. Note that Vercel's Hobby plan is for non-commercial use, so plan on **Pro** for a business site)
- Domain `snackora.de` at GoDaddy
- Zoho Mail account created on **zoho.eu** (EU data centre)
- Resend account (or a paid Zoho plan that includes SMTP)
- Optional but recommended: Upstash account (rate limiting)

## 2. Create the Vercel project

1. Vercel → **Add New → Project** → import `AhmetIOS/snackora`.
2. Framework preset: **Next.js** (auto-detected). Leave the build command (`next build`) and output settings at their defaults.
3. **Settings → General → Node.js Version: 22.x**.
4. `vercel.json` pins serverless functions to **fra1 (Frankfurt)**, which matches the privacy policy.
5. Add the environment variables (next section), then **Deploy**.

## 3. Environment variables

Vercel → Project → **Settings → Environment Variables**. Set them for *Production*, and with test values for *Preview* if you want previews to send mail.

| Variable | Production value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://snackora.de` |
| `RESEND_API_KEY` | `re_…` (Resend → API Keys → *Sending access*, restricted to `snackora.de`) |
| `CONTACT_EMAIL` | `kontakt@snackora.de` |
| `EMAIL_FROM` | `Snackora Website <website@snackora.de>` |
| `AUTO_REPLY_ENABLED` | `false` at first, `true` once delivery is tested |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | from Upstash (section 6) |
| `RATE_LIMIT_SALT` | any long random string, e.g. `openssl rand -hex 32` |

*Alternative without Resend (Zoho SMTP, paid Zoho plan only):* leave `RESEND_API_KEY` empty and set `SMTP_HOST=smtppro.zoho.eu`, `SMTP_PORT=465`, `SMTP_USER=kontakt@snackora.de`, `SMTP_PASSWORD=<Zoho app-specific password>`, `EMAIL_FROM=Snackora Website <kontakt@snackora.de>`. Then set `emailDelivery: "smtp"` in `src/config/business.ts` so the privacy policy matches.

Environment variable changes only take effect after a **redeploy**.

## 4. Connect snackora.de (GoDaddy → Vercel)

The canonical domain is the **apex `snackora.de`**. `www` redirects to it.

1. Vercel → Project → **Settings → Domains** → add `snackora.de` and `www.snackora.de`.
2. Edit `www.snackora.de` and choose **Redirect to `snackora.de`** (308). `next.config.ts` contains the same redirect as a portable fallback.
3. Vercel then shows the DNS records to create. **Use exactly the values shown there.** They are typically:

   | Type | Name | Value |
   | --- | --- | --- |
   | A | `@` | `76.76.21.21` (or the project-specific IP Vercel displays) |
   | CNAME | `www` | `cname.vercel-dns.com` (or the project-specific value) |

4. GoDaddy → **My Products → snackora.de → DNS → DNS Records**:
   - Delete the default `A @` record ("Parked") and any existing `CNAME www`.
   - Disable **Domain Forwarding** if it is active.
   - Add the two records above. Keep TTL at 1 hour.
5. Back in Vercel, wait until both domains show **Valid Configuration** (minutes up to a few hours).
6. HTTPS certificates are issued automatically. The site sends HSTS, so make sure HTTPS works before sharing links.

Verify:

```bash
curl -sI https://www.snackora.de | grep -i location   # → https://snackora.de/
curl -sI http://snackora.de | head -1                 # → 308 to https
```

## 5. E-mail: two separate things

### 5a. Business mailbox with Zoho Mail (receiving and replying)

1. Create the organisation in Zoho Mail on **zoho.eu** and add the domain `snackora.de`.
2. Domain verification: Zoho shows a `TXT` (or `CNAME`) record. Add it in GoDaddy DNS.
3. Create the user/mailbox `kontakt@snackora.de`. Add aliases like `anfrage@` or `info@` if wanted.
4. **MX records** (GoDaddy, delete any other MX records first):

   | Type | Name | Value | Priority |
   | --- | --- | --- | --- |
   | MX | `@` | `mx.zoho.eu` | 10 |
   | MX | `@` | `mx2.zoho.eu` | 20 |
   | MX | `@` | `mx3.zoho.eu` | 50 |

5. **SPF** – exactly **one** SPF record on `@`:
   `TXT  @  v=spf1 include:zohomail.eu ~all`
   (Resend does not need to be in this record, because it uses the `send.` subdomain. If you use Zoho SMTP for the website, this record already covers it.)
6. **DKIM for Zoho**: Zoho Admin → Domains → snackora.de → Email Configuration → DKIM → add selector (e.g. `zmail`). Then add the `TXT zmail._domainkey` record Zoho shows and click *Verify*.
7. Send a test mail from an external address to `kontakt@snackora.de`, and reply from Zoho.
8. Then set `email.status: "active"` in `src/config/business.ts`. This shows the address on the website.

Replying to inquiries: notification mails carry the visitor's address as **Reply-To**, so pressing *Reply* in Zoho answers the visitor directly.

### 5b. Website form delivery with Resend (recommended)

Why Resend: it's built for sending from serverless functions, has a simple API with idempotency (no duplicate mails on retries), and is independent of the mailbox. Zoho's free plan does not include SMTP.

1. Resend → **Domains → Add domain** → `snackora.de`, region **EU (Ireland)**.
2. Add the records Resend shows in GoDaddy. They are typically:

   | Type | Name | Purpose |
   | --- | --- | --- |
   | TXT | `resend._domainkey` | DKIM |
   | MX | `send` | Return-path / bounces (`feedback-smtp.eu-west-1.amazonses.com`, priority 10) |
   | TXT | `send` | SPF for the `send` subdomain (`v=spf1 include:amazonses.com ~all`) |

   These live on the `send.` subdomain and don't conflict with the Zoho MX records on `@`.
3. Click **Verify**. The status must become *Verified*.
4. API key with **Sending access** only → `RESEND_API_KEY` in Vercel → redeploy.

### 5c. DMARC (once SPF and DKIM pass for both)

`TXT  _dmarc  v=DMARC1; p=none; rua=mailto:kontakt@snackora.de; adkim=r; aspf=r`

Start with `p=none` and watch reports for 2–4 weeks. Then tighten to `p=quarantine`.

### 5d. Test

1. Submit each form on the live site (Anfrage, Standort, Kontakt).
2. Check that the notification arrives in Zoho, that *Reply* goes to the submitted address, and that the subject contains the reference number (`SNK-…`).
3. If `AUTO_REPLY_ENABLED=true`: check the confirmation in an external inbox, including spam folders.
4. Vercel → Project → **Logs**: look for `inquiry.delivered`. Errors appear as `inquiry.email.failed` (no personal data is logged).

## 6. Rate limiting with Upstash (recommended)

1. Upstash → **Create Database** → Redis, region **eu-central-1 (Frankfurt)**. Alternatively use the Vercel Marketplace integration.
2. Copy **REST URL** and **REST Token** into `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` → redeploy.

Without Upstash, each serverless instance counts on its own, which is weak protection. Policy (in `src/lib/security/rate-limit.ts`): 5 submissions per IP per 10 min, 20 per IP per day, 300 globally per day, and 3 confirmation mails per recipient per day.

## 7. After deployment

- `https://snackora.de/sitemap.xml` and `/robots.txt` load and contain only `https://snackora.de/...` URLs.
- Google Search Console: add the domain property (DNS `TXT`), then submit the sitemap.
- Work through [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md).

## 8. Rollback

- Every push creates an immutable deployment. If something goes wrong: Vercel → **Deployments** → choose the last good one → **Instant Rollback** (or *Promote to Production*).
- Environment variable changes are not versioned. Note old values before changing them.
- DNS changes: lower the TTL to 600 s a day before planned changes so you can revert quickly.

## 9. Continuous integration (optional)

Recommended GitHub Action on every PR: `npm ci`, `npm run check`, `npx playwright install --with-deps chromium`, `npm run test:e2e`. The e2e tests never send real e-mails (`RESEND_API_KEY` is empty; success paths are mocked).

## 10. AWS later (notes)

The app uses only standard Next.js features plus two HTTP APIs (Resend, Upstash). There are no Vercel-only SDKs.

- **AWS Amplify Hosting** supports Next.js SSR. Check its support for the Next.js version and *Cache Components / Partial Prerendering* in use.
- **OpenNext / SST** deploys Next.js to Lambda + CloudFront.
- **Container** (ECS Fargate, App Runner): `next build && next start` in a Node 22 image, behind a load balancer with TLS.

When moving: recreate the env vars, update the hosting provider and region in the privacy policy, and keep the www → apex redirect (already in `next.config.ts`). `vercel.json` only applies to Vercel.
