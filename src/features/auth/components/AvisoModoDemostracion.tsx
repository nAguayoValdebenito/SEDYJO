import { FlaskConical } from "lucide-react";

type Props = {
  /** Detalle extra para esta pantalla (por ejemplo, qué cuenta probar). */
  children?: React.ReactNode;
  /** Nombre de la región (debe ser distinto si hay dos avisos en la misma página). */
  etiqueta?: string;
};

/**
 * Aviso visible mientras la sesión y los pedidos son simulados (sin backend).
 * Se retira cuando exista el backend real.
 */
export function AvisoModoDemostracion({ children, etiqueta = "Modo demostración" }: Props) {
  return (
    <aside
      aria-label={etiqueta}
      className="flex gap-3 rounded-lg border border-verde-claro bg-verde-suave p-3.5 text-sm"
    >
      <FlaskConical size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-verde-oscuro" />
      <div className="text-gris-medio">
        <p className="font-bold text-verde-oscuro">Modo demostración</p>
        <p>
          La sesión es simulada y no se guarda ninguna contraseña.{" "}
          {children ?? (
            <>
              Entra con <strong>demo@sedyjo.cl</strong> y cualquier contraseña válida para ver
              pedidos de ejemplo.
            </>
          )}
        </p>
      </div>
    </aside>
  );
}
