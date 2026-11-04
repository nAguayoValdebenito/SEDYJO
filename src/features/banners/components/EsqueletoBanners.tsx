import { Esqueleto } from "@/components/ui/Esqueleto";

/** Esqueleto de la portada: banner principal y dos banners oscuros, con las medidas reales. */
export function EsqueletoBanners() {
  return (
    <div
      aria-busy="true"
      className="grid gap-2.5 sm:gap-4 lg:grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))]"
    >
      <span role="status" className="sr-only">
        Cargando promociones
      </span>
      <Esqueleto className="min-h-[210px] rounded-[10px] md:min-h-[380px]" />
      <div
        aria-hidden="true"
        className="-mx-3 flex gap-2.5 overflow-hidden px-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:p-0 lg:grid-cols-1 lg:grid-rows-2"
      >
        <Esqueleto
          tema="oscuro"
          className="min-h-[140px] flex-[0_0_280px] rounded-[10px] md:min-h-[182px] md:flex-auto"
        />
        <Esqueleto
          tema="oscuro"
          className="min-h-[140px] flex-[0_0_280px] rounded-[10px] md:min-h-[182px] md:flex-auto"
        />
      </div>
    </div>
  );
}
