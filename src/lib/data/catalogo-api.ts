import { cacheLife } from "next/cache";
import { z } from "zod";
import { URL_API } from "@/lib/config";
import type { Banner, BannerOscuro, CampanaModal, Categoria, Despacho, Producto } from "@/types";
import {
  adaptarBannersOscuros,
  adaptarBannersPrincipales,
  adaptarCampanaModal,
  adaptarCatalogo,
  adaptarCategorias,
  bannerApiSchema,
  categoriaApiSchema,
  imagenesSitioApiSchema,
  ofertaApiSchema,
  respuestaProductosSchema,
  type OfertaApi,
  type ProductoApi,
} from "./adaptador-api";
import { adaptarDespacho, despachoApiSchema } from "./adaptador-pedidos";

/**
 * Lectura de la API de Sedyjo (solo servidor). Es la única parte del frontend que habla con
 * ella; el resto de la tienda usa `getProducts`, `getCategories`, etc.
 */

const POR_PAGINA = 100;

const categoriasApiSchema = z.object({ data: z.array(categoriaApiSchema) });
const bannersApiSchema = z.object({ data: z.array(bannerApiSchema) });
const imagenesSitioRespuestaSchema = z.object({ data: imagenesSitioApiSchema });

async function pedirJson(ruta: string): Promise<unknown> {
  const respuesta = await fetch(`${URL_API}/api/v1${ruta}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!respuesta.ok) {
    throw new Error(`La API de Sedyjo respondió ${respuesta.status} en ${ruta}.`);
  }
  return respuesta.json();
}

/** Todos los productos activos (recorre las páginas de la API). */
export async function obtenerCatalogo(): Promise<Producto[]> {
  "use cache";
  cacheLife("minutes");

  const productos: ProductoApi[] = [];
  let pagina = 1;
  let totalPaginas = 1;
  do {
    const { data, meta } = respuestaProductosSchema.parse(
      await pedirJson(`/products?limit=${POR_PAGINA}&page=${pagina}`),
    );
    productos.push(...data);
    totalPaginas = meta.totalPages;
    pagina += 1;
  } while (pagina <= totalPaginas);

  return adaptarCatalogo(productos);
}

export async function obtenerCategorias(): Promise<Categoria[]> {
  "use cache";
  cacheLife("minutes");

  const { data } = categoriasApiSchema.parse(await pedirJson("/categories"));
  return adaptarCategorias(data, await obtenerCatalogo());
}

type BannersDeLaPagina = {
  principales: Banner[];
  oscuros: BannerOscuro[];
  campanaModal: CampanaModal | null;
};

/**
 * Banners activos y vigentes (hero, dark y modal). Si la API falla, la portada sigue funcionando
 * sin banners en vez de caerse.
 */
export async function obtenerBanners(): Promise<BannersDeLaPagina> {
  "use cache";
  cacheLife("minutes");

  try {
    const { data } = bannersApiSchema.parse(await pedirJson("/banners"));
    return {
      principales: adaptarBannersPrincipales(data),
      oscuros: adaptarBannersOscuros(data),
      campanaModal: adaptarCampanaModal(data),
    };
  } catch {
    return { principales: [], oscuros: [], campanaModal: null };
  }
}

/**
 * Imágenes sueltas del sitio que se cambian sin tocar el código (`logo`, `favicon`, ...),
 * por clave. Si una clave no existe, la tienda usa su imagen por defecto.
 */
export async function obtenerImagenesSitio(): Promise<
  Record<string, { url: string; alt: string }>
> {
  "use cache";
  cacheLife("minutes");

  try {
    const { data } = imagenesSitioRespuestaSchema.parse(await pedirJson("/site-images"));
    return Object.fromEntries(
      Object.entries(data).map(([clave, imagen]) => [
        clave,
        { url: imagen.url, alt: imagen.alt ?? "" },
      ]),
    );
  } catch {
    return {};
  }
}

/**
 * Reglas de despacho vigentes: monto para despacho gratis, plazo y comunas atendidas con su costo.
 * Si la API falla devuelve `null` y cada pantalla avisa que no pudo cargarlas.
 */
export async function obtenerDespacho(): Promise<Despacho | null> {
  "use cache";
  cacheLife("minutes");

  try {
    return adaptarDespacho(despachoApiSchema.parse(await pedirJson("/shipping")).data);
  } catch {
    return null;
  }
}

/** Ofertas vigentes con sus productos (`GET /offers`). Si la API falla, no hay ofertas destacadas. */
export async function obtenerOfertas(): Promise<OfertaApi[]> {
  "use cache";
  cacheLife("minutes");

  try {
    return z.object({ data: z.array(ofertaApiSchema) }).parse(await pedirJson("/offers")).data;
  } catch {
    return [];
  }
}

/** La oferta del día vigente (`GET /offers/daily`), o `null` si no hay. */
export async function obtenerOfertaDelDia(): Promise<OfertaApi | null> {
  "use cache";
  cacheLife("minutes");

  try {
    return z.object({ data: ofertaApiSchema.nullable() }).parse(await pedirJson("/offers/daily"))
      .data;
  } catch {
    return null;
  }
}
