import { pedidoSchema } from "@/lib/validation/schemas";
import type { Pedido } from "@/types";
import pedidosMock from "./mock/pedidos.json";

/**
 * Acceso a los pedidos. Hoy lee JSON simulados (de la cuenta demo); cuando exista el backend,
 * estas funciones llamarán a su API con la sesión real del cliente. No se guardan en caché:
 * son datos privados de cada persona.
 */

function todos(): Pedido[] {
  return pedidoSchema.array().parse(pedidosMock);
}

export async function getPedidosDeUsuario(usuarioId: string): Promise<Pedido[]> {
  return todos().filter((p) => p.usuarioId === usuarioId);
}

/** Un pedido, solo si pertenece al usuario indicado. */
export async function getPedidoDeUsuario(id: string, usuarioId: string): Promise<Pedido | null> {
  return todos().find((p) => p.id === id && p.usuarioId === usuarioId) ?? null;
}

/** Seguimiento público: se necesita el número del pedido y el correo con que se compró. */
export async function getPedidoPorNumero(numero: string, correo: string): Promise<Pedido | null> {
  const buscado = numero.trim().toUpperCase();
  const mail = correo.trim().toLowerCase();
  return todos().find((p) => p.numero === buscado && p.correo.toLowerCase() === mail) ?? null;
}
