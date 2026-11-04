import { cn } from "@/lib/utils/cn";

const BURBUJAS = [
  { tam: "size-24", pos: "left-[8%] top-[10%]" },
  { tam: "size-14", pos: "left-[62%] top-[6%]" },
  { tam: "size-32", pos: "right-[-2rem] top-[34%]" },
  { tam: "size-10", pos: "left-[22%] top-[46%]" },
  { tam: "size-20", pos: "left-[-1.5rem] bottom-[14%]" },
  { tam: "size-12", pos: "right-[18%] bottom-[8%]" },
];

/** Burbujas de contorno (motivo de la marca) para fondos de marca; decorativas, sin movimiento. */
export function BurbujasDecorativas({
  className,
  tono = "oscuro",
}: {
  className?: string;
  /** `oscuro` para fondos verdes; `claro` para fondos blancos. */
  tono?: "oscuro" | "claro";
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {BURBUJAS.map((b) => (
        <span
          key={b.pos}
          className={cn(
            tono === "oscuro"
              ? "absolute rounded-full border border-white/25 bg-gradient-to-br from-white/15 to-transparent"
              : "absolute rounded-full border border-verde-claro/60 bg-gradient-to-br from-verde-suave to-transparent",
            b.tam,
            b.pos,
          )}
        />
      ))}
    </div>
  );
}
