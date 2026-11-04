"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { PaginaEstado } from "@/components/ui/PaginaEstado";
import { claseBoton } from "@/components/ui/boton";

/** Error inesperado en una página: permite reintentar sin perder el carrito (vive en el navegador). */
export default function ErrorPagina({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PaginaEstado
      Icono={TriangleAlert}
      titulo="Algo salió mal"
      acciones={
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => retry()} className={claseBoton("primario", "lg")}>
            Reintentar
          </button>
          <Link href="/" className={claseBoton("contorno", "lg")}>
            Ir al inicio
          </Link>
        </div>
      }
    >
      <p role="alert">
        No pudimos mostrar esta página. Puede ser un problema pasajero: intenta de nuevo. Tu carrito
        sigue guardado en este dispositivo.
      </p>
    </PaginaEstado>
  );
}
