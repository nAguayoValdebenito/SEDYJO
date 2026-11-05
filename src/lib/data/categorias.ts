import { cacheLife } from "next/cache";
import type { Categoria } from "@/types";
import { obtenerCategorias } from "./catalogo-api";

/** Categorías con productos, tal como las entrega la API de Sedyjo. */
export async function getCategories(): Promise<Categoria[]> {
  "use cache";
  cacheLife("catalogo");

  return obtenerCategorias();
}
