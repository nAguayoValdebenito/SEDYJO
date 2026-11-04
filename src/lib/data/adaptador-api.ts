import { z } from "zod";
import { formatoPrecio } from "@/lib/utils/format";
import type { Banner, BannerOscuro, CampanaModal, Categoria, Coleccion, Producto } from "@/types";

/**
 * Traduce lo que entrega la API de Sedyjo (`/api/v1`) a los contratos del frontend.
 * Son funciones puras (sin red) para poder probarlas.
 *
 * La API no entrega todavía: slug, precio anterior, ofertas ni colecciones del inicio. Esos
 * datos se derivan aquí o quedan vacíos hasta que el backend los incorpore.
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

export const categoriaApiSchema = z.object({
  name: z.string(),
  count: z.number().int(),
  image: z.string().nullable().optional(),
});

export const bannerApiSchema = z.object({
  id: z.number().int(),
  placement: z.string(),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  alt: z.string().nullable().optional(),
  linkUrl: z.string().nullable().optional(),
  theme: z.string().nullable().optional(),
  ctaLabel: z.string().nullable().optional(),
  position: z.number().optional(),
});

export const imagenesSitioApiSchema = z.record(
  z.string(),
  z.object({ url: z.string(), alt: z.string().nullable().optional() }),
);

export type ProductoApi = z.infer<typeof productoApiSchema>;
export type CategoriaApi = z.infer<typeof categoriaApiSchema>;
export type BannerApi = z.infer<typeof bannerApiSchema>;

/** Minúsculas, sin tildes y con guiones: "Té e Infusiones" → "te-e-infusiones". */
export function generarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Colores de fondo por categoría (decisión de diseño del frontend). */
const FONDOS_CATEGORIAS: Record<string, string> = {
  abarrotes: "#F6E3A1",
  bebidas: "#BFE0F7",
  confiteria: "#F8C9DA",
  "galletas-y-snacks": "#F3E0B5",
  "te-e-infusiones": "#C9E8B5",
};

const FONDO_POR_DEFECTO = "#E8F4EE";

export function fondoDeCategoria(slug: string): string {
  return FONDOS_CATEGORIAS[slug] ?? FONDO_POR_DEFECTO;
}

/** Lo que parece una cantidad ("400 g", "1 L", "160.0 g"), a diferencia de una marca. */
const PATRON_CANTIDAD = /^\d[\d.,]*\s*(?:g|kg|ml|l|lt|cc|un|oz)\b/i;
const PATRON_CANTIDAD_EXACTA = /^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|lt|cc)$/i;

/**
 * La API entrega "Marca · presentación" en la descripción ("Carozzi · 400 g").
 * Con una sola parte se decide si es una cantidad o una marca.
 */
export function separarMarcaYUnidad(descripcion: string | null | undefined): {
  marca: string | null;
  unidad: string;
} {
  const partes = (descripcion ?? "")
    .split("·")
    .map((parte) => parte.trim())
    .filter(Boolean);
  if (partes.length === 0) return { marca: null, unidad: "" };
  if (partes.length === 1) {
    return PATRON_CANTIDAD.test(partes[0])
      ? { marca: null, unidad: partes[0] }
      : { marca: partes[0], unidad: "" };
  }
  return { marca: partes[0], unidad: partes.slice(1).join(" · ") };
}

/** "$3.475 / kg" o "$2.290 / L" cuando la presentación es una sola cantidad medible. */
export function precioPorUnidad(precio: number, unidad: string): string {
  const coincidencia = PATRON_CANTIDAD_EXACTA.exec(unidad.trim());
  if (!coincidencia) return "";
  const cantidad = Number(coincidencia[1].replace(",", "."));
  if (!cantidad) return "";
  const medida = coincidencia[2].toLowerCase();
  if (medida === "kg") return `${formatoPrecio(Math.round(precio / cantidad))} / kg`;
  if (medida === "g") return `${formatoPrecio(Math.round((precio / cantidad) * 1000))} / kg`;
  if (medida === "l" || medida === "lt") {
    return `${formatoPrecio(Math.round(precio / cantidad))} / L`;
  }
  return `${formatoPrecio(Math.round((precio / cantidad) * 1000))} / L`;
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
  const { marca, unidad } = separarMarcaYUnidad(p.description);
  return {
    id: String(p.id),
    slug: generarSlug(p.name),
    nombre: p.name,
    descripcionCorta: p.description ?? "",
    categoriaSlug,
    etiqueta: p.category,
    precio: p.price,
    precioAnterior: null,
    unidad,
    precioPorUnidad: precioPorUnidad(p.price, unidad),
    stock: p.stock,
    imagenes: p.image ? [p.image] : [],
    marca,
    fondo: fondoDeCategoria(categoriaSlug),
    colecciones,
    promo: null,
  };
}

