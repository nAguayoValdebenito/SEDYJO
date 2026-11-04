import type { Producto } from "@/types";
import { esOferta } from "./recomendaciones";

/** Desde esta cantidad hacia abajo se avisa "quedan pocas unidades". */
export const UMBRAL_POCAS_UNIDADES = 5;

export type EstadoStock = {
  tipo: "agotado" | "pocas" | "disponible";
  texto: string;
};

/** Estado de disponibilidad que se muestra en la ficha del producto. */
export function estadoStock(stock: number): EstadoStock {
  if (stock <= 0) return { tipo: "agotado", texto: "Agotado por ahora" };
  if (stock <= UMBRAL_POCAS_UNIDADES) {
    return { tipo: "pocas", texto: `Quedan pocas unidades (${stock})` };
  }
  return { tipo: "disponible", texto: "Disponible" };
}

/**
 * Productos relacionados con `actual`: primero los de su misma categoría y, si faltan, ofertas y
 * productos de otras categorías. Nunca incluye el propio producto ni agotados.
 */
export function seleccionarRelacionados(
  productos: Producto[],
  actual: Pick<Producto, "id" | "categoriaSlug">,
  limite: number,
): Producto[] {
  const disponibles = productos.filter((p) => p.id !== actual.id && p.stock > 0);
  const mismos = disponibles.filter((p) => p.categoriaSlug === actual.categoriaSlug);
  const otros = disponibles
    .filter((p) => p.categoriaSlug !== actual.categoriaSlug)
    .sort((a, b) => Number(esOferta(b)) - Number(esOferta(a)));
  return [...mismos, ...otros].slice(0, limite);
}
