import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FotoOMarcador } from "@/components/ui/FotoOMarcador";
import type { Categoria } from "@/types";

type Props = {
  categoria: Categoria;
  /** Foto del primer pantallazo: se carga de inmediato. */
  prioridad?: boolean;
};

/** Tarjeta de categoría: foto a todo el fondo y el nombre en una barra abajo. */
export function TarjetaCategoria({ categoria, prioridad = false }: Props) {
  return (
    <Link
      href={`/categoria/${categoria.slug}`}
      className="group relative flex min-h-40 flex-col justify-end overflow-hidden rounded-[10px] p-2.5 transition-[scale,box-shadow] duration-300 ease-[var(--ease-salida)] hover:z-10 hover:shadow-[0_18px_30px_-16px_rgb(31_41_51/0.5)] hover:scale-[1.03] md:min-h-[210px] md:p-3.5"
      style={{ backgroundColor: categoria.fondo }}
    >
      <FotoOMarcador
        src={categoria.imagen}
        alt=""
        marcador={categoria.sugerenciaFoto}
        sizes="(min-width: 768px) 200px, 50vw"
        prioridad={prioridad}
      />
      <span className="relative flex min-h-8 items-center justify-between rounded-md bg-white/95 px-2 py-1.5 font-titulos text-base font-extrabold leading-[1.1] md:px-2.5 md:py-2 md:text-xl">
        {categoria.nombre}
        <ArrowRight
          size={20}
          strokeWidth={2.4}
          aria-hidden="true"
          className="hidden transition-transform group-hover:translate-x-0.5 md:block"
        />
      </span>
    </Link>
  );
}
