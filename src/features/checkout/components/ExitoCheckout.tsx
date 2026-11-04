"use client";

import Link from "next/link";
import { useEffect, type CSSProperties } from "react";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { claseBoton } from "@/components/ui/boton";
import { useCarrito } from "@/features/carrito/store";
import { useHidratado } from "@/features/carrito/useHidratado";
import { ResumenPedido } from "@/features/pedidos/components/ResumenPedido";
import { PLAZO_DESPACHO } from "@/lib/config";
import { useCheckout } from "../store";
import { EsqueletoCheckout } from "./EsqueletoCheckout";
import { IndicadorCheckout } from "./IndicadorCheckout";

/** Check que se dibuja dentro de un anillo, con burbujas de marca que suben. */
function CheckAnimado() {
  return (
    <div className="relative size-16" aria-hidden="true">
      <svg viewBox="0 0 48 48" className="exito-anillo size-16">
        <circle cx="24" cy="24" r="22" fill="none" strokeWidth="3" className="stroke-verde" />
        <path
          d="M14 25l7 7 13-15"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={32}
          className="exito-trazo stroke-verde"
        />
      </svg>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          style={{ "--i": i, left: `${8 + i * 17}%` } as CSSProperties}
          className="exito-burbuja absolute bottom-2 size-2.5 rounded-full border border-verde-claro bg-verde-suave"
        />
      ))}
    </div>
  );
}

export function ExitoCheckout() {
  const hidratado = useHidratado();
  const { pedidoReciente, carritoVaciado, marcarCarritoVaciado, limpiarFormulario } = useCheckout();
  const vaciar = useCarrito((s) => s.vaciar);

  useEffect(() => {
    if (!pedidoReciente || carritoVaciado) return;
    vaciar();
    marcarCarritoVaciado();
    limpiarFormulario();
  }, [pedidoReciente, carritoVaciado, vaciar, marcarCarritoVaciado, limpiarFormulario]);

  if (!hidratado)
    return (
      <>
        <EncabezadoSeccion titulo="Tu compra" nivel={1} />
        <EsqueletoCheckout alto="h-[320px]" />
      </>
    );
  if (!pedidoReciente)
    return (
      <>
        <EncabezadoSeccion titulo="Tu compra" nivel={1} />
        <div className="rounded-xl border border-borde bg-white p-6">
          <p className="mb-4">No hay un pedido reciente.</p>
          <Link href="/" className={claseBoton("primario", "lg")}>
            Seguir comprando
          </Link>
        </div>
      </>
    );

  return (
    <>
      <EncabezadoSeccion titulo="Compra confirmada" nivel={1} />
      <IndicadorCheckout paso="confirmacion" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <section className="rounded-xl border border-borde bg-white p-5 sm:p-7">
          <CheckAnimado />
          <h2 className="mt-3 font-titulos text-2xl font-extrabold">
            Pedido {pedidoReciente.numero} recibido
          </h2>
          <p role="status" className="mt-2 text-gris-medio">
            La compra de demostración terminó correctamente. No se realizó ningún cobro.
          </p>
          <p className="mt-4 text-sm">
            Entrega: <strong>despacho a domicilio</strong> en {PLAZO_DESPACHO}.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {pedidoReciente.usuarioId && (
              <Link
                href={`/cuenta/pedidos/${pedidoReciente.id}`}
                className={claseBoton("contorno", "lg")}
              >
                Ver en mis pedidos
              </Link>
            )}
            <Link
              href={`/seguimiento?pedido=${encodeURIComponent(pedidoReciente.numero)}`}
              className={claseBoton("contorno", "lg")}
            >
              Seguir mi pedido
            </Link>
            <Link href="/" className={claseBoton("primario", "lg")}>
              Seguir comprando
            </Link>
          </div>
        </section>
        <section
          aria-label="Resumen del pedido"
          className="rounded-xl border border-borde bg-white p-4"
        >
          <ResumenPedido pedido={pedidoReciente} />
        </section>
      </div>
    </>
  );
}
