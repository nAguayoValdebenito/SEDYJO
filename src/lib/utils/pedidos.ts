import type { EstadoPedido, ItemPedido, Pedido } from "@/types";

const ETIQUETAS: Record<EstadoPedido, string> = {
  recibido: "Pedido recibido",
  preparando: "Preparando tu pedido",
  "en-camino": "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export function etiquetaEstado(estado: EstadoPedido): string {
  return ETIQUETAS[estado];
}

/** Pasos por los que avanza un pedido (siempre es despacho a domicilio). */
export function estadosDelFlujo(): EstadoPedido[] {
  return ["recibido", "preparando", "en-camino", "entregado"];
}

export type PasoPedido = {
  estado: EstadoPedido;
  etiqueta: string;
  /** Fecha del hito (ISO) o `null` si aún no ocurre. */
  fecha: string | null;
  detalle: string | null;
  situacion: "hecho" | "actual" | "pendiente";
};

/**
 * Línea de tiempo del pedido: cada paso del flujo con su fecha (si ya ocurrió) y si es el
 * paso actual. Un pedido entregado queda con todos los pasos hechos.
 */
export function pasosDelPedido(pedido: Pick<Pedido, "estado" | "eventos">): PasoPedido[] {
  const flujo = estadosDelFlujo();
  const indiceActual = flujo.indexOf(pedido.estado);

  return flujo.map((estado, i) => {
    const evento = pedido.eventos.find((e) => e.estado === estado) ?? null;
    let situacion: PasoPedido["situacion"] = "pendiente";
    if (pedido.estado === "entregado" || i < indiceActual) situacion = "hecho";
    else if (i === indiceActual) situacion = "actual";

    return {
      estado,
      etiqueta: etiquetaEstado(estado),
      fecha: evento?.fecha ?? null,
      detalle: evento?.detalle ?? null,
      situacion,
    };
  });
}

export function totalUnidades(items: Pick<ItemPedido, "cantidad">[]): number {
  return items.reduce((suma, i) => suma + i.cantidad, 0);
}

export type ProductoComprado = {
  productoId: string;
  slug: string;
  nombre: string;
  imagen: string | null;
  fondo: string;
  /** Unidades compradas en todos los pedidos. */
  unidades: number;
  /** En cuántos pedidos aparece. */
  pedidos: number;
  /** Fecha del pedido más reciente (ISO). */
  ultimaCompra: string;
};

/** Historial de productos: lo comprado sumado entre pedidos (sin cancelados), lo más repetido primero. */
export function productosComprados(pedidos: Pedido[]): ProductoComprado[] {
  const mapa = new Map<string, ProductoComprado>();

  for (const pedido of pedidos) {
    if (pedido.estado === "cancelado") continue;
    for (const item of pedido.items) {
      const actual = mapa.get(item.productoId);
      if (!actual) {
        mapa.set(item.productoId, {
          productoId: item.productoId,
          slug: item.slug,
          nombre: item.nombre,
          imagen: item.imagen,
          fondo: item.fondo,
          unidades: item.cantidad,
          pedidos: 1,
          ultimaCompra: pedido.fecha,
        });
      } else {
        actual.unidades += item.cantidad;
        actual.pedidos += 1;
        if (pedido.fecha > actual.ultimaCompra) actual.ultimaCompra = pedido.fecha;
      }
    }
  }

  return [...mapa.values()].sort(
    (a, b) => b.unidades - a.unidades || b.ultimaCompra.localeCompare(a.ultimaCompra),
  );
}

/** Pedidos de más reciente a más antiguo. */
export function ordenarPedidos(pedidos: Pedido[]): Pedido[] {
  return [...pedidos].sort((a, b) => b.fecha.localeCompare(a.fecha));
}
