import { AlertCircle, ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Opcion = { valor: string; texto: string };

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  id: string;
  etiqueta: string;
  opciones: Opcion[];
  /** Texto de la opción vacía inicial (por ejemplo "Elige tu comuna"). */
  placeholder: string;
  error?: string;
  ayuda?: string;
};

/** Lista desplegable con la misma etiqueta, ayuda y error que `CampoTexto`. */
export function CampoSelect({
  id,
  etiqueta,
  opciones,
  placeholder,
  error,
  ayuda,
  className,
  ...resto
}: Props) {
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  const idError = error ? `${id}-error` : undefined;
  const describedBy = [idAyuda, idError].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold">
        {etiqueta}
        {resto.required && (
          <span aria-hidden="true" className="ml-0.5 text-error">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full appearance-none rounded-lg border-2 bg-white pl-3.5 pr-10 text-[15px] outline-none transition-[border-color,box-shadow] duration-200",
            "[&>option]:text-tinta",
            "focus:border-verde-oscuro focus:shadow-[0_0_0_4px_rgb(46_125_91/0.18)]",
            error ? "sacudida border-error" : "border-borde-control",
            // Sin elegir nada se ve gris: no se confunde con un valor ya completado.
            !resto.value && "text-gris-texto",
            className,
          )}
          {...resto}
        >
          <option value="">{placeholder}</option>
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gris-texto"
        />
      </div>
      {ayuda && (
        <p id={idAyuda} className="text-xs text-gris-texto">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className="flex items-start gap-1.5 text-sm font-medium text-error">
          <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
