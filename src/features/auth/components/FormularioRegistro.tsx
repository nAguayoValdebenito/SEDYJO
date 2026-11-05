"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { claseBoton } from "@/components/ui/boton";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { ResumenErrores } from "@/components/ui/ResumenErrores";
import { useHidratado } from "@/features/carrito/useHidratado";
import { erroresPorCampo, registroSchema } from "@/lib/validation/auth";
import { rutaSegura } from "@/lib/utils/rutas";
import { registrarse } from "../acciones";
import { useSesion } from "../store";
import { CampoContrasena } from "./CampoContrasena";

const ETIQUETAS = {
  nombre: "Nombre",
  correo: "Correo",
  contrasena: "Contraseña",
  confirmar: "Repite tu contraseña",
};

/** Formulario de registro de clientes con las mismas reglas de validación que el servidor. */
export function FormularioRegistro() {
  const router = useRouter();
  const parametros = useSearchParams();
  const volver = parametros.get("volver");

  const hidratado = useHidratado();
  const usuario = useSesion((s) => s.usuario);
  const iniciar = useSesion((s) => s.iniciarSesion);

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [intento, setIntento] = useState(0);
  const resumen = useRef<HTMLDivElement>(null);
  const alerta = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (intento === 0) return;
    (resumen.current ?? alerta.current)?.focus();
  }, [intento]);

  if (hidratado && usuario) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="text-gris-medio">
          Ya tienes una sesión iniciada como <strong>{usuario.nombre}</strong>.
        </p>
        <Link href="/cuenta" className={claseBoton("primario", "lg", "self-start")}>
          Ir a mi cuenta
        </Link>
      </div>
    );
  }

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const entrada = {
      nombre: String(datos.get("nombre") ?? ""),
      correo: String(datos.get("correo") ?? ""),
      contrasena: String(datos.get("contrasena") ?? ""),
      confirmar: String(datos.get("confirmar") ?? ""),
    };

    const validacion = registroSchema.safeParse(entrada);
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
      const resultado = await registrarse(entrada);
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
      <ResumenErrores ref={resumen} errores={errores} etiquetas={ETIQUETAS} prefijo="registro" />

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
        id="registro-nombre"
        name="nombre"
        etiqueta="Nombre"
        autoComplete="name"
        required
        error={errores.nombre}
      />
      <CampoTexto
        id="registro-correo"
        name="correo"
        type="email"
        etiqueta="Correo"
        autoComplete="email"
        inputMode="email"
        required
        error={errores.correo}
      />
      <CampoContrasena
        id="registro-contrasena"
        name="contrasena"
        etiqueta="Contraseña"
        autoComplete="new-password"
        ayuda="Mínimo 8 caracteres, con letras y números."
        required
        error={errores.contrasena}
      />
      <CampoContrasena
        id="registro-confirmar"
        name="confirmar"
        etiqueta="Repite tu contraseña"
        autoComplete="new-password"
        required
        error={errores.confirmar}
      />

      <button type="submit" disabled={enviando} className={claseBoton("primario", "lg", "w-full")}>
        {enviando ? (
          <>
            <Loader2 size={18} aria-hidden="true" className="animate-spin" />
            Creando tu cuenta…
          </>
        ) : (
          "Crear mi cuenta"
        )}
      </button>

      <p className="text-sm text-gris-medio">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={`/ingresar${sufijo}`}
          className="inline-flex min-h-11 items-center font-bold text-azul hover:text-azul-oscuro"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
