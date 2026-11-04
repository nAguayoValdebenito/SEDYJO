import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Ancho máximo y márgenes laterales comunes a todas las secciones. */
export function Contenedor({ children, className }: Props) {
  return <div className={cn("mx-auto w-full max-w-sitio px-3 md:px-8", className)}>{children}</div>;
}
