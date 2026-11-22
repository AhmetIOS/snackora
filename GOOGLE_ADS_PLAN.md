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
- **Test amacı (2026-11-21):** pazar potansiyeli – bölgede bir kurum "otomata ihtiyacımız var, kurun ve işletin" diyor mu? Önce Keyword Planner ile ücretsiz arama hacmi, sonra 2–3 hafta × 7 €/gün test.
- **Konum (2026-11-21 güncellendi):** Stuttgart (Stadtkreis) + Landkreis Esslingen + Rems-Murr-Kreis (Waiblingen, Backnang, Schorndorf). Konum raporu Stadt/Kreis bazında ayrı okunur. Ayar "**Präsenz**" ("Personen an diesem Ort", "Interesse" değil). Ludwigsburg / Böblingen ileride opsiyon.
- **Dil:** Deutsch
- **Zamanlama:** Mo–Fr 07–19 Uhr (B2B karar vericiler)
- **Teklif:** Manuelle CPC, kelime bazlı en düşük teklif (taban fiyat testi). Automatisch angewendete Empfehlungen, AI Max, Search Partner, Display kapalı.

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

## 8. Keyword Planner sonucu (2026-11-21, hesap 380-990-5237)

Kaynak: Keyword Planner "Plan geçmiş metrikleri", Kas 2025 – Eki 2026. Harcaması olmayan yeni hesap → hacimler
**kova** halinde (CSV'de "50" = UI'da "10–100", boş/0 = <10). Kesin rakamlar kampanya yayına girince açılır.
Konumlar şehir bazında indirildi (Stuttgart, Esslingen am Neckar, Waiblingen), Landkreis değil.

| Kelime | Stuttgart | Esslingen | Waiblingen | Sayfa üstü teklif (Stuttgart, düşük–yüksek) | Rekabet |
|---|---|---|---|---|---|
| automatenaufsteller | 10–100 | 10–100 | 10–100 | **0,98 – 2,56 €** | Düşük |
| automatenaufsteller stuttgart | 10–100 | 10–100 | 10–100 | – | Düşük |
| automatenaufsteller waiblingen | 10–100 | <10 | <10 | – | Düşük |
| automaten stuttgart | 10–100 | 10–100 | <10 | – | Düşük |
| getränkeautomat mieten | 10–100 | 10–100 | 10–100 | 1,31 – 7,22 € | Yüksek |
| snackautomat mieten | 10–100 | 10–100 | 10–100 | 2,04 – 7,16 € | Yüksek |
| snackautomat für firmen | 10–100 | 10–100 | 10–100 | 4,40 – 11,90 € | Yüksek |
| kaffeeautomat firma | 10–100 | 10–100 | 10–100 | 3,94 – 16,07 € | Orta/Yüksek |
| getränkeautomat firma / büro, snackautomat firma / büro, automatenservice, getränke-/kaffeeautomat aufstellen lassen, verpflegungsautomat | 10–100 | <10 | <10 | – | karışık |
| automat für firma, automat krankenhaus, automaten aufstellen lassen, snackautomat aufstellen lassen, snackautomat schule, pausenverpflegung mitarbeiter, verkaufsautomat firma | <10 | <10 | <10 | – | – |

**Yorum (pazar potansiyeli):**
- Talep var ama küçük: bölgede toplam ayda kabaca birkaç yüz arama (kova yüzünden kesin değil). Okul/klinik/"aufstellen lassen" gibi uzun kombinasyonlar neredeyse hiç aranmıyor → insanlar genel arıyor.
- "automatenaufsteller" = en iyi fırsat: niyet net, rekabet düşük, en ucuz (≈1 €).
- "snackautomat für firmen" ve "kaffeeautomat firma" için rakipler 4–16 € ödüyor → para kazanan rakipler var (pazar sinyali), ama 50 €'luk test için çok pahalı.
- "mieten" aramaları firmalardan da gelir, etkinlik/parti kiralamalarından da → negatiflerle süzülmeli.

## 9. Test kampanyası – kurulum spesifikasyonu (markttest-1)

- **Tip:** Arama, hedefsiz ("Hedef olmadan kampanya oluşturun"), sadece Google Arama. Search Partner ✖, Display ✖, AI Max ✖.
- **Konum:** Stuttgart + Landkreis Esslingen + Rems-Murr-Kreis · Seçenek: "Varlık" (hedef konumda bulunan / düzenli bulunan kişiler).
- **Dil:** Almanca · **Zamanlama:** Pzt–Cum 07:00–19:00 · **Başlangıç/bitiş:** yayın günü + 7 gün.
- **Bütçe:** günlük 7 € (kullanıcı kararı), 21.11.–27.11.2026 = 7 gün (Pzt–Paz 07–19, kullanıcı: "bugünden başlasın"), bitiş tarihinde otomatik durur · net ≈49 €, MwSt ile ≈58 € · **Teklif:** Manuel TBM, maks. 0,50 €.
- **Son ek (Final URL suffix):** `utm_source=google&utm_medium=cpc&utm_campaign=markttest-1`
- **Otomatik uygulanan öneriler:** kapalı · **Otomatik oluşturulan öğeler:** kapalı.

**Reklam grubu 1 – Aufsteller** → `https://snackora.de/fuer-unternehmen` · başlangıç teklifi **0,50 €** (kullanıcı kararı 2026-11-21)

```
"automatenaufsteller"
[automatenaufsteller stuttgart]
[automatenaufsteller esslingen]
[automatenaufsteller waiblingen]
"automaten aufstellen lassen"
"snackautomat aufstellen lassen"
"getränkeautomat aufstellen lassen"
```

**Reklam grubu 2 – Firma/Mieten** → `https://snackora.de/automaten` · başlangıç teklifi **0,50 €** (kullanıcı kararı 2026-11-21)

