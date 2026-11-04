import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variante = "morada" | "descuento" | "oscura" | "contorno-dorado";

const variantes: Record<Variante, string> = {
  morada: "bg-morado text-negro",
  descuento: "bg-rojo text-white",
  oscura: "bg-tinta text-white",
  "contorno-dorado": "border-2 border-oro text-oro",
};

type Props = {
  variante: Variante;
  children: ReactNode;
  className?: string;
};

export function Insignia({ variante, children, className }: Props) {
  return (
    <span
      className={cn(
        "inline-block rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] md:text-xs",
        variantes[variante],
        className,
      )}
    >
      {children}
    </span>
  );
}
