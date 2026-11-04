export type ProgresoDespacho = {
  /** Cuánto falta para el despacho gratis (0 si ya se alcanzó). */
  faltante: number;
  /** Avance entre 0 y 1. */
  avance: number;
  completo: boolean;
};

/** Avance hacia el despacho gratis según el subtotal del carrito. */
export function progresoDespacho(subtotal: number, umbral: number): ProgresoDespacho {
  const avance = umbral > 0 ? Math.min(Math.max(subtotal / umbral, 0), 1) : 1;
  return {
    faltante: Math.max(umbral - subtotal, 0),
    avance,
    completo: subtotal >= umbral,
  };
}
