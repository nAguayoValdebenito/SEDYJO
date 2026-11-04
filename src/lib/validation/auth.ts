import { z } from "zod";

/**
 * Validación de los formularios de cuenta. Se usa en el navegador (para avisar al instante) y
 * otra vez en el servidor: nunca se confía solo en lo que valida el cliente.
 */

const correo = z
  .string()
  .trim()
  .min(1, "Escribe tu correo.")
  .email("Revisa el correo: debe verse como nombre@dominio.cl.");

export const correoSchema = correo;

export const seguimientoSchema = z.object({
  numero: z.string().trim().min(1, "Escribe el número de pedido."),
  correo,
});

export const ingresoSchema = z.object({
  correo,
  contrasena: z.string().min(1, "Escribe tu contraseña."),
});

export const registroSchema = z
  .object({
    nombre: z.string().trim().min(2, "Escribe tu nombre (al menos 2 letras)."),
    correo,
    contrasena: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .regex(/[A-Za-z]/, "Incluye al menos una letra.")
      .regex(/\d/, "Incluye al menos un número."),
    confirmar: z.string().min(1, "Repite tu contraseña."),
  })
  .refine((datos) => datos.contrasena === datos.confirmar, {
    path: ["confirmar"],
    message: "Las contraseñas no coinciden.",
  });

export const recuperacionSchema = z.object({ correo });

export type DatosIngreso = z.infer<typeof ingresoSchema>;
export type DatosRegistro = z.infer<typeof registroSchema>;

/** Primer mensaje de error por campo, listo para mostrar junto a cada campo. */
export function erroresPorCampo(error: z.ZodError): Record<string, string> {
  const campos: Record<string, string> = {};
  for (const problema of error.issues) {
    const campo = String(problema.path[0] ?? "formulario");
    if (!(campo in campos)) campos[campo] = problema.message;
  }
  return campos;
}
