import { describe, expect, it } from "vitest";
import { contrasenaSchema, direccionSchema, perfilSchema } from "./cuenta";

describe("perfilSchema", () => {
  it("acepta nombre y correo válidos", () => {
    expect(perfilSchema.safeParse({ nombre: "Ana Pérez", correo: "ana@correo.cl" }).success).toBe(
      true,
    );
  });
  it("rechaza nombre corto y correo mal escrito", () => {
    const r = perfilSchema.safeParse({ nombre: "A", correo: "mal" });
    expect(r.success).toBe(false);
  });
});

describe("contrasenaSchema", () => {
  const ok = { actual: "Vieja1234", nueva: "Nueva1234", confirmar: "Nueva1234" };
  it("acepta un cambio válido", () => expect(contrasenaSchema.safeParse(ok).success).toBe(true));
  it("exige letra, número y 8 caracteres", () => {
    expect(
      contrasenaSchema.safeParse({ ...ok, nueva: "corta1", confirmar: "corta1" }).success,
    ).toBe(false);
    expect(
      contrasenaSchema.safeParse({ ...ok, nueva: "sololetras", confirmar: "sololetras" }).success,
    ).toBe(false);
    expect(
      contrasenaSchema.safeParse({ ...ok, nueva: "12345678", confirmar: "12345678" }).success,
    ).toBe(false);
  });
  it("exige que la confirmación coincida y que sea distinta de la actual", () => {
    expect(contrasenaSchema.safeParse({ ...ok, confirmar: "Otra12345" }).success).toBe(false);
    expect(
      contrasenaSchema.safeParse({ ...ok, nueva: "Vieja1234", confirmar: "Vieja1234" }).success,
    ).toBe(false);
  });
});

describe("direccionSchema", () => {
  const ok = {
    etiqueta: "Casa",
    calle: "Los Aromos",
    numero: "1234",
    comuna: "San Pedro de la Paz",
    region: "Biobío",
  };
  it("acepta una dirección completa y deja la referencia vacía por defecto", () => {
    const r = direccionSchema.safeParse(ok);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.referencia).toBe("");
  });
  it("rechaza campos obligatorios vacíos", () => {
    expect(direccionSchema.safeParse({ ...ok, calle: "" }).success).toBe(false);
    expect(direccionSchema.safeParse({ ...ok, etiqueta: "" }).success).toBe(false);
  });
});
