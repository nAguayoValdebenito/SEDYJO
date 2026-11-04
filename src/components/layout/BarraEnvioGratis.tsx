import { Truck } from "lucide-react";
import { Contenedor } from "@/components/ui/Contenedor";
import { DESPACHO_GRATIS_DESDE, PLAZO_DESPACHO } from "@/lib/config";
import { formatoPrecio } from "@/lib/utils/format";

/**
 * Banner de despacho gratis bajo el buscador. "DESPACHO GRATIS" va siempre del mismo tamaño
 * (GRATIS resaltado en dorado) y el resto del mensaje se reparte alrededor en letra más chica,
 * en mayúsculas, con el monto en una píldora de borde dorado.
 */
export function BarraEnvioGratis() {
  const monto =
    DESPACHO_GRATIS_DESDE === null ? "[monto mínimo]" : formatoPrecio(DESPACHO_GRATIS_DESDE);
  const titulo =
    "font-titulos text-[26px] font-extrabold uppercase leading-none md:text-3xl lg:text-4xl";

  return (
    <section aria-label="Despacho gratis" className="sobre-oscuro bg-verde-profundo">
      <Contenedor className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 py-2.5 md:gap-x-7 md:py-3">
        <div className="flex items-center gap-2.5 md:gap-3.5">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-oro bg-verde-oscuro md:size-12"
          >
            <Truck
              strokeWidth={1.6}
              className="camion-entra size-[22px] text-verde-menta md:size-6"
            />
          </span>
          <span className={`${titulo} text-white`}>Despacho</span>
          <span className={`${titulo} rounded-md bg-oro px-2.5 py-1.5 text-negro md:px-3`}>
            Gratis
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase leading-tight tracking-[0.08em] text-white md:text-sm">
            En compras
            <br />
            sobre
          </span>
          <span className="rounded-full border-2 border-oro px-3.5 py-0.5 font-titulos text-xl font-extrabold leading-tight text-oro tabular-nums md:px-4 md:text-2xl">
            {monto}
          </span>
        </div>

        <span className="hidden text-xs font-bold uppercase leading-tight tracking-[0.08em] text-verde-palido lg:block">
          Entrega en
          <br />
          {PLAZO_DESPACHO}
        </span>
        <span className="basis-full text-center text-[11px] font-bold uppercase tracking-[0.08em] text-verde-palido lg:hidden">
          Entrega en {PLAZO_DESPACHO}
        </span>
      </Contenedor>
    </section>
  );
}
