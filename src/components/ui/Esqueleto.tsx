import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
  /** `oscuro` para fondos negros (banners y sección exclusiva). */
  tema?: "claro" | "oscuro";
};

/** Bloque de carga con brillo. Mantiene el tamaño del contenido real para no mover la página. */
export function Esqueleto({ className, tema = "claro" }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn("esqueleto", tema === "oscuro" && "esqueleto-oscuro", className)}
    />
  );
}
