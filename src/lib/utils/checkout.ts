import { COSTO_DESPACHO, DESPACHO_GRATIS_DESDE } from "@/lib/config";
import { checkoutSchema } from "@/lib/validation/checkout";
import type { DatosCheckout } from "@/types";

export const PASOS_CHECKOUT = ["datos", "pago", "confirmacion"] as const;
export type PasoCheckout = (typeof PASOS_CHECKOUT)[number];

export function siguientePaso(paso: PasoCheckout): PasoCheckout {
  return PASOS_CHECKOUT[Math.min(PASOS_CHECKOUT.indexOf(paso) + 1, PASOS_CHECKOUT.length - 1)];
}

export function anteriorPaso(paso: PasoCheckout): PasoCheckout {
  return PASOS_CHECKOUT[Math.max(PASOS_CHECKOUT.indexOf(paso) - 1, 0)];
}

export function puedeAvanzar(paso: PasoCheckout, datos: DatosCheckout): boolean {
  if (paso === "confirmacion") return false;
  return checkoutSchema.safeParse(datos).success;
}

/** Despacho gratis desde el monto mínimo; bajo ese monto, el costo (por confirmar si no está definido). */
export function calcularTotales(subtotal: number) {
  const despacho =
    DESPACHO_GRATIS_DESDE !== null && subtotal >= DESPACHO_GRATIS_DESDE ? 0 : COSTO_DESPACHO;
  return { subtotal, despacho, total: despacho === null ? null : subtotal + despacho };
}
