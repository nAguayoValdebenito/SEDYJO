import { expect, test } from "./base";
import {
  agregarPrimerProducto,
  carritoDelEncabezado,
  completarDatosDeEntrega,
  pagar,
  irAPagarDesdeElPanel,
} from "./ayudas";

test.describe("Proceso de compra", () => {
  test("buscar, agregar, pagar con éxito y vaciar el carrito", async ({ page }) => {
    await page.goto("/");
    const buscador = page.getByRole("search", { name: "Buscar en la tienda" });
    await buscador.getByRole("searchbox").fill("spaghetti");
    await buscador.getByRole("button", { name: "Buscar" }).click();
    await expect(page).toHaveURL(/\/buscar\?q=spaghetti/);
    await expect(page.getByRole("heading", { name: /Spaghetti Carozzi/ })).toBeVisible();

    await page.getByRole("button", { name: "Agregar", exact: true }).first().click();
    await expect(carritoDelEncabezado(page)).not.toContainText("$0");

    await irAPagarDesdeElPanel(page);
    await completarDatosDeEntrega(page);
    await expect(page.getByText("Webpay Plus")).toBeVisible();
    await pagar(page);
    await page.waitForURL("**/checkout/exito");
    await expect(page.getByRole("heading", { name: "Compra confirmada" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Pedido SED-\d+ recibido/ })).toBeVisible();
    // El carrito se vacía solo al confirmar la compra.
    await expect(carritoDelEncabezado(page)).toContainText("$0");

    // El pedido existe en la API: se puede seguir sin cuenta con su número y el correo de compra.
    const numero = (
      await page.getByRole("heading", { name: /Pedido SED-\d+ recibido/ }).textContent()
    )?.match(/SED-\d+/)?.[0];
    expect(numero).toBeTruthy();
    await page.getByRole("link", { name: "Seguir mi pedido" }).click();
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Correo electrónico").fill("cliente@prueba.cl");
    await page.getByRole("button", { name: "Ver estado de mi pedido" }).click();
    await expect(page.getByRole("heading", { name: `Pedido ${numero}` })).toBeVisible();
  });

  test("el resumen muestra el despacho de la comuna elegida, calculado por la API", async ({
    page,
  }) => {
    await agregarPrimerProducto(page);
    await page.goto("/checkout");
    await expect(page.locator("#checkout-comuna")).toBeVisible();
    const resumen = page.getByRole("complementary", { name: "Resumen del pedido" });
    await expect(resumen).toContainText("Elige tu comuna");

    await page.locator("#checkout-calle").fill("Los Aromos");
    await page.locator("#checkout-comuna").selectOption("Lota");
    await expect(resumen).toContainText(/Despacho\s*\$4\.490/);
    await page.locator("#checkout-comuna").selectOption("San Pedro de la Paz");
    await expect(resumen).toContainText(/Despacho\s*\$1\.990/);
  });

  test("pago rechazado: el carrito queda intacto y se puede reintentar", async ({ page }) => {
    await agregarPrimerProducto(page);
    await page.goto("/checkout");
    // El correo rechazo@sedyjo.cl hace que la API falsa rechace el pago.
    await completarDatosDeEntrega(page, { correo: "rechazo@sedyjo.cl" });
    await pagar(page);
    await page.waitForURL("**/checkout/error");
    await expect(page.getByRole("heading", { name: "No se completó el pago" })).toBeVisible();
    await expect(page.getByText("no se ha vaciado")).toBeVisible();
    await expect(carritoDelEncabezado(page)).not.toContainText("$0");

    await page.getByRole("button", { name: "Reintentar el pago" }).click();
    await page.waitForURL("**/checkout");
    await expect(page.getByRole("heading", { name: "Revisa y paga" })).toBeVisible();
  });

  test("si los pagos no están habilitados avisa y conserva el carrito", async ({ page }) => {
    await agregarPrimerProducto(page);
    await page.goto("/checkout");
    // Con sinpagos@sedyjo.cl la API falsa no tiene el pago simulado (responde 404).
    await completarDatosDeEntrega(page, { correo: "sinpagos@sedyjo.cl" });
    await pagar(page);
    await page.waitForURL("**/checkout/error");
    await expect(page.getByText("pagos todavía no están habilitados")).toBeVisible();
    await expect(carritoDelEncabezado(page)).not.toContainText("$0");
  });

  test("el checkout sin productos invita a seguir comprando", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByText("Tu carrito está vacío. Agrega productos")).toBeVisible();
    await expect(page.getByRole("link", { name: "Seguir comprando" })).toBeVisible();
  });

  test("el checkout valida los datos antes de avanzar", async ({ page }) => {
    await agregarPrimerProducto(page);
    await page.goto("/checkout");
    await page.getByRole("button", { name: "Continuar al pago" }).click();

    const resumen = page.getByRole("alert").filter({ hasText: "dato" });
    await expect(resumen).toBeFocused();
    await expect(resumen).toContainText("Nombre");
    await expect(resumen).toContainText("Celular");
    await expect(page.getByRole("heading", { name: "Contacto y entrega" })).toBeVisible();

    await page.locator("#checkout-telefono").fill("123");
    await page.getByRole("button", { name: "Continuar al pago" }).click();
    await expect(page.locator("#checkout-telefono-error")).toBeVisible();
  });

  test("al superar el monto mínimo el despacho es gratis", async ({ page }) => {
    // Carrito de $52.020 (18 × $2.890): sobre el mínimo de despacho gratis.
    await page.goto("/");
    await page.evaluate(() =>
      localStorage.setItem(
        "sedyjo-carrito",
        JSON.stringify({
          state: {
            items: [
              {
                productoId: "35",
                slug: "arroz-premium-grado-1-banquete-2-kg",
                nombre: "Arroz Premium Grado 1 Banquete 2 kg",
                precio: 2890,
                imagen: null,
                fondo: "#F6E3A1",
                cantidad: 18,
              },
            ],
          },
          version: 0,
        }),
      ),
    );
    await page.goto("/carrito");
    await expect(
      page.getByRole("main").getByText("¡Tu pedido tiene despacho gratis!"),
    ).toBeVisible();

    await page.getByRole("main").getByRole("link", { name: "Ir a pagar" }).first().click();
    await page.waitForURL("**/checkout");
    // El despacho depende de la comuna: la API lo calcula al elegirla.
    await page.locator("#checkout-comuna").selectOption("Lota");
    await expect(page.getByRole("complementary", { name: "Resumen del pedido" })).toContainText(
      "Gratis",
    );
  });
});
