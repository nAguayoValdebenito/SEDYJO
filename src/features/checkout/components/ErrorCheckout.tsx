"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { claseBoton } from "@/components/ui/boton";
import { useHidratado } from "@/features/carrito/useHidratado";
import { useCheckout } from "../store";
import { EsqueletoCheckout } from "./EsqueletoCheckout";
import { IndicadorCheckout } from "./IndicadorCheckout";

const MENSAJES = {
  rechazado: "El pago de demostración fue rechazado. Puedes intentarlo otra vez.",
  cancelado: "Cancelaste el pago de demostración. Tu carrito sigue guardado.",
  "tiempo-agotado": "La sesión de pago terminó. Inicia un nuevo intento.",
  invalido: "No pudimos validar el pago. Revisa tus datos e intenta de nuevo.",
};

export function ErrorCheckout() {
  const router = useRouter();
  const hidratado = useHidratado();
  const motivo = useCheckout((s) => s.motivoError);
  const cambiarPaso = useCheckout((s) => s.cambiarPaso);
  if (!hidratado) return <EsqueletoCheckout alto="h-[300px]" />;
  return (
    <>
      <IndicadorCheckout paso="pago" />
      <div className="max-w-2xl rounded-xl border border-borde bg-white p-5 sm:p-7">
        <AlertCircle size={36} aria-hidden="true" className="text-error" />
        <h2 className="mt-3 font-titulos text-xl font-extrabold">No se completó el pago</h2>
        <p role="alert" className="mt-2 text-gris-medio">
          {motivo ? MENSAJES[motivo] : "No hay un pago reciente para revisar."}
        </p>
        <p className="mt-3 text-sm">Tu carrito no se ha vaciado ni se ha realizado ningún cobro.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              cambiarPaso("pago");
              router.push("/checkout");
            }}
            className={claseBoton("primario", "lg")}
          >
            Reintentar el pago
          </button>
          <Link href="/carrito" className={claseBoton("contorno", "lg")}>
            Volver al carrito
          </Link>
        </div>
      </div>
    </>
  );
}
