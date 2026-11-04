import {
  CORREO_CONTACTO,
  DESCRIPCION_SITIO,
  NOMBRE_SITIO,
  TELEFONO_CONTACTO,
  URL_SITIO,
} from "@/lib/config";
import type { Categoria, Producto } from "@/types";

/** Convierte una ruta ("/producto/x") en dirección completa de la tienda. */
export function urlAbsoluta(ruta: string): string {
  if (/^https?:\/\//.test(ruta)) return ruta;
  return `${URL_SITIO}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
}

/** Texto seguro para incrustar en un `<script>`: evita cerrar la etiqueta desde el contenido. */
export function serializarJsonLd(datos: unknown): string {
  return JSON.stringify(datos).replace(/</g, "\\u003c");
}

/** La tienda como negocio local (datos de contacto y dirección). */
export function organizacionJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    name: NOMBRE_SITIO,
    description: DESCRIPCION_SITIO,
    url: URL_SITIO,
    logo: urlAbsoluta("/logo.webp"),
    image: urlAbsoluta("/logo.webp"),
    telephone: TELEFONO_CONTACTO,
    email: CORREO_CONTACTO,
    address: {
      "@type": "PostalAddress",
      addressLocality: "San Pedro de la Paz",
      addressRegion: "Biobío",
      addressCountry: "CL",
    },
    currenciesAccepted: "CLP",
  };
}

/** El sitio, con su buscador (permite la búsqueda directa desde los resultados de Google). */
export function sitioWebJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: NOMBRE_SITIO,
    url: URL_SITIO,
    inLanguage: "es-CL",
    potentialAction: {
      "@type": "SearchAction",
      target: `${URL_SITIO}/buscar?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export type ElementoMiga = { nombre: string; ruta: string };

/** Ruta de navegación (inicio › categoría › producto). */
export function migasJsonLd(elementos: ElementoMiga[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: elementos.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.nombre,
      item: urlAbsoluta(e.ruta),
    })),
  };
}

/** Ficha de producto con su oferta (precio en CLP y disponibilidad). */
export function productoJsonLd(producto: Producto, categoria?: Pick<Categoria, "nombre">) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcionCorta,
    sku: producto.id,
    ...(producto.marca ? { brand: { "@type": "Brand", name: producto.marca } } : {}),
    ...(categoria ? { category: categoria.nombre } : {}),
    ...(producto.imagenes.length > 0 ? { image: producto.imagenes.map(urlAbsoluta) } : {}),
    offers: {
      "@type": "Offer",
      url: urlAbsoluta(`/producto/${producto.slug}`),
      priceCurrency: "CLP",
      price: producto.precio,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        producto.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}
