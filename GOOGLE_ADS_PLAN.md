# Google Ads – Kampanya Taslağı (henüz yayında değil)

> Durum: **TASLAK.** Hesap açılmadı, ödeme yöntemi bağlanmadı, harcama yok.
> Yayına alma ve bütçe yalnızca açık onayla yapılır.

## 1. Ön koşullar (go-live checklist)

| Koşul | Durum |
|---|---|
| Search Console doğrulandı, sitemap gönderildi | ✔ |
| GA4 + çerez onayı canlıda | ⏳ GA4 hesabı açılınca + deploy sonrası |
| `generate_lead` key event olarak işaretli ve test edildi | ⏳ GA4'ten sonra |
| Formlar production'da çalışıyor (Resend) | ✔ (önceki kurulum) |
| Datenschutz'ta Google Ads açıklaması | ✖ Ads başlamadan önce eklenmeli (Ads conversion tag = ayrı consent kategorisi "Marketing") |
| Telefon numarası | ✖ yok → Anruf-Erweiterung kullanılamaz |
| Google Ads hesabı | ✖ yok (info@snackora.de ile açılabilir) |

**Önemli:** Şu anki consent banner'ı yalnızca "Statistik" (GA4) kategorisini içeriyor. Ads conversion tracking
veya remarketing başlatılacaksa banner'a "Marketing" kategorisi ve Consent Mode `ad_storage`/`ad_user_data`
eklenmeli. `CONSENT_VERSION` yükseltilerek herkesten yeniden onay istenir.

Alternatif (daha basit ve gizlilik dostu): Ads'te dönüşüm olarak **GA4 key event'ini içe aktarmak**
(GA4 ↔ Ads bağlantısı). Ama bu da reklam amaçlı veri kullanımı olduğu için hukuki açıdan Marketing onayı gerektirir.

## 2. Hedefleme

- **Kampanya tipi:** Yalnızca Search. Display/Performance Max **yok** (B2B lead'lerde kalite düşük).
- **Konum:** Esslingen am Neckar + Waiblingen + yaklaşık 15–20 km yarıçap; ayar "**Präsenz**" ("Personen an diesem Ort", "Interesse" değil).
- **Dil:** Deutsch
- **Zamanlama:** Mo–Fr 07–19 Uhr (B2B karar vericiler)
- **Teklif:** Başlangıçta "Klicks maximieren" + maks. CPC sınırı. ≥15–30 dönüşüm sonrası "Conversions maximieren".

## 3. Reklam grupları ve anahtar kelimeler (Phrase/Exact)

| Reklam grubu | Anahtar kelimeler | Landing page |
|---|---|---|
| Snackautomaten Firmen | "snackautomat für firmen", "snackautomat büro", [snackautomat unternehmen], "snackautomaten esslingen" | /automaten/snackautomaten |
| Getränkeautomaten aufstellen | "getränkeautomat aufstellen lassen", "getränkeautomat firma", "getränkeautomaten esslingen" | /automaten/getraenkeautomaten |
| Automatenaufstellung | "automatenaufstellung", "automatenaufsteller", "automaten aufstellen lassen", "automatenaufsteller stuttgart" | /fuer-unternehmen |
| Verkaufsautomaten Betriebe | "verkaufsautomat für betriebe", "verkaufsautomaten unternehmen", "pausenversorgung mitarbeiter" | /fuer-unternehmen |
| Standortgeber (isteğe bağlı) | "automat aufstellen fläche", "standort für automaten anbieten" | /standort-anbieten |

## 4. Negatif anahtar kelimeler (kampanya seviyesi)

```
kaufen, gebraucht, ebay, kleinanzeigen, preis automat kaufen, selber, selbst bauen, diy,
reparatur, ersatzteile, münzprüfer, schlüssel, aufbrechen, defekt, bedienungsanleitung,
job, jobs, stellenangebot, ausbildung, gehalt, fahrer, minijob,
franchise, nebenberuflich, eigenen automaten, passives einkommen, geschäftsidee,
zigarettenautomat, kondomautomat, pfandautomat, fahrkartenautomat, geldautomat,
spielautomat, casino, glücksspiel, kaugummiautomat, kapselautomat,
miniatur, spielzeug, lego, kinder
```

## 5. Reklam metni örnekleri (Responsive Search Ad)

> Kural: Gerçek olmayan vaat yok ("kostenlos", "24/7 Service", "gratis Automat" vb. **kullanılmaz**,
> çünkü doğrulanmış koşullar yok).

**Başlıklar (≤30 karakter):**
- Snackautomaten für Firmen
- Getränkeautomaten aufstellen
- Automaten in Esslingen
- Automaten für Waiblingen
- Pausenversorgung fürs Team
- Individuell geplant
- Jetzt unverbindlich anfragen
- Snackora – Deine Pause

**Açıklamalar (≤90 karakter):**
- Snack-, Getränke- & Kaffeeautomaten für Unternehmen in Esslingen und Waiblingen.
- Persönlich geplant und abgestimmt. Jetzt unverbindlich anfragen – wir melden uns.

**Uzantılar:** Sitelinks (Für Unternehmen · Automaten · Standort anbieten · FAQ), Callouts (Regional · Inhabergeführt · Unverbindlich).

## 6. Bütçe çerçevesi (onay bekliyor)

Gerçek bir öneri ancak şu veriler olduğunda verilebilir: bir otomat yerinin ortalama aylık brüt kârı,
bir müşterinin ortalama süresi, kabul edilebilir lead başına maliyet (CPL). Bu veriler henüz doğrulanmadı.

Test fazı için **varsayım** (doğrulanmış rakam değil): Bölgesel B2B "automatenaufsteller" aramalarında tıklama başına
maliyet tipik olarak birkaç euro seviyesinde. Günlük 10–15 € ile 4 haftalık test → ~300–450 €. Bu, ilk lead'leri
ve arama terimi verilerini görmek için yeterli. **Karar senin.**

## 7. API notu

- Google Ads API için **Developer Token** gerekir (Manager hesabı üzerinden başvuru; "Test" → "Basic access" onayı birkaç gün sürebilir).
- Hesap oluşturma, ödeme ve yayına alma API ile yapılabilse de **açık onay olmadan yapılmaz**.
- Raporlama için okuma erişimi yeterli; ileride `scripts/google-report.mjs`'e eklenebilir.
