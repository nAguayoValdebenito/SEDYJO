"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Usuario } from "@/types";
import { cerrarSesionApi } from "./acciones";

/**
 * Datos del cliente para pintar la interfaz (nombre y correo). La sesión real es una cookie
 * HttpOnly que solo ve el servidor; aquí no hay tokens ni contraseñas. `SincronizarSesion`
 * confirma con la API que la sesión sigue vigente.
 */
type EstadoSesion = {
  usuario: Usuario | null;
  /** `true` cuando ya se confirmó con el servidor si la sesión sigue vigente. */
  verificada: boolean;
  iniciarSesion: (usuario: Usuario) => void;
  /** Actualiza nombre o correo de la sesión (después de editar el perfil). */
  actualizarUsuario: (cambio: Partial<Pick<Usuario, "nombre" | "correo">>) => void;
  /** Resultado de consultar la sesión al servidor. */
  confirmarSesion: (usuario: Usuario | null) => void;
  /** Cierra la sesión en el servidor y en este navegador. */
  cerrarSesion: () => void;
  /** Olvida al cliente solo en este navegador (la sesión venció). */
  olvidarUsuario: () => void;
};

export const useSesion = create<EstadoSesion>()(
  persist(
    (set) => ({
      usuario: null,
      verificada: false,
      iniciarSesion: (usuario) => set({ usuario, verificada: true }),
      actualizarUsuario: (cambio) =>
        set((estado) => (estado.usuario ? { usuario: { ...estado.usuario, ...cambio } } : estado)),
      confirmarSesion: (usuario) => set({ usuario, verificada: true }),
      cerrarSesion: () => {
        set({ usuario: null, verificada: true });
        void cerrarSesionApi();
      },
      olvidarUsuario: () => set({ usuario: null, verificada: true }),
    }),
    {
      name: "sedyjo-sesion",
      storage: createJSONStorage(() => localStorage),
      partialize: (estado) => ({ usuario: estado.usuario }),
    },
  ),
);
