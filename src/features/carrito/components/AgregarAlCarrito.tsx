"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Minus, Plus } from "lucide-react";
import { claseBoton, interaccionVivaSutil } from "@/components/ui/boton";
import { cn } from "@/lib/utils/cn";
import { volarAlCarrito } from "../efectos";
import { seleccionarCantidadDe, useCarrito, type ProductoParaCarrito } from "../store";
import { useHidratado } from "../useHidratado";

type Props = {
  producto: ProductoParaCarrito;
  /** `claro` para tarjetas blancas, `oscuro` para las tarjetas negras con dorado. */
  tema?: "claro" | "oscuro";
  agotado?: boolean;
  /** Versión baja (36 px) para las tarjetas pequeñas de ofertas y recomendaciones. */
  compacto?: boolean;
};

/**
 * Botón "Agregar" que se convierte en selector de cantidad.
 * Al agregar sube una burbuja hasta el carrito; el foco pasa al "+" (y vuelve a
 * "Agregar" si se quita la última unidad) y un aviso anuncia el cambio.
 */
export function AgregarAlCarrito({
  producto,
  tema = "claro",
  agotado = false,
  compacto = false,
}: Props) {
  const hidratado = useHidratado();
  const cantidad = useCarrito(seleccionarCantidadDe(producto.productoId));
  const agregar = useCarrito((s) => s.agregar);
  const cambiarCantidad = useCarrito((s) => s.cambiarCantidad);

  const [aviso, setAviso] = useState("");
  const botonAgregar = useRef<HTMLButtonElement>(null);
  const botonMas = useRef<HTMLButtonElement>(null);
  const enfocar = useRef<"mas" | "agregar" | null>(null);

  // Al cambiar de botón a selector (y al revés) el elemento enfocado desaparece:
  // se devuelve el foco al control equivalente.
  useEffect(() => {
    if (enfocar.current === "mas" && cantidad > 0) botonMas.current?.focus();
    if (enfocar.current === "agregar" && cantidad === 0) botonAgregar.current?.focus();
    enfocar.current = null;
  }, [cantidad]);

  const oscuro = tema === "oscuro";

  const alAgregar = (evento: MouseEvent<HTMLButtonElement>) => {
    agregar(producto);
    enfocar.current = "mas";
    setAviso(`${producto.nombre} agregado al carrito`);
    volarAlCarrito(evento.currentTarget, tema);
  };

  const alCambiar = (diferencia: 1 | -1, evento: MouseEvent<HTMLButtonElement>) => {
    const nueva = cantidad + diferencia;
    cambiarCantidad(producto.productoId, diferencia);
    setAviso(
      nueva > 0
        ? `${producto.nombre}: ${nueva} en el carrito`
        : `${producto.nombre} quitado del carrito`,
    );
    if (nueva === 0) enfocar.current = "agregar";
    if (diferencia > 0) volarAlCarrito(evento.currentTarget, tema);
  };

  const claseControl = cn(
    "flex items-center justify-center rounded-lg",
    compacto ? "size-9" : "size-11",
    interaccionVivaSutil,
    oscuro ? "bg-oro text-negro" : "bg-verde text-white",
  );

  return (
    // `relative` mantiene el aviso invisible dentro de la tarjeta (en una tira deslizable
    // un `sr-only` suelto escaparía del recorte y ensancharía la página).
    <div className="relative">
      <span role="status" className="sr-only">
        {aviso}
      </span>

      {!hidratado || cantidad === 0 ? (
        <button
          ref={botonAgregar}
          type="button"
          disabled={agotado}
          onClick={alAgregar}
          className={claseBoton(
            oscuro ? "dorado" : "primario",
            compacto ? "sm" : "md",
            compacto ? "w-full" : "h-11 w-full",
            true,
          )}
        >
          {agotado ? "Agotado" : "Agregar"}
        </button>
      ) : (
        <div
          role="group"
          aria-label={`Cantidad de ${producto.nombre}`}
          className={cn(
            "aparece flex items-center justify-between gap-2",
            compacto ? "h-9" : "h-11",
          )}
        >
          <button
            type="button"
            aria-label={`Quitar una unidad de ${producto.nombre}`}
            onClick={(e) => alCambiar(-1, e)}
            className={claseControl}
          >
            <Minus size={compacto ? 15 : 18} aria-hidden="true" />
          </button>
          <span
            className={cn(
              "text-center font-bold tabular-nums",
              compacto ? "min-w-6 text-sm" : "min-w-8 text-base",
              oscuro && "text-white",
            )}
          >
            {cantidad}
          </span>
          <button
            ref={botonMas}
            type="button"
            aria-label={`Agregar una unidad de ${producto.nombre}`}
            onClick={(e) => alCambiar(1, e)}
            className={claseControl}
          >
            <Plus size={compacto ? 15 : 18} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
