import { CampoSelect } from "@/components/ui/CampoSelect";
import { formatoPrecio } from "@/lib/utils/format";
import type { ZonaDespacho } from "@/types";

type Props = {
  /** Prefijo de los ids: `<prefijo>-comuna` y `<prefijo>-region`. */
  prefijo: string;
  /** Comunas con despacho (de la API). */
  zonas: ZonaDespacho[];
  comuna: string;
  region: string;
  onElegir: (comuna: string, region: string) => void;
  error?: string;
  /** Texto de apoyo bajo la lista. */
  ayuda?: string;
};

/**
 * Comuna elegida de la lista de comunas con despacho (con su costo) y región que se completa sola.
 * Se usa en el pago y en las direcciones guardadas, para que nunca se escriba una comuna que la API
 * no reconoce. Devuelve dos celdas para colocar dentro de una grilla de dos columnas. Incluye los
 * campos `comuna` y `region` para formularios que leen `FormData`.
 */
export function CampoComuna({ prefijo, zonas, comuna, region, onElegir, error, ayuda }: Props) {
  return (
    <>
      <CampoSelect
        id={`${prefijo}-comuna`}
        name="comuna"
        etiqueta="Comuna"
        placeholder="Elige tu comuna"
        opciones={zonas.map((z) => ({
          valor: z.comuna,
          texto: `${z.comuna} · ${formatoPrecio(z.costo)}`,
        }))}
        value={comuna}
        onChange={(e) => {
          const zona = zonas.find((z) => z.comuna === e.target.value);
          onElegir(e.target.value, zona?.region ?? "");
        }}
        error={error}
        ayuda={ayuda ?? "Despachamos solo a estas comunas. El costo es el de cada una."}
        autoComplete="address-level2"
        required
      />
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-bold">Región</span>
        <p
          id={`${prefijo}-region`}
          className="flex h-12 items-center rounded-lg border-2 border-borde bg-gris-fondo px-3.5 text-[15px] text-gris-medio"
        >
          {region || "Se completa al elegir la comuna"}
        </p>
        <input type="hidden" name="region" value={region} />
      </div>
    </>
  );
}
