import { describe, expect, it } from "vitest";
import { erroresPorCampo, ingresoSchema, registroSchema } from "./auth";

describe("ingresoSchema", () => {
  it("acepta un correo y una contraseña", () => {
    expect(ingresoSchema.safeParse({ correo: " ana@ejemplo.cl ", contrasena: "x" }).success).toBe(
      true,
    );
  });

  it("avisa por campo cuando faltan datos", () => {
    const r = ingresoSchema.safeParse({ correo: "ana", contrasena: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const errores = erroresPorCampo(r.error);
      expect(errores.correo).toMatch(/correo/i);
      expect(errores.contrasena).toMatch(/contraseña/i);
    }
  });
});

describe("registroSchema", () => {
  const valido = {
    nombre: "Ana",
    correo: "ana@ejemplo.cl",
    contrasena: "clave1234",
    confirmar: "clave1234",
  };

  it("acepta datos válidos", () => {
    expect(registroSchema.safeParse(valido).success).toBe(true);
  });

  it("exige contraseña con letra, número y 8 caracteres", () => {
    for (const mala of ["corta1", "sololetras", "12345678"]) {
      expect(
        registroSchema.safeParse({ ...valido, contrasena: mala, confirmar: mala }).success,
      ).toBe(false);
    }
  });

  it("marca la confirmación cuando no coincide", () => {
    const r = registroSchema.safeParse({ ...valido, confirmar: "otra1234" });
    expect(r.success).toBe(false);
    if (!r.success) expect(erroresPorCampo(r.error).confirmar).toMatch(/no coinciden/);
  });
});
