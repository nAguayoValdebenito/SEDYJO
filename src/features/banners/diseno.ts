import type { DisenoBanner, TamanoBanner } from "@/types";

/**
 * Reglas de diseño de los banners editables. Las clases de Tailwind van COMPLETAS en estos mapas
 * (Tailwind no detecta clases armadas con texto). Todo valor desconocido cae al diseño por defecto.
 */

export type Zona = "principal" | "oscuro" | "modal";

export const DISENO_VACIO: DisenoBanner = {
  tamanoTitulo: null,
  ajusteImagen: null,
  tamanoImagen: null,
  ladoImagen: null,
  colorFondo: null,
  colorTexto: null,
};

/** [máx. de letras para «grande», máx. para «mediano»]; más largo = «pequeño». */
const LIMITES_AUTOMATICO: Record<Zona, [number, number]> = {
  principal: [16, 28],
  oscuro: [12, 20],
  modal: [20, 32],
};

/** Tamaño del título: el elegido por el administrador o, si no, según el largo del texto. */
export function tamanoDelTitulo(titulo: string, elegido: TamanoBanner | null, zona: Zona): TamanoBanner {
  if (elegido) return elegido;
  const largo = titulo.trim().length;
  const [grande, medio] = LIMITES_AUTOMATICO[zona];
  return largo <= grande ? "lg" : largo <= medio ? "md" : "sm";
}

export const CLASE_TITULO: Record<Zona, Record<TamanoBanner, string>> = {
  principal: {
    lg: "text-[28px] md:text-[34px] lg:text-[44px]",
    md: "text-[24px] md:text-[28px] lg:text-[36px]",
    sm: "text-[20px] md:text-[24px] lg:text-[28px]",
  },
  oscuro: {
    lg: "text-[30px] sm:text-[26px] lg:text-5xl",
    md: "text-[26px] sm:text-[22px] lg:text-[38px]",
    sm: "text-[22px] sm:text-[20px] lg:text-[30px]",
  },
  modal: {
    lg: "text-[26px] sm:text-[32px]",
    md: "text-[22px] sm:text-[27px]",
    sm: "text-[20px] sm:text-[22px]",
  },
};

/** Fondos: oscuros (banner oscuro y ventana de ofertas) y claros (carrusel principal). */
const FONDO_OSCURO: Record<string, string> = {
  negro: "bg-negro",
  carbon: "bg-carbon",
  "verde-profundo": "bg-verde-profundo",
  "azul-oscuro": "bg-azul-oscuro",
};
const FONDO_CLARO: Record<string, string> = {
  "verde-suave": "bg-verde-suave",
  crema: "bg-crema",
  celeste: "bg-celeste",
  blanco: "bg-white",
};

export function claseFondo(zona: Zona, clave: string | null): string {
  if (zona === "principal") return FONDO_CLARO[clave ?? ""] ?? FONDO_CLARO["verde-suave"];
  return FONDO_OSCURO[clave ?? ""] ?? FONDO_OSCURO.negro;
}

/** Color del título (solo zonas de fondo oscuro). `null` = el que corresponde al tema del banner. */
const TEXTO: Record<string, string> = {
  dorado: "text-oro",
  morado: "text-morado",
  blanco: "text-white",
  menta: "text-verde-menta",
};
export function claseColorTexto(clave: string | null): string | null {
  return TEXTO[clave ?? ""] ?? null;
}

/* ---------- banner oscuro ---------- */

/** Ancho de la imagen (porcentaje del espacio interior del banner); el texto ocupa el resto. */
export const OSCURO_IMAGEN: Record<TamanoBanner, string> = {
  sm: "w-[28%] sm:w-[24%] lg:w-[28%]",
  md: "w-[36%] sm:w-[32%] lg:w-[36%]",
  lg: "w-[46%] sm:w-[42%] lg:w-[46%]",
};

/* ---------- carrusel principal ---------- */

export const PRINCIPAL_COLUMNAS: Record<"left" | "right", Record<TamanoBanner, string>> = {
  right: {
    sm: "md:grid-cols-[minmax(0,1fr)_34%]",
    md: "md:grid-cols-[minmax(0,1fr)_42%]",
    lg: "md:grid-cols-[minmax(0,1fr)_50%]",
  },
  left: {
    sm: "md:grid-cols-[34%_minmax(0,1fr)]",
    md: "md:grid-cols-[42%_minmax(0,1fr)]",
    lg: "md:grid-cols-[50%_minmax(0,1fr)]",
  },
};
export const PRINCIPAL_MAX_IMAGEN: Record<TamanoBanner, string> = {
  sm: "md:max-w-[240px]",
  md: "md:max-w-[300px]",
  lg: "md:max-w-[360px]",
};
/** En celular la imagen va flotando en una esquina: su tamaño y el espacio que el texto le deja. */
export const PRINCIPAL_MOVIL_IMAGEN: Record<TamanoBanner, string> = {
  sm: "size-[90px]",
  md: "size-[110px]",
  lg: "size-[130px]",
};
export const PRINCIPAL_MOVIL_RESERVA_IZQUIERDA: Record<TamanoBanner, string> = {
  sm: "pl-[108px] md:pl-0",
  md: "pl-[124px] md:pl-0",
  lg: "pl-[144px] md:pl-0",
};
export const PRINCIPAL_MOVIL_MAX_TITULO: Record<TamanoBanner, string> = {
  sm: "max-w-[170px]",
  md: "max-w-[170px]",
  lg: "max-w-[150px]",
};
