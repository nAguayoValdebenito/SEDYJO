import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Contenedor } from "@/components/ui/Contenedor";
import { BannerBeneficio } from "@/features/banners/components/BannerBeneficio";
import { EsqueletoBanners } from "@/features/banners/components/EsqueletoBanners";
import { SeccionBannersPortada } from "@/features/banners/components/SeccionBannersPortada";
import {
  EsqueletoCategorias,
  EsqueletoExclusivoOnline,
  EsqueletoOfertasSemana,
} from "@/features/catalogo/components/Esqueletos";
import { SeccionCategorias } from "@/features/catalogo/components/SeccionCategorias";
import { SeccionExclusivoOnline } from "@/features/catalogo/components/SeccionExclusivoOnline";
import { SeccionOfertasSemana } from "@/features/catalogo/components/SeccionOfertasSemana";
import { organizacionJsonLd, sitioWebJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Inicio: página delgada que solo arma secciones de features/. */
export default function Inicio() {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <JsonLd datos={organizacionJsonLd()} />
      <JsonLd datos={sitioWebJsonLd()} />
      <h1 className="sr-only">Comercial Sedyjo, supermercado online en San Pedro de la Paz</h1>
      <Contenedor className="mt-3.5 md:mt-6">
        <Suspense fallback={<EsqueletoBanners />}>
          <SeccionBannersPortada />
        </Suspense>
        <Suspense fallback={<EsqueletoCategorias />}>
          <SeccionCategorias />
        </Suspense>
      </Contenedor>

      <Suspense fallback={<EsqueletoExclusivoOnline />}>
        <SeccionExclusivoOnline />
      </Suspense>

      <Contenedor>
        <Suspense fallback={<EsqueletoOfertasSemana />}>
          <SeccionOfertasSemana />
        </Suspense>
        <BannerBeneficio />
      </Contenedor>
    </main>
  );
}
