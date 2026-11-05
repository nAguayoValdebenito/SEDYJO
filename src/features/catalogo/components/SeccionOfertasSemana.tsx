import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { RevelarGrupo } from "@/components/ui/Revelar";
import { getProducts } from "@/lib/data";
import { TarjetaProducto } from "./TarjetaProducto";

export async function SeccionOfertasSemana() {
  const productos = await getProducts({ coleccion: "semana" });
  // Con ofertas vigentes de la API son "Ofertas de la semana"; sin ellas, una selección destacada.
  const hayOfertas = productos.some((p) => p.precioAnterior !== null);

  return (
    <section
      aria-labelledby="titulo-ofertas"
      id="ofertas"
      className="mt-8 scroll-mt-24 md:mt-[52px]"
    >
      <EncabezadoSeccion
        id="titulo-ofertas"
        titulo={hayOfertas ? "Ofertas de la semana" : "Productos destacados"}
        enlace={
          hayOfertas
            ? { texto: "Ver todas", href: "/ofertas" }
            : { texto: "Ver categorías", href: "/categoria" }
        }
      />
      <RevelarGrupo className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-[repeat(auto-fit,minmax(210px,1fr))] lg:gap-4">
        {productos.map((p) => (
          <TarjetaProducto key={p.id} producto={p} />
        ))}
      </RevelarGrupo>
    </section>
  );
}
