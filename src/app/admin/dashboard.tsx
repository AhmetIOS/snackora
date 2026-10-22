import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, LogOut, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { RANGES, RANGE_ORDER, type DashboardData, type RangeKey, type Section } from "@/lib/admin/analytics";
import { cn } from "@/lib/utils";
import { logout } from "./actions";
import { VisitsChart, type ChartPoint } from "./visits-chart";

const fmt = new Intl.NumberFormat("tr-TR");
const pct = new Intl.NumberFormat("tr-TR", { style: "percent", maximumFractionDigits: 1 });
const BAR = "#3b8f63";
const TZ = "Europe/Berlin";

const RANGE_LABEL: Record<RangeKey, string> = { heute: "Bugün", "7": "7 gün", "28": "28 gün", "90": "90 gün" };
const CHANNEL: Record<string, string> = {
  Direct: "Doğrudan",
  "Organic Search": "Organik arama (Google vb.)",
  Referral: "Yönlendiren siteler",
  "Organic Social": "Sosyal medya",
  "Paid Search": "Ücretli arama",
  Email: "E-posta",
  Unassigned: "Belirlenemedi",
};
const DEVICE: Record<string, string> = { desktop: "Masaüstü", mobile: "Mobil", tablet: "Tablet" };
const EVENT: Record<string, { label: string; hint: string }> = {
  generate_lead: { label: "Satış talepleri", hint: "Anfrage + Standort formları (key event)" },
  standortanfrage_submit: { label: "Yer önerileri", hint: "Otomat yeri teklifleri" },
  kontakt_submit: { label: "İletişim mesajları", hint: "Kontakt formu" },
  click_email: { label: "E-posta tıklamaları", hint: "mailto bağlantıları" },
  click_phone: { label: "Telefon tıklamaları", hint: "tel bağlantıları" },
};

/* ── time helpers (property time zone: Europe/Berlin) ── */
const berlinParts = (d: Date) =>
  Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" })
      .formatToParts(d)
      .map((p) => [p.type, p.value])
  ) as Record<string, string>;
const ymd = (d: Date) => {
  const p = berlinParts(d);
  return `${p.year}${p.month}${p.day}`;
};
const dayLabel = (key: string) => `${key.slice(6, 8)}.${key.slice(4, 6)}.${key.slice(0, 4)}`;
const hourLabel = (key: string) => `${key.slice(6, 8)}.${key.slice(4, 6)}. ${key.slice(8, 10)}:00`;

function chartPoints(data: DashboardData): ChartPoint[] {
  if (!data.series.ok) return [];
  const byKey = new Map(data.series.data.points.map((p) => [p.key, p]));
  const now = new Date();
  const keys: string[] = [];
  if (data.series.data.granularity === "hour") {
    const p = berlinParts(now);
    for (let h = 0; h <= Number(p.hour); h++) keys.push(`${p.year}${p.month}${p.day}${String(h).padStart(2, "0")}`);
  } else {
    for (let i = RANGES[data.range] - 1; i >= 0; i--) keys.push(ymd(new Date(now.getTime() - i * 864e5)));
  }
  const hourly = data.series.data.granularity === "hour";
  return keys.map((k) => {
    const p = byKey.get(k);
    return {
      label: hourly ? hourLabel(k) : dayLabel(k),
      short: hourly ? `${k.slice(8, 10)}:00` : `${k.slice(6, 8)}.${k.slice(4, 6)}.`,
      users: p?.users ?? 0,
      sessions: p?.sessions ?? 0,
      views: p?.views ?? 0,
    };
  });
}

/* ── building blocks ── */

function Card({ title, subtitle, children, className }: { title: string; subtitle?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-panel border border-line bg-paper p-5 sm:p-6", className)}>
      <h2 className="font-display text-xl">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-ink/65">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Failed({ error }: { error: string }) {
  return <p className="rounded-key bg-error-soft p-3 text-sm text-error">Veri alınamadı: {error}</p>;
}
const Empty = ({ children = "Bu dönem için henüz veri yok." }: { children?: ReactNode }) => <p className="text-sm text-ink/60">{children}</p>;

function SectionView<T>({ section, children, isEmpty }: { section: Section<T>; children: (data: T) => ReactNode; isEmpty?: (data: T) => boolean }) {
  if (!section.ok) return <Failed error={section.error} />;
  if (isEmpty?.(section.data)) return <Empty />;
  return <>{children(section.data)}</>;
}

function Delta({ current, previous, label }: { current: number; previous: number; label: string }) {
  if (!previous && !current) return <span className="text-xs text-ink/55">{label}: veri yok</span>;
  if (!previous) return <span className="text-xs text-ink/55">{label}: yeni</span>;
  const change = (current - previous) / previous;
  const Icon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", change > 0 ? "text-success" : change < 0 ? "text-error" : "text-ink/60")}>
      <Icon className="size-3.5" aria-hidden="true" />
      {change > 0 ? "+" : ""}
      {pct.format(change)} <span className="font-normal text-ink/55">{label}</span>
    </span>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta?: ReactNode }) {
  return (
    <div className="rounded-panel border border-line bg-paper p-4 sm:p-5">
      <p className="text-sm text-ink/65">{label}</p>
      <p className="mt-1 font-sans text-3xl font-semibold tracking-tight">{value}</p>
      {delta ? <p className="mt-1">{delta}</p> : null}
    </div>
  );
}

