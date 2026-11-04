import { cacheLife } from "next/cache";
import { z } from "zod";
import { URL_API } from "@/lib/config";
import type { Categoria, Producto } from "@/types";
import {
  adaptarCatalogo,
  adaptarCategorias,
  respuestaProductosSchema,
  type ProductoApi,
} from "./adaptador-api";

/**
 * Lectura de la API de Sedyjo (solo servidor). Es la única parte del frontend que habla con
 * ella; el resto de la tienda usa `getProducts`, `getCategories`, etc.
 */

const POR_PAGINA = 100;

const categoriasApiSchema = z.object({
  data: z.array(z.object({ name: z.string(), count: z.number().int() })),
});

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
