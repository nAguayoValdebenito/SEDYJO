import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Suspense, ViewTransition } from "react";
import { BarraEnvioGratis } from "@/components/layout/BarraEnvioGratis";
import { BarraSuperior } from "@/components/layout/BarraSuperior";
import { Encabezado } from "@/components/layout/Encabezado";
import { FondoAnimado } from "@/components/layout/FondoAnimado";
import { PiePagina } from "@/components/layout/PiePagina";
import { PanelCarrito } from "@/features/carrito/components/PanelCarrito";
import { SeccionModalPromocion } from "@/features/promociones/components/SeccionModalPromocion";
import { DESCRIPCION_SITIO, NOMBRE_SITIO, URL_SITIO } from "@/lib/config";
import "@/styles/globals.css";

const titulos = localFont({
  src: "./fonts/BricolageGrotesque-latin.woff2",
  weight: "200 800",
  variable: "--fuente-titulos",
  display: "swap",
});

const texto = localFont({
  src: "./fonts/Figtree-latin.woff2",
  weight: "300 900",
  variable: "--fuente-texto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITIO),
  title: {
    default: `${NOMBRE_SITIO} | Supermercado online en San Pedro de la Paz`,
    template: `%s | ${NOMBRE_SITIO}`,
  },
  description: DESCRIPCION_SITIO,
  applicationName: NOMBRE_SITIO,
  openGraph: {
    type: "website",
    siteName: NOMBRE_SITIO,
    locale: "es_CL",
    title: `${NOMBRE_SITIO} | Supermercado online en San Pedro de la Paz`,
    description: DESCRIPCION_SITIO,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${titulos.variable} ${texto.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased [&>main]:flex-1">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-lg focus:bg-verde-oscuro focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
        >
          Saltar al contenido
        </a>
        <FondoAnimado />
        <BarraSuperior />
        {/* La altura reservada coincide con la del encabezado real (móvil, tablet y escritorio). */}
        <Suspense
          fallback={<div className="h-[122px] sm:h-[72px] lg:h-[88px]" aria-hidden="true" />}
        >
          <Encabezado />
        </Suspense>
        <BarraEnvioGratis />
        <ViewTransition default="pagina">{children}</ViewTransition>
        <PiePagina />
        <Suspense fallback={null}>
          <PanelCarrito />
        </Suspense>
        <Suspense fallback={null}>
          <SeccionModalPromocion />
        </Suspense>
      </body>
    </html>
  );
}
