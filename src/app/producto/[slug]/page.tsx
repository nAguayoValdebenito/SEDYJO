import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Contenedor } from "@/components/ui/Contenedor";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { FichaProducto } from "@/features/catalogo/components/FichaProducto";
import { SeccionRelacionados } from "@/features/catalogo/components/SeccionRelacionados";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories, getProductBySlug, getProducts } from "@/lib/data";
import { migasJsonLd, productoJsonLd } from "@/lib/seo/jsonld";
import { openGraphPagina } from "@/lib/seo/metadata";

/** Productos que se generan al compilar; el resto se genera en la primera visita. */
export async function generateStaticParams() {
  const productos = await getProducts();
  return productos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductBySlug(slug);
  if (!producto) return { title: "Producto no encontrado" };
  const imagen = producto.imagenes[0];
  return {
    title: producto.nombre,
    description: producto.descripcionCorta,
    alternates: { canonical: `/producto/${slug}` },
    openGraph: openGraphPagina({
      titulo: producto.nombre,
      descripcion: producto.descripcionCorta,
      ruta: `/producto/${slug}`,
      imagen,
    }),
  };
}

function EsqueletoFicha() {
  return (
    <div
      aria-busy="true"
      className="grid gap-6 md:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
    >
      <span role="status" className="sr-only">
        Cargando el producto
      </span>
      <Esqueleto className="aspect-square w-full rounded-xl" />
      <div className="flex flex-col gap-4">
        <Esqueleto className="h-6 w-32" />
        <Esqueleto className="h-10 w-3/4" />
        <Esqueleto className="h-12 w-48" />
        <Esqueleto className="h-11 w-full max-w-xs" />
      </div>
    </div>
  );
}

async function Ficha({ params }: Pick<PageProps<"/producto/[slug]">, "params">) {
  const { slug } = await params;
  const producto = await getProductBySlug(slug);
  if (!producto) notFound();
  const categoria = (await getCategories()).find((c) => c.slug === producto.categoriaSlug);

  return (
    <>
      <JsonLd datos={productoJsonLd(producto, categoria)} />
      <JsonLd
        datos={migasJsonLd([
          { nombre: "Inicio", ruta: "/" },
          ...(categoria
            ? [{ nombre: categoria.nombre, ruta: `/categoria/${categoria.slug}` }]
            : []),
          { nombre: producto.nombre, ruta: `/producto/${producto.slug}` },
        ])}
      />
      <FichaProducto producto={producto} categoria={categoria} />
      <SeccionRelacionados slug={producto.slug} />
    </>
  );
}

export default function PaginaProducto(props: PageProps<"/producto/[slug]">) {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-4 min-h-[50vh] pb-10">
        <Suspense fallback={<EsqueletoFicha />}>
          <Ficha params={props.params} />
        </Suspense>
      </Contenedor>
    </main>
  );
}
