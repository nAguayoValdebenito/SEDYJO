"use server";

import {
  getPedidoDeUsuario,
  getPedidoPorNumero,
  getPedidosDeUsuario,
  getProducts,
} from "@/lib/data";
import type { Pedido } from "@/types";

/**
 * Acciones de pedidos SIMULADAS. Hacen de "API" para que las pantallas tengan estados de carga,
 * vacío y error reales. El backend verificará la sesión del cliente; aquí se confía en el
 * `usuarioId` que llega del navegador porque la sesión también es simulada.
 */

const DEMORA_MS = 500;
const pausa = () => new Promise((resolver) => setTimeout(resolver, DEMORA_MS));

export async function obtenerPedidos(usuarioId: string): Promise<Pedido[]> {
  await pausa();
  return getPedidosDeUsuario(usuarioId);
}

export async function obtenerPedido(id: string, usuarioId: string): Promise<Pedido | null> {
  await pausa();
  return getPedidoDeUsuario(id, usuarioId);
}

/** Seguimiento sin cuenta: número de pedido + correo con que se compró. */
export async function buscarPedidoPublico(numero: string, correo: string): Promise<Pedido | null> {
  await pausa();
  if (!numero.trim() || !correo.trim()) return null;
  return getPedidoPorNumero(numero, correo);
}

export type ProductoRecompra = {
  productoId: string;
  slug: string;
  nombre: string;
  /** Precio de hoy (puede ser distinto al de la compra original). */
  precio: number;
  imagen: string | null;
  fondo: string;
};

/**
 * Para "volver a comprar": datos y precios de HOY de los productos pedidos. Los que ya no
 * existen o están agotados se informan aparte para avisarle al cliente.
 */
export async function prepararRecompra(
  ids: string[],
): Promise<{ disponibles: ProductoRecompra[]; noDisponibles: string[] }> {
  const catalogo = await getProducts();
  const disponibles: ProductoRecompra[] = [];
  const noDisponibles: string[] = [];

  for (const id of ids) {
    const producto = catalogo.find((p) => p.id === id);
    if (!producto || producto.stock === 0) {
      noDisponibles.push(id);
      continue;
    }
    disponibles.push({
      productoId: producto.id,
      slug: producto.slug,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagenes[0] ?? null,
      fondo: producto.fondo,
    });
  }

  return { disponibles, noDisponibles };
}
