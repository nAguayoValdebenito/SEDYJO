import { cacheLife } from "next/cache";
import { coincideBusqueda } from "@/lib/utils/busqueda";
import { seleccionarRelacionados } from "@/lib/utils/producto";
import { seleccionarRecomendaciones } from "@/lib/utils/recomendaciones";
import type { Coleccion, OfertaDelDia, OfertaDestacada, Producto } from "@/types";
import { adaptarOfertaDelDia, adaptarOfertaDestacada } from "./adaptador-api";
import { obtenerCatalogo, obtenerOfertaDelDia, obtenerOfertas } from "./catalogo-api";

/**
 * Acceso a datos de productos.
 * Lee el catálogo de la API de Sedyjo (ver `catalogo-api.ts`). Las pantallas no conocen la API:
 * solo usan estas funciones.
 */

export async function getProducts(filtro?: {
  coleccion?: Coleccion;
  categoriaSlug?: string;
}): Promise<Producto[]> {
  "use cache";
  cacheLife("catalogo");

  let productos = await obtenerCatalogo();
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
  cacheLife("catalogo");

  return (await obtenerCatalogo())
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
  cacheLife("catalogo");

  return seleccionarRecomendaciones(await obtenerCatalogo(), opciones);
}

export async function getProductBySlug(slug: string): Promise<Producto | null> {
  "use cache";
  cacheLife("catalogo");

  const productos = await obtenerCatalogo();
  return productos.find((p) => p.slug === slug) ?? null;
}

/**
 * Oferta del día para el panel de ingreso (`GET /offers/daily`): su producto con mayor descuento
 * y la imagen de la oferta. `null` si hoy no hay ninguna.
 */
export async function getOfertaDelDia(): Promise<OfertaDelDia | null> {
  "use cache";
  cacheLife("catalogo");

  const [oferta, catalogo] = await Promise.all([obtenerOfertaDelDia(), obtenerCatalogo()]);
  return adaptarOfertaDelDia(oferta, catalogo);
}

/** Oferta vigente para la franja oscura de la portada (`GET /offers`), con hasta 4 productos. */
export async function getOfertaDestacada(): Promise<OfertaDestacada | null> {
  "use cache";
  cacheLife("catalogo");

  const [ofertas, catalogo] = await Promise.all([obtenerOfertas(), obtenerCatalogo()]);
  return adaptarOfertaDestacada(ofertas, catalogo);
}

/** Productos relacionados con uno dado (misma categoría primero). */
export async function getRelatedProducts(slug: string, limite: number): Promise<Producto[]> {
  "use cache";
  cacheLife("catalogo");

  const productos = await obtenerCatalogo();
  const actual = productos.find((p) => p.slug === slug);
  if (!actual) return [];
  return seleccionarRelacionados(productos, actual, limite);
}
