"use server";

import { erroresPorCampo } from "@/lib/validation/auth";
import { contrasenaSchema, direccionSchema, perfilSchema } from "@/lib/validation/cuenta";
import type { EntradaDireccion } from "@/lib/validation/cuenta";
import type { ResultadoOperacion, Usuario } from "@/types";

/**
 * Acciones de cuenta SIMULADAS (perfil, contraseña y direcciones). Hacen de "API": validan en el
 * servidor y responden con éxito o con errores por campo, para que las pantallas tengan estados
 * de carga y de error reales. Nunca guardan ni registran contraseñas. Cuando exista el backend,
 * el interior de estas funciones llamará a su API.
 *
 * Atajos de prueba:
 * - Perfil: usar `error@sedyjo.cl` como correo simula una falla del servidor; usar
 *   `bloqueado@sedyjo.cl` o `demo@sedyjo.cl` (de otra cuenta) responde "ya existe una cuenta".
 * - Contraseña: la contraseña actual `incorrecta` simula credenciales inválidas.
 */

const DEMORA_MS = 600;
const pausa = () => new Promise((resolver) => setTimeout(resolver, DEMORA_MS));

const errorDeValidacion = (campos: Record<string, string>): ResultadoOperacion<never> => ({
  ok: false,
  error: { codigo: "validacion", mensaje: "Revisa los datos marcados en rojo.", campos },
});

export async function actualizarPerfil(
  entrada: unknown,
  usuarioActual: Pick<Usuario, "id" | "correo">,
): Promise<ResultadoOperacion<Pick<Usuario, "nombre" | "correo">>> {
  await pausa();

  const resultado = perfilSchema.safeParse(entrada);
  if (!resultado.success) return errorDeValidacion(erroresPorCampo(resultado.error));

  const { nombre } = resultado.data;
  const correo = resultado.data.correo.toLowerCase();
  const cambioDeCorreo = correo !== usuarioActual.correo.toLowerCase();

  if (cambioDeCorreo && correo === "error@sedyjo.cl") {
    return {
      ok: false,
      error: {
        codigo: "servidor",
        mensaje: "No pudimos guardar tus datos ahora. Intenta de nuevo en unos minutos.",
      },
    };
  }
  if (
    cambioDeCorreo &&
    (correo === "bloqueado@sedyjo.cl" ||
      (correo === "demo@sedyjo.cl" && usuarioActual.id !== "u-demo"))
  ) {
    return errorDeValidacion({ correo: "Ya existe una cuenta con este correo." });
  }

  return { ok: true, datos: { nombre, correo } };
}

export async function cambiarContrasena(entrada: unknown): Promise<ResultadoOperacion<null>> {
  await pausa();

  const resultado = contrasenaSchema.safeParse(entrada);
  if (!resultado.success) return errorDeValidacion(erroresPorCampo(resultado.error));

  if (resultado.data.actual === "incorrecta") {
    return {
      ok: false,
      error: {
        codigo: "credenciales",
        mensaje: "La contraseña actual no es correcta.",
        campos: { actual: "La contraseña actual no es correcta." },
      },
    };
  }

  return { ok: true, datos: null };
}

/** Valida y normaliza una dirección antes de guardarla en la libreta. */
export async function validarDireccion(
  entrada: unknown,
): Promise<ResultadoOperacion<EntradaDireccion>> {
  await pausa();

  const resultado = direccionSchema.safeParse(entrada);
  if (!resultado.success) return errorDeValidacion(erroresPorCampo(resultado.error));
  return { ok: true, datos: resultado.data };
}
