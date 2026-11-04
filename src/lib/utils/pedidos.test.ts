import { describe, expect, it } from "vitest";
import type { Pedido } from "@/types";
import {
  estadosDelFlujo,
  ordenarPedidos,
  pasosDelPedido,
  productosComprados,
  totalUnidades,
} from "./pedidos";

function pedido(parcial: Partial<Pedido> & Pick<Pedido, "id">): Pedido {
  return {
    numero: parcial.id,
    usuarioId: "u",
    correo: "a@a.cl",
    fecha: "2026-10-01T10:00:00-03:00",
    estado: "recibido",
    metodoEntrega: "despacho",
    direccion: null,
    items: [],
    subtotal: 0,
    despacho: 0,
    total: 0,
    metodoPago: "x",
    eventos: [],
    ...parcial,
  };
}

const item = (productoId: string, cantidad: number) => ({
  productoId,
  slug: productoId,
  nombre: productoId,
  precio: 1000,
  cantidad,
  imagen: null,
  fondo: "#fff",
});

describe("estadosDelFlujo", () => {
  it("el flujo siempre termina en 'en camino' y 'entregado' (solo se despacha)", () => {
    expect(estadosDelFlujo()).toEqual(["recibido", "preparando", "en-camino", "entregado"]);
  });
});

describe("pasosDelPedido", () => {
  const eventos = [
    {
      estado: "recibido" as const,
      fecha: "2026-10-29T09:00:00-03:00",
      detalle: "Recibimos tu pedido",
    },
    {
      estado: "preparando" as const,
      fecha: "2026-10-29T11:30:00-03:00",
      detalle: "Estamos armando tu pedido",
    },
  ];

  it("marca hechos, el actual y los pendientes", () => {
    const pasos = pasosDelPedido({ estado: "preparando", eventos });
    expect(pasos.map((p) => p.situacion)).toEqual(["hecho", "actual", "pendiente", "pendiente"]);
    expect(pasos[1]?.fecha).toBe("2026-10-29T11:30:00-03:00");
    expect(pasos[2]?.fecha).toBeNull();
  });

  it("un pedido entregado deja todos los pasos hechos", () => {
    const pasos = pasosDelPedido({ estado: "entregado", eventos });
    expect(pasos.every((p) => p.situacion === "hecho")).toBe(true);
  });
});

describe("productosComprados", () => {
  const pedidos = [
    pedido({
      id: "a",
      fecha: "2026-10-01T10:00:00-03:00",
      items: [item("leche", 2), item("pan", 1)],
    }),
    pedido({ id: "b", fecha: "2026-10-20T10:00:00-03:00", items: [item("leche", 3)] }),
    pedido({ id: "c", estado: "cancelado", items: [item("pan", 9)] }),
  ];

  it("suma entre pedidos, ignora cancelados y ordena por unidades", () => {
    const r = productosComprados(pedidos);
    expect(r.map((p) => [p.productoId, p.unidades, p.pedidos])).toEqual([
      ["leche", 5, 2],
      ["pan", 1, 1],
    ]);
    expect(r[0]?.ultimaCompra).toBe("2026-10-20T10:00:00-03:00");
  });
});

describe("utilidades", () => {
  it("cuenta unidades", () => {
    expect(totalUnidades([item("a", 2), item("b", 3)])).toBe(5);
  });

  it("ordena del más reciente al más antiguo", () => {
    const r = ordenarPedidos([
      pedido({ id: "viejo", fecha: "2026-01-01T00:00:00-03:00" }),
      pedido({ id: "nuevo", fecha: "2026-09-01T00:00:00-03:00" }),
    ]);
    expect(r.map((p) => p.id)).toEqual(["nuevo", "viejo"]);
  });
});
