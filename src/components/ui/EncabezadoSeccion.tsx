import Link from "next/link";
import { Revelar } from "./Revelar";

type Props = {
  titulo: string;
  enlace?: { texto: string; href: string };
  id?: string;
  /** 1 en el título principal de cada página, 2 en las secciones del home. */
  nivel?: 1 | 2;
  /** Título más chico para secciones secundarias (ofertas y recomendaciones). */
  compacto?: boolean;
};

/** Título de sección: la regla inferior se dibuja de izquierda a derecha al entrar en pantalla. */
export function EncabezadoSeccion({ titulo, enlace, id, nivel = 2, compacto = false }: Props) {
  const Titulo = nivel === 1 ? "h1" : "h2";

  return (
    <Revelar className="relative mb-3 flex items-baseline justify-between pb-2 md:mb-[18px] md:pb-2.5">
      <Titulo
        id={id}
        className={
          compacto
            ? "font-titulos text-base font-extrabold md:text-lg"
            : "font-titulos text-[22px] font-extrabold md:text-3xl"
        }
      >
        {titulo}
      </Titulo>
      {enlace && (
        <Link
          href={enlace.href}
          className="-my-3 inline-flex min-h-11 min-w-11 items-center justify-center text-[13px] font-bold text-azul hover:text-azul-oscuro md:text-sm"
        >
          <span className="enlace-sutil">{enlace.texto}</span>
        </Link>
      )}
      <span
        aria-hidden="true"
        className="linea-titulo absolute inset-x-0 bottom-0 h-0.5 bg-tinta"
      />
    </Revelar>
  );
}
