"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { claseBoton } from "@/components/ui/boton";
import { useHidratado } from "@/features/carrito/useHidratado";
import { formatoPrecio } from "@/lib/utils/format";
import { confirmarPagoSimulado } from "../acciones";
import { useCheckout } from "../store";
import { EsqueletoCheckout } from "./EsqueletoCheckout";
import { IndicadorCheckout } from "./IndicadorCheckout";
import { ResumenCheckout } from "./ResumenCheckout";

export function PagoSimulado() {
  const router = useRouter();
  const hidratado = useHidratado();
  const { token, resumenValidado, guardarPedido, guardarError } = useCheckout();
  const [cargando, setCargando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");

  const procesar = async (resultado: "exito" | "error") => {
    if (!token || cargando) return;
    setError("");
    setCargando(true);
    setConfirmando(true);
    try {
      // Pausa breve para que se vea la confirmación con la pasarela antes de cambiar de pantalla.
      await new Promise((resolver) => setTimeout(resolver, 760));
      const respuesta = await confirmarPagoSimulado(token, resultado);
      if (respuesta.ok) {
        guardarPedido(respuesta.pedido);
        router.replace("/checkout/exito");
      } else {
        guardarError(respuesta.motivo);
        router.replace("/checkout/error");
      }
    } catch {
      setError("No pudimos procesar la simulación. Intenta de nuevo.");
    } finally {
      setCargando(false);
      setConfirmando(false);
    }
  };

  if (!hidratado) return <EsqueletoCheckout alto="h-[420px]" />;
  if (!token || !resumenValidado)
    return (
      <div className="rounded-xl border border-borde bg-white p-6">
        <p className="mb-4">No hay un pago pendiente.</p>
        <Link href="/checkout" className={claseBoton("primario", "lg")}>
          Volver al checkout
        </Link>
      </div>
    );

  return (
    <>
      <IndicadorCheckout paso="pago" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <section
          aria-labelledby="pasarela-titulo"
          className="order-2 rounded-xl border border-borde bg-white p-5 sm:p-7 lg:order-1"
        >
          <h2 id="pasarela-titulo" className="font-titulos text-xl font-extrabold">
            Pasarela de demostración
          </h2>
          <p className="mt-3 text-gris-medio">
            Pagas con Webpay Plus de Transbank (simulado). Selecciona el resultado de prueba.
          </p>
          <p className="mt-3 rounded-lg bg-verde-suave p-3 text-sm font-medium text-verde-oscuro">
            Modo demostración: no se piden datos de tarjeta ni se realiza un cobro real.
          </p>
          <p className="mt-4 text-sm">
            Subtotal validado: <strong>{formatoPrecio(resumenValidado.subtotal)}</strong>.{" "}
            {resumenValidado.total === null
              ? "Costo de despacho y total por confirmar."
              : `Total: ${formatoPrecio(resumenValidado.total)}.`}
          </p>
          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-error p-3 text-error">
              {error}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap" aria-busy={cargando}>
            <button
              type="button"
              disabled={cargando}
              onClick={() => procesar("exito")}
              className={claseBoton("primario", "lg")}
            >
              {cargando ? (
                <>
                  <Loader2 size={18} aria-hidden="true" className="animate-spin" />
                  Procesando…
                </>
              ) : (
                "Simular pago exitoso"
              )}
            </button>
            <button
              type="button"
              disabled={cargando}
              onClick={() => procesar("error")}
              className={claseBoton("contorno", "lg")}
            >
              Simular pago rechazado
            </button>
            <button
              type="button"
              disabled={cargando}
              onClick={() => {
                guardarError("cancelado");
                router.replace("/checkout/error");
              }}
              className="min-h-11 px-3 text-sm font-bold text-azul underline underline-offset-2"
            >
              Volver y cancelar
            </button>
          </div>
          {confirmando && (
            <div className="mt-5">
              <p className="text-sm font-bold text-verde-oscuro">Confirmando con Webpay Plus…</p>
              <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-borde">
                <div className="progreso-pago h-full rounded-full bg-verde" />
              </div>
            </div>
          )}
          <span role="status" className="sr-only">
            {confirmando ? "Confirmando el pago simulado" : ""}
          </span>
        </section>
        <div className="order-1 lg:order-2">
          <ResumenCheckout
            items={resumenValidado.items}
            subtotalValidado={resumenValidado.subtotal}
          />
        </div>
      </div>
    </>
  );
}
