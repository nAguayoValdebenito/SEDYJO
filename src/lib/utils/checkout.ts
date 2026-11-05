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
