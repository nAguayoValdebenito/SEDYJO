import type { Metadata } from "next";
import { Suspense } from "react";
import { TarjetaFormulario } from "@/components/ui/TarjetaFormulario";
import { FormularioNuevaContrasena } from "@/features/auth/components/FormularioNuevaContrasena";
import { PanelOfertaDelDia } from "@/features/promociones/components/PanelOfertaDelDia";

// El enlace del correo lleva el token en la URL: no se envía a otros sitios y no se indexa.
export const metadata: Metadata = {
  title: "Crear contraseña nueva",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/** Destino del enlace del correo de recuperación (`/recuperar/nueva?token=…`). */
export default function PaginaNuevaContrasena() {
  return (
    <TarjetaFormulario
      lateral={
        <Suspense fallback={null}>
          <PanelOfertaDelDia />
        </Suspense>
      }
      titulo="Crea tu contraseña nueva"
      descripcion="Elige una contraseña que no uses en otros sitios. Al guardarla, cerramos tus sesiones abiertas."
    >
      <Suspense fallback={<div className="min-h-64" aria-hidden="true" />}>
        <FormularioNuevaContrasena />
      </Suspense>
    </TarjetaFormulario>
  );
}
