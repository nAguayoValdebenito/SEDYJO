"use client";

import { useEffect, useState } from "react";
import { ordenarPedidos } from "@/lib/utils/pedidos";
import type { Pedido } from "@/types";
import { obtenerPedidos } from "./acciones";

type Resultado = { usuarioId: string; pedidos: Pedido[] } | { usuarioId: string; error: true };

export type EstadoPedidos =
  | { estado: "cargando" }
  | { estado: "error"; reintentar: () => void }
  | { estado: "listo"; pedidos: Pedido[] };

/** Carga los pedidos del cliente (con estados de carga y error). Vienen de la API de Sedyjo (`/me/orders`). */
export function usePedidos(usuarioId: string | null): EstadoPedidos {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!usuarioId) return;
    let cancelado = false;

    obtenerPedidos()
      .then((pedidos) => {
        if (!cancelado) setResultado({ usuarioId, pedidos: ordenarPedidos(pedidos) });
      })
      .catch(() => {
        if (!cancelado) setResultado({ usuarioId, error: true });
      });

    return () => {
      cancelado = true;
    };
  }, [usuarioId, intento]);

  const actual = resultado && resultado.usuarioId === usuarioId ? resultado : null;
  if (!actual) return { estado: "cargando" };
  if ("error" in actual) {
    return {
      estado: "error",
      reintentar: () => {
        setResultado(null);
        setIntento((n) => n + 1);
      },
    };
  }
  return {
    estado: "listo",
    pedidos: actual.pedidos,
  };
}
