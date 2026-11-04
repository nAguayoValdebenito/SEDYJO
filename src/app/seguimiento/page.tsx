import type { Metadata } from "next";
import { Suspense } from "react";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { BuscadorSeguimiento } from "@/features/pedidos/components/BuscadorSeguimiento";

export const metadata: Metadata = {
  title: "Seguimiento de pedido",
  robots: { index: false, follow: false },
};

export default function PaginaSeguimiento() {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-6 min-h-[50vh] pb-10">
        <EncabezadoSeccion titulo="Seguimiento de pedido" nivel={1} />
        <Suspense>
          <BuscadorSeguimiento />
        </Suspense>
      </Contenedor>
    </main>
  );
}
