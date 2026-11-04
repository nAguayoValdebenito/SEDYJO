import type { Ref } from "react";

type Props = {
  /** Errores por campo (clave = nombre del campo). */
  errores: Record<string, string>;
  /** Etiqueta visible de cada campo, para nombrarlo en el resumen. */
  etiquetas: Record<string, string>;
  /** Prefijo de los `id` de los campos (`{prefijo}-{campo}`), para enlazar al campo. */
  prefijo: string;
  ref?: Ref<HTMLDivElement>;
};

/**
 * Resumen de errores al enviar un formulario: se anuncia a los lectores de pantalla, recibe el foco
 * y cada línea es un enlace que lleva al campo con el problema.
 */
export function ResumenErrores({ errores, etiquetas, prefijo, ref }: Props) {
  const campos = Object.keys(errores);
  if (campos.length === 0) return null;

  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="rounded-lg border-2 border-error bg-white p-3.5 outline-none"
    >
      <p className="text-sm font-bold text-error">
        {campos.length === 1
          ? "Hay 1 dato que corregir:"
          : `Hay ${campos.length} datos que corregir:`}
      </p>
      <ul className="mt-1.5 list-disc pl-5 text-sm">
        {campos.map((campo) => (
          <li key={campo}>
            <a href={`#${prefijo}-${campo}`} className="font-medium underline underline-offset-2">
              {etiquetas[campo] ?? campo}
            </a>
            : {errores[campo]}
          </li>
        ))}
      </ul>
    </div>
  );
}
