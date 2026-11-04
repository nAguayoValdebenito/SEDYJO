import type { Metadata } from "next";
import { PaginaLectura } from "@/components/ui/PaginaLectura";
import { ContactoAyuda } from "@/features/contenido/components/ContactoAyuda";
import { TextoPendiente } from "@/features/contenido/components/TextoPendiente";
import { openGraphPagina } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Cambios y devoluciones",
  alternates: { canonical: "/cambios-y-devoluciones" },
  description: "Cómo resolver un cambio o devolución de tu pedido.",
  openGraph: openGraphPagina({
    titulo: "Cambios y devoluciones",
    descripcion: "Cómo resolver un cambio o devolución de tu pedido.",
    ruta: "/cambios-y-devoluciones",
  }),
};

export default function PaginaCambios() {
  return (
    <PaginaLectura
      titulo="Cambios y devoluciones"
      introduccion="Si algo no salió como esperabas con tu pedido, te explicamos cómo resolverlo."
      secciones={[
        {
          id: "cambios",
          titulo: "Cambios",
          contenido: (
            <TextoPendiente>
              Plazo, condiciones y estado en que debe estar el producto para un cambio.
            </TextoPendiente>
          ),
        },
        {
          id: "devoluciones",
          titulo: "Devoluciones y reembolsos",
          contenido: (
            <TextoPendiente>
              Cuándo corresponde una devolución, cómo se reembolsa el pago hecho con Webpay Plus y
              en cuánto tiempo.
            </TextoPendiente>
          ),
        },
        {
          id: "productos-con-problemas",
          titulo: "Productos dañados o equivocados",
          contenido: (
            <TextoPendiente>
              Qué hacer si el pedido llega dañado, incompleto o con un producto distinto al pedido.
            </TextoPendiente>
          ),
        },
        {
          id: "como-solicitarlo",
          titulo: "Cómo solicitarlo",
          contenido: (
            <p>
              Contáctanos por teléfono o correo con tu número de pedido y te indicamos los pasos.
              Los datos de contacto están al final de esta página.
            </p>
          ),
        },
      ]}
      pie={<ContactoAyuda />}
    />
  );
}
