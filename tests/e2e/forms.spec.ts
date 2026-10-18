import { expect, test, type Page } from "@playwright/test";

// No real e-mails: success/failure paths are mocked at the network layer.

const field = (page: Page, name: string) => page.getByRole("textbox", { name, exact: true });

async function fillAnfrage(page: Page) {
  await field(page, "Name").fill("Erika Musterfrau");
  await field(page, "E-Mail").fill("erika@example.com");
  await field(page, "Postleitzahl").fill("73728");
  await field(page, "Ort").fill("Esslingen");
  await field(page, "Nachricht").fill("Wir haben rund 80 Mitarbeitende und suchen eine Lösung für den Pausenraum.");
  await page.getByRole("checkbox").check();
  // the server rejects submissions faster than a human (bot heuristic)
  await page.waitForTimeout(2600);
}

test("required fields are validated inline and announced", async ({ page }) => {
  await page.goto("/anfrage");
  await page.getByRole("button", { name: /Anfrage unverbindlich senden/ }).click();
  const name = field(page, "Name");
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toBeFocused();
  await expect(page.getByText("Bitte geben Sie Ihren Namen an.")).toBeVisible();
  await expect(page.getByText(/Bitte bestätigen Sie, dass Sie die Datenschutzhinweise/)).toBeVisible();

  await field(page, "Postleitzahl").fill("123");
  await field(page, "Postleitzahl").blur();
  await expect(page.getByText("Bitte geben Sie eine fünfstellige Postleitzahl an.")).toBeVisible();
});

test("privacy checkbox is not pre-checked and links to the policy", async ({ page }) => {
  await page.goto("/kontakt");
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await expect(page.getByRole("link", { name: /Datenschutzhinweise/ })).toHaveAttribute("href", "/datenschutz");
});

test("query parameters prefill the machine type", async ({ page }) => {
  await page.goto("/anfrage?automat=getraenkeautomat");
  await expect(page.getByRole("radio", { name: "Getränkeautomat" })).toBeChecked();
});

test("successful submission shows confirmation with inquiry id", async ({ page }) => {
  let payload: Record<string, unknown> | null = null;
  await page.route("**/api/inquiry", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({ status: 200, json: { ok: true, inquiryId: "SNK-261018-TEST1" } });
  });
  await page.goto("/anfrage");
  await fillAnfrage(page);
  await page.getByRole("button", { name: /Anfrage unverbindlich senden/ }).click();
  await expect(page.getByRole("heading", { name: /Ihre Anfrage ist bei uns eingegangen/ })).toBeFocused();
  await expect(page.getByText("SNK-261018-TEST1")).toBeVisible();
  expect(payload).toMatchObject({
    form: "anfrage",
    fields: { name: "Erika Musterfrau", postalCode: "73728", privacy: true },
    meta: { website: "" },
  });
});

test("failed delivery keeps the entered data and allows a retry", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/inquiry", async (route) => {
    calls += 1;
    if (calls === 1) {
      await route.fulfill({
        status: 502,
        json: { ok: false, error: "delivery_failed", message: "Ihre Anfrage konnte gerade nicht zugestellt werden." },
      });
    } else {
      await route.fulfill({ status: 200, json: { ok: true, inquiryId: "SNK-261018-RETRY" } });
    }
  });
  await page.goto("/anfrage");
  await fillAnfrage(page);
  await page.getByRole("button", { name: /Anfrage unverbindlich senden/ }).click();
  const alert = page.getByRole("alert").filter({ hasText: "Senden fehlgeschlagen" });
  await expect(alert).toBeVisible();
  await expect(field(page, "Name")).toHaveValue("Erika Musterfrau");
  await page.getByRole("button", { name: "Erneut senden" }).click();
  await expect(page.getByText("SNK-261018-RETRY")).toBeVisible();
  expect(calls).toBe(2);
});

test("network errors are reported without losing data", async ({ page }) => {
  await page.route("**/api/inquiry", (route) => route.abort("internetdisconnected"));
  await page.goto("/kontakt");
  await field(page, "Name").fill("Max Beispiel");
  await field(page, "E-Mail").fill("max@example.com");
  await field(page, "Nachricht").fill("Kurze Frage zum Angebot bitte.");
  await page.getByRole("checkbox").check();
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: "Nachricht senden" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Keine Verbindung" })).toBeVisible();
  await expect(field(page, "Nachricht")).toHaveValue("Kurze Frage zum Angebot bitte.");
});

test("without e-mail configuration the real API answers honestly (503)", async ({ page }) => {
  await page.goto("/standort-anbieten");
  await field(page, "Name").fill("Max Beispiel");
  await field(page, "E-Mail").fill("max@example.com");
  await field(page, "Postleitzahl").fill("70173");
  await field(page, "Ort").fill("Stuttgart");
  await page.getByRole("combobox", { name: "Art des Standorts" }).selectOption("fitness");
  // the visible "key" is the label; the native radio is visually hidden
  await page.locator("label").filter({ hasText: /^Innenbereich$/ }).click();
  await page.locator("label").filter({ hasText: /^Ja$/ }).click();
  await expect(page.getByRole("radio", { name: "Innenbereich" })).toBeChecked();
  await page.getByRole("checkbox").check();
  await page.waitForTimeout(2600);
  const response = page.waitForResponse("**/api/inquiry");
  await page.getByRole("button", { name: "Standort vorschlagen" }).last().click();
  expect((await response).status()).toBe(503);
  await expect(page.getByRole("alert").filter({ hasText: "Formular vorübergehend nicht verfügbar" })).toBeVisible();
  await expect(page.getByText(/eingegangen/)).toHaveCount(0);
});

test("API rejects cross-origin posts", async ({ request }) => {
  const res = await request.post("/api/inquiry", {
    headers: { origin: "https://evil.example", "content-type": "application/json" },
    data: { form: "kontakt" },
  });
  expect(res.status()).toBe(403);
});
