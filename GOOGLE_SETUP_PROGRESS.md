# Google Kurulumu – İlerleme (snackora.de)

> Durumlar: NOT_STARTED · IN_PROGRESS · WAITING_FOR_USER · COMPLETED · BLOCKED
> Bu dosyaya secret, token veya erişim bilgisi yazılmaz. Teknik notlar: `GOOGLE_INTEGRATION_NOTES.md`.
> Son güncelleme: 2026-10-21

## Genel bakış

| Faz | Konu | Durum |
|---|---|---|
| 0 | Proje ve erişim analizi | COMPLETED |
| 1 | Google Cloud ve API erişimi | COMPLETED |
| 2 | Search Console (domain property, DNS doğrulama, sitemap) | COMPLETED |
| 3 | GA4 + çerez onayı (DSGVO/TDDDG) + dönüşüm event'leri | COMPLETED (canlıda, test edildi) |
| 4 | Search Console ↔ GA4 bağlantısı | COMPLETED |
| 5 | Teknik SEO ve Almanca içerik | COMPLETED (canlıda) |
| 6 | Google Business Profile | BLOCKED (ertelendi – uygunluk kullanıcıyla netleşmeli) |
| 7 | Google Ads hazırlığı (harcama yok) | COMPLETED (taslak: `GOOGLE_ADS_PLAN.md`) |
| 8 | Otomatik raporlama | COMPLETED (`npm run report:google`) |

**Deploy:** PR #4 → `main` (`c5bb8ff`), Vercel Production Ready (2026-10-22 00:22). `NEXT_PUBLIC_GA_MEASUREMENT_ID` sadece Production'da.

---

## Faz 0 – Analiz

### 0.1 Kod analizi
- **Durum:** COMPLETED
- **Yapılan işlem:** Repo incelendi.
- **Sonuç:** Next.js 16.4.2 (App Router, `cacheComponents`), React 19.3, Tailwind 4, Vercel (fra1). Formlar: `anfrage`, `standort`, `kontakt` → `/api/inquiry` → Resend. `robots.ts` ve `sitemap.ts` var (14 URL). Canonical'lar `pageMetadata()` ile. Organization/WebSite JSON-LD var.
- **Sonraki fazlar için önemli bulgular:**
  - Analytics yok, cookie banner yok. Datenschutz sayfası açıkça "Cookie yok, tracking yok" diyor → GA4 eklenince güncellenmeli.
  - `next.config.ts` içindeki CSP yalnızca `'self'` izin veriyor → GA4 için CSP genişletilmeli.
  - Ayrı bir **Kundenservice formu yok** (sadece `kundenservice@` posta kutusu) → `kundenservice_submit` şu an ölçülemez.
  - `business.phone = null` → `click_phone` için hedef yok.
  - Ana sayfa H1'i slogan ("Deine Pause. Jederzeit."), görsel olarak gizli (`sr-only`).

### 0.2 Canlı site ve DNS (önceki durum kaydedildi)
- **Durum:** COMPLETED
- **Kullanılan servis:** curl, dig
- **Test sonucu:** `https://snackora.de` 200 · `www` → 308 apex · `http` → 308 https · `/robots.txt` 200 · `/sitemap.xml` 200 (14 geçerli URL) · 404 sayfası çalışıyor.
- DNS GoDaddy'de (`ns11/ns12.domaincontrol.com`). Zoho MX (EU), SPF, DMARC, Zoho DKIM, Resend DKIM ve `send.` alt alanı mevcut. Snapshot: `GOOGLE_INTEGRATION_NOTES.md`.
- Henüz `google-site-verification` TXT kaydı **yok**.

