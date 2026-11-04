import type { Metadata } from "next";
import { NOMBRE_SITIO } from "@/lib/config";

/**
 * Open Graph completo de una página (para compartir en redes y mensajería). Una página que define
 * su propio `openGraph` reemplaza al del sitio, así que aquí se repiten el tipo, el nombre del
 * sitio, el idioma y la imagen por defecto (`/opengraph-image`).
 */
export function openGraphPagina(opciones: {
  titulo: string;
  descripcion: string;
  ruta: string;
  /** Imagen propia (por ejemplo la foto del producto); sin ella se usa la del sitio. */
  imagen?: string;
}): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    siteName: NOMBRE_SITIO,
    locale: "es_CL",
    title: opciones.titulo,
    description: opciones.descripcion,
    url: opciones.ruta,
    images: [
      opciones.imagen
        ? { url: opciones.imagen, alt: opciones.titulo }
        : { url: "/opengraph-image", width: 1200, height: 630, alt: NOMBRE_SITIO },
    ],
  };
}
