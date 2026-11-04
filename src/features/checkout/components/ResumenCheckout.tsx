import { FotoOMarcador } from "@/components/ui/FotoOMarcador";
import { calcularTotales } from "@/lib/utils/checkout";
import { formatoPrecio } from "@/lib/utils/format";
import type { ItemCarrito, ItemPedido } from "@/types";

type Props = {
  items: (ItemCarrito | ItemPedido)[];
  subtotalValidado?: number;
};

export function ResumenCheckout({ items, subtotalValidado }: Props) {
  const subtotal =
    subtotalValidado ?? items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  const totales = calcularTotales(subtotal);
  const contenido = (
    <>
      <ul className="divide-y divide-borde">
        {items.map((item) => (
          <li key={item.productoId} className="flex gap-3 py-3">
            <div
              className="relative size-12 shrink-0 overflow-hidden rounded-lg"
              style={{ backgroundColor: item.fondo }}
            >
              <FotoOMarcador src={item.imagen} alt="" marcador="" sizes="48px" />
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium leading-snug">{item.nombre}</p>
              <p className="text-gris-texto">
                {item.cantidad} × {formatoPrecio(item.precio)}
              </p>
            </div>
            <span className="shrink-0 text-sm font-bold tabular-nums">
              {formatoPrecio(item.precio * item.cantidad)}
            </span>
          </li>
        ))}
      </ul>
      <dl className="space-y-2 border-t border-borde pt-3 text-sm">
        <div className="flex justify-between gap-3">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatoPrecio(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Despacho</dt>
          <dd className="text-right">
            {totales.despacho === null
              ? "Se confirma al pagar"
              : totales.despacho === 0
                ? "Gratis"
                : formatoPrecio(totales.despacho)}
          </dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-borde pt-2 font-bold">
          <dt>Total</dt>
          <dd
            key={totales.total ?? "pendiente"}
            className="cifra-cambia text-right font-titulos text-lg tabular-nums"
          >
            {totales.total === null ? "Por confirmar" : formatoPrecio(totales.total)}
          </dd>
        </div>
      </dl>
    </>
  );
  return (
    <>
      <details className="rounded-xl border border-borde bg-white p-4 lg:hidden">
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 font-bold">
          <span>Resumen del pedido</span>
          <span className="text-right text-verde-oscuro">
            {totales.total === null ? "Por confirmar" : formatoPrecio(totales.total)}
          </span>
        </summary>
        <div className="mt-2">{contenido}</div>
      </details>
      <aside
        aria-label="Resumen del pedido"
        className="hidden self-start rounded-xl border border-borde bg-white p-5 lg:sticky lg:top-5 lg:block"
      >
        <h2 className="font-titulos text-xl font-extrabold">Tu pedido</h2>
        {contenido}
      </aside>
    </>
  );
}
