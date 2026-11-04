import { describe, expect, it } from "vitest";
import { formatoFecha, formatoFechaHora, formatoPrecio, porcentajeDescuento } from "./format";

describe("formatoPrecio", () => {
  it("formatea pesos chilenos con punto de miles", () => {
    expect(formatoPrecio(12490).replace(/\s/g, "")).toBe("$12.490");
  });
});

describe("porcentajeDescuento", () => {
  it("calcula el descuento redondeado", () => {
    expect(porcentajeDescuento(1890, 2390)).toBe(21);
  });

  it("devuelve null sin precio anterior o sin rebaja", () => {
    expect(porcentajeDescuento(1090, null)).toBeNull();
    expect(porcentajeDescuento(1090, 1090)).toBeNull();
  });
});

describe("fechas", () => {
  it("formatea en español y hora de Chile", () => {
    expect(formatoFecha("2026-09-18T16:20:00-03:00")).toMatch(/18 de septiembre de 2026/);
    expect(formatoFechaHora("2026-09-18T16:20:00-03:00")).toMatch(/16:20/);
  });
});
