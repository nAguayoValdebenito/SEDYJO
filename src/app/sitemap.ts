import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/data";
import { urlAbsoluta } from "@/lib/seo/jsonld";

/** Páginas que los buscadores deben conocer: sin cuenta, carrito, pago ni seguimiento. */
const RUTAS_FIJAS: { ruta: string; prioridad: number }[] = [
  { ruta: "/", prioridad: 1 },
  { ruta: "/categoria", prioridad: 0.8 },
  { ruta: "/ofertas", prioridad: 0.8 },
  { ruta: "/despachos", prioridad: 0.5 },
  { ruta: "/preguntas-frecuentes", prioridad: 0.5 },
  { ruta: "/cambios-y-devoluciones", prioridad: 0.3 },
  { ruta: "/quienes-somos", prioridad: 0.3 },
  { ruta: "/ayuda", prioridad: 0.3 },
  { ruta: "/terminos", prioridad: 0.2 },
  { ruta: "/privacidad", prioridad: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categorias, productos] = await Promise.all([getCategories(), getProducts()]);

  return [
    ...RUTAS_FIJAS.map(({ ruta, prioridad }) => ({
      url: urlAbsoluta(ruta),
      priority: prioridad,
    })),
    ...categorias.map((c) => ({
      url: urlAbsoluta(`/categoria/${c.slug}`),
      priority: 0.8,
    })),
    ...productos.map((p) => ({
      url: urlAbsoluta(`/producto/${p.slug}`),
      priority: 0.6,
    })),
  ];
}
