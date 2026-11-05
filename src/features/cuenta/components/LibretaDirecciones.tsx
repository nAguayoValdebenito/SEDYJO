"use client";

import { useRef, useState } from "react";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { BurbujasDecorativas } from "@/components/ui/BurbujasDecorativas";
import { claseBoton } from "@/components/ui/boton";
import { Insignia } from "@/components/ui/Insignia";
import { useSesion } from "@/features/auth/store";
import { MAX_DIRECCIONES, type EntradaDireccionLibreta } from "@/lib/utils/direcciones";
import type { DireccionGuardada, ZonaDespacho } from "@/types";
import { useCuenta, useDirecciones } from "../store";
import { FormularioDireccion } from "./FormularioDireccion";

type Modo = { tipo: "lista" } | { tipo: "nueva" } | { tipo: "editar"; id: string };

const controlTexto =
  "inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-azul transition-colors duration-200 hover:bg-gris-fondo hover:text-azul-oscuro";

/** Libreta de direcciones: lista, alta, edición, eliminación y dirección principal. */
export function LibretaDirecciones({ zonas }: { zonas: ZonaDespacho[] }) {
  const usuario = useSesion((s) => s.usuario);
  const usuarioId = usuario?.id ?? null;
  const direcciones = useDirecciones(usuarioId);
  const guardar = useCuenta((s) => s.guardar);
  const eliminar = useCuenta((s) => s.eliminar);
  const hacerPrincipal = useCuenta((s) => s.hacerPrincipal);
  const estadoCarga = useCuenta((s) => s.estado);
  const recargar = useCuenta((s) => s.cargar);

  const [modo, setModo] = useState<Modo>({ tipo: "lista" });
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const botonAgregar = useRef<HTMLButtonElement>(null);
  const encabezado = useRef<HTMLHeadingElement>(null);

  if (!usuarioId) return null;

  const volverALista = (mensaje: string, enfocarEncabezado = false) => {
    setModo({ tipo: "lista" });
    setAviso(mensaje);
    // El formulario se desmonta: el foco vuelve a un control estable de la lista.
    requestAnimationFrame(() =>
      enfocarEncabezado ? encabezado.current?.focus() : botonAgregar.current?.focus(),
    );
  };

  const guardarNueva = async (entrada: EntradaDireccionLibreta, principal: boolean) => {
    const error = await guardar(entrada, { principal });
    if (!error) volverALista("Dirección guardada.");
    return error;
  };
  const guardarEdicion = async (id: string, entrada: EntradaDireccionLibreta) => {
    const error = await guardar(entrada, { id });
    if (!error) volverALista("Dirección actualizada.");
    return error;
  };
  const quitar = async (d: DireccionGuardada) => {
    const error = await eliminar(d.id);
    setConfirmando(null);
    setAviso(error ?? `Eliminamos la dirección ${d.etiqueta}.`);
    requestAnimationFrame(() => encabezado.current?.focus());
  };

  const enEdicion = modo.tipo === "editar" ? direcciones.find((d) => d.id === modo.id) : undefined;
  const llena = direcciones.length >= MAX_DIRECCIONES;

  return (
    <div className="flex flex-col gap-6">
      <p role="status" className="sr-only">
        {aviso}
      </p>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            ref={encabezado}
            tabIndex={-1}
            className="font-titulos text-xl font-extrabold outline-none"
          >
            Mis direcciones
          </h2>
          <p className="text-sm text-gris-texto">
            Se usan en el pago. Puedes guardar hasta {MAX_DIRECCIONES}.
          </p>
        </div>
        {modo.tipo === "lista" && (
          <button
            ref={botonAgregar}
            type="button"
            disabled={llena}
            onClick={() => setModo({ tipo: "nueva" })}
            className={claseBoton("primario", "md")}
          >
            <Plus size={18} aria-hidden="true" />
            Agregar dirección
          </button>
        )}
      </div>

      {modo.tipo === "nueva" && (
        <FormularioDireccion
          zonas={zonas}
          ofrecerPrincipal={direcciones.length > 0}
          onGuardar={guardarNueva}
          onCancelar={() => volverALista("")}
        />
      )}
      {modo.tipo === "editar" && enEdicion && (
        <FormularioDireccion
          zonas={zonas}
          inicial={enEdicion}
          onGuardar={(entrada) => guardarEdicion(enEdicion.id, entrada)}
          onCancelar={() => volverALista("")}
        />
      )}

      {estadoCarga === "error" && (
        <p
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-lg border border-error p-3 text-sm text-error"
        >
          No pudimos cargar tus direcciones.
          <button type="button" onClick={() => void recargar()} className={controlTexto}>
            Reintentar
          </button>
        </p>
      )}

      {estadoCarga === "listo" && direcciones.length === 0 && modo.tipo === "lista" && (
        <div className="relative isolate flex flex-col items-start gap-3 overflow-hidden rounded-2xl border border-borde bg-white p-6 sm:p-8">
          <BurbujasDecorativas tono="claro" className="-z-10 opacity-70" />
          <MapPin size={40} strokeWidth={1.5} aria-hidden="true" className="text-gris-texto" />
          <h3 className="font-titulos text-xl font-extrabold">Aún no guardas direcciones</h3>
          <p className="max-w-md text-gris-medio">
            Guarda tu dirección y la tendrás lista para pagar más rápido.
          </p>
        </div>
      )}

      {direcciones.length > 0 && (
        <ul className="flex flex-col gap-3">
          {direcciones.map((d) => (
            <li
              key={d.id}
              className="contenido-entra flex flex-col gap-3 rounded-[10px] border border-borde bg-white p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-titulos text-lg font-extrabold">{d.etiqueta}</h3>
                  {d.principal && <Insignia variante="oscura">Principal</Insignia>}
                </div>
                <address className="mt-1 text-sm not-italic text-gris-medio">
                  {d.calle} {d.numero}, {d.comuna}, {d.region}
                  {d.referencia && (
                    <>
                      <br />
                      Referencia: {d.referencia}
                    </>
                  )}
                </address>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-1 sm:justify-end">
                {confirmando === d.id ? (
                  <>
                    <span className="mr-1 text-sm font-bold">¿Eliminar {d.etiqueta}?</span>
                    <button
                      type="button"
                      onClick={() => quitar(d)}
                      className="inline-flex min-h-11 items-center rounded-lg bg-tinta px-4 text-sm font-bold text-white transition-[scale] duration-200 hover:scale-[1.03]"
                    >
                      Sí, eliminar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmando(null)}
                      className={controlTexto}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    {!d.principal && (
                      <button
                        type="button"
                        onClick={async () => {
                          const error = await hacerPrincipal(d.id);
                          setAviso(error ?? `${d.etiqueta} ahora es tu dirección principal.`);
                        }}
                        className={controlTexto}
                      >
                        <Star size={16} aria-hidden="true" />
                        Hacer principal
                        <span className="sr-only"> ({d.etiqueta})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setModo({ tipo: "editar", id: d.id })}
                      className={controlTexto}
                    >
                      <Pencil size={16} aria-hidden="true" />
                      Editar
                      <span className="sr-only"> {d.etiqueta}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmando(d.id)}
                      className={`${controlTexto} text-gris-medio hover:text-error`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      Eliminar
                      <span className="sr-only"> {d.etiqueta}</span>
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {llena && modo.tipo === "lista" && (
        <p className="text-sm text-gris-texto">
          Llegaste al máximo de direcciones. Elimina una para agregar otra.
        </p>
      )}
    </div>
  );
}
