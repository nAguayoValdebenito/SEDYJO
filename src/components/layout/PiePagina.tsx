import Link from "next/link";
import { Contenedor } from "@/components/ui/Contenedor";
import {
  CORREO_CONTACTO,
  PLAZO_DESPACHO,
  TELEFONO_CONTACTO,
  TELEFONO_CONTACTO_VISIBLE,
} from "@/lib/config";

const ENLACES_AYUDA = [
  { href: "/despachos", texto: "Despachos" },
  { href: "/preguntas-frecuentes", texto: "Preguntas frecuentes" },
  { href: "/cambios-y-devoluciones", texto: "Cambios y devoluciones" },
  { href: "/seguimiento", texto: "Seguimiento de pedido" },
];

const ENLACES_LEGALES = [
  { href: "/terminos", texto: "Términos y condiciones" },
  { href: "/privacidad", texto: "Privacidad" },
  { href: "/quienes-somos", texto: "Quiénes somos" },
];

/** Pie de página: datos de contacto, ayuda y enlaces legales. */
export function PiePagina() {
  return (
    <footer className="sobre-oscuro mt-8 bg-azul py-[26px] text-[13px] leading-[1.7] text-white md:mt-16 md:bg-pie md:py-10 md:text-sm">
      <Contenedor className="flex flex-col gap-6 md:flex-row md:flex-wrap md:justify-between md:gap-8">
        <div>
          <div className="mb-1 font-titulos text-xl font-extrabold md:mb-1.5 md:text-[22px]">
            Comercial Sedyjo
          </div>
          <div>Candelaria, San Pedro de la Paz</div>
          <div>Región del Biobío, Chile</div>
        </div>
        <div>
          <div className="mb-1.5 font-bold">Contacto</div>
          <div>
            <a href={`tel:${TELEFONO_CONTACTO}`} className="enlace-sutil">
              {TELEFONO_CONTACTO_VISIBLE}
            </a>
          </div>
          <div>
            <a href={`mailto:${CORREO_CONTACTO}`} className="enlace-sutil">
              {CORREO_CONTACTO}
            </a>
          </div>
        </div>
        <nav aria-label="Ayuda" className="hidden md:block">
          <div className="mb-1.5 font-bold">Ayuda</div>
          <ul>
            {ENLACES_AYUDA.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="enlace-sutil inline-flex min-h-8 items-center">
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Contenedor>

      <Contenedor>
        <div className="mt-5 flex flex-col gap-3 border-t border-white/20 pt-4 md:mt-8 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Información legal">
            <ul className="flex flex-wrap gap-x-5">
              {[
                ...ENLACES_LEGALES,
                ...ENLACES_AYUDA.slice(0, 3).map((e) => ({ ...e, movil: true })),
              ].map((e) => (
                <li key={e.href} className={"movil" in e ? "md:hidden" : undefined}>
                  <Link href={e.href} className="enlace-sutil inline-flex min-h-9 items-center">
                    {e.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-white/80">
            © 2026 Comercial Sedyjo · Despacho a domicilio en {PLAZO_DESPACHO}
          </p>
        </div>
      </Contenedor>
    </footer>
  );
}
