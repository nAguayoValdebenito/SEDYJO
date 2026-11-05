import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
