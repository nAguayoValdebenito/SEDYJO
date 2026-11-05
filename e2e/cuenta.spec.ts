import { expect, test } from "./base";
import {
  carritoDelEncabezado,
  completarDatosDeEntrega,
  iniciarSesionDemo,
  irAPagarDesdeElPanel,
  pagar,
  registrarCliente,
} from "./ayudas";

test.describe("Cuenta del cliente", () => {
  test("registro de un cliente nuevo: llega a su cuenta sin pedidos", async ({ page }) => {
    await registrarCliente(page, "Cliente Nuevo");
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

  test("un correo ya registrado se informa junto al campo", async ({ page }) => {
    await page.goto("/registro");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Nombre").fill("Ana Pérez");
    await page.getByLabel("Correo").fill("demo@sedyjo.cl");
    await page.locator("#registro-contrasena").fill("Clave1234");
    await page.locator("#registro-confirmar").fill("Clave1234");
    await page.getByRole("button", { name: "Crear mi cuenta" }).click();
    await expect(page.locator("#registro-correo-error")).toContainText("Ya existe una cuenta");
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
    await page.getByLabel("Correo").fill("demo@sedyjo.cl");
    await page.locator("#ingreso-contrasena").fill("Incorrecta99");
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

  test("una dirección guardada se usa al pagar y el pedido queda en la cuenta", async ({
    page,
  }) => {
    await registrarCliente(page);
    await page.goto("/cuenta/direcciones");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Agregar dirección" }).click();
    await page.getByLabel("Nombre de la dirección").fill("Trabajo");
    await page.getByLabel("Calle").fill("Av. Colón");
    await page.getByLabel("Número").fill("450");
    await page.getByLabel("Comuna").selectOption("Concepción");
    await expect(page.locator("#dir-region")).toHaveText("Biobío");
    await page.getByRole("button", { name: "Guardar dirección" }).click();
    await expect(page.getByRole("heading", { name: "Trabajo" })).toBeVisible();

    await page.goto("/categoria/abarrotes");
    await page.getByRole("button", { name: "Agregar", exact: true }).first().click();
    await irAPagarDesdeElPanel(page);
    // La principal aparece elegida y no se piden los campos de dirección.
    await expect(page.getByLabel(/Trabajo/)).toBeChecked();
    await expect(page.locator("#checkout-calle")).toHaveCount(0);
    await completarDatosDeEntrega(page, { direccionNueva: false });
    await expect(page.getByText("Despacho: Av. Colón 450, Concepción, Biobío")).toBeVisible();
    await pagar(page);
    await page.waitForURL("**/checkout/exito");

    // El pedido pagado con la sesión iniciada aparece en el historial de la cuenta.
    await page.goto("/cuenta/pedidos");
    await expect(page.getByRole("heading", { name: /Pedido SED-\d+/ })).toBeVisible();
  });

  test("el perfil se actualiza y el saludo cambia", async ({ page }) => {
    await registrarCliente(page, "Ana Pérez");
    await page.goto("/cuenta/perfil");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Nombre").fill("Ana María Pérez");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByText("Guardamos tus datos.")).toBeVisible();
    await expect(page.getByText("Hola, Ana María Pérez").first()).toBeVisible();
  });

  test("cambiar el correo pide la contraseña actual", async ({ page }) => {
    await registrarCliente(page);
    await page.goto("/cuenta/perfil");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#perfil-contrasena")).toHaveCount(0);

    const nuevo = `otro-${Date.now().toString(36)}@prueba.cl`;
    await page.locator("#perfil-correo").fill(nuevo);
    await expect(page.locator("#perfil-contrasena")).toBeVisible();

    await page.locator("#perfil-contrasena").fill("Incorrecta99");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.locator("#perfil-contrasena-error")).toBeVisible();

    await page.locator("#perfil-contrasena").fill("Clave1234");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByText("Guardamos tus datos.")).toBeVisible();
  });

  test("cambiar la contraseña valida la actual", async ({ page }) => {
    await registrarCliente(page);
    await page.goto("/cuenta/perfil");
    await page.waitForLoadState("networkidle");
    await page.locator("#clave-actual").fill("Incorrecta99");
    await page.locator("#clave-nueva").fill("Nueva12345");
    await page.locator("#clave-confirmar").fill("Nueva12345");
    await page.getByRole("button", { name: "Cambiar contraseña" }).click();
    await expect(page.locator("#clave-actual-error")).toBeVisible();
  });
});

test.describe("Recuperar la contraseña", () => {
  test("pide el correo y responde siempre igual", async ({ page }) => {
    await page.goto("/recuperar");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Correo de tu cuenta").fill("quien-sea@prueba.cl");
    await page.getByRole("button", { name: "Enviar instrucciones" }).click();
    await expect(page.getByText("te enviaremos las instrucciones")).toBeVisible();
  });

  test("el enlace del correo permite crear una contraseña nueva", async ({ page }) => {
    await page.goto("/recuperar/nueva?token=token-valido");
    await page.waitForLoadState("networkidle");
    await page.locator("#nueva-contrasena").fill("Nueva12345");
    await page.locator("#nueva-confirmar").fill("Distinta1234");
    await page.getByRole("button", { name: "Guardar contraseña" }).click();
    await expect(page.locator("#nueva-confirmar-error")).toContainText("no coinciden");

    await page.locator("#nueva-confirmar").fill("Nueva12345");
    await page.getByRole("button", { name: "Guardar contraseña" }).click();
    await expect(page.getByText("guardamos tu contraseña nueva")).toBeVisible();
    await expect(page.getByRole("link", { name: "Iniciar sesión" })).toBeVisible();
  });

  test("un enlace vencido o sin token invita a pedir otro", async ({ page }) => {
    await page.goto("/recuperar/nueva?token=vencido");
    await page.waitForLoadState("networkidle");
    await page.locator("#nueva-contrasena").fill("Nueva12345");
    await page.locator("#nueva-confirmar").fill("Nueva12345");
    await page.getByRole("button", { name: "Guardar contraseña" }).click();
    await expect(page.getByText("no es válido, venció o ya se usó")).toBeVisible();
    await expect(page.getByRole("link", { name: "Pedir un enlace nuevo" })).toBeVisible();

    await page.goto("/recuperar/nueva");
    await expect(page.getByText("Falta el enlace de recuperación")).toBeVisible();
  });
});
