import { cacheLife } from "next/cache";
import type { Banner, BannerOscuro } from "@/types";
import { obtenerBanners } from "./catalogo-api";

type Banners = { principales: Banner[]; oscuros: BannerOscuro[] };

/** Banners de la portada (carrusel principal y banners oscuros), desde la API de Sedyjo. */
export async function getBanners(): Promise<Banners> {
  "use cache";
  cacheLife("catalogo");

  const { principales, oscuros } = await obtenerBanners();
  return { principales, oscuros };
}
