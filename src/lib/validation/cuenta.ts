import { z } from "zod";
import { correoSchema } from "./auth";

/**
 * Validación de los formularios de la cuenta (perfil, contraseña y direcciones). Se usa en el
 * navegador y otra vez en el servidor: nunca se confía solo en lo que valida el cliente.
 */

export const perfilSchema = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre (al menos 2 letras)."),
  correo: correoSchema,
});

export const contrasenaSchema = z
  .object({
    actual: z.string().min(1, "Escribe tu contraseña actual."),
    nueva: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .regex(/[A-Za-z]/, "Incluye al menos una letra.")
      .regex(/\d/, "Incluye al menos un número."),
    confirmar: z.string().min(1, "Repite la nueva contraseña."),
  })
  .refine((d) => d.nueva === d.confirmar, {
    path: ["confirmar"],
    message: "Las contraseñas no coinciden.",
  })
  .refine((d) => d.nueva !== d.actual, {
    path: ["nueva"],
    message: "La nueva contraseña debe ser distinta de la actual.",
  });

export const direccionSchema = z.object({
  etiqueta: z
    .string()
    .trim()
    .min(2, "Ponle un nombre corto (por ejemplo Casa).")
    .max(30, "Usa un nombre de hasta 30 letras."),
  calle: z.string().trim().min(2, "Escribe la calle."),
  numero: z.string().trim().min(1, "Escribe el número."),
  comuna: z.string().trim().min(2, "Escribe la comuna."),
  region: z.string().trim().min(2, "Escribe la región."),
  referencia: z.string().trim().max(120, "Usa hasta 120 caracteres.").default(""),
});

export type EntradaDireccion = z.infer<typeof direccionSchema>;
