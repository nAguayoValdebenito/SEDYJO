import type { Metadata } from "next";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { ErrorCheckout } from "@/features/checkout/components/ErrorCheckout";

export const metadata: Metadata = {
  title: "Pago no completado",
  robots: { index: false, follow: false },
};
export default function PaginaError() {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-6 min-h-[50vh] pb-12">
        <EncabezadoSeccion titulo="Pago no completado" nivel={1} />
        <ErrorCheckout />
      </Contenedor>
    </main>
  );
}
