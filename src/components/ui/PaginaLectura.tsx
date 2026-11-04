import type { ReactNode } from "react";
import { Contenedor } from "./Contenedor";
import { EncabezadoSeccion } from "./EncabezadoSeccion";
import { MigasDePan } from "./MigasDePan";

export type SeccionLectura = {
  id: string;
  titulo: string;
  contenido: ReactNode;
};

type Props = {
  titulo: string;
  /** Frase breve bajo el título. */
  introduccion?: string;
  secciones: SeccionLectura[];
  /** Contenido extra al final (por ejemplo, un bloque de contacto). */
  pie?: ReactNode;
};

/**
 * Plantilla para páginas de lectura (despachos, términos, privacidad, preguntas frecuentes…):
 * título, índice lateral que sigue al lector en escritorio, secciones con ancho de línea cómodo
 * y jerarquía de títulos clara.
 */
export function PaginaLectura({ titulo, introduccion, secciones, pie }: Props) {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-4 pb-12">
        <MigasDePan migas={[{ texto: "Inicio", href: "/" }, { texto: titulo }]} />
        <EncabezadoSeccion titulo={titulo} nivel={1} />
        {introduccion && (
          <p className="-mt-1 mb-6 max-w-2xl text-lg text-gris-medio">{introduccion}</p>
        )}

        <div
          className={
            secciones.length > 1
              ? "grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12"
              : "grid gap-8"
          }
        >
          {secciones.length > 1 && (
            <nav aria-label="En esta página" className="hidden lg:block">
              <div className="sticky top-28">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-gris-texto">
                  En esta página
                </p>
                <ul className="flex flex-col border-l-2 border-borde">
                  {secciones.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="-ml-0.5 flex min-h-11 items-center border-l-2 border-transparent py-1 pl-3 text-sm text-gris-medio transition-[color,border-color] duration-200 hover:border-verde hover:text-verde-oscuro"
                      >
                        {s.titulo}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          )}

          <div className="flex max-w-[70ch] flex-col gap-10">
            {secciones.map((s) => (
              <section
                key={s.id}
                id={s.id}
                aria-labelledby={`${s.id}-titulo`}
                className="scroll-mt-28"
              >
                <h2 id={`${s.id}-titulo`} className="mb-3 font-titulos text-2xl font-extrabold">
                  {s.titulo}
                </h2>
                <div className="flex flex-col gap-3 leading-relaxed text-gris-medio [&_a]:font-bold [&_a]:text-azul [&_a:hover]:text-azul-oscuro [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-tinta">
                  {s.contenido}
                </div>
              </section>
            ))}
            {pie}
          </div>
        </div>
      </Contenedor>
    </main>
  );
}
