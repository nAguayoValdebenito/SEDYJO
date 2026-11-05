"use server";

import { llamar, cabecerasDeAcceso, type FalloApi } from "@/lib/data/cliente-api";
import { borrarTokenSesion, guardarTokenSesion, leerTokenSesion } from "@/lib/sesion";
import {
  erroresPorCampo,
  ingresoSchema,
  recuperacionSchema,
  registroSchema,
  restablecerSchema,
} from "@/lib/validation/auth";
import { usuarioSchema } from "@/lib/validation/schemas";
import { z } from "zod";
import type { ResultadoAuth, Usuario } from "@/types";

/**
 * Acciones de cuenta contra la API de Sedyjo. El token de sesión vive en una cookie HttpOnly
 * puesta aquí, en el servidor: el navegador solo recibe el nombre y el correo del cliente.
 * Nunca se guardan ni se registran contraseñas.
 */

const sesionRespuestaSchema = z.object({
  data: z.object({
    usuario: usuarioSchema,
    token: z.string().min(1),
    expiraEn: z.string().nullish(),
  }),
});

const errorValidacion = (campos: Record<string, string>): ResultadoAuth => ({
  ok: false,
  error: { codigo: "validacion", mensaje: "Revisa los datos marcados en rojo.", campos },
});

/** Traduce un error de la API al formato que ya usan las pantallas. */
function aErrorAuth(fallo: FalloApi): ResultadoAuth & { ok: false } {
  switch (fallo.code) {
    case "validacion":
      return {
        ok: false,
        error: {
          codigo: "validacion",
          mensaje: fallo.mensaje,
          campos: fallo.campos ?? {},
        },
      };
    case "credenciales":
      return {
        ok: false,
        error: { codigo: "credenciales", mensaje: "El correo o la contraseña no son correctos." },
      };
    case "correo_duplicado":
      return {
        ok: false,
        error: {
          codigo: "validacion",
          mensaje: "Ya existe una cuenta con este correo.",
          campos: { correo: "Ya existe una cuenta con este correo. Prueba iniciando sesión." },
        },
      };
    case "demasiados_intentos":
      return {
        ok: false,
        error: {
          codigo: "servidor",
          mensaje: "Hiciste demasiados intentos. Espera unos minutos e inténtalo otra vez.",
        },
      };
    default:
      return {
        ok: false,
        error: {
          codigo: "servidor",
          mensaje: "No pudimos conectar con el servidor. Intenta de nuevo en unos minutos.",
        },
      };
  }
}

async function abrirSesion(cuerpo: unknown): Promise<ResultadoAuth> {
  const respuesta = sesionRespuestaSchema.safeParse(cuerpo);
  if (!respuesta.success) {
    return {
      ok: false,
      error: {
        codigo: "servidor",
        mensaje: "Recibimos una respuesta inesperada. Intenta de nuevo.",
      },
    };
  }
  const { usuario, token, expiraEn } = respuesta.data.data;
  await guardarTokenSesion(token, expiraEn);
  return { ok: true, usuario };
}

export async function iniciarSesion(entrada: unknown): Promise<ResultadoAuth> {
  const validacion = ingresoSchema.safeParse(entrada);
  if (!validacion.success) return errorValidacion(erroresPorCampo(validacion.error));

  const { correo, contrasena } = validacion.data;
  const resultado = await llamar("/auth/login", {
    metodo: "POST",
    cuerpo: { correo, contrasena },
  });
  return resultado.ok ? abrirSesion(resultado.cuerpo) : aErrorAuth(resultado);
}

export async function registrarse(entrada: unknown): Promise<ResultadoAuth> {
  const validacion = registroSchema.safeParse(entrada);
  if (!validacion.success) return errorValidacion(erroresPorCampo(validacion.error));

  const { nombre, correo, contrasena, confirmar } = validacion.data;
  const resultado = await llamar("/auth/register", {
    metodo: "POST",
    cuerpo: { nombre, correo, contrasena, confirmar },
  });
  return resultado.ok ? abrirSesion(resultado.cuerpo) : aErrorAuth(resultado);
}

