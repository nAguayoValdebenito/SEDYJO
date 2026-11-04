import { serializarJsonLd } from "@/lib/seo/jsonld";

/** Datos estructurados (JSON-LD) para buscadores. No se ve en pantalla. */
export function JsonLd({ datos }: { datos: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializarJsonLd(datos) }}
    />
  );
}
