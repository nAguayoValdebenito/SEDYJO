import { z } from "zod";
import type { Cotizacion, Despacho, EstadoPedido, Pedido, ProblemaCotizacion } from "@/types";
import { fondoDeCategoria, generarSlug } from "./adaptador-api";

/**
 * Traduce las respuestas de despacho, cotización y pedidos de la API de Sedyjo a los tipos del
 * frontend. Son funciones puras (sin red) para poder probarlas.
 */

const estadoPedidoSchema = z.enum([
  "recibido",
  "preparando",
  "en-camino",
  "entregado",
  "cancelado",
]);

export const despachoApiSchema = z.object({
  data: z.object({
    gratisDesde: z.number().nullable().optional(),
    costoGeneral: z.number().nullable().optional(),
    plazo: z.string(),
    zonas: z.array(
      z.object({
        id: z.number(),
        region: z.string(),
        comuna: z.string(),
        costo: z.number(),
        plazo: z.string(),
      }),
    ),
  }),
});

export const cotizacionApiSchema = z.object({
  data: z.object({
    items: z.array(
      z.object({
        productoId: z.string(),
        slug: z.string(),
        nombre: z.string(),
        precio: z.number(),
        precioNormal: z.number().optional(),
        cantidad: z.number(),
        subtotal: z.number(),
        stock: z.number(),
        imagen: z.string().nullable().optional(),
      }),
    ),
    subtotal: z.number(),
    despacho: z.number().nullable(),
    total: z.number().nullable(),
    plazo: z.string(),
    gratisDesde: z.number().nullable().optional(),
    faltaParaGratis: z.number().optional(),
    cobertura: z.boolean(),
    cotizable: z.boolean(),
    valido: z.boolean(),
    problemas: z.array(
      z.object({
        productoId: z.string(),
        codigo: z.enum(["sin_stock", "cantidad_excede", "no_existe"]),
        disponible: z.number().nullable().optional(),
      }),
    ),
  }),
});

const pedidoApiBaseSchema = z.object({
  id: z.string(),
  numero: z.string(),
  usuarioId: z.string().nullable().optional(),
  correo: z.string().nullable().optional(),
  fecha: z.string(),
  estado: estadoPedidoSchema,
  metodoEntrega: z.string(),
  direccion: z
    .object({
      calle: z.string().nullable().optional(),
      numero: z.string().nullable().optional(),
      comuna: z.string(),
      region: z.string(),
      referencia: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  items: z.array(
    z.object({
      productoId: z.string(),
      slug: z.string(),
      nombre: z.string(),
      precio: z.number(),
      cantidad: z.number(),
      imagen: z.string().nullable().optional(),
      categoria: z.string().nullable().optional(),
    }),
  ),
  subtotal: z.number(),
  despacho: z.number().nullable(),
  total: z.number().nullable(),
  metodoPago: z.string(),
  pago: z
    .object({
      estado: z.enum(["pendiente", "pagado", "rechazado", "expirado"]),
      fecha: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  eventos: z.array(
    z.object({ estado: estadoPedidoSchema, fecha: z.string(), detalle: z.string() }),
  ),
});

export const pedidoApiSchema = pedidoApiBaseSchema;

const extrasPedidoSchema = z.object({
  accessToken: z.string().nullish(),
  repetido: z.boolean().nullish(),
});

/**
 * Hoy la API responde `{ data: { ...Pedido, accessToken } }`. Por si el token o `repetido` vienen
 * junto a `data` o el pedido viene sin envoltorio, se aceptan esas variantes.
 */
export const respuestaPedidoSchema = z.union([
  z
    .object({ data: pedidoApiSchema.extend(extrasPedidoSchema.shape) })
    .extend(extrasPedidoSchema.shape),
  pedidoApiSchema.extend(extrasPedidoSchema.shape),
]);

export type PedidoApi = z.infer<typeof pedidoApiSchema>;

export function adaptarDespacho(api: z.infer<typeof despachoApiSchema>["data"]): Despacho {
  return {
    gratisDesde: api.gratisDesde ?? null,
    costoGeneral: api.costoGeneral ?? null,
    plazo: api.plazo,
    zonas: [...api.zonas].sort((a, b) => a.comuna.localeCompare(b.comuna, "es")),
  };
}

export function adaptarCotizacion(api: z.infer<typeof cotizacionApiSchema>["data"]): Cotizacion {
  return {
    items: api.items.map((i) => ({
      productoId: i.productoId,
      slug: i.slug,
      nombre: i.nombre,
      precio: i.precio,
      precioNormal: i.precioNormal ?? i.precio,
      cantidad: i.cantidad,
      subtotal: i.subtotal,
      stock: i.stock,
      imagen: i.imagen ?? null,
    })),
    subtotal: api.subtotal,
    despacho: api.despacho,
    total: api.total,
    plazo: api.plazo,
    gratisDesde: api.gratisDesde ?? null,
    faltaParaGratis: api.faltaParaGratis ?? 0,
    cobertura: api.cobertura,
    cotizable: api.cotizable,
    valido: api.valido,
    problemas: api.problemas.map((p): ProblemaCotizacion => ({
      productoId: p.productoId,
      codigo: p.codigo,
      disponible: p.disponible ?? null,
    })),
  };
}

const NOMBRES_PAGO: Record<string, string> = { webpay: "Webpay Plus" };

export function adaptarPedido(api: PedidoApi): Pedido {
  return {
    id: api.id,
    numero: api.numero,
    usuarioId: api.usuarioId ?? null,
    correo: api.correo ?? "",
    fecha: api.fecha,
    estado: api.estado as EstadoPedido,
    metodoEntrega: "despacho",
    direccion: api.direccion
      ? {
          calle: api.direccion.calle ?? null,
          numero: api.direccion.numero ?? null,
          comuna: api.direccion.comuna,
          region: api.direccion.region,
          referencia: api.direccion.referencia ?? null,
        }
      : null,
    items: api.items.map((i) => ({
      productoId: i.productoId,
      slug: i.slug,
      nombre: i.nombre,
      precio: i.precio,
      cantidad: i.cantidad,
      imagen: i.imagen ?? null,
      // La API informa la categoría; el color de fondo lo decide el frontend.
      fondo: fondoDeCategoria(generarSlug(i.categoria ?? "")),
    })),
    subtotal: api.subtotal,
    despacho: api.despacho,
    total: api.total,
    metodoPago: NOMBRES_PAGO[api.metodoPago] ?? api.metodoPago,
    pago: api.pago ? { estado: api.pago.estado, fecha: api.pago.fecha ?? null } : null,
    eventos: api.eventos,
  };
}

/** Desenvuelve la respuesta de un pedido (con o sin `data`) y separa el token de acceso. */
export function leerRespuestaPedido(cuerpo: unknown): {
  pedido: Pedido;
  accessToken: string | null;
  repetido: boolean;
} {
  const respuesta = respuestaPedidoSchema.parse(cuerpo);
  const interior = "data" in respuesta ? respuesta.data : respuesta;
  const accessToken =
    interior.accessToken ?? (respuesta as { accessToken?: string | null }).accessToken;
  const repetido = interior.repetido ?? (respuesta as { repetido?: boolean | null }).repetido;
  return {
    pedido: adaptarPedido(pedidoApiSchema.parse(interior)),
    accessToken: accessToken ?? null,
    repetido: repetido ?? false,
  };
}
