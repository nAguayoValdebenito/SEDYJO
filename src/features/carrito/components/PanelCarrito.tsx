"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { claseBoton, interaccionVivaSutil } from "@/components/ui/boton";
import { FotoOMarcador } from "@/components/ui/FotoOMarcador";
import { cn } from "@/lib/utils/cn";
import { formatoPrecio } from "@/lib/utils/format";
import type { ItemCarrito } from "@/types";
import { usePanelCarrito } from "../panelStore";
import { seleccionarCantidadTotal, seleccionarSubtotal, useCarrito } from "../store";
import { useHidratado } from "../useHidratado";
import { BarraDespachoGratis } from "./BarraDespachoGratis";

/** Debe coincidir con la duración de la transición del panel. */
const DURACION_MS = 220;

const controlCantidad = cn(
  "flex size-11 items-center justify-center rounded-lg border border-borde hover:border-verde hover:bg-verde-suave",
  interaccionVivaSutil,
);

/**
 * Carrito lateral: se desliza desde la derecha al hacer clic en el carrito del header y muestra
 * lo que lleva el cliente, con cantidad editable, subtotal y los botones "Ver carrito" e
 * "Ir a pagar". Usa `<dialog>` modal: el fondo queda inerte, el foco queda atrapado y vuelve al
 * botón del carrito al cerrar; Escape y clic fuera cierran. `/carrito` sigue siendo la vista
 * completa.
 */
