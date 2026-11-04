import type { Metadata } from "next";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { ResumenCarrito } from "@/features/carrito/components/ResumenCarrito";

export const metadata: Metadata = { title: "Carrito", robots: { index: false, follow: false } };

/** El carrito vive en el cliente (Zustand + localStorage): la página solo lo monta. */
export default function PaginaCarrito() {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-6 min-h-[50vh] pb-28 md:pb-0">
        <EncabezadoSeccion titulo="Tu carrito" nivel={1} />
        <ResumenCarrito />
      </Contenedor>
    </main>
  );
}
