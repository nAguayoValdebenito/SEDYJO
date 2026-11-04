"use client";

import { ChevronDown, UserRound } from "lucide-react";
import { MenuDesplegable, type ItemMenu } from "@/components/ui/MenuDesplegable";
import { useSesion } from "@/features/auth/store";
import { useHidratado } from "@/features/carrito/useHidratado";
import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
};

/**
 * Menú de cuenta del header. Se abre al pasar el cursor, con clic o con teclado.
 * Sin sesión: Iniciar sesión y Registrarse. Con sesión (simulada): saludo, Mi cuenta,
 * Mis pedidos y Cerrar sesión.
 */
export function MenuCuenta({ className }: Props) {
  const hidratado = useHidratado();
  const usuario = useSesion((s) => s.usuario);
  const cerrarSesion = useSesion((s) => s.cerrarSesion);

  const conSesion = hidratado && usuario !== null;

  const items: ItemMenu[] = conSesion
    ? [
        { tipo: "texto", texto: `Hola, ${usuario.nombre}` },
        { tipo: "enlace", href: "/cuenta", texto: "Mi cuenta" },
        { tipo: "enlace", href: "/cuenta/pedidos", texto: "Mis pedidos" },
        { tipo: "enlace", href: "/cuenta/direcciones", texto: "Direcciones" },
        { tipo: "enlace", href: "/cuenta/perfil", texto: "Mi perfil" },
      ]
    : [
        { tipo: "enlace", href: "/ingresar", texto: "Iniciar sesión" },
        { tipo: "enlace", href: "/registro", texto: "Registrarse" },
      ];

  return (
    <MenuDesplegable
      id="menu-cuenta"
      etiqueta="Mi cuenta"
      etiquetaBoton={conSesion ? `Hola, ${usuario.nombre}, mi cuenta` : "Ingresar, mi cuenta"}
      alinear="derecha"
      abrirConHover
      claseLista="w-56"
      className={className}
      items={items}
      pie={conSesion ? { tipo: "boton", texto: "Cerrar sesión", onClick: cerrarSesion } : undefined}
      claseBoton="flex h-11 w-11 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors duration-200 hover:text-verde-oscuro lg:h-12 lg:w-auto lg:px-2"
    >
      {({ abierto }) => (
        <>
          <UserRound
            size={24}
            strokeWidth={2}
            aria-hidden="true"
            className="shrink-0 text-gris-texto opacity-80"
          />
          <span className="hidden max-w-[7.5rem] truncate lg:inline">
            {conSesion ? `Hola, ${usuario.nombre}` : "Ingresar"}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={2.4}
            aria-hidden="true"
            className={cn(
              "hidden transition-transform duration-300 ease-[var(--ease-salida)] lg:block",
              abierto && "rotate-180",
            )}
          />
        </>
      )}
    </MenuDesplegable>
  );
}
