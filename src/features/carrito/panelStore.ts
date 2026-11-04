"use client";

import { create } from "zustand";

/** Estado del carrito lateral (mini-carrito). No se guarda: siempre arranca cerrado. */
type EstadoPanel = {
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
};

export const usePanelCarrito = create<EstadoPanel>()((set) => ({
  abierto: false,
  abrir: () => set({ abierto: true }),
  cerrar: () => set({ abierto: false }),
}));
