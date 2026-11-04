"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { claseBoton, interaccionVivaBase } from "@/components/ui/boton";
import { BurbujasDecorativas } from "@/components/ui/BurbujasDecorativas";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { FotoOMarcador } from "@/components/ui/FotoOMarcador";
import { cn } from "@/lib/utils/cn";
import { formatoPrecio } from "@/lib/utils/format";
import type { ItemCarrito } from "@/types";
import { seleccionarSubtotal, useCarrito } from "../store";
import { useHidratado } from "../useHidratado";
import { BarraDespachoGratis } from "./BarraDespachoGratis";

const controlCantidad = cn(
  "flex size-11 items-center justify-center rounded-lg border border-borde hover:border-verde hover:bg-verde-suave",
  interaccionVivaBase,
);

/** Detalle del carrito. El total final lo recalcula y valida el servidor al pagar. */
export function ResumenCarrito() {
  const hidratado = useHidratado();
  const items = useCarrito((s) => s.items);
  const subtotal = useCarrito(seleccionarSubtotal);
  const cambiarCantidad = useCarrito((s) => s.cambiarCantidad);
  const quitar = useCarrito((s) => s.quitar);
  const vaciar = useCarrito((s) => s.vaciar);

  const [aviso, setAviso] = useState("");
  const lista = useRef<HTMLUListElement>(null);
  const mensajeVacio = useRef<HTMLParagraphElement>(null);
  const reubicarFoco = useRef(false);

  // Al quitar un producto el botón enfocado desaparece: el foco pasa a la lista
  // (o al mensaje de carrito vacío) para no caer al inicio de la página.
  useEffect(() => {
    if (!reubicarFoco.current) return;
    reubicarFoco.current = false;
    (items.length === 0 ? mensajeVacio.current : lista.current)?.focus();
  }, [items.length]);

  const alCambiar = (item: ItemCarrito, diferencia: 1 | -1) => {
    const nueva = item.cantidad + diferencia;
    cambiarCantidad(item.productoId, diferencia);
    if (nueva === 0) reubicarFoco.current = true;
    setAviso(
      nueva > 0 ? `${item.nombre}: ${nueva} en el carrito` : `${item.nombre} quitado del carrito`,
    );
  };

  const alQuitar = (item: ItemCarrito) => {
    quitar(item.productoId);
    reubicarFoco.current = true;
    setAviso(`${item.nombre} quitado del carrito`);
  };

  const alVaciar = () => {
    vaciar();
    reubicarFoco.current = true;
    setAviso("Carrito vacío");
  };

  if (!hidratado) {
    return (
      <div aria-busy="true" className="flex flex-col gap-2.5">
        <span role="status" className="sr-only">
          Cargando tu carrito
        </span>
        {[0, 1, 2].map((i) => (
          <Esqueleto key={i} className="h-[88px] rounded-[10px] md:h-[96px]" />
        ))}
      </div>
    );
  }

  const estado = (
    <span role="status" className="sr-only">
      {aviso}
    </span>
  );

  if (items.length === 0) {
    return (
      <>
        {estado}
        <div className="relative isolate flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-borde bg-white p-6 sm:p-8">
          <BurbujasDecorativas tono="claro" className="-z-10 opacity-70" />
          <p ref={mensajeVacio} tabIndex={-1} className="text-gris-medio outline-none">
            Tu carrito está vacío.
          </p>
          <Link href="/" className={claseBoton("primario", "lg")}>
            Seguir comprando
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {estado}
      <ul
        ref={lista}
        tabIndex={-1}
        aria-label="Productos en tu carrito"
        className="divide-y divide-borde rounded-[10px] border border-borde bg-white outline-none"
      >
        {items.map((item) => (
          <li
            key={item.productoId}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3 md:flex-nowrap md:gap-4 md:p-4"
          >
            <div
              className="relative size-16 shrink-0 overflow-hidden rounded-lg md:size-[72px]"
              style={{ backgroundColor: item.fondo }}
            >
              <FotoOMarcador src={item.imagen} alt={item.nombre} marcador="" sizes="72px" />
            </div>
            <div className="min-w-0 flex-1 basis-[calc(100%-5rem)] md:basis-0">
              <Link
                href={`/producto/${item.slug}`}
                className="line-clamp-2 text-sm font-medium leading-snug hover:text-verde-oscuro md:text-base"
              >
                {item.nombre}
              </Link>
              <div className="mt-0.5 text-xs text-gris-texto md:text-sm">
                {formatoPrecio(item.precio)} c/u
              </div>
            </div>
            {/* Celular: segunda fila con cantidad, total de la línea y eliminar. */}
            <div className="flex w-full items-center justify-between gap-2 md:contents">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label={`Quitar una unidad de ${item.nombre}`}
                  onClick={() => alCambiar(item, -1)}
                  className={controlCantidad}
                >
                  <Minus size={16} aria-hidden="true" />
                </button>
                <span className="min-w-6 text-center font-bold tabular-nums">{item.cantidad}</span>
                <button
                  type="button"
                  aria-label={`Agregar una unidad de ${item.nombre}`}
                  onClick={() => alCambiar(item, 1)}
                  className={controlCantidad}
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </div>
              <span className="ml-auto font-titulos text-lg font-extrabold tabular-nums md:ml-0 md:w-24 md:text-right">
                {formatoPrecio(item.precio * item.cantidad)}
              </span>
              <button
                type="button"
                aria-label={`Eliminar ${item.nombre} del carrito`}
                onClick={() => alQuitar(item)}
                className="flex size-11 items-center justify-center rounded-lg text-gris-texto transition-colors duration-200 hover:bg-gris-fondo hover:text-rojo"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <BarraDespachoGratis subtotal={subtotal} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-verde-suave p-4">
        <button
          type="button"
          onClick={alVaciar}
          className="inline-flex min-h-11 items-center text-sm font-bold text-azul"
        >
          <span className="enlace-sutil">Vaciar carrito</span>
        </button>
        <div className="hidden flex-wrap items-center gap-4 md:flex">
          <span className="text-sm text-gris-medio">Subtotal</span>
          <span
            key={subtotal}
            className="cifra-cambia font-titulos text-2xl font-extrabold tabular-nums"
          >
            {formatoPrecio(subtotal)}
          </span>
          <Link href="/checkout" className={claseBoton("primario", "lg")}>
            Ir a pagar
          </Link>
        </div>
      </div>

      {/* Celular: el botón de pago queda fijo abajo, al alcance del pulgar. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-borde bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden">
        <div className="leading-tight">
          <div className="text-xs text-gris-texto">Subtotal</div>
          <div className="font-titulos text-xl font-extrabold tabular-nums">
            {formatoPrecio(subtotal)}
          </div>
        </div>
        <Link href="/checkout" className={claseBoton("primario", "lg", "flex-1")}>
          Ir a pagar
        </Link>
      </div>
    </div>
  );
}
