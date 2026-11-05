import { cacheLife } from "next/cache";
import type { Despacho } from "@/types";
import { obtenerDespacho } from "./catalogo-api";

/** Reglas de despacho (gratis desde, plazo y comunas con su costo) desde la API de Sedyjo. */
export async function getDespacho(): Promise<Despacho | null> {
  "use cache";
  cacheLife("catalogo");

  return obtenerDespacho();
}
