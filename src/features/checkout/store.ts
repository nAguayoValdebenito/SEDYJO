"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DatosCheckout, Pedido, ResultadoPago } from "@/types";

type ResumenValidado = Pick<Pedido, "items" | "subtotal" | "despacho" | "total">;

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
  token: string | null;
  resumenValidado: ResumenValidado | null;
  pedidoReciente: Pedido | null;
  carritoVaciado: boolean;
  motivoError: Extract<ResultadoPago, { ok: false }>["motivo"] | null;
  cambiarDatos: (cambio: Partial<DatosCheckout>) => void;
  cambiarPaso: (paso: "datos" | "pago") => void;
  guardarToken: (token: string, resumen: ResumenValidado) => void;
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
      token: null,
      resumenValidado: null,
      pedidoReciente: null,
      carritoVaciado: false,
      motivoError: null,
      cambiarDatos: (cambio) => set((estado) => ({ datos: { ...estado.datos, ...cambio } })),
      cambiarPaso: (paso) => set({ paso }),
      guardarToken: (token, resumenValidado) => set({ token, resumenValidado, motivoError: null }),
      guardarError: (motivoError) => set({ token: null, resumenValidado: null, motivoError }),
      guardarPedido: (pedidoReciente) =>
        set({
          token: null,
          resumenValidado: null,
          pedidoReciente,
          carritoVaciado: false,
          motivoError: null,
        }),
      marcarCarritoVaciado: () => set({ carritoVaciado: true }),
      limpiarFormulario: () =>
        set({ datos: DATOS_INICIALES, paso: "datos", token: null, resumenValidado: null }),
    }),
    {
      name: "sedyjo-checkout-demo",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (estado) => ({
        datos: estado.datos,
        paso: estado.paso,
        token: estado.token,
        resumenValidado: estado.resumenValidado,
        pedidoReciente: estado.pedidoReciente,
        carritoVaciado: estado.carritoVaciado,
        motivoError: estado.motivoError,
      }),
    },
  ),
);
