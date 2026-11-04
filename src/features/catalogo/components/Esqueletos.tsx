import { Contenedor } from "@/components/ui/Contenedor";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { cn } from "@/lib/utils/cn";

/** Esqueletos con las mismas medidas que las tarjetas y secciones reales del catálogo. */

const gridOfertas =
  "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-[repeat(auto-fit,minmax(210px,1fr))] lg:gap-4";
const gridExclusivo =
  "grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] lg:gap-4";
const gridCategoria =
  "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]";

function Estado({ texto }: { texto: string }) {
  return (
    <span role="status" className="sr-only">
      {texto}
    </span>
  );
}

export function EsqueletoTarjetaProducto({ oscura = false }: { oscura?: boolean }) {
  const tema = oscura ? "oscuro" : "claro";
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex flex-col overflow-hidden rounded-[10px] border",
        oscura ? "border-carbon-borde bg-carbon" : "border-borde bg-white",
      )}
    >
      <Esqueleto
        tema={tema}
        className={cn("rounded-none h-[120px]", oscura ? "md:h-[180px]" : "md:h-[170px]")}
      />
      <div className="flex flex-col gap-2 px-2.5 pb-3 pt-2.5 md:px-3.5 md:pb-3.5 md:pt-3">
        <Esqueleto tema={tema} className="h-4 w-4/5" />
        <Esqueleto tema={tema} className="h-3 w-1/3" />
        <Esqueleto tema={tema} className="mt-1 h-6 w-1/2" />
        <Esqueleto tema={tema} className="mt-1.5 h-11 w-full md:h-11" />
      </div>
    </div>
  );
}

export function EsqueletoGrillaProductos({ cantidad = 5 }: { cantidad?: number }) {
  return (
    <>
      <Estado texto="Cargando productos" />
      <div aria-busy="true" className={gridOfertas}>
        {Array.from({ length: cantidad }, (_, i) => (
          <EsqueletoTarjetaProducto key={i} />
        ))}
      </div>
    </>
  );
}

function EsqueletoEncabezado() {
  return (
    <div
      aria-hidden="true"
      className="relative mb-3 flex items-baseline justify-between pb-2 md:mb-[18px] md:pb-2.5"
    >
      <Esqueleto className="h-7 w-56 md:h-9 md:w-80" />
      <Esqueleto className="h-4 w-16" />
      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-borde" />
    </div>
  );
}

export function EsqueletoOfertasSemana() {
  return (
    <section aria-busy="true" className="mt-8 md:mt-[52px]">
      <Estado texto="Cargando ofertas de la semana" />
      <EsqueletoEncabezado />
      <div className={gridOfertas}>
        {Array.from({ length: 5 }, (_, i) => (
          <EsqueletoTarjetaProducto key={i} />
        ))}
      </div>
    </section>
  );
}

export function EsqueletoCategorias() {
  return (
    <section aria-busy="true" className="mt-7 md:mt-11">
      <Estado texto="Cargando categorías" />
      <EsqueletoEncabezado />
      <div className={gridCategoria}>
        {Array.from({ length: 6 }, (_, i) => (
          <Esqueleto key={i} className="min-h-40 rounded-[10px] md:min-h-[210px]" />
        ))}
      </div>
    </section>
  );
}

export function EsqueletoExclusivoOnline() {
  return (
    <section
      aria-busy="true"
      className="mt-8 bg-negro py-[26px] md:mt-[52px] md:py-11 md:pb-[52px]"
    >
      <Estado texto="Cargando ofertas exclusivas" />
      <Contenedor>
        <div aria-hidden="true" className="mb-4 md:mb-6">
          <Esqueleto tema="oscuro" className="mb-2 h-5 w-28 md:mb-2.5" />
          <Esqueleto tema="oscuro" className="h-8 w-72 md:h-11 md:w-[28rem]" />
        </div>
        <div className={gridExclusivo}>
          {Array.from({ length: 4 }, (_, i) => (
            <EsqueletoTarjetaProducto key={i} oscura />
          ))}
        </div>
      </Contenedor>
    </section>
  );
}
