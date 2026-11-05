import { expect, type Page } from "@playwright/test";

/** Pasos que se repiten en varios escenarios. */

/** Inicia sesión con la cuenta demo (con pedidos de ejemplo) por el formulario real. */
export async function iniciarSesionDemo(page: Page, correo = "demo@sedyjo.cl") {
  await page.goto("/ingresar");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Correo").fill(correo);
  await page.locator("#ingreso-contrasena").fill("Clave1234");
  await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await page.waitForURL("**/cuenta");
}

/** Agrega el primer producto disponible de una categoría al carrito. */
export async function agregarPrimerProducto(page: Page, ruta = "/categoria/abarrotes") {
  await page.goto(ruta);
  const agregar = page.getByRole("button", { name: "Agregar", exact: true }).first();
  await agregar.click();
  await expect(page.getByRole("button", { name: /Agregar una unidad de/ }).first()).toBeVisible();
}

/** Abre el carrito lateral desde el encabezado y sigue a "Ir a pagar". */
export async function irAPagarDesdeElPanel(page: Page) {
  await page.locator("[data-carrito-destino]").click();
  const panel = page.getByRole("dialog", { name: /Tu carrito/ });
  await expect(panel).toBeVisible();
  await panel.getByRole("link", { name: "Ir a pagar" }).click();
  await page.waitForURL("**/checkout");
  // El panel termina de cerrarse después de navegar; mientras tanto la página queda inerte.
  await expect(panel).toBeHidden();
}

/** Completa el paso 1 del pago (contacto y dirección nueva) y avanza al paso 2. */
export async function completarDatosDeEntrega(
  page: Page,
  datos: { nombre?: string; correo?: string; direccionNueva?: boolean } = {},
) {
  const { nombre = "Cliente Prueba", correo = "cliente@prueba.cl", direccionNueva = true } = datos;
  await expect(page.getByRole("heading", { name: "Contacto y entrega" })).toBeVisible();
  // El formulario solo valida en el navegador una vez cargado el JavaScript.
  await page.waitForLoadState("networkidle");

  const campoNombre = page.locator("#checkout-nombre");
  if (!(await campoNombre.inputValue())) await campoNombre.fill(nombre);
  const campoCorreo = page.locator("#checkout-correo");
  if (!(await campoCorreo.inputValue())) await campoCorreo.fill(correo);
  await page.locator("#checkout-telefono").fill("+56 9 6642 3803");
  await expect(page.locator("#checkout-telefono")).toHaveValue("+56 9 6642 3803");

  if (direccionNueva) {
    await page.locator("#checkout-calle").fill("Los Aromos");
    await page.locator("#checkout-numero").fill("1234");
    await page.locator("#checkout-comuna").selectOption("San Pedro de la Paz");
  }
  // El total lo calcula la API: se espera a que el resumen muestre el despacho de la comuna.
  await expect(page.getByRole("complementary", { name: "Resumen del pedido" })).toContainText(
    /Despacho\s*(\$[\d.]+|Gratis)/,
  );
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await expect(page.getByRole("heading", { name: "Revisa y paga" })).toBeVisible();
}

/** Del paso 2: "Pagar" crea el pedido y confirma el pago; termina en la página de éxito o de error. */
export async function pagar(page: Page) {
  await page.getByRole("main").getByRole("button", { name: "Pagar", exact: true }).click();
}

/** Crea una cuenta nueva por el formulario real y deja la sesión iniciada. Devuelve su correo. */
export async function registrarCliente(page: Page, nombre = "Cliente Nuevo") {
  const correo = `cliente-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}@prueba.cl`;
  await page.goto("/registro");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Nombre").fill(nombre);
  await page.getByLabel("Correo").fill(correo);
  await page.locator("#registro-contrasena").fill("Clave1234");
  await page.locator("#registro-confirmar").fill("Clave1234");
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  await page.waitForURL("**/cuenta");
  return correo;
}

/** Cantidad de unidades que indica el carrito del encabezado ("$0" cuando está vacío). */
export function carritoDelEncabezado(page: Page) {
  return page.locator("[data-carrito-destino]");
}
