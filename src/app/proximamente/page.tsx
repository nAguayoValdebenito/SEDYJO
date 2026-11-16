import type { Metadata } from "next";
import Image from "next/image";
import {
  Check,
  Clock,
  House,
  MessageCircle,
  Phone,
  PiggyBank,
  ShoppingBasket,
  Sparkles,
  Truck,
} from "lucide-react";
import { Contenedor } from "@/components/ui/Contenedor";
import { Revelar, RevelarGrupo } from "@/components/ui/Revelar";
import { claseBoton } from "@/components/ui/boton";
import {
  DESPACHO_GRATIS_DESDE,
  PLAZO_DESPACHO,
  TELEFONO_CONTACTO,
  TELEFONO_CONTACTO_VISIBLE,
} from "@/lib/config";
import { openGraphPagina } from "@/lib/seo/metadata";
import { formatoPrecio } from "@/lib/utils/format";

const TITULO = "Muy pronto: tu despensa llega a tu casa";
const DESCRIPCION =
  "Estamos construyendo la forma más fácil de comprar tu despensa online, con el mejor ahorro. Pronto llegamos a tu casa en San Pedro de la Paz.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: "/proximamente" },
  openGraph: openGraphPagina({ titulo: TITULO, descripcion: DESCRIPCION, ruta: "/proximamente" }),
};

const MENSAJE_AVISO = "¡Hola Sedyjo! Quiero que me avisen cuando abran la tienda online 🛒";
const ENLACE_AVISO = `https://wa.me/${TELEFONO_CONTACTO.replace("+", "")}?text=${encodeURIComponent(MENSAJE_AVISO)}`;

const beneficios = [
  {
    Icono: PiggyBank,
    titulo: "Ahorra de verdad",
    texto: "Precios pensados para tu bolsillo y ofertas exclusivas que solo vas a encontrar online.",
  },
  {
    Icono: Truck,
    titulo: "Directo a tu puerta",
    texto: `Despacho a domicilio en ${PLAZO_DESPACHO}${
      DESPACHO_GRATIS_DESDE ? `, gratis desde ${formatoPrecio(DESPACHO_GRATIS_DESDE)}` : ""
    }.`,
  },
  {
    Icono: ShoppingBasket,
    titulo: "Toda tu despensa",
    texto: "Abarrotes, confitería, bebidas, aseo, higiene personal y detergentes en un solo carrito.",
  },
];

const categorias = ["Abarrotes", "Confitería", "Bebidas", "Aseo", "Higiene personal", "Detergentes"];

const pasos = [
  { listo: true, titulo: "Catálogo armado", detalle: "Miles de productos de tu despensa." },
  { listo: true, titulo: "Despacho a domicilio", detalle: "Rutas listas en San Pedro de la Paz." },
  { listo: false, titulo: "Pagos online", detalle: "El último paso: ¡ya casi!" },
];

