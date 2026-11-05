import { describe, expect, it } from "vitest";
import {
  adaptarOfertaDelDia,
  adaptarOfertaDestacada,
  ofertaApiSchema,
  adaptarBannersOscuros,
  adaptarBannersPrincipales,
  adaptarCampanaModal,
  adaptarCatalogo,
  adaptarCategorias,
  bannerApiSchema,
  generarSlug,
  precioPorUnidad,
  productoApiSchema,
  rutaDesdeApi,
  separarMarcaYUnidad,
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
      marca: "Manzana de prueba",
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

describe("separarMarcaYUnidad", () => {
  it("separa 'Marca · presentación'", () => {
    expect(separarMarcaYUnidad("Carozzi · 400 g")).toEqual({ marca: "Carozzi", unidad: "400 g" });
    expect(separarMarcaYUnidad("Costa · 115 g / 4.06 oz")).toEqual({
      marca: "Costa",
      unidad: "115 g / 4.06 oz",
    });
  });

  it("con una sola parte distingue marca de cantidad", () => {
    expect(separarMarcaYUnidad("Supremo")).toEqual({ marca: "Supremo", unidad: "" });
    expect(separarMarcaYUnidad("40 g")).toEqual({ marca: null, unidad: "40 g" });
  });

  it("tolera descripciones vacías", () => {
    expect(separarMarcaYUnidad(null)).toEqual({ marca: null, unidad: "" });
    expect(separarMarcaYUnidad("")).toEqual({ marca: null, unidad: "" });
  });
});

describe("precioPorUnidad", () => {
  it("calcula por kilo y por litro cuando la presentación es una sola cantidad", () => {
    expect(precioPorUnidad(1290, "400 g")).toBe("$3.225 / kg");
    expect(precioPorUnidad(2890, "2 kg")).toBe("$1.445 / kg");
    expect(precioPorUnidad(2290, "1 L")).toBe("$2.290 / L");
    expect(precioPorUnidad(990, "350 ml")).toBe("$2.829 / L");
  });

  it("no inventa nada con presentaciones ambiguas", () => {
    expect(precioPorUnidad(290, "20g/1L")).toBe("");
    expect(precioPorUnidad(1890, "1500")).toBe("");
    expect(precioPorUnidad(1000, "")).toBe("");
  });
});

describe("rutaDesdeApi", () => {
  it("traduce /productos?category= a la ruta de categoría de la tienda", () => {
    expect(rutaDesdeApi("/productos?category=T%C3%A9%20e%20Infusiones")).toBe(
      "/categoria/te-e-infusiones",
    );
    expect(rutaDesdeApi("/productos?category=Galletas%20y%20Snacks")).toBe(
      "/categoria/galletas-y-snacks",
    );
    expect(rutaDesdeApi("/productos")).toBe("/categoria");
  });

  it("deja pasar rutas internas y URL externas, y descarta lo demás", () => {
    expect(rutaDesdeApi("/ofertas")).toBe("/ofertas");
    expect(rutaDesdeApi("https://www.sedyjo.com/x")).toBe("https://www.sedyjo.com/x");
    expect(rutaDesdeApi("javascript:alert(1)")).toBeNull();
    expect(rutaDesdeApi(null)).toBeNull();
  });
});

describe("banners", () => {
  const banner = (id: number, placement: string, extra: Record<string, unknown> = {}) =>
    bannerApiSchema.parse({
      id,
      placement,
      title: `Banner ${id}`,
      subtitle: "Subtítulo",
      image: `https://api.sedyjo.com/images/b${id}.jpg`,
      alt: null,
      linkUrl: "/productos?category=Bebidas",
      theme: "dorado",
      ctaLabel: "Comprar",
      position: id,
      ...extra,
    });
  const lista = [
    banner(3, "hero", { position: 2 }),
    banner(1, "hero", { position: 1, ctaLabel: null }),
    banner(4, "dark", { theme: "morado" }),
    banner(5, "modal"),
    banner(6, "modal"),
  ];

  it("ordena los principales por posición y deja el botón en null si falta el texto", () => {
    const principales = adaptarBannersPrincipales(lista);
    expect(principales.map((b) => b.id)).toEqual(["1", "3"]);
    expect(principales[0].boton).toBeNull();
    expect(principales[1].boton).toEqual({ texto: "Comprar", href: "/categoria/bebidas" });
    expect(principales[1].alt).toBe("Banner 3");
  });

  it("toma el color de los oscuros del tema", () => {
    const [oscuro] = adaptarBannersOscuros(lista);
    expect(oscuro).toMatchObject({ titular: "Banner 4", colorTitular: "morado", cta: "Comprar" });
  });

  it("arma la campaña del modal con sus diapositivas", () => {
    const campana = adaptarCampanaModal(lista);
    expect(campana).toMatchObject({ tipo: "galeria", activo: true, id: "api-5-6" });
    expect(campana?.slides).toHaveLength(2);
    expect(adaptarCampanaModal([banner(1, "hero")])).toBeNull();
  });
});

describe("ofertas de la API", () => {
  const conOferta = productoApiSchema.parse({
    id: 3,
    sku: "SED-003",
    slug: "coca-cola-zero",
    name: "Coca-Cola Zero",
    description: "Coca-Cola · 350 ml",
    category: "Bebidas",
    price: 1190,
    stock: 20,
    image: "https://api.sedyjo.com/images/3.webp",
    offerPrice: 893,
    discountPercent: 25,
  });
  const sinOferta = productoApiSchema.parse({
    id: 4,
    sku: "SED-004",
    name: "Crush",
    category: "Bebidas",
    price: 990,
    stock: 10,
    image: null,
  });

  it("cobra el precio de oferta y guarda el normal como anterior", () => {
    const [oferta, normal] = adaptarCatalogo([conOferta, sinOferta]);
    expect(oferta).toMatchObject({ precio: 893, precioAnterior: 1190, slug: "coca-cola-zero" });
    expect(normal).toMatchObject({ precio: 990, precioAnterior: null, slug: "crush" });
  });

  it("calcula el precio por unidad con el precio que se cobra", () => {
    const [oferta] = adaptarCatalogo([conOferta]);
    expect(oferta.precioPorUnidad).toBe("$2.551 / L");
  });

  it("deja primero en 'semana' lo que está en oferta", () => {
    const catalogo = adaptarCatalogo([sinOferta, conOferta]);
    expect(catalogo.find((p) => p.id === "3")?.colecciones).toEqual(["semana"]);
    expect(catalogo.find((p) => p.id === "4")?.colecciones).toEqual([]);
  });

  const ofertaDia = ofertaApiSchema.parse({
    id: 1,
    title: "Oferta del día",
    description: "25% en bebidas",
    image: "https://api.sedyjo.com/images/offer-daily.png",
    isDaily: true,
    products: [{ id: 3 }, { id: 4 }],
    endsAt: null,
  });
  const ofertaSemana = ofertaApiSchema.parse({
    id: 2,
    title: "20% en bebidas",
    position: 2,
    products: [{ id: 3 }],
    endsAt: "2026-12-31T23:59:59.000Z",
  });

  it("elige el producto con mayor descuento para la oferta del día", () => {
    const catalogo = adaptarCatalogo([sinOferta, conOferta]);
    const resultado = adaptarOfertaDelDia(ofertaDia, catalogo);
    expect(resultado?.producto.id).toBe("3");
    expect(resultado?.imagen).toBe("https://api.sedyjo.com/images/offer-daily.png");
    expect(adaptarOfertaDelDia(null, catalogo)).toBeNull();
  });

  it("la franja destacada usa la primera oferta que no es la del día", () => {
    const catalogo = adaptarCatalogo([sinOferta, conOferta]);
    const resultado = adaptarOfertaDestacada([ofertaDia, ofertaSemana], catalogo);
    expect(resultado).toMatchObject({
      titulo: "20% en bebidas",
      terminaEn: "2026-12-31T23:59:59.000Z",
    });
    expect(resultado?.productos.map((p) => p.id)).toEqual(["3"]);
    expect(adaptarOfertaDestacada([ofertaDia], catalogo)).toBeNull();
  });
});
