import Link from "next/link";
import { FotoOMarcador } from "@/components/ui/FotoOMarcador";
import { Insignia } from "@/components/ui/Insignia";
import { AgregarAlCarrito } from "@/features/carrito/components/AgregarAlCarrito";
import { formatoPrecio } from "@/lib/utils/format";
import type { Producto } from "@/types";

type Props = {
  producto: Producto;
};

/** Tarjeta de producto para la sección oscura de ofertas exclusivas. */
export function TarjetaProductoOscura({ producto }: Props) {
  const imagen = producto.imagenes[0] ?? null;

  return (
    <article className="relative flex flex-col overflow-hidden rounded-[10px] border border-carbon-borde bg-carbon transition-[box-shadow,border-color] duration-300 ease-[var(--ease-salida)] hover:border-oro/60 hover:shadow-[0_14px_26px_-16px_rgb(255_200_61/0.3)]">
      <div
        className="relative h-[120px] overflow-hidden md:h-[180px]"
        style={{ backgroundColor: producto.fondo }}
      >
        <FotoOMarcador src={imagen} alt={producto.nombre} sizes="(min-width: 768px) 250px, 50vw" />
        <Link
          href={`/producto/${producto.slug}`}
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0"
        />
        <Insignia variante="morada" className="absolute right-2.5 top-2.5 hidden md:inline-block">
          exclusivo online
        </Insignia>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 px-2.5 pb-3 pt-2.5 md:gap-1 md:px-4 md:pb-4 md:pt-3.5">
        <h3 className="min-h-[34px] text-[13px] font-normal leading-[1.3] text-white md:min-h-[22px] md:text-[15px]">
          <Link href={`/producto/${producto.slug}`} className="hover:text-oro">
            {producto.nombre}
          </Link>
        </h3>
        {producto.precioPorUnidad && (
          <span className="hidden text-xs text-gris-claro md:block">
            {producto.precioPorUnidad}
          </span>
        )}
        <span className="mb-1.5 font-titulos text-[22px] font-extrabold leading-[1.1] text-oro md:mb-2 md:mt-1.5 md:text-[30px] md:leading-none">
          {producto.promo ?? formatoPrecio(producto.precio)}
        </span>
        <div className="mt-auto">
          <AgregarAlCarrito
            tema="oscuro"
            agotado={producto.stock === 0}
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
