import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { BannerOscuro as BannerOscuroTipo } from "@/types";

type Props = {
  banner: BannerOscuroTipo;
};

/**
 * Banner secundario: fondo negro con titular dorado o morado neón. Si la API trae enlace, todo
 * el banner es clicable desde el texto del botón (enlace "estirado": un solo foco, nombre claro).
 */
export function BannerOscuro({ banner }: Props) {
  const esDorado = banner.colorTitular === "dorado";
  const colorTexto = esDorado ? "text-oro" : "text-morado";

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

      <span
        className={cn(
          "relative font-titulos text-[30px] font-extrabold leading-none sm:text-[26px] lg:text-5xl",
          colorTexto,
        )}
      >
        {banner.titular}
      </span>
      <span className="relative max-w-[140px] text-[13px] text-white lg:max-w-[230px] lg:text-base">
        {banner.detalle}
      </span>
      {banner.href && banner.cta && (
        <Link
          href={banner.href}
          className={cn(
            "relative mt-1 self-start text-sm font-bold underline-offset-4 hover:underline after:absolute after:inset-[-200px] after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current md:text-[15px]",
            colorTexto,
          )}
        >
          {banner.cta}
          <span className="sr-only">: {banner.titular}</span>
        </Link>
      )}
    </article>
  );
}