/** Página de "muy pronto": marketing de la apertura de la tienda online. */
export default function PaginaProximamente() {
  return (
    <main id="contenido" tabIndex={-1} data-modo-proximamente className="outline-none">
      {/* ---------- Portada oscura ---------- */}
      <section className="relative isolate overflow-hidden bg-negro text-white">
        <div aria-hidden="true" className="prox-resplandor pointer-events-none absolute inset-0 -z-10">
          <span className="prox-mancha absolute -top-24 -left-20 size-[420px] rounded-full bg-morado/35 blur-[110px]" />
          <span className="prox-mancha absolute -right-24 top-1/3 size-[460px] rounded-full bg-oro/25 blur-[120px] [animation-delay:-6s]" />
          <span className="prox-mancha absolute -bottom-40 left-1/4 size-[420px] rounded-full bg-verde/40 blur-[120px] [animation-delay:-12s]" />
        </div>

        <Contenedor className="flex flex-col items-center py-12 text-center md:py-20">
          <div className="mb-8 flex items-center gap-3">
            <Image
              src="/logo.webp"
              alt=""
              width={64}
              height={64}
              priority
              className="size-14 rounded-full object-cover ring-2 ring-white/20 md:size-16"
            />
            <span className="text-left font-titulos leading-[1.05]">
              <span className="block text-[11px] tracking-[0.2em] text-white/60">COMERCIAL</span>
              <span className="block text-2xl font-extrabold tracking-wide text-white md:text-3xl">SEDYJO</span>
            </span>
          </div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-oro uppercase backdrop-blur">
            <span className="relative flex size-2.5">
              <span className="prox-ping absolute inline-flex size-full rounded-full bg-oro" />
              <span className="relative inline-flex size-2.5 rounded-full bg-oro" />
            </span>
            Muy pronto · Sedyjo online
          </p>

          <h1 className="mt-6 max-w-4xl font-titulos text-[2.6rem] leading-[1.02] font-extrabold tracking-tight text-balance sm:text-6xl md:text-7xl">
            Pronto llegamos a{" "}
            <span className="prox-texto-brillo bg-gradient-to-r from-oro via-white to-morado bg-clip-text text-transparent">
              tu casa
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 text-balance md:text-xl">
            Estamos construyendo la forma más fácil de comprar tu despensa{" "}
            <strong className="font-bold text-white">con el mejor ahorro</strong>. Pide desde el
            celular y recíbelo sin moverte del sillón.
          </p>

          {/* Ruta de entrega: el camión llega a la casa, en bucle */}
          <div aria-hidden="true" className="relative mt-10 h-16 w-full max-w-md md:mt-12">
            <div className="absolute inset-x-6 bottom-3 border-b-2 border-dashed border-white/25" />
            <Truck className="prox-camion absolute bottom-3.5 left-0 size-10 text-oro" strokeWidth={1.75} />
            <House className="absolute right-0 bottom-2 size-12 text-verde-menta" strokeWidth={1.75} />
            <Sparkles className="prox-destello absolute top-1 right-1 size-5 text-morado" />
          </div>

          <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <a
              href={ENLACE_AVISO}
              target="_blank"
              rel="noopener noreferrer"
              className={claseBoton("dorado", "lg", "px-8 text-base")}
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              Avísame cuando abran
            </a>
            <a
              href={`tel:${TELEFONO_CONTACTO}`}
              className={claseBoton("contorno", "lg", "border-white/40 text-white hover:bg-white/10")}
            >
              <Phone className="size-5" aria-hidden="true" />
              {TELEFONO_CONTACTO_VISIBLE}
            </a>
          </div>
          <p className="mt-4 text-sm text-white/60">Escríbenos y te avisamos apenas abramos.</p>
        </Contenedor>

        {/* Cinta de categorías */}
        <div className="border-y border-white/10 bg-white/[0.03] py-3.5" aria-label="Lo que vas a encontrar">
          <ul className="prox-cinta flex w-max items-center gap-10 whitespace-nowrap">
            {[...categorias, ...categorias, ...categorias, ...categorias].map((c, i) => (
              <li
                key={`${c}-${i}`}
                aria-hidden={i >= categorias.length}
                className="flex items-center gap-10 text-sm font-bold tracking-wide text-white/70 uppercase"
              >
                {c}
                <span className="size-1.5 rounded-full bg-oro" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Por qué te va a encantar ---------- */}
      <Contenedor className="py-14 md:py-20">
        <Revelar className="mx-auto max-w-2xl text-center">
          <h2 className="font-titulos text-3xl font-extrabold tracking-tight text-tinta text-balance md:text-4xl">
            Tu despensa, <span className="text-verde">sin salir de casa</span>
          </h2>
          <p className="mt-3 text-base text-gris-medio md:text-lg">
            Menos filas, menos cargar bolsas y más plata en tu bolsillo.
          </p>
        </Revelar>
        <RevelarGrupo className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          {beneficios.map(({ Icono, titulo, texto }) => (
            <article
              key={titulo}
              className="rounded-2xl border border-borde bg-white p-6 shadow-sm transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-verde-suave text-verde-oscuro">
                <Icono className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-titulos text-xl font-bold text-tinta">{titulo}</h3>
              <p className="mt-2 leading-relaxed text-gris-medio">{texto}</p>
            </article>
          ))}
        </RevelarGrupo>
      </Contenedor>

      {/* ---------- Estamos en camino ---------- */}
      <section className="bg-verde-suave py-14 md:py-20">
        <Contenedor>
          <Revelar className="mx-auto max-w-2xl text-center">
            <h2 className="font-titulos text-3xl font-extrabold tracking-tight text-verde-profundo text-balance md:text-4xl">
              Estamos en camino
            </h2>
            <p className="mt-3 text-base text-gris-medio md:text-lg">Así vamos con la apertura.</p>
          </Revelar>
          <RevelarGrupo className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
            {pasos.map((p) => (
              <div
                key={p.titulo}
                className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm"
              >
                <span
                  className={
                    p.listo
                      ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-verde text-white"
                      : "flex size-10 shrink-0 items-center justify-center rounded-full bg-oro text-negro"
                  }
                >
                  {p.listo ? (
                    <Check className="size-5" strokeWidth={3} aria-hidden="true" />
                  ) : (
                    <Clock className="size-5" aria-hidden="true" />
                  )}
                </span>
                <div>
                  <h3 className="font-titulos text-lg font-bold text-tinta">{p.titulo}</h3>
                  <p className="mt-0.5 text-sm text-gris-medio">{p.detalle}</p>
                  <span className="sr-only">{p.listo ? "Listo" : "Pendiente"}</span>
                </div>
              </div>
            ))}
          </RevelarGrupo>
        </Contenedor>
      </section>

      {/* ---------- Cierre ---------- */}
      <section className="bg-negro py-14 text-center text-white md:py-20">
        <Contenedor>
          <Revelar>
            <h2 className="mx-auto max-w-2xl font-titulos text-3xl font-extrabold tracking-tight text-balance md:text-5xl">
              Sé de los <span className="text-oro">primeros</span> en comprar
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/75 md:text-lg">
              Escríbenos por WhatsApp y te avisamos el día que abrimos, con ofertas de bienvenida.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={ENLACE_AVISO}
                target="_blank"
                rel="noopener noreferrer"
                className={claseBoton("dorado", "lg", "px-8 text-base")}
              >
                <MessageCircle className="size-5" aria-hidden="true" />
                Quiero que me avisen
              </a>
              <a
                href={`tel:${TELEFONO_CONTACTO}`}
                className={claseBoton("contorno", "lg", "border-white/40 text-white hover:bg-white/10")}
              >
                <Phone className="size-5" aria-hidden="true" />
                Llamar al {TELEFONO_CONTACTO_VISIBLE}
              </a>
            </div>
          </Revelar>
          <p className="mt-12 text-sm text-white/50">
            Comercial Sedyjo · Candelaria, San Pedro de la Paz
          </p>
        </Contenedor>
      </section>
    </main>
  );
}
