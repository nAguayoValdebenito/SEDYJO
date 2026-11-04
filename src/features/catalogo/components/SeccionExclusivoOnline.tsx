import { Contenedor } from "@/components/ui/Contenedor";
import { FondoDoodlesComercio } from "@/components/ui/FondoDoodlesComercio";
import { Insignia } from "@/components/ui/Insignia";
import { RevelarGrupo } from "@/components/ui/Revelar";
import { getProducts } from "@/lib/data";
import { TarjetaProductoOscura } from "./TarjetaProductoOscura";

/** Franja negra de ofertas temporales: dorado y morado neón sobre fondo oscuro. */
export async function SeccionExclusivoOnline() {
  const productos = await getProducts({ coleccion: "exclusivo-online" });

  return (
    <section
      aria-labelledby="titulo-exclusivo"
      className="sobre-oscuro relative mt-8 overflow-hidden bg-negro py-[26px] md:mt-[52px] md:py-11 md:pb-[52px]"
    >
      <FondoDoodlesComercio />
      <Contenedor className="relative">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 md:mb-6">
          <div>
            <Insignia variante="morada" className="mb-2 md:mb-2.5">
              exclusivo online
            </Insignia>
            <h2
              id="titulo-exclusivo"
              className="font-titulos text-[28px] font-extrabold leading-none text-oro md:text-[42px]"
            >
              [Título de la oferta temporal]
            </h2>
          </div>
          <span className="rounded-full text-[13px] text-white md:border md:border-morado md:px-4 md:py-1.5 md:text-[15px]">
            [Fechas de vigencia]
          </span>
        </div>
        <RevelarGrupo className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] lg:gap-4">
          {productos.map((p) => (
            <TarjetaProductoOscura key={p.id} producto={p} />
          ))}
        </RevelarGrupo>
      </Contenedor>
    </section>
  );
}
