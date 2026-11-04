import type { Metadata } from "next";
import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import { PaginaEstado } from "@/components/ui/PaginaEstado";
import { claseBoton } from "@/components/ui/boton";

export const metadata: Metadata = { title: "Página no encontrada" };

/** 404 de la tienda: explica qué pasó y ofrece buscar o seguir comprando. */
export default function NoEncontrada() {
  return (
    <PaginaEstado
      Icono={SearchX}
      codigo="404"
      titulo="No encontramos esa página"
      acciones={
        <>
          <form
            action="/buscar"
            role="search"
            aria-label="Buscar productos"
            className="flex w-full max-w-md gap-2"
          >
            <label htmlFor="buscar-404" className="sr-only">
              Buscar productos
            </label>
            <input
              id="buscar-404"
              name="q"
              type="search"
              placeholder="¿Qué estás buscando hoy?"
              className="h-12 min-w-0 flex-1 rounded-lg border-2 border-borde-control bg-white px-3.5 text-[15px] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-gris-texto focus:border-verde-oscuro focus:shadow-[0_0_0_4px_rgb(46_125_91/0.18)]"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className={claseBoton("primario", "lg", "px-4")}
            >
              <Search size={20} aria-hidden="true" />
            </button>
          </form>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className={claseBoton("primario", "lg")}>
              Ir al inicio
            </Link>
            <Link href="/ofertas" className={claseBoton("contorno", "lg")}>
              Ver ofertas
            </Link>
            <Link href="/categoria" className={claseBoton("contorno", "lg")}>
              Ver categorías
            </Link>
          </div>
        </>
      }
    >
      <p>
        Puede que el enlace esté mal escrito o que el producto ya no esté disponible. Busca lo que
        necesitas o vuelve a la tienda.
      </p>
    </PaginaEstado>
  );
}
