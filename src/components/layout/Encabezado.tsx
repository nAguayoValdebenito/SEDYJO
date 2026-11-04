import Image from "next/image";
import Link from "next/link";
import { Contenedor } from "@/components/ui/Contenedor";
import { BotonCarrito } from "@/features/carrito/components/BotonCarrito";
import { getCategories } from "@/lib/data";
import { Buscador } from "./Buscador";
import { EncabezadoPegajoso } from "./EncabezadoPegajoso";
import { MenuCategorias } from "./MenuCategorias";
import { MenuCuenta } from "./MenuCuenta";

/**
 * Header con tres versiones explícitas (sin depender de que el contenido salte de línea):
 * - móvil (<640 px): menú, logo, cuenta y carrito arriba; buscador a todo el ancho debajo.
 * - tablet (640–1023 px): una sola fila compacta; cuenta y carrito solo con ícono.
 * - escritorio (≥1024 px): versión completa con textos y total del carrito.
 */
export async function Encabezado() {
  const categorias = (await getCategories()).map(({ slug, nombre }) => ({ slug, nombre }));

  return (
    <>
      <EncabezadoPegajoso>
        <Contenedor className="flex flex-wrap items-center gap-x-2 gap-y-2.5 py-2.5 sm:flex-nowrap sm:gap-x-3 sm:py-3 lg:min-h-[88px] lg:gap-x-[18px] lg:py-0">
          <Link
            href="/"
            aria-label="Comercial Sedyjo, ir al inicio"
            className="order-2 flex min-w-0 flex-1 items-center gap-2 sm:order-none sm:flex-none sm:gap-2.5 lg:gap-3"
          >
            <Image
              src="/logo.webp"
              alt=""
              width={60}
              height={60}
              priority
              className="size-11 rounded-full object-cover sm:size-12 lg:size-[60px]"
            />
            <span className="leading-[1.05]">
              <span className="hidden text-[11px] tracking-[0.14em] text-gris-texto lg:block">
                COMERCIAL
              </span>{" "}
              <span className="block font-titulos text-[22px] font-extrabold text-verde-oscuro lg:text-[26px]">
                SEDYJO
              </span>
            </span>
          </Link>

          <MenuCategorias categorias={categorias} className="order-1 shrink-0 sm:order-none" />

          <Buscador className="order-5 basis-full sm:order-none sm:min-w-0 sm:flex-1 sm:basis-0" />

          <MenuCuenta className="order-3 shrink-0 sm:order-none" />

          <div className="order-4 shrink-0 sm:order-none">
            <BotonCarrito />
          </div>
        </Contenedor>
      </EncabezadoPegajoso>
    </>
  );
}
