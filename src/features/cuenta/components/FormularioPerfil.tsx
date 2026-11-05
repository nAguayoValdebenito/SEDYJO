"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, CircleCheck, Loader2 } from "lucide-react";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { ResumenErrores } from "@/components/ui/ResumenErrores";
import { claseBoton } from "@/components/ui/boton";
import { CampoContrasena } from "@/features/auth/components/CampoContrasena";
import { useSesion } from "@/features/auth/store";
import { erroresPorCampo } from "@/lib/validation/auth";
import { perfilSchema } from "@/lib/validation/cuenta";
import { actualizarPerfil } from "../acciones";

const ETIQUETAS = { nombre: "Nombre", correo: "Correo", contrasena: "Contraseña actual" };

/** Edita el nombre y el correo de la cuenta (validación en el navegador y en el servidor). */
export function FormularioPerfil() {
  const usuario = useSesion((s) => s.usuario);
  const actualizarUsuario = useSesion((s) => s.actualizarUsuario);

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [correoEscrito, setCorreoEscrito] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const resumen = useRef<HTMLDivElement>(null);
  const alerta = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (intento === 0) return;
    (resumen.current ?? alerta.current)?.focus();
  }, [intento]);

  if (!usuario) return null;

  const cambiaElCorreo =
    correoEscrito !== null && correoEscrito.trim().toLowerCase() !== usuario.correo.toLowerCase();

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const entrada = {
      nombre: String(datos.get("nombre") ?? ""),
      correo: String(datos.get("correo") ?? ""),
      contrasena: String(datos.get("contrasena") ?? ""),
    };
    setGuardado(false);

    const validacion = perfilSchema.safeParse(entrada);
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
      const resultado = await actualizarPerfil(entrada);
      if (resultado.ok) {
        actualizarUsuario(resultado.datos);
        setCorreoEscrito(null);
        setGuardado(true);
        return;
      }
      if (resultado.error.codigo === "sesion") useSesion.getState().olvidarUsuario();
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
      key={`${usuario.nombre}|${usuario.correo}`}
      method="post"
      onSubmit={enviar}
      noValidate
      aria-busy={enviando}
      className="flex max-w-lg flex-col gap-4"
    >
      <ResumenErrores ref={resumen} errores={errores} etiquetas={ETIQUETAS} prefijo="perfil" />

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
        id="perfil-nombre"
        name="nombre"
        etiqueta="Nombre"
        defaultValue={usuario.nombre}
        autoComplete="name"
        required
        error={errores.nombre}
      />
      <CampoTexto
        id="perfil-correo"
        name="correo"
        type="email"
        etiqueta="Correo"
        defaultValue={usuario.correo}
        autoComplete="email"
        inputMode="email"
        required
        error={errores.correo}
        onChange={(e) => setCorreoEscrito(e.target.value)}
      />
      {cambiaElCorreo && (
        <CampoContrasena
          id="perfil-contrasena"
          name="contrasena"
          etiqueta="Contraseña actual"
          autoComplete="current-password"
          ayuda="Por seguridad, para cambiar el correo escribe tu contraseña actual."
          required
          error={errores.contrasena}
        />
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={enviando} className={claseBoton("primario", "lg")}>
          {enviando ? (
            <>
              <Loader2 size={18} aria-hidden="true" className="animate-spin" />
              Guardando…
            </>
          ) : (
            "Guardar cambios"
          )}
        </button>
        <p role="status" className="text-sm font-bold text-verde-oscuro">
          {guardado && (
            <span className="contenido-entra inline-flex items-center gap-1.5">
              <CircleCheck size={18} aria-hidden="true" />
              Guardamos tus datos.
            </span>
          )}
        </p>
      </div>
    </form>
  );
}