/** Cierra la sesión en la API y borra la cookie. Si la API no responde, igual se borra la cookie. */
export async function cerrarSesionApi(): Promise<void> {
  const sesion = await leerTokenSesion();
  if (sesion)
    await llamar("/auth/logout", { metodo: "POST", cabeceras: cabecerasDeAcceso({ sesion }) });
  await borrarTokenSesion();
}

/**
 * Consulta si la sesión sigue vigente (`GET /auth/me`). Devuelve `null` sin sesión o si venció
 * (en ese caso borra la cookie). Si la API no responde conserva la sesión y devuelve `undefined`.
 */
export async function obtenerSesion(): Promise<Usuario | null | undefined> {
  const sesion = await leerTokenSesion();
  if (!sesion) return null;

  const resultado = await llamar("/auth/me", { cabeceras: cabecerasDeAcceso({ sesion }) });
  if (!resultado.ok) {
    if (resultado.status === 401) {
      await borrarTokenSesion();
      return null;
    }
    return undefined;
  }
  const respuesta = z
    .object({ data: z.object({ usuario: usuarioSchema }) })
    .safeParse(resultado.cuerpo);
  return respuesta.success ? respuesta.data.data.usuario : undefined;
}

/**
 * Siempre responde igual exista o no la cuenta (así no se revela qué correos están registrados).
 */
export async function solicitarRecuperacion(
  entrada: unknown,
): Promise<{ ok: true } | { ok: false; campos: Record<string, string> }> {
  const validacion = recuperacionSchema.safeParse(entrada);
  if (!validacion.success) return { ok: false, campos: erroresPorCampo(validacion.error) };

  const resultado = await llamar("/auth/password/forgot", {
    metodo: "POST",
    cuerpo: { correo: validacion.data.correo },
  });
  if (resultado.ok) return { ok: true };
  if (resultado.code === "validacion") return { ok: false, campos: resultado.campos ?? {} };
  if (resultado.code === "demasiados_intentos") {
    return {
      ok: false,
      campos: { correo: "Hiciste muchos intentos. Espera un rato e inténtalo otra vez." },
    };
  }
  return {
    ok: false,
    campos: { correo: "No pudimos enviar las instrucciones ahora. Intenta de nuevo." },
  };
}

export type ResultadoRestablecer =
  | { ok: true }
  | {
      ok: false;
      motivo: "token" | "validacion" | "servidor";
      mensaje: string;
      campos?: Record<string, string>;
    };

/** Crea la contraseña nueva con el enlace del correo (el token es de un solo uso). */
export async function restablecerContrasena(entrada: unknown): Promise<ResultadoRestablecer> {
  const validacion = restablecerSchema.safeParse(entrada);
  if (!validacion.success) {
    return {
      ok: false,
      motivo: "validacion",
      mensaje: "Revisa los datos marcados en rojo.",
      campos: erroresPorCampo(validacion.error),
    };
  }

  const { token, contrasena, confirmar } = validacion.data;
  const resultado = await llamar("/auth/password/reset", {
    metodo: "POST",
    cuerpo: { token, contrasena, confirmar },
  });
  if (resultado.ok) return { ok: true };
  if (resultado.code === "token_invalido") {
    return {
      ok: false,
      motivo: "token",
      mensaje: "El enlace no es válido, venció o ya se usó. Pide uno nuevo.",
    };
  }
  if (resultado.code === "validacion") {
    return {
      ok: false,
      motivo: "validacion",
      mensaje: "Revisa los datos marcados en rojo.",
      campos: resultado.campos ?? {},
    };
  }
  return {
    ok: false,
    motivo: "servidor",
    mensaje: "No pudimos guardar tu contraseña ahora. Intenta de nuevo en unos minutos.",
  };
}
