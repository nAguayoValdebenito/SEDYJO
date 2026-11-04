import Image from "next/image";
import { Insignia } from "@/components/ui/Insignia";
import { cn } from "@/lib/utils/cn";
import type { BannerOscuro as BannerOscuroTipo } from "@/types";

type Props = {
  banner: BannerOscuroTipo;
};

/** Banner secundario: fondo negro con titular dorado o morado neón. */
export function BannerOscuro({ banner }: Props) {
  const esDorado = banner.colorTitular === "dorado";

  return (
    <article className="relative flex min-h-[140px] flex-[0_0_280px] snap-start flex-col justify-center gap-1 overflow-hidden rounded-[10px] bg-negro px-4 py-[18px] md:min-h-[182px] md:flex-auto md:gap-1.5 md:px-7 md:py-[26px]">
      <div className="absolute bottom-3.5 right-3 top-3.5 w-[34%] sm:w-[30%] md:bottom-[22px] md:right-[22px] md:top-[22px] lg:w-[34%]">
        <Image
          src={banner.imagen}
          alt={banner.alt}
          fill
          priority
          sizes="(min-width: 768px) 200px, 100px"
          className="rounded-lg object-cover"
        />
      </div>

      {esDorado ? (
        <Insignia variante="morada" className="relative self-start">
          {banner.insignia}
        </Insignia>
      ) : (
        <span className="relative text-xs font-bold uppercase tracking-[0.08em] text-oro md:text-[13px]">
          {banner.insignia}
        </span>
      )}
      <span
        className={cn(
          "relative font-titulos text-[30px] font-extrabold leading-none sm:text-[26px] lg:text-5xl",
          esDorado ? "text-oro" : "text-morado",
        )}
      >
        {banner.titular}
      </span>
      <span className="relative max-w-[140px] text-[13px] text-white lg:max-w-[230px] lg:text-base">
        {banner.detalle}
      </span>
    </article>
  );
}
