import { FotoOMarcador } from "@/components/ui/FotoOMarcador";
import { formatoPrecio } from "@/lib/utils/format";

export type LineaResumen = {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string | null;
  fondo: string;
};

type Props = {
  items: LineaResumen[];
  /** Importes que calculó la API. `despacho` y `total` son `null` mientras no se pueden definir. */
  subtotal: number;
  despacho: number | null;
  total: number | null;
  /** Lo que se muestra en "Despacho" cuando todavía no hay costo (por ejemplo "Elige tu comuna"). */
  despachoPendiente?: string;
  /** Mientras se recalcula con la API. */
  calculando?: boolean;
  /** "Te faltan $X para despacho gratis". */
  faltaParaGratis?: number;
};

export function ResumenCheckout({
  items,
  subtotal,
  despacho,
  total,
  despachoPendiente = "Elige tu comuna",
  calculando = false,
  faltaParaGratis = 0,
}: Props) {
  const textoTotal = total === null ? "Por definir" : formatoPrecio(total);
  const contenido = (
    <div
      aria-busy={calculando}
      className={calculando ? "opacity-70 transition-opacity" : undefined}
    >
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
            {despacho === null
              ? despachoPendiente
              : despacho === 0
                ? "Gratis"
                : formatoPrecio(despacho)}
          </dd>
        </div>
        {despacho !== null && despacho > 0 && faltaParaGratis > 0 && (
          <p className="text-xs text-verde-oscuro">
            Te faltan {formatoPrecio(faltaParaGratis)} para despacho gratis.
          </p>
        )}
        <div className="flex justify-between gap-3 border-t border-borde pt-2 font-bold">
          <dt>Total</dt>
          <dd
            key={total ?? "pendiente"}
            className="cifra-cambia text-right font-titulos text-lg tabular-nums"
          >
            {textoTotal}
          </dd>
        </div>
      </dl>
    </div>
  );
  return (
    <>
      <details className="rounded-xl border border-borde bg-white p-4 lg:hidden">
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 font-bold">
          <span>Resumen del pedido</span>
          <span className="text-right text-verde-oscuro">{textoTotal}</span>
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