```
"snackautomat mieten"
"getränkeautomat mieten"
[snackautomat für firmen]
[snackautomat firma]
[getränkeautomat firma]
[getränkeautomat büro]
[snackautomat büro]
```

Bilerek dışarıda: kaffeeautomat firma (çok pahalı), automatenservice (servis/tamir karışık), automaten stuttgart (çok genel).

**Negatif kelimeler (kampanya):**

```
kaufen, gebraucht, ebay, kleinanzeigen, selber, selbst bauen, diy,
reparatur, ersatzteile, münzprüfer, schlüssel, aufbrechen, defekt, bedienungsanleitung,
job, jobs, stellenangebot, ausbildung, gehalt, fahrer, minijob,
franchise, nebenberuflich, passives einkommen, geschäftsidee, werden, selbstständig,
verdienst, lohnt sich, erfahrungen, gewerbe anmelden, business,
zigarettenautomat, kondomautomat, pfandautomat, fahrkartenautomat, geldautomat,
spielautomat, casino, glücksspiel, kaugummiautomat, kapselautomat,
miniatur, spielzeug, lego, kinder, privat, zuhause, mini,
party, hochzeit, geburtstag, event, feier, festival, wochenende,
hersteller, großhandel, hack, trick
```

**Duyarlı arama reklamı (iki grupta da aynı, grup 1'de 1. başlık sabitlenebilir):**

Başlıklar (≤30): Automatenaufsteller Stuttgart · Snackautomat für Ihre Firma · Getränkeautomat für Betriebe ·
Region Esslingen & Waiblingen · Jetzt unverbindlich anfragen · Inhabergeführt & regional ·
Für Büro, Produktion & Lager · Sortiment individuell geplant · Snackora – Deine Pause

Açıklamalar (≤90):
- Snack- & Getränkeautomaten für Unternehmen in Stuttgart, Esslingen und Waiblingen.
- Standort und Sortiment stimmen wir persönlich mit Ihnen ab. Jetzt unverbindlich anfragen.
- Für Büros, Produktion, Werkstätten und Fitnessstudios. Inhabergeführt und regional.

Kural: sitede doğrulanmayan vaat yok ("kostenlos", "24/7", "befüllen & warten" vb. kullanılmadı).

**Teklif merdiveni:** Gün 1–2 dokunma. Gün 3+: gösterim yok + "Sıralama nedeniyle kaybedilen gösterim payı" yüksek → +0,20 €.
"Düşük arama hacmi" → teklife dokunma. Alakasız arama terimi → negatif. Üst sınır: grup 1 1,50 €, grup 2 2,00 €.

## 10. Değişiklik günlüğü (markttest-1)

| Tarih | Değişiklik | Sebep |
|---|---|---|
| 2026-11-21 | Kampanya yayına alındı (7 €/gün, maks. TBM 0,50 €, 21.–27.11., her gün 07–19) | Kullanıcı onayı |
| 2026-11-22 | Reklamlar onaylandı (reklam gücü "Ortalama"). "automatenaufsteller esslingen/waiblingen" = düşük arama hacmi | Google incelemesi |
| 2026-11-22 | "automatenaufsteller" (phrase) + "automatenaufsteller stuttgart" (exact) teklifi 0,50 → **0,75 €** | Reklam önizleme: "düşük reklam sıralaması". Kullanıcı kararı: önce 0,75 €, olmazsa 0,90 € |
| 2026-11-22 | automaten / snackautomat / getränkeautomat aufstellen lassen (phrase), snackautomat firma, getränkeautomat firma (exact) → **0,75 €** | Kullanıcı onayı. mieten ×2, für firmen, büro ×2 = 0,50 € kaldı (rekabet yüksek / önce sonuç); esslingen/waiblingen = düşük hacim, dokunulmadı |
| 2026-11-22 | Google ilk sayfa tahminleri geldi (automatenaufsteller 3,59 €; stuttgart 0,08 €; snackautomat aufstellen lassen 0,33 €; snackautomat firma 0,45 €; automaten/getränkeautomat aufstellen lassen 0,84 €; mieten/büro/für firmen/getränkeautomat firma 2–6 €) | Pazar 12:22, henüz 0 gösterim |
| 2026-11-22 | Teklifler dip fiyata göre: stuttgart 0,30 · snackautomat aufstellen lassen 0,45 · snackautomat firma 0,65 · automaten/getränkeautomat aufstellen lassen 0,95 · **automatenaufsteller 2,00 €** | Kullanıcı onayı (3,60 yerine 2,00 €) |
| 2026-11-22 | +9 keyword (phrase, 0,50 €): automatenaufstellung, verkaufsautomat aufstellen lassen, kaffeeautomat aufstellen lassen (→ /automaten/kaffeeautomaten), verpflegungsautomat, automat kostenlos aufstellen, snackautomat kostenlos, getränkeautomat kostenlos, automat für mitarbeiter, mitarbeiterverpflegung automat · +13 negatif (genehmigung, steuer, versicherung, standortsuche, "standort finden", "aufstellplatz gesucht", rechtliches, abzugeben, verschenken, "zu verschenken", spiele, app, download) → 23 keyword, 73 negatif | Kullanıcı onayı |
| 2026-11-22 | **İş modeli doğrulandı (kullanıcı):** kurulum firma için ücretsiz, işletme (dolum/servis) Snackora'da. RSA'lara eklendi: "Kostenlose Aufstellung", "Automat kostenlos aufstellen", "Betrieb & Befüllung durch uns" + açıklama "Wir stellen den Automaten kostenlos auf und kümmern uns um Befüllung und Service." (12 başlık / 4 açıklama) → yeniden inceleme | Kullanıcı onayı |
