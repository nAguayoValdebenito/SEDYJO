import { describe, expect, it } from "vitest";
import type { Producto } from "@/types";
import {
  migasJsonLd,
  organizacionJsonLd,
  productoJsonLd,
  serializarJsonLd,
  sitioWebJsonLd,
  urlAbsoluta,
} from "./jsonld";

const producto: Producto = {
  id: "p-1",
  slug: "leche-entera-1-l",
  nombre: "Leche entera 1 L",
  descripcionCorta: "Leche entera.",
  categoriaSlug: "abarrotes",
  etiqueta: "Abarrotes",
  precio: 1090,
  precioAnterior: null,
  unidad: "1 L",
  precioPorUnidad: "$1.090 / L",
  stock: 10,
  imagenes: ["/images/productos/leche.webp"],
  marca: "Marca X",
  fondo: "#fff",
  colecciones: [],
  promo: null,
};

describe("urlAbsoluta", () => {
  it("antepone el dominio a las rutas y respeta las direcciones completas", () => {
    expect(urlAbsoluta("/ofertas")).toMatch(/^https?:\/\/[^/]+\/ofertas$/);
    expect(urlAbsoluta("ofertas")).toMatch(/\/ofertas$/);
    expect(urlAbsoluta("https://otro.cl/x")).toBe("https://otro.cl/x");
  });
});

describe("serializarJsonLd", () => {
  it("escapa el signo < para no cerrar el script", () => {
    expect(serializarJsonLd({ a: "</script>" })).not.toContain("</script>");
  });
});

describe("productoJsonLd", () => {
  it("incluye precio en CLP, disponibilidad e imágenes absolutas", () => {
    const d = productoJsonLd(producto, { nombre: "Abarrotes" });
    expect(d["@type"]).toBe("Product");
    expect(d.offers.priceCurrency).toBe("CLP");
    expect(d.offers.price).toBe(1090);
    expect(d.offers.availability).toBe("https://schema.org/InStock");
    expect(d.image?.[0]).toMatch(/^https?:\/\//);
    expect(d.brand?.name).toBe("Marca X");
  });
  it("marca agotado y omite imagen y marca si no existen", () => {
    const d = productoJsonLd({ ...producto, stock: 0, imagenes: [], marca: null });
    expect(d.offers.availability).toBe("https://schema.org/OutOfStock");
    expect("image" in d).toBe(false);
    expect("brand" in d).toBe(false);
  });
});

describe("migasJsonLd y sitio", () => {
  it("numera las migas desde 1 con direcciones completas", () => {
    const d = migasJsonLd([
      { nombre: "Inicio", ruta: "/" },
      { nombre: "Ofertas", ruta: "/ofertas" },
    ]);
    expect(d.itemListElement.map((e) => e.position)).toEqual([1, 2]);
    expect(d.itemListElement[1]?.item).toMatch(/\/ofertas$/);
  });
  it("describe la tienda y su buscador", () => {
    expect(organizacionJsonLd().address.addressCountry).toBe("CL");
    expect(sitioWebJsonLd().potentialAction.target).toContain("{search_term_string}");
  });
});
