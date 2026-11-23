import type { Metadata } from "next";
import { Suspense } from "react";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { EsqueletoCheckout } from "@/features/checkout/components/EsqueletoCheckout";
import { RetornoPago } from "@/features/checkout/components/RetornoPago";

export const metadata: Metadata = {
  title: "Confirmando tu pago",
  robots: { index: false, follow: false },
};

/** Destino de Transbank (vía la API) al terminar el pago. */
export default function PaginaRetorno() {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-6 min-h-[50vh] pb-12">
        <EncabezadoSeccion titulo="Confirmando tu pago" nivel={1} />
        <Suspense fallback={<EsqueletoCheckout alto="h-[240px]" />}>
          <RetornoPago />
        </Suspense>
      </Contenedor>
    </main>
  );
}
