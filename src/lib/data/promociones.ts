import { cacheLife } from "next/cache";
import type { CampanaModal } from "@/types";
import { obtenerBanners } from "./catalogo-api";

/**
 * Campaña del modal de ofertas especiales: las diapositivas son los banners `modal` activos y
 * vigentes de la API. Devuelve `null` si no hay ninguno.
 */
export async function getCampanaModal(): Promise<CampanaModal | null> {
  "use cache";
  cacheLife("catalogo");

  return (await obtenerBanners()).campanaModal;
}
