import { Suspense } from "react";
import type { Metadata } from "next";
import { PanelOfertaDelDia } from "@/features/promociones/components/PanelOfertaDelDia";
import { TarjetaFormulario } from "@/components/ui/TarjetaFormulario";
import { FormularioRecuperar } from "@/features/auth/components/FormularioRecuperar";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  robots: { index: false, follow: false },
};

export default function PaginaRecuperar() {
  return (
    <TarjetaFormulario
      lateral={
        <Suspense fallback={null}>
          <PanelOfertaDelDia />
        </Suspense>
      }
      titulo="Recuperar contraseña"
      descripcion="Escribe el correo de tu cuenta y te diremos cómo crear una contraseña nueva."
    >
      <FormularioRecuperar />
    </TarjetaFormulario>
  );
}
