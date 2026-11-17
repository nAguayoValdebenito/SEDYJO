"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { claseBoton } from "@/components/ui/boton";
import type { Pedido } from "@/types";

/**
 * Descarga la boleta electrónica (PDF). Solo aparece cuando la boleta ya quedó emitida en el SII.
 * En el seguimiento público se pasa `correo` (el que escribió el cliente) para identificar el pedido.
 */
export function BotonBoleta({ pedido, correo }: { pedido: Pedido; correo?: string }) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!pedido.boleta) return null;

  async function descargar() {
    setCargando(true);
    setError(null);
    try {
      const respuesta = correo
        ? await fetch("/boleta", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numero: pedido.numero, correo }),
          })
        : await fetch(`/boleta?pedido=${encodeURIComponent(pedido.id)}`);
      if (!respuesta.ok) {
        const cuerpo = (await respuesta.json().catch(() => null)) as { error?: string } | null;
        setError(cuerpo?.error ?? "No pudimos descargar la boleta. Intenta de nuevo.");
        return;
      }
      const url = URL.createObjectURL(await respuesta.blob());
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `boleta-${pedido.boleta?.folio}.pdf`;
      enlace.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("No pudimos descargar la boleta. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={descargar}
        disabled={cargando}
        aria-busy={cargando}
        className={claseBoton("contorno", "md")}
      >
        {cargando ? (
          <Loader2 size={18} aria-hidden="true" className="animate-spin" />
        ) : (
          <Download size={18} aria-hidden="true" />
        )}
        Descargar boleta N° {pedido.boleta.folio}
      </button>
      {error && (
        <p role="alert" className="text-sm font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
