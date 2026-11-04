# Auditoría de diseño n.º 2 — Comercial Sedyjo (1 nov 2026)

Segunda pasada tras la ronda de movimiento, hover, header fijo, carrito y páginas nuevas. Solo informe: no se modificó código.
Método: crítica Impeccable con dos evaluaciones aisladas (A: revisión de diseño; B: detector y mediciones con Playwright), guías UX de ui-ux-pro-max, marco de crítica de diseño y revisión de accesibilidad WCAG 2.1 AA.
Límites: servidor de desarrollo (pesos y LCP no son de producción); la revisión A vio el navegador con "reducir movimiento" activo y juzgó el movimiento por el código; la evidencia B sí se midió con movimiento normal y reducido.

Cambio pedido antes de auditar (ya hecho): se quitó el selector "Todas" del buscador y la tarjeta de producto completa (foto, datos y botón) crece 3 % de forma suave; la foto ya no hace zoom propia y el botón "Agregar" crece 5 % solo cuando el cursor está sobre él. Medido: tarjeta 222→229 px; foto y botón escalan juntos (×1,03).

## 1. Puntajes y comparación con la auditoría 1

| Evaluación | Auditoría 1 | Auditoría 2 |
|---|---|---|
| Heurísticas de Nielsen | 22/36 (61 %) | **25/40 (63 %)** — sube visibilidad del estado (2→3) y estética (2→3); baja ayuda (2→1) |
| Técnica (0–4 por dimensión) | 15/20 | **16/20**: Accesibilidad 3 · Rendimiento 3 · Theming 4 · Responsive 3 · Integridad 3 |
| Carga cognitiva (fallas de 8) | 4 fallas | **2 fallas** (ruido visual leve y falta de siguiente paso) |
| Detector Impeccable | 0 | 0 |
| Contraste de texto (todas las rutas medidas) | 1 falla (placeholder 3,06) | **0 fallas** (mínimo 5,0:1) |
| Desborde horizontal (12 rutas, 1440 y 375) | 0 | 0 |
| CLS | ~0 | 0 |

Lo que se cerró: movimiento y esqueletos, feedback de "Agregar" con foco y aviso, contraste, rutas que daban 404, tokens, favicon, skip-link, carrito con foto y pago fijo en móvil, hover coherente.

## 2. Identidad: veredicto

**Mitad propio, mitad plantilla de supermercado bien hecha.** Hoy se reconoce como "ecommerce limpio de super", todavía no como Sedyjo.

Ya es propio: la burbuja (fondo, vuelo al carrito y estallido), dorado y morado solo sobre negro, banda verde profundo con "GRATIS" dorado, etiqueta de descuento con muesca, tipografía Bricolage extra-bold en precios y un sistema de movimiento coherente (una curva, transform/opacity, reducir movimiento deliberado).
Sigue genérico: estructura de home (barra, header, banda, hero, categorías, grilla), tarjetas pastel con botón verde ancho, tarjetas de categoría "foto + barra blanca", pie de 3 columnas, páginas "próximamente", hover estándar (escala + sombra) en todo, copy neutro.
Límite: ~60 % de la portada son marcadores "[foto]"; no se puede juzgar si la identidad sobrevive con fotografía real.

## 3. Hallazgos priorizados

| Sev. | Hallazgo | Evidencia | Arreglo |
|---|---|---|---|
| P1 | El banner principal no es el protagonista | Es el bloque más grande y más pobre (verde pálido con caja punteada); los dos banners negros con foto le quitan el foco (`BannerPrincipal.tsx`) | Fondo `verde-profundo`, titular blanco y burbujas grandes que "salgan" del banner mientras no haya foto; con foto, producto recortado |
| P1 | La burbuja casi no existe como identidad | Opacidad máx. 0,7 y borde 24 % sobre blanco: se ve como mancha pálida (`globals.css`, `FondoAnimado.tsx`) | Subir tamaño y contraste en puntos de decisión, variar tono (menta, azul del logo, dorado sobre negro) y usarla en estados vacíos, 404 y "próximamente"; hacerla forma de sistema (insignias, puntos del carrusel) |
| P1 | Tarjetas sin destino | Ni foto ni nombre enlazan a una ficha; no existe `/producto/[slug]` | Ficha de producto con `<ViewTransition>` (foto que viaja), marca y formato, precio por unidad más legible |
| P2 | Escape en el menú de categorías pierde el foco | Escape cierra pero el foco queda en `BODY` (medido); el menú no tiene `role` ni flechas | Devolver el foco al botón al cerrar; flechas arriba/abajo; `role="menu"` o lista con `aria-labelledby` |
| P2 | Carrusel que rota solo sin botón de pausa | Rota cada 7 s; solo se pausa con hover/foco (WCAG 2.2.2 pide un control; el celular no tiene hover) | Botón pausa/reproducir visible y `aria-live="off"` mientras rota |
| P2 | Carrito: foco y avisos | Tras "Eliminar" y "Vaciar carrito" el foco pasa a `BODY` y no se anuncia nada; no hay región `status` en `/carrito` | Mover foco a la fila siguiente o al título; `role="status"` con "X quitado"; deshacer o confirmación al vaciar |
| P2 | Sin `error.tsx`, `not-found.tsx` ni `loading.tsx` | Un 404 o fallo cae a la pantalla por defecto de Next | Crearlos con burbuja grande y mensaje de marca; reutilizar `PaginaProximamente` |
| P2 | Encabezados | Solo `/` tiene `h1` (y es el marcador "[Título de la promoción]"); las otras 11 rutas usan `h2` como título | `EncabezadoSeccion` con prop `nivel` y `h1` en cada página; en el home, un `h1` fijo con el nombre de la tienda |
| P2 | Objetivos táctiles | Carrito 40×40 (cantidad, eliminar), "Vaciar carrito" 86×36, buscar 42 px de alto, puntos 36×44, "Ver todas" 57×44 | `size-11` en los controles del carrito; padding en "Vaciar carrito"; buscador de 44 px |
| P2 | LCP y avisos de consola | 24 avisos: `galletas.webp` es el LCP y está con carga diferida; 1 aviso de `scroll-behavior: smooth` | `prioridad` en la primera fila de categorías; `data-scroll-behavior="smooth"` en `<html>` |
| P2 | El carrito no cierra la compra | Sin despacho ni total; la barra de despacho gratis está oculta mientras el monto sea `null`; "Ir a pagar" lleva a una página vacía | Mostrar siempre el mensaje de despacho ("monto por definir"); sugerencias "Te puede faltar" |
| P3 | Flash de "$0" antes de hidratar | El header muestra $0 un instante a quien ya tenía carrito | Ocultar total y badge hasta hidratar, o esqueleto del monto |
| P3 | Menú hamburguesa azul oscuro en móvil y verde en escritorio | Inconsistencia de color | Unificar |
| P3 | Dos escalas anidadas | Tarjeta ×1,03 y botón ×1,05 pueden dar un "salto" al entrar al botón | Mantener, o dejar al botón en 1,03 dentro de tarjeta |
| P3 | Banner oscuro en móvil | "[30%] dcto." roza la foto a 375 px | Limitar el ancho del titular |
| P3 | Ayuda y confianza | `/ayuda`, `/seguimiento`, `/quienes-somos` son una frase y un botón; pie con datos sin completar | Contenido real (despachos, devoluciones, contacto, medios de pago) |
| P3 | Cantidad sin límite de stock | El selector no respeta `stock` | Tope y aviso "últimas unidades" |

