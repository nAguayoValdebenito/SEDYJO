import { expect, test } from "./base";

test.describe("Catálogo, seguimiento y páginas del sistema", () => {
  test("la portada muestra el despacho gratis y las categorías", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Despacho gratis" })).toContainText("$49.990");
    await expect(page.getByRole("link", { name: /Abarrotes/ }).first()).toBeVisible();
    await expect(page).toHaveTitle(/Comercial Sedyjo/);
  });

  test("de la categoría a la ficha del producto", async ({ page }) => {
    await page.goto("/categoria/abarrotes");
    await page.getByRole("link", { name: "Spaghetti Carozzi 400 g" }).first().click();
    await page.waitForURL("**/producto/spaghetti-carozzi-400-g");
    await expect(
      page.getByRole("heading", { level: 1, name: "Spaghetti Carozzi 400 g" }),
    ).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Ruta de navegación" })).toContainText(
      "Abarrotes",
    );
    await expect(page.getByRole("button", { name: "Agregar", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "También te puede interesar" })).toBeVisible();
  });

  test("una ruta inexistente muestra el 404 de la tienda", async ({ page }) => {
    const respuesta = await page.goto("/esta-pagina-no-existe");
    expect(respuesta?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "No encontramos esa página" })).toBeVisible();
    await page
      .getByRole("search", { name: "Buscar productos" })
      .getByRole("searchbox")
      .fill("spaghetti");
    await page.getByRole("search", { name: "Buscar productos" }).getByRole("button").click();
    await expect(page).toHaveURL(/\/buscar\?q=spaghetti/);
  });

  test("la búsqueda sin resultados lo informa", async ({ page }) => {
    await page.goto("/buscar?q=xyzxyzxyz");
    await expect(page.getByText(/No encontramos/)).toBeVisible();
  });

  test("seguimiento sin cuenta: pedido encontrado y pedido inexistente", async ({ page }) => {
    await page.goto("/seguimiento");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Número de pedido").fill("SED-10482");
    await page.getByLabel("Correo electrónico").fill("demo@sedyjo.cl");
    await page.getByRole("button", { name: "Ver estado de mi pedido" }).click();
    await expect(page.getByRole("heading", { name: "Pedido SED-10482" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Estado de tu pedido" })).toBeVisible();

    await page.getByLabel("Correo electrónico").fill("otro@correo.cl");
    await page.getByRole("button", { name: "Ver estado de mi pedido" }).click();
    await expect(page.getByText("No encontramos ese pedido")).toBeVisible();
  });

  test("el seguimiento valida los campos vacíos", async ({ page }) => {
    await page.goto("/seguimiento");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Ver estado de mi pedido" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "dato" })).toBeFocused();
  });

  test("las páginas de ayuda, despachos y preguntas están enlazadas y abren", async ({ page }) => {
    await page.goto("/ayuda");
    await page
      .getByRole("link", { name: /Despachos/ })
      .first()
      .click();
    await expect(page.getByRole("heading", { level: 1, name: "Despachos" })).toBeVisible();
    await expect(page.getByText("24 a 48 horas").first()).toBeVisible();

    await page.goto("/preguntas-frecuentes");
    await page.getByText("¿Puedo retirar mi compra en la tienda?").click();
    await expect(page.getByText("Solo hacemos despacho a domicilio.")).toBeVisible();
  });

  test("publicación: sitemap, robots y páginas privadas fuera de los buscadores", async ({
    page,
    request,
  }) => {
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Disallow: /checkout");
    const sitemap = await request.get("/sitemap.xml");
    expect(await sitemap.text()).toContain("/producto/spaghetti-carozzi-400-g");

    await page.goto("/carrito");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await page.goto("/producto/spaghetti-carozzi-400-g");
    await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
  });
});
