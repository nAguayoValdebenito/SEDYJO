# Guía de tamaños y proporciones de imágenes — Comercial Sedyjo

Datos calculados a partir del código del frontend.

## Cómo leer esta guía

- Casi ningún contenedor tiene proporción fija (salvo los marcados como `aspect-`). La mayoría tiene **alto fijo y ancho flexible**.
- Todas las fotos se muestran con `object-cover`: llenan el cuadro y **recortan lo que sobra**.
- Los anchos reales son **aproximados**, porque dependen de la pantalla.
- El contenedor del sitio mide como máximo **1240 px**, con margen de 12 px en celular y 32 px desde 768 px. En escritorio grande deja **1176 px** de ancho útil.
- El campo `sizes` de cada foto es solo una pista de carga, no el tamaño visible.
- Next está con `images.unoptimized`: **cada foto se sirve tal cual se sube**, sin redimensionado automático. Hay que subirlas ya optimizadas (`scripts/optimizar-imagen.mjs`, WebP).

## Banners promocionales

| Elemento | Celular (375 px) | Tablet (768 px) | Escritorio (1240 px o más) | Proporción aprox. |
|---|---|---|---|---|
| **Banner principal** (carrusel verde) | 351 × 210 px mínimo | 704 × 380 px mínimo | ~580 × 380 px (dos columnas) | 1,67:1 en celular y 1,5:1 en escritorio |
| Imagen dentro del principal | 38% del ancho (~133 px) × 110 px | 44% del ancho × ~264 px | ~255 × 264 px | cerca de 1:1 |
| **Banners oscuros** (dorado y morado) | 280 × 140 px mínimo, en carrusel horizontal | ~344 × 182 px, dos columnas | ~580 × 182 px, apilados a la derecha del principal | 2:1 en celular, 1,9:1 en tablet y 3,2:1 en escritorio |
| Imagen dentro del oscuro | ~95 × 112 px | ~103 × 138 px | ~197 × 138 px | 0,85:1 en celular, 0,75:1 en tablet y 1,4:1 en escritorio |
| **Banner de beneficio** (franja inferior) | sin imagen | marcador de 140 × 70 px | marcador de 140 × 70 px | 2:1 |
| **Modal de ofertas** (diapositiva) | 345 px de ancho (92% de la pantalla) | 520 px de ancho | 520 × 325 px | 16:10 (fija, `aspect-[16/10]`) |

Notas:

- Los mínimos de alto son "mínimo", no exactos: el texto puede agrandar el banner.
- En escritorio, el principal (380 px de alto) y los dos oscuros apilados (182 px cada uno + 16 px de separación) suman la misma altura.
- Hoy la imagen del banner principal es un marcador "[imagen del banner principal]": los tres banners principales de `mock/banners.json` tienen `imagen: null`.
- Los banners oscuros usan `galletas.webp` (284 × 118) y `mayonesa.webp` (200 × 150). Ninguna coincide con su cuadro, así que se recortan.

## Categorías y productos

| Elemento | Celular (375 px) | Tablet (768 px) | Escritorio (1240 px o más) | Proporción aprox. |
|---|---|---|---|---|
| **Tarjeta de categoría** (la foto llena todo el cuadro) | ~170 × 160 px, 2 columnas | ~225 × 210 px, 3 columnas | ~184 × 210 px, 6 columnas | 1,06:1 en celular, 1,07:1 en tablet y 0,88:1 en escritorio |
| **Tarjeta de producto** (zona de foto) | ~170 × 120 px | ~225 × 170 px, 3 columnas | ~222 × 170 px, 5 columnas | 1,4:1 en celular, 1,3:1 en tablet y 1,31:1 en escritorio |
| **Tarjeta de producto oscura** (zona de foto) | ~170 × 120 px | ~340 × 180 px | ~282 × 180 px, 4 columnas | 1,4:1 en celular y 1,57:1 en escritorio |
| **Tarjeta compacta** (carriles de recomendados) | 128 × 64 px | 140 × 68 px | 148 × 68 px | ~2:1 |
| **Oferta del día** (panel) | 260 × 144 px máximo | 260 × 144 px | 260 × 144 px | 1,8:1 |

