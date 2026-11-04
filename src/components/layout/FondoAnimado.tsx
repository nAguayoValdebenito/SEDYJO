import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Fondo animado sutil (limpieza y frescura): burbujas que suben despacio, la misma
 * burbuja que sube hasta el carrito al agregar un producto. Solo CSS, sin JavaScript
 * en el cliente; se detiene con "reducir movimiento". En celular son 5 (no 8) para
 * cuidar los equipos de gama media. Se ven en los márgenes y entre las tarjetas, por
 * detrás del contenido.
 */
const burbujas = [
  { izq: "5%", tamano: 54, duracion: 26, retraso: 0, deriva: 24, reposo: "72%" },
  { izq: "19%", tamano: 30, duracion: 20, retraso: 6, deriva: -18, reposo: "30%" },
  { izq: "36%", tamano: 76, duracion: 32, retraso: 11, deriva: 30, reposo: "55%" },
  { izq: "58%", tamano: 44, duracion: 24, retraso: 3, deriva: -26, reposo: "85%" },
  { izq: "92%", tamano: 64, duracion: 30, retraso: 14, deriva: 20, reposo: "20%" },
  { izq: "47%", tamano: 26, duracion: 19, retraso: 8, deriva: -14, reposo: "64%" },
  { izq: "75%", tamano: 82, duracion: 34, retraso: 2, deriva: -30, reposo: "45%" },
  { izq: "12%", tamano: 40, duracion: 28, retraso: 16, deriva: 18, reposo: "10%" },
];

export function FondoAnimado() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {burbujas.map((b, i) => (
        <span
          key={b.izq}
          className={cn("burbuja", i >= 5 && "max-md:hidden")}
          style={
            {
              left: b.izq,
              width: b.tamano,
              height: b.tamano,
              "--duracion": `${b.duracion}s`,
              "--retraso": `-${b.retraso}s`,
              "--deriva": `${b.deriva}px`,
              "--reposo": b.reposo,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
