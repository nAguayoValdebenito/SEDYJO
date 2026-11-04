import type { Metadata } from "next";
import Link from "next/link";
import { PaginaLectura } from "@/components/ui/PaginaLectura";
import { ContactoAyuda } from "@/features/contenido/components/ContactoAyuda";
import {
  COSTO_DESPACHO,
  DESPACHO_GRATIS_DESDE,
  PLAZO_DESPACHO,
  ZONAS_DESPACHO,
} from "@/lib/config";
import { formatoPrecio } from "@/lib/utils/format";
import { openGraphPagina } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Despachos",
  description: `Despacho a domicilio en ${PLAZO_DESPACHO}. Gratis sobre ${formatoPrecio(DESPACHO_GRATIS_DESDE ?? 0)}.`,
  alternates: { canonical: "/despachos" },
  openGraph: openGraphPagina({
    titulo: "Despachos",
    descripcion: `Despacho a domicilio en ${PLAZO_DESPACHO}.`,
    ruta: "/despachos",
  }),
};

export default function PaginaDespachos() {
  return (
    <PaginaLectura
      titulo="Despachos"
      introduccion="Llevamos tu compra a la puerta de tu casa. Aquí está todo lo que necesitas saber."
      secciones={[
        {
          id: "como-funciona",
          titulo: "Cómo funciona",
          contenido: (
            <>
              <p>
                Solo hacemos <strong>despacho a domicilio</strong>: la tienda no tiene retiro en
                local. Compras en línea, pagas con Webpay Plus y recibes tu pedido en la dirección
                que indiques.
              </p>
            </>
          ),
        },
        {
          id: "plazos",
          titulo: "Plazo de entrega",
          contenido: (
            <p>
              Entregamos en <strong>{PLAZO_DESPACHO}</strong> desde la confirmación del pago.
            </p>
          ),
        },
        {
          id: "costo",
          titulo: "Costo del despacho",
          contenido: (
            <>
              {DESPACHO_GRATIS_DESDE !== null && (
                <p>
                  El despacho es <strong>gratis</strong> en compras sobre{" "}
                  <strong>{formatoPrecio(DESPACHO_GRATIS_DESDE)}</strong>.
                </p>
              )}
              <p>
                {COSTO_DESPACHO === null
                  ? "En compras bajo ese monto, el costo del despacho se confirma al pagar."
                  : `En compras bajo ese monto, el despacho cuesta ${formatoPrecio(COSTO_DESPACHO)}.`}
              </p>
            </>
          ),
        },
        {
          id: "cobertura",
          titulo: "Dónde despachamos",
          contenido: (
            <p>
              {ZONAS_DESPACHO
                ? `Comunas atendidas: ${ZONAS_DESPACHO.join(", ")}.`
                : "Las comunas atendidas se confirman al ingresar tu dirección en el pago."}
            </p>
          ),
        },
        {
          id: "seguimiento",
          titulo: "Sigue tu pedido",
          contenido: (
            <p>
              Con tu número de pedido y tu correo puedes ver en qué estado va, sin necesidad de
              cuenta, en <Link href="/seguimiento">Seguimiento de pedido</Link>. Si tienes cuenta,
              también lo ves en <Link href="/cuenta/pedidos">Mis pedidos</Link>.
            </p>
          ),
        },
      ]}
      pie={<ContactoAyuda />}
    />
  );
}
