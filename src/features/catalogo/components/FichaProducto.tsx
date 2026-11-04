import Link from "next/link";
import { BadgeCheck, CircleAlert, CircleCheck, CircleX, Clock, Truck } from "lucide-react";
import { Insignia } from "@/components/ui/Insignia";
import { MigasDePan } from "@/components/ui/MigasDePan";
import { AgregarAlCarrito } from "@/features/carrito/components/AgregarAlCarrito";
import { DESPACHO_GRATIS_DESDE, PLAZO_DESPACHO } from "@/lib/config";
import { formatoPrecio, porcentajeDescuento } from "@/lib/utils/format";
import { estadoStock } from "@/lib/utils/producto";
import type { Categoria, Producto } from "@/types";
import { GaleriaProducto } from "./GaleriaProducto";

const ICONO_STOCK = {
  disponible: { Icono: CircleCheck, clase: "text-verde-oscuro" },
  pocas: { Icono: CircleAlert, clase: "text-tinta" },
  agotado: { Icono: CircleX, clase: "text-error" },
} as const;

/** Página de un producto: galería, precio, disponibilidad, compra y datos del producto. */
export function FichaProducto({
  producto,
  categoria,
}: {
  producto: Producto;
  categoria: Categoria | undefined;
}) {
  const descuento = porcentajeDescuento(producto.precio, producto.precioAnterior);
  const stock = estadoStock(producto.stock);
  const { Icono, clase } = ICONO_STOCK[stock.tipo];

  return (
    <>
      <MigasDePan
        migas={[
          { texto: "Inicio", href: "/" },
          ...(categoria ? [{ texto: categoria.nombre, href: `/categoria/${categoria.slug}` }] : []),
          { texto: producto.nombre },
        ]}
      />

      <div className="grid gap-6 md:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <GaleriaProducto
          nombre={producto.nombre}
          imagenes={producto.imagenes}
          fondo={producto.fondo}
        />

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {categoria ? (
              <Link href={`/categoria/${categoria.slug}`} className="inline-block">
                <Insignia variante="oscura">{producto.etiqueta}</Insignia>
              </Link>
            ) : (
              <Insignia variante="oscura">{producto.etiqueta}</Insignia>
            )}
            {producto.marca && <span className="text-sm text-gris-texto">{producto.marca}</span>}
          </div>

          <h1 className="font-titulos text-[28px] font-extrabold leading-tight md:text-4xl">
            {producto.nombre}
          </h1>
          <p className="text-gris-medio">{producto.descripcionCorta}</p>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-titulos text-4xl font-extrabold leading-none tabular-nums md:text-5xl">
              {formatoPrecio(producto.precio)}
            </span>
            {producto.precioAnterior && (
              <span className="text-lg text-gris-texto line-through tabular-nums">
                {formatoPrecio(producto.precioAnterior)}
              </span>
            )}
            {descuento && <Insignia variante="descuento">-{descuento}%</Insignia>}
          </div>
          <p className="-mt-2 text-sm text-gris-texto">
            {producto.unidad} · {producto.precioPorUnidad}
          </p>

          <p className={`flex items-center gap-2 text-sm font-bold ${clase}`}>
            <Icono size={18} aria-hidden="true" />
            {stock.texto}
          </p>

          <div className="w-full max-w-xs">
            <AgregarAlCarrito
              agotado={stock.tipo === "agotado"}
              producto={{
                productoId: producto.id,
                slug: producto.slug,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagenes[0] ?? null,
                fondo: producto.fondo,
              }}
            />
          </div>

          <ul className="mt-2 flex flex-col gap-2.5 rounded-xl bg-verde-suave p-4 text-sm">
            {DESPACHO_GRATIS_DESDE !== null && (
              <li className="flex items-center gap-3">
                <Truck size={18} aria-hidden="true" className="shrink-0 text-verde-oscuro" />
                <span>
                  Despacho <strong>gratis</strong> en compras sobre{" "}
                  <strong>{formatoPrecio(DESPACHO_GRATIS_DESDE)}</strong>
                </span>
              </li>
            )}
            <li className="flex items-center gap-3">
              <Clock size={18} aria-hidden="true" className="shrink-0 text-verde-oscuro" />
              <span>
                Despacho a domicilio en <strong>{PLAZO_DESPACHO}</strong>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <BadgeCheck size={18} aria-hidden="true" className="shrink-0 text-verde-oscuro" />
              <span>
                Pago seguro con <strong>Webpay Plus</strong> (Transbank)
              </span>
            </li>
          </ul>

          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 border-t border-borde pt-4 text-sm">
            <dt className="text-gris-texto">Categoría</dt>
            <dd>{categoria?.nombre ?? producto.etiqueta}</dd>
            {producto.marca && (
              <>
                <dt className="text-gris-texto">Marca</dt>
                <dd>{producto.marca}</dd>
              </>
            )}
            <dt className="text-gris-texto">Presentación</dt>
            <dd>{producto.unidad}</dd>
          </dl>
        </div>
      </div>
    </>
  );
}
