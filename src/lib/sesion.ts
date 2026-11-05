import { cookies } from "next/headers";

/**
 * Token de sesión del cliente. Vive en una cookie `HttpOnly` puesta desde el servidor de Next:
 * el JavaScript del navegador nunca lo lee ni lo guarda en `localStorage`.
 */
const COOKIE_SESION = "sedyjo_token";
const DURACION_POR_DEFECTO_S = 60 * 60 * 24 * 30;

export async function leerTokenSesion(): Promise<string | null> {
  return (await cookies()).get(COOKIE_SESION)?.value ?? null;
}

/** Guarda el token hasta su vencimiento (`expiraEn`, ISO 8601) o 30 días si no se conoce. */
export async function guardarTokenSesion(token: string, expiraEn?: string | null): Promise<void> {
  const restante = expiraEn ? Math.floor((Date.parse(expiraEn) - Date.now()) / 1000) : NaN;
  (await cookies()).set(COOKIE_SESION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Number.isFinite(restante) && restante > 0 ? restante : DURACION_POR_DEFECTO_S,
  });
}

export async function borrarTokenSesion(): Promise<void> {
  (await cookies()).delete(COOKIE_SESION);
}
