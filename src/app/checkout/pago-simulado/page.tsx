import type { Metadata } from "next";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { PagoSimulado } from "@/features/checkout/components/PagoSimulado";

export const metadata: Metadata = {
  title: "Pago simulado",
  robots: { index: false, follow: false },
};
export default function PaginaPagoSimulado() {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-6 min-h-[50vh] pb-12">
        <EncabezadoSeccion titulo="Pago simulado" nivel={1} />
        <PagoSimulado />
      </Contenedor>
    </main>
  );
}
