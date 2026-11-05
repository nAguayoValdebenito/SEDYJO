"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { claseBoton } from "@/components/ui/boton";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { ResumenErrores } from "@/components/ui/ResumenErrores";
import { erroresPorCampo, recuperacionSchema } from "@/lib/validation/auth";
import { solicitarRecuperacion } from "../acciones";

/** "Olvidé mi contraseña": responde siempre igual para no revelar qué correos tienen cuenta. */
export function FormularioRecuperar() {
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [enviadoA, setEnviadoA] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const resumen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (intento === 0) return;
    resumen.current?.focus();
  }, [intento]);

  if (enviadoA) {
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
            Si <strong>{enviadoA}</strong> tiene una cuenta, te enviaremos las instrucciones para
            crear una contraseña nueva. El enlace vale 60 minutos. Revisa también tu carpeta de
            spam.
          </span>
        </p>
        <Link href="/ingresar" className={claseBoton("primario", "lg", "self-start")}>
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const correo = String(new FormData(evento.currentTarget).get("correo") ?? "");

    const validacion = recuperacionSchema.safeParse({ correo });
    if (!validacion.success) {
      setErrores(erroresPorCampo(validacion.error));
      setIntento((n) => n + 1);
      return;
    }

    setErrores({});
    setEnviando(true);
    try {
      const resultado = await solicitarRecuperacion({ correo });
      if (resultado.ok) setEnviadoA(validacion.data.correo);
      else {
        setErrores(resultado.campos);
        setIntento((n) => n + 1);
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate aria-busy={enviando} className="flex flex-col gap-4">
      <ResumenErrores
        ref={resumen}
        errores={errores}
        etiquetas={{ correo: "Correo" }}
        prefijo="recuperar"
      />
      <CampoTexto
        id="recuperar-correo"
        name="correo"
        type="email"
        etiqueta="Correo de tu cuenta"
        autoComplete="email"
        inputMode="email"
        required
        error={errores.correo}
      />
      <button type="submit" disabled={enviando} className={claseBoton("primario", "lg", "w-full")}>
        {enviando ? (
          <>
            <Loader2 size={18} aria-hidden="true" className="animate-spin" />
            Enviando…
          </>
        ) : (
          "Enviar instrucciones"
        )}
      </button>
      <Link
        href="/ingresar"
        className="inline-flex min-h-11 items-center text-sm font-bold text-azul hover:text-azul-oscuro"
      >
        Volver a iniciar sesión
      </Link>
    </form>
  );
}
