import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Pedido } from "@/types";
import { ComprobantePago } from "./ComprobantePago";

const pedido: Pedido = {
  id: "p1",
  numero: "SED-10482",
  usuarioId: null,
  correo: "ana@example.cl",
  fecha: "2026-11-16T12:00:00.000Z",
  estado: "recibido",
  metodoEntrega: "despacho",
  direccion: null,
  items: [],
  subtotal: 55650,
  despacho: 0,
  total: 55650,
  metodoPago: "Webpay Plus",
  pago: {
    estado: "pagado",
    fecha: "2026-11-16T12:00:01.000Z",
    detalle: {
      autorizacion: "1213",
      tarjeta: "6623",
      tipoPago: "Crédito",
      cuotas: 0,
      cuotasTexto: "Sin cuotas",
      fecha: "2026-11-16T12:00:00.000Z",
    },
  },
  eventos: [],
};

const html = (p: Pedido) => renderToStaticMarkup(createElement(ComprobantePago, { pedido: p }));

describe("ComprobantePago", () => {
  it("muestra los datos del cobro que pide Transbank", () => {
    const salida = html(pedido);
    for (const texto of [
      "Comprobante de pago",
      "SED-10482",
      "$55.650",
      "(CLP)",
      "1213",
      "Crédito",
      "Sin cuotas",
      "terminada en 6623",
      "Comercial Sedyjo",
      "sedyjo.com",
      "Fecha y hora",
    ]) {
      expect(salida).toContain(texto);
    }
  });

  it("no muestra nada si el pedido no tiene detalle de cobro", () => {
    expect(html({ ...pedido, pago: { estado: "pagado", fecha: null } })).toBe("");
    expect(html({ ...pedido, pago: null })).toBe("");
  });
});
