"use client";

import { useSyncExternalStore } from "react";

const sinSuscripcion = () => () => {};

/**
 * `false` en el servidor y en la primera pintura del cliente; `true` después.
 * Evita diferencias de hidratación con el carrito guardado en localStorage.
 */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  );
}
