import type { Metadata } from "next";
import { PaginaLectura } from "@/components/ui/PaginaLectura";
import { TextoPendiente } from "@/features/contenido/components/TextoPendiente";
import { PLAZO_DESPACHO } from "@/lib/config";
import { openGraphPagina } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  alternates: { canonical: "/terminos" },
  description: "Términos y condiciones de la tienda en línea de Comercial Sedyjo.",
  openGraph: openGraphPagina({
    titulo: "Términos y condiciones",
    descripcion: "Términos y condiciones de la tienda en línea de Comercial Sedyjo.",
    ruta: "/terminos",
  }),
};

export default function PaginaTerminos() {
  return (
    <PaginaLectura
      titulo="Términos y condiciones"
      introduccion="Las reglas de uso de la tienda en línea de Comercial Sedyjo."
      secciones={[
        {
          id: "uso",
          titulo: "Uso de la tienda",
          contenido: (
            <TextoPendiente>
              Quién puede comprar, responsabilidad sobre los datos entregados y uso permitido del
              sitio.
            </TextoPendiente>
          ),
        },
        {
          id: "precios",
          titulo: "Precios y disponibilidad",
          contenido: (
            <>
              <p>
                Los precios están en pesos chilenos (CLP). La disponibilidad se revisa al momento de
                pagar y el pedido se confirma una vez aprobado el pago.
              </p>
              <TextoPendiente>
                Qué ocurre si un producto se agota después de la compra y cómo se informa el cambio.
              </TextoPendiente>
            </>
          ),
        },
        {
          id: "pago",
          titulo: "Pago",
          contenido: (
            <p>
              El único medio de pago es <strong>Webpay Plus (Transbank)</strong>. La tienda no
              solicita ni almacena datos de tarjeta.
            </p>
          ),
        },
        {
          id: "despacho",
          titulo: "Despacho",
          contenido: (
            <p>
              Solo despachamos a domicilio, en {PLAZO_DESPACHO} desde la confirmación del pago. Más
              detalles en la página de despachos.
            </p>
          ),
        },
        {
          id: "cambios",
          titulo: "Cambios y devoluciones",
          contenido: (
            <TextoPendiente>
              Resumen de la política de cambios y devoluciones (el detalle está en su propia
              página).
            </TextoPendiente>
          ),
        },
        {
          id: "legal",
          titulo: "Texto legal completo",
          contenido: (
            <TextoPendiente>
              Texto definitivo de los términos, revisado por quien corresponda antes de publicar la
              tienda.
            </TextoPendiente>
          ),
        },
      ]}
    />
  );
}