### 0.3 Araçlar
- **Durum:** COMPLETED
- Mevcut: node 22, npm, curl, dig, jq, Homebrew, python3 · Eksik: `gcloud` (kuruluyor), `vercel` CLI, `gh`
- GoDaddy DNS API: büyük ihtimalle kullanılamaz (GoDaddy API'yi çok sayıda domaini olan hesaplarla sınırlıyor) → TXT kaydı muhtemelen manuel eklenecek.

---

## Faz 1 – Google Cloud ve API erişimi

### 1.1 gcloud CLI kurulumu
- **Durum:** COMPLETED
- **Yapılan işlem:** Homebrew (Intel/Rosetta) openssl'i kaynak koddan derlediği için iptal edildi. Bunun yerine Google'ın resmi arm64 arşivi `~/.local/share/google-cloud-sdk` dizinine kuruldu. gcloud Python ≥3.10 istediği için `uv` ile kullanıcıya özel Python 3.12 kuruldu (`CLOUDSDK_PYTHON`). PATH ve `CLOUDSDK_PYTHON` `~/.zshrc` dosyasına eklendi.
- **Test sonucu:** `gcloud --version` → Google Cloud SDK 590.0.0 ✔ · `gcloud auth list` → henüz hesap yok
- **Tarihçe notu:** Vercel CLI zaten `npx vercel` ile kullanılıyor, `ahmetios` hesabında oturum açık ✔

### 1.2 info@snackora.de ile gcloud girişi
- **Durum:** COMPLETED
- **Yapılan işlem:** Kullanıcı `gcloud auth login` ile tarayıcıdan giriş yaptı.
- **Test sonucu:** `gcloud auth list` → aktif hesap `info@snackora.de` ✔ (Gmail adresi değil)

### 1.3 Google Cloud projesi "Snackora Web Integrations"
- **Durum:** COMPLETED
- **Yapılan işlem:** Kullanıcı Cloud ToS'u kabul etti → `gcloud projects create snackora-web-integrations` (proje no. 524824191370).
- **Test sonucu:** `lifecycleState: ACTIVE`, `billingEnabled: false` ✔

### 1.4 API'lerin etkinleştirilmesi
- **Durum:** COMPLETED
- **Etkin:** searchconsole, siteverification, analyticsadmin, analyticsdata, iam, iamcredentials (hepsi ücretsiz)
- **Test sonucu:** `gcloud services list --enabled` ✔

### 1.5 Kimlik doğrulama – anahtarsız servis hesabı (OAuth istemcisi yerine)
- **Durum:** COMPLETED
- **Karar:** OAuth onay ekranı + Desktop istemcisi yerine **anahtarsız servis hesabı + impersonation**. Diskte JSON anahtarı yok, kısa ömürlü token (1 saat), yetki yalnızca açıkça eklendiği mülklerde.
- **Servis hesabı:** `snackora-integrations@snackora-web-integrations.iam.gserviceaccount.com`
- **IAM:** `user:info@snackora.de` → `roles/iam.serviceAccountTokenCreator` (sadece bu SA üzerinde)
- **Test sonucu:** kullanıcı tarafından yönetilen anahtar: 0 ✔

### 1.6 API erişim testi
- **Durum:** COMPLETED
- **Test sonucu:** Site Verification `webResource.list` 200 · Search Console `sites.list` 200 · GA Admin `accountSummaries.list` 200 · GA Data `runReport` 403 (mülk yok – beklenen) ✔

---

## Faz 2 – Search Console

### 2.1 Domain doğrulama tokenı
- **Durum:** COMPLETED
- **Yapılan işlem:** Site Verification API `token` (INET_DOMAIN, DNS_TXT)
- **Değer (herkese açık DNS değeri, secret değil):** `google-site-verification=R2QXT4hEG-dkh7X_gRalwscBu4nuURTSXa5aeC5azyY`

### 2.2 TXT kaydı ve domain doğrulama
- **Durum:** COMPLETED
- **Yapılan işlem:** Kullanıcı GoDaddy'de `@` için ek TXT kaydı ekledi. Watcher, kayıt ns11 ve 8.8.8.8 üzerinde görününce (~7 dk) `webResource.insert` (DNS_TXT) çağırdı.
- **Test sonucu:** `VERIFIED`, id `dns://snackora.de` ✔. MX/SPF/Zoho kayıtları değişmedi ✔
- **Not:** TXT kaydı **kalıcı olarak kalmalı** (silinirse doğrulama düşer).

### 2.3 Sahipler ve Search Console mülkü
- **Durum:** COMPLETED
- **Yapılan işlem:** Doğrulanmış sahipler: servis hesabı + `info@snackora.de`. `sites.add sc-domain:snackora.de`.
- **Test sonucu:** `sites.list` → `sc-domain:snackora.de`, `siteOwner` ✔ (info@ hesabı Search Console arayüzünde de görür)

### 2.4 Sitemap
- **Durum:** COMPLETED
- **Yapılan işlem:** `https://snackora.de/sitemap.xml` gönderildi (14 URL, sadece indexlenebilir sayfalar, canonical'lar ile uyumlu).
- **Test sonucu:** Google sitemap'i okudu (`lastDownloaded` 2026-10-21), 0 hata, 0 uyarı ✔

### 2.5 İndeksleme analizi (URL Inspection API)
- **Durum:** COMPLETED (gözlem)
- `/` ve `/standort-anbieten`: "URL ist Google nicht bekannt" · `/fuer-unternehmen`, `/automaten/snackautomaten`: "Gefunden – zurzeit nicht indexiert"
- Yeni bir domain için normal. robots.txt engellemiyor, canonical'lar doğru. İndekslemenin ne zaman olacağı garanti edilemez (genelde günler–birkaç hafta).
- API ile yapılamayan: "Indexierung beantragen" butonu (yalnızca UI). Indexing API bilerek **kullanılmadı**.

---

## Faz 3 – GA4 ve çerez onayı

### 3.1 GA4 hesap/property/stream
- **Durum:** COMPLETED
- **Yapılan işlem:** Kullanıcı GA4 sihirbazını tamamladı (veri paylaşımı kapalı, DSGVO şartları kabul edildi) ve SA'yı **Düzenleyici** olarak ekledi (en az yetki).
- Hesap `accounts/412940097` "Snackora" · Property `properties/560118080` "Snackora" (Europe/Berlin, EUR, Business & Industrial Markets)
- Web stream `16177526028` → `https://snackora.de` · **Measurement ID `G-E84G7MZFH5`**
- **Test sonucu:** `accountSummaries.list` → property görünüyor, `canEdit: true` ✔

### 3.1b GA4 ayarları (API)
- **Durum:** COMPLETED
- Key event: `generate_lead` (ONCE_PER_EVENT) ✔. Otomatik oluşturulanlar (`purchase`, `qualify_lead`, `close_convert_lead`) duruyor; site bunları hiç göndermiyor.
- Data retention: event 2 → **14 ay**, user 14 ay, "reset on new activity" kapalı (Datenschutz metniyle uyumlu) ✔
- Google Signals: kapalı (varsayılan, kontrol edildi) ✔
- Custom dimensions (event): `form_name` "Formular", `lead_type` "Anfrageart", `link_location` "Link Seite" ✔
- Enhanced measurement: açık, `pageChanges` açık (SPA page_view) ✔, **form interactions kapalı** (butona basınca `form_submit` gönderiyordu, başarılı gönderimden bağımsız) ✔
- GA ID yerel `.env.vercel.local`'a eklendi (git-ignored). Vercel'e **henüz gönderilmedi**.
- **Sonraki adım:** ✔ yapıldı (bkz. 3.7)

### 3.7 Canlı test (production, 2026-10-22)
- **Durum:** COMPLETED
- Reddet: banner görünüyor, Google'a **0** istek, cookie yok, konsol hatası yok ✔
- Kabul: gtag.js 1 kez, `_ga` + `_ga_E84G7MZFH5` cookie'leri, her sayfa geçişinde tam 1 `page_view` (/, /automaten, /faq) ✔
- Geri çekme (footer → Cookie-Einstellungen): `_ga*` cookie'leri silindi, sonrasında Google'a 0 istek ✔
- Form (API mock'lanarak, gerçek e-posta ya da GA verisi oluşturulmadan): `generate_lead {form_name: anfrage, lead_type: standort}`, `standortanfrage_submit`, `click_email` → her biri tam 1 kez, PII yok ✔
- GA4 Realtime API: page_view 7, session_start 4, first_visit 4 (test ziyaretleri) ✔
- `/api/inquiry` geçersiz istek → 403 (değişmedi), sayfalar 200, DNS değişmedi ✔

### 3.2 Çerez onayı (consent banner)
- **Durum:** COMPLETED (kodda)
- Engellemeyen banner, "Ablehnen" ve "Akzeptieren" eşit ağırlıkta, ön seçim yok, ayrıntılı ayarlar (Notwendig / Statistik), footer'daki "Cookie-Einstellungen" ile tekrar açılabiliyor, geri çekince `_ga*` cookie'leri siliniyor ve `ga-disable` ayarlanıyor. 12 ay sonra tekrar soruluyor.
- **GA ID yoksa:** banner yok, CSP katı, Datenschutz eski metin → production davranışı değişmiyor (build ile test edildi ✔)

### 3.3 GA4 entegrasyonu
- **Durum:** COMPLETED (kodda)
- gtag.js **sadece onaydan sonra** yükleniyor (Consent Mode v2: ads her zaman denied). Google Signals ve reklam kişiselleştirme kapalı.
- page_view: GA4 Enhanced Measurement (history change) → manuel page_view yok, duplicate yok. Client-side navigation'da script tekrar yüklenmiyor (e2e ✔).
- Ölçüm sadece Production'da: `NEXT_PUBLIC_GA_MEASUREMENT_ID` sadece Vercel Production'a girilecek.

### 3.4 Dönüşüm event'leri
- **Durum:** COMPLETED (kodda)
- `generate_lead` (tek key event): Anfrage formu (tüm türler) + Standort formu – her gönderimde tam 1 kez
- `standortanfrage_submit`: Standort formu + "Standort anbieten" türündeki Anfrage (sadece raporlama, key event değil)
- `kontakt_submit`: Kontakt formu (lead sayılmıyor)
- `click_email` / `click_phone`: mailto/tel tıklamaları (adres gönderilmiyor)
- `kundenservice_submit`: **uygulanamadı**. Sitede Kundenservice formu yok (sadece posta kutusu). Form eklenirse 1 satırlık iş.
- Event'ler sadece sunucu başarıyı onayladıktan sonra gönderiliyor. Form içeriği (isim, e-posta, telefon, mesaj, PLZ) gönderilmiyor (e2e ✔).

### 3.5 Datenschutz
- **Durum:** COMPLETED (kodda) – **hukuki kontrol önerilir**
- GA ID varsa: GA4 bölümü (Google Ireland, cookie'ler, amaç, Art. 6 (1) a, § 25 TDDDG, DPF/SCC, 14 ay, IP, geri çekme linki), consent storage açıklaması.

### 3.6 Testler
- Unit: 54/54 ✔ · E2E: 66 mevcut + 12 yeni consent testi (desktop + mobile) ✔ · typecheck ✔ · lint ✔ · GA'sız ve GA'lı production build ✔

---

## Faz 4 – Search Console ↔ GA4
- **Durum:** COMPLETED (2026-10-22)
- **Yapılan işlem:** Kullanıcı önce `snackora.de` domain mülkünü kendi Search Console'una ekledi ("Sahiplik otomatik olarak doğrulandı" çünkü SA tarafından devredilmiş sahiplik). Ardından GA4 → Yönetici → Ürün bağlantıları → Search Console bağlantıları → `snackora.de` (alan adı) ↔ web stream `https://snackora.de`.
- **Test sonucu:** GA4 arayüzü "BAĞLANTI OLUŞTURULDU" gösterdi (kullanıcının ekran görüntüsü). Admin API bu bağlantıyı listeleyemediği için API ile doğrulanamıyor.
- **Veri gecikmesi:** Search Console verileri GA4'te ~48 saat sonra görünür. Raporlar ancak Google sayfaları indeksleyip gösterim oluştuğunda dolar.
- **Açık nokta (isteğe bağlı):** info@ sahipliği SA'nın DNS doğrulamasına bağlı ("Bilinmiyor"). Bağımsız olsun istenirse Search Console → Ayarlar → Sahipliği doğrulama → info@ için ikinci bir TXT kaydı.

---

## Faz 5 – Teknik SEO
- **Durum:** COMPLETED (branch'te)
- **Canlı audit (14 URL):** hepsi 200, canonical doğru, sayfa başına 1 H1, tüm görsellerde alt, JSON-LD (Organization, WebSite, Breadcrumb, Service, FAQPage) geçerli, kırık link yok, www→apex 308, http→https 308, 404 çalışıyor, HSTS + CSP var.
- **Değişiklikler:**
  - Ana sayfa H1: "Snack- und Getränkeautomaten für Unternehmen in Esslingen, Waiblingen und der Region Stuttgart: Deine Pause. Jederzeit." (slogan korunuyor, görsel tasarım değişmedi)
  - Ana sayfa title 73 → 61 karakter: "Snack- & Getränkeautomaten für Firmen in Esslingen | Snackora"
  - Meta description: ana sayfa 178 → 156, Für Unternehmen 180 → 142 karakter (Waiblingen eklendi)
  - `/automaten` title kısaltıldı, `/ueber-uns` title'daki çift "Snackora" kaldırıldı
- **Bilerek yapılmayanlar:** Sahte yerel sayfalar, LocalBusiness şeması (açık adres/çalışma saati yok), rating/review, "kostenlos/24h" vaatleri.
- **Lighthouse (PageSpeed Insights API, canlı, deploy sonrası 2026-10-22):**
  - Mobil: Performance **95**, Accessibility **100**, Best Practices **100**, SEO **100** · LCP 2,7 s · CLS 0 · TBT 30 ms · FCP 1,4 s
  - Desktop: Performance **100**, Accessibility **96**, Best Practices **100**, SEO **100** · LCP 0,7 s · CLS 0
  - CrUX saha verisi: henüz yok (trafik az)
  - **İyileştirme önerileri (yapılmadı):** mobil LCP'yi 2,5 s altına indirmek (hero görseli: "Improve image delivery", "LCP request discovery"), desktop'ta bir yerde yetersiz renk kontrastı, "Legacy JavaScript / unused JS" (Next.js varsayılanları)

---

## Faz 6 – Google Business Profile
- **Durum:** BLOCKED (bilerek ertelendi)
- Profil için doğrulanabilir bir işletme ve müşterilerle gerçek temas gerekiyor. Otomat henüz kurulmadıysa Google'ın kurallarına göre erken. Hizmet alanı işletmesi olarak (adres gizli) uygun olabilir. Önce: işletme aktif mi, ilk otomat kuruldu mu? → kullanıcıya sorulacak.

## Faz 7 – Google Ads
- **Durum:** COMPLETED (taslak) → `GOOGLE_ADS_PLAN.md`. Hesap yok, harcama yok.

## Faz 8 – Raporlama
- **Durum:** COMPLETED
- `npm run report:google [-- --days 7]` → Search Console + GA4 + teknik SEO → `reports/google-YYYY-MM-DD.md` (gitignore). Token anahtarsız, gcloud impersonation ile.
- **Test:** çalıştırıldı ✔ (SC: henüz veri yok, sitemap okundu; GA4: property yok; SEO: 14 URL, sorun yok)

---

## Tur 2 (2026-10-22) – SEO raporu düzeltmeleri + /admin paneli

**Branch:** `feat/seo-and-admin-dashboard` (merge kullanıcıda)

### SEO / performans
- **Durum:** COMPLETED (branch'te)
- 4 otomat illüstrasyonu inline SVG yerine statik dosya (`public/illustrations/*.svg`, `npm run brand:illustrations`; yazılar marka fontlarıyla path'e çevrildi)
  → DOM 2.284 → **955** düğüm, HTML ~576 → 420 KB (ham), brotli 45 → 41 KB
- Hero fotoğrafı: `<picture>` + media'ya göre preload → her cihaz yalnızca **1** varyant indiriyor (önce 2)
- `experimental.inlineCss` → render-blocking CSS isteği **0**
- Fontlar sadece `latin` alt kümesi → 8 → **4** font isteği
- `/llms.txt` (AI asistanları için, sitenin doğrulanmış içeriğinden üretiliyor)
- Organization JSON-LD: `hasOfferCatalog` (4 hizmet) + `contactPoint`
- **Bilerek düzeltilmeyen (yanlış alarm / bilinçli karar):** CDN (Vercel zaten CDN), "Google Analytics yok" (onaydan önce yüklenmiyor – DSGVO), düz e-posta adresi (iletişim adresi, gizlemek kullanılabilirliği bozar), ads.txt (reklam yok), robots Disallow (/api, /admin bilinçli), >20 istek (Next.js link prefetch'leri – navigasyonu hızlandırıyor), sahte referans/değerlendirme eklenmedi

### /admin istatistik paneli
- **Durum:** COMPLETED (branch'te; Vercel env hazır)
- Şifre korumalı (`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` Vercel Production'da, Sensitive), IP başına rate limit, noindex, GA'da ölçülmüyor
- Veriler: kullanıcı/yeni kullanıcı/oturum/görüntüleme (+ önceki döneme göre %), günlük grafik, gerçek zamanlı, talepler (generate_lead vb.), kanallar, kaynak/araç, sayfalar, şehirler, cihazlar, Google aramaları (Search Console), anonim ziyaret günlüğü
- Google erişimi: Vercel OIDC → Workload Identity Federation → SA (anahtar dosyası yok, sadece Production, sadece readonly scope)
- **Test:** unit 59/59, e2e 75/75; yerelde gerçek GA4/SC verisiyle desktop+mobil kontrol edildi
- **Canlı test:** merge + deploy sonrası yapılmalı (federation sadece production'da çalışır)
