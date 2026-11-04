"use client";

import { useState } from "react";
import { Loader2, RotateCw } from "lucide-react";
import { claseBoton } from "@/components/ui/boton";
import { usePanelCarrito } from "@/features/carrito/panelStore";
import { useCarrito } from "@/features/carrito/store";
import type { ItemPedido } from "@/types";
import { prepararRecompra } from "../acciones";

type Props = {
  items: Pick<ItemPedido, "productoId" | "cantidad">[];
  etiqueta?: string;
  variante?: "primario" | "contorno";
  tamano?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * "Volver a comprar": agrega al carrito los productos de un pedido (o uno solo) con los precios
 * de hoy, abre el carrito lateral y avisa si algún producto ya no está disponible.
 */
export function BotonVolverAComprar({
  items,
  etiqueta = "Volver a comprar",
  variante = "contorno",
  tamano = "md",
  className,
}: Props) {
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [problema, setProblema] = useState(false);
  const agregarCantidad = useCarrito((s) => s.agregarCantidad);
  const abrirPanel = usePanelCarrito((s) => s.abrir);

  const alHacerClic = async () => {
    setCargando(true);
    setAviso("");
    setProblema(false);
    try {
      const { disponibles, noDisponibles } = await prepararRecompra(items.map((i) => i.productoId));

      let unidades = 0;
      for (const producto of disponibles) {
        const cantidad = items.find((i) => i.productoId === producto.productoId)?.cantidad ?? 1;
        agregarCantidad(producto, cantidad);
        unidades += cantidad;
      }

      if (noDisponibles.length > 0) {
        setProblema(true);
        setAviso(
          unidades > 0
            ? `Agregamos ${unidades} ${unidades === 1 ? "unidad" : "unidades"}. ${noDisponibles.length === 1 ? "1 producto no está disponible" : `${noDisponibles.length} productos no están disponibles`} hoy.`
            : "Esos productos no están disponibles hoy.",
        );
      } else {
        setAviso(`Agregamos ${unidades} ${unidades === 1 ? "unidad" : "unidades"} a tu carrito.`);
      }
      if (disponibles.length > 0) abrirPanel();
    } catch {
      setProblema(true);
      setAviso("No pudimos agregar los productos. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        disabled={cargando}
        aria-busy={cargando}
        onClick={alHacerClic}
        className={claseBoton(variante, tamano, "w-full")}
      >
        {cargando ? (
          <>
            <Loader2 size={16} aria-hidden="true" className="animate-spin" />
            Agregando…
          </>
        ) : (
          <>
            <RotateCw size={16} aria-hidden="true" />
            {etiqueta}
          </>
        )}
      </button>
      <span
        role="status"
        className={problema ? "mt-1.5 block text-xs font-medium text-error" : "sr-only"}
      >
        {aviso}
      </span>
    </div>
  );
}
