# Auditoría del frontend — Comercial Sedyjo (1 nov 2026)

Alcance: home, tarjetas de producto, header, carrito (`/carrito`) y categoría. Solo informe: no se modificó código.
Método: crítica Impeccable con dos evaluaciones aisladas (A: revisión de diseño en navegador y código; B: detector + mediciones), guía UX de ui-ux-pro-max (sistema de diseño, UX, GSAP/motion, Next.js) y la guía de transiciones de la documentación de Next.js 16.

Limitaciones de la evidencia: servidor de desarrollo (no producción); el navegador de pruebas tenía `prefers-reduced-motion` activo, así que **no se vio ninguna animación corriendo** (0 animaciones activas); LCP no medible en la pestaña de prueba; sin overlay del detector.

## 1. Puntajes

| Evaluación | Resultado |
|---|---|
| Heurísticas de Nielsen | **22/36 (61 %, Aceptable)**; la nº 9 (errores) no aplica aún: no hay formularios |
| Auditoría técnica (0-4 por dimensión) | Accesibilidad 3 · Rendimiento 3 · Theming 3 · Responsive 3 · Integridad 3 = **15/20 (Bueno)** |
| Carga cognitiva | 4 de 8 puntos pasan (falla: foco único en el primer pantallazo, ≤4 opciones, feedback inmediato…) |
| Detector Impeccable | 0 hallazgos |

Lo medido: sin desborde horizontal (375 px); CLS 0–0,0002; 0 errores de consola; imágenes con `alt`; encabezados sin saltos; ~61 KB de fuentes, ~33 KB de imágenes, 7,8 KB de CSS. Contrastes de texto reales: todos AA salvo el placeholder del buscador.

## 2. Veredicto de identidad

**Hoy es una plantilla de supermercado correcta, no es todavía Sedyjo.** La estructura copia el patrón Lider/Jumbo/Tottus (que se pidió), y lo único propio son el contraste blanco/verde frente a banners negros con dorado y morado, los pasteles por producto y la tipografía Bricolage. Además ~90 % de la pantalla son marcadores (33 textos `[entre corchetes]`, recuadros "[foto]"), así que parte de lo genérico es falta de contenido.

Receta de lo que se lee como "IA por defecto" aquí: tarjetas blancas con `rounded-lg` y borde gris, íconos Lucide grises, pasteles planos, bloques simétricos de 2 columnas, un solo radio (10 px) en todo, burbujas de fondo casi invisibles.

## 3. Hallazgos priorizados

