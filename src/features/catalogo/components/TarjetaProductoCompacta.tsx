import Link from "next/link";
import { FotoOMarcador } from "@/components/ui/FotoOMarcador";
import { Insignia } from "@/components/ui/Insignia";
import { AgregarAlCarrito } from "@/features/carrito/components/AgregarAlCarrito";
import { cn } from "@/lib/utils/cn";
import { formatoPrecio, porcentajeDescuento } from "@/lib/utils/format";
import type { Producto } from "@/types";

type Props = {
  producto: Producto;
};

/**
 * Tarjeta pequeña para ofertas y recomendaciones: foto baja, nombre en dos líneas, precio y un
 * botón de agregar de 36 px. Mide 128 px en celular, 140 px en tablet y 148 px en escritorio
 * (las tarjetas principales miden ~220 px), para no competir con el listado de la categoría.
 */
export function TarjetaProductoCompacta({ producto }: Props) {
  const descuento = porcentajeDescuento(producto.precio, producto.precioAnterior);
  const imagen = producto.imagenes[0] ?? null;

  return (
    <article
      className={cn(
        "flex w-[128px] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-borde bg-white sm:w-[140px] lg:w-[148px]",
        "transition-[box-shadow,border-color] duration-300 ease-[var(--ease-salida)]",
        "hover:border-verde hover:shadow-[0_12px_22px_-16px_rgb(31_41_51/0.45)]",
      )}
    >
      <div
        className="relative h-[64px] overflow-hidden sm:h-[68px]"
        style={{ backgroundColor: producto.fondo }}
      >
        <FotoOMarcador
          src={imagen}
          alt={producto.nombre}
          marcador=""
          sizes="(min-width: 640px) 148px, 128px"
        />
        <Link
          href={`/producto/${producto.slug}`}
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0"
        />
        {descuento && (
          <Insignia
            variante="descuento"
            className="etiqueta-precio absolute left-0 top-1.5 rounded-l-none"
          >
            -{descuento}%
          </Insignia>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-1.5">
        <h3 className="line-clamp-2 min-h-[1.9rem] text-[11px] font-normal leading-snug">
          <Link href={`/producto/${producto.slug}`} className="hover:text-verde-oscuro">
            {producto.nombre}
          </Link>
        </h3>
        <div className="mb-1 flex items-baseline gap-1.5">
          <span className="font-titulos text-sm font-extrabold leading-none">
            {formatoPrecio(producto.precio)}
          </span>
          {producto.precioAnterior && (
            <span className="text-[10px] text-gris-texto line-through">
              {formatoPrecio(producto.precioAnterior)}
            </span>
          )}
        </div>
        <div className="mt-auto">
          <AgregarAlCarrito
            compacto
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
