---
name: sedyjo-frontend
description: Convenciones del frontend de Comercial Sedyjo (Next.js 16, Tailwind v4, arquitectura por funcionalidades, paleta, capa de datos y carrito). Úsala antes de crear o modificar cualquier página, componente, estilo o dato del proyecto.
---

# Frontend de Comercial Sedyjo

Solo se trabaja el **frontend** (el backend Node.js lo hace otra persona). Base: `Decisiones iniciales del frontend` v0.1 y la maqueta del home.

## Antes de escribir código

1. Esta versión de Next.js (16.4) cambia APIs respecto a lo conocido: lee la guía pertinente en `node_modules/next/dist/docs/` (ver `AGENTS.md`).
2. El proyecto usa **Cache Components** (`cacheComponents: true`): no existen `export const revalidate` ni `runtime`; el caché se declara con `"use cache"` + `cacheLife(...)`. Lo que lea `params`/`searchParams` va dentro de `<Suspense>`.
3. No hacer commits, push ni nada en GitHub sin que el usuario lo pida.

## Estructura (por funcionalidades)

```
src/app/         rutas delgadas: piden datos y arman secciones de features/
src/features/    banners, carrito, catalogo, checkout, cuenta (cada una dueña de su estado, componentes y hooks)
src/components/  ui/ (sin lógica de negocio) y layout/ (header, pie, fondo animado)
src/lib/         data/ (acceso a datos), utils/ (formato CLP), validation/ (Zod)
src/types/       contratos: Producto, Categoria, Banner, ItemCarrito, Orden
src/styles/      tokens.css (paleta y fuentes) y globals.css
```

- Nombres en español (componentes, tipos, funciones de dominio); las funciones de datos mantienen el nombre del plan: `getProducts`, `getProductBySlug`, `getCategories`, `getBanners`.
- `components/ui` nunca importa de `features/` ni conoce productos o carrito.
- Servidor por defecto. Cliente (`"use client"`) solo para: carrito, selector de cantidad, menú de categorías, carrusel y lo que use estado del navegador.

## Datos

- Las pantallas jamás leen JSON ni llaman al backend: siempre pasan por `src/lib/data/`.
- Hoy las funciones leen `src/lib/data/mock/*.json` y validan con los esquemas de `src/lib/validation/schemas.ts`. Cuando exista el backend solo cambia el interior de esas funciones.
- Precios en CLP enteros; formatear con `formatoPrecio()`; el descuento se calcula con `porcentajeDescuento()`. El total real lo valida siempre el servidor.
- Un campo nuevo de producto se agrega en `types/`, en el esquema Zod y en el JSON mock a la vez.

## Diseño

- Fondo blanco; verde `#2E7D5B` principal (botones, carrito, categoría activa); `#1F5C42` verde oscuro; `#E8F4EE` fondos suaves; azul `#1E4B8F` en enlaces y pie; rojo `#C73B3B` **solo** para descuentos; texto `#1F2933`.
- Dorado `#FFC83D` y morado neón `#D15BFF` **solo** sobre fondo negro `#0B0B0F` (banners secundarios y sección "exclusivo online"). Nunca en la interfaz general.
- Los colores viven como tokens en `src/styles/tokens.css` (`bg-verde`, `text-oro`, etc.); no escribir hex sueltos en componentes salvo el `fondo` por producto/categoría que viene de los datos.
- Fuentes: Bricolage Grotesque (`font-titulos`) y Figtree (`font-texto`), cargadas en local desde `src/app/fonts/`. No cargar fuentes externas.
- Íconos: Lucide, grises con baja opacidad; que destaque la foto del producto.
- Mobile first: celular 2 columnas de productos, categorías 2 columnas, banners oscuros deslizables; escritorio con `md:`.
- Animaciones: sutiles, y deben respetar `prefers-reduced-motion`.
- Imágenes: pre-optimizadas en WebP con `scripts/optimizar-imagen.mjs` (`images.unoptimized: true`); usar `next/image` y, sin foto, `FotoOMarcador`.

## Verificación antes de dar algo por terminado

```bash
npx tsc --noEmit && npx eslint && npm test && npm run build
```

Y revisar la página en el navegador en escritorio y en celular (375 px).