export function adaptarCatalogo(productos: ProductoApi[]): Producto[] {
  const colecciones = repartirColecciones(productos);
  return productos.map((p) => adaptarProducto(p, colecciones.get(p.id)));
}

/** Categorías con productos. Su foto es la de la API o, si falta, la de su primer producto. */
export function adaptarCategorias(
  categoriasApi: CategoriaApi[],
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
        imagen: c.image ?? conFoto?.imagenes[0] ?? null,
        sugerenciaFoto: `[foto: ${c.name.toLowerCase()}]`,
      };
    });
}

/**
 * Las rutas de la API apuntan a `/productos?category=Nombre`; en la tienda las categorías
 * viven en `/categoria/<slug>`. Las demás rutas internas y las URL `https://` pasan igual.
 */
export function rutaDesdeApi(linkUrl: string | null | undefined): string | null {
  const enlace = linkUrl?.trim();
  if (!enlace) return null;
  if (/^https?:\/\//i.test(enlace)) return enlace;
  if (!enlace.startsWith("/")) return null;

  const [ruta, consulta = ""] = enlace.split("?");
  if (ruta === "/productos") {
    const categoria = new URLSearchParams(consulta).get("category");
    return categoria ? `/categoria/${generarSlug(categoria)}` : "/categoria";
  }
  return enlace;
}

function conBoton(b: BannerApi): { texto: string; href: string } | null {
  const href = rutaDesdeApi(b.linkUrl);
  const texto = b.ctaLabel?.trim();
  return href && texto ? { texto, href } : null;
}

export function adaptarBannersPrincipales(banners: BannerApi[]): Banner[] {
  return banners
    .filter((b) => b.placement === "hero")
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((b) => ({
      id: String(b.id),
      etiqueta: "",
      titulo: b.title,
      texto: b.subtitle ?? "",
      boton: conBoton(b),
      imagen: b.image ?? null,
      alt: b.alt ?? b.title,
    }));
}

export function adaptarBannersOscuros(banners: BannerApi[]): BannerOscuro[] {
  return banners
    .filter((b) => b.placement === "dark" && b.image)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((b) => ({
      id: String(b.id),
      titular: b.title,
      detalle: b.subtitle ?? "",
      imagen: b.image as string,
      alt: b.alt ?? b.title,
      colorTitular: b.theme === "morado" ? "morado" : "dorado",
      href: rutaDesdeApi(b.linkUrl),
      cta: b.ctaLabel?.trim() || null,
    }));
}

/** Comportamiento del modal que decide el frontend (la API solo entrega las diapositivas). */
const FRECUENCIA_MODAL_HORAS = 24;
const RETRASO_MODAL_SEGUNDOS = 4;

export function adaptarCampanaModal(banners: BannerApi[]): CampanaModal | null {
  const slides = banners
    .filter((b) => b.placement === "modal")
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((b) => ({
      id: String(b.id),
      imagen: b.image ?? null,
      titulo: b.title,
      texto: b.subtitle ?? "",
      boton: conBoton(b),
    }));
  if (slides.length === 0) return null;

  return {
    // Cambia cuando cambian las diapositivas, para volver a mostrarlo a quien ya lo cerró.
    id: `api-${slides.map((s) => s.id).join("-")}`,
    activo: true,
    tipo: slides.length > 1 ? "galeria" : "simple",
    vigenciaHasta: null,
    frecuenciaHoras: FRECUENCIA_MODAL_HORAS,
    retrasoSegundos: RETRASO_MODAL_SEGUNDOS,
    slides,
  };
}
