import { expect, test, type Page } from "@playwright/test";

// Fresh visitor: no stored decision (overrides the "declined" default in playwright.config.ts).
test.use({ storageState: { cookies: [], origins: [] } });

const GA_ID = "G-E2ETEST000";

/** Intercepts gtag.js – nothing is sent to Google. Returns the list of requested GA URLs. */
async function stubGoogle(page: Page) {
  const requests: string[] = [];
  await page.route(/googletagmanager\.com|google-analytics\.com/, async (route) => {
    requests.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "text/javascript", body: "window.__gtagLoaded = true;" });
  });
  return requests;
}

/** gtag() calls as plain arrays, e.g. ["event", "generate_lead", {...}] */
async function gtagCalls(page: Page) {
  return page.evaluate(() => ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).map((a) => Array.from(a)));
}

const banner = (page: Page) => page.getByRole("dialog", { name: "Datenschutz-Einstellungen" });

test("banner offers equal choices and loads nothing before a decision", async ({ page }) => {
  const requests = await stubGoogle(page);
  await page.goto("/");
  await expect(banner(page)).toBeVisible();
  await expect(banner(page).getByRole("button", { name: "Ablehnen" })).toBeVisible();
  await expect(banner(page).getByRole("button", { name: "Akzeptieren" })).toBeVisible();
  await expect(banner(page).getByRole("link", { name: "Mehr erfahren" })).toHaveAttribute("href", "/datenschutz#cookies");
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => document.cookie)).toBe("");
});

test("declining hides the banner permanently and never loads Google Analytics", async ({ page }) => {
  const requests = await stubGoogle(page);
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Ablehnen" }).click();
  await expect(banner(page)).toBeHidden();
  await page.reload();
  await page.goto("/automaten");
  await expect(banner(page)).toBeHidden();
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);
});

test("accepting loads gtag.js once with ads features disabled", async ({ page }) => {
  const requests = await stubGoogle(page);
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Akzeptieren" }).click();
  await expect(banner(page)).toBeHidden();
  await expect.poll(() => requests.filter((u) => u.includes("gtag/js")).length).toBe(1);
  expect(requests[0]).toContain(`id=${GA_ID}`);
  const calls = await gtagCalls(page);
  expect(calls).toContainEqual(["consent", "default", expect.objectContaining({ ad_storage: "denied", analytics_storage: "granted" })]);
  expect(calls).toContainEqual(["config", GA_ID, expect.objectContaining({ allow_google_signals: false, allow_ad_personalization_signals: false })]);
  // client-side navigation must not load the script again
  await page.locator("footer").getByRole("link", { name: "Übersicht" }).click();
  await expect(page).toHaveURL(/\/automaten$/);
  expect(requests.filter((u) => u.includes("gtag/js")).length).toBe(1);
});

test("consent can be withdrawn from the footer", async ({ page }) => {
  await stubGoogle(page);
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Akzeptieren" }).click();
  await page.locator("footer").getByRole("button", { name: "Cookie-Einstellungen" }).click();
  await expect(banner(page)).toBeVisible();
  const stats = banner(page).getByRole("switch", { name: /Statistik/ });
  await expect(stats).toHaveAttribute("aria-checked", "true");
  await stats.click();
  await banner(page).getByRole("button", { name: "Auswahl speichern" }).click();
  await expect(banner(page)).toBeHidden();
  expect(await page.evaluate((id) => (window as unknown as Record<string, unknown>)[`ga-disable-${id}`], GA_ID)).toBe(true);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("snackora-consent") ?? "{}"));
  expect(stored.analytics).toBe(false);
});

test("a successful inquiry is tracked once as generate_lead without form contents", async ({ page }) => {
  await stubGoogle(page);
  await page.route("**/api/inquiry", (route) => route.fulfill({ status: 200, json: { ok: true, inquiryId: "SNK-261021-TEST1" } }));
  await page.goto("/anfrage?anliegen=standort");
  await banner(page).getByRole("button", { name: "Akzeptieren" }).click();

  const field = (name: string) => page.getByRole("textbox", { name, exact: true });
  await expect(page.getByRole("radio", { name: "Standort anbieten" })).toBeChecked();
  await field("Name").fill("Erika Musterfrau");
  await field("E-Mail").fill("erika@example.com");
  await field("Postleitzahl").fill("73728");
  await field("Ort").fill("Esslingen");
  await field("Nachricht").fill("Wir haben einen Pausenraum mit Platz für einen Automaten.");
  await page.getByRole("checkbox").check();
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: /Anfrage unverbindlich senden/ }).click();
  await expect(page.getByText("SNK-261021-TEST1")).toBeVisible();

  const events = (await gtagCalls(page)).filter((c) => c[0] === "event");
  expect(events.filter((e) => e[1] === "generate_lead")).toEqual([["event", "generate_lead", { form_name: "anfrage", lead_type: "standort" }]]);
  expect(events.filter((e) => e[1] === "standortanfrage_submit")).toHaveLength(1);
  expect(JSON.stringify(events)).not.toMatch(/Erika|example\.com|73728|Esslingen/);
});

test("privacy policy describes Google Analytics when it is enabled", async ({ page }) => {
  await page.goto("/datenschutz");
  await expect(page.getByRole("heading", { name: "Google Analytics 4" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cookie-Einstellungen öffnen" })).toBeVisible();
});
