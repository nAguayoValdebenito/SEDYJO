import { describe, expect, it } from "vitest";
import type { Producto } from "@/types";
import { UMBRAL_POCAS_UNIDADES, estadoStock, seleccionarRelacionados } from "./producto";

const base: Producto = {
  id: "p-1",
  slug: "p-1",
  nombre: "Producto",
  descripcionCorta: "",
  categoriaSlug: "abarrotes",
  etiqueta: "Abarrotes",
  precio: 1000,
  precioAnterior: null,
  unidad: "1 kg",
  precioPorUnidad: "$1.000 / kg",
  stock: 10,
  imagenes: [],
  marca: null,
  fondo: "#fff",
  colecciones: [],
  promo: null,
};
const p = (id: string, extra: Partial<Producto> = {}): Producto => ({
  ...base,
  id,
  slug: id,
  ...extra,
});

describe("estadoStock", () => {
  it("agotado sin unidades", () => expect(estadoStock(0).tipo).toBe("agotado"));
  it("pocas unidades en el umbral", () => {
    const e = estadoStock(UMBRAL_POCAS_UNIDADES);
    expect(e.tipo).toBe("pocas");
    expect(e.texto).toContain(String(UMBRAL_POCAS_UNIDADES));
  });
  it("disponible sobre el umbral", () =>
    expect(estadoStock(UMBRAL_POCAS_UNIDADES + 1).tipo).toBe("disponible"));
});

describe("seleccionarRelacionados", () => {
  const actual = p("a");
  it("excluye el propio producto y los agotados", () => {
    const r = seleccionarRelacionados([actual, p("b"), p("c", { stock: 0 })], actual, 4);
    expect(r.map((x) => x.id)).toEqual(["b"]);
  });
  it("prioriza la misma categoría y completa con ofertas de otras", () => {
    const productos = [
      p("x", { categoriaSlug: "bebidas" }),
      p("y", { categoriaSlug: "bebidas", precioAnterior: 2000 }),
      p("z"),
    ];
    const r = seleccionarRelacionados(productos, actual, 3);
    expect(r.map((x) => x.id)).toEqual(["z", "y", "x"]);
  });
  it("respeta el límite", () => {
    const productos = [p("b"), p("c"), p("d")];
    expect(seleccionarRelacionados(productos, actual, 2)).toHaveLength(2);
  });
});
