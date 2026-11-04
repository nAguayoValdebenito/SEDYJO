"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Fondo de garabatos de contorno con temática del negocio (carrito, canasto, camión, abarrotes,
 * confitería, bebidas, aseo, higiene, burbujas…) dibujados en dorado y morado sobre el fondo
 * negro de la sección donde se use (que debe ser `relative overflow-hidden`).
 *
 * Es una imagen de mosaico repetible (`public/patrones/doodles-comercio.svg`): un solo archivo
 * liviano. Va muy tenue para que textos, insignias y fotos sigan mandando, y deriva lentamente
 * solo con movimiento normal. Para cuidar equipos modestos, la deriva se pausa mientras la
 * sección no está en pantalla (o el modal está cerrado). `tam` fija el tamaño del mosaico en px
 * para tarjetas pequeñas; sin él se adapta al ancho de la pantalla.
 */
export function FondoDoodlesComercio({ tam }: { tam?: number }) {
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = raiz.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const observador = new IntersectionObserver(([entrada]) => {
      el.dataset.enPantalla = entrada?.isIntersecting ? "true" : "false";
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={raiz}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="doodles-capa"
        style={tam ? ({ "--doodles-tam": `${tam}px` } as CSSProperties) : undefined}
      />
    </div>
  );
}
