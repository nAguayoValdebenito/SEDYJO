import { expect, test } from "@playwright/test";
import {
  carritoDelEncabezado,
  completarDatosDeEntrega,
  iniciarSesionDemo,
  irALaPasarela,
  irAPagarDesdeElPanel,
} from "./ayudas";

test.describe("Cuenta del cliente", () => {
  test("registro de un cliente nuevo: llega a su cuenta sin pedidos", async ({ page }) => {
    await page.goto("/registro");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Nombre").fill("Cliente Nuevo");
    await page.getByLabel("Correo").fill("nuevo@prueba.cl");
    await page.locator("#registro-contrasena").fill("Clave1234");
    await page.locator("#registro-confirmar").fill("Clave1234");
    await page.getByRole("button", { name: "Crear mi cuenta" }).click();
    await page.waitForURL("**/cuenta");
    await expect(page.getByText("Hola, Cliente Nuevo").first()).toBeVisible();

    await page.goto("/cuenta/pedidos");
    await expect(page.getByRole("heading", { name: "Aún no tienes pedidos" })).toBeVisible();
  });

  test("el registro valida los datos y no avanza", async ({ page }) => {
    await page.goto("/registro");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Crear mi cuenta" }).click();
    const resumen = page.getByRole("alert").filter({ hasText: "dato" });
    await expect(resumen).toBeFocused();
    await expect(page).toHaveURL(/\/registro/);

    await page.getByLabel("Nombre").fill("Ana");
    await page.getByLabel("Correo").fill("ana@prueba.cl");
    await page.locator("#registro-contrasena").fill("Clave1234");
    await page.locator("#registro-confirmar").fill("Otra12345");
    await page.getByRole("button", { name: "Crear mi cuenta" }).click();
    await expect(page.locator("#registro-confirmar-error")).toContainText("no coinciden");
  });

  test("ingreso con la cuenta demo, historial y cierre de sesión", async ({ page }) => {
    await iniciarSesionDemo(page);
    await expect(page.getByText("Hola, Ana Pérez").first()).toBeVisible();

    await page.goto("/cuenta/pedidos");
    await expect(page.getByRole("heading", { name: "Pedido SED-10482" })).toBeVisible();
    await page.getByRole("link", { name: /Ver detalle del pedido SED-10482/ }).click();
    await expect(page.getByRole("list", { name: "Estado de tu pedido" })).toBeVisible();

    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await page.waitForURL("**/");
    await page.goto("/cuenta");
    await expect(
      page.getByRole("heading", { name: "Inicia sesión para ver tu cuenta" }),
    ).toBeVisible();
  });

  test("las cuentas protegidas piden ingresar y devuelven a la página", async ({ page }) => {
    await page.goto("/cuenta/pedidos");
    await page.getByRole("link", { name: "Iniciar sesión" }).last().click();
    await expect(page).toHaveURL(/volver=%2Fcuenta%2Fpedidos/);
    await page.getByLabel("Correo").fill("demo@sedyjo.cl");
    await page.locator("#ingreso-contrasena").fill("Clave1234");
    await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
    await page.waitForURL("**/cuenta/pedidos");
  });

  test("el ingreso informa errores de credenciales y del servidor", async ({ page }) => {
    await page.goto("/ingresar");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Correo").fill("bloqueado@sedyjo.cl");
    await page.locator("#ingreso-contrasena").fill("Clave1234");
    await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
    await expect(page.getByText("no son correctos")).toBeVisible();

    await page.getByLabel("Correo").fill("error@sedyjo.cl");
    await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
    await expect(page.getByText("No pudimos conectar con el servidor")).toBeVisible();
  });

  test("volver a comprar agrega los productos del pedido y abre el carrito", async ({ page }) => {
    await iniciarSesionDemo(page);
    await page.goto("/cuenta/pedidos");
    await page
      .getByRole("article")
      .filter({ hasText: "SED-10482" })
      .getByRole("button", { name: "Volver a comprar" })
      .click();
    await expect(page.getByRole("dialog", { name: /Tu carrito/ })).toBeVisible();
    await expect(carritoDelEncabezado(page)).not.toContainText("$0");
  });

  test("una dirección guardada se usa al pagar", async ({ page }) => {
    await iniciarSesionDemo(page);
    await page.goto("/cuenta/direcciones");
    await page.getByRole("button", { name: "Agregar dirección" }).click();
    await page.getByLabel("Nombre de la dirección").fill("Trabajo");
    await page.getByLabel("Calle").fill("Av. Colón");
    await page.getByLabel("Número").fill("450");
    await page.getByLabel("Comuna").fill("Concepción");
    await page.getByLabel("Región").fill("Biobío");
    await page.getByLabel("Usar como mi dirección principal").check();
    await page.getByRole("button", { name: "Guardar dirección" }).click();
    await expect(page.getByRole("heading", { name: "Trabajo" })).toBeVisible();

    await page.goto("/categoria/despensa");
    await page.getByRole("button", { name: "Agregar", exact: true }).first().click();
    await irAPagarDesdeElPanel(page);
    // La principal aparece elegida y no se piden los campos de dirección.
    await expect(page.getByLabel(/Trabajo/)).toBeChecked();
    await expect(page.locator("#checkout-calle")).toHaveCount(0);
    await completarDatosDeEntrega(page, { direccionNueva: false });
    await expect(page.getByText("Despacho: Av. Colón 450, Concepción, Biobío")).toBeVisible();
    await irALaPasarela(page);
  });

  test("el perfil se actualiza y el saludo cambia", async ({ page }) => {
    await iniciarSesionDemo(page);
    await page.goto("/cuenta/perfil");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Nombre").fill("Ana María Pérez");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByText("Guardamos tus datos.")).toBeVisible();
    await expect(page.getByText("Hola, Ana María Pérez").first()).toBeVisible();
  });
});
