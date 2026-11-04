"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, SearchX } from "lucide-react";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { claseBoton } from "@/components/ui/boton";
import { useSesion } from "@/features/auth/store";
import type { Pedido } from "@/types";
import { useCheckout } from "@/features/checkout/store";
import { obtenerPedido } from "../acciones";
import { ErrorCarga } from "./EstadosCarga";
import { VistaPedido } from "./VistaPedido";

type Estado =
  | { clave: string; tipo: "listo"; pedido: Pedido }
  | { clave: string; tipo: "no-existe" }
  | { clave: string; tipo: "error" };

/** `/cuenta/pedidos/[id]`: detalle de un pedido del cliente, con carga, no encontrado y error. */
export function DetallePedido({ id }: { id: string }) {
  const usuario = useSesion((s) => s.usuario);
  const pedidoReciente = useCheckout((s) => s.pedidoReciente);
  const usuarioId = usuario?.id ?? null;
  const [estado, setEstado] = useState<Estado | null>(null);
  const [intento, setIntento] = useState(0);
  const clave = `${id}|${usuarioId}|${intento}`;

  useEffect(() => {
    if (!usuarioId) return;
    let cancelado = false;
    obtenerPedido(id, usuarioId)
      .then((pedido) => {
        if (cancelado) return;
        setEstado(pedido ? { clave, tipo: "listo", pedido } : { clave, tipo: "no-existe" });
      })
      .catch(() => {
        if (!cancelado) setEstado({ clave, tipo: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [id, usuarioId, clave]);

  const actual: Estado | null =
    pedidoReciente?.id === id && pedidoReciente.usuarioId === usuarioId
      ? { clave, tipo: "listo", pedido: pedidoReciente }
      : estado && estado.clave === clave
        ? estado
        : null;

  return (
    <>
      <Link
        href="/cuenta/pedidos"
        className="-ml-2 mb-4 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-bold text-azul hover:text-azul-oscuro"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver a mis pedidos
      </Link>

      {actual?.tipo !== "no-existe" && <h1 className="sr-only">Detalle del pedido</h1>}

      {!actual && (
        <div aria-busy="true" className="flex flex-col gap-4">
          <span role="status" className="sr-only">
            Cargando el pedido
          </span>
          <Esqueleto className="h-9 w-72" />
          <Esqueleto className="h-64 w-full rounded-[10px]" />
        </div>
      )}

      {actual?.tipo === "error" && (
        <ErrorCarga
          mensaje="No pudimos cargar este pedido."
          onReintentar={() => {
            setEstado(null);
            setIntento((n) => n + 1);
          }}
        />
      )}

      {actual?.tipo === "no-existe" && (
        <div className="flex max-w-md flex-col items-start gap-3 py-4">
          <SearchX size={40} strokeWidth={1.5} aria-hidden="true" className="text-gris-texto" />
          <h1 className="font-titulos text-2xl font-extrabold">No encontramos este pedido</h1>
          <p className="text-gris-medio">
            Puede que el enlace esté mal o que el pedido sea de otra cuenta.
          </p>
          <Link href="/cuenta/pedidos" className={claseBoton("primario", "lg")}>
            Ver mis pedidos
          </Link>
        </div>
      )}

      {actual?.tipo === "listo" && <VistaPedido pedido={actual.pedido} />}
    </>
  );
}
