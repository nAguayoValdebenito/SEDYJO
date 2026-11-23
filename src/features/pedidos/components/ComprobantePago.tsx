import { NOMBRE_SITIO, URL_SITIO } from "@/lib/config";
import { formatoFechaHora, formatoPrecio } from "@/lib/utils/format";
import type { Pedido } from "@/types";

/**
 * Comprobante del cobro con Webpay (Transbank): orden de compra, monto, código de autorización,
 * fecha, tipo de pago, cuotas y últimos 4 dígitos de la tarjeta. Solo aparece en pedidos pagados
 * con Webpay, vistos por su dueño.
 */
export function ComprobantePago({ pedido }: { pedido: Pedido }) {
  const detalle = pedido.pago?.detalle;
  if (!detalle || pedido.total === null) return null;

  const fecha = detalle.fecha ?? pedido.pago?.fecha ?? null;
  const filas: [string, string][] = [
    ["Orden de compra", pedido.numero],
    ["Monto pagado", `${formatoPrecio(pedido.total)} (CLP)`],
    ["Código de autorización", detalle.autorizacion],
    ...(fecha ? ([["Fecha y hora", formatoFechaHora(fecha)]] as [string, string][]) : []),
    ["Tipo de pago", detalle.tipoPago],
    ["Cuotas", detalle.cuotasTexto],
    ["Tarjeta", `terminada en ${detalle.tarjeta}`],
    ["Pagado en", `${NOMBRE_SITIO} · ${new URL(URL_SITIO).hostname.replace(/^www\./, "")}`],
  ];

  return (
    <section
      aria-labelledby="titulo-comprobante"
      className="rounded-[10px] border border-borde bg-white p-4"
    >
      <h3 id="titulo-comprobante" className="mb-2 text-sm font-bold">
        Comprobante de pago · Webpay
      </h3>
      <dl className="flex flex-col gap-1.5 text-sm">
        {filas.map(([titulo, valor]) => (
          <div key={titulo} className="flex justify-between gap-4">
            <dt className="text-gris-medio">{titulo}</dt>
            <dd className="text-right font-medium tabular-nums">{valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