Notas:

- En escritorio el número de columnas es automático (`auto-fit`): con 1176 px útiles salen 6 de categorías, 5 de productos claros y 4 de oscuros.
- Con la API hay 9 categorías: en escritorio quedan 6 en la primera fila y 3 en la segunda.
- Alto fijo de la zona de foto: producto 120 px (170 px desde `md`), producto oscuro 120 px (180 px desde `md`), categoría 160 px mínimo (210 px desde `md`).

## Fichas y listas pequeñas

| Elemento | Tamaño | Proporción |
|---|---|---|
| **Foto grande de la ficha** | cuadrado: 100% del ancho en celular y ~580 px en escritorio (columnas 1,05 fr y 1 fr) | 1:1 (`aspect-square`) |
| Miniaturas de la ficha | 64 × 64 px | 1:1 |
| Foto en el carrito lateral | 64 × 64 px | 1:1 |
| Foto en productos comprados | 56 × 56 px | 1:1 |

## Imágenes de marca y SEO

| Archivo | Tamaño |
|---|---|
| `public/logo.webp` | 160 × 160 px |
| `src/app/icon.png` (favicon) | 64 × 64 px |
| `src/app/apple-icon.png` | 180 × 180 px |
| Imagen para compartir (OpenGraph, generada en `opengraph-image.tsx`) | 1200 × 630 px (1,9:1) |

## Fotos de la API

Las que se probaron miden **300 × 300 px** (cuadradas, WebP). Quedan bien en la ficha y en las miniaturas. En las tarjetas apaisadas (~1,3:1) se recorta algo arriba y abajo. A 580 px en la ficha se ven al doble de su tamaño real, algo borrosas.

Son fotos de prueba (DummyJSON): hay que reemplazarlas por fotos propias antes de publicar.

## Tamaños recomendados para fotos propias

Calculados a partir de lo anterior (no están en el código). Tamaños a 2× para pantallas nítidas.

| Uso | Tamaño sugerido |
|---|---|
| Producto (ficha, tarjetas) | 1000 × 1000 px, con el producto centrado y margen alrededor |
| Categoría | 480 × 480 px, con el motivo centrado |
| Banner principal (imagen interna) | 700 × 700 px, PNG o WebP con fondo transparente |
| Banner oscuro (imagen interna) | 500 × 400 px |
| Diapositiva del modal | 1040 × 650 px (16:10) |

Para producto y categoría conviene dejar el motivo en el centro, porque el recorte cambia según el cuadro (tarjetas apaisadas, categorías casi cuadradas, ficha cuadrada).

## Dónde está cada medida en el código

| Elemento | Archivo |
|---|---|
| Banner principal | `src/features/banners/components/BannerPrincipal.tsx` |
| Banners oscuros | `src/features/banners/components/BannerOscuro.tsx` |
| Disposición de banners en portada | `src/features/banners/components/SeccionBannersPortada.tsx` |
| Banner de beneficio | `src/features/banners/components/BannerBeneficio.tsx` |
| Tarjeta de categoría | `src/features/catalogo/components/TarjetaCategoria.tsx` |
| Tarjetas de producto | `src/features/catalogo/components/TarjetaProducto.tsx`, `TarjetaProductoOscura.tsx`, `TarjetaProductoCompacta.tsx` |
| Galería de la ficha | `src/features/catalogo/components/GaleriaProducto.tsx` |
| Modal de ofertas | `src/features/promociones/components/ModalOfertaEspecial.tsx`, `GaleriaCampana.tsx` |
| Oferta del día | `src/features/promociones/components/PanelOfertaDelDia.tsx` |
| Ancho del sitio (`--container-sitio`) | `src/styles/tokens.css`, `src/components/ui/Contenedor.tsx` |
| Foto que rellena el cuadro | `src/components/ui/FotoOMarcador.tsx` |
| Optimizar fotos a WebP | `scripts/optimizar-imagen.mjs` |
