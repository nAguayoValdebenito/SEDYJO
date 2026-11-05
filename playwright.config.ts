import { defineConfig } from "@playwright/test";

/**
 * Pruebas de extremo a extremo de la tienda: se ejecutan sobre el build de producción
 * (`npm run test:e2e` lo compila antes). Por defecto usan el Chrome instalado en el equipo;
 * en otro equipo se puede usar el Chromium de Playwright con `E2E_CANAL=chromium` (requiere
 * `npx playwright install chromium`).
 */
const PUERTO = 3100;
const PUERTO_API = 3199;
const canal = process.env.E2E_CANAL ?? "chrome";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    locale: "es-CL",
    timezoneId: "America/Santiago",
    viewport: { width: 1280, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...(canal === "chromium" ? {} : { channel: canal }),
  },
  webServer: [
    {
      // API de Sedyjo falsa: los pedidos de las pruebas no tocan la API real (ver e2e/api-falsa.mjs).
      command: `node e2e/api-falsa.mjs`,
      url: `http://localhost:${PUERTO_API}/health`,
      reuseExistingServer: true,
      timeout: 30_000,
      env: { API_FALSA_PUERTO: String(PUERTO_API) },
    },
    {
      command: `npm start -- -p ${PUERTO}`,
      url: `http://localhost:${PUERTO}`,
      reuseExistingServer: true,
      timeout: 60_000,
      env: { SEDYJO_API_URL: `http://localhost:${PUERTO_API}` },
    },
  ],
});
