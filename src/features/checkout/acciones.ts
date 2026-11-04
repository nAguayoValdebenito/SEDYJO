"use server";

import { randomUUID } from "node:crypto";
import { getProducts } from "@/lib/data";
import { calcularTotales } from "@/lib/utils/checkout";
import {
  checkoutSchema,
  erroresCheckoutPorCampo,
  itemsCheckoutSchema,
} from "@/lib/validation/checkout";
import { pedidoSchema } from "@/lib/validation/schemas";
import type { DatosCheckout, ItemPedido, Pedido, ResultadoPago } from "@/types";

type ResumenValidado = Pick<Pedido, "items" | "subtotal" | "despacho" | "total">;
type PagoPendiente = { datos: DatosCheckout; resumen: ResumenValidado; vence: number };

// Persistencia temporal de la demo. Una pasarela real y la base de datos reemplazarán este mapa.
const pendientes = new Map<string, PagoPendiente>();
const DEMORA_MS = 500;
const pausa = () => new Promise((resolver) => setTimeout(resolver, DEMORA_MS));

export async function iniciarPago(
  entrada: unknown,
  entradaItems: unknown,
): Promise<
  | { ok: true; token: string; resumen: ResumenValidado }
  | { ok: false; mensaje: string; campos?: Record<string, string> }
> {
  await pausa();
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

  const catalogo = await getProducts();
  const pedidos: ItemPedido[] = [];
  for (const item of items.data) {
    if (pedidos.some((existente) => existente.productoId === item.productoId)) {
      return {
        ok: false,
        mensaje: "El carrito contiene un producto repetido. Revísalo e intenta de nuevo.",
      };
    }
    const producto = catalogo.find((p) => p.id === item.productoId);
    if (!producto || producto.stock < item.cantidad) {
      return {
        ok: false,
        mensaje: `${producto?.nombre ?? "Un producto"} está agotado o no tiene suficientes unidades.`,
      };
    }
    pedidos.push({
      productoId: producto.id,
      slug: producto.slug,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: item.cantidad,
      imagen: producto.imagenes[0] ?? null,
      fondo: producto.fondo,
    });
  }

  const subtotal = pedidos.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  const resumen: ResumenValidado = {
    items: pedidos,
    ...calcularTotales(subtotal),
  };
  const token = randomUUID();
  pendientes.set(token, { datos: datos.data, resumen, vence: Date.now() + 15 * 60_000 });
  return { ok: true, token, resumen };
}

export async function confirmarPagoSimulado(
  token: string,
  resultado: "exito" | "error",
): Promise<ResultadoPago> {
  await pausa();
  if (resultado !== "exito" && resultado !== "error") return { ok: false, motivo: "invalido" };
  const pendiente = pendientes.get(token);
  if (!pendiente || pendiente.vence < Date.now()) {
    pendientes.delete(token);
    return { ok: false, motivo: "tiempo-agotado" };
  }
  pendientes.delete(token);
  if (resultado === "error" || pendiente.datos.correo.toLowerCase() === "error@sedyjo.cl") {
    return { ok: false, motivo: "rechazado" };
  }

  const ahora = new Date().toISOString();
  const datos = pendiente.datos;
  const pedido: Pedido = pedidoSchema.parse({
    id: randomUUID(),
    numero: `SED-${String(10000 + Math.floor(Math.random() * 10000))}`,
    usuarioId: datos.usuarioId ?? "",
    correo: datos.correo,
    fecha: ahora,
    estado: "recibido",
    metodoEntrega: datos.metodoEntrega,
    direccion:
      datos.metodoEntrega === "despacho"
        ? {
            calle: datos.calle,
            numero: datos.numero,
            comuna: datos.comuna,
            region: datos.region,
            referencia: datos.referencia || null,
          }
        : null,
    ...pendiente.resumen,
    metodoPago: "Webpay Plus (simulado)",
    eventos: [
      { estado: "recibido", fecha: ahora, detalle: "Pedido recibido en modo demostración." },
    ],
  });
  return { ok: true, pedido };
}