| Sev. | Hallazgo | Evidencia | Arreglo |
|---|---|---|---|
| P1 | Cero animación de carga, scroll y feedback | Solo hay `motion` en el carrusel (`BannerPrincipal.tsx`) y las burbujas; `Suspense` de `page.tsx` sin fallback real; transiciones de tarjetas `0s` | Sección 4 |
| P1 | "Agregar" no se siente y pierde el foco | El botón se desmonta y `activeElement` pasa a `BODY` (`AgregarAlCarrito.tsx`); el badge solo cambia de número | Swap animado, pulso del badge, devolver foco al "+", `aria-live` "Agregado" |
| P1 | Enlaces a rutas que no existen | `/ingresar`, `/ofertas`, `/seguimiento`, `/ayuda`, `/quienes-somos`, `/categoria` (Ver todas) y `/buscar` dan 404 | Construirlas, o ocultar el enlace hasta que existan |
| P2 | Identidad por inyectar | Ver sección 5 | Elegir 2–3 gestos propios y repetirlos |
| P2 | El primer pantallazo grita cuatro veces | Barra de despacho (GRATIS a 42 px), banner principal y dos banners negros compiten; en móvil "[30%] dcto." roza la foto | Barra de despacho de una línea fina; un solo foco; reducir título en `BannerOscuro` |
| P2 | Contraste | Placeholder del buscador 3,06:1; `gris-texto` #6B7280 sobre pasteles 3,3–3,8:1 y sobre #F3F5F4/#E8F4EE 4,3–4,4:1 (hoy no se usa así, riesgo latente) | Placeholder más oscuro; en fondos de color usar `gris-medio` #4B5563 (5,2–5,9:1) |
| P2 | Objetivos táctiles y gestos | Puntos del carrusel 7×7 y 24×7; "Ver todas" 57×20; flechas ocultas en móvil y sin swipe | Puntos con área de 44 px, swipe/drag, "Ver todas" con padding |
| P2 | LCP y precargas | Aviso de Next: `galletas.webp` es el LCP y está con carga diferida; 2 precargas sin uso | `priority` solo en lo que está en el primer pantallazo; revisar `priority` en `BannerOscuro` |
| P3 | Carrito sin empuje | Sin "Ir a pagar", sin barra "te faltan $X para despacho gratis", cuadro de color en vez de foto, hueco en blanco hasta hidratar | CTA fijo en móvil, barra de progreso, skeleton |
| P3 | Detalles | "1 productos" en el `aria-label` del carrito; sin skip-link ni `id` en `<main>`; hex sueltos (#b8bcc6, #cfe8db); `agotado` sin variante visual; el carrusel rota solo cada 7 s sin barra de progreso | Singular/plural, skip-link, pasar los hex a tokens |

Lo que funciona: paleta tokenizada y disciplinada (dorado/morado solo sobre negro), precio grande + tachado + $/unidad, móvil sin desborde con objetivos de 44 px en agregar/menú/carrito, `prefers-reduced-motion` respetado, estructura semántica limpia.

## 4. Plan de animación (la petición central)

**Tesis de movimiento propia:** la *burbuja* (ya presente en el fondo y de la limpieza/frescura): las cosas **suben y hacen "pop"**. Un solo momento autoral (agregar al carrito) y el resto sobrio.

| # | Dónde | Qué | Cómo | Tiempo |
|---|---|---|---|---|
| 1 | Carga de productos | **Skeletons** con el tamaño exacto de la tarjeta, el pastel del producto y brillo que pasa (shimmer) | Fallback de cada `<Suspense>` + `loading.tsx` en `/categoria/[slug]`; `aria-busy`; CSS puro | shimmer 1,4 s |
| 2 | Aparición de fotos | La foto entra con fade desde el pastel al cargar | `onLoad` → opacidad 0→1 en el `<Image>` | 250 ms |
| 3 | Scroll (grillas) | Tarjetas suben 16 px y aparecen, **en cascada de 50 ms con tope de 8 elementos** | Wrapper cliente `Revelar` con `motion` `whileInView`, `once`, margen −80 px; `LazyMotion` + `domAnimation` para reducir peso | 350 ms, `cubic-bezier(.16,1,.3,1)` |
| 4 | Scroll (secciones) | Solo el titular de sección con barra que se dibuja (una vez); sin revelar cada bloque | CSS `scaleX` | 400 ms |
| 5 | **Agregar al carrito** (momento autoral) | "+" pasa a selector con swap animado; un punto/burbuja **sube hasta el carrito**; el badge hace pulso 1→1,25→1; el total cambia con conteo; foco vuelve al "+" | `AnimatePresence` + transform/opacity; `aria-live="polite"` | 450 ms total |
| 6 | Hover/foco de tarjeta | Foto escala 1,04 y la tarjeta sube 2 px con borde verde | CSS `transform`, solo en dispositivos con hover | 200–250 ms |
| 7 | Hero (carga inicial, una vez) | Titular entra con máscara hacia arriba; el **camión de la barra de despacho entra desde la izquierda** | CSS/`motion`, solo en la primera visita | 500–600 ms |
| 8 | Carrusel | Barra de progreso por banner, swipe/drag, pausa al interactuar | `motion` drag + CSS `scaleX` | 7 s |
| 9 | Franja negra "exclusivo online" | Brillo dorado que cruza el titular al entrar en pantalla (una vez) | CSS gradient en `background-position` | 900 ms |
| 10 | Header | Se compacta al bajar (se oculta la barra superior, logo 60→44 px) y en móvil el buscador queda fijo | CSS scroll-driven con respaldo por `IntersectionObserver` | 200 ms |
| 11 | Navegación | Foto del producto que "viaja" a la ficha; categorías con fundido cruzado | `<ViewTransition>` de React 19.3 (guía de Next: *Designing view transitions*); sin soporte, funciona igual | 300 ms |
| 12 | Carrito rápido | Panel lateral que se desliza al agregar, en vez de saltar a `/carrito` | `motion` + transform | 300 ms |

Reglas de rendimiento: solo `transform` y `opacity`; nada de animar `width/height/top/left`; `will-change` solo durante la animación; animar una vez; el contenido debe ser visible sin JavaScript (el estado oculto se aplica solo tras hidratar y solo a lo que está bajo el primer pantallazo); medir en un celular de gama media (el documento ya lo pide); las burbujas de fondo deben pausarse con la pestaña oculta y bajar de 8 a 5 en móvil.

**Movimiento reducido (alternativa intencional, no apagar todo):** se quitan los desplazamientos y escalas; se conservan fundidos de opacidad, el cambio de color/estado del botón, el pulso del badge sin escala y el aviso "Agregado". Los skeletons quedan como bloques sin brillo.

Nota de la guía ui-ux-pro-max: su receta "Stagger List" estándar (`back.out(1.4)`, 0,06 s) rebota; para un supermercado conviene la versión sutil (`power1.out`, 0,03 s) y no usar rebote por reflejo.

## 5. Cómo salir de lo genérico (propuestas de identidad)

1. **Motivo propio: la burbuja y la moneda del logo.** Marcos de foto con recorte circular/orgánico en insignias y descuentos; el sello "Despacho GRATIS" como medalla circular con borde dorado como el anillo del logo; el fondo azul/verde partido del logo como recurso en el hero.
2. **Productos que "salen" del marco.** En las categorías, el producto recortado sobresale por el borde superior de la tarjeta pastel, en vez de una foto rectangular a sangre (rompe la grilla de plantilla; requiere fotos recortadas).
3. **Etiquetas de precio con forma de etiqueta** (con muesca) en ofertas, en lugar de rectángulos con `rounded`.
4. **Asimetría controlada:** bento en el hero y un producto "destacado" de doble ancho en las ofertas, no cinco tarjetas idénticas en fila.
5. **Voz local:** "Del barrio, a tu mesa", Candelaria y San Pedro visibles; microcopy de despacho concreto; reemplazar los marcadores por textos reales.
6. **Dorado y morado en dosis pequeñas fuera del negro** (un filo dorado de 1 px en la tarjeta de oferta, el morado en la burbuja del badge): siguen sin invadir la interfaz base, pero la voz del negro se filtra.
7. **Fondo animado con propósito:** hoy las burbujas casi no se ven (quedan tapadas por las secciones). O se hacen visibles y propias (secciones transparentes, burbujas que se forman cuando agregas productos) o se retiran; la versión "burbujas que suben al agregar" es más barata y más significativa que un ambiente permanente.
8. **Fotografía:** fondo pastel por tipo de producto y recortes consistentes; es la mayor palanca de "se ve caro". Sin fotos reales cualquier mejora de diseño queda a medias.

## 6. Hoja de ruta sugerida

1. **Base de movimiento (1–2 días):** `Revelar`, skeletons, `loading.tsx`, hover de tarjeta, `LazyMotion`, reglas de movimiento reducido.
2. **Momento de "Agregar" (1 día):** swap, burbuja al carrito, pulso del badge, foco y `aria-live`; pruebas de teclado.
3. **Arreglos de accesibilidad/rendimiento (0,5 día):** contraste, objetivos táctiles, `priority`/LCP, plural, skip-link, tokens de los hex.
4. **Identidad (2–3 días, depende de las fotos):** medalla de despacho, etiquetas de precio, categorías con producto saliente, bento del hero.
5. **Rutas pendientes y carrito:** CTA de pago, barra de despacho gratis, ficha de producto con `ViewTransition`.
6. **Cierre:** `/impeccable polish` y nueva auditoría.
