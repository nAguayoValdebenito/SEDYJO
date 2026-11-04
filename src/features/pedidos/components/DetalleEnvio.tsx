import { PLAZO_DESPACHO } from "@/lib/config";
import type { Pedido } from "@/types";

/** Cómo se entrega el pedido: despacho a domicilio con su dirección y plazo. */
export function DetalleEnvio({ pedido }: { pedido: Pick<Pedido, "direccion"> }) {
  const d = pedido.direccion;
  return (
    <address className="text-sm not-italic text-gris-medio">
      <strong className="text-tinta">Despacho a domicilio</strong>
      <br />
      {d && (
        <>
          {d.calle} {d.numero}, {d.comuna}, {d.region}
          <br />
          {d.referencia && (
            <>
              Referencia: {d.referencia}
              <br />
            </>
          )}
        </>
      )}
      Entrega en {PLAZO_DESPACHO} desde la confirmación del pago.
    </address>
  );
}
