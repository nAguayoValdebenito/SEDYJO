"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";

export type ItemMenu =
  | { tipo: "enlace"; href: string; texto: string; destacado?: boolean }
  | { tipo: "boton"; texto: string; onClick: () => void }
  | { tipo: "texto"; texto: string };

type Props = {
  /** `id` de la lista (lo usa `aria-controls`). */
  id: string;
  /** Nombre accesible de la lista. */
  etiqueta: string;
  /** Nombre accesible del botón que la abre. */
  etiquetaBoton: string;
  items: ItemMenu[];
  /** Opción separada al final (por ejemplo "Ver todas" o "Cerrar sesión"). */
  pie?: ItemMenu;
  alinear?: "izquierda" | "derecha";
  /** Además de clic y teclado, se abre al pasar el cursor (solo mouse en dispositivos con hover). */
  abrirConHover?: boolean;
  /** Clases del contenedor (posición dentro del header, orden, etc.). */
  className?: string;
  claseBoton: string;
  claseLista?: string;
  /** Contenido del botón; recibe si el menú está abierto (para girar un chevron). */
  children: (estado: { abierto: boolean }) => ReactNode;
};

const ESPERA_CIERRE_HOVER_MS = 140;

function ElementoItem({ item, alElegir }: { item: ItemMenu; alElegir: () => void }) {
  if (item.tipo === "texto") {
    return (
      <span className="block px-4 pb-1 pt-2.5 text-xs font-bold text-gris-texto">{item.texto}</span>
    );
  }
  if (item.tipo === "boton") {
    return (
      <button
        type="button"
        onClick={() => {
          item.onClick();
          alElegir();
        }}
        className="group block w-full px-4 py-2.5 text-left text-sm transition-[background-color] duration-200 hover:bg-verde-suave"
      >
        <span className="block transition-[translate] duration-200 ease-[var(--ease-salida)] group-hover:translate-x-1">
          {item.texto}
        </span>
      </button>
    );
  }
  return (
    <Link
      href={item.href}
      onClick={alElegir}
      className={cn(
        "group block px-4 py-2.5 text-sm transition-[background-color] duration-200 hover:bg-verde-suave",
        item.destacado && "font-bold text-azul",
      )}
    >
      <span className="block transition-[translate] duration-200 ease-[var(--ease-salida)] group-hover:translate-x-1">
        {item.texto}
      </span>
    </Link>
  );
}

/**
 * Botón con lista desplegable: se abre hacia abajo con una cortina suave y las opciones entran
 * en cascada. Cerrada queda fuera del foco y del lector de pantalla.
 * Teclado: Enter/Espacio o flecha abajo abren; flechas, Inicio y Fin recorren las opciones;
 * Escape cierra y devuelve el foco al botón. Con `abrirConHover` también se abre al pasar el
 * cursor (y se cierra al salir, con un margen para no parpadear); un clic la deja fija.
 */
