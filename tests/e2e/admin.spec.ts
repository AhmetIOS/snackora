import { expect, test } from "@playwright/test";

// ADMIN_PASSWORD / ADMIN_SESSION_SECRET are set for the e2e build in playwright.config.ts.
// Google is not reachable from the test build, so data sections show their error state.
const PASSWORD = "e2e-admin-password";

test("admin page is protected, not indexable and not tracked", async ({ page }) => {
  const res = await page.goto("/admin");
  expect(res?.headers()["x-robots-tag"]).toContain("noindex");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("heading", { name: "Yönetim paneli" })).toBeVisible();
  await expect(page.getByText("Ziyaretçi istatistikleri")).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Datenschutz-Einstellungen" })).toHaveCount(0);
});

test("wrong password shows an error, correct password opens the dashboard and logout works", async ({ page, context }) => {
  await page.goto("/admin");
  await page.getByLabel("Şifre").fill("falsch");
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await expect(page.locator("#login-error")).toHaveText("Şifre yanlış.");

  await page.getByLabel("Şifre").fill(PASSWORD);
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await expect(page.getByRole("heading", { name: "Ziyaretçi istatistikleri" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Zaman aralığı" }).getByRole("link", { name: "28 gün" })).toHaveAttribute("aria-current", "page");

  const cookie = (await context.cookies()).find((c) => c.name === "snackora_admin");
  expect(cookie).toMatchObject({ httpOnly: true, sameSite: "Strict", path: "/admin" });

  await page.getByRole("navigation", { name: "Zaman aralığı" }).getByRole("link", { name: "7 gün" }).click();
  await expect(page).toHaveURL(/range=7/);
  await expect(page.getByRole("navigation", { name: "Zaman aralığı" }).getByRole("link", { name: "7 gün" })).toHaveAttribute("aria-current", "page");

  await page.getByRole("button", { name: "Çıkış" }).click();
  await expect(page.getByLabel("Şifre")).toBeVisible();
  expect((await context.cookies()).find((c) => c.name === "snackora_admin")).toBeUndefined();
});

test("a forged session cookie is rejected", async ({ page, context }) => {
  await context.addCookies([{ name: "snackora_admin", value: `${Math.floor(Date.now() / 1000) + 3600}.forged`, url: "http://localhost:3210/admin" }]);
  await page.goto("/admin");
  await expect(page.getByLabel("Şifre")).toBeVisible();
});
