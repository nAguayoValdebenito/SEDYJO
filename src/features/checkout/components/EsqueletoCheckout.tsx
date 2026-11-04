import { Esqueleto } from "@/components/ui/Esqueleto";

/**
 * Esqueleto del proceso de pago con las medidas de la pantalla real (indicador, formulario y
 * resumen), para que el pie de página no salte al terminar de cargar el carrito.
 */
export function EsqueletoCheckout({ alto = "h-[640px] lg:h-[820px]" }: { alto?: string }) {
  return (
    <div aria-busy="true">
      <span role="status" className="sr-only">
        Cargando tu compra
      </span>
      <Esqueleto className="mb-6 h-14 w-full" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <Esqueleto className={`order-2 rounded-xl lg:order-1 ${alto}`} />
        <Esqueleto className="order-1 h-14 rounded-xl lg:order-2 lg:h-72" />
      </div>
    </div>
  );
}
