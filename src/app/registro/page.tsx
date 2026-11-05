import type { Metadata } from "next";
import { Suspense } from "react";
import { PanelOfertaDelDia } from "@/features/promociones/components/PanelOfertaDelDia";
import { TarjetaFormulario } from "@/components/ui/TarjetaFormulario";
import { FormularioRegistro } from "@/features/auth/components/FormularioRegistro";

export const metadata: Metadata = { title: "Registrarse", robots: { index: false, follow: false } };

export default function PaginaRegistro() {
  return (
    <TarjetaFormulario
      lateral={
        <Suspense fallback={null}>
          <PanelOfertaDelDia />
        </Suspense>
      }
      titulo="Crear mi cuenta"
      descripcion="Con tu cuenta guardas tus pedidos y compras más rápido."
    >
      <Suspense fallback={<div className="min-h-80" aria-hidden="true" />}>
        <FormularioRegistro />
      </Suspense>
    </TarjetaFormulario>
  );
}
