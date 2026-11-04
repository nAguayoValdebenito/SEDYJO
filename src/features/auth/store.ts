"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Usuario } from "@/types";

/**
 * Sesión SIMULADA para desarrollar el frontend sin backend.
 * Solo guarda el nombre y el correo en este navegador; nunca contraseñas ni tokens.
 * Cuando exista el backend, `iniciarSesion` y `cerrarSesion` pasan a llamar a su API y la
 * sesión real (cookie) reemplaza este almacenamiento.
 */
type EstadoSesion = {
  usuario: Usuario | null;
  iniciarSesion: (usuario: Usuario) => void;
  /** Actualiza nombre o correo de la sesión (después de editar el perfil). */
  actualizarUsuario: (cambio: Partial<Pick<Usuario, "nombre" | "correo">>) => void;
  cerrarSesion: () => void;
};

export const useSesion = create<EstadoSesion>()(
  persist(
    (set) => ({
      usuario: null,
      iniciarSesion: (usuario) => set({ usuario }),
      actualizarUsuario: (cambio) =>
        set((estado) => (estado.usuario ? { usuario: { ...estado.usuario, ...cambio } } : estado)),
      cerrarSesion: () => set({ usuario: null }),
    }),
    {
      name: "sedyjo-sesion-demo",
      storage: createJSONStorage(() => localStorage),
      partialize: (estado) => ({ usuario: estado.usuario }),
    },
  ),
);
