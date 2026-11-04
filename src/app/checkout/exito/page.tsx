import type { Metadata } from "next";
import { Contenedor } from "@/components/ui/Contenedor";
import { ExitoCheckout } from "@/features/checkout/components/ExitoCheckout";

export const metadata: Metadata = {
  title: "Pedido recibido",
  robots: { index: false, follow: false },
};

export default function PaginaExito() {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-6 min-h-[50vh] pb-12">
        <ExitoCheckout />
      </Contenedor>
    </main>
  );
}
