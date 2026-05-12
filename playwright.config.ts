import { defineConfig, devices } from "@playwright/test";
import path from "path";

const authStorage = path.join(__dirname, "qa", ".auth", "user.json");

export default defineConfig({
  testDir: path.join(__dirname, "qa", "e2e"),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["json", { outputFile: path.join(__dirname, "qa", "e2e-results.json") }],
  ],
  use: {
    baseURL: "http://localhost:31912",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  outputDir: path.join(__dirname, "qa", "test-results"),
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "e2e-auth",
      dependencies: ["setup"],
      testMatch: /auth\.spec\.ts/,
      use: {
        ...devices["Pixel 5"],
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: "e2e-app",
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts|auth\.spec\.ts/,
      use: {
        ...devices["Pixel 5"],
        storageState: authStorage,
      },
    },
  ],
});
