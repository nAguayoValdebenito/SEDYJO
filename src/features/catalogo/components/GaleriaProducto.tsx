"use client";

import { useState } from "react";
import { FotoOMarcador } from "@/components/ui/FotoOMarcador";
import { cn } from "@/lib/utils/cn";

type Props = {
  nombre: string;
  imagenes: string[];
  fondo: string;
};

/**
 * Foto grande del producto con miniaturas cuando hay más de una. Sin fotos muestra el marcador
 * punteado sobre el color del producto (la altura se reserva para no mover la página).
 */
export function GaleriaProducto({ nombre, imagenes, fondo }: Props) {
  const [activa, setActiva] = useState(0);
  const total = imagenes.length;

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-square w-full overflow-hidden rounded-xl border border-borde"
        style={{ backgroundColor: fondo }}
      >
        <FotoOMarcador
          key={activa}
          src={imagenes[activa] ?? null}
          alt={nombre}
          sizes="(min-width: 1024px) 520px, 100vw"
          prioridad
        />
      </div>

      {total > 1 && (
        <ul aria-label="Fotos del producto" className="flex gap-2 overflow-x-auto pb-1">
          {imagenes.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                aria-label={`Ver foto ${i + 1} de ${total}`}
                aria-current={i === activa ? "true" : undefined}
                onClick={() => setActiva(i)}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-lg border-2 transition-[border-color,scale] duration-200 ease-[var(--ease-salida)] hover:scale-[1.05]",
                  i === activa ? "border-verde" : "border-borde",
                )}
                style={{ backgroundColor: fondo }}
              >
                <FotoOMarcador src={src} alt="" marcador="" sizes="64px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
