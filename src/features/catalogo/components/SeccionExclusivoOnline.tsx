import { Contenedor } from "@/components/ui/Contenedor";
import { FondoDoodlesComercio } from "@/components/ui/FondoDoodlesComercio";
import { Insignia } from "@/components/ui/Insignia";
import { RevelarGrupo } from "@/components/ui/Revelar";
import { getOfertaDestacada } from "@/lib/data";
import { TarjetaProductoOscura } from "./TarjetaProductoOscura";

const formatoFecha = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "long",
  timeZone: "America/Santiago",
});

/**
 * Franja negra con una oferta vigente de la API (título, vigencia y productos): dorado y morado
 * neón sobre fondo oscuro. Sin oferta vigente no se muestra.
 */
export async function SeccionExclusivoOnline() {
  const oferta = await getOfertaDestacada();
  if (!oferta) return null;
  const { productos } = oferta;

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
              {oferta.titulo}
            </h2>
          </div>
          {oferta.terminaEn && (
            <span className="rounded-full text-[13px] text-white md:border md:border-morado md:px-4 md:py-1.5 md:text-[15px]">
              Hasta el {formatoFecha.format(new Date(oferta.terminaEn))}
            </span>
          )}
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
