import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { RevelarGrupo } from "@/components/ui/Revelar";
import { getCategories } from "@/lib/data";
import { TarjetaCategoria } from "./TarjetaCategoria";

export async function SeccionCategorias({
  conEnlace = true,
  nivelTitulo = 2,
}: {
  conEnlace?: boolean;
  nivelTitulo?: 1 | 2;
}) {
  const categorias = await getCategories();

  return (
    <section
      aria-labelledby="titulo-categorias"
      id="categorias"
      className="mt-7 scroll-mt-24 md:mt-11"
    >
      <EncabezadoSeccion
        id="titulo-categorias"
        titulo="Compra por categoría"
        nivel={nivelTitulo}
        enlace={conEnlace ? { texto: "Ver todas", href: "/categoria" } : undefined}
      />
      <RevelarGrupo className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        {categorias.map((c, i) => (
          <TarjetaCategoria key={c.id} categoria={c} prioridad={i < 3} />
        ))}
      </RevelarGrupo>
    </section>
  );
}
