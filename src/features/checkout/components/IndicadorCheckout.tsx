import { Check } from "lucide-react";
import type { PasoCheckout } from "@/lib/utils/checkout";
import { cn } from "@/lib/utils/cn";

const PASOS = [
  { clave: "datos", nombre: "Datos y entrega" },
  { clave: "pago", nombre: "Pago" },
  { clave: "confirmacion", nombre: "Confirmación" },
] as const;

export function IndicadorCheckout({ paso }: { paso: PasoCheckout }) {
  const actual = PASOS.findIndex((item) => item.clave === paso);
  return (
    <nav aria-label="Progreso de la compra" className="mb-6">
      <p role="status" className="mb-3 text-sm font-bold text-verde-oscuro">
        Paso {actual + 1} de 3
      </p>
      <ol className="grid grid-cols-3 gap-2">
        {PASOS.map((item, indice) => {
          const alcanzado = indice <= actual;
          const completo = indice < actual || paso === "confirmacion";
          return (
            <li
              key={item.clave}
              aria-current={indice === actual ? "step" : undefined}
              className="min-w-0"
            >
              <span className="mb-2 block h-1.5 overflow-hidden rounded-full bg-borde">
                <span
                  className={cn(
                    "block h-full origin-left rounded-full bg-verde transition-transform duration-[420ms] ease-[var(--ease-salida)]",
                    alcanzado ? "scale-x-100" : "scale-x-0",
                  )}
                  style={{ transitionDelay: alcanzado ? `${indice * 90}ms` : "0ms" }}
                />
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 text-xs font-bold transition-colors duration-300 sm:text-sm",
                  alcanzado ? "text-verde-oscuro" : "text-gris-texto",
                )}
              >
                {completo && (
                  <Check size={14} strokeWidth={3} aria-hidden="true" className="shrink-0" />
                )}
                <span className="sr-only">Paso {indice + 1}: </span>
                {item.nombre}
                {completo && <span className="sr-only">, completo</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
