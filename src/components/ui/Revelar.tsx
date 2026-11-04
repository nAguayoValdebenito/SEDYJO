"use client";

import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";

const LIMPIEZA_MS = 1000;

/**
 * Prepara el revelado al hacer scroll. Solo actúa si el bloque está bajo el primer
 * pantallazo: lo que ya se ve al cargar nunca parpadea ni se oculta, y sin JavaScript
 * todo permanece visible. Terminada la animación se retiran los atributos para no
 * interferir con los estilos de hover.
 */
function useRevelado(ref: RefObject<HTMLElement | null>, porHijo: boolean) {
  useLayoutEffect(() => {
    const raiz = ref.current;
    if (!raiz || !("IntersectionObserver" in window)) return;

    const bajoElPliegue = raiz.getBoundingClientRect().top > window.innerHeight * 0.92;
    if (!bajoElPliegue) return;

    const objetivos = porHijo ? (Array.from(raiz.children) as HTMLElement[]) : [raiz];
    let limpieza: ReturnType<typeof setTimeout> | undefined;

    const retirar = () => {
      objetivos.forEach((el) => {
        delete el.dataset.revelar;
        el.style.removeProperty("--i");
      });
    };

    objetivos.forEach((el, i) => {
      el.style.setProperty("--i", String(i));
      el.dataset.revelar = "oculto";
    });

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada?.isIntersecting) return;
        observador.disconnect();
        objetivos.forEach((el) => {
          el.dataset.revelar = "visible";
        });
        limpieza = setTimeout(retirar, LIMPIEZA_MS);
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.08 },
    );
    observador.observe(raiz);

    return () => {
      observador.disconnect();
      clearTimeout(limpieza);
      retirar();
    };
  }, [ref, porHijo]);
}

type Props = {
  children: ReactNode;
  className?: string;
};

/** Revela el bloque completo al entrar en pantalla. */
export function Revelar({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useRevelado(ref, false);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Revela a los hijos directos en cascada de 50 ms (tope de 8 escalones). */
export function RevelarGrupo({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useRevelado(ref, true);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
