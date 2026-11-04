"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { ImageIcon } from "lucide-react";

type Props = {
  src: string | null;
  alt: string;
  /** Texto del marcador mientras no exista la foto. */
  marcador?: string;
  sizes: string;
  /** Color del texto y borde del marcador (según el fondo). */
  tema?: "claro" | "oscuro";
  /** Para fotos del primer pantallazo: se cargan de inmediato. */
  prioridad?: boolean;
};

/**
 * Foto que rellena a su contenedor (debe ser `relative`).
 * Entra con un fundido sobre el color de fondo cuando termina de cargar. El crecimiento
 * al pasar el cursor lo hace la tarjeta completa, no la foto sola.
 * Sin foto muestra un marcador punteado, como en la maqueta.
 */
export function FotoOMarcador({
  src,
  alt,
  marcador = "[foto]",
  sizes,
  tema = "claro",
  prioridad = false,
}: Props) {
  const [cargada, setCargada] = useState(false);

  // La foto puede terminar de cargar antes de que React se hidrate.
  const alMontar = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete) setCargada(true);
  }, []);

  if (src) {
    return (
      <Image
        ref={alMontar}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={prioridad}
        onLoad={() => setCargada(true)}
        data-cargada={cargada}
        className="object-cover opacity-0 transition-opacity duration-300 ease-out data-[cargada=true]:opacity-100"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${alt}: foto pendiente`}
      className={
        tema === "claro"
          ? "absolute inset-[18%] flex flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-gris-medio p-2 text-center text-xs text-gris-medio"
          : "absolute inset-[18%] flex flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-oro p-2 text-center text-xs text-oro"
      }
    >
      <ImageIcon size={22} strokeWidth={1.6} aria-hidden="true" className="opacity-60" />
      {marcador}
    </div>
  );
}
