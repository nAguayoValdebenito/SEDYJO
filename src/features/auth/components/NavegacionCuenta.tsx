"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSesion } from "../store";

const SECCIONES = [
  { href: "/cuenta", texto: "Resumen", exacta: true },
  { href: "/cuenta/pedidos", texto: "Mis pedidos", exacta: false },
  { href: "/cuenta/direcciones", texto: "Direcciones", exacta: false },
  { href: "/cuenta/perfil", texto: "Perfil", exacta: false },
];

/** Saludo, secciones de la cuenta y "Cerrar sesión". Solo se muestra con sesión iniciada. */
export function NavegacionCuenta() {
  const pathname = usePathname();
  const router = useRouter();
  const usuario = useSesion((s) => s.usuario);
  const cerrarSesion = useSesion((s) => s.cerrarSesion);

  if (!usuario) return null;

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gris-texto">Mi cuenta</p>
          <p className="font-titulos text-xl font-extrabold">Hola, {usuario.nombre}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            cerrarSesion();
            router.push("/");
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold text-azul transition-colors duration-200 hover:bg-gris-fondo hover:text-azul-oscuro"
        >
          <LogOut size={18} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>

      <nav
        aria-label="Secciones de la cuenta"
        className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl bg-gris-fondo p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SECCIONES.map((s) => {
          const activa = s.exacta ? pathname === s.href : pathname.startsWith(s.href);
          return (
            <Link
              key={s.href}
              href={s.href}
              aria-current={activa ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-bold transition-[background-color,color] duration-200",
                activa
                  ? "bg-white text-verde-oscuro shadow-sm"
                  : "text-gris-medio hover:text-tinta",
              )}
            >
              {s.texto}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