export function MenuDesplegable({
  id,
  etiqueta,
  etiquetaBoton,
  items,
  pie,
  alinear = "izquierda",
  abrirConHover = false,
  className,
  claseBoton,
  claseLista = "w-60",
  children,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const enfocarPrimero = useRef(false);
  const abiertoPorHover = useRef(false);
  const temporizador = useRef<number | undefined>(undefined);

  const opciones = () =>
    Array.from(lista.current?.querySelectorAll<HTMLElement>("a, button") ?? []);

  const cerrar = (devolverFoco: boolean) => {
    window.clearTimeout(temporizador.current);
    abiertoPorHover.current = false;
    setAbierto(false);
    if (devolverFoco) boton.current?.focus();
  };

  // Al abrir con flecha abajo, el foco pasa a la primera opción cuando deja de ser inerte.
  useEffect(() => {
    if (!abierto || !enfocarPrimero.current) return;
    enfocarPrimero.current = false;
    // La lista pasa de `visibility: hidden` a visible al empezar la transición.
    const id = window.setTimeout(() => opciones()[0]?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;

    const alHacerClic = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) cerrar(false);
    };
    const alPresionarTecla = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const foco = document.activeElement;
      cerrar(!!foco && !!contenedor.current?.contains(foco));
    };

    document.addEventListener("mousedown", alHacerClic);
    document.addEventListener("keydown", alPresionarTecla);
    return () => {
      document.removeEventListener("mousedown", alHacerClic);
      document.removeEventListener("keydown", alPresionarTecla);
    };
  }, [abierto]);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  const conHover = (e: PointerEvent) =>
    abrirConHover &&
    e.pointerType === "mouse" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const alEntrar = (e: PointerEvent<HTMLDivElement>) => {
    if (!conHover(e)) return;
    window.clearTimeout(temporizador.current);
    if (!abierto) {
      abiertoPorHover.current = true;
      setAbierto(true);
    }
  };

  const alSalir = (e: PointerEvent<HTMLDivElement>) => {
    if (!conHover(e) || !abiertoPorHover.current) return;
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => cerrar(false), ESPERA_CIERRE_HOVER_MS);
  };

  const alHacerClicEnBoton = () => {
    if (abiertoPorHover.current) {
      // Se abrió con el cursor: el clic la deja fija en vez de cerrarla.
      abiertoPorHover.current = false;
      window.clearTimeout(temporizador.current);
      return;
    }
    setAbierto((v) => !v);
  };

  const alPresionarEnBoton = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowDown") return;
    e.preventDefault();
    if (abierto) {
      opciones()[0]?.focus();
    } else {
      enfocarPrimero.current = true;
      setAbierto(true);
    }
  };

  const alPresionarEnLista = (e: KeyboardEvent<HTMLUListElement>) => {
    const elementos = opciones();
    const actual = elementos.indexOf(document.activeElement as HTMLElement);
    const mover = (indice: number) => {
      e.preventDefault();
      elementos[(indice + elementos.length) % elementos.length]?.focus();
    };
    if (e.key === "ArrowDown") mover(actual + 1);
    else if (e.key === "ArrowUp") mover(actual - 1);
    else if (e.key === "Home") mover(0);
    else if (e.key === "End") mover(elementos.length - 1);
  };

  const todos = pie ? [...items, pie] : items;

  return (
    <div
      ref={contenedor}
      onPointerEnter={alEntrar}
      onPointerLeave={alSalir}
      className={cn("relative", className)}
    >
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls={id}
        aria-label={etiquetaBoton}
        onClick={alHacerClicEnBoton}
        onKeyDown={alPresionarEnBoton}
        className={claseBoton}
      >
        {children({ abierto })}
      </button>

      <ul
        ref={lista}
        id={id}
        aria-label={etiqueta}
        inert={!abierto}
        data-abierto={abierto}
        onKeyDown={alPresionarEnLista}
        className={cn(
          "absolute top-[calc(100%+8px)] z-40 origin-top overflow-hidden rounded-lg border border-borde bg-white py-1 shadow-[0_14px_28px_-14px_rgb(31_41_51/0.35)]",
          alinear === "derecha" ? "right-0" : "left-0",
          claseLista,
          "transition-[opacity,translate,clip-path,visibility] duration-300 ease-[var(--ease-salida)]",
          abierto
            ? "visible translate-y-0 opacity-100 [clip-path:inset(0_0_0_0_round_8px)]"
            : "invisible -translate-y-2 opacity-0 [clip-path:inset(0_0_100%_0_round_8px)]",
        )}
      >
        {todos.map((item, i) => {
          const esPie = pie !== undefined && i === todos.length - 1;
          return (
            <li
              key={`${item.tipo}-${item.texto}`}
              style={{ transitionDelay: abierto ? `${60 + i * 35}ms` : "0ms" }}
              className={cn(
                "transition-[opacity,translate] duration-300 ease-[var(--ease-salida)]",
                abierto ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
                esPie && "mt-1 border-t border-borde",
              )}
            >
              <ElementoItem item={item} alElegir={() => cerrar(false)} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
