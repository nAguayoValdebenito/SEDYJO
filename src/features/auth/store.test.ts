import { beforeEach, describe, expect, it } from "vitest";
import { useSesion } from "./store";

const ana = { id: "u-1", nombre: "Ana", correo: "ana@ejemplo.cl" };

beforeEach(() => {
  useSesion.setState({ usuario: null });
});

describe("sesión simulada", () => {
  it("empieza sin sesión", () => {
    expect(useSesion.getState().usuario).toBeNull();
  });

  it("inicia y cierra sesión", () => {
    useSesion.getState().iniciarSesion(ana);
    expect(useSesion.getState().usuario).toEqual(ana);
    useSesion.getState().cerrarSesion();
    expect(useSesion.getState().usuario).toBeNull();
  });
});
