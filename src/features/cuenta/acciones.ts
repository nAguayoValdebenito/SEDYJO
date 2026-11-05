"use server";

import { z } from "zod";
import { cabecerasDeAcceso, llamar, type FalloApi } from "@/lib/data/cliente-api";
import { borrarTokenSesion, leerTokenSesion } from "@/lib/sesion";
import { erroresPorCampo } from "@/lib/validation/auth";
import { contrasenaSchema, direccionSchema, perfilSchema } from "@/lib/validation/cuenta";
import { usuarioSchema } from "@/lib/validation/schemas";
import type { EntradaDireccion } from "@/lib/validation/cuenta";
import type { DireccionGuardada, ResultadoOperacion, Usuario } from "@/types";

/**
 * Acciones de cuenta contra la API de Sedyjo (perfil, contraseña y direcciones). La identidad sale
 * siempre de la cookie de sesión; nunca se envía un `usuarioId`. Nunca se guardan ni se registran
 * contraseñas.
 */

const errorDeValidacion = (campos: Record<string, string>): ResultadoOperacion<never> => ({
  ok: false,
  error: { codigo: "validacion", mensaje: "Revisa los datos marcados en rojo.", campos },
});

const sinSesion: ResultadoOperacion<never> = {
  ok: false,
  error: { codigo: "sesion", mensaje: "Tu sesión venció. Inicia sesión de nuevo." },
};

/** Convierte un error de la API en el resultado que entienden las pantallas. */
async function aError(fallo: FalloApi): Promise<ResultadoOperacion<never>> {
  switch (fallo.code) {
    case "no_autenticado":
    case "sesion_expirada":
      await borrarTokenSesion();
      return sinSesion;
    case "validacion":
      return errorDeValidacion(fallo.campos ?? {});
    case "credenciales":
      return {
        ok: false,
        error: {
          codigo: "credenciales",
          mensaje: "La contraseña no es correcta.",
          campos: {
            actual: "La contraseña actual no es correcta.",
            contrasena: "La contraseña no es correcta.",
          },
        },
      };
    case "contrasena_requerida":
      return errorDeValidacion({
        contrasena: "Escribe tu contraseña actual para cambiar el correo.",
      });
    case "correo_duplicado":
      return errorDeValidacion({ correo: "Ya existe una cuenta con este correo." });
    case "limite_direcciones":
      return {
        ok: false,
        error: {
          codigo: "validacion",
          mensaje: "Ya tienes 5 direcciones guardadas. Elimina una para agregar otra.",
        },
      };
    case "direccion_duplicada":
      return {
        ok: false,
        error: { codigo: "validacion", mensaje: "Ya guardaste esa dirección." },
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
          mensaje: "No pudimos completar la operación. Intenta de nuevo en unos minutos.",
        },
      };
  }
}

async function acceso() {
  const sesion = await leerTokenSesion();
  return sesion ? cabecerasDeAcceso({ sesion }) : null;
}

export async function actualizarPerfil(
  entrada: unknown,
): Promise<ResultadoOperacion<Pick<Usuario, "nombre" | "correo">>> {
  const validacion = perfilSchema.safeParse(entrada);
  if (!validacion.success) return errorDeValidacion(erroresPorCampo(validacion.error));
  const cabeceras = await acceso();
  if (!cabeceras) return sinSesion;

  const { nombre, correo, contrasena } = validacion.data;
  const resultado = await llamar("/me", {
    metodo: "PATCH",
    cuerpo: { nombre, correo, ...(contrasena ? { contrasena } : {}) },
    cabeceras,
  });
  if (!resultado.ok) return aError(resultado);

  const respuesta = z
    .object({ data: z.object({ usuario: usuarioSchema }) })
    .safeParse(resultado.cuerpo);
  if (!respuesta.success) return aError({ ...resultado, ok: false } as never);
  const { usuario } = respuesta.data.data;
  return { ok: true, datos: { nombre: usuario.nombre, correo: usuario.correo } };
}

