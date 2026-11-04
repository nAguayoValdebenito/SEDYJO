import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { EsqueletoGrillaProductos } from "@/features/catalogo/components/Esqueletos";
import { ListaProductosProgresiva } from "@/features/catalogo/components/ListaProductosProgresiva";
import { SeccionRecomendaciones } from "@/features/catalogo/components/SeccionRecomendaciones";
import { JsonLd } from "@/components/seo/JsonLd";
import { NOMBRE_SITIO, PLAZO_DESPACHO } from "@/lib/config";
import { getCategories, getProducts } from "@/lib/data";
import { migasJsonLd } from "@/lib/seo/jsonld";
import { openGraphPagina } from "@/lib/seo/metadata";

/** Categorías que se generan al compilar; el resto se genera en la primera visita. */
export async function generateStaticParams() {
  const categorias = await getCategories();
  return categorias.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const categoria = (await getCategories()).find((c) => c.slug === slug);
  if (!categoria) return { title: "Categoría" };
  const descripcion = `Compra ${categoria.nombre.toLowerCase()} en línea en ${NOMBRE_SITIO}: precios y ofertas, con despacho a domicilio en ${PLAZO_DESPACHO}.`;
  return {
    title: categoria.nombre,
    description: descripcion,
    alternates: { canonical: `/categoria/${slug}` },
    openGraph: openGraphPagina({
      titulo: categoria.nombre,
      descripcion,
      ruta: `/categoria/${slug}`,
    }),
  };
}

async function ProductosDeCategoria({ params }: Pick<PageProps<"/categoria/[slug]">, "params">) {
  const { slug } = await params;
  const categoria = (await getCategories()).find((c) => c.slug === slug);
  if (!categoria) notFound();

  const productos = await getProducts({ categoriaSlug: slug });

  return (
    <>
      <JsonLd
        datos={migasJsonLd([
          { nombre: "Inicio", ruta: "/" },
          { nombre: categoria.nombre, ruta: `/categoria/${slug}` },
        ])}
      />
      <EncabezadoSeccion titulo={categoria.nombre} nivel={1} />
      {productos.length === 0 ? (
        <p className="py-10 text-gris-medio">Pronto tendremos productos en esta categoría.</p>
      ) : (
        <ListaProductosProgresiva productos={productos} />
      )}
      <SeccionRecomendaciones excluirCategoriaSlug={slug} excluirIds={productos.map((p) => p.id)} />
    </>
  );
}

export default function PaginaCategoria(props: PageProps<"/categoria/[slug]">) {
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
          <ProductosDeCategoria params={props.params} />
        </Suspense>
      </Contenedor>
    </main>
  );
}
