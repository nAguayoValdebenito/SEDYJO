import type { Metadata } from "next";
import { PaginaLectura } from "@/components/ui/PaginaLectura";
import { ContactoAyuda } from "@/features/contenido/components/ContactoAyuda";
import { TextoPendiente } from "@/features/contenido/components/TextoPendiente";
import { openGraphPagina } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Quiénes somos",
  alternates: { canonical: "/quienes-somos" },
  description: "Comercial Sedyjo, supermercado del sector Candelaria en San Pedro de la Paz.",
  openGraph: openGraphPagina({
    titulo: "Quiénes somos",
    descripcion: "Comercial Sedyjo, supermercado del sector Candelaria en San Pedro de la Paz.",
    ruta: "/quienes-somos",
  }),
};

export default function PaginaQuienesSomos() {
  return (
    <PaginaLectura
      titulo="Quiénes somos"
      introduccion="Comercial Sedyjo es un supermercado del sector Candelaria, en San Pedro de la Paz (Biobío)."
      secciones={[
        {
          id: "historia",
          titulo: "Nuestra historia",
          contenido: (
            <TextoPendiente>
              Cómo nació Comercial Sedyjo, cuánto tiempo llevan atendiendo y qué los distingue.
            </TextoPendiente>
          ),
        },
        {
          id: "que-vendemos",
          titulo: "Qué encontrarás",
          contenido: (
            <p>
              Abarrotes, confitería, bebidas, aseo y limpieza, higiene personal y detergentes, ahora
              con compra en línea y despacho a domicilio.
            </p>
          ),
        },
        {
          id: "donde-estamos",
          titulo: "Dónde estamos",
          contenido: (
            <p>
              Sector Candelaria, San Pedro de la Paz, Región del Biobío, Chile. La compra en línea
              se entrega solo a domicilio.
            </p>
          ),
        },
      ]}
      pie={<ContactoAyuda />}
    />
  );
}
