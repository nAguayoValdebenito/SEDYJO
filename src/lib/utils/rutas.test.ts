import { describe, expect, it } from "vitest";
import { rutaSegura } from "./rutas";

describe("rutaSegura", () => {
  it("acepta rutas internas", () => {
    expect(rutaSegura("/carrito")).toBe("/carrito");
    expect(rutaSegura("/cuenta/pedidos?x=1")).toBe("/cuenta/pedidos?x=1");
  });

  it("rechaza sitios externos y trucos", () => {
    for (const mala of [
      "https://malo.com",
      "//malo.com",
      "/\\malo.com",
      "javascript:alert(1)",
      "",
    ]) {
      expect(rutaSegura(mala)).toBe("/cuenta");
    }
  });

  it("usa el respaldo cuando no hay ruta", () => {
    expect(rutaSegura(null)).toBe("/cuenta");
    expect(rutaSegura(undefined, "/")).toBe("/");
  });
});
