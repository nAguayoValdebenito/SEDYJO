"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DatosCheckout, Pedido, ResultadoPago } from "@/types";

export const DATOS_INICIALES: DatosCheckout = {
  nombre: "",
  correo: "",
  telefono: "",
  metodoEntrega: "despacho",
  calle: "",
  numero: "",
  comuna: "",
  region: "",
  referencia: "",
  metodoPago: "webpay",
  usuarioId: null,
};

type EstadoCheckout = {
  datos: DatosCheckout;
  paso: "datos" | "pago";
  pedidoReciente: Pedido | null;
  carritoVaciado: boolean;
  motivoError: Extract<ResultadoPago, { ok: false }>["motivo"] | null;
  cambiarDatos: (cambio: Partial<DatosCheckout>) => void;
  cambiarPaso: (paso: "datos" | "pago") => void;
  guardarError: (motivo: EstadoCheckout["motivoError"]) => void;
  guardarPedido: (pedido: Pedido) => void;
  marcarCarritoVaciado: () => void;
  limpiarFormulario: () => void;
};

/** Estado de la compra en esta pestaña. Sin contraseñas ni datos de tarjeta. */
export const useCheckout = create<EstadoCheckout>()(
  persist(
    (set) => ({
      datos: DATOS_INICIALES,
      paso: "datos",
      pedidoReciente: null,
      carritoVaciado: false,
      motivoError: null,
      cambiarDatos: (cambio) => set((estado) => ({ datos: { ...estado.datos, ...cambio } })),
      cambiarPaso: (paso) => set({ paso }),
      guardarError: (motivoError) => set({ motivoError }),
      guardarPedido: (pedidoReciente) =>
        set({
          pedidoReciente,
          carritoVaciado: false,
          motivoError: null,
        }),
      marcarCarritoVaciado: () => set({ carritoVaciado: true }),
      limpiarFormulario: () => set({ datos: DATOS_INICIALES, paso: "datos" }),
    }),
    {
      name: "sedyjo-checkout",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (estado) => ({
        datos: estado.datos,
        paso: estado.paso,
        pedidoReciente: estado.pedidoReciente,
        carritoVaciado: estado.carritoVaciado,
        motivoError: estado.motivoError,
      }),
    },
  ),
);
