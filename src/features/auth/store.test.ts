import { beforeEach, describe, expect, it, vi } from "vitest";

// La acción del servidor usa cookies: en la prueba se reemplaza por una función vacía.
const cerrarSesionApi = vi.hoisted(() => vi.fn(async () => undefined));
vi.mock("./acciones", () => ({ cerrarSesionApi }));

import { useSesion } from "./store";

const ana = { id: "u-1", nombre: "Ana", correo: "ana@ejemplo.cl" };

beforeEach(() => {
  cerrarSesionApi.mockClear();
  useSesion.setState({ usuario: null, verificada: false });
});

describe("sesión del cliente", () => {
  it("empieza sin sesión y sin confirmar con el servidor", () => {
    expect(useSesion.getState().usuario).toBeNull();
    expect(useSesion.getState().verificada).toBe(false);
  });

  it("inicia sesión y queda confirmada", () => {
    useSesion.getState().iniciarSesion(ana);
    expect(useSesion.getState().usuario).toEqual(ana);
    expect(useSesion.getState().verificada).toBe(true);
  });

  it("al cerrar sesión avisa al servidor para borrar la cookie", () => {
    useSesion.getState().iniciarSesion(ana);
    useSesion.getState().cerrarSesion();
    expect(useSesion.getState().usuario).toBeNull();
    expect(cerrarSesionApi).toHaveBeenCalledTimes(1);
  });

  it("si la sesión venció solo olvida al cliente en este navegador", () => {
    useSesion.getState().iniciarSesion(ana);
    useSesion.getState().olvidarUsuario();
    expect(useSesion.getState().usuario).toBeNull();
    expect(cerrarSesionApi).not.toHaveBeenCalled();
  });

  it("confirma la sesión con lo que responde el servidor", () => {
    useSesion.getState().iniciarSesion(ana);
    useSesion.getState().confirmarSesion(null);
    expect(useSesion.getState().usuario).toBeNull();
    expect(useSesion.getState().verificada).toBe(true);
  });

  it("actualiza el nombre del cliente", () => {
    useSesion.getState().iniciarSesion(ana);
    useSesion.getState().actualizarUsuario({ nombre: "Ana María" });
    expect(useSesion.getState().usuario?.nombre).toBe("Ana María");
  });
});
