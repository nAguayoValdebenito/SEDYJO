import type { ReactNode } from "react";
import { BurbujasDecorativas } from "./BurbujasDecorativas";
import { FondoDoodlesComercio } from "./FondoDoodlesComercio";
import { Contenedor } from "./Contenedor";
import { EncabezadoSeccion } from "./EncabezadoSeccion";

type Props = {
  titulo: string;
  /** Frase breve bajo el título. */
  descripcion?: string;
  /** Aviso opcional sobre el formulario (por ejemplo, el modo demostración). */
  aviso?: ReactNode;
  /** Contenido del panel verde de marca (solo escritorio): por ejemplo, la oferta del día. */
  lateral?: ReactNode;
  children: ReactNode;
};

/**
 * Página de formulario (ingresar, registrarse, recuperar): tarjeta de ancho cómodo y, desde
 * escritorio, un panel de marca a la izquierda para que la pantalla no quede vacía.
 */
export function TarjetaFormulario({ titulo, descripcion, aviso, lateral, children }: Props) {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-6 pb-10">
        <div className="mx-auto grid w-full max-w-[460px] lg:max-w-[1000px] lg:grid-cols-[1fr_460px] lg:items-stretch lg:gap-10">
          {lateral && (
            <aside
              aria-label="Oferta del día y beneficios"
              className="sobre-oscuro relative hidden overflow-hidden rounded-2xl bg-verde-oscuro p-9 text-white lg:block"
            >
              <FondoDoodlesComercio tono="verde" tam={420} />
              <BurbujasDecorativas />
              {lateral}
            </aside>
          )}
          <div className="min-w-0">
            <EncabezadoSeccion titulo={titulo} nivel={1} />
            {descripcion && <p className="-mt-1 mb-4 text-gris-medio">{descripcion}</p>}
            {aviso && <div className="mb-5">{aviso}</div>}
            <div className="rounded-xl border border-borde bg-white p-5 sm:p-7">{children}</div>
          </div>
        </div>
      </Contenedor>
    </main>
  );
}
