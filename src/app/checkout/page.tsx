import type { Metadata } from "next";
import { Suspense } from "react";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Checkout } from "@/features/checkout/components/Checkout";
import { EsqueletoCheckout } from "@/features/checkout/components/EsqueletoCheckout";
import { getDespacho } from "@/lib/data";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

async function CheckoutConDespacho() {
  return <Checkout despacho={await getDespacho()} />;
}

export default function PaginaCheckout() {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-6 min-h-[50vh] pb-12">
        <EncabezadoSeccion titulo="Finalizar compra" nivel={1} />
        <Suspense fallback={<EsqueletoCheckout />}>
          <CheckoutConDespacho />
        </Suspense>
      </Contenedor>
    </main>
  );
}
