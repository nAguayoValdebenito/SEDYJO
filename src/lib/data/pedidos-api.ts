import {
  cabecerasDeAcceso,
  llamar,
  respuestaInesperada,
  type Credenciales,
  type ResultadoApi,
} from "./cliente-api";
import type { Cotizacion, Pedido } from "@/types";
import {
  adaptarCotizacion,
  adaptarPedido,
  cotizacionApiSchema,
  leerRespuestaPedido,
  pedidoApiSchema,
} from "./adaptador-pedidos";
import { z } from "zod";

/**
 * Llamadas de cotización, pedidos, pago y seguimiento a la API de Sedyjo (solo servidor).
 * Llevan tokens de sesión y de pedido, por eso se hacen desde acciones del servidor de Next, nunca
 * desde el navegador, y no se guardan en caché.
 */

type ItemEntrada = { productoId: string; cantidad: number };

/** `POST /checkout/quote`: precios vigentes, despacho y total. La comuna es opcional. */
export async function cotizarApi(
  items: ItemEntrada[],
  comuna?: string,
): Promise<ResultadoApi<Cotizacion>> {
  const resultado = await llamar("/checkout/quote", {
    metodo: "POST",
    cuerpo: { items, ...(comuna ? { comuna } : {}) },
  });
  if (!resultado.ok) return resultado;
  const analizado = cotizacionApiSchema.safeParse(resultado.cuerpo);
  if (!analizado.success) return respuestaInesperada();
  return { ok: true, data: adaptarCotizacion(analizado.data.data) };
}

export type DatosPedidoApi = {
  nombre: string;
  correo: string;
  telefono: string;
  metodoEntrega: "despacho";
  calle: string;
  numero: string;
  comuna: string;
  region: string;
  referencia: string;
  metodoPago: "webpay";
  items: ItemEntrada[];
};

/** `POST /orders`: crea el pedido y reserva el stock. Con la misma clave no se duplica. */
export async function crearPedidoApi(
  datos: DatosPedidoApi,
  claveIdempotencia: string,
  sesion: string | null,
): Promise<ResultadoApi<{ pedido: Pedido; accessToken: string | null; repetido: boolean }>> {
  const resultado = await llamar("/orders", {
    metodo: "POST",
    cuerpo: datos,
    cabeceras: { "Idempotency-Key": claveIdempotencia, ...cabecerasDeAcceso({ sesion }) },
  });
  if (!resultado.ok) return resultado;
  try {
    return { ok: true, data: leerRespuestaPedido(resultado.cuerpo) };
  } catch {
    return respuestaInesperada();
  }
}

/** `GET /orders/:id`: con la sesión del dueño o con el token del pedido. */
export async function obtenerPedidoApi(
  id: string,
  credenciales: Credenciales,
): Promise<ResultadoApi<Pedido>> {
  const resultado = await llamar(`/orders/${encodeURIComponent(id)}`, {
    cabeceras: cabecerasDeAcceso(credenciales),
  });
  if (!resultado.ok) return resultado;
  try {
    return { ok: true, data: leerRespuestaPedido(resultado.cuerpo).pedido };
  } catch {
    return respuestaInesperada();
  }
}

/** `POST /orders/:id/simulate-payment`: solo existe mientras los pagos simulados estén activos. */
export async function simularPagoApi(
  id: string,
  resultadoPago: "pagado" | "rechazado" | "cancelado",
  credenciales: Credenciales,
): Promise<ResultadoApi<null>> {
  const resultado = await llamar(`/orders/${encodeURIComponent(id)}/simulate-payment`, {
    metodo: "POST",
    cuerpo: { resultado: resultadoPago },
    cabeceras: cabecerasDeAcceso(credenciales),
  });
  return resultado.ok ? { ok: true, data: null } : resultado;
}

/** `POST /orders/track`: seguimiento público con número y correo. */
export async function seguirPedidoApi(
  numero: string,
  correo: string,
): Promise<ResultadoApi<Pedido>> {
  const resultado = await llamar("/orders/track", { metodo: "POST", cuerpo: { numero, correo } });
  if (!resultado.ok) return resultado;
  const cuerpo = z
    .union([z.object({ data: pedidoApiSchema }), pedidoApiSchema])
    .safeParse(resultado.cuerpo);
  if (!cuerpo.success) return respuestaInesperada();
  return { ok: true, data: adaptarPedido("data" in cuerpo.data ? cuerpo.data.data : cuerpo.data) };
}
