"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { claseBoton } from "@/components/ui/boton";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { ResumenErrores } from "@/components/ui/ResumenErrores";
import { useHidratado } from "@/features/carrito/useHidratado";
import { erroresPorCampo, ingresoSchema } from "@/lib/validation/auth";
import { rutaSegura } from "@/lib/utils/rutas";
import { iniciarSesion } from "../acciones";
import { useSesion } from "../store";
import { CampoContrasena } from "./CampoContrasena";

const ETIQUETAS = { correo: "Correo", contrasena: "Contraseña" };

/** Formulario de inicio de sesión: validación al enviar, errores junto a cada campo y estados de carga y error. */
export function FormularioIngreso() {
  const router = useRouter();
  const parametros = useSearchParams();
  const volver = parametros.get("volver");

  const hidratado = useHidratado();
  const usuario = useSesion((s) => s.usuario);
  const iniciar = useSesion((s) => s.iniciarSesion);
  const cerrarSesion = useSesion((s) => s.cerrarSesion);

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [intento, setIntento] = useState(0);
  const resumen = useRef<HTMLDivElement>(null);
  const alerta = useRef<HTMLDivElement>(null);

  // Tras un envío con problemas, el foco va al resumen de errores (o al aviso del servidor).
  useEffect(() => {
    if (intento === 0) return;
    (resumen.current ?? alerta.current)?.focus();
  }, [intento]);

  if (hidratado && usuario) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="text-gris-medio">
          Ya iniciaste sesión como <strong>{usuario.nombre}</strong>.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/cuenta" className={claseBoton("primario", "lg")}>
            Ir a mi cuenta
          </Link>
          <button type="button" onClick={cerrarSesion} className={claseBoton("contorno", "lg")}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const entrada = {
      correo: String(datos.get("correo") ?? ""),
      contrasena: String(datos.get("contrasena") ?? ""),
    };

    const validacion = ingresoSchema.safeParse(entrada);
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
      const resultado = await iniciarSesion(entrada);
      if (resultado.ok) {
        iniciar(resultado.usuario);
        router.push(rutaSegura(volver));
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

  const sufijo = volver ? `?volver=${encodeURIComponent(volver)}` : "";

  return (
    <form
      method="post"
      onSubmit={enviar}
      noValidate
      aria-busy={enviando}
      className="flex flex-col gap-4"
    >
      <ResumenErrores ref={resumen} errores={errores} etiquetas={ETIQUETAS} prefijo="ingreso" />

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
        id="ingreso-correo"
        name="correo"
        type="email"
        etiqueta="Correo"
        autoComplete="email"
        inputMode="email"
        required
        error={errores.correo}
      />
      <CampoContrasena
        id="ingreso-contrasena"
        name="contrasena"
        etiqueta="Contraseña"
        autoComplete="current-password"
        required
        error={errores.contrasena}
      />

      <button type="submit" disabled={enviando} className={claseBoton("primario", "lg", "w-full")}>
        {enviando ? (
          <>
            <Loader2 size={18} aria-hidden="true" className="animate-spin" />
            Ingresando…
          </>
        ) : (
          "Iniciar sesión"
        )}
      </button>

      <div className="flex flex-col gap-1.5 text-sm sm:flex-row sm:justify-between">
        <Link
          href="/recuperar"
          className="inline-flex min-h-11 items-center font-bold text-azul hover:text-azul-oscuro"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        <Link
          href={`/registro${sufijo}`}
          className="inline-flex min-h-11 items-center font-bold text-azul hover:text-azul-oscuro"
        >
          ¿Primera vez? Crea tu cuenta
        </Link>
      </div>
    </form>
  );
}
