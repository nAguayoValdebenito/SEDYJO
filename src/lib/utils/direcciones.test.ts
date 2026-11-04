import { describe, expect, it } from "vitest";
import type { DireccionGuardada } from "@/types";
import {
  MAX_DIRECCIONES,
  agregarDireccion,
  direccionPrincipal,
  editarDireccion,
  eliminarDireccion,
  marcarPrincipal,
  mismaDireccion,
} from "./direcciones";

const entrada = (calle: string) => ({
  etiqueta: "Casa",
  calle,
  numero: "100",
  comuna: "San Pedro de la Paz",
  region: "Biobío",
  referencia: null,
});

const armar = (...calles: string[]): DireccionGuardada[] =>
  calles.reduce<DireccionGuardada[]>(
    (lista, calle, i) => agregarDireccion(lista, entrada(calle), `d${i}`),
    [],
  );

describe("libreta de direcciones", () => {
  it("la primera dirección queda como principal", () => {
    const lista = armar("A");
    expect(lista[0]?.principal).toBe(true);
  });

  it("agregar otra no cambia la principal, salvo que se pida", () => {
    const lista = armar("A", "B");
    expect(direccionPrincipal(lista)?.id).toBe("d0");
    const conPrincipal = agregarDireccion(lista, entrada("C"), "d2", true);
    expect(direccionPrincipal(conPrincipal)?.id).toBe("d2");
    expect(conPrincipal.filter((d) => d.principal)).toHaveLength(1);
  });

  it("respeta el máximo de direcciones", () => {
    let lista: DireccionGuardada[] = [];
    for (let i = 0; i < MAX_DIRECCIONES + 2; i++) {
      lista = agregarDireccion(lista, entrada(`Calle ${i}`), `d${i}`);
    }
    expect(lista).toHaveLength(MAX_DIRECCIONES);
  });

  it("editar conserva el id y si es principal", () => {
    const lista = editarDireccion(armar("A", "B"), "d0", entrada("Nueva"));
    expect(lista[0]).toMatchObject({ id: "d0", calle: "Nueva", principal: true });
    expect(lista[1]?.principal).toBe(false);
  });

  it("al eliminar la principal, la primera restante pasa a serlo", () => {
    const lista = eliminarDireccion(armar("A", "B", "C"), "d0");
    expect(lista.map((d) => d.id)).toEqual(["d1", "d2"]);
    expect(direccionPrincipal(lista)?.id).toBe("d1");
  });

  it("eliminar la última deja la libreta vacía", () => {
    expect(eliminarDireccion(armar("A"), "d0")).toEqual([]);
    expect(direccionPrincipal([])).toBeNull();
  });

  it("marcar principal deja solo una", () => {
    const lista = marcarPrincipal(armar("A", "B"), "d1");
    expect(lista.filter((d) => d.principal).map((d) => d.id)).toEqual(["d1"]);
  });

  it("reconoce la misma dirección ignorando mayúsculas y espacios", () => {
    const a = {
      calle: "Los Aromos",
      numero: "1234",
      comuna: "San Pedro de la Paz",
      region: "Biobío",
    };
    expect(mismaDireccion(a, { ...a, calle: "  los  aromos " })).toBe(true);
    expect(mismaDireccion(a, { ...a, numero: "99" })).toBe(false);
  });
});
