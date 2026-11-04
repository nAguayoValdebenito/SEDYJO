import { describe, expect, it } from "vitest";
import { coincideBusqueda, normalizarTexto } from "./busqueda";

describe("normalizarTexto", () => {
  it("quita tildes y pasa a minúsculas", () => {
    expect(normalizarTexto("  Confitería ")).toBe("confiteria");
  });
});

describe("coincideBusqueda", () => {
  const textos = ["Galletas surtidas 400 g", "Confitería", null];

  it("encuentra sin importar tildes ni mayúsculas", () => {
    expect(coincideBusqueda(textos, "CONFITERIA")).toBe(true);
  });

  it("exige todas las palabras", () => {
    expect(coincideBusqueda(textos, "galletas 400")).toBe(true);
    expect(coincideBusqueda(textos, "galletas leche")).toBe(false);
  });

  it("una consulta vacía coincide con todo", () => {
    expect(coincideBusqueda(textos, "   ")).toBe(true);
  });
});
