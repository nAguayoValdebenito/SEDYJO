"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PackageOpen } from "lucide-react";
import { BurbujasDecorativas } from "@/components/ui/BurbujasDecorativas";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { claseBoton } from "@/components/ui/boton";
import { useSesion } from "@/features/auth/store";
import { productosComprados } from "@/lib/utils/pedidos";
import { usePedidos } from "../usePedidos";
import { CargandoPedidos, ErrorCarga } from "./EstadosCarga";
import { ProductosComprados } from "./ProductosComprados";
import { TarjetaPedido } from "./TarjetaPedido";

/** `/cuenta/pedidos`: pedidos anteriores y productos ya comprados, con sus estados de carga. */
export function HistorialPedidos() {
  const usuario = useSesion((s) => s.usuario);
  const datos = usePedidos(usuario?.id ?? null);
  const pedidos = datos.estado === "listo" ? datos.pedidos : null;
  const comprados = useMemo(() => (pedidos ? productosComprados(pedidos) : []), [pedidos]);

  return (
    <>
      <EncabezadoSeccion titulo="Mis pedidos" nivel={1} />

      {datos.estado === "cargando" && <CargandoPedidos />}
      {datos.estado === "error" && <ErrorCarga onReintentar={datos.reintentar} />}

      {pedidos && pedidos.length === 0 && (
        <div className="relative isolate flex flex-col items-start gap-3 overflow-hidden rounded-2xl border border-borde bg-white p-6 sm:p-8">
          <BurbujasDecorativas tono="claro" className="-z-10 opacity-70" />
          <PackageOpen size={40} strokeWidth={1.5} aria-hidden="true" className="text-gris-texto" />
          <h2 className="font-titulos text-xl font-extrabold">Aún no tienes pedidos</h2>
          <p className="text-gris-medio">
            Cuando compres, aquí verás el estado de cada pedido y podrás volver a pedir lo mismo.
          </p>
          <Link href="/" className={claseBoton("primario", "lg")}>
            Ir a comprar
          </Link>
        </div>
      )}

      {pedidos && pedidos.length > 0 && (
        <div className="flex flex-col gap-10">
          <section aria-labelledby="titulo-anteriores" className="flex flex-col gap-3">
            <h2 id="titulo-anteriores" className="font-titulos text-xl font-extrabold">
              Pedidos anteriores
            </h2>
            {pedidos.map((p) => (
              <TarjetaPedido key={p.id} pedido={p} />
            ))}
          </section>

          {comprados.length > 0 && (
            <section aria-labelledby="titulo-comprados" className="flex flex-col gap-3">
              <h2 id="titulo-comprados" className="font-titulos text-xl font-extrabold">
                Lo que ya compraste
              </h2>
              <ProductosComprados productos={comprados} />
            </section>
          )}
        </div>
      )}
    </>
  );
}
