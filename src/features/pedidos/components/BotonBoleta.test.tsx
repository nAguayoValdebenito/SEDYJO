import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Pedido } from "@/types";
import { BotonBoleta } from "./BotonBoleta";

const base: Pedido = {
  id: "p1",
  numero: "SED-10482",
  usuarioId: null,
  correo: "",
  fecha: "2026-11-16T12:00:00.000Z",
  estado: "recibido",
  metodoEntrega: "despacho",
  direccion: null,
  items: [],
  subtotal: 1000,
  despacho: 0,
  total: 1000,
  metodoPago: "Webpay Plus",
  eventos: [],
};

describe("BotonBoleta", () => {
  it("no aparece mientras la boleta no esté emitida", () => {
    expect(renderToStaticMarkup(createElement(BotonBoleta, { pedido: base }))).toBe("");
    expect(renderToStaticMarkup(createElement(BotonBoleta, { pedido: { ...base, boleta: null } }))).toBe("");
  });

  it("muestra el folio cuando la boleta está lista", () => {
    const html = renderToStaticMarkup(createElement(BotonBoleta, { pedido: { ...base, boleta: { folio: 12 } } }));
    expect(html).toContain("Descargar boleta N° 12");
  });
});
