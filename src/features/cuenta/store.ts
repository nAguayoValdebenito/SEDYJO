"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  agregarDireccion,
  editarDireccion,
  eliminarDireccion,
  marcarPrincipal,
  type EntradaDireccionLibreta,
} from "@/lib/utils/direcciones";
import type { DireccionGuardada } from "@/types";

/**
 * Libreta de direcciones SIMULADA: vive en este navegador, una lista por cliente. Cuando exista
 * el backend, estas operaciones pasan a llamar a su API y la libreta se lee de la cuenta real.
 * La cuenta demo parte con una dirección de ejemplo.
 */
const SIN_DIRECCIONES: DireccionGuardada[] = [];
const SEMILLA_DEMO: DireccionGuardada[] = [
  {
    id: "dir-demo-1",
    etiqueta: "Casa",
    calle: "Los Aromos",
    numero: "1234",
    comuna: "San Pedro de la Paz",
    region: "Biobío",
    referencia: "Casa con reja verde",
    principal: true,
  },
];

const inicialesDe = (usuarioId: string) =>
  usuarioId === "u-demo" ? SEMILLA_DEMO : SIN_DIRECCIONES;

type EstadoCuenta = {
  direcciones: Record<string, DireccionGuardada[]>;
  agregar: (usuarioId: string, entrada: EntradaDireccionLibreta, principal?: boolean) => string;
  editar: (usuarioId: string, id: string, entrada: EntradaDireccionLibreta) => void;
  eliminar: (usuarioId: string, id: string) => void;
  hacerPrincipal: (usuarioId: string, id: string) => void;
};

const nuevoId = () => `dir-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const useCuenta = create<EstadoCuenta>()(
  persist(
    (set) => {
      const actualizar = (
        usuarioId: string,
        cambio: (lista: DireccionGuardada[]) => DireccionGuardada[],
      ) =>
        set((estado) => ({
          direcciones: {
            ...estado.direcciones,
            [usuarioId]: cambio(estado.direcciones[usuarioId] ?? inicialesDe(usuarioId)),
          },
        }));

      return {
        direcciones: {},
        agregar: (usuarioId, entrada, principal = false) => {
          const id = nuevoId();
          actualizar(usuarioId, (lista) => agregarDireccion(lista, entrada, id, principal));
          return id;
        },
        editar: (usuarioId, id, entrada) =>
          actualizar(usuarioId, (lista) => editarDireccion(lista, id, entrada)),
        eliminar: (usuarioId, id) => actualizar(usuarioId, (lista) => eliminarDireccion(lista, id)),
        hacerPrincipal: (usuarioId, id) =>
          actualizar(usuarioId, (lista) => marcarPrincipal(lista, id)),
      };
    },
    {
      name: "sedyjo-cuenta-demo",
      storage: createJSONStorage(() => localStorage),
      partialize: (estado) => ({ direcciones: estado.direcciones }),
    },
  ),
);

/** Direcciones guardadas del cliente (vacío si no hay sesión). */
export function useDirecciones(usuarioId: string | null): DireccionGuardada[] {
  return useCuenta((estado) =>
    usuarioId ? (estado.direcciones[usuarioId] ?? inicialesDe(usuarioId)) : SIN_DIRECCIONES,
  );
}
