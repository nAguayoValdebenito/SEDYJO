"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ItemCarrito } from "@/types";

/** Lo mínimo que el carrito necesita saber de un producto. */
export type ProductoParaCarrito = Omit<ItemCarrito, "cantidad">;

type EstadoCarrito = {
  items: ItemCarrito[];
  agregar: (producto: ProductoParaCarrito) => void;
  /** Suma varias unidades de una vez (por ejemplo al volver a comprar un pedido). */
  agregarCantidad: (producto: ProductoParaCarrito, cantidad: number) => void;
  cambiarCantidad: (productoId: string, diferencia: number) => void;
  quitar: (productoId: string) => void;
  vaciar: () => void;
};

export const useCarrito = create<EstadoCarrito>()(
  persist(
    (set) => ({
      items: [],

      agregar: (producto) =>
        set((estado) => {
          const existente = estado.items.find((i) => i.productoId === producto.productoId);
          if (existente) {
            return {
              items: estado.items.map((i) =>
                i.productoId === producto.productoId ? { ...i, cantidad: i.cantidad + 1 } : i,
              ),
            };
          }
          return { items: [...estado.items, { ...producto, cantidad: 1 }] };
        }),

      agregarCantidad: (producto, cantidad) =>
        set((estado) => {
          if (cantidad <= 0) return estado;
          const existente = estado.items.find((i) => i.productoId === producto.productoId);
          if (existente) {
            return {
              items: estado.items.map((i) =>
                i.productoId === producto.productoId
                  ? { ...i, cantidad: i.cantidad + cantidad }
                  : i,
              ),
            };
          }
          return { items: [...estado.items, { ...producto, cantidad }] };
        }),

      cambiarCantidad: (productoId, diferencia) =>
        set((estado) => ({
          items: estado.items
            .map((i) =>
              i.productoId === productoId ? { ...i, cantidad: i.cantidad + diferencia } : i,
            )
            .filter((i) => i.cantidad > 0),
        })),

      quitar: (productoId) =>
        set((estado) => ({ items: estado.items.filter((i) => i.productoId !== productoId) })),

      vaciar: () => set({ items: [] }),
    }),
    {
      name: "sedyjo-carrito",
      storage: createJSONStorage(() => localStorage),
      partialize: (estado) => ({ items: estado.items }),
    },
  ),
);

/** Cantidad total de unidades (la burbuja del header). */
export const seleccionarCantidadTotal = (estado: Pick<EstadoCarrito, "items">): number =>
  estado.items.reduce((suma, i) => suma + i.cantidad, 0);

/** Subtotal en CLP. El total definitivo siempre lo valida el servidor. */
export const seleccionarSubtotal = (estado: Pick<EstadoCarrito, "items">): number =>
  estado.items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);

export const seleccionarCantidadDe =
  (productoId: string) =>
  (estado: Pick<EstadoCarrito, "items">): number =>
    estado.items.find((i) => i.productoId === productoId)?.cantidad ?? 0;
