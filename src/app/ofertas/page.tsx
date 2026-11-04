import type { Metadata } from "next";
import { Suspense } from "react";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { EsqueletoGrillaProductos } from "@/features/catalogo/components/Esqueletos";
import { ListaProductosProgresiva } from "@/features/catalogo/components/ListaProductosProgresiva";
import { getProducts } from "@/lib/data";
import { openGraphPagina } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Ofertas",
  alternates: { canonical: "/ofertas" },
  description: "Productos en oferta de Comercial Sedyjo, con despacho a domicilio.",
  openGraph: openGraphPagina({
    titulo: "Ofertas",
    descripcion: "Productos en oferta de Comercial Sedyjo, con despacho a domicilio.",
    ruta: "/ofertas",
  }),
};

async function ListaOfertas() {
  const productos = (await getProducts()).filter((p) => p.precioAnterior || p.promo);

  return (
    <>
      <EncabezadoSeccion titulo="Ofertas" nivel={1} />
      {productos.length === 0 ? (
        <p className="py-10 text-gris-medio">Pronto publicaremos nuevas ofertas.</p>
      ) : (
        <ListaProductosProgresiva productos={productos} />
      )}
    </>
  );
}

export default function PaginaOfertas() {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-6 min-h-[50vh]">
        <Suspense
          fallback={
            <div className="min-h-[110vh]">
              <EsqueletoGrillaProductos cantidad={5} />
            </div>
          }
        >
          <ListaOfertas />
        </Suspense>
      </Contenedor>
    </main>
  );
}
