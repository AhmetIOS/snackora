import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3210);
const baseURL = `http://localhost:${PORT}`;

/** Analytics is built in with a dummy ID; requests to Google are intercepted in the tests. */
export const E2E_GA_ID = "G-E2ETEST000";

/**
 * Default for all tests: the visitor has already declined analytics, so the
 * consent banner does not cover page content. consent.spec.ts starts clean.
 */
const declined = {
  cookies: [],
  origins: [
    {
      origin: baseURL,
      localStorage: [{ name: "snackora-consent", value: JSON.stringify({ version: 1, analytics: false, decidedAt: Date.now() }) }],
    },
  ],
};

/**
 * End-to-end tests run against a production build. No real e-mails are sent:
 * RESEND_API_KEY is deliberately empty, success paths mock /api/inquiry.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "retain-on-failure", locale: "de-DE", storageState: declined },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: baseURL,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    env: { RESEND_API_KEY: "", NEXT_PUBLIC_SITE_URL: "https://snackora.de", NEXT_PUBLIC_GA_MEASUREMENT_ID: E2E_GA_ID, ADMIN_PASSWORD: "e2e-admin-password", ADMIN_SESSION_SECRET: "e2e-session-secret-0123456789abcdef" },
  },
});
