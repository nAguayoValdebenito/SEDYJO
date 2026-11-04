import Link from "next/link";
import type { ReactNode } from "react";
import { Contenedor } from "./Contenedor";
import { EncabezadoSeccion } from "./EncabezadoSeccion";
import { claseBoton } from "./boton";

type Props = {
  titulo: string;
  children: ReactNode;
};

/** Página en preparación: explica qué vendrá y devuelve al inicio, en vez de un 404. */
export function PaginaProximamente({ titulo, children }: Props) {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-6 min-h-[50vh]">
        <EncabezadoSeccion titulo={titulo} nivel={1} />
        <div className="flex max-w-xl flex-col items-start gap-5 py-4 text-gris-medio">
          <p className="text-base leading-relaxed">{children}</p>
          <Link href="/" className={claseBoton("primario", "lg")}>
            Volver al inicio
          </Link>
        </div>
      </Contenedor>
    </main>
  );
}
