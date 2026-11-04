import { cacheLife } from "next/cache";
import { coincideBusqueda } from "@/lib/utils/busqueda";
import { seleccionarRelacionados } from "@/lib/utils/producto";
import { seleccionarRecomendaciones } from "@/lib/utils/recomendaciones";
import { productoSchema } from "@/lib/validation/schemas";
import type { Coleccion, Producto } from "@/types";
import productosMock from "./mock/productos.json";

/**
 * Acceso a datos de productos.
 * Hoy lee JSON simulados; cuando exista el backend solo cambia el interior
 * de estas funciones (las pantallas no se tocan).
 */

export async function getProducts(filtro?: {
  coleccion?: Coleccion;
  categoriaSlug?: string;
}): Promise<Producto[]> {
  "use cache";
  cacheLife("hours");

  let productos = productoSchema.array().parse(productosMock);
  if (filtro?.coleccion) {
    const coleccion = filtro.coleccion;
    productos = productos.filter((p) => p.colecciones.includes(coleccion));
  }
  if (filtro?.categoriaSlug) {
    const categoriaSlug = filtro.categoriaSlug;
    productos = productos.filter((p) => p.categoriaSlug === categoriaSlug);
  }
  return productos;
}

/** Búsqueda por texto (y categoría opcional) sobre nombre, descripción, etiqueta y marca. */
export async function searchProducts(
  consulta: string,
  categoriaSlug?: string,
): Promise<Producto[]> {
  "use cache";
  cacheLife("minutes");

  return productoSchema
    .array()
    .parse(productosMock)
    .filter((p) => !categoriaSlug || p.categoriaSlug === categoriaSlug)
    .filter((p) => coincideBusqueda([p.nombre, p.descripcionCorta, p.etiqueta, p.marca], consulta));
}

/** Ofertas y recomendaciones de otras categorías para las vistas de categoría y búsqueda. */
export async function getRecommendations(opciones: {
  excluirCategoriaSlug?: string;
  excluirIds?: string[];
  limite: number;
  soloOfertas?: boolean;
  variarCategorias?: boolean;
}): Promise<Producto[]> {
  "use cache";
  cacheLife("hours");

  return seleccionarRecomendaciones(productoSchema.array().parse(productosMock), opciones);
}

export async function getProductBySlug(slug: string): Promise<Producto | null> {
  "use cache";
  cacheLife("hours");

  const productos = productoSchema.array().parse(productosMock);
  return productos.find((p) => p.slug === slug) ?? null;
}

/**
 * Oferta del día: el producto con stock y mayor descuento. Hoy se calcula sobre los datos
 * simulados; con el backend podrá definirla el administrador.
 */
export async function getOfertaDelDia(): Promise<Producto | null> {
  "use cache";
  cacheLife("hours");

  const productos = productoSchema.array().parse(productosMock);
  const conDescuento = productos.filter(
    (p) => p.stock > 0 && p.precioAnterior !== null && p.precioAnterior > p.precio,
  );
  conDescuento.sort(
    (a, b) => 1 - b.precio / (b.precioAnterior ?? 1) - (1 - a.precio / (a.precioAnterior ?? 1)),
  );
  return conDescuento[0] ?? null;
}

/** Productos relacionados con uno dado (misma categoría primero). */
export async function getRelatedProducts(slug: string, limite: number): Promise<Producto[]> {
  "use cache";
  cacheLife("hours");

  const productos = productoSchema.array().parse(productosMock);
  const actual = productos.find((p) => p.slug === slug);
  if (!actual) return [];
  return seleccionarRelacionados(productos, actual, limite);
}
