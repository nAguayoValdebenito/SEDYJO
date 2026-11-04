"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import { claseBoton } from "@/components/ui/boton";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { useHidratado } from "@/features/carrito/useHidratado";
import { useSesion } from "../store";
import { AvisoModoDemostracion } from "./AvisoModoDemostracion";

/**
 * Muestra su contenido solo con sesión iniciada. Sin sesión invita a ingresar y, al hacerlo,
 * devuelve al cliente a esta misma página (`?volver=`). La sesión de hoy es simulada: el backend
 * real protegerá además los datos en el servidor.
 */
export function ProtegidoPorSesion({ children }: { children: ReactNode }) {
  const hidratado = useHidratado();
  const usuario = useSesion((s) => s.usuario);
  const pathname = usePathname();

  if (!hidratado) {
    return (
      <div aria-busy="true" className="flex min-h-[22rem] flex-col gap-3">
        <span role="status" className="sr-only">
          Cargando tu cuenta
        </span>
        <Esqueleto className="h-9 w-56" />
        <Esqueleto className="h-40 w-full rounded-[10px]" />
      </div>
    );
  }

  if (!usuario) {
    const volver = encodeURIComponent(pathname);
    return (
      <div className="mx-auto flex min-h-[22rem] max-w-md flex-col items-start gap-4 py-6">
        <LockKeyhole size={40} strokeWidth={1.5} aria-hidden="true" className="text-verde" />
        <h1 className="font-titulos text-2xl font-extrabold">Inicia sesión para ver tu cuenta</h1>
        <p className="text-gris-medio">
          Aquí encontrarás tus pedidos, el estado de cada envío y lo que ya compraste.
        </p>
        <AvisoModoDemostracion />
        <div className="flex flex-wrap gap-3">
          <Link href={`/ingresar?volver=${volver}`} className={claseBoton("primario", "lg")}>
            Iniciar sesión
          </Link>
          <Link href={`/registro?volver=${volver}`} className={claseBoton("contorno", "lg")}>
            Crear cuenta
          </Link>
        </div>
      </div>
    );
  }

  return <div className="contenido-entra">{children}</div>;
}
