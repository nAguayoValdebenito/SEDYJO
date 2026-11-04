import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Miga = { texto: string; href?: string };

/** Migas de pan (inicio › categoría › página actual). La última es la página actual. */
export function MigasDePan({ migas }: { migas: Miga[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="mb-2">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-sm text-gris-texto">
        {migas.map((miga, i) => {
          const ultima = i === migas.length - 1;
          return (
            <li key={miga.texto} className="flex items-center gap-1">
              {miga.href && !ultima ? (
                <Link
                  href={miga.href}
                  className="inline-flex min-h-11 items-center font-medium text-azul hover:text-azul-oscuro"
                >
                  <span className="enlace-sutil">{miga.texto}</span>
                </Link>
              ) : (
                <span aria-current={ultima ? "page" : undefined} className="line-clamp-1">
                  {miga.texto}
                </span>
              )}
              {!ultima && <ChevronRight size={14} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