function BarTable({ rows, head }: { rows: { label: ReactNode; value: number; extra?: ReactNode }[]; head: [string, string] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <table className="w-full text-left text-sm">
      <thead className="text-ink/55">
        <tr>
          <th className="pb-2 font-medium">{head[0]}</th>
          <th className="pb-2 text-right font-medium">{head[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-line">
            <td className="py-2 pr-3">
              <span className="block break-all">{r.label}</span>
              <span aria-hidden="true" className="mt-1 block h-1.5 rounded-r-[4px]" style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, background: BAR }} />
            </td>
            <td className="py-2 text-right align-top font-semibold tabular-nums">
              {fmt.format(r.value)}
              {r.extra ? <span className="block text-xs font-normal text-ink/55">{r.extra}</span> : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const place = (v: string) => (!v || v === "(not set)" ? "Bilinmiyor" : v);
const duration = (s: number) => `${Math.floor(s / 60)} dk ${Math.round(s % 60)} sn`;

/* ── page ── */

export function Dashboard({ data }: { data: DashboardData }) {
  const prevLabel = data.range === "heute" ? "dünkü güne göre" : "önceki döneme göre";
  const points = chartPoints(data);
  const updated = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" }).format(new Date(data.generatedAt));

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="slot-label text-muted">Snackora · Yönetim paneli</p>
          <h1 className="mt-2 text-4xl">Ziyaretçi istatistikleri</h1>
          <p className="mt-2 text-sm text-ink/65">Son güncelleme: {updated} (Almanya saati)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Zaman aralığı" className="flex rounded-key border border-line bg-paper p-1">
            {RANGE_ORDER.map((r) => (
              <Link
                key={r}
                href={`/admin?range=${r}`}
                aria-current={r === data.range ? "page" : undefined}
                className={cn(
                  "rounded-[10px] px-3 py-2 text-sm font-semibold",
                  r === data.range ? "bg-forest text-cream" : "text-ink/75 hover:bg-sand"
                )}
              >
                {RANGE_LABEL[r]}
              </Link>
            ))}
          </nav>
          <form action={logout}>
            <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-key border border-line px-3 text-sm font-semibold hover:bg-sand">
              <LogOut className="size-4" aria-hidden="true" /> Çıkış
            </button>
          </form>
        </div>
      </header>

      <div className="rounded-key border border-dashed border-ink/25 p-4 text-sm text-ink/75">
        Yalnızca çerez onayı veren ziyaretçiler ölçülür. Kişisel veriler (isim, e-posta, IP) toplanmaz ve gösterilmez; Google
        Analytics standart raporları 24–48 saat, Search Console verileri 2–3 gün gecikmeli gelir.
      </div>

      {/* KPI row */}
      <SectionView section={data.totals}>
        {({ current: c, previous: p }) => (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Stat label="Kullanıcılar" value={fmt.format(c.users)} delta={<Delta current={c.users} previous={p.users} label={prevLabel} />} />
            <Stat label="Yeni kullanıcılar" value={fmt.format(c.newUsers)} delta={<Delta current={c.newUsers} previous={p.newUsers} label={prevLabel} />} />
            <Stat label="Oturumlar" value={fmt.format(c.sessions)} delta={<Delta current={c.sessions} previous={p.sessions} label={prevLabel} />} />
            <Stat label="Sayfa görüntüleme" value={fmt.format(c.views)} delta={<Delta current={c.views} previous={p.views} label={prevLabel} />} />
            <Stat label="Ort. oturum süresi" value={c.sessions ? duration(c.avgSessionSeconds) : "–"} />
          </div>
        )}
      </SectionView>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          title={data.range === "heute" ? "Bugün saat saat kullanıcılar" : "Günlük kullanıcılar"}
          subtitle="Üzerine gelin veya ok tuşlarıyla gezin"
          className="lg:col-span-2"
        >
          <SectionView section={data.series}>{() => <VisitsChart points={points} title="Kullanıcı sayısı zaman içinde" />}</SectionView>
        </Card>

        <Card title="Şu anda sitede" subtitle="Son 30 dakika (gerçek zamanlı)">
          <SectionView section={data.realtime}>
            {(rt) => (
              <>
                <p className="font-sans text-5xl font-semibold tracking-tight">{fmt.format(rt.activeUsers)}</p>
                <p className="text-sm text-ink/65">aktif kullanıcı</p>
                {rt.pages.length ? (
                  <ul className="mt-4 divide-y divide-line text-sm">
                    {rt.pages.map((pg) => (
                      <li key={pg.title} className="flex justify-between gap-3 py-2">
                        <span className="min-w-0 truncate">{pg.title}</span>
                        <span className="font-semibold tabular-nums">{fmt.format(pg.users)}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            )}
          </SectionView>
        </Card>
      </div>

      {/* Leads */}
      <Card title="Talepler ve iletişim" subtitle="Yalnızca sunucunun onayladığı başarılı gönderimler sayılır">
        <SectionView section={data.events}>
          {(events) => (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {events.map((e) => (
                <div key={e.name} className={cn("rounded-key border p-4", e.name === "generate_lead" ? "border-forest bg-lime-soft/60" : "border-line")}>
                  <p className="text-sm font-semibold">{EVENT[e.name]?.label ?? e.name}</p>
                  <p className="mt-1 font-sans text-3xl font-semibold tabular-nums">{fmt.format(e.current)}</p>
                  <p className="mt-1">
                    <Delta current={e.current} previous={e.previous} label={prevLabel} />
                  </p>
                  <p className="mt-2 text-xs text-ink/55">{EVENT[e.name]?.hint}</p>
                </div>
              ))}
            </div>
          )}
        </SectionView>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Ziyaretçiler nereden geliyor?" subtitle="Kanal (oturum)">
          <SectionView section={data.channels} isEmpty={(d) => !d.length}>
            {(rows) => <BarTable head={["Kanal", "Oturum"]} rows={rows.map((r) => ({ label: CHANNEL[r.name] ?? r.name, value: r.sessions, extra: `${fmt.format(r.users)} kullanıcı` }))} />}
          </SectionView>
        </Card>
        <Card title="Kaynak / araç" subtitle="ör. google / organic, chatgpt.com / referral">
          <SectionView section={data.sources} isEmpty={(d) => !d.length}>
            {(rows) => <BarTable head={["Kaynak", "Oturum"]} rows={rows.map((r) => ({ label: r.name, value: r.sessions }))} />}
          </SectionView>
        </Card>
        <Card title="En çok ziyaret edilen sayfalar">
          <SectionView section={data.pages} isEmpty={(d) => !d.length}>
            {(rows) => <BarTable head={["Sayfa", "Görüntüleme"]} rows={rows.map((r) => ({ label: r.path, value: r.views, extra: `${fmt.format(r.users)} kullanıcı` }))} />}
          </SectionView>
        </Card>
        <Card title="Şehirler" subtitle="IP'den yaklaşık konum (Google tarafından)">
          <SectionView section={data.cities} isEmpty={(d) => !d.length}>
            {(rows) => (
              <BarTable
                head={["Şehir", "Kullanıcı"]}
                rows={rows.map((r) => ({ label: `${place(r.city)}${r.country && r.country !== "(not set)" ? ` · ${r.country}` : ""}`, value: r.users }))}
              />
            )}
          </SectionView>
        </Card>
        <Card title="Cihazlar">
          <SectionView section={data.devices} isEmpty={(d) => !d.length}>
            {(rows) => <BarTable head={["Cihaz", "Kullanıcı"]} rows={rows.map((r) => ({ label: DEVICE[r.name] ?? r.name, value: r.users }))} />}
          </SectionView>
        </Card>
        <Card title="Google aramaları" subtitle="Search Console · en az son 7 gün">
          <SectionView section={data.search}>
            {(s) => (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Tıklama" value={fmt.format(s.clicks)} />
                  <Stat label="Gösterim" value={fmt.format(s.impressions)} />
                  <Stat label="CTR" value={s.impressions ? pct.format(s.ctr) : "–"} />
                  <Stat label="Ort. sıra" value={s.position ? s.position.toFixed(1) : "–"} />
                </div>
                <div className="mt-4">
                  {s.queries.length ? (
                    <BarTable head={["Arama sorgusu", "Gösterim"]} rows={s.queries.map((q) => ({ label: q.query, value: q.impressions, extra: `${q.clicks} tık · sıra ${q.position.toFixed(1)}` }))} />
                  ) : (
                    <Empty>Henüz arama verisi yok – Google sayfaları indeksledikçe burada görünür.</Empty>
                  )}
                </div>
              </>
            )}
          </SectionView>
        </Card>
      </div>

      <Card title="Ziyaret günlüğü" subtitle="Anonim: saat, şehir, kaynak, giriş sayfası ve cihaza göre gruplanmış oturumlar (kişi bilgisi yok)">
        <SectionView section={data.visits} isEmpty={(d) => !d.length}>
          {(rows) => (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="text-ink/55">
                  <tr>
                    <th className="pb-2 font-medium">Zaman</th>
                    <th className="pb-2 font-medium">Şehir</th>
                    <th className="pb-2 font-medium">Kaynak</th>
                    <th className="pb-2 font-medium">Giriş sayfası</th>
                    <th className="pb-2 font-medium">Cihaz</th>
                    <th className="pb-2 text-right font-medium">Oturum</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="py-2 pr-3 whitespace-nowrap tabular-nums">{hourLabel(r.hour)}</td>
                      <td className="py-2 pr-3">{place(r.city)}</td>
                      <td className="py-2 pr-3">{r.source}</td>
                      <td className="py-2 pr-3 break-all">{r.landing}</td>
                      <td className="py-2 pr-3">{DEVICE[r.device] ?? r.device}</td>
                      <td className="py-2 text-right tabular-nums">{fmt.format(r.sessions)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionView>
      </Card>
    </div>
  );
}
