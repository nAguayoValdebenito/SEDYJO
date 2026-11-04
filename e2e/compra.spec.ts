import { expect, test } from "./base";
import {
  agregarPrimerProducto,
  carritoDelEncabezado,
  completarDatosDeEntrega,
  irALaPasarela,
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
    await irALaPasarela(page);

    await page.getByRole("button", { name: "Simular pago exitoso" }).click();
    await page.waitForURL("**/checkout/exito");
    await expect(page.getByRole("heading", { name: "Compra confirmada" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Pedido SED-\d+ recibido/ })).toBeVisible();
    // El carrito se vacía solo al confirmar la compra.
    await expect(carritoDelEncabezado(page)).toContainText("$0");
  });

  test("pago rechazado: el carrito queda intacto y se puede reintentar", async ({ page }) => {
    await agregarPrimerProducto(page);
    await page.goto("/checkout");
    await completarDatosDeEntrega(page);
    await irALaPasarela(page);

    await page.getByRole("button", { name: "Simular pago rechazado" }).click();
    await page.waitForURL("**/checkout/error");
    await expect(page.getByRole("heading", { name: "No se completó el pago" })).toBeVisible();
    await expect(page.getByText("no se ha vaciado")).toBeVisible();
    await expect(carritoDelEncabezado(page)).not.toContainText("$0");

    await page.getByRole("button", { name: "Reintentar el pago" }).click();
    await page.waitForURL("**/checkout");
    await expect(page.getByRole("heading", { name: "Revisa y paga" })).toBeVisible();
  });

  test("cancelar el pago también conserva el carrito", async ({ page }) => {
    await agregarPrimerProducto(page);
    await page.goto("/checkout");
    await completarDatosDeEntrega(page);
    await irALaPasarela(page);

    await page.getByRole("button", { name: "Volver y cancelar" }).click();
    await page.waitForURL("**/checkout/error");
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
    await expect(page.getByRole("complementary", { name: "Resumen del pedido" })).toContainText(
      "Gratis",
    );
  });
});
