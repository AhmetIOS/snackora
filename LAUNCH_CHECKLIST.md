# Launch checklist – snackora.de

Tick every item before announcing the website. `npm run check:launch` checks the items marked ⚙ automatically. The production build also prints them as a warning.

## Legal & business data (`src/config/business.ts`)

- [x] ⚙ Legal address configured: Hohestr. 6, 73734 Esslingen am Neckar
- [ ] Address confirmed as *ladungsfähige Anschrift* (deliverable postal address; no P.O. box)
- [ ] Business registration (Gewerbeanmeldung) completed and business status reviewed
- [ ] VAT: USt-IdNr. assigned? If yes, enter it in `vatId`; if not (e.g. Kleinunternehmer § 19 UStG), leave it `null`
- [ ] Wirtschafts-Identifikationsnummer assigned? Add it to the Impressum only if it was actually assigned
- [ ] Commercial register entry? Only if one exists (`register`), which is not the case for a non-registered Einzelunternehmen
- [ ] Optional: business phone number set in `phone` (recommended as a second fast contact channel)
- [ ] ⚙ Legal contact mailbox works → `email.status: "active"`
- [x] ⚙ Mailbox provider named (`mailboxProvider`: Zoho Mail EU)
- [ ] `emailDelivery` matches the real configuration (`"resend"` or `"smtp"`)
- [ ] Impressum (`/impressum`) and Datenschutzerklärung (`/datenschutz`) reviewed, ideally by a lawyer or the IHK
- [ ] ⚙ Afterwards set `legalReviewCompleted: true`. This removes the yellow review notices.

## Data protection

- [ ] Zoho account created in the **EU data centre** (zoho.eu); data processing agreement (DPA) with Zoho concluded
- [ ] DPA with Vercel accepted (Vercel dashboard → Settings → Legal / DPA)
- [ ] DPA with Resend accepted (if Resend is used)
- [ ] DPA with Upstash accepted (if Upstash is used); database region Frankfurt
- [ ] Transfer bases (EU-US Data Privacy Framework / SCCs) of the providers re-checked, privacy text adjusted if needed
- [ ] Privacy policy matches the services actually in use. Any new service (analytics, maps, chat, CRM) means updating it first.
- [ ] No analytics, tracking pixels or third-party embeds added without updating the policy and adding consent

## Domain & hosting

- [ ] Vercel project connected to `AhmetIOS/snackora`, Node 22.x
- [ ] `snackora.de` and `www.snackora.de` show *Valid Configuration* in Vercel
- [ ] `www` redirects to `https://snackora.de` (308)
- [ ] HTTPS works on both hosts; HTTP redirects to HTTPS
- [ ] GoDaddy parking records and domain forwarding removed
- [ ] Vercel plan suitable for commercial use (Pro)

## E-mail

- [ ] Zoho MX records (`mx.zoho.eu`, `mx2`, `mx3`) set; no other MX records left
- [ ] Exactly one SPF record on `@` (`v=spf1 include:zohomail.eu ~all`)
- [ ] Zoho DKIM verified
- [ ] Resend domain `snackora.de` verified in region EU (DKIM + `send.` subdomain) – or Zoho SMTP configured
- [ ] DMARC record set (`p=none` to start)
- [ ] Business mailbox receives external mail and can reply
- [ ] Env vars set in Vercel: `RESEND_API_KEY` (or `SMTP_*`), `CONTACT_EMAIL`, `EMAIL_FROM`, `NEXT_PUBLIC_SITE_URL`
- [ ] Upstash env vars set (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) and `RATE_LIMIT_SALT`
- [ ] **Anfrage** form tested end to end on production; notification received
- [ ] **Standort anbieten** form tested end to end; notification received
- [ ] **Kontakt** form tested end to end; notification received
- [ ] Reply from Zoho reaches the visitor (Reply-To works)
- [ ] Notifications not in spam (check with an external inbox, e.g. mail-tester.com)
- [ ] If `AUTO_REPLY_ENABLED=true`: confirmation tested and arrives
- [ ] Vercel logs show `inquiry.delivered` and no `inquiry.email.failed`

## Content & claims

- [ ] No fabricated business claims: no invented customers, numbers, testimonials, certificates or locations
- [ ] Machine images are illustrations or labelled as *Symbolbild*; no other brands' logos shown
- [ ] Any photos added to `src/content/media.ts` are licensed or own photos, with the source noted
- [ ] Copy reviewed once more by the owner (offer, region, wording about costs/models)

## SEO

- [ ] `https://snackora.de/sitemap.xml` loads and lists only `https://snackora.de/…` URLs
- [ ] `https://snackora.de/robots.txt` references the sitemap
- [ ] Titles/descriptions checked (view source or an SEO browser extension)
- [ ] Social preview checked (e.g. LinkedIn Post Inspector, opengraph.xyz)
- [ ] Google Search Console property added and sitemap submitted
- [ ] Optional: Bing Webmaster Tools

## Quality

- [ ] `npm run check` passes (typecheck, lint, unit tests)
- [ ] `npm run test:e2e` passes
- [ ] Production build on Vercel successful
- [ ] Mobile layout reviewed on a real iPhone and Android device
- [ ] Lighthouse (Chrome DevTools, mobile) run on `/`, `/anfrage`, `/automaten/snackautomaten`
- [ ] 404 page checked (`/irgendwas`)
