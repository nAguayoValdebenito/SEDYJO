"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatoPrecio } from "@/lib/utils/format";
import { usePanelCarrito } from "../panelStore";
import { seleccionarCantidadTotal, seleccionarSubtotal, useCarrito } from "../store";
import { useHidratado } from "../useHidratado";

/**
 * Carrito del header: total y burbuja con la cantidad, sin recargar la página.
 * Con JavaScript abre el carrito lateral; sin JavaScript (o con Ctrl/Cmd+clic, o estando ya en
 * /carrito o /checkout) es un enlace normal a /carrito.
 */
export function BotonCarrito() {
  const hidratado = useHidratado();
  const cantidad = useCarrito(seleccionarCantidadTotal);
  const subtotal = useCarrito(seleccionarSubtotal);
  const abrirPanel = usePanelCarrito((s) => s.abrir);
  const pathname = usePathname();

  const unidades = hidratado ? cantidad : 0;
  const burbuja = useRef<HTMLSpanElement>(null);
  const anterior = useRef(unidades);

  // La burbuja rebota al sumar unidades (siempre, aunque el sistema pida reducir el movimiento).
  useEffect(() => {
    const sumo = unidades > anterior.current;
    anterior.current = unidades;
    if (!sumo) return;
    burbuja.current?.animate([{ scale: "1" }, { scale: "1.3" }, { scale: "1" }], {
      duration: 320,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    });
  }, [unidades]);
  const total = hidratado ? subtotal : 0;
  const enPaginaDeCompra = pathname.startsWith("/carrito") || pathname.startsWith("/checkout");

  return (
    <Link
      href="/carrito"
      data-carrito-destino
      aria-haspopup={enPaginaDeCompra ? undefined : "dialog"}
      onClick={(e) => {
        const conModificador = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
        if (enPaginaDeCompra || conModificador) return;
        e.preventDefault();
        abrirPanel();
      }}
      aria-label={`Carrito, ${unidades} ${unidades === 1 ? "producto" : "productos"}, ${formatoPrecio(total)}`}
      className="relative flex h-11 w-11 items-center justify-center rounded-lg border-2 border-verde text-verde-oscuro transition-[scale,background-color] duration-200 ease-[var(--ease-salida)] hover:bg-verde-suave hover:scale-[1.05] active:scale-[0.96] lg:h-12 lg:w-auto lg:gap-2.5 lg:px-[18px] lg:text-sm lg:font-bold"
    >
      <ShoppingCart size={22} strokeWidth={2} aria-hidden="true" />
      <span className={cn("hidden tabular-nums lg:inline", !hidratado && "invisible")}>
        {formatoPrecio(total)}
      </span>
      {unidades > 0 && (
        <span
          ref={burbuja}
          aria-hidden="true"
          data-carrito-badge
          data-cantidad={unidades}
          className="after:content-[attr(data-cantidad)] absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rojo px-1 text-[11px] font-bold text-white lg:-right-2.5 lg:-top-2.5 lg:h-[22px] lg:min-w-[22px] lg:text-xs"
        />
      )}
    </Link>
  );
}
