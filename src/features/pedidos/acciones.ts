"use server";

import { z } from "zod";
import { getProducts } from "@/lib/data";
import { pedidoApiSchema, adaptarPedido } from "@/lib/data/adaptador-pedidos";
import { cabecerasDeAcceso, llamar } from "@/lib/data/cliente-api";
import { seguirPedidoApi } from "@/lib/data/pedidos-api";
import { borrarTokenSesion, leerTokenSesion } from "@/lib/sesion";
import type { Pedido } from "@/types";

/**
 * Historial y detalle de la cuenta (`/me/orders`). La API devuelve solo los pedidos **pagados**
 * del cliente de la sesión; nunca se envía un `usuarioId` desde el navegador. Si la sesión venció
 * se borra la cookie y se lanza un error para que la pantalla lo avise.
 */

const POR_PAGINA = 50;
const MAX_PAGINAS = 4;

const listaSchema = z.object({
  data: z.array(pedidoApiSchema),
  meta: z.object({ totalPages: z.number() }),
});

async function accesoDelCliente() {
  const sesion = await leerTokenSesion();
  if (!sesion) throw new Error("Sin sesión.");
  return cabecerasDeAcceso({ sesion });
}

export async function obtenerPedidos(): Promise<Pedido[]> {
  const cabeceras = await accesoDelCliente();
  const pedidos: Pedido[] = [];
  let pagina = 1;
  let totalPaginas = 1;
  do {
    const resultado = await llamar(`/me/orders?page=${pagina}&limit=${POR_PAGINA}`, { cabeceras });
    if (!resultado.ok) {
      if (resultado.status === 401) await borrarTokenSesion();
      throw new Error(resultado.mensaje);
    }
    const lista = listaSchema.parse(resultado.cuerpo);
    pedidos.push(...lista.data.map(adaptarPedido));
    totalPaginas = lista.meta.totalPages;
    pagina += 1;
  } while (pagina <= totalPaginas && pagina <= MAX_PAGINAS);
  return pedidos;
}

/** Un pedido del cliente por `id` o por número (`SED-10482`); `null` si no existe o es de otra persona. */
export async function obtenerPedido(idONumero: string): Promise<Pedido | null> {
  const cabeceras = await accesoDelCliente();
  const resultado = await llamar(`/me/orders/${encodeURIComponent(idONumero)}`, { cabeceras });
  if (!resultado.ok) {
    if (resultado.status === 404) return null;
    if (resultado.status === 401) await borrarTokenSesion();
    throw new Error(resultado.mensaje);
  }
  const cuerpo = z.object({ data: pedidoApiSchema }).parse(resultado.cuerpo);
  return adaptarPedido(cuerpo.data);
}

/**
 * Seguimiento sin cuenta (`POST /orders/track`): número de pedido + correo con que se compró.
 * La API responde siempre lo mismo si no coincide (no se distingue el motivo). Un fallo de
 * conexión lanza un error para que la pantalla avise que no pudo consultar.
 */
export async function buscarPedidoPublico(numero: string, correo: string): Promise<Pedido | null> {
  if (!numero.trim() || !correo.trim()) return null;
  const resultado = await seguirPedidoApi(numero.trim(), correo.trim());
  if (resultado.ok) return resultado.data;
  if (resultado.status === 404 || resultado.code === "pedido_no_encontrado") return null;
  throw new Error(resultado.mensaje);
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
