import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Suspense } from "react";
import { claseBoton } from "@/components/ui/boton";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { EsqueletoGrillaProductos } from "@/features/catalogo/components/Esqueletos";
import { ListaProductosProgresiva } from "@/features/catalogo/components/ListaProductosProgresiva";
import { SeccionRecomendaciones } from "@/features/catalogo/components/SeccionRecomendaciones";
import { searchProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Resultados de búsqueda",
  robots: { index: false, follow: false },
};

function primero(valor: string | string[] | undefined): string {
  return (Array.isArray(valor) ? valor[0] : valor) ?? "";
}

async function Resultados({ searchParams }: Pick<PageProps<"/buscar">, "searchParams">) {
  const params = await searchParams;
  const consulta = primero(params.q).trim();
  const categoria = primero(params.categoria) || undefined;

  const productos = await searchProducts(consulta, categoria);
  const titulo = consulta ? `Resultados para “${consulta}”` : "Todos los productos";

  return (
    <>
      <EncabezadoSeccion titulo={titulo} nivel={1} />
      <p role="status" className="mb-4 text-sm text-gris-texto">
        {productos.length === 1 ? "1 producto" : `${productos.length} productos`}
      </p>
      {productos.length === 0 ? (
        <div className="flex max-w-md flex-col items-start gap-4 py-6">
          <SearchX size={40} strokeWidth={1.5} aria-hidden="true" className="text-gris-texto" />
          <p className="text-gris-medio">
            No encontramos productos con esa búsqueda. Revisa la ortografía o prueba con una palabra
            más corta, como “leche” o “galletas”.
          </p>
          <Link href="/categoria" className={claseBoton("primario", "lg")}>
            Ver categorías
          </Link>
        </div>
      ) : (
        <ListaProductosProgresiva productos={productos} />
      )}
      <SeccionRecomendaciones excluirIds={productos.map((p) => p.id)} />
    </>
  );
}

export default function PaginaBuscar(props: PageProps<"/buscar">) {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-6 min-h-[50vh]">
        <Suspense
          fallback={
            <div className="min-h-[110vh]">
              <EsqueletoGrillaProductos cantidad={4} />
            </div>
          }
        >
          <Resultados searchParams={props.searchParams} />
        </Suspense>
      </Contenedor>
    </main>
  );
}
