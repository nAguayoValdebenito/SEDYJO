"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { claseBoton, interaccionVivaBase } from "@/components/ui/boton";
import { FotoOMarcador } from "@/components/ui/FotoOMarcador";
import { Insignia } from "@/components/ui/Insignia";
import { cn } from "@/lib/utils/cn";
import type { SlideCampana } from "@/types";

type Props = {
  slides: SlideCampana[];
  /** Se llama al elegir el botón de una diapositiva (para cerrar el modal). */
  alElegirEnlace: () => void;
};

const UMBRAL_DESLIZAR_PX = 40;

function ContenidoSlide({
  slide,
  alElegirEnlace,
}: {
  slide: SlideCampana;
  alElegirEnlace: () => void;
}) {
  return (
    <>
      <div className="relative aspect-[16/10] overflow-hidden bg-carbon">
        <FotoOMarcador
          src={slide.imagen}
          alt={slide.titulo}
          marcador="[imagen de la oferta]"
          tema="oscuro"
          sizes="(min-width: 640px) 520px, 92vw"
        />
      </div>
      <div className="relative px-5 pb-2 pt-5 sm:px-7">
        <Insignia variante="morada">oferta especial</Insignia>
        <h2 className="mt-2.5 font-titulos text-[26px] font-extrabold leading-[1.05] text-oro sm:text-[32px]">
          {slide.titulo}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-[15px]">{slide.texto}</p>
        {slide.boton && (
          <Link
            href={slide.boton.href}
            onClick={alElegirEnlace}
            className={claseBoton("dorado", "lg", "mt-4")}
          >
            {slide.boton.texto}
          </Link>
        )}
      </div>
    </>
  );
}

/**
 * Galería de ofertas con carrusel: flechas, puntos de 44 px, deslizar con el dedo y flechas del
 * teclado. No avanza sola. Las diapositivas fuera de pantalla quedan inertes para el teclado y
 * los lectores de pantalla.
 */
export function GaleriaCampana({ slides, alElegirEnlace }: Props) {
  const [indice, setIndice] = useState(0);
  const inicioToque = useRef<number | null>(null);
  const total = slides.length;

  const ir = (nuevo: number) => setIndice(((nuevo % total) + total) % total);

  // Una sola diapositiva: modal simple, sin controles.
  if (total === 1 && slides[0]) {
    return <ContenidoSlide slide={slides[0]} alElegirEnlace={alElegirEnlace} />;
  }

  const alPresionarTecla = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      ir(indice - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      ir(indice + 1);
    }
  };

  const claseFlecha = cn(
    "flex size-11 items-center justify-center rounded-full border border-oro/40 text-white hover:border-oro hover:text-oro",
    interaccionVivaBase,
  );

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Ofertas especiales"
      onKeyDown={alPresionarTecla}
      onTouchStart={(e) => {
        inicioToque.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const inicio = inicioToque.current;
        const fin = e.changedTouches[0]?.clientX;
        inicioToque.current = null;
        if (inicio === null || fin === undefined) return;
        const delta = fin - inicio;
        if (Math.abs(delta) > UMBRAL_DESLIZAR_PX) ir(indice + (delta < 0 ? 1 : -1));
      }}
    >
      <div className="touch-pan-y overflow-hidden" aria-live="polite">
        <div
          className="flex transition-[translate] duration-[420ms] ease-[var(--ease-salida)]"
          style={{ translate: `${-indice * 100}% 0` }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${total}`}
              inert={i !== indice}
              className="w-full shrink-0"
            >
              <ContenidoSlide slide={slide} alElegirEnlace={alElegirEnlace} />
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-between gap-2 px-3 pb-1 pt-3 sm:px-5">
        <button
          type="button"
          aria-label="Oferta anterior"
          onClick={() => ir(indice - 1)}
          className={claseFlecha}
        >
          <ChevronLeft size={20} strokeWidth={2.4} aria-hidden="true" />
        </button>

        <div className="flex items-center">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Ir a la oferta ${i + 1}`}
              aria-current={i === indice}
              onClick={() => ir(i)}
              className="flex h-11 min-w-11 items-center justify-center"
            >
              <span
                className={cn(
                  "block h-2 rounded-full transition-[width,background-color] duration-300 ease-[var(--ease-salida)]",
                  i === indice ? "w-6 bg-oro" : "w-2 bg-white/35",
                )}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-label="Oferta siguiente"
          onClick={() => ir(indice + 1)}
          className={claseFlecha}
        >
          <ChevronRight size={20} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
