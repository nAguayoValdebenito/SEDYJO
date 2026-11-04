import { AlertCircle } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  etiqueta: string;
  /** Mensaje de error junto al campo (también marca el campo como inválido). */
  error?: string;
  /** Texto de apoyo bajo el campo (por ejemplo los requisitos de la contraseña). */
  ayuda?: string;
  /** Control a la derecha, dentro del campo (por ejemplo "mostrar contraseña"). */
  derecha?: ReactNode;
};

/**
 * Campo de formulario con etiqueta visible, ayuda y error asociados (`aria-describedby`),
 * borde y mensaje en rojo de error (con ícono, para no depender solo del color).
 */
export function CampoTexto({ id, etiqueta, error, ayuda, derecha, className, ...resto }: Props) {
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
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full rounded-lg border-2 bg-white px-3.5 text-[15px] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-gris-texto",
            "focus:border-verde-oscuro focus:shadow-[0_0_0_4px_rgb(46_125_91/0.18)]",
            error ? "sacudida border-error" : "border-borde-control",
            derecha ? "pr-12" : false,
            className,
          )}
          {...resto}
        />
        {derecha && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-0.5">{derecha}</div>
        )}
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
