import type { Producto } from "@/types";
import { porcentajeDescuento } from "./format";

/** Un producto está en oferta si tiene rebaja real o un texto promocional. */
export function esOferta(producto: Producto): boolean {
  return (
    Boolean(producto.promo) ||
    porcentajeDescuento(producto.precio, producto.precioAnterior) !== null
  );
}

type Opciones = {
  /** Se omiten los productos de esta categoría (la que el cliente ya está viendo). */
  excluirCategoriaSlug?: string;
  /** Se omiten estos productos (ya mostrados en la página). */
  excluirIds?: string[];
  limite: number;
  soloOfertas?: boolean;
  /** Reparte los resultados entre categorías (uno por categoría y vuelta). */
  variarCategorias?: boolean;
};

/**
 * Elige productos para "Ofertas que te pueden servir" y "Recomendados para ti".
 * Nunca incluye agotados. Las ofertas van de mayor a menor descuento; el resto, por id.
 */
export function seleccionarRecomendaciones(
  productos: Producto[],
  {
    excluirCategoriaSlug,
    excluirIds = [],
    limite,
    soloOfertas = false,
    variarCategorias = false,
  }: Opciones,
): Producto[] {
  const excluidos = new Set(excluirIds);

  const candidatos = productos
    .filter(
      (p) =>
        p.stock > 0 &&
        !excluidos.has(p.id) &&
        p.categoriaSlug !== excluirCategoriaSlug &&
        (!soloOfertas || esOferta(p)),
    )
    .map((p) => ({
      p,
      descuento: porcentajeDescuento(p.precio, p.precioAnterior) ?? (p.promo ? 1 : 0),
    }))
    .sort((a, b) => b.descuento - a.descuento || a.p.id.localeCompare(b.p.id))
    .map(({ p }) => p);

  if (!variarCategorias) return candidatos.slice(0, limite);

  const porCategoria = new Map<string, Producto[]>();
  for (const p of candidatos) {
    porCategoria.set(p.categoriaSlug, [...(porCategoria.get(p.categoriaSlug) ?? []), p]);
  }

  const resultado: Producto[] = [];
  const colas = [...porCategoria.values()];
  while (resultado.length < limite && colas.some((c) => c.length > 0)) {
    for (const cola of colas) {
      const siguiente = cola.shift();
      if (siguiente && resultado.length < limite) resultado.push(siguiente);
    }
  }
  return resultado;
}
