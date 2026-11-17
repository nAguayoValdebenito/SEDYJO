import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { BannerOscuro as BannerOscuroTipo } from "@/types";
import {
  CLASE_TITULO,
  DISENO_VACIO,
  OSCURO_IMAGEN,
  claseColorTexto,
  claseFondo,
  tamanoDelTitulo,
} from "../diseno";

type Props = {
  banner: BannerOscuroTipo;
};

/**
 * Banner secundario: fondo oscuro con titular dorado o morado neón (el administrador puede elegir
 * otro fondo, color de texto, tamaño del título y tamaño, lado y ajuste de la imagen). Si la API
 * trae enlace, todo el banner es clicable desde el texto del botón (enlace "estirado": un solo
 * foco, nombre claro).
 *
 * Texto e imagen van lado a lado en una fila: el texto ocupa lo que la imagen deja libre, así que
 * un título largo se parte en más líneas y nunca pasa por debajo de la foto.
 */
export function BannerOscuro({ banner }: Props) {
  const d = banner.diseno ?? DISENO_VACIO;
  const colorTexto =
    claseColorTexto(d.colorTexto) ?? (banner.colorTitular === "dorado" ? "text-oro" : "text-morado");
  const izquierda = d.ladoImagen === "left";
  const tamTitulo = tamanoDelTitulo(banner.titular, d.tamanoTitulo, "oscuro");

  return (
    <article
      className={cn(
        "relative flex min-h-[140px] flex-[0_0_280px] snap-start items-stretch gap-3 overflow-hidden rounded-[10px] py-3.5 md:min-h-[182px] md:flex-auto md:gap-4 md:py-[22px]",
        izquierda
          ? "flex-row-reverse pl-3 pr-4 md:pl-[22px] md:pr-7"
          : "flex-row pl-4 pr-3 md:pl-7 md:pr-[22px]",
        claseFondo("oscuro", d.colorFondo),
      )}
    >
      <div className="relative flex min-w-0 flex-1 flex-col justify-center gap-1 md:gap-1.5">
        <span
          className={cn(
            "break-words font-titulos font-extrabold leading-none",
            CLASE_TITULO.oscuro[tamTitulo],
            colorTexto,
          )}
        >
          {banner.titular}
        </span>
        <span className="text-[13px] text-white lg:text-base">{banner.detalle}</span>
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
      </div>

      <div className={cn("relative shrink-0 self-stretch", OSCURO_IMAGEN[d.tamanoImagen ?? "md"])}>
        <Image
          src={banner.imagen}
          alt={banner.alt}
          fill
          priority
          sizes="(min-width: 768px) 260px, 120px"
          className={cn("rounded-lg", d.ajusteImagen === "contain" ? "object-contain" : "object-cover")}
        />
      </div>
    </article>
  );
}
