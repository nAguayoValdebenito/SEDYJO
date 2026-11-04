import { z } from "zod";

/**
 * Esquemas que validan lo que llega desde el backend (o los JSON simulados).
 * Si el contrato cambia, el error aparece aquí y no en mitad de una pantalla.
 */

export const categoriaSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nombre: z.string(),
  fondo: z.string(),
  imagen: z.string().nullable(),
  sugerenciaFoto: z.string(),
});

export const productoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nombre: z.string(),
  descripcionCorta: z.string(),
  categoriaSlug: z.string(),
  etiqueta: z.string(),
  precio: z.number().int().nonnegative(),
  precioAnterior: z.number().int().nonnegative().nullable(),
  unidad: z.string(),
  precioPorUnidad: z.string(),
  stock: z.number().int().nonnegative(),
  imagenes: z.array(z.string()),
  marca: z.string().nullable(),
  fondo: z.string(),
  colecciones: z.array(z.enum(["semana", "exclusivo-online"])),
  promo: z.string().nullable(),
});

export const bannerSchema = z.object({
  id: z.string(),
  etiqueta: z.string(),
  titulo: z.string(),
  texto: z.string(),
  boton: z.object({ texto: z.string(), href: z.string() }).nullable(),
  imagen: z.string().nullable(),
  alt: z.string(),
});

export const bannerOscuroSchema = z.object({
  id: z.string(),
  titular: z.string(),
  detalle: z.string(),
  imagen: z.string(),
  alt: z.string(),
  colorTitular: z.enum(["dorado", "morado"]),
  href: z.string().nullable(),
  cta: z.string().nullable(),
});

export const bannersSchema = z.object({
  principales: z.array(bannerSchema),
  oscuros: z.array(bannerOscuroSchema),
});

export const usuarioSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1),
  correo: z.string().email(),
});

export const slideCampanaSchema = z.object({
  id: z.string(),
  imagen: z.string().nullable(),
  titulo: z.string(),
  texto: z.string(),
  boton: z.object({ texto: z.string(), href: z.string() }).nullable(),
});

export const campanaModalSchema = z.object({
  id: z.string(),
  activo: z.boolean(),
  tipo: z.enum(["simple", "galeria"]),
  vigenciaHasta: z.string().nullable(),
  frecuenciaHoras: z.number().positive(),
  retrasoSegundos: z.number().nonnegative(),
  slides: z.array(slideCampanaSchema),
});

const estadoPedidoSchema = z.enum([
  "recibido",
  "preparando",
  "en-camino",
  "entregado",
  "cancelado",
]);

export const pedidoSchema = z.object({
  id: z.string(),
  numero: z.string(),
  usuarioId: z.string(),
  correo: z.string().email(),
  fecha: z.string(),
  estado: estadoPedidoSchema,
  metodoEntrega: z.literal("despacho"),
  direccion: z
    .object({
      calle: z.string(),
      numero: z.string(),
      comuna: z.string(),
      region: z.string(),
      referencia: z.string().nullable(),
    })
    .nullable(),
  items: z.array(
    z.object({
      productoId: z.string(),
      slug: z.string(),
      nombre: z.string(),
      precio: z.number().int().nonnegative(),
      cantidad: z.number().int().positive(),
      imagen: z.string().nullable(),
      fondo: z.string(),
    }),
  ),
  subtotal: z.number().int().nonnegative(),
  despacho: z.number().int().nonnegative().nullable(),
  total: z.number().int().nonnegative().nullable(),
  metodoPago: z.string(),
  eventos: z.array(
    z.object({ estado: estadoPedidoSchema, fecha: z.string(), detalle: z.string() }),
  ),
});
