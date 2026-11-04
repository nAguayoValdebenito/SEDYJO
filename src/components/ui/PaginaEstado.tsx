import type { ComponentType, ReactNode } from "react";
import { BurbujasDecorativas } from "./BurbujasDecorativas";
import { Contenedor } from "./Contenedor";

type Props = {
  Icono: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  /** Texto grande de apoyo sobre el título (por ejemplo "404"). */
  codigo?: string;
  titulo: string;
  children: ReactNode;
  /** Botones y enlaces de salida. */
  acciones: ReactNode;
};

/**
 * Pantalla completa de un estado del sistema (página no encontrada, error): tarjeta con las
 * burbujas de la marca, un título claro, una explicación breve y salidas a seguir comprando.
 */
export function PaginaEstado({ Icono, codigo, titulo, children, acciones }: Props) {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-6 pb-12">
        <div className="relative isolate mx-auto flex max-w-2xl flex-col items-start gap-4 overflow-hidden rounded-2xl border border-borde bg-white p-6 sm:p-10">
          <BurbujasDecorativas tono="claro" className="-z-10 opacity-70" />
          <div className="flex items-center gap-3 text-verde">
            <Icono size={44} strokeWidth={1.5} />
            {codigo && (
              <span className="font-titulos text-6xl font-extrabold leading-none text-verde-claro">
                {codigo}
              </span>
            )}
          </div>
          <h1 className="font-titulos text-3xl font-extrabold leading-tight md:text-4xl">
            {titulo}
          </h1>
          <div className="max-w-lg text-gris-medio">{children}</div>
          <div className="mt-2 flex w-full flex-col gap-4">{acciones}</div>
        </div>
      </Contenedor>
    </main>
  );
}
