"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Header que en tablet y escritorio queda fijo arriba. Al empezar a bajar toma fondo blanco y una
 * sombra suave. Detecta el scroll con un IntersectionObserver (sin escuchar `scroll`) y no
 * cambia de alto, así que el contenido de abajo no se mueve. En celular no es fijo para
 * no quitar pantalla.
 */
export function EncabezadoPegajoso({ children }: { children: ReactNode }) {
  const centinela = useRef<HTMLDivElement>(null);
  const [pegado, setPegado] = useState(false);

  useEffect(() => {
    const el = centinela.current;
    if (!el) return;
    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada) setPegado(!entrada.isIntersecting);
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <>
      <div ref={centinela} aria-hidden="true" className="h-px" />
      <header
        data-pegado={pegado}
        className={cn(
          "relative z-30 transition-[background-color,box-shadow] duration-300 sm:sticky sm:top-0",
          pegado ? "bg-white sm:shadow-[0_10px_22px_-16px_rgb(31_41_51/0.45)]" : "bg-transparent",
        )}
      >
        {children}
      </header>
    </>
  );
}
