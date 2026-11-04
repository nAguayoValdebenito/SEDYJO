import { cacheLife } from "next/cache";
import { obtenerImagenesSitio } from "./catalogo-api";

/** Imágenes del sitio editables desde el panel (por clave: `logo`, `favicon`, ...). */
export async function getImagenesSitio(): Promise<Record<string, { url: string; alt: string }>> {
  "use cache";
  cacheLife("minutes");

  return obtenerImagenesSitio();
}
