import type { ReactNode } from "react";
import { FileText } from "lucide-react";

/**
 * Marca un texto que debe entregar el negocio (por ejemplo, el texto legal definitivo). Es
 * visible a propósito para que no se publique sin reemplazarlo.
 */
export function TextoPendiente({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 rounded-lg border-2 border-dashed border-borde-control bg-gris-fondo p-3.5 text-sm">
      <FileText size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-gris-texto" />
      <span>
        <strong>Texto pendiente del negocio.</strong> {children}
      </span>
    </p>
  );
}
