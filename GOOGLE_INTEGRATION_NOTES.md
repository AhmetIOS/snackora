# Google Entegrasyonu – Teknik Notlar

> Bu dosyaya secret, token, client secret veya şifre yazılmaz.

## Hesaplar ve saklama yerleri

- Google hesabı: `info@snackora.de` (posta kutusu Zoho'da kalır; Gmail/Workspace MX'i kullanılmaz)
- gcloud CLI: `~/.local/share/google-cloud-sdk` (resmi arşiv), Python: `uv` ile kurulan 3.12 (`CLOUDSDK_PYTHON`, `~/.zshrc`)
- gcloud kimlik bilgileri: `~/.config/gcloud/` (repo dışında, gcloud yönetir)
- Vercel CLI: `npx vercel` (hesap `ahmetios`, kurulu global binary yok)
- OAuth istemci JSON'u (planlanan): `~/.config/snackora/google-oauth-client.json` – **asla repoya girmez**
- Vercel projesi: `snackora` (`prj_fSyesQhFU6tiWMCzih7B39D84CGE`)

## Değişiklik öncesi DNS snapshot'ı (2026-10-21, `dig` ile herkese açık veriler)

Nameserver: `ns11.domaincontrol.com`, `ns12.domaincontrol.com` (GoDaddy)

| Ad | Tip | Değer |
|---|---|---|
| `@` | A | `216.198.79.1` (Vercel) |
| `www` | CNAME/A | → `snackora.de` / `216.198.79.1` |
| `@` | MX | `10 mx.zoho.eu` · `20 mx2.zoho.eu` · `50 mx3.zoho.eu` |
| `@` | TXT | `zoho-verification=zb23078195.zmverify.zoho.eu` |
| `@` | TXT | `v=spf1 include:zohomail.eu ~all` |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:info@snackora.de; ruf=mailto:info@snackora.de; sp=none; adkim=r; aspf=r; pct=100` |
| `zoho._domainkey` | TXT | `v=DKIM1; k=rsa; p=MIIBIjAN…` (Zoho DKIM) |
| `resend._domainkey` | TXT | `p=MIGfMA0G…` (Resend DKIM) |
| `send` | MX | `10 feedback.forge.rmta.net` (Resend) |
| `send` | TXT | `v=spf1 ip4:52.3.252.119 ip4:44.222.39.36 ip4:199.249.231.0/24 ~all` (Resend) |

**Kurallar:** Bu kayıtlar değiştirilmez, silinmez. Google için `@` üzerine yalnızca **ek** bir
`google-site-verification=…` TXT kaydı eklenir. SPF tek kayıt olarak kalır.

## Google API notları

- **Kimlik doğrulama (seçilen yol): anahtarsız servis hesabı + impersonation.**
  - Proje: `snackora-web-integrations` (no. 524824191370), billing yok
  - SA: `snackora-integrations@snackora-web-integrations.iam.gserviceaccount.com` – **JSON anahtarı yok**
  - `info@snackora.de` bu SA üzerinde `roles/iam.serviceAccountTokenCreator` sahibi
  - Token: `gcloud auth print-access-token --impersonate-service-account=<SA> --scopes=…` (1 saat geçerli)
  - Scope'lar: `webmasters`, `siteverification`, `analytics.edit`, `analytics.readonly` (rapor: sadece readonly)
  - SA'nın erişimi: Site Verification sahibi (snackora.de), Search Console sahibi; GA4'te Administrator olarak eklenecek
  - Erişimi iptal etmek: `gcloud iam service-accounts disable <SA>` veya GA4/Search Console'dan kullanıcıyı kaldırmak
- Neden OAuth istemcisi değil: Google, gcloud'un yerleşik istemcisini Analytics/Search Console scope'ları için engelliyor; kendi
  istemcimiz için onay ekranı + manuel Console işlemi + test modunda 7 günde süresi dolan refresh token gerekirdi.
- Domain doğrulama: TXT `google-site-verification=R2QXT4hEG-dkh7X_gRalwscBu4nuURTSXa5aeC5azyY` (@) – **silinmemeli**
- Search Console mülkü: `sc-domain:snackora.de`, sahipler: SA + info@snackora.de
- Indexing API **kullanılmaz** (yalnızca JobPosting/BroadcastEvent içerikleri için izinli).
- Search Console API: sitemap gönderme, performans verisi ve URL Inspection mümkün;
  "Sayfalar" indeksleme raporu ve "Dizine eklenmesini iste" butonu API'de yok.
- GA4 ↔ Search Console bağlantısı Admin API'de yok → GA4 arayüzünden manuel yapılacak.

## Site tarafı (kod)

- `src/config/analytics.ts` – `NEXT_PUBLIC_GA_MEASUREMENT_ID` (sadece Vercel Production), `NEXT_PUBLIC_GA_DEBUG`
- `src/lib/consent/consent.ts` – onay kaydı (`localStorage["snackora-consent"]`, versiyon, 12 ay)
- `src/components/consent/*` – banner + "Cookie-Einstellungen"
- `src/components/analytics/google-analytics.tsx` – gtag sadece onaydan sonra, mailto/tel tıklamaları
- `src/lib/analytics/events.ts` – form → event eşlemesi (tek key event: `generate_lead`)
- CSP: Google origin'leri sadece GA ID varsa ekleniyor (`next.config.ts`)
- Kategori/servis değişirse: `CONSENT_VERSION` yükselt + Datenschutz güncelle

## GA4'te API ile yapılacak ayarlar (property açıldıktan sonra)

- Key event: `generate_lead` (diğer form event'leri key event **olmayacak** → çift sayım yok)
- Data retention: 14 ay (`dataRetentionSettings`) – Datenschutz metni bu değeri söylüyor
- Google Signals: kapalı (Datenschutz böyle söylüyor)
- Internal traffic / developer traffic filtresi isteğe bağlı
