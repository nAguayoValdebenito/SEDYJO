import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export type Pregunta = { id: string; pregunta: string; respuesta: ReactNode };

/**
 * Preguntas frecuentes como lista de `<details>`: funcionan con teclado y sin JavaScript, y la
 * respuesta entra con un fundido corto al abrirse.
 */
export function ListaPreguntas({ preguntas }: { preguntas: Pregunta[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {preguntas.map((p) => (
        <details
          key={p.id}
          id={p.id}
          className="group rounded-[10px] border border-borde bg-white transition-[border-color] duration-200 open:border-verde"
        >
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-bold marker:hidden [&::-webkit-details-marker]:hidden">
            {p.pregunta}
            <ChevronDown
              size={20}
              aria-hidden="true"
              className="shrink-0 text-verde transition-[rotate] duration-300 ease-[var(--ease-salida)] group-open:rotate-180"
            />
          </summary>
          <div className="contenido-entra px-4 pb-4 leading-relaxed text-gris-medio [&_a]:font-bold [&_a]:text-azul [&_strong]:text-tinta">
            {p.respuesta}
          </div>
        </details>
      ))}
    </div>
  );
}
