import { Truck } from "lucide-react";
import { DESPACHO_GRATIS_DESDE } from "@/lib/config";
import { progresoDespacho } from "@/lib/utils/despacho";
import { formatoPrecio } from "@/lib/utils/format";

/** Avance hacia el despacho gratis. Solo se muestra si el monto mínimo ya está definido. */
export function BarraDespachoGratis({ subtotal }: { subtotal: number }) {
  if (DESPACHO_GRATIS_DESDE === null) return null;
  const { faltante, avance, completo } = progresoDespacho(subtotal, DESPACHO_GRATIS_DESDE);

  return (
    <div className="rounded-[10px] border border-verde-claro bg-white p-3.5 md:p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-medium" role="status">
        <Truck size={18} strokeWidth={1.8} aria-hidden="true" className="text-verde" />
        {completo ? (
          <span>¡Tu pedido tiene despacho gratis!</span>
        ) : (
          <span>
            Te faltan <strong className="tabular-nums">{formatoPrecio(faltante)}</strong> para el
            despacho gratis
          </span>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="Avance hacia el despacho gratis"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(avance * 100)}
        className="h-2 overflow-hidden rounded-full bg-verde-suave"
      >
        <div
          className="h-full origin-left rounded-full bg-verde transition-transform duration-500 ease-[var(--ease-salida)]"
          style={{ transform: `scaleX(${avance})` }}
        />
      </div>
    </div>
  );
}
