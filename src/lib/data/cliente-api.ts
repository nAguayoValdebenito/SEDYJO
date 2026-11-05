import { URL_API } from "@/lib/config";
import type { ProblemaCotizacion } from "@/types";

/**
 * Cliente común de la API de Sedyjo (solo servidor). Las llamadas con tokens de sesión o de
 * pedido se hacen siempre desde acciones del servidor de Next, nunca desde el navegador, y no se
 * guardan en caché.
 */

export type FalloApi = {
  ok: false;
  /** 0 si no hubo respuesta (red caída o tiempo agotado). */
  status: number;
  code: string | null;
  mensaje: string;
  campos?: Record<string, string>;
  problemas?: ProblemaCotizacion[];
};

export type ResultadoApi<T> = { ok: true; data: T } | FalloApi;

export type Credenciales = {
  /** Token de sesión del cliente (`Authorization: Bearer`). */
  sesion?: string | null;
  /** Token de acceso del pedido (`X-Order-Token`), para invitados. */
  pedido?: string | null;
};

type Metodo = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export async function llamar(
  ruta: string,
  opciones: { metodo?: Metodo; cuerpo?: unknown; cabeceras?: Record<string, string> } = {},
): Promise<{ ok: true; cuerpo: unknown } | FalloApi> {
  try {
    const respuesta = await fetch(`${URL_API}/api/v1${ruta}`, {
      method: opciones.metodo ?? "GET",
      headers: {
        Accept: "application/json",
        ...(opciones.cuerpo !== undefined ? { "Content-Type": "application/json" } : {}),
        ...opciones.cabeceras,
      },
      body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    // Un 204 no trae cuerpo.
    const cuerpo: unknown = await respuesta.json().catch(() => null);
    if (respuesta.ok) return { ok: true, cuerpo };

    const error = (cuerpo && typeof cuerpo === "object" ? cuerpo : {}) as {
      error?: string;
      code?: string;
      fields?: Record<string, string>;
      items?: {
        productoId: string;
        codigo: ProblemaCotizacion["codigo"];
        disponible?: number | null;
      }[];
    };
    return {
      ok: false,
      status: respuesta.status,
      code: error.code ?? null,
      mensaje: error.error ?? "No pudimos completar la operación.",
      campos: error.fields,
      problemas: error.items?.map((p) => ({
        productoId: p.productoId,
        codigo: p.codigo,
        disponible: p.disponible ?? null,
      })),
    };
  } catch {
    return {
      ok: false,
      status: 0,
      code: "sin_conexion",
      mensaje: "No pudimos conectar con el servidor. Intenta de nuevo.",
    };
  }
}

export function cabecerasDeAcceso({ sesion, pedido }: Credenciales): Record<string, string> {
  return {
    ...(sesion ? { Authorization: `Bearer ${sesion}` } : {}),
    ...(pedido ? { "X-Order-Token": pedido } : {}),
  };
}

export function respuestaInesperada(): FalloApi {
  return {
    ok: false,
    status: 502,
    code: "respuesta_inesperada",
    mensaje: "Recibimos una respuesta inesperada del servidor. Intenta de nuevo.",
  };
}
