import { MapPin } from "lucide-react";
import { Insignia } from "@/components/ui/Insignia";
import type { DireccionGuardada } from "@/types";

type Props = {
  direcciones: DireccionGuardada[];
  /** Id de la dirección elegida, o `"otra"` para escribir una nueva. */
  elegida: string;
  onElegir: (direccion: DireccionGuardada | null) => void;
};

const opcion =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-borde-control bg-white p-3 transition-[border-color,background-color] duration-200 hover:bg-gris-fondo has-[:checked]:border-verde has-[:checked]:bg-verde-suave [&_input]:mt-1 [&_input]:accent-verde";

/** Elegir entre las direcciones guardadas en la cuenta o escribir otra, al pagar. */
export function SelectorDireccion({ direcciones, elegida, onElegir }: Props) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 flex items-center gap-2 text-sm font-bold">
        <MapPin size={16} aria-hidden="true" />
        ¿Dónde te lo enviamos?
      </legend>
      {direcciones.map((d) => (
        <label key={d.id} className={opcion}>
          <input
            type="radio"
            name="direccion-guardada"
            checked={elegida === d.id}
            onChange={() => onElegir(d)}
          />
          <span className="min-w-0 text-sm">
            <span className="flex flex-wrap items-center gap-2 font-bold">
              {d.etiqueta}
              {d.principal && <Insignia variante="oscura">Principal</Insignia>}
            </span>
            <span className="text-gris-medio">
              {d.calle} {d.numero}, {d.comuna}, {d.region}
            </span>
          </span>
        </label>
      ))}
      <label className={opcion}>
        <input
          type="radio"
          name="direccion-guardada"
          checked={elegida === "otra"}
          onChange={() => onElegir(null)}
        />
        <span className="text-sm font-bold">Usar otra dirección</span>
      </label>
    </fieldset>
  );
}
