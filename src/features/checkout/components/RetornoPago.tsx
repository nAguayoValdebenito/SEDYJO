"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useHidratado } from "@/features/carrito/useHidratado";
import { motivoRetorno } from "@/lib/utils/webpay";
import { confirmarPagoPedido } from "../acciones";
import { useCheckout } from "../store";
import { EsqueletoCheckout } from "./EsqueletoCheckout";

/**
 * Pantalla a la que vuelve el cliente desde Transbank. La API ya confirmó (o no) el cobro: aquí
 * solo se consulta el estado real del pedido y se lleva al cliente a la pantalla de éxito o de
 * error. Si la dirección trae un motivo (p. ej. "cancelado"), solo sirve para afinar el mensaje.
 */
export function RetornoPago() {
  const router = useRouter();
  const params = useSearchParams();
  const hidratado = useHidratado();
  const guardarPedido = useCheckout((s) => s.guardarPedido);
  const guardarError = useCheckout((s) => s.guardarError);
  const iniciado = useRef(false);

  useEffect(() => {
    // Se espera a que el estado guardado de la compra termine de cargarse para no pisarlo.
    if (!hidratado || iniciado.current) return;
    iniciado.current = true;
    const pedidoId = params.get("pedido") ?? "";
    const motivo = motivoRetorno(params.get("motivo"));

    void confirmarPagoPedido(pedidoId)
      .then((pago) => {
        if (pago.ok) {
          guardarPedido(pago.pedido);
          router.replace("/checkout/exito");
        } else {
          guardarError(motivo ?? pago.motivo);
          router.replace("/checkout/error");
        }
      })
      .catch(() => {
        guardarError("invalido");
        router.replace("/checkout/error");
      });
  }, [hidratado, params, guardarPedido, guardarError, router]);

  if (!hidratado) return <EsqueletoCheckout alto="h-[240px]" />;
  return (
    <div
      role="status"
      className="flex max-w-xl items-center gap-3 rounded-xl border border-borde bg-white p-6"
    >
      <Loader2 size={22} aria-hidden="true" className="animate-spin text-verde" />
      <p className="font-medium">Confirmando tu pago con Webpay… no cierres esta página.</p>
    </div>
  );
}