/** Cambia la contraseña. La API cierra las demás sesiones; la actual sigue abierta. */
export async function cambiarContrasena(entrada: unknown): Promise<ResultadoOperacion<null>> {
  const validacion = contrasenaSchema.safeParse(entrada);
  if (!validacion.success) return errorDeValidacion(erroresPorCampo(validacion.error));
  const cabeceras = await acceso();
  if (!cabeceras) return sinSesion;

  const { actual, nueva, confirmar } = validacion.data;
  const resultado = await llamar("/me/password", {
    metodo: "POST",
    cuerpo: { actual, nueva, confirmar },
    cabeceras,
  });
  return resultado.ok ? { ok: true, datos: null } : aError(resultado);
}

// ---- direcciones

const direccionApiSchema = z.object({
  id: z.string(),
  etiqueta: z.string(),
  calle: z.string(),
  numero: z.string(),
  comuna: z.string(),
  region: z.string(),
  referencia: z.string().nullish(),
  principal: z.boolean(),
});
const listaDireccionesSchema = z.object({ data: z.array(direccionApiSchema) });

function aDirecciones(cuerpo: unknown): DireccionGuardada[] | null {
  const respuesta = listaDireccionesSchema.safeParse(cuerpo);
  if (!respuesta.success) return null;
  return respuesta.data.data.map((d) => ({ ...d, referencia: d.referencia ?? null }));
}

const falloInesperado: ResultadoOperacion<never> = {
  ok: false,
  error: { codigo: "servidor", mensaje: "Recibimos una respuesta inesperada. Intenta de nuevo." },
};

/** Direcciones guardadas del cliente (la principal va primero). */
export async function obtenerDirecciones(): Promise<ResultadoOperacion<DireccionGuardada[]>> {
  const cabeceras = await acceso();
  if (!cabeceras) return sinSesion;
  const resultado = await llamar("/me/addresses", { cabeceras });
  if (!resultado.ok) return aError(resultado);
  const lista = aDirecciones(resultado.cuerpo);
  return lista ? { ok: true, datos: lista } : falloInesperado;
}

/** Valida una dirección antes de enviarla (mismas reglas del formulario). */
export async function validarDireccion(
  entrada: unknown,
): Promise<ResultadoOperacion<EntradaDireccion>> {
  const resultado = direccionSchema.safeParse(entrada);
  if (!resultado.success) return errorDeValidacion(erroresPorCampo(resultado.error));
  return { ok: true, datos: resultado.data };
}

type EntradaGuardar = Omit<DireccionGuardada, "id" | "principal">;

/** Agrega (sin `id`) o edita (con `id`) una dirección y devuelve la lista actualizada. */
export async function guardarDireccion(
  entrada: EntradaGuardar,
  opciones: { id?: string; principal?: boolean } = {},
): Promise<ResultadoOperacion<DireccionGuardada[]>> {
  const validacion = direccionSchema.safeParse({
    ...entrada,
    referencia: entrada.referencia ?? "",
  });
  if (!validacion.success) return errorDeValidacion(erroresPorCampo(validacion.error));
  const cabeceras = await acceso();
  if (!cabeceras) return sinSesion;

  const { referencia, ...resto } = validacion.data;
  const cuerpo = {
    ...resto,
    referencia: referencia || null,
    ...(opciones.principal ? { principal: true } : {}),
  };
  const resultado = opciones.id
    ? await llamar(`/me/addresses/${encodeURIComponent(opciones.id)}`, {
        metodo: "PATCH",
        cuerpo,
        cabeceras,
      })
    : await llamar("/me/addresses", { metodo: "POST", cuerpo, cabeceras });
  if (!resultado.ok) return aError(resultado);
  return obtenerDirecciones();
}

export async function eliminarDireccion(
  id: string,
): Promise<ResultadoOperacion<DireccionGuardada[]>> {
  const cabeceras = await acceso();
  if (!cabeceras) return sinSesion;
  const resultado = await llamar(`/me/addresses/${encodeURIComponent(id)}`, {
    metodo: "DELETE",
    cabeceras,
  });
  return resultado.ok ? obtenerDirecciones() : aError(resultado);
}

export async function marcarDireccionPrincipal(
  id: string,
): Promise<ResultadoOperacion<DireccionGuardada[]>> {
  const cabeceras = await acceso();
  if (!cabeceras) return sinSesion;
  const resultado = await llamar(`/me/addresses/${encodeURIComponent(id)}/primary`, {
    metodo: "POST",
    cabeceras,
  });
  if (!resultado.ok) return aError(resultado);
  return obtenerDirecciones();
}
