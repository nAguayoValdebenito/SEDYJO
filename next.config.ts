import type { NextConfig } from "next";

/**
 * Mientras la tienda no abre, TODO el sitio lleva a la página "Muy pronto" (/proximamente):
 * cualquier ruta (catálogo, carrito, cuenta…) redirige ahí con un 307 temporal. Quedan fuera
 * los archivos internos y estáticos que la propia página necesita. Solo se aplica en la
 * compilación de producción (`next build`): con `npm run dev` la tienda se ve normal. Para
 * abrir la tienda, compilar con `PROXIMAMENTE=off npm run build`.
 */
const MODO_PROXIMAMENTE =
  process.env.PROXIMAMENTE !== "off" && process.env.NODE_ENV === "production";
const RUTAS_LIBRES = [
  "proximamente",
  "_next",
  "images",
  "patrones",
  "logo\\.webp",
  "icon\\.png",
  "apple-icon\\.png",
  "opengraph-image",
  "robots\\.txt",
  "sitemap\\.xml",
].join("|");

const nextConfig: NextConfig = {
  async redirects() {
    return MODO_PROXIMAMENTE
      ? [
          { source: "/", destination: "/proximamente", permanent: false },
          { source: `/:ruta((?!${RUTAS_LIBRES}).+)`, destination: "/proximamente", permanent: false },
        ]
      : [];
  },
  // Paquete autocontenido para ejecutar con Setup Node.js App de cPanel.
  output: "standalone",
  cacheComponents: true,
  // Perfil de caché del catálogo: lo que se cambia en el administrador se ve en la tienda en ~30 s.
  cacheLife: {
    catalogo: { stale: 30, revalidate: 30, expire: 3600 },
  },
  partialPrefetching: true,
  images: {
    // Las fotos se pre-optimizan (WebP, varios tamaños) antes de subirlas:
    // no se usa la optimización en vivo para no gastar CPU del hosting.
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
