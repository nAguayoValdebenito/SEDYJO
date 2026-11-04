"use server";

import {
  erroresPorCampo,
  ingresoSchema,
  recuperacionSchema,
  registroSchema,
} from "@/lib/validation/auth";
import type { ResultadoAuth, Usuario } from "@/types";

/**
 * Acciones de cuenta SIMULADAS: hacen de "API" para que el frontend tenga un contrato real
 * (validación en el servidor, estados de carga y de error) sin backend. No guardan ni registran
 * contraseñas. Cuando exista el backend, el interior de estas funciones llamará a su API.
 *
 * Cuenta demo: demo@sedyjo.cl (con cualquier contraseña válida) tiene pedidos de ejemplo.
 * Cualquier otro correo válido entra como cliente nuevo, sin pedidos.
 * error@sedyjo.cl simula una falla del servidor y bloqueado@sedyjo.cl, credenciales inválidas.
 */

const DEMORA_MS = 700;
const pausa = () => new Promise((resolver) => setTimeout(resolver, DEMORA_MS));

const CUENTA_DEMO: Usuario = { id: "u-demo", nombre: "Ana Pérez", correo: "demo@sedyjo.cl" };

function idDesdeCorreo(correo: string): string {
  let suma = 0;
  for (const caracter of correo) suma = (suma * 31 + caracter.charCodeAt(0)) >>> 0;
  return `u-${suma.toString(36)}`;
}

function nombreDesdeCorreo(correo: string): string {
  const local = correo.split("@")[0] ?? "";
  const nombre = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
  return nombre || "Cliente";
}

const errorValidacion = (campos: Record<string, string>): ResultadoAuth => ({
  ok: false,
  error: { codigo: "validacion", mensaje: "Revisa los datos marcados en rojo.", campos },
});

export async function iniciarSesion(entrada: unknown): Promise<ResultadoAuth> {
  await pausa();

  const resultado = ingresoSchema.safeParse(entrada);
  if (!resultado.success) return errorValidacion(erroresPorCampo(resultado.error));

  const correo = resultado.data.correo.toLowerCase();

  if (correo === "error@sedyjo.cl") {
    return {
      ok: false,
      error: {
        codigo: "servidor",
        mensaje: "No pudimos conectar con el servidor. Intenta de nuevo en unos minutos.",
      },
    };
  }
  if (correo === "bloqueado@sedyjo.cl") {
    return {
      ok: false,
      error: { codigo: "credenciales", mensaje: "El correo o la contraseña no son correctos." },
    };
  }
  if (correo === CUENTA_DEMO.correo) return { ok: true, usuario: CUENTA_DEMO };

  return {
    ok: true,
    usuario: { id: idDesdeCorreo(correo), nombre: nombreDesdeCorreo(correo), correo },
  };
}

export async function registrarse(entrada: unknown): Promise<ResultadoAuth> {
  await pausa();

  const resultado = registroSchema.safeParse(entrada);
  if (!resultado.success) return errorValidacion(erroresPorCampo(resultado.error));

  const { nombre, correo } = resultado.data;
  const correoNormal = correo.toLowerCase();

  if (correoNormal === CUENTA_DEMO.correo || correoNormal === "bloqueado@sedyjo.cl") {
    return errorValidacion({
      correo: "Ya existe una cuenta con este correo. Prueba iniciando sesión.",
    });
  }
  if (correoNormal === "error@sedyjo.cl") {
    return {
      ok: false,
      error: {
        codigo: "servidor",
        mensaje: "No pudimos crear tu cuenta ahora. Intenta de nuevo en unos minutos.",
      },
    };
  }

  return { ok: true, usuario: { id: idDesdeCorreo(correoNormal), nombre, correo: correoNormal } };
}

/**
 * Siempre responde igual exista o no la cuenta (así no se revela qué correos están registrados).
 */
export async function solicitarRecuperacion(
  entrada: unknown,
): Promise<{ ok: true } | { ok: false; campos: Record<string, string> }> {
  await pausa();

  const resultado = recuperacionSchema.safeParse(entrada);
  if (!resultado.success) return { ok: false, campos: erroresPorCampo(resultado.error) };
  return { ok: true };
}
