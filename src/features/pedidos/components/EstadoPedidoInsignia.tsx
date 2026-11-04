import { CircleCheck, CircleX, ClipboardCheck, Package, Truck } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils/cn";
import { etiquetaEstado } from "@/lib/utils/pedidos";
import type { EstadoPedido } from "@/types";

const ESTILOS: Record<
  EstadoPedido,
  { clases: string; Icono: ComponentType<{ size?: number; "aria-hidden"?: boolean }> }
> = {
  recibido: { clases: "border border-borde bg-gris-fondo text-tinta", Icono: ClipboardCheck },
  preparando: { clases: "bg-verde-suave text-verde-oscuro", Icono: Package },
  "en-camino": { clases: "bg-azul text-white", Icono: Truck },
  entregado: { clases: "bg-verde text-white", Icono: CircleCheck },
  cancelado: { clases: "bg-tinta text-white", Icono: CircleX },
};

/** Estado del pedido con ícono y texto (no depende solo del color). */
export function EstadoPedidoInsignia({
  estado,
  className,
}: {
  estado: EstadoPedido;
  className?: string;
}) {
  const { clases, Icono } = ESTILOS[estado];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold",
        clases,
        className,
      )}
    >
      <Icono size={14} aria-hidden />
      {etiquetaEstado(estado)}
    </span>
  );
}
