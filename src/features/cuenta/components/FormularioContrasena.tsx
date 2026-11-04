"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, CircleCheck, Loader2 } from "lucide-react";
import { ResumenErrores } from "@/components/ui/ResumenErrores";
import { claseBoton } from "@/components/ui/boton";
import { CampoContrasena } from "@/features/auth/components/CampoContrasena";
import { erroresPorCampo } from "@/lib/validation/auth";
import { contrasenaSchema } from "@/lib/validation/cuenta";
import { cambiarContrasena } from "../acciones";

const ETIQUETAS = {
  actual: "Contraseña actual",
  nueva: "Contraseña nueva",
  confirmar: "Repite la contraseña nueva",
};

/** Cambio de contraseña (simulado). Nunca se guarda ni se registra ninguna contraseña. */
export function FormularioContrasena() {
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [cambiada, setCambiada] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [intento, setIntento] = useState(0);
  const resumen = useRef<HTMLDivElement>(null);
  const alerta = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (intento === 0) return;
    (resumen.current ?? alerta.current)?.focus();
  }, [intento]);

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);
    const entrada = {
      actual: String(datos.get("actual") ?? ""),
      nueva: String(datos.get("nueva") ?? ""),
      confirmar: String(datos.get("confirmar") ?? ""),
    };
    setCambiada(false);

    const validacion = contrasenaSchema.safeParse(entrada);
    if (!validacion.success) {
      setErrores(erroresPorCampo(validacion.error));
      setErrorGeneral(null);
      setIntento((n) => n + 1);
      return;
    }

    setErrores({});
    setErrorGeneral(null);
    setEnviando(true);
    try {
      const resultado = await cambiarContrasena(entrada);
      if (resultado.ok) {
        formulario.reset();
        setCambiada(true);
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
      className="flex max-w-lg flex-col gap-4"
    >
      <ResumenErrores ref={resumen} errores={errores} etiquetas={ETIQUETAS} prefijo="clave" />

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

      <CampoContrasena
        id="clave-actual"
        name="actual"
        etiqueta="Contraseña actual"
        autoComplete="current-password"
        required
        error={errores.actual}
      />
      <CampoContrasena
        id="clave-nueva"
        name="nueva"
        etiqueta="Contraseña nueva"
        autoComplete="new-password"
        ayuda="Mínimo 8 caracteres, con letras y números."
        required
        error={errores.nueva}
      />
      <CampoContrasena
        id="clave-confirmar"
        name="confirmar"
        etiqueta="Repite la contraseña nueva"
        autoComplete="new-password"
        required
        error={errores.confirmar}
      />

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={enviando} className={claseBoton("primario", "lg")}>
          {enviando ? (
            <>
              <Loader2 size={18} aria-hidden="true" className="animate-spin" />
              Cambiando…
            </>
          ) : (
            "Cambiar contraseña"
          )}
        </button>
        <p role="status" className="text-sm font-bold text-verde-oscuro">
          {cambiada && (
            <span className="contenido-entra inline-flex items-center gap-1.5">
              <CircleCheck size={18} aria-hidden="true" />
              Cambiamos tu contraseña.
            </span>
          )}
        </p>
      </div>
    </form>
  );
}
