import type { Metadata } from "next";
import Link from "next/link";
import {
  CircleHelp,
  FileText,
  RefreshCcw,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { MigasDePan } from "@/components/ui/MigasDePan";
import { RevelarGrupo } from "@/components/ui/Revelar";
import { ContactoAyuda } from "@/features/contenido/components/ContactoAyuda";
import { openGraphPagina } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Ayuda",
  alternates: { canonical: "/ayuda" },
  description: "Centro de ayuda de Comercial Sedyjo: despachos, preguntas y contacto.",
  openGraph: openGraphPagina({
    titulo: "Ayuda",
    descripcion: "Centro de ayuda de Comercial Sedyjo: despachos, preguntas y contacto.",
    ruta: "/ayuda",
  }),
};

const TEMAS: { href: string; titulo: string; texto: string; Icono: LucideIcon }[] = [
  {
    href: "/despachos",
    titulo: "Despachos",
    texto: "Plazos, costo y cobertura del despacho a domicilio.",
    Icono: Truck,
  },
  {
    href: "/preguntas-frecuentes",
    titulo: "Preguntas frecuentes",
    texto: "Respuestas rápidas sobre pago, pedidos y cuenta.",
    Icono: CircleHelp,
  },
  {
    href: "/cambios-y-devoluciones",
    titulo: "Cambios y devoluciones",
    texto: "Qué hacer si algo no salió como esperabas.",
    Icono: RefreshCcw,
  },
  {
    href: "/terminos",
    titulo: "Términos y condiciones",
    texto: "Las reglas de uso de la tienda en línea.",
    Icono: FileText,
  },
  {
    href: "/privacidad",
    titulo: "Política de privacidad",
    texto: "Qué datos pedimos y cómo los cuidamos.",
    Icono: ShieldCheck,
  },
];

export default function PaginaAyuda() {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-4 pb-12">
        <MigasDePan migas={[{ texto: "Inicio", href: "/" }, { texto: "Ayuda" }]} />
        <EncabezadoSeccion titulo="Centro de ayuda" nivel={1} />
        <p className="-mt-1 mb-6 max-w-2xl text-lg text-gris-medio">
          Elige un tema o escríbenos: te ayudamos con tu compra.
        </p>

        <RevelarGrupo className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEMAS.map(({ href, titulo, texto, Icono }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-2 rounded-[10px] border border-borde bg-white p-5 transition-[border-color,box-shadow,translate] duration-300 ease-[var(--ease-salida)] hover:-translate-y-0.5 hover:border-verde hover:shadow-[0_14px_26px_-18px_rgb(31_41_51/0.45)]"
            >
              <Icono size={28} strokeWidth={1.6} aria-hidden="true" className="text-verde" />
              <span className="font-titulos text-lg font-extrabold">{titulo}</span>
              <span className="text-sm text-gris-medio">{texto}</span>
            </Link>
          ))}
        </RevelarGrupo>

        <div className="mt-8 max-w-xl">
          <ContactoAyuda />
        </div>
      </Contenedor>
    </main>
  );
}
