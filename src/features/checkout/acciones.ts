"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import type { FalloApi } from "@/lib/data/cliente-api";
import {
  cotizarApi,
  crearPedidoApi,
  obtenerPedidoApi,
  simularPagoApi,
} from "@/lib/data/pedidos-api";
import { leerTokenSesion } from "@/lib/sesion";
import {
  checkoutSchema,
  erroresCheckoutPorCampo,
  itemsCheckoutSchema,
} from "@/lib/validation/checkout";
import type { Cotizacion, Pedido, ProblemaCotizacion, ResultadoPago } from "@/types";

/**
 * Acciones de compra: cotizar, crear el pedido y confirmar el pago contra la API de Sedyjo.
 * Los precios, el despacho y el total los calcula la API; aquí solo se envía qué productos y
 * cuántos. Los tokens viajan en cookies HttpOnly: el navegador nunca los lee.
 */

const cookiePedido = (id: string) => `sedyjo_pedido_${id}`;
const DURACION_COOKIE_PEDIDO_S = 60 * 60 * 24;

const claveSchema = z.string().min(8).max(100);
const idSchema = z.string().min(1).max(100);

async function credenciales(pedidoId?: string) {
  const almacen = await cookies();
  return {
    sesion: await leerTokenSesion(),
    pedido: pedidoId ? (almacen.get(cookiePedido(pedidoId))?.value ?? null) : null,
  };
}

export type ResultadoCotizacion =
  { ok: true; cotizacion: Cotizacion } | { ok: false; mensaje: string };

/** Precios vigentes, despacho y total del carrito. La comuna es opcional. */
export async function cotizarCompra(
  entradaItems: unknown,
  comuna?: string,
): Promise<ResultadoCotizacion> {
  const items = itemsCheckoutSchema.safeParse(entradaItems);
  if (!items.success) return { ok: false, mensaje: "El carrito no contiene productos válidos." };

  const resultado = await cotizarApi(items.data, comuna?.trim() || undefined);
  if (!resultado.ok) {
    return { ok: false, mensaje: "No pudimos calcular el total. Intenta de nuevo." };
  }
  return { ok: true, cotizacion: resultado.data };
}

export type ResultadoInicioPago =
  | { ok: true; pedido: Pedido }
  | {
      ok: false;
      mensaje: string;
      campos?: Record<string, string>;
      problemas?: ProblemaCotizacion[];
    };

function mensajeDeCreacion(fallo: FalloApi): ResultadoInicioPago & { ok: false } {
  switch (fallo.code) {
    case "validacion":
      return {
        ok: false,
        mensaje: "Revisa los datos del formulario antes de continuar.",
        campos: fallo.campos,
      };
    case "items_invalidos":
      return {
        ok: false,
        mensaje:
          "Algunos productos ya no están disponibles en la cantidad que pediste. Revisa tu carrito.",
        problemas: fallo.problemas ?? [],
      };
    case "fuera_de_cobertura":
      return {
        ok: false,
        mensaje: "Todavía no despachamos a esa comuna. Elige una de las comunas con despacho.",
        campos: { comuna: "Sin despacho a esta comuna." },
      };
    case "despacho_no_definido":
      return {
        ok: false,
        mensaje: "No pudimos calcular el despacho de este pedido. Intenta más tarde o contáctanos.",
      };
    case "demasiados_intentos":
      return {
        ok: false,
        mensaje: "Hiciste muchos intentos seguidos. Espera unos minutos e inténtalo otra vez.",
      };
    default:
      return { ok: false, mensaje: fallo.mensaje };
  }
}

/**
 * Crea el pedido (reserva el stock por 30 minutos). `claveIdempotencia` evita pedidos duplicados
 * si el cliente repite la petición: se reutiliza mientras no cambien los datos de la compra.
 */
export async function iniciarPago(
  entrada: unknown,
  entradaItems: unknown,
  claveIdempotencia: string,
): Promise<ResultadoInicioPago> {
  const datos = checkoutSchema.safeParse(entrada);
  if (!datos.success) {
    return {
      ok: false,
      mensaje: "Revisa los datos del formulario antes de continuar.",
      campos: erroresCheckoutPorCampo(datos.error),
    };
  }
  const items = itemsCheckoutSchema.safeParse(entradaItems);
  if (!items.success) return { ok: false, mensaje: "El carrito no contiene productos válidos." };
  const clave = claveSchema.safeParse(claveIdempotencia);
  if (!clave.success)
    return { ok: false, mensaje: "No pudimos iniciar el pago. Intenta de nuevo." };

  const { sesion } = await credenciales();
  const { nombre, correo, telefono, metodoEntrega, calle, numero, comuna, region, referencia } =
    datos.data;
  const resultado = await crearPedidoApi(
    {
      nombre,
      correo,
      telefono,
      metodoEntrega,
      calle,
      numero,
      comuna,
      region,
      referencia,
      metodoPago: "webpay",
      items: items.data,
    },
    clave.data,
    sesion,
  );
  if (!resultado.ok) return mensajeDeCreacion(resultado);

  const { pedido, accessToken } = resultado.data;
  // El token se entrega una sola vez; si la petición se repitió, ya está en la cookie anterior.
  if (accessToken) {
    (await cookies()).set(cookiePedido(pedido.id), accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DURACION_COOKIE_PEDIDO_S,
    });
  }
  return { ok: true, pedido };
}

/**
 * PUNTO ÚNICO DE PAGO. Hoy la API confirma el pago con su pasarela simulada
 * (`POST /orders/:id/simulate-payment`, solo mientras `SIMULATED_PAYMENTS=true`). Cuando se
 * integre Webpay, solo se reemplaza el interior de esta función por la redirección a Transbank:
 * el pedido se marcará como pagado desde el servidor y el resto del flujo (consultar el pedido,
 * mostrar el éxito o el error) no cambia.
 */
export async function pagarPedido(pedidoId: string): Promise<ResultadoPago> {
  const id = idSchema.safeParse(pedidoId);
  if (!id.success) return { ok: false, motivo: "invalido" };

  const acceso = await credenciales(id.data);
  const simulacion = await simularPagoApi(id.data, "pagado", acceso);
  if (!simulacion.ok) {
    return { ok: false, motivo: simulacion.status === 404 ? "no-disponible" : "invalido" };
  }

  // El estado real del pago lo decide la API, no la respuesta de la simulación.
  const consulta = await obtenerPedidoApi(id.data, acceso);
  if (!consulta.ok) return { ok: false, motivo: "invalido" };

  const pedido = consulta.data;
  if (pedido.pago?.estado === "pagado") return { ok: true, pedido };
  return { ok: false, motivo: pedido.pago?.estado === "expirado" ? "tiempo-agotado" : "rechazado" };
}
