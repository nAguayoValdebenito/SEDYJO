import { z } from "zod";
import type { Categoria, Coleccion, Producto } from "@/types";

/**
 * Traduce lo que entrega la API de Sedyjo (`/api/v1`) a los contratos del frontend.
 * Son funciones puras (sin red) para poder probarlas.
 *
 * La API no entrega todavía: slug, precio anterior, ofertas, marca, unidad ni colecciones del
 * inicio. Esos datos se derivan aquí o quedan vacíos hasta que el backend los incorpore.
 */

export const productoApiSchema = z.object({
  id: z.number().int(),
  sku: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  category: z.string(),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  image: z.string().nullable().optional(),
});

export const respuestaProductosSchema = z.object({
  data: z.array(productoApiSchema),
  meta: z.object({ page: z.number(), totalPages: z.number() }),
});

export type ProductoApi = z.infer<typeof productoApiSchema>;

/** Minúsculas, sin tildes y con guiones: "Frutas y Verduras" → "frutas-y-verduras". */
export function generarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Colores de fondo y texto sugerido de la foto, por categoría (decisión de diseño del frontend). */
const PRESENTACION_CATEGORIAS: Record<string, string> = {
  bebidas: "#BFE0F7",
  belleza: "#F8C9DA",
  carnes: "#F5C6C0",
  cocina: "#F6E3A1",
  congelados: "#CFE6F5",
  despensa: "#F3E0B5",
  "frutas-y-verduras": "#C9E8B5",
  "hogar-y-decoracion": "#E3D3F5",
  mascotas: "#BFE8DF",
};

const FONDO_POR_DEFECTO = "#E8F4EE";

export function fondoDeCategoria(slug: string): string {
  return PRESENTACION_CATEGORIAS[slug] ?? FONDO_POR_DEFECTO;
}

/**
 * Reparte las colecciones del inicio entre categorías distintas (una de cada una por vuelta).
 * Es provisorio: cuando el backend permita marcar destacados, se reemplaza por ese dato.
 */
export function repartirColecciones(productos: ProductoApi[]): Map<number, Coleccion[]> {
  const porCategoria = new Map<string, ProductoApi[]>();
  for (const p of productos.filter((p) => p.stock > 0 && p.image)) {
    const lista = porCategoria.get(p.category) ?? [];
    lista.push(p);
    porCategoria.set(p.category, lista);
  }
  const grupos = [...porCategoria.entries()].sort(([a], [b]) => a.localeCompare(b, "es"));

  const intercalados: ProductoApi[] = [];
  for (let ronda = 0; intercalados.length < productos.length; ronda++) {
    let agregado = false;
    for (const [, lista] of grupos) {
      if (lista[ronda]) {
        intercalados.push(lista[ronda]);
        agregado = true;
      }
    }
    if (!agregado) break;
  }

  const colecciones = new Map<number, Coleccion[]>();
  intercalados.slice(0, 10).forEach((p) => colecciones.set(p.id, ["semana"]));
  intercalados.slice(-4).forEach((p) => {
    colecciones.set(p.id, [...(colecciones.get(p.id) ?? []), "exclusivo-online"]);
  });
  return colecciones;
}

export function adaptarProducto(p: ProductoApi, colecciones: Coleccion[] = []): Producto {
  const categoriaSlug = generarSlug(p.category);
  return {
    id: String(p.id),
    slug: generarSlug(p.name),
    nombre: p.name,
    descripcionCorta: p.description ?? "",
    categoriaSlug,
    etiqueta: p.category,
    precio: p.price,
    precioAnterior: null,
    unidad: "",
    precioPorUnidad: "",
    stock: p.stock,
    imagenes: p.image ? [p.image] : [],
    marca: null,
    fondo: fondoDeCategoria(categoriaSlug),
    colecciones,
    promo: null,
  };
}

export function adaptarCatalogo(productos: ProductoApi[]): Producto[] {
  const colecciones = repartirColecciones(productos);
  return productos.map((p) => adaptarProducto(p, colecciones.get(p.id)));
}

/** Categorías a partir de los productos: la foto es la de su primer producto con foto. */
export function adaptarCategorias(
  categoriasApi: { name: string; count: number }[],
  productos: Producto[],
): Categoria[] {
  return categoriasApi
    .filter((c) => c.count > 0)
    .map((c) => {
      const slug = generarSlug(c.name);
      const conFoto = productos.find((p) => p.categoriaSlug === slug && p.imagenes[0]);
      return {
        id: `cat-${slug}`,
        slug,
        nombre: c.name,
        fondo: fondoDeCategoria(slug),
        imagen: conFoto?.imagenes[0] ?? null,
        sugerenciaFoto: `[foto: ${c.name.toLowerCase()}]`,
      };
    });
}
