"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { claseBoton, interaccionVivaBase } from "@/components/ui/boton";
import { cn } from "@/lib/utils/cn";
import type { Banner } from "@/types";

type Props = {
  banners: Banner[];
};

/** Segundos entre banners: lo bastante largo para leer, lo bastante corto para que se sienta vivo. */
const INTERVALO_MS = 8000;
const UMBRAL_DESLIZAR_PX = 40;

/**
 * Banner principal autoadministrable: carrusel que avanza solo cada 8 s, con barra de
 * progreso en el punto activo, flechas (escritorio) y deslizar con el dedo (celular).
 *
 * Decisión de diseño: no tiene botón de pausa. Se pausa solo mientras el cursor está encima
 * o hay foco dentro, y no rota con "reducir movimiento". (WCAG 2.2.2 pide un control de
 * pausa para contenido que rota solo; esta es la mitigación elegida por el cliente.)
 */
export function BannerPrincipal({ banners }: Props) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [ciclo, setCiclo] = useState(0);
  const inicioToque = useRef<number | null>(null);
  const total = banners.length;

  useEffect(() => {
    if (pausado || total < 2) return;

    const id = window.setInterval(() => setIndice((i) => (i + 1) % total), INTERVALO_MS);
    return () => window.clearInterval(id);
  }, [pausado, total, ciclo]);

  const banner = banners[indice];
  if (!banner) return null;

  const irA = (nuevo: number) => {
    setIndice((nuevo + total) % total);
    setCiclo((c) => c + 1);
  };

  const reanudar = () => {
    setPausado(false);
    setCiclo((c) => c + 1);
  };

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Promociones destacadas"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={reanudar}
      onFocus={() => setPausado(true)}
      onBlur={reanudar}
      onTouchStart={(e) => {
        inicioToque.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const inicio = inicioToque.current;
        const fin = e.changedTouches[0]?.clientX;
        inicioToque.current = null;
        if (inicio === null || fin === undefined) return;
        const delta = fin - inicio;
        if (Math.abs(delta) > UMBRAL_DESLIZAR_PX) irA(indice + (delta < 0 ? 1 : -1));
      }}
      className="relative min-h-[210px] touch-pan-y overflow-hidden rounded-[10px] bg-verde-suave md:min-h-[380px]"
    >
      <LazyMotion features={domAnimation} strict>
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={banner.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28 }}
            aria-live={pausado ? "polite" : "off"}
            className="relative flex min-h-[inherit] flex-col justify-center px-5 pb-[46px] pt-6 md:grid md:grid-cols-[minmax(0,1fr)_42%] md:items-center md:gap-6 md:px-11 md:pb-[72px] md:pt-10"
          >
            {/*
              Columna de texto: nunca invade la imagen (min-w-0 + palabras que se parten si hace falta).
            */}
            <div className="relative flex min-w-0 flex-col gap-2 md:gap-3.5">
              {banner.etiqueta && (
                <span className="relative text-xs font-bold uppercase tracking-[0.12em] text-verde-oscuro">
                  {banner.etiqueta}
                </span>
              )}
              <h2 className="relative max-w-[170px] break-words font-titulos text-[28px] font-extrabold leading-[1.02] md:max-w-none md:text-[34px] lg:text-[44px]">
                {banner.titulo}
              </h2>
              <p className="relative hidden max-w-[340px] text-[15px] leading-normal text-gris-medio md:block">
                {banner.texto}
              </p>
              {banner.boton && (
                <Link
                  href={banner.boton.href}
                  className={claseBoton("primario", "lg", "relative mt-1 self-start md:mt-0")}
                >
                  {banner.boton.texto}
                </Link>
              )}
            </div>

            {/*
              Imagen: siempre un cuadro (la medida que pide el administrador es cuadrada, 700×700).
              Las fotos con fondo se recortan con esquinas redondeadas; los recortes con fondo
              transparente se ven igual sobre el verde suave.
            */}
            <div
              aria-hidden={banner.imagen ? undefined : true}
              className={cn(
                "absolute right-3.5 top-[18px] size-[110px] overflow-hidden rounded-lg md:relative md:right-auto md:top-auto md:aspect-square md:size-auto md:w-full md:max-w-[300px] md:justify-self-end md:rounded-[10px]",
                !banner.imagen &&
                  "flex items-center justify-center border-2 border-dashed border-verde p-1.5 text-center text-[11px] text-verde-oscuro md:p-3 md:text-[13px]",
              )}
            >
              {banner.imagen ? (
                <Image
                  src={banner.imagen}
                  alt={banner.alt}
                  fill
                  priority={indice === 0}
                  sizes="(min-width: 768px) 300px, 110px"
                  className="object-cover"
                />
              ) : (
                "[imagen del banner principal]"
              )}
            </div>
          </m.div>
        </AnimatePresence>
      </LazyMotion>

      <div className="absolute bottom-0 left-2 flex items-center md:bottom-[10px] md:left-[34px]">
        {banners.map((b, i) => {
          const activo = i === indice;
          return (
            <button
              key={b.id}
              type="button"
              aria-label={`Ir al banner ${i + 1}`}
              aria-current={activo}
              onClick={() => irA(i)}
              className="flex h-11 min-w-11 items-center justify-center"
            >
              <span
                className={cn(
                  "relative block h-[7px] overflow-hidden rounded-full transition-[width,background-color] duration-300 ease-[var(--ease-salida)] md:h-2",
                  activo ? "w-6 bg-verde-claro md:w-7" : "w-[7px] bg-verde-claro md:w-2",
                )}
              >
                {activo && (
                  <span
                    key={`${indice}-${ciclo}`}
                    className="progreso-banner absolute inset-0 bg-verde"
                    style={
                      {
                        "--duracion-banner": `${INTERVALO_MS}ms`,
                        animationPlayState: pausado ? "paused" : "running",
                      } as CSSProperties
                    }
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-[18px] right-5 hidden gap-2 md:flex">
        <button
          type="button"
          aria-label="Banner anterior"
          onClick={() => irA(indice - 1)}
          className={cn(
            "flex size-10 items-center justify-center rounded-lg border border-verde-claro bg-white text-verde-oscuro hover:border-verde",
            interaccionVivaBase,
          )}
        >
          <ChevronLeft size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Banner siguiente"
          onClick={() => irA(indice + 1)}
          className={cn(
            "flex size-10 items-center justify-center rounded-lg border border-verde-claro bg-white text-verde-oscuro hover:border-verde",
            interaccionVivaBase,
          )}
        >
          <ChevronRight size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
