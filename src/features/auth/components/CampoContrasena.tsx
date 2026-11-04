"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { CampoTexto } from "@/components/ui/CampoTexto";

type Props = Omit<ComponentProps<typeof CampoTexto>, "type" | "derecha">;

/** Campo de contraseña con botón para mostrarla u ocultarla (el estado se anuncia con `aria-pressed`). */
export function CampoContrasena(props: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <CampoTexto
      {...props}
      type={visible ? "text" : "password"}
      autoCapitalize="none"
      spellCheck={false}
      derecha={
        <button
          type="button"
          aria-pressed={visible}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setVisible((v) => !v)}
          className="flex size-11 items-center justify-center rounded-lg text-gris-medio transition-colors duration-200 hover:text-verde-oscuro"
        >
          {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
        </button>
      }
    />
  );
}
