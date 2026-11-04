import type { Metadata } from "next";
import { Suspense } from "react";
import { Contenedor } from "@/components/ui/Contenedor";
import { EsqueletoCategorias } from "@/features/catalogo/components/Esqueletos";
import { SeccionCategorias } from "@/features/catalogo/components/SeccionCategorias";
import { openGraphPagina } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Todas las categorías",
  alternates: { canonical: "/categoria" },
  description: "Todas las categorías de Comercial Sedyjo.",
  openGraph: openGraphPagina({
    titulo: "Todas las categorías",
    descripcion: "Todas las categorías de Comercial Sedyjo.",
    ruta: "/categoria",
  }),
};

export default function PaginaCategorias() {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="min-h-[50vh]">
        <Suspense fallback={<EsqueletoCategorias />}>
          <SeccionCategorias conEnlace={false} nivelTitulo={1} />
        </Suspense>
      </Contenedor>
    </main>
  );
}
