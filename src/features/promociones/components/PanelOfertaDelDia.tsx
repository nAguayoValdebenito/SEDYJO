import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock, Truck } from "lucide-react";
import { FotoOMarcador } from "@/components/ui/FotoOMarcador";
import { DESPACHO_GRATIS_DESDE, PLAZO_DESPACHO } from "@/lib/config";
import { getOfertaDelDia } from "@/lib/data";
import { formatoPrecio, porcentajeDescuento } from "@/lib/utils/format";

/**
 * Contenido del panel verde de ingresar, registrarse y recuperar: la oferta del día puesta
 * directamente sobre el verde de marca (que lleva el fondo de garabatos en blanco) y, debajo, el
 * mensaje de marca y lo esencial del servicio: despacho gratis, plazo y pago con Webpay.
 * Dorado y morado quedan reservados para los fondos negros: aquí todo es blanco y verde.
 */
export async function PanelOfertaDelDia() {
  const ofertaDelDia = await getOfertaDelDia();
  const oferta = ofertaDelDia?.producto ?? null;
  const descuento = oferta ? porcentajeDescuento(oferta.precio, oferta.precioAnterior) : null;

  return (
    <div className="relative flex h-full flex-col gap-8">
      <div className="flex flex-1 flex-col justify-center gap-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex rounded-md bg-white px-2.5 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-verde-oscuro">
            oferta del día
          </span>
          {descuento && (
            <span className="rounded-full bg-rojo px-3 py-1 text-sm font-extrabold text-white">
              -{descuento}%
            </span>
          )}
        </div>

        {oferta ? (
          <Link href="/ofertas" className="group flex flex-col items-center gap-5">
            <div
              className="relative aspect-[520/288] w-full max-w-[340px] overflow-hidden rounded-xl ring-2 ring-white/80 transition-[scale] duration-300 ease-[var(--ease-salida)] group-hover:scale-[1.03]"
              style={{ backgroundColor: oferta.fondo }}
            >
              <FotoOMarcador
                src={ofertaDelDia?.imagen ?? oferta.imagenes[0] ?? null}
                alt=""
                marcador=""
                sizes="340px"
              />
            </div>
            <div className="text-center">
              <p className="line-clamp-2 text-lg font-bold leading-snug">{oferta.nombre}</p>
              <p className="mt-1 flex items-baseline justify-center gap-3">
                <span className="font-titulos text-5xl font-extrabold leading-none tabular-nums">
                  {formatoPrecio(oferta.precio)}
                </span>
                {oferta.precioAnterior && (
                  <span className="text-base text-white line-through tabular-nums">
                    {formatoPrecio(oferta.precioAnterior)}
                  </span>
                )}
              </p>
            </div>
            <span className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-6 text-sm font-bold text-verde-oscuro transition-[translate,background-color] duration-200 ease-[var(--ease-salida)] group-hover:bg-verde-suave">
              Ver oferta
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-[translate] duration-200 group-hover:translate-x-1"
              />
            </span>
          </Link>
        ) : (
          <p className="my-auto text-center font-titulos text-3xl font-extrabold leading-tight">
            Pronto, nuevas ofertas cada día
          </p>
        )}
      </div>

      <div>
        <p className="mb-4 font-titulos text-2xl font-extrabold leading-tight">
          Tu súper de siempre, más a mano
        </p>
        <ul className="flex flex-col gap-3 text-[15px]">
          {DESPACHO_GRATIS_DESDE !== null && (
            <li className="flex items-center gap-3">
              <Truck size={20} aria-hidden="true" className="shrink-0 text-verde-palido" />
              <span>
                Despacho <strong>gratis</strong> en compras sobre{" "}
                <strong>{formatoPrecio(DESPACHO_GRATIS_DESDE)}</strong>
              </span>
            </li>
          )}
          <li className="flex items-center gap-3">
            <Clock size={20} aria-hidden="true" className="shrink-0 text-verde-palido" />
            <span>
              Despacho a domicilio en <strong>{PLAZO_DESPACHO}</strong>
            </span>
          </li>
          <li className="flex items-center gap-3">
            <BadgeCheck size={20} aria-hidden="true" className="shrink-0 text-verde-palido" />
            <span>
              Pago seguro con <strong>Webpay Plus</strong> (Transbank)
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
