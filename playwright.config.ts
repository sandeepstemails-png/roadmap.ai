import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    // Dedicated port, distinct from 3000 (the default `next dev`/`next
    // start` port). Without this, if a dev server is already running on
    // 3000 (a very normal thing to have open locally), Playwright's
    // reuseExistingServer silently tests THAT server instead of building
    // and testing this checkout — passing or failing against stale code.
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
