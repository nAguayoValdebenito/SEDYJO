import { expect, test as base } from "@playwright/test";

/**
 * `test` de las pruebas E2E. El modal de ofertas aparece a los pocos segundos y tapa la página;
 * aquí se marca como "cerrado hace un momento" para que no interrumpa los escenarios.
 */
export const test = base.extend({
  page: async ({ page }, usar) => {
    await page.addInitScript(() => {
      const leer = Storage.prototype.getItem;
      Storage.prototype.getItem = function (clave: string) {
        if (this === window.localStorage && clave.startsWith("sedyjo-promo-cierre-")) {
          return String(Date.now());
        }
        return leer.call(this, clave);
      };
    });
    await usar(page);
  },
});

export { expect };
