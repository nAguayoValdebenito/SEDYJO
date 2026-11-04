import { cacheLife } from "next/cache";
import { categoriaSchema } from "@/lib/validation/schemas";
import type { Categoria } from "@/types";
import categoriasMock from "./mock/categorias.json";

export async function getCategories(): Promise<Categoria[]> {
  "use cache";
  cacheLife("hours");

  return categoriaSchema.array().parse(categoriasMock);
}
