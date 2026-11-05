import type { Metadata } from "next";
import Link from "next/link";
import { PaginaLectura } from "@/components/ui/PaginaLectura";
import { ContactoAyuda } from "@/features/contenido/components/ContactoAyuda";
import { DESPACHO_GRATIS_DESDE, PLAZO_DESPACHO } from "@/lib/config";
import { getDespacho } from "@/lib/data";
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

export default async function PaginaDespachos() {
  // Plazo, monto de despacho gratis y comunas con su costo vienen de la API de Sedyjo.
  const despacho = await getDespacho();
  const plazo = despacho?.plazo ?? PLAZO_DESPACHO;
  const gratisDesde = despacho?.gratisDesde ?? DESPACHO_GRATIS_DESDE;
  const zonas = despacho?.zonas ?? [];

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
              Entregamos en <strong>{plazo}</strong> desde la confirmación del pago.
            </p>
          ),
        },
        {
          id: "costo",
          titulo: "Costo del despacho",
          contenido: (
            <>
              {gratisDesde !== null && (
                <p>
                  El despacho es <strong>gratis</strong> en compras sobre{" "}
                  <strong>{formatoPrecio(gratisDesde)}</strong>.
                </p>
              )}
              <p>
                {zonas.length > 0
                  ? "En compras bajo ese monto, el costo depende de tu comuna (ver la lista de más abajo). El total final aparece antes de pagar."
                  : "En compras bajo ese monto, el costo se calcula según tu comuna y aparece antes de pagar."}
              </p>
            </>
          ),
        },
        {
          id: "cobertura",
          titulo: "Dónde despachamos",
          contenido:
            zonas.length > 0 ? (
              <>
                <p>Despachamos a estas comunas, con el costo bajo el monto de despacho gratis:</p>
                <ul>
                  {zonas.map((z) => (
                    <li key={z.id}>
                      <strong>{z.comuna}</strong> ({z.region}): {formatoPrecio(z.costo)}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>
                Las comunas atendidas se muestran al ingresar tu dirección en el pago. Si tu comuna
                no aparece, todavía no llegamos a ella.
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
