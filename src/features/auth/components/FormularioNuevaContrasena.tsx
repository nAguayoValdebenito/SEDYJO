"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { claseBoton } from "@/components/ui/boton";
import { ResumenErrores } from "@/components/ui/ResumenErrores";
import { erroresPorCampo, restablecerSchema } from "@/lib/validation/auth";
import { restablecerContrasena } from "../acciones";
import { CampoContrasena } from "./CampoContrasena";

const ETIQUETAS = { contrasena: "Contraseña nueva", confirmar: "Repite la contraseña" };

/**
 * Formulario del enlace del correo de recuperación. El token se lee de la URL; vale una sola vez
 * y vence a los 60 minutos, así que si no sirve se invita a pedir un enlace nuevo.
 */
export function FormularioNuevaContrasena() {
  const token = useSearchParams().get("token")?.trim() ?? "";

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [tokenInvalido, setTokenInvalido] = useState(false);
  const [listo, setListo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [intento, setIntento] = useState(0);
  const resumen = useRef<HTMLDivElement>(null);
  const alerta = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (intento === 0) return;
    (resumen.current ?? alerta.current)?.focus();
  }, [intento]);

  if (listo) {
    return (
      <div className="flex flex-col gap-4">
        <p
          role="status"
          className="flex gap-2.5 rounded-lg border border-verde-claro bg-verde-suave p-3.5"
        >
          <CheckCircle2
            size={20}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-verde-oscuro"
          />
          <span>
            <strong>Listo, guardamos tu contraseña nueva.</strong> Cerramos tus sesiones abiertas:
            inicia sesión de nuevo con ella.
          </span>
        </p>
        <Link href="/ingresar" className={claseBoton("primario", "lg", "self-start")}>
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (!token || tokenInvalido) {
    return (
      <div className="flex flex-col gap-4">
        <p
          role="alert"
          className="flex gap-2 rounded-lg border-2 border-error bg-white p-3.5 text-sm font-medium text-error"
        >
          <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
          {token
            ? "El enlace no es válido, venció o ya se usó."
            : "Falta el enlace de recuperación. Ábrelo desde el correo que te enviamos."}
        </p>
        <Link href="/recuperar" className={claseBoton("primario", "lg", "self-start")}>
          Pedir un enlace nuevo
        </Link>
      </div>
    );
  }

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const entrada = {
      token,
      contrasena: String(datos.get("contrasena") ?? ""),
      confirmar: String(datos.get("confirmar") ?? ""),
    };

    const validacion = restablecerSchema.safeParse(entrada);
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
      const resultado = await restablecerContrasena(entrada);
      if (resultado.ok) {
        setListo(true);
        return;
      }
      if (resultado.motivo === "token") {
        setTokenInvalido(true);
        return;
      }
      setErrores(resultado.campos ?? {});
      setErrorGeneral(resultado.campos ? null : resultado.mensaje);
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
      method="post"
      onSubmit={enviar}
      noValidate
      aria-busy={enviando}
      className="flex flex-col gap-4"
    >
      <ResumenErrores ref={resumen} errores={errores} etiquetas={ETIQUETAS} prefijo="nueva" />

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
        id="nueva-contrasena"
        name="contrasena"
        etiqueta="Contraseña nueva"
        autoComplete="new-password"
        ayuda="Entre 8 y 128 caracteres, con al menos una letra y un número."
        required
        error={errores.contrasena}
      />
      <CampoContrasena
        id="nueva-confirmar"
        name="confirmar"
        etiqueta="Repite la contraseña"
        autoComplete="new-password"
        required
        error={errores.confirmar}
      />

      <button type="submit" disabled={enviando} className={claseBoton("primario", "lg", "w-full")}>
        {enviando ? (
          <>
            <Loader2 size={18} aria-hidden="true" className="animate-spin" />
            Guardando…
          </>
        ) : (
          "Guardar contraseña"
        )}
      </button>
    </form>
  );
}
