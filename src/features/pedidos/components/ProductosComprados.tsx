import Link from "next/link";
import { FotoOMarcador } from "@/components/ui/FotoOMarcador";
import { formatoFecha } from "@/lib/utils/format";
import type { ProductoComprado } from "@/lib/utils/pedidos";
import { BotonVolverAComprar } from "./BotonVolverAComprar";

/** Productos que el cliente ya compró (sumados entre pedidos), con recompra de uno en uno. */
export function ProductosComprados({ productos }: { productos: ProductoComprado[] }) {
  if (productos.length === 0) return null;

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {productos.map((p) => (
        <li
          key={p.productoId}
          className="contenido-entra flex flex-col gap-3 rounded-[10px] border border-borde bg-white p-3"
        >
          <div className="flex items-center gap-3">
            <div
              className="relative size-14 shrink-0 overflow-hidden rounded-lg"
              style={{ backgroundColor: p.fondo }}
            >
              <FotoOMarcador src={p.imagen} alt="" marcador="" sizes="56px" />
            </div>
            <div className="min-w-0">
              <Link
                href={`/producto/${p.slug}`}
                className="line-clamp-2 text-sm font-medium leading-snug hover:text-verde-oscuro"
              >
                {p.nombre}
              </Link>
              <p className="text-xs text-gris-texto">
                {p.unidades} {p.unidades === 1 ? "unidad" : "unidades"} · última vez{" "}
                {formatoFecha(p.ultimaCompra)}
              </p>
            </div>
          </div>
          <BotonVolverAComprar
            items={[{ productoId: p.productoId, cantidad: 1 }]}
            etiqueta="Comprar de nuevo"
            tamano="sm"
          />
        </li>
      ))}
    </ul>
  );
}
