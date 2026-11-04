import type { Metadata } from "next";
import { PaginaLectura } from "@/components/ui/PaginaLectura";
import { ContactoAyuda } from "@/features/contenido/components/ContactoAyuda";
import { TextoPendiente } from "@/features/contenido/components/TextoPendiente";
import { openGraphPagina } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Política de privacidad",
  alternates: { canonical: "/privacidad" },
  description: "Política de privacidad de Comercial Sedyjo.",
  openGraph: openGraphPagina({
    titulo: "Política de privacidad",
    descripcion: "Política de privacidad de Comercial Sedyjo.",
    ruta: "/privacidad",
  }),
};

export default function PaginaPrivacidad() {
  return (
    <PaginaLectura
      titulo="Política de privacidad"
      introduccion="Qué datos te pedimos, para qué los usamos y cómo cuidarlos."
      secciones={[
        {
          id: "datos",
          titulo: "Qué datos pedimos",
          contenido: (
            <>
              <p>Para comprar y despachar tu pedido te pedimos:</p>
              <ul>
                <li>nombre, correo y celular de contacto;</li>
                <li>dirección de despacho;</li>
                <li>los productos de tu compra.</li>
              </ul>
              <p>
                <strong>No pedimos ni guardamos datos de tarjeta:</strong> el pago se realiza en
                Webpay Plus (Transbank).
              </p>
            </>
          ),
        },
        {
          id: "uso",
          titulo: "Para qué los usamos",
          contenido: (
            <TextoPendiente>
              Finalidades del tratamiento: preparar y despachar pedidos, contacto sobre tu compra y
              mejoras del servicio.
            </TextoPendiente>
          ),
        },
        {
          id: "terceros",
          titulo: "Con quién los compartimos",
          contenido: (
            <TextoPendiente>
              Proveedores que reciben datos (pasarela de pago, servicio de despacho, hosting) y bajo
              qué condiciones.
            </TextoPendiente>
          ),
        },
        {
          id: "derechos",
          titulo: "Tus derechos",
          contenido: (
            <TextoPendiente>
              Cómo acceder, corregir o eliminar tus datos, según la normativa chilena vigente.
            </TextoPendiente>
          ),
        },
      ]}
      pie={<ContactoAyuda />}
    />
  );
}
