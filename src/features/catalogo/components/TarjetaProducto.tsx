import Link from "next/link";
import type { CSSProperties } from "react";
import { FotoOMarcador } from "@/components/ui/FotoOMarcador";
import { Insignia } from "@/components/ui/Insignia";
import { AgregarAlCarrito } from "@/features/carrito/components/AgregarAlCarrito";
import { cn } from "@/lib/utils/cn";
import { formatoPrecio, porcentajeDescuento } from "@/lib/utils/format";
import type { Producto } from "@/types";

type Props = {
  producto: Producto;
  className?: string;
  style?: CSSProperties;
  /** Nivel del título del producto: 2 cuando la lista cuelga directo del título de la página. */
  nivelTitulo?: 2 | 3;
};

/**
 * Tarjeta de producto clara: foto, nombre, precio, precio por unidad y selector de cantidad.
 * Al pasar el cursor solo cambia el borde y la sombra; el que crece (~2 %) es el botón "Agregar".
 */
export function TarjetaProducto({ producto, className, style, nivelTitulo = 3 }: Props) {
  const Titulo = nivelTitulo === 2 ? "h2" : "h3";
  const descuento = porcentajeDescuento(producto.precio, producto.precioAnterior);
  const imagen = producto.imagenes[0] ?? null;
  const agotado = producto.stock === 0;

  return (
    <article
      style={style}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[10px] border border-borde bg-white",
        "transition-[box-shadow,border-color] duration-300 ease-[var(--ease-salida)]",
        "hover:border-verde hover:shadow-[0_14px_26px_-18px_rgb(31_41_51/0.45)]",
        className,
      )}
    >
      <div
        className="relative h-[120px] overflow-hidden md:h-[170px]"
        style={{ backgroundColor: producto.fondo }}
      >
        <div className={cn("absolute inset-0", agotado && "opacity-60 grayscale")}>
          <FotoOMarcador
            src={imagen}
            alt={producto.nombre}
            sizes="(min-width: 768px) 210px, 50vw"
          />
        </div>
        <Link
          href={`/producto/${producto.slug}`}
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0"
        />
        {agotado ? (
          <Insignia variante="oscura" className="absolute left-2 top-2 md:left-2.5 md:top-2.5">
            Agotado
          </Insignia>
        ) : (
          descuento && (
            <Insignia
              variante="descuento"
              className="etiqueta-precio absolute left-0 top-2 rounded-l-none md:top-2.5 md:text-[13px]"
            >
              -{descuento}%
            </Insignia>
          )
        )}
        <Insignia
          variante="oscura"
          className="absolute right-2 top-2 hidden font-medium md:right-2.5 md:top-2.5 md:inline-block"
        >
          {producto.etiqueta}
        </Insignia>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 px-2.5 pb-3 pt-2.5 md:gap-[3px] md:px-3.5 md:pb-3.5 md:pt-3">
        <Titulo className="min-h-[34px] text-[13px] font-normal leading-[1.3] md:min-h-[22px] md:text-[15px]">
          <Link href={`/producto/${producto.slug}`} className="hover:text-verde-oscuro">
            {producto.nombre}
          </Link>
        </Titulo>
        {producto.precioPorUnidad && (
          <span className="text-xs text-gris-texto">{producto.precioPorUnidad}</span>
        )}
        <div className="mb-1.5 mt-1 flex items-baseline gap-1.5 md:mb-2 md:mt-1.5 md:gap-2">
          <span className="font-titulos text-xl font-extrabold leading-none md:text-[26px]">
            {formatoPrecio(producto.precio)}
          </span>
          {producto.precioAnterior && (
            <span className="text-xs text-gris-texto line-through md:text-[13px]">
              {formatoPrecio(producto.precioAnterior)}
            </span>
          )}
        </div>
        <div className="mt-auto">
          <AgregarAlCarrito
            agotado={agotado}
            producto={{
              productoId: producto.id,
              slug: producto.slug,
              nombre: producto.nombre,
              precio: producto.precio,
              imagen,
              fondo: producto.fondo,
            }}
          />
        </div>
      </div>
    </article>
  );
}
