import { describe, expect, it } from "vitest";
import {
  adaptarCatalogo,
  adaptarCategorias,
  generarSlug,
  productoApiSchema,
  type ProductoApi,
} from "./adaptador-api";

const base = (id: number, name: string, category: string, extra: Partial<ProductoApi> = {}) =>
  productoApiSchema.parse({
    id,
    sku: `SED-${id}`,
    name,
    description: `${name} de prueba`,
    category,
    price: 1000 + id,
    stock: 5,
    image: `https://api.sedyjo.com/images/${id}.webp`,
    ...extra,
  });

describe("generarSlug", () => {
  it("quita tildes, pasa a minúsculas y une con guiones", () => {
    expect(generarSlug("Frutas y Verduras")).toBe("frutas-y-verduras");
    expect(generarSlug("Hogar y Decoración")).toBe("hogar-y-decoracion");
    expect(generarSlug("Esmalte de Uñas Rojo")).toBe("esmalte-de-unas-rojo");
  });
});

describe("adaptarCatalogo", () => {
  const productos = [
    base(1, "Manzana", "Frutas y Verduras"),
    base(2, "Huevos", "Despensa", { stock: 0 }),
    base(3, "Aceite", "Despensa"),
    base(4, "Labial", "Belleza", { image: null }),
  ];
  const catalogo = adaptarCatalogo(productos);

  it("traduce los campos de la API al contrato del frontend", () => {
    const manzana = catalogo[0];
    expect(manzana).toMatchObject({
      id: "1",
      slug: "manzana",
      nombre: "Manzana",
      categoriaSlug: "frutas-y-verduras",
      etiqueta: "Frutas y Verduras",
      precio: 1001,
      precioAnterior: null,
      promo: null,
      marca: null,
      imagenes: ["https://api.sedyjo.com/images/1.webp"],
    });
  });

  it("deja sin imágenes a los productos sin foto", () => {
    expect(catalogo[3].imagenes).toEqual([]);
  });

  it("no destaca productos agotados ni sin foto", () => {
    expect(catalogo[1].colecciones).toEqual([]);
    expect(catalogo[3].colecciones).toEqual([]);
    expect(catalogo[0].colecciones).toContain("semana");
  });

  it("no inventa descuentos", () => {
    expect(catalogo.every((p) => p.precioAnterior === null && p.promo === null)).toBe(true);
  });
});

describe("adaptarCategorias", () => {
  it("omite categorías vacías y usa la foto de su primer producto", () => {
    const catalogo = adaptarCatalogo([base(1, "Manzana", "Frutas y Verduras")]);
    const categorias = adaptarCategorias(
      [
        { name: "Frutas y Verduras", count: 1 },
        { name: "Vacía", count: 0 },
      ],
      catalogo,
    );
    expect(categorias).toHaveLength(1);
    expect(categorias[0]).toMatchObject({
      slug: "frutas-y-verduras",
      imagen: "https://api.sedyjo.com/images/1.webp",
    });
  });
});
