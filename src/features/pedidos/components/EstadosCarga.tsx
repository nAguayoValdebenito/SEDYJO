import { AlertTriangle } from "lucide-react";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { claseBoton } from "@/components/ui/boton";

/** Esqueleto de una lista de pedidos, con aviso para lectores de pantalla. */
export function CargandoPedidos({ cantidad = 3 }: { cantidad?: number }) {
  return (
    <div aria-busy="true" className="flex flex-col gap-3">
      <span role="status" className="sr-only">
        Cargando pedidos
      </span>
      {Array.from({ length: cantidad }, (_, i) => (
        <Esqueleto key={i} className="h-28 w-full rounded-[10px]" />
      ))}
    </div>
  );
}

/** Error al cargar, con reintento. */
export function ErrorCarga({
  mensaje = "No pudimos cargar tus pedidos.",
  onReintentar,
}: {
  mensaje?: string;
  onReintentar: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-[10px] border border-error bg-white p-5"
    >
      <p className="flex items-center gap-2 font-bold text-error">
        <AlertTriangle size={20} aria-hidden="true" />
        {mensaje}
      </p>
      <p className="text-sm text-gris-medio">Puede ser un problema pasajero. Intenta de nuevo.</p>
      <button type="button" onClick={onReintentar} className={claseBoton("contorno", "md")}>
        Reintentar
      </button>
    </div>
  );
}
