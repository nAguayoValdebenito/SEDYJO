import { describe, expect, it } from "vitest";
import type { CampanaModal } from "@/types";
import { debeMostrarse, estaVigente, rutaPermiteModal } from "./logica";

const HORA = 3_600_000;
const ahora = Date.parse("2026-11-10T12:00:00-03:00");

const campana: CampanaModal = {
  id: "c-1",
  activo: true,
  tipo: "galeria",
  vigenciaHasta: "2026-12-31T23:59:59-03:00",
  frecuenciaHoras: 24,
  retrasoSegundos: 4,
  slides: [{ id: "s-1", imagen: null, titulo: "Oferta", texto: "Texto", boton: null }],
};

const base = { campana, ahora, ultimoCierre: null, vistaEnSesion: false, pathname: "/" };

describe("rutaPermiteModal", () => {
  it("bloquea carrito, pago y cuenta", () => {
    for (const ruta of [
      "/carrito",
      "/checkout",
      "/checkout/exito",
      "/cuenta",
      "/cuenta/pedidos",
      "/ingresar",
      "/registro",
    ]) {
      expect(rutaPermiteModal(ruta)).toBe(false);
    }
  });

  it("permite el resto de las páginas", () => {
    for (const ruta of ["/", "/ofertas", "/categoria/bebidas", "/buscar", "/cuentas-de-ahorro"]) {
      expect(rutaPermiteModal(ruta)).toBe(true);
    }
  });
});

describe("estaVigente", () => {
  it("sin fecha límite siempre vigente", () => {
    expect(estaVigente({ vigenciaHasta: null }, ahora)).toBe(true);
  });

  it("deja de ser vigente al pasar la fecha", () => {
    expect(estaVigente(campana, ahora)).toBe(true);
    expect(estaVigente(campana, Date.parse("2027-01-01T00:00:00-03:00"))).toBe(false);
  });
});

describe("debeMostrarse", () => {
  it("se muestra con la campaña activa y vigente", () => {
    expect(debeMostrarse(base)).toBe(true);
  });

  it("no se muestra si el administrador la apagó o no tiene diapositivas", () => {
    expect(debeMostrarse({ ...base, campana: { ...campana, activo: false } })).toBe(false);
    expect(debeMostrarse({ ...base, campana: { ...campana, slides: [] } })).toBe(false);
  });

  it("no se muestra vencida", () => {
    expect(debeMostrarse({ ...base, ahora: Date.parse("2027-02-01T00:00:00-03:00") })).toBe(false);
  });

  it("no se repite en la misma sesión", () => {
    expect(debeMostrarse({ ...base, vistaEnSesion: true })).toBe(false);
  });

  it("respeta la frecuencia tras cerrarlo", () => {
    expect(debeMostrarse({ ...base, ultimoCierre: ahora - 2 * HORA })).toBe(false);
    expect(debeMostrarse({ ...base, ultimoCierre: ahora - 25 * HORA })).toBe(true);
  });

  it("no aparece en las páginas de compra ni de cuenta", () => {
    expect(debeMostrarse({ ...base, pathname: "/carrito" })).toBe(false);
    expect(debeMostrarse({ ...base, pathname: "/cuenta/pedidos" })).toBe(false);
  });
});
