import { Search } from "lucide-react";

type Props = {
  className?: string;
};

/**
 * Buscador de productos. Las categorías se eligen con el botón "Categorías" del header.
 * Es un formulario GET a /buscar: funciona sin JavaScript.
 */
export function Buscador({ className }: Props) {
  return (
    <form
      action="/buscar"
      method="get"
      role="search"
      aria-label="Buscar en la tienda"
      className={`flex h-12 overflow-hidden rounded-lg border-2 border-verde transition-[box-shadow,border-color] duration-200 focus-within:border-verde-oscuro focus-within:shadow-[0_0_0_4px_rgb(46_125_91/0.18)] ${className ?? ""}`}
    >
      <label htmlFor="buscar-q" className="sr-only">
        Buscar productos
      </label>
      <input
        id="buscar-q"
        name="q"
        type="search"
        placeholder="¿Qué estás buscando hoy?"
        className="min-w-0 flex-1 border-0 px-3 text-sm outline-none placeholder:text-gris-texto md:px-4"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="flex w-[50px] items-center justify-center bg-verde text-white transition-[background-color,filter] duration-200 hover:bg-verde-oscuro active:brightness-90 md:w-14"
      >
        <Search size={22} strokeWidth={2.2} aria-hidden="true" />
      </button>
    </form>
  );
}
