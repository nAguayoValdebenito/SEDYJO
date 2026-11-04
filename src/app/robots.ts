import type { MetadataRoute } from "next";
import { urlAbsoluta } from "@/lib/seo/jsonld";

/** Los buscadores pueden recorrer la tienda, pero no las páginas privadas ni del proceso de compra. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/carrito",
        "/checkout",
        "/cuenta",
        "/ingresar",
        "/registro",
        "/recuperar",
        "/seguimiento",
        "/buscar",
      ],
    },
    sitemap: urlAbsoluta("/sitemap.xml"),
  };
}
