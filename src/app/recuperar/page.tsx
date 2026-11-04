import { Suspense } from "react";
import type { Metadata } from "next";
import { PanelOfertaDelDia } from "@/features/promociones/components/PanelOfertaDelDia";
import { TarjetaFormulario } from "@/components/ui/TarjetaFormulario";
import { AvisoModoDemostracion } from "@/features/auth/components/AvisoModoDemostracion";
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
      aviso={<AvisoModoDemostracion>No se envía ningún correo real.</AvisoModoDemostracion>}
    >
      <FormularioRecuperar />
    </TarjetaFormulario>
  );
}
