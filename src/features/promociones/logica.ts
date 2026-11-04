import type { CampanaModal } from "@/types";

/** Páginas donde el modal nunca aparece: no se interrumpe una compra ni la cuenta del cliente. */
const RUTAS_SIN_MODAL = ["/carrito", "/checkout", "/cuenta", "/ingresar", "/registro"];

export function rutaPermiteModal(pathname: string): boolean {
  return !RUTAS_SIN_MODAL.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));
}

/** `true` si la campaña no tiene fecha límite o aún no la alcanza. */
export function estaVigente(campana: Pick<CampanaModal, "vigenciaHasta">, ahora: number): boolean {
  if (!campana.vigenciaHasta) return true;
  const limite = Date.parse(campana.vigenciaHasta);
  return Number.isNaN(limite) ? true : ahora <= limite;
}

type Entrada = {
  campana: CampanaModal;
  /** Milisegundos desde 1970 (`Date.now()`). */
  ahora: number;
  /** Cuándo el cliente lo cerró por última vez (milisegundos) o `null` si nunca. */
  ultimoCierre: number | null;
  /** Si ya se mostró en esta sesión del navegador. */
  vistaEnSesion: boolean;
  pathname: string;
};

/**
 * Decide si hay que mostrar el modal: la campaña debe estar activa y vigente, no haberse visto en
 * esta sesión, no haberse cerrado hace menos de `frecuenciaHoras` y la página debe permitirlo.
 */
export function debeMostrarse({
  campana,
  ahora,
  ultimoCierre,
  vistaEnSesion,
  pathname,
}: Entrada): boolean {
  if (!campana.activo || campana.slides.length === 0) return false;
  if (!estaVigente(campana, ahora)) return false;
  if (!rutaPermiteModal(pathname)) return false;
  if (vistaEnSesion) return false;
  if (ultimoCierre !== null && ahora - ultimoCierre < campana.frecuenciaHoras * 3_600_000) {
    return false;
  }
  return true;
}
