"use client";

import { useEffect } from "react";
import { obtenerSesion } from "../acciones";
import { useSesion } from "../store";

/**
 * Al abrir la tienda confirma con el servidor que la sesión guardada sigue vigente. Sin cliente
 * guardado no hace ninguna llamada. Si la API no responde se conserva lo que hay.
 */
export function SincronizarSesion() {
  useEffect(() => {
    const { usuario, confirmarSesion } = useSesion.getState();
    if (!usuario) {
      confirmarSesion(null);
      return;
    }
    let vigente = true;
    obtenerSesion()
      .then((resultado) => {
        if (vigente) confirmarSesion(resultado === undefined ? usuario : resultado);
      })
      .catch(() => {
        if (vigente) confirmarSesion(usuario);
      });
    return () => {
      vigente = false;
    };
  }, []);

  return null;
}
