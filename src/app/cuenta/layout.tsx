import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { Contenedor } from "@/components/ui/Contenedor";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { NavegacionCuenta } from "@/features/auth/components/NavegacionCuenta";
import { ProtegidoPorSesion } from "@/features/auth/components/ProtegidoPorSesion";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Marco de todas las páginas de la cuenta: solo con sesión iniciada y con su navegación. */
export default function LayoutCuenta({ children }: { children: ReactNode }) {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Contenedor className="mt-6 min-h-[110vh] pb-10">
        <Suspense fallback={<Esqueleto className="h-40 w-full rounded-[10px]" />}>
          <ProtegidoPorSesion>
            <NavegacionCuenta />
            {children}
          </ProtegidoPorSesion>
        </Suspense>
      </Contenedor>
    </main>
  );
}
