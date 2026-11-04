import { formatoFecha } from "@/lib/utils/format";
import type { Pedido } from "@/types";
import { BotonVolverAComprar } from "./BotonVolverAComprar";
import { DetalleEnvio } from "./DetalleEnvio";
import { EstadoPedidoInsignia } from "./EstadoPedidoInsignia";
import { LineaTiempoPedido } from "./LineaTiempoPedido";
import { ResumenPedido } from "./ResumenPedido";

/** Contenido completo de un pedido: estado y envío, dirección y resumen. Lo usan la cuenta y `/seguimiento`. */
export function VistaPedido({ pedido, recomprar = true }: { pedido: Pedido; recomprar?: boolean }) {
  return (
    <div className="contenido-entra flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 className="font-titulos text-2xl font-extrabold">Pedido {pedido.numero}</h2>
        <EstadoPedidoInsignia estado={pedido.estado} />
        <p className="w-full text-sm text-gris-texto">Hecho el {formatoFecha(pedido.fecha)}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="titulo-estado" className="flex flex-col gap-4">
            <h3 id="titulo-estado" className="font-titulos text-lg font-extrabold">
              Estado del envío
            </h3>
            <LineaTiempoPedido pedido={pedido} />
          </section>
          <section aria-labelledby="titulo-entrega" className="flex flex-col gap-2">
            <h3 id="titulo-entrega" className="font-titulos text-lg font-extrabold">
              Entrega
            </h3>
            <DetalleEnvio pedido={pedido} />
          </section>
        </div>

        <section aria-labelledby="titulo-resumen" className="flex flex-col gap-4">
          <h3 id="titulo-resumen" className="font-titulos text-lg font-extrabold">
            Resumen
          </h3>
          <ResumenPedido pedido={pedido} />
          {recomprar && pedido.estado !== "cancelado" && (
            <BotonVolverAComprar items={pedido.items} variante="primario" tamano="lg" />
          )}
        </section>
      </div>
    </div>
  );
}
