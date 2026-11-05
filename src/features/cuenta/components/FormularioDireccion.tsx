"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { CampoComuna } from "@/features/despacho/components/CampoComuna";
import { ResumenErrores } from "@/components/ui/ResumenErrores";
import { claseBoton } from "@/components/ui/boton";
import { erroresPorCampo } from "@/lib/validation/auth";
import { direccionSchema } from "@/lib/validation/cuenta";
import type { EntradaDireccionLibreta } from "@/lib/utils/direcciones";
import type { DireccionGuardada, ZonaDespacho } from "@/types";
import { validarDireccion } from "../acciones";

const ETIQUETAS = {
  etiqueta: "Nombre de la dirección",
  calle: "Calle",
  numero: "Número",
  comuna: "Comuna",
  region: "Región",
  referencia: "Referencia",
};

type Props = {
  /** Comunas con despacho: la comuna se elige de esta lista. */
  zonas: ZonaDespacho[];
  /** Dirección que se edita; sin ella el formulario agrega una nueva. */
  inicial?: DireccionGuardada;
  /** Muestra la opción "usar como principal" (al agregar, si ya hay otras). */
  ofrecerPrincipal?: boolean;
  /** Guarda la dirección; devuelve el mensaje de error del servidor o `null` si salió bien. */
  onGuardar: (
    entrada: EntradaDireccionLibreta,
    principal: boolean,
  ) => Promise<string | null> | string | null | void;
  onCancelar: () => void;
};

/** Formulario para agregar o editar una dirección de la libreta. */
export function FormularioDireccion({
  zonas,
  inicial,
  ofrecerPrincipal,
  onGuardar,
  onCancelar,
}: Props) {
  // Una dirección guardada con una comuna que ya no tiene despacho obliga a elegir otra.
  const zonaInicial = zonas.find((z) => z.comuna === inicial?.comuna);
  const [comuna, setComuna] = useState(zonaInicial?.comuna ?? "");
  const [region, setRegion] = useState(zonaInicial?.region ?? "");
  const comunaSinDespacho = Boolean(inicial) && !zonaInicial;
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [intento, setIntento] = useState(0);
  const titulo = useRef<HTMLHeadingElement>(null);
  const resumen = useRef<HTMLDivElement>(null);
  const alerta = useRef<HTMLDivElement>(null);

  // Al abrir el formulario el foco pasa a su título; después de un error, al aviso de errores.
  useEffect(() => {
    titulo.current?.focus();
  }, []);
  useEffect(() => {
    if (intento === 0) return;
    (resumen.current ?? alerta.current)?.focus();
  }, [intento]);

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const entrada = Object.fromEntries(
      Object.keys(ETIQUETAS).map((campo) => [campo, String(datos.get(campo) ?? "")]),
    );
    const principal = datos.get("principal") === "on";

    const validacion = direccionSchema.safeParse(entrada);
    if (!validacion.success) {
      const campos = erroresPorCampo(validacion.error);
      // Sin comuna tampoco hay región: se avisa solo de la comuna.
      if (campos.comuna) delete campos.region;
      setErrores(campos);
      setErrorGeneral(null);
      setIntento((n) => n + 1);
      return;
    }

    setErrores({});
    setErrorGeneral(null);
    setEnviando(true);
    try {
      const resultado = await validarDireccion(entrada);
      if (resultado.ok) {
        const { referencia, ...resto } = resultado.datos;
        const errorServidor = await onGuardar(
          { ...resto, referencia: referencia || null },
          principal,
        );
        if (errorServidor) {
          setErrorGeneral(errorServidor);
          setIntento((n) => n + 1);
        }
        return;
      }
      setErrores(resultado.error.campos ?? {});
      setErrorGeneral(resultado.error.campos ? null : resultado.error.mensaje);
      setIntento((n) => n + 1);
    } catch {
      setErrorGeneral("Ocurrió un problema inesperado. Intenta de nuevo.");
      setIntento((n) => n + 1);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form
      onSubmit={enviar}
      noValidate
      aria-busy={enviando}
      aria-labelledby="titulo-direccion"
      className="entrada-paso flex max-w-xl flex-col gap-4 rounded-[10px] border border-borde bg-white p-4 sm:p-6"
    >
      <h2
        id="titulo-direccion"
        ref={titulo}
        tabIndex={-1}
        className="font-titulos text-xl font-extrabold outline-none"
      >
        {inicial ? "Editar dirección" : "Nueva dirección"}
      </h2>

      <ResumenErrores ref={resumen} errores={errores} etiquetas={ETIQUETAS} prefijo="dir" />

      {errorGeneral && (
        <div
          ref={alerta}
          role="alert"
          tabIndex={-1}
          className="flex gap-2 rounded-lg border-2 border-error bg-white p-3.5 text-sm font-medium text-error outline-none"
        >
          <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
          {errorGeneral}
        </div>
      )}

      <CampoTexto
        id="dir-etiqueta"
        name="etiqueta"
        etiqueta="Nombre de la dirección (ejemplo: Casa o Trabajo)"
        defaultValue={inicial?.etiqueta ?? ""}
        required
        error={errores.etiqueta}
      />
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <CampoTexto
          id="dir-calle"
          name="calle"
          etiqueta="Calle"
          defaultValue={inicial?.calle ?? ""}
          autoComplete="address-line1"
          required
          error={errores.calle}
        />
        <CampoTexto
          id="dir-numero"
          name="numero"
          etiqueta="Número"
          defaultValue={inicial?.numero ?? ""}
          required
          error={errores.numero}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoComuna
          prefijo="dir"
          zonas={zonas}
          comuna={comuna}
          region={region}
          onElegir={(nuevaComuna, nuevaRegion) => {
            setComuna(nuevaComuna);
            setRegion(nuevaRegion);
          }}
          error={errores.comuna}
          ayuda={
            comunaSinDespacho
              ? "Esa comuna ya no tiene despacho. Elige una de la lista."
              : zonas.length === 0
                ? "No pudimos cargar las comunas con despacho. Recarga la página."
                : undefined
          }
        />
      </div>
      <CampoTexto
        id="dir-referencia"
        name="referencia"
        etiqueta="Referencia (opcional)"
        defaultValue={inicial?.referencia ?? ""}
        ayuda="Por ejemplo: casa con reja verde, timbre del segundo piso."
        error={errores.referencia}
      />

      {ofrecerPrincipal && (
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm [&_input]:accent-verde">
          <input type="checkbox" name="principal" className="size-5" />
          Usar como mi dirección principal
        </label>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={enviando} className={claseBoton("primario", "lg")}>
          {enviando ? (
            <>
              <Loader2 size={18} aria-hidden="true" className="animate-spin" />
              Guardando…
            </>
          ) : (
            "Guardar dirección"
          )}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={enviando}
          className={claseBoton("contorno", "lg")}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
