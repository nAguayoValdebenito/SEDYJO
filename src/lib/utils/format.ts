const formatoCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

/** 12490 -> "$12.490" */
export function formatoPrecio(valor: number): string {
  return formatoCLP.format(valor);
}

/** Porcentaje de descuento redondeado, o null si no hay rebaja. */
export function porcentajeDescuento(precio: number, precioAnterior: number | null): number | null {
  if (!precioAnterior || precioAnterior <= precio) return null;
  return Math.round((1 - precio / precioAnterior) * 100);
}

const ZONA = "America/Santiago";
const formatoFechaLarga = new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeZone: ZONA });
const formatoFechaCorta = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: ZONA,
});

/** "2026-09-18T16:20:00-03:00" -> "18 de septiembre de 2026" (hora de Chile, igual en servidor y navegador). */
export function formatoFecha(iso: string): string {
  return formatoFechaLarga.format(new Date(iso));
}

/** "2026-09-18T16:20:00-03:00" -> "18 sept 2026, 16:20". */
export function formatoFechaHora(iso: string): string {
  return formatoFechaCorta.format(new Date(iso));
}
