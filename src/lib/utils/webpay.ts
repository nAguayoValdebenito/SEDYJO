/** Direcciones oficiales del formulario de pago de Webpay Plus (producción y pruebas). */
const HOSTS_WEBPAY = new Set(["webpay3g.transbank.cl", "webpay3gint.transbank.cl"]);

/**
 * Solo se envía al cliente a Transbank. Si la API devolviera otra dirección (error o
 * manipulación), no se redirige: el cliente nunca debe terminar en un sitio desconocido
 * con el token de su pago.
 */
export function esUrlWebpay(valor: string): boolean {
  try {
    const url = new URL(valor);
    return url.protocol === "https:" && HOSTS_WEBPAY.has(url.hostname);
  } catch {
    return false;
  }
}

/** Motivos de error que la API puede indicar al volver de Transbank (la API es la fuente de verdad). */
export const MOTIVOS_RETORNO = [
  "rechazado",
  "cancelado",
  "tiempo-agotado",
  "invalido",
  "no-disponible",
] as const;

export type MotivoRetorno = (typeof MOTIVOS_RETORNO)[number];

export function motivoRetorno(valor: string | null): MotivoRetorno | null {
  return (MOTIVOS_RETORNO as readonly string[]).includes(valor ?? "")
    ? (valor as MotivoRetorno)
    : null;
}

/** Envía al navegador a Transbank con un formulario POST (campo `token_ws`). */
export function enviarATransbank(url: string, token: string): void {
  const formulario = document.createElement("form");
  formulario.method = "POST";
  formulario.action = url;
  const campo = document.createElement("input");
  campo.type = "hidden";
  campo.name = "token_ws";
  campo.value = token;
  formulario.appendChild(campo);
  document.body.appendChild(formulario);
  formulario.submit();
}
