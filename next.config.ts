import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Paquete autocontenido para ejecutar con Setup Node.js App de cPanel.
  output: "standalone",
  cacheComponents: true,
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
