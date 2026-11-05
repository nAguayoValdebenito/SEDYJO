import type { Metadata } from "next";
import { Suspense } from "react";
import { PanelOfertaDelDia } from "@/features/promociones/components/PanelOfertaDelDia";
import { TarjetaFormulario } from "@/components/ui/TarjetaFormulario";
import { FormularioIngreso } from "@/features/auth/components/FormularioIngreso";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default function PaginaIngresar() {
  return (
    <TarjetaFormulario
      lateral={
        <Suspense fallback={null}>
          <PanelOfertaDelDia />
        </Suspense>
      }
      titulo="Iniciar sesión"
      descripcion="Revisa tus pedidos, su estado y vuelve a comprar lo de siempre."
    >
      <Suspense fallback={<div className="min-h-64" aria-hidden="true" />}>
        <FormularioIngreso />
      </Suspense>
    </TarjetaFormulario>
  );
}
