import Link from "next/link";
import { FotoOMarcador } from "@/components/ui/FotoOMarcador";
import { formatoPrecio } from "@/lib/utils/format";
import type { Pedido } from "@/types";

/** Productos del pedido (con el precio al que se compraron) y el desglose del total. */
export function ResumenPedido({ pedido }: { pedido: Pedido }) {
  return (
    <div className="flex flex-col gap-4">
      <ul className="divide-y divide-borde rounded-[10px] border border-borde bg-white">
        {pedido.items.map((item) => (
          <li key={item.productoId} className="flex items-center gap-3 p-3">
            <div
              className="relative size-12 shrink-0 overflow-hidden rounded-lg"
              style={{ backgroundColor: item.fondo }}
            >
              <FotoOMarcador src={item.imagen} alt={item.nombre} marcador="" sizes="48px" />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/producto/${item.slug}`}
                className="line-clamp-2 text-sm font-medium leading-snug hover:text-verde-oscuro"
              >
                {item.nombre}
              </Link>
              <p className="text-xs text-gris-texto tabular-nums">
                {item.cantidad} × {formatoPrecio(item.precio)}
              </p>
            </div>
            <span className="font-titulos text-base font-extrabold tabular-nums">
              {formatoPrecio(item.precio * item.cantidad)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-gris-medio">Subtotal</dt>
          <dd className="tabular-nums">{formatoPrecio(pedido.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gris-medio">Despacho</dt>
          <dd className="tabular-nums">
            {pedido.despacho === null
              ? "Por confirmar"
              : pedido.despacho === 0
                ? "Gratis"
                : formatoPrecio(pedido.despacho)}
          </dd>
        </div>
        <div className="mt-1 flex items-baseline justify-between border-t border-borde pt-2.5">
          <dt className="font-bold">{pedido.total === null ? "Total" : "Total pagado"}</dt>
          <dd className="font-titulos text-xl font-extrabold tabular-nums">
            {pedido.total === null ? "Por confirmar" : formatoPrecio(pedido.total)}
          </dd>
        </div>
        <div className="flex justify-between text-xs text-gris-texto">
          <dt>Método de pago</dt>
          <dd>{pedido.metodoPago}</dd>
        </div>
      </dl>
    </div>
  );
}
