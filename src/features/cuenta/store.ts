"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { useSesion } from "@/features/auth/store";
import type { DireccionGuardada, ResultadoOperacion } from "@/types";
import {
  eliminarDireccion,
  guardarDireccion,
  marcarDireccionPrincipal,
  obtenerDirecciones,
} from "./acciones";

/**
 * Libreta de direcciones del cliente. Vive en el servidor (cuenta real); aquí solo se guarda la
 * última lista leída para compartirla entre el checkout y `/cuenta/direcciones`.
 */
type EstadoCuenta = {
  direcciones: DireccionGuardada[];
  /** `idle` aún no se pidió; `listo` ya se leyó; `error` falló la lectura. */
  estado: "idle" | "cargando" | "listo" | "error";
  cargar: () => Promise<void>;
  guardar: (
    entrada: Omit<DireccionGuardada, "id" | "principal">,
    opciones?: { id?: string; principal?: boolean },
  ) => Promise<string | null>;
  eliminar: (id: string) => Promise<string | null>;
  hacerPrincipal: (id: string) => Promise<string | null>;
  limpiar: () => void;
};

/** Aplica el resultado de una operación; devuelve el mensaje de error o `null` si salió bien. */
function aplicar(
  resultado: ResultadoOperacion<DireccionGuardada[]>,
  poner: (lista: DireccionGuardada[]) => void,
): string | null {
  if (resultado.ok) {
    poner(resultado.datos);
    return null;
  }
  if (resultado.error.codigo === "sesion") useSesion.getState().olvidarUsuario();
  return resultado.error.mensaje;
}

export const useCuenta = create<EstadoCuenta>()((set, get) => {
  const poner = (direcciones: DireccionGuardada[]) => set({ direcciones, estado: "listo" });
  return {
    direcciones: [],
    estado: "idle",
    cargar: async () => {
      if (get().estado === "cargando") return;
      set({ estado: "cargando" });
      try {
        const resultado = await obtenerDirecciones();
        if (aplicar(resultado, poner) !== null) set({ estado: "error" });
      } catch {
        set({ estado: "error" });
      }
    },
    guardar: async (entrada, opciones) => aplicar(await guardarDireccion(entrada, opciones), poner),
    eliminar: async (id) => aplicar(await eliminarDireccion(id), poner),
    hacerPrincipal: async (id) => aplicar(await marcarDireccionPrincipal(id), poner),
    limpiar: () => set({ direcciones: [], estado: "idle" }),
  };
});

const SIN_DIRECCIONES: DireccionGuardada[] = [];

/** Direcciones guardadas del cliente (vacío sin sesión). Las pide una vez al servidor. */
export function useDirecciones(usuarioId: string | null): DireccionGuardada[] {
  const estado = useCuenta((s) => s.estado);
  const direcciones = useCuenta((s) => s.direcciones);
  const cargar = useCuenta((s) => s.cargar);
  const limpiar = useCuenta((s) => s.limpiar);

  useEffect(() => {
    if (usuarioId && estado === "idle") void cargar();
    if (!usuarioId && estado !== "idle") limpiar();
  }, [usuarioId, estado, cargar, limpiar]);

  return usuarioId ? direcciones : SIN_DIRECCIONES;
}
