import { z } from "zod";
import { erroresPorCampo } from "./auth";

const telefonoChileno = /^(?:\+?56\s?)?9(?:[\s-]?\d){8}$/;

export const checkoutSchema = z
  .object({
    nombre: z.string().trim().min(2, "Escribe tu nombre (al menos 2 letras)."),
    correo: z.string().trim().email("Escribe un correo válido."),
    telefono: z.string().trim().regex(telefonoChileno, "Escribe un celular chileno de 9 dígitos."),
    metodoEntrega: z.literal("despacho"),
    calle: z.string().trim(),
    numero: z.string().trim(),
    comuna: z.string().trim(),
    region: z.string().trim(),
    referencia: z.string().trim(),
    metodoPago: z.literal("webpay"),
    usuarioId: z.string().nullable(),
  })
  .superRefine((datos, contexto) => {
    for (const campo of ["calle", "numero", "comuna", "region"] as const) {
      if (!datos[campo]) {
        contexto.addIssue({
          code: "custom",
          path: [campo],
          message: `Escribe ${campo === "numero" ? "el número" : campo === "region" ? "la región" : `la ${campo}`}.`,
        });
      }
    }
  });

export const itemsCheckoutSchema = z
  .array(z.object({ productoId: z.string().min(1), cantidad: z.number().int().positive() }))
  .min(1, "Agrega un producto antes de pagar.");

export { erroresPorCampo as erroresCheckoutPorCampo };
