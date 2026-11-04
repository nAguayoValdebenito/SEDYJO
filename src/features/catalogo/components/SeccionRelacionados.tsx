import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { RevelarGrupo } from "@/components/ui/Revelar";
import { getRelatedProducts } from "@/lib/data";
import { TarjetaProductoCompacta } from "./TarjetaProductoCompacta";

/** Tira deslizable en celular y tablet; fila de tarjetas chicas en escritorio. */
const clasesLista =
  "-mx-3 flex snap-x scroll-px-3 gap-2.5 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:-mx-8 md:scroll-px-8 md:px-8 lg:mx-0 lg:flex-wrap lg:gap-4 lg:overflow-visible lg:p-0";

/** "También te puede interesar": productos de la misma categoría y ofertas de otras. */
export async function SeccionRelacionados({ slug }: { slug: string }) {
  const productos = await getRelatedProducts(slug, 6);
  if (productos.length === 0) return null;

  return (
    <section aria-labelledby="titulo-relacionados" className="mt-10 md:mt-14">
      <EncabezadoSeccion id="titulo-relacionados" titulo="También te puede interesar" compacto />
      <RevelarGrupo className={clasesLista}>
        {productos.map((p) => (
          <TarjetaProductoCompacta key={p.id} producto={p} />
        ))}
      </RevelarGrupo>
    </section>
  );
}
