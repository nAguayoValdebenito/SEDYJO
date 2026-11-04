import type { Metadata } from "next";
import Link from "next/link";
import { PaginaLectura } from "@/components/ui/PaginaLectura";
import { ContactoAyuda } from "@/features/contenido/components/ContactoAyuda";
import { ListaPreguntas, type Pregunta } from "@/features/contenido/components/ListaPreguntas";
import { DESPACHO_GRATIS_DESDE, PLAZO_DESPACHO } from "@/lib/config";
import { formatoPrecio } from "@/lib/utils/format";
import { openGraphPagina } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  alternates: { canonical: "/preguntas-frecuentes" },
  description: "Respuestas rápidas sobre despacho, pago y tu pedido.",
  openGraph: openGraphPagina({
    titulo: "Preguntas frecuentes",
    descripcion: "Respuestas rápidas sobre despacho, pago y tu pedido.",
    ruta: "/preguntas-frecuentes",
  }),
};

const preguntas: Pregunta[] = [
  {
    id: "cuanto-demora",
    pregunta: "¿Cuánto demora mi pedido?",
    respuesta: (
      <p>
        Entregamos en <strong>{PLAZO_DESPACHO}</strong> desde la confirmación del pago.
      </p>
    ),
  },
  {
    id: "despacho-gratis",
    pregunta: "¿Cuándo el despacho es gratis?",
    respuesta: (
      <p>
        {DESPACHO_GRATIS_DESDE === null
          ? "El monto mínimo para despacho gratis se informará pronto."
          : `En compras sobre ${formatoPrecio(DESPACHO_GRATIS_DESDE)}. Bajo ese monto, el costo se confirma al pagar.`}{" "}
        Más detalles en <Link href="/despachos">Despachos</Link>.
      </p>
    ),
  },
  {
    id: "retiro",
    pregunta: "¿Puedo retirar mi compra en la tienda?",
    respuesta: <p>No. Solo hacemos despacho a domicilio.</p>,
  },
  {
    id: "pago",
    pregunta: "¿Cómo puedo pagar?",
    respuesta: (
      <p>
        Con <strong>Webpay Plus (Transbank)</strong>. Nunca te pedimos datos de tarjeta en la
        tienda.
      </p>
    ),
  },
  {
    id: "cuenta",
    pregunta: "¿Necesito una cuenta para comprar?",
    respuesta: (
      <p>
        Puedes comprar sin cuenta. Con una cuenta guardas tus direcciones, ves tus pedidos y vuelves
        a comprar en un clic. <Link href="/registro">Crear mi cuenta</Link>.
      </p>
    ),
  },
  {
    id: "seguimiento",
    pregunta: "¿Cómo sigo mi pedido?",
    respuesta: (
      <p>
        En <Link href="/seguimiento">Seguimiento de pedido</Link> con tu número de pedido y el
        correo de la compra. Si tienes cuenta, también en{" "}
        <Link href="/cuenta/pedidos">Mis pedidos</Link>.
      </p>
    ),
  },
  {
    id: "cambios",
    pregunta: "¿Puedo cambiar o devolver un producto?",
    respuesta: (
      <p>
        Revisa <Link href="/cambios-y-devoluciones">Cambios y devoluciones</Link> o escríbenos con
        tu número de pedido.
      </p>
    ),
  },
  {
    id: "contacto",
    pregunta: "¿Cómo los contacto?",
    respuesta: <p>Con el celular o el correo que aparecen al final de esta página.</p>,
  },
];

export default function PaginaPreguntas() {
  return (
    <PaginaLectura
      titulo="Preguntas frecuentes"
      introduccion="Respuestas rápidas sobre despacho, pago y tu pedido."
      secciones={[
        {
          id: "preguntas",
          titulo: "Lo que más nos preguntan",
          contenido: <ListaPreguntas preguntas={preguntas} />,
        },
      ]}
      pie={<ContactoAyuda />}
    />
  );
}
