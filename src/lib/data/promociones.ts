import { cacheLife } from "next/cache";
import { campanaModalSchema } from "@/lib/validation/schemas";
import type { CampanaModal } from "@/types";
import campanaMock from "./mock/campana-modal.json";

/**
 * Campaña del modal de ofertas especiales.
 * Hoy lee un JSON simulado (`mock/campana-modal.json`: `activo: true` la enciende); cuando
 * exista el panel de administración solo cambia el interior de esta función.
 * Devuelve `null` si el administrador no la ha activado. En desarrollo `incluirInactiva`
 * permite previsualizarla con `?promo=simple` o `?promo=galeria`.
 */
export async function getCampanaModal(opciones?: {
  incluirInactiva?: boolean;
}): Promise<CampanaModal | null> {
  "use cache";
  cacheLife("minutes");

  const campana = campanaModalSchema.parse(campanaMock);
  if (campana.slides.length === 0) return null;
  return campana.activo || opciones?.incluirInactiva ? campana : null;
}