## 4. Evidencia medida (B)

- **Contraste:** todas las combinaciones de texto visibles en home, carrito y búsqueda pasan AA; mínimo 5,0:1 (blanco sobre verde #2E7D5B). Sin medir: hover, foco y bordes.
- **Teclado:** orden de Tab lógico (26 pasos, todos visibles); skip-link funciona (primer Tab, visible al enfocar) pero `main` no recibe el foco; menú cerrado inalcanzable por teclado; tras "Agregar" el foco va al "+" y vuelve a "Agregar" al llegar a 0.
- **Lector de pantalla:** regiones `status` en cada tarjeta con mensajes correctos; `aria-expanded` en el menú; el carrito del header cambia de etiqueta pero no se anuncia.
- **Movimiento:** con `no-preference` 19 animaciones/transiciones; con `reduce` desaparecen burbujas, camión y progreso del carrusel, y se conserva el fundido del selector. Pico de 33 animaciones activas al hacer scroll (por las burbujas y el revelado).
- **Rendimiento (dev):** LCP 536 ms, CLS 0, header de 88 px sin cambios al fijarse.
- **Hover de tarjeta:** foto y botón crecen juntos con la tarjeta (×1,03, 0,3 s); el botón solo crece más (×1,05) cuando el cursor está sobre él; con `reduce` no hay escala.

## 5. Siguiente ola sugerida

1. **Accesibilidad rápida (≈0,5 día):** foco en Escape y en el carrito, `h1` por página, objetivos de 44 px, pausa del carrusel, `prioridad` en imágenes iniciales, `data-scroll-behavior`.
2. **Estados de marca (≈1 día):** `not-found`, `error`, `loading`, estados vacíos con burbuja; banner principal con identidad; burbuja más visible y con tonos.
3. **Ficha de producto (≈1–2 días):** ruta, enlaces desde tarjetas, `ViewTransition`.
4. **Cierre de compra:** carrito con despacho, sugerencias y confirmación al vaciar.
5. **Contenido real:** fotos recortadas, textos, ayuda y pie. Es lo que más mueve la percepción de calidad.

## 6. Estado: accesibilidad rápida (implementada)

Resuelto tras esta auditoría y verificado en el navegador:

- **Menú de categorías:** Escape devuelve el foco al botón; flecha abajo abre y enfoca la primera opción; flechas, Inicio y Fin recorren las opciones; la lista tiene nombre accesible.
- **Carrito:** tras "Eliminar" o al llegar a 0 el foco pasa a la lista, y tras "Vaciar carrito" al mensaje de carrito vacío; un aviso `role="status"` anuncia cada cambio.
- **Encabezados y salto:** un `h1` por página (en el home, uno fijo con el nombre de la tienda y los banners pasan a `h2`); el `main` recibe el foco al usar "Saltar al contenido".
- **Objetivos táctiles:** carrito, selector de cantidad, "Vaciar carrito", puntos del carrusel, "Ver todas" y buscador llegan a 44 px (medido: ningún control del carrito por debajo de 44×44).
- **Carrusel:** botón de pausa/reproducir visible (`aria-pressed`) que congela la barra de progreso, y `aria-live="polite"` mientras está pausado.
- **Rendimiento y consola:** fotos del primer pantallazo con carga inmediata (las diferidas están bajo el pliegue); `data-scroll-behavior="smooth"` en `<html>`; el total del header ya no muestra "$0" un instante antes de hidratar.

Pendiente del resto de la auditoría: identidad (banner principal y burbuja), ficha de producto, `error`/`not-found`/`loading`, cierre de compra y contenido real.
