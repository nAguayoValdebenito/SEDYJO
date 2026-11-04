import { cn } from "@/lib/utils/cn";

type Variante = "primario" | "dorado" | "contorno";
type Tamano = "sm" | "md" | "lg";

/**
 * Los botones crecen un poco al pasar el cursor y se hunden al presionarse,
 * siempre con transición suave. Con "reducir movimiento" solo cambia el color.
 */
export const interaccionVivaBase =
  "transition-[scale,background-color,filter,border-color] duration-200 ease-[var(--ease-salida)] hover:scale-[1.05] active:scale-[0.96]";

/** Crecimiento mínimo (~2 %) para el botón "Agregar" de las tarjetas de producto. */
export const interaccionVivaSutil =
  "transition-[scale,background-color,filter,border-color] duration-200 ease-[var(--ease-salida)] hover:scale-[1.02] active:scale-[0.97]";

const base = cn(
  "inline-flex items-center justify-center gap-2 rounded-lg font-bold disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
  interaccionVivaBase,
);

const baseSutil = cn(
  "inline-flex items-center justify-center gap-2 rounded-lg font-bold disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
  interaccionVivaSutil,
);

const variantes: Record<Variante, string> = {
  primario: "bg-verde text-white hover:bg-verde-oscuro",
  dorado: "bg-oro text-negro hover:brightness-95",
  contorno: "border-2 border-verde text-verde-oscuro hover:bg-verde-suave",
};

const tamanos: Record<Tamano, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
};

/** Clases de un botón; sirve para <button> y para enlaces (Link). `sutil` = crece solo ~2 %. */
export function claseBoton(
  variante: Variante = "primario",
  tamano: Tamano = "md",
  extra?: string,
  sutil = false,
): string {
  return cn(sutil ? baseSutil : base, variantes[variante], tamanos[tamano], extra);
}
