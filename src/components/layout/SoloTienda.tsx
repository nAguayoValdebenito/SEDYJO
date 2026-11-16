"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";

function Interior({ children }: { children: ReactNode }) {
  const ruta = usePathname();
  if (ruta === "/proximamente") return null;
  return <>{children}</>;
}

/**
 * Oculta el "marco" de la tienda (menú, buscador, carrito, pie, burbujas) en la página
 * "Muy pronto", que va sola y a pantalla completa mientras la tienda no abre.
 *
 * La ruta no se conoce al prerenderizar el layout: el marco sale en el HTML (así la tienda
 * abierta conserva su menú sin parpadeos) y, en "Muy pronto", se oculta con CSS desde el primer
 * pintado (`data-modo-proximamente`, ver globals.css) hasta que el cliente lo desmonta.
 */
export function SoloTienda({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div data-marco-tienda className="contents">{children}</div>}>
      <Interior>{children}</Interior>
    </Suspense>
  );
}
