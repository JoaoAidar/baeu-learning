import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:3001';
const E2E_ADMIN_TOKEN = process.env.E2E_ADMIN_TOKEN || 'dev-admin-e2e';
const E2E_JWT_SECRET = process.env.E2E_JWT_SECRET || 'e2e-secret-must-be-long-enough';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 8_000 },
  retries: 0,
  fullyParallel: false, // shared backend memory store; serialize for determinism
  workers: 1,
  reporter: [['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Spin up backend (in-memory) + Vite dev server. Both health-check before tests run.
  webServer: process.env.E2E_NO_WEBSERVER
    ? undefined
    : [
        {
          command: 'node src/server.js',
          cwd: '../backend',
          url: `${BACKEND_URL}/api/v1/health`,
          timeout: 30_000,
          reuseExistingServer: !process.env.CI,
          env: {
            PORT: new URL(BACKEND_URL).port,
            NODE_ENV: 'test',
            DATABASE_URL: '',
            JWT_SECRET: E2E_JWT_SECRET,
            ADMIN_TOKEN: E2E_ADMIN_TOKEN,
            // Disable rate limit in e2e (very permissive numbers)
            RATE_LIMIT_LOGIN_MAX: '1000',
            RATE_LIMIT_SIGNUP_MAX: '1000',
            RATE_LIMIT_LLM_MAX: '1000',
          },
        },
        {
          command: 'npm run dev',
          url: BASE_URL,
          timeout: 30_000,
          reuseExistingServer: !process.env.CI,
          env: {
            VITE_API_BASE_URL: '',
          },
        },
      ],
});
