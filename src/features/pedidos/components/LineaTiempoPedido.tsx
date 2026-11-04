import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatoFechaHora } from "@/lib/utils/format";
import { pasosDelPedido } from "@/lib/utils/pedidos";
import type { Pedido } from "@/types";

const TEXTO_SITUACION = {
  hecho: "Completado",
  actual: "Paso actual",
  pendiente: "Pendiente",
} as const;

/**
 * Línea de tiempo del pedido y del envío: recibido → preparando → en camino → entregado, con la fecha de cada hito. Es una lista ordenada con el paso actual
 * marcado (`aria-current="step"`) y texto para lectores de pantalla.
 */
export function LineaTiempoPedido({ pedido }: { pedido: Pick<Pedido, "estado" | "eventos"> }) {
  if (pedido.estado === "cancelado") {
    return (
      <p className="rounded-lg border border-borde bg-gris-fondo p-3.5 text-sm">
        Este pedido fue cancelado.
      </p>
    );
  }

  const pasos = pasosDelPedido(pedido);

  return (
    <ol aria-label="Estado de tu pedido" className="flex flex-col">
      {pasos.map((paso, i) => {
        const ultimo = i === pasos.length - 1;
        return (
          <li
            key={paso.estado}
            aria-current={paso.situacion === "actual" ? "step" : undefined}
            className="relative flex gap-3.5 pb-6 last:pb-0"
          >
            {!ultimo && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[13px] top-7 bottom-0 w-0.5",
                  paso.situacion === "hecho" ? "bg-verde" : "bg-borde",
                )}
              />
            )}

            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2",
                paso.situacion === "actual" && "pulso-hito",
                paso.situacion === "hecho" && "border-verde bg-verde text-white",
                paso.situacion === "actual" && "border-verde bg-white",
                paso.situacion === "pendiente" && "border-borde bg-white",
              )}
            >
              {paso.situacion === "hecho" && <Check size={15} strokeWidth={3} />}
              {paso.situacion === "actual" && (
                <span className="size-2.5 rounded-full bg-verde animate-pulse" />
              )}
            </span>

            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  "font-bold leading-snug",
                  paso.situacion === "actual" && "text-verde-oscuro",
                  paso.situacion === "pendiente" && "text-gris-texto",
                )}
              >
                {paso.etiqueta}
                <span className="sr-only"> — {TEXTO_SITUACION[paso.situacion]}</span>
              </p>
              {paso.fecha && (
                <p className="text-sm text-gris-texto tabular-nums">
                  {formatoFechaHora(paso.fecha)}
                </p>
              )}
              {paso.detalle && <p className="mt-0.5 text-sm text-gris-medio">{paso.detalle}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
