import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/automaten",
  "/automaten/snackautomaten",
  "/automaten/getraenkeautomaten",
  "/automaten/kombiautomaten",
  "/fuer-unternehmen",
  "/standort-anbieten",
  "/ueber-uns",
  "/anfrage",
  "/kontakt",
  "/faq",
  "/impressum",
  "/datenschutz",
];

test.describe("routes", () => {
  for (const route of routes) {
    test(`${route} renders with one h1, legal links and no overflow`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("html")).toHaveAttribute("lang", "de-DE");
      const footer = page.locator("footer");
      await expect(footer.getByRole("link", { name: "Impressum" })).toHaveAttribute("href", "/impressum");
      await expect(footer.getByRole("link", { name: "Datenschutz" })).toHaveAttribute("href", "/datenschutz");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }

  test("unknown routes show the branded 404 page", async ({ page }) => {
    const res = await page.goto("/diese-seite-gibt-es-nicht");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Dieses Fach ist leider leer.");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("all internal links resolve", async ({ page, request }) => {
    const hrefs = new Set<string>();
    for (const route of routes) {
      await page.goto(route);
      for (const href of await page.locator("a[href^='/']").evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? "")))
        hrefs.add(href.split("#")[0]!.split("?")[0] || "/");
    }
    for (const href of hrefs) {
      const res = await request.get(href);
      expect(res.status(), href).toBe(200);
    }
  });
});

test.describe("desktop navigation", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");

  test("main navigation reaches every section", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Hauptnavigation" });
    for (const [label, path] of [
      ["Automaten", "/automaten"],
      ["Für Unternehmen", "/fuer-unternehmen"],
      ["Standort anbieten", "/standort-anbieten"],
      ["Über uns", "/ueber-uns"],
      ["Kontakt", "/kontakt"],
    ] as const) {
      await nav.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(path);
      await expect(nav.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
    }
    await page.getByRole("banner").getByRole("link", { name: "Jetzt anfragen" }).click();
    await expect(page).toHaveURL("/anfrage");
  });

  test("skip link moves focus to the main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Zum Inhalt springen" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#inhalt$/);
  });
});

test.describe("mobile navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("menu opens as a modal dialog, closes with Escape and on navigation", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Menü öffnen" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Menü" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await dialog.getByRole("link", { name: "Getränkeautomaten" }).click();
    await expect(page).toHaveURL("/automaten/getraenkeautomaten");
    await expect(dialog).toBeHidden();

    // returning via history must not resurrect an open menu
    await page.goBack();
    await expect(page.getByRole("dialog", { name: "Menü" })).toBeHidden();
  });
});

test("FAQ accordion is operable with the keyboard", async ({ page }) => {
  await page.goto("/faq");
  const first = page.locator("details").first();
  await first.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(first).toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(first).not.toHaveAttribute("open", "");
});

test("SEO essentials are present", async ({ page, request }) => {
  await page.goto("/automaten/snackautomaten");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://snackora.de/automaten/snackautomaten");
  await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute("content", /opengraph-image/);
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(jsonLd.join()).toContain('"BreadcrumbList"');
  expect(jsonLd.join()).toContain('"Service"');
  expect(jsonLd.join()).not.toContain("LocalBusiness");

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("<loc>https://snackora.de/standort-anbieten</loc>");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: https://snackora.de/sitemap.xml");
});

test("security headers are sent", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-powered-by"]).toBeUndefined();
});
