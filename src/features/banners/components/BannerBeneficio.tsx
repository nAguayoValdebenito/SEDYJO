import Link from "next/link";
import { claseBoton } from "@/components/ui/boton";

/** Banner ancho de fondo negro para un beneficio o campaña. Textos por definir. */
export function BannerBeneficio() {
  return (
    <section
      aria-label="Beneficio destacado"
      className="sobre-oscuro mt-7 flex flex-col gap-2.5 rounded-xl bg-negro px-[18px] py-5 md:mt-12 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-5 md:rounded-[14px] md:px-9 md:py-[26px]"
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-titulos text-[26px] font-extrabold leading-none text-morado md:text-[34px]">
          [Nombre del beneficio]
        </span>
        <span className="text-[13px] text-white md:text-[15px]">
          [Fechas o condiciones de la campaña]
        </span>
      </div>
      <div className="flex items-center gap-5">
        <span className="hidden h-[70px] w-[140px] items-center justify-center rounded-lg border-2 border-dashed border-oro text-xs text-oro md:flex">
          [imagen]
        </span>
        <Link href="/ofertas" className={claseBoton("dorado", "lg", "self-start md:text-base")}>
          [Acción]
        </Link>
      </div>
    </section>
  );
}
