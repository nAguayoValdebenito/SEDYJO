import Link from "next/link";
import { Contenedor } from "@/components/ui/Contenedor";
import { TELEFONO_CONTACTO, TELEFONO_CONTACTO_VISIBLE } from "@/lib/config";

/** Franja gris superior (solo escritorio): ubicación, teléfono y enlaces de ayuda. */
export function BarraSuperior() {
  return (
    <aside
      aria-label="Información de contacto"
      className="hidden bg-gris-fondo text-xs text-gris-medio lg:block"
    >
      <Contenedor className="flex flex-wrap justify-between gap-x-6 gap-y-2 py-[7px]">
        <span>
          Candelaria, San Pedro de la Paz ·{" "}
          <a href={`tel:${TELEFONO_CONTACTO}`} className="enlace-sutil">
            {TELEFONO_CONTACTO_VISIBLE}
          </a>
        </span>
        <nav aria-label="Enlaces de ayuda" className="flex gap-5">
          <Link href="/seguimiento" className="enlace-sutil">
            Seguimiento de pedido
          </Link>
          <Link href="/ayuda" className="enlace-sutil">
            Ayuda
          </Link>
          <Link href="/quienes-somos" className="enlace-sutil">
            Quiénes somos
          </Link>
        </nav>
      </Contenedor>
    </aside>
  );
}
