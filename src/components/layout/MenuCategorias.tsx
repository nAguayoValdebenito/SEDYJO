"use client";

import { ChevronDown, Menu } from "lucide-react";
import { interaccionVivaBase } from "@/components/ui/boton";
import { MenuDesplegable } from "@/components/ui/MenuDesplegable";
import { cn } from "@/lib/utils/cn";

type Props = {
  categorias: Array<{ slug: string; nombre: string }>;
  className?: string;
};

/** Botón "Categorías" (ícono solo hasta tablet) con la lista de categorías desplegable. */
export function MenuCategorias({ categorias, className }: Props) {
  return (
    <MenuDesplegable
      id="menu-categorias"
      etiqueta="Categorías"
      etiquetaBoton="Menú de categorías"
      className={className}
      items={categorias.map((c) => ({
        tipo: "enlace" as const,
        href: `/categoria/${c.slug}`,
        texto: c.nombre,
      }))}
      pie={{
        tipo: "enlace",
        href: "/categoria",
        texto: "Ver todas las categorías",
        destacado: true,
      }}
      claseBoton={cn(
        "flex h-11 w-11 items-center justify-center gap-2.5 rounded-lg bg-verde-oscuro text-white lg:h-12 lg:w-auto lg:px-[18px] lg:text-sm lg:font-bold lg:hover:bg-verde",
        interaccionVivaBase,
      )}
    >
      {({ abierto }) => (
        <>
          <Menu size={22} strokeWidth={2} aria-hidden="true" />
          <span className="hidden lg:inline">Categorías</span>
          <ChevronDown
            size={14}
            strokeWidth={2.4}
            aria-hidden="true"
            className={cn(
              "hidden transition-transform duration-300 ease-[var(--ease-salida)] lg:block",
              abierto && "rotate-180",
            )}
          />
        </>
      )}
    </MenuDesplegable>
  );
}
