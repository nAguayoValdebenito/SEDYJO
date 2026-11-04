import type { Metadata } from "next";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Checkout } from "@/features/checkout/components/Checkout";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default function PaginaCheckout() {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-6 min-h-[50vh] pb-12">
        <EncabezadoSeccion titulo="Finalizar compra" nivel={1} />
        <Checkout />
      </Contenedor>
    </main>
  );
}
