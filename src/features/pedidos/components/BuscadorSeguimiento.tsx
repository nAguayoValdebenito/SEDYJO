"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, SearchX } from "lucide-react";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { ResumenErrores } from "@/components/ui/ResumenErrores";
import { claseBoton } from "@/components/ui/boton";
import { AvisoModoDemostracion } from "@/features/auth/components/AvisoModoDemostracion";
import { erroresPorCampo, seguimientoSchema } from "@/lib/validation/auth";
import type { Pedido } from "@/types";
import { useCheckout } from "@/features/checkout/store";
import { buscarPedidoPublico } from "../acciones";
import { VistaPedido } from "./VistaPedido";

type Resultado = { tipo: "pedido"; pedido: Pedido } | { tipo: "no-encontrado" } | { tipo: "error" };

const ETIQUETAS = { numero: "Número de pedido", correo: "Correo electrónico" };

/** `/seguimiento`: consulta sin cuenta con número de pedido y correo. `?pedido=` rellena el número. */
export function BuscadorSeguimiento() {
  const pedidoReciente = useCheckout((s) => s.pedidoReciente);
  const params = useSearchParams();
  const [numero, setNumero] = useState(params.get("pedido") ?? "");
  const [correo, setCorreo] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const resumenRef = useRef<HTMLDivElement>(null);

  const alEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultado(null);

    const validado = seguimientoSchema.safeParse({ numero, correo });
    if (!validado.success) {
      setErrores(erroresPorCampo(validado.error));
      requestAnimationFrame(() => resumenRef.current?.focus());
      return;
    }
    setErrores({});
    setCargando(true);
    try {
      const pedido =
        pedidoReciente?.numero === validado.data.numero.trim().toUpperCase() &&
        pedidoReciente.correo.toLowerCase() === validado.data.correo.trim().toLowerCase()
          ? pedidoReciente
          : await buscarPedidoPublico(validado.data.numero, validado.data.correo);
      setResultado(pedido ? { tipo: "pedido", pedido } : { tipo: "no-encontrado" });
    } catch {
      setResultado({ tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={alEnviar} noValidate className="flex max-w-md flex-col gap-4">
        <p className="text-gris-medio">
          Ingresa el número que te enviamos al comprar y el correo que usaste.
        </p>
        <AvisoModoDemostracion>
          Prueba con <strong>SED-10482</strong> y <strong>demo@sedyjo.cl</strong>.
        </AvisoModoDemostracion>

        <ResumenErrores ref={resumenRef} prefijo="seg" errores={errores} etiquetas={ETIQUETAS} />

        <CampoTexto
          id="seg-numero"
          etiqueta="Número de pedido"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          error={errores.numero}
          autoComplete="off"
          placeholder="SED-10482"
          required
        />
        <CampoTexto
          id="seg-correo"
          etiqueta="Correo electrónico"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          error={errores.correo}
          autoComplete="email"
          required
        />

        <button
          type="submit"
          disabled={cargando}
          aria-busy={cargando}
          className={claseBoton("primario", "lg")}
        >
          {cargando ? (
            <>
              <Loader2 size={18} aria-hidden="true" className="animate-spin" />
              Buscando…
            </>
          ) : (
            "Ver estado de mi pedido"
          )}
        </button>
      </form>

      <div aria-live="polite">
        {resultado?.tipo === "no-encontrado" && (
          <div
            role="alert"
            className="flex max-w-md items-start gap-3 rounded-[10px] border border-error bg-white p-4"
          >
            <SearchX size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-error" />
            <div>
              <p className="font-bold text-error">No encontramos ese pedido</p>
              <p className="text-sm text-gris-medio">
                Revisa que el número y el correo sean los de tu compra.
              </p>
            </div>
          </div>
        )}
        {resultado?.tipo === "error" && (
          <p
            role="alert"
            className="max-w-md rounded-[10px] border border-error bg-white p-4 font-bold text-error"
          >
            No pudimos consultar tu pedido. Intenta de nuevo en un momento.
          </p>
        )}
        {resultado?.tipo === "pedido" && (
          <VistaPedido pedido={resultado.pedido} recomprar={false} />
        )}
      </div>
    </div>
  );
}
