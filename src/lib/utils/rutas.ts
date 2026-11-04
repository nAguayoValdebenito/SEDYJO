/**
 * Ruta a la que volver tras iniciar sesión (`?volver=/carrito`). Solo se aceptan rutas internas;
 * cualquier otra cosa (otro sitio, `//dominio`, barras invertidas) cae en `respaldo`.
 */
export function rutaSegura(volver: string | null | undefined, respaldo = "/cuenta"): string {
  if (!volver) return respaldo;
  if (!volver.startsWith("/") || volver.startsWith("//") || volver.includes("\\")) return respaldo;
  return volver;
}
