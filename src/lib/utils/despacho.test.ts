import { describe, expect, it } from "vitest";
import { progresoDespacho } from "./despacho";

describe("progresoDespacho", () => {
  it("calcula lo que falta y el avance", () => {
    expect(progresoDespacho(10000, 40000)).toEqual({
      faltante: 30000,
      avance: 0.25,
      completo: false,
    });
  });

  it("queda completo al alcanzar o superar el monto", () => {
    expect(progresoDespacho(40000, 40000).completo).toBe(true);
    expect(progresoDespacho(55000, 40000)).toEqual({ faltante: 0, avance: 1, completo: true });
  });

  it("con carrito vacío el avance es 0", () => {
    expect(progresoDespacho(0, 40000).avance).toBe(0);
  });
});
