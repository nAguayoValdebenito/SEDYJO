import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { RevelarGrupo } from "@/components/ui/Revelar";
import { getRecommendations } from "@/lib/data";
import type { Producto } from "@/types";
import { TarjetaProductoCompacta } from "./TarjetaProductoCompacta";

type Props = {
  /** Categoría que el cliente ya está viendo: sus productos no se repiten aquí. */
  excluirCategoriaSlug?: string;
  /** Productos ya mostrados en la página. */
  excluirIds?: string[];
};

/** Tira deslizable en celular y tablet; en escritorio una fila de tarjetas chicas (176 px). */
const clasesLista =
  "-mx-3 flex snap-x scroll-px-3 gap-2.5 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:-mx-8 md:scroll-px-8 md:px-8 lg:mx-0 lg:flex-wrap lg:gap-4 lg:overflow-visible lg:p-0";

function Bloque({ id, titulo, productos }: { id: string; titulo: string; productos: Producto[] }) {
  if (productos.length === 0) return null;

  return (
    <section aria-labelledby={id}>
      <EncabezadoSeccion id={id} titulo={titulo} compacto />
      <RevelarGrupo className={clasesLista}>
        {productos.map((p) => (
          <TarjetaProductoCompacta key={p.id} producto={p} />
        ))}
      </RevelarGrupo>
    </section>
  );
}

/**
 * "Ofertas que te pueden servir" y "Recomendados para ti", siempre de otras categorías y con
 * tarjetas pequeñas, para animar a completar la compra sin quitar protagonismo al listado.
 */
export async function SeccionRecomendaciones({ excluirCategoriaSlug, excluirIds = [] }: Props) {
  const ofertas = await getRecommendations({
    excluirCategoriaSlug,
    excluirIds,
    limite: 5,
    soloOfertas: true,
  });
  const recomendados = await getRecommendations({
    excluirCategoriaSlug,
    excluirIds: [...excluirIds, ...ofertas.map((p) => p.id)],
    limite: 5,
    variarCategorias: true,
  });

  if (ofertas.length === 0 && recomendados.length === 0) return null;

  return (
    <aside aria-label="Ofertas y recomendaciones" className="mt-9 flex flex-col gap-5 md:mt-12">
      <Bloque
        id="titulo-ofertas-utiles"
        titulo="Ofertas que te pueden servir"
        productos={ofertas}
      />
      <Bloque id="titulo-recomendados" titulo="Recomendados para ti" productos={recomendados} />
    </aside>
  );
}
