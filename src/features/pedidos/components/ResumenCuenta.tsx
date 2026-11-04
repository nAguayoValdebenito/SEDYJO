"use client";

import Link from "next/link";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { claseBoton } from "@/components/ui/boton";
import { useSesion } from "@/features/auth/store";
import { formatoPrecio } from "@/lib/utils/format";
import { usePedidos } from "../usePedidos";
import { CargandoPedidos, ErrorCarga } from "./EstadosCarga";
import { TarjetaPedido } from "./TarjetaPedido";

/** `/cuenta`: datos del cliente, cifras de su historial y el último pedido. */
export function ResumenCuenta() {
  const usuario = useSesion((s) => s.usuario);
  const datos = usePedidos(usuario?.id ?? null);
  if (!usuario) return null;

  const pedidos = datos.estado === "listo" ? datos.pedidos : [];
  const vigentes = pedidos.filter((p) => p.estado !== "entregado" && p.estado !== "cancelado");
  const gastado = pedidos
    .filter((p) => p.estado !== "cancelado")
    .reduce((suma, p) => suma + (p.total ?? 0), 0);

  return (
    <>
      <EncabezadoSeccion titulo="Resumen de tu cuenta" nivel={1} />

      <dl className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[10px] border border-borde bg-white p-4">
          <dt className="text-sm text-gris-texto">Nombre</dt>
          <dd className="font-bold">{usuario.nombre}</dd>
          <dd className="break-all text-sm text-gris-medio">{usuario.correo}</dd>
        </div>
        <div className="rounded-[10px] border border-borde bg-white p-4">
          <dt className="text-sm text-gris-texto">Pedidos en curso</dt>
          <dd className="font-titulos text-2xl font-extrabold tabular-nums">
            {datos.estado === "listo" ? vigentes.length : "–"}
          </dd>
        </div>
        <div className="rounded-[10px] border border-borde bg-white p-4">
          <dt className="text-sm text-gris-texto">Total confirmado</dt>
          <dd className="font-titulos text-2xl font-extrabold tabular-nums">
            {datos.estado === "listo" ? formatoPrecio(gastado) : "–"}
          </dd>
        </div>
      </dl>

      <section aria-labelledby="titulo-ultimo" className="flex flex-col gap-3">
        <h2 id="titulo-ultimo" className="font-titulos text-xl font-extrabold">
          Tu último pedido
        </h2>
        {datos.estado === "cargando" && <CargandoPedidos cantidad={1} />}
        {datos.estado === "error" && <ErrorCarga onReintentar={datos.reintentar} />}
        {datos.estado === "listo" && pedidos.length === 0 && (
          <p className="text-gris-medio">Todavía no has hecho pedidos.</p>
        )}
        {datos.estado === "listo" && pedidos[0] && <TarjetaPedido pedido={pedidos[0]} />}
        <div className="flex flex-wrap gap-3 pt-1">
          <Link href="/cuenta/pedidos" className={claseBoton("contorno", "md")}>
            Ver todos mis pedidos
          </Link>
          <Link href="/seguimiento" className={claseBoton("contorno", "md")}>
            Seguimiento de pedido
          </Link>
        </div>
      </section>
    </>
  );
}
