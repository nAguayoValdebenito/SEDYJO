import { describe, expect, it } from "vitest";
import type { Producto } from "@/types";
import { esOferta, seleccionarRecomendaciones } from "./recomendaciones";

function producto(parcial: Partial<Producto> & Pick<Producto, "id" | "categoriaSlug">): Producto {
  return {
    slug: parcial.id,
    nombre: parcial.id,
    descripcionCorta: "",
    etiqueta: "",
    precio: 1000,
    precioAnterior: null,
    unidad: "1 un.",
    precioPorUnidad: "",
    stock: 10,
    imagenes: [],
    marca: null,
    fondo: "#fff",
    colecciones: [],
    promo: null,
    ...parcial,
  };
}

const catalogo: Producto[] = [
  producto({ id: "a1", categoriaSlug: "abarrotes", precio: 800, precioAnterior: 1000 }),
  producto({ id: "b1", categoriaSlug: "bebidas", precio: 700, precioAnterior: 1000 }),
  producto({ id: "b2", categoriaSlug: "bebidas" }),
  producto({ id: "c1", categoriaSlug: "confiteria", promo: "2x $1.500" }),
  producto({ id: "c2", categoriaSlug: "confiteria" }),
  producto({ id: "d1", categoriaSlug: "detergentes", precio: 500, precioAnterior: 1000, stock: 0 }),
];

describe("esOferta", () => {
  it("reconoce rebaja real y promo", () => {
    expect(esOferta(catalogo[0]!)).toBe(true);
    expect(esOferta(catalogo[3]!)).toBe(true);
    expect(esOferta(catalogo[2]!)).toBe(false);
  });
});

describe("seleccionarRecomendaciones", () => {
  it("omite la categoría vista, los ya mostrados y los agotados", () => {
    const r = seleccionarRecomendaciones(catalogo, {
      excluirCategoriaSlug: "abarrotes",
      excluirIds: ["b2"],
      limite: 10,
    });
    expect(r.map((p) => p.id)).not.toContain("a1");
    expect(r.map((p) => p.id)).not.toContain("b2");
    expect(r.map((p) => p.id)).not.toContain("d1");
  });

  it("ordena las ofertas de mayor a menor descuento", () => {
    const r = seleccionarRecomendaciones(catalogo, { limite: 5, soloOfertas: true });
    expect(r.map((p) => p.id)).toEqual(["b1", "a1", "c1"]);
  });

  it("reparte entre categorías cuando se pide variedad", () => {
    const r = seleccionarRecomendaciones(catalogo, { limite: 3, variarCategorias: true });
    expect(new Set(r.map((p) => p.categoriaSlug)).size).toBe(3);
  });

  it("respeta el límite", () => {
    expect(seleccionarRecomendaciones(catalogo, { limite: 2 })).toHaveLength(2);
  });
});