export function PanelCarrito() {
  const abierto = usePanelCarrito((s) => s.abierto);
  const cerrar = usePanelCarrito((s) => s.cerrar);
  const pathname = usePathname();

  const hidratado = useHidratado();
  const items = useCarrito((s) => s.items);
  const unidades = useCarrito(seleccionarCantidadTotal);
  const subtotal = useCarrito(seleccionarSubtotal);
  const cambiarCantidad = useCarrito((s) => s.cambiarCantidad);
  const quitar = useCarrito((s) => s.quitar);

  const dialogo = useRef<HTMLDialogElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const mensajeVacio = useRef<HTMLParagraphElement>(null);
  const reubicarFoco = useRef(false);
  const [aviso, setAviso] = useState("");
  const [saliendo, setSaliendo] = useState<string[]>([]);

  // Si el cliente navega (por ejemplo "Ver carrito"), el panel se cierra.
  useEffect(() => {
    cerrar();
  }, [pathname, cerrar]);

  // Abre y cierra el <dialog> con transición de entrada y de salida.
  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;

    if (abierto) {
      if (!d.open) d.showModal();
      // El panel llega hasta el borde aunque la página reserve el hueco de la barra de scroll.
      const hueco = window.innerWidth - document.documentElement.clientWidth;
      d.style.marginRight = hueco > 0 ? `-${hueco}px` : "";
      document.documentElement.style.overflow = "hidden";
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          d.dataset.visible = "true";
        }),
      );
      return () => cancelAnimationFrame(id);
    }

    d.dataset.visible = "false";
    document.documentElement.style.overflow = "";
    const id = window.setTimeout(() => {
      if (d.open) d.close();
    }, DURACION_MS);
    return () => window.clearTimeout(id);
  }, [abierto]);

  // Al quitar un producto el botón enfocado desaparece: el foco pasa a la lista o al mensaje.
  useEffect(() => {
    if (!reubicarFoco.current) return;
    reubicarFoco.current = false;
    (items.length === 0 ? mensajeVacio.current : lista.current)?.focus();
  }, [items.length]);

  // El producto se desliza hacia afuera antes de quitarse.
  const retirarConSalida = (productoId: string, quitarYa: () => void) => {
    reubicarFoco.current = true;
    setSaliendo((ids) => [...ids, productoId]);
    window.setTimeout(() => {
      quitarYa();
      setSaliendo((ids) => ids.filter((id) => id !== productoId));
    }, 200);
  };

  const alCambiar = (item: ItemCarrito, diferencia: 1 | -1) => {
    const nueva = item.cantidad + diferencia;
    if (nueva === 0) {
      retirarConSalida(item.productoId, () => cambiarCantidad(item.productoId, diferencia));
      setAviso(`${item.nombre} quitado del carrito`);
      return;
    }
    cambiarCantidad(item.productoId, diferencia);
    if (nueva === 0) reubicarFoco.current = true;
    setAviso(
      nueva > 0 ? `${item.nombre}: ${nueva} en el carrito` : `${item.nombre} quitado del carrito`,
    );
  };

  const alQuitar = (item: ItemCarrito) => {
    retirarConSalida(item.productoId, () => quitar(item.productoId));
    setAviso(`${item.nombre} quitado del carrito`);
  };

  const hayItems = hidratado && items.length > 0;

  return (
    <dialog
      ref={dialogo}
      aria-labelledby="titulo-panel-carrito"
      data-visible="false"
      onCancel={(e) => {
        e.preventDefault();
        cerrar();
      }}
      onClose={cerrar}
      onClick={(e) => {
        // Un clic sobre el fondo oscurecido llega al propio <dialog>.
        if (e.target === e.currentTarget) cerrar();
      }}
      className={cn(
        "m-0 ml-auto h-dvh max-h-none w-[calc(100%-2.5rem)] max-w-[420px] overflow-hidden bg-white p-0 text-tinta",
        "shadow-[-18px_0_40px_-20px_rgb(11_11_15/0.5)]",
        "translate-x-full transition-[translate] duration-[220ms] ease-[cubic-bezier(0.4,0,1,1)] data-[visible=true]:translate-x-0 data-[visible=true]:duration-[320ms] data-[visible=true]:ease-[var(--ease-salida)]",
        "backdrop:bg-negro/55 backdrop:opacity-0 backdrop:transition-opacity backdrop:duration-[200ms] backdrop:ease-out data-[visible=true]:backdrop:opacity-100 data-[visible=true]:backdrop:duration-[320ms]",
        "",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-borde px-4 py-3.5">
          <h2
            id="titulo-panel-carrito"
            className="flex items-center gap-2 font-titulos text-xl font-extrabold"
          >
            <ShoppingCart size={22} strokeWidth={2} aria-hidden="true" className="text-verde" />
            Tu carrito
            {hidratado && unidades > 0 && (
              <span className="rounded-full bg-verde-suave px-2 py-0.5 text-sm font-bold tabular-nums text-verde-oscuro">
                {unidades}
              </span>
            )}
          </h2>
          <button
            type="button"
            aria-label="Cerrar carrito"
            onClick={cerrar}
            className={cn(
              "flex size-11 items-center justify-center rounded-lg text-gris-medio hover:bg-gris-fondo",
              interaccionVivaSutil,
            )}
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <span role="status" className="sr-only">
          {aviso}
        </span>

        {hayItems ? (
          <>
            <ul
              ref={lista}
              tabIndex={-1}
              aria-label="Productos en tu carrito"
              className="flex-1 divide-y divide-borde overflow-y-auto overscroll-contain px-4 outline-none"
            >
              {items.map((item, indice) => (
                <li
                  key={item.productoId}
                  style={{ "--i": indice } as React.CSSProperties}
                  className={cn(
                    "item-escalona flex gap-3 py-3.5",
                    saliendo.includes(item.productoId) && "item-sale",
                  )}
                >
                  <div
                    className="relative size-16 shrink-0 overflow-hidden rounded-lg"
                    style={{ backgroundColor: item.fondo }}
                  >
                    <FotoOMarcador src={item.imagen} alt={item.nombre} marcador="" sizes="64px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/producto/${item.slug}`}
                        className="line-clamp-2 text-sm font-medium leading-snug hover:text-verde-oscuro"
                      >
                        {item.nombre}
                      </Link>
                      <button
                        type="button"
                        aria-label={`Eliminar ${item.nombre} del carrito`}
                        onClick={() => alQuitar(item)}
                        className="-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-gris-texto transition-colors duration-200 hover:bg-gris-fondo hover:text-rojo"
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-0.5 text-xs text-gris-texto">
                      {formatoPrecio(item.precio)} c/u
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label={`Quitar una unidad de ${item.nombre}`}
                          onClick={() => alCambiar(item, -1)}
                          className={controlCantidad}
                        >
                          <Minus size={15} aria-hidden="true" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-bold tabular-nums">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          aria-label={`Agregar una unidad de ${item.nombre}`}
                          onClick={() => alCambiar(item, 1)}
                          className={controlCantidad}
                        >
                          <Plus size={15} aria-hidden="true" />
                        </button>
                      </div>
                      <span className="font-titulos text-base font-extrabold tabular-nums">
                        {formatoPrecio(item.precio * item.cantidad)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 border-t border-borde bg-gris-fondo px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3.5">
              <BarraDespachoGratis subtotal={subtotal} />
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gris-medio">Subtotal</span>
                <span
                  key={subtotal}
                  className="cifra-cambia font-titulos text-2xl font-extrabold tabular-nums"
                >
                  {formatoPrecio(subtotal)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Link href="/carrito" className={claseBoton("contorno", "lg", "px-3")}>
                  Ver carrito
                </Link>
                <Link href="/checkout" className={claseBoton("primario", "lg", "px-3")}>
                  Ir a pagar
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-start justify-center gap-4 px-6 pb-16">
            <ShoppingCart
              size={44}
              strokeWidth={1.4}
              aria-hidden="true"
              className="text-verde-claro"
            />
            <p
              ref={mensajeVacio}
              tabIndex={-1}
              className="font-titulos text-xl font-extrabold outline-none"
            >
              Tu carrito está vacío
            </p>
            <p className="text-sm text-gris-medio">
              Agrega productos y aparecerán aquí para que los revises antes de pagar.
            </p>
            <button type="button" onClick={cerrar} className={claseBoton("primario", "lg")}>
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
