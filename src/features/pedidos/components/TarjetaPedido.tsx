import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatoFecha, formatoPrecio } from "@/lib/utils/format";
import { totalUnidades } from "@/lib/utils/pedidos";
import type { Pedido } from "@/types";
import { BotonVolverAComprar } from "./BotonVolverAComprar";
import { EstadoPedidoInsignia } from "./EstadoPedidoInsignia";

/** Resumen de un pedido en el historial: número, fecha, estado, total y "volver a comprar". */
export function TarjetaPedido({ pedido }: { pedido: Pedido }) {
  const unidades = totalUnidades(pedido.items);
  const nombres = pedido.items.map((i) => i.nombre);
  const resumen =
    nombres.slice(0, 2).join(", ") + (nombres.length > 2 ? ` y ${nombres.length - 2} más` : "");

  return (
    <article className="contenido-entra flex flex-col gap-4 rounded-[10px] border border-borde bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h3 className="font-titulos text-lg font-extrabold">Pedido {pedido.numero}</h3>
          <EstadoPedidoInsignia estado={pedido.estado} />
        </div>
        <p className="text-sm text-gris-texto">
          {formatoFecha(pedido.fecha)} · {unidades} {unidades === 1 ? "producto" : "productos"} ·{" "}
          <span className="font-bold text-tinta tabular-nums">
            {pedido.total === null ? "Por confirmar" : formatoPrecio(pedido.total)}
          </span>
        </p>
        <p className="line-clamp-1 text-sm text-gris-medio">{resumen}</p>
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:w-48">
        <Link
          href={`/cuenta/pedidos/${pedido.id}`}
          className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg bg-gris-fondo px-4 text-sm font-bold text-azul transition-colors duration-200 hover:text-azul-oscuro"
        >
          Ver detalle
          <ChevronRight size={16} aria-hidden="true" />
          <span className="sr-only">del pedido {pedido.numero}</span>
        </Link>
        {pedido.estado !== "cancelado" && <BotonVolverAComprar items={pedido.items} />}
      </div>
    </article>
  );
}
