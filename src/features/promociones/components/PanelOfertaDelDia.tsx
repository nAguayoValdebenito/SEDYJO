import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock, Truck } from "lucide-react";
import { FondoDoodlesComercio } from "@/components/ui/FondoDoodlesComercio";
import { FotoOMarcador } from "@/components/ui/FotoOMarcador";
import { Insignia } from "@/components/ui/Insignia";
import { DESPACHO_GRATIS_DESDE, PLAZO_DESPACHO } from "@/lib/config";
import { getOfertaDelDia } from "@/lib/data";
import { formatoPrecio, porcentajeDescuento } from "@/lib/utils/format";

/**
 * Contenido del panel verde de ingresar, registrarse y recuperar: un banner negro con la oferta
 * del día (sobre el fondo de garabatos del negocio) y, debajo, el mensaje de marca y lo esencial
 * del servicio: despacho gratis, plazo y pago con Webpay.
 */
export async function PanelOfertaDelDia() {
  const oferta = await getOfertaDelDia();
  const descuento = oferta ? porcentajeDescuento(oferta.precio, oferta.precioAnterior) : null;

  return (
    <div className="relative flex h-full flex-col gap-6">
      <div className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-carbon-borde bg-negro p-6 text-white shadow-[0_24px_40px_-24px_rgb(0_0_0/0.8)] transition-[translate,box-shadow,border-color] duration-300 ease-[var(--ease-salida)] hover:-translate-y-1 hover:border-oro/60">
        <FondoDoodlesComercio tam={380} />

        <div className="relative flex items-center justify-between gap-3">
          <Insignia variante="morada">oferta del día</Insignia>
          {descuento && (
            <span className="rounded-full bg-rojo px-3 py-1 text-sm font-extrabold text-white">
              -{descuento}%
            </span>
          )}
        </div>

        {oferta ? (
          <Link href="/ofertas" className="relative mt-5 flex flex-1 flex-col justify-center gap-5">
            <div
              className="relative mx-auto h-36 w-full max-w-[260px] overflow-hidden rounded-xl ring-2 ring-oro/70"
              style={{ backgroundColor: oferta.fondo }}
            >
              <FotoOMarcador src={oferta.imagenes[0] ?? null} alt="" marcador="" sizes="260px" />
            </div>
            <div className="text-center">
              <p className="line-clamp-2 text-lg font-bold leading-snug">{oferta.nombre}</p>
              <p className="mt-1 flex items-baseline justify-center gap-3">
                <span className="font-titulos text-5xl font-extrabold leading-none text-oro tabular-nums">
                  {formatoPrecio(oferta.precio)}
                </span>
                {oferta.precioAnterior && (
                  <span className="text-base text-gris-claro line-through tabular-nums">
                    {formatoPrecio(oferta.precioAnterior)}
                  </span>
                )}
              </p>
            </div>
            <span className="mx-auto inline-flex h-11 items-center gap-2 rounded-lg bg-oro px-6 text-sm font-bold text-negro transition-[translate,filter] duration-200 ease-[var(--ease-salida)] group-hover:brightness-95">
              Ver oferta
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-[translate] duration-200 group-hover:translate-x-1"
              />
            </span>
          </Link>
        ) : (
          <p className="relative my-auto text-center font-titulos text-3xl font-extrabold leading-tight text-oro">
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
              <Truck size={20} aria-hidden="true" className="shrink-0 text-oro" />
              <span>
                Despacho <strong>gratis</strong> en compras sobre{" "}
                <strong>{formatoPrecio(DESPACHO_GRATIS_DESDE)}</strong>
              </span>
            </li>
          )}
          <li className="flex items-center gap-3">
            <Clock size={20} aria-hidden="true" className="shrink-0 text-oro" />
            <span>
              Despacho a domicilio en <strong>{PLAZO_DESPACHO}</strong>
            </span>
          </li>
          <li className="flex items-center gap-3">
            <BadgeCheck size={20} aria-hidden="true" className="shrink-0 text-oro" />
            <span>
              Pago seguro con <strong>Webpay Plus</strong> (Transbank)
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
