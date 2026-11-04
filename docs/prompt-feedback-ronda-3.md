# Prompt para ejecutar: feedback ronda 3 (Comercial Sedyjo)

Pega este texto como instrucción. Está dividido en 3 fases; al cerrar cada una se hace una pausa para tu visto bueno.

---

## Orden de ejecución (bloques pequeños)

Cada bloque se hace completo, se verifica y se entrega antes de pasar al siguiente. Se puede pedir uno solo ("ejecuta el bloque 1A").

| Bloque | Contenido | Puntos del prompt |
|---|---|---|
| **1A** Ajustes rápidos | Carrusel sin botón de pausa (8 s), hover de "Agregar" al 2 %, header responsive sin desorden, revisión de tablet | 1.1, 1.2, 1.3, 1.4 |
| **1B** Contenido y dinamismo | Fondo de íconos en la sección negra, ofertas y recomendaciones compactas en categorías, carga por lotes en celular y datos simulados ampliados | 1.5, 1.6, 1.7 |
| **2A** Cuenta y carrito | Menú Iniciar sesión / Registrarse y carrito lateral | 2.1, 2.2 |
| **2B** Modal | Modal de ofertas especiales (simple y galería) | 2.3 |
| **3A** Cuenta del cliente | Ingresar, registro, historial de compras, estado del pedido y envío | 3.1, 3.2 |
| **3B** Compra | Checkout en pasos, éxito y error | 3.3 |

---

## Contexto y reglas

Trabaja en el frontend de Comercial Sedyjo (Next.js 16, TypeScript, Tailwind v4). Antes de tocar nada lee `CLAUDE.md`, `AGENTS.md`, las skills `sedyjo-frontend` y `sedyjo-nueva-seccion` y la guía de Next.js en `node_modules/next/dist/docs/`. Usa las skills de diseño (impeccable, ui-ux-pro-max) para decidir y revisar.

Reglas fijas:
- **No hagas commits ni toques GitHub.**
- Solo frontend: todo lo que dependa del backend (sesión, pedidos, pago, panel de administración) se construye con **datos simulados** detrás de las funciones de `src/lib/data/` y con tipos + esquemas Zod como contrato. Nada de credenciales, tarjetas ni pagos reales.
- Mantén la arquitectura por funcionalidades (`features/auth`, `features/cuenta`, `features/pedidos`, `features/checkout`, `features/promociones`), `components/ui` sin lógica de negocio, colores solo con tokens, dorado/morado solo sobre fondo negro.
- Todo lo nuevo respeta `prefers-reduced-motion`, funciona con teclado y lector de pantalla (foco atrapado y devuelto en modales y paneles, Escape cierra, `inert` en el fondo, anuncios `role="status"`), y usa objetivos táctiles de 44 px.
- Todo debe verse bien y proporcionado en **celular, tablet y escritorio**. Prueba cada fase en 375, 640, 768, 820, 1013, 1024, 1180 y 1440 px, con movimiento normal y reducido.
- Al cerrar cada fase corre `tsc`, `eslint`, `vitest`, `build`, verifica en el navegador y entrégame un reporte corto (qué cambió, qué medí, qué quedó pendiente). Agrega pruebas de Vitest para la lógica pura nueva.

---

## Fase 1 — Ajustes y pulido

**1.1 Carrusel del banner principal.** Quita el botón de pausa y todo su estado (`detenido`, `aria-pressed`, el `aria-live` condicionado). El carrusel avanza solo cada **8 s** (constante única `INTERVALO_MS`), con la barra de progreso. Se conserva la pausa pasiva al pasar el cursor o enfocar y no rota con "reducir movimiento"; documenta en un comentario que se quitó el botón por decisión de diseño (WCAG 2.2.2 lo pide para contenido que rota solo; la pausa por hover/foco y la rotación desactivada con movimiento reducido son la mitigación).

**1.2 Hover del botón "Agregar".** Quita el crecimiento de la tarjeta completa en las tarjetas de producto (clara y oscura). Solo el botón "Agregar" crece **~2 %** (`scale-[1.02]`) con transición suave de 200 ms y se hunde al presionar. Conserva el cambio sutil de borde/sombra de la tarjeta si no compite con el botón. Las tarjetas de categoría quedan como están.

**1.3 Header responsive sin desorden.** Hoy, cerca de 1013 px, el carrito y "Ingresar" se descolocan porque el header depende de `flex-wrap` y de un buscador con base fija de 380 px. Rediséñalo con breakpoints explícitos (sin depender del salto de línea):
- `< 640`: como el celular actual (menú, logo, cuenta, carrito; buscador a todo el ancho debajo).
- `640–1023` (tablet): una sola fila compacta: menú, logo, buscador flexible (`min-w-0 flex-1`), cuenta y carrito solo con ícono y burbuja, nada que envuelva.
- `≥ 1024`: versión completa (texto "Ingresar", total del carrito).
Verifica sin saltos de línea en 640, 768, 820, 900, 1013, 1023, 1024 y 1180.

**1.4 Tablet.** Revisa home, categorías, ofertas, búsqueda y carrito: rejilla de productos de 3 columnas entre 640 y 1023, portada con proporciones correctas (banner principal y banners oscuros), tipografías y espacios intermedios, sin desbordes.

**1.5 Fondo de dibujos (doodles) en la sección negra "exclusivo online".** Se mantiene el fondo negro `#0B0B0F`. Encima va un patrón de **dibujos de contorno al estilo de la imagen de referencia** (pizarra con garabatos de línea blanca) **pero con temática del negocio**, en dorado `#FFC83D` y morado `#D15BFF`.

Estilo a copiar de la referencia:
- Contorno de línea continua de grosor parejo (≈1,75–2 px en una celda de 1000 px), terminaciones y uniones redondeadas, **sin relleno**. En algunos objetos, un segundo contorno interior (doble línea) y pequeños rayados o brillos.
- Trazo ligeramente irregular, como hecho a mano (no geométrico perfecto) y proporciones divertidas.
- Composición densa y orgánica: objetos de tamaños muy distintos, **rotados entre −30° y +30°**, mezclados con "rellenos" pequeños (círculos, espirales, destellos, estrellitas, puntos, rayitas de movimiento).
- Algunos "stickers": estallido/burbuja de diálogo con símbolo (`%`, `$`, `!`) y **rótulos dibujados** con letras de contorno (OFERTA, GRATIS, NUEVO, -30%, 2x1, ENVÍO).

Qué dibujar (solo cosas del negocio, sin panadería ni repostería, que Sedyjo no vende): carrito y canasto de compras, bolsa con asas, etiqueta de precio, burbuja con `%`, estallido "OFERTA", camión de despacho, caja/paquete con cinta, regalo, reloj de "oferta por tiempo", cursor tocando un botón, celular con bolsa, tarjeta de descuento; **abarrotes** (saco de arroz, fideos, botella de aceite, latas, huevera, bolsa de azúcar); **confitería** (caramelos, chocolate, paleta, galletas, chupete); **bebidas** (botella, caja de jugo, vaso con pitillo); **aseo y limpieza** (escoba, balde con burbujas, esponja, aerosol, papel higiénico, guantes); **higiene personal** (shampoo, jabón, cepillo de dientes, pasta dental, toalla); **detergentes** (botella de detergente con burbujas); y el **motivo propio de Sedyjo: burbujas** y la corona del logo.

Cómo construirlo:
- Dibújalos tú como SVG propio (no el set de íconos de Lucide): un archivo `public/patrones/doodles-comercio.svg` con un **mosaico que se repite sin cortes** (los objetos que tocan el borde se duplican al lado opuesto), con colores dorado y morado y las variantes de trazo ya incluidas. Debe pesar poco (<60 KB).
- Se aplica como `background-image` repetido en una capa absoluta `FondoDoodlesComercio` dentro de la sección (`aria-hidden`, `pointer-events-none`), con opacidad **10–16 %** para que los textos dorados, las insignias y las fotos sigan siendo lo principal. Zona de seguridad: si hace falta, un degradado oscuro suave detrás del título y la fecha de vigencia.
- Escala: mosaico de ~900 px en escritorio, ~640 px en tablet y ~460 px en celular (menos objetos visibles en pantallas chicas).
- Movimiento opcional y muy lento: deriva del fondo con `transform` (≥60 s por ciclo), desactivada con "reducir movimiento".
- Comprueba que el contraste de los textos sobre el fondo sigue ≥4,5:1 y que no hay desborde horizontal.

**1.6 Ofertas y recomendaciones dentro de cada categoría.** En `/categoria/[slug]` (y también en `/buscar`), debajo del listado y con tarjetas **más pequeñas** (versión compacta: miniatura, nombre, precio, precio anterior/etiqueta y botón de agregar mínimo), muestra:
- "Ofertas que te pueden servir": productos con descuento o promo de **otras categorías**.
- "Recomendados para ti": productos afines (misma colección o categorías cercanas), sin repetir los ya mostrados.
En celular es una tira deslizable; en tablet 3 columnas; en escritorio 4–5. Crea `TarjetaProductoCompacta`, la función `getRecommendations({ excluirCategoriaSlug, limite })` en `lib/data` y su prueba.

**1.7 Carga dinámica en celular.** En vistas de celular y tablet los listados no aparecen de golpe: se renderiza un primer lote (6 productos) y se añaden lotes de 6 automáticamente al acercarse al final (IntersectionObserver), con esqueletos mientras llegan y una entrada más expresiva y escalonada por tarjeta (sube y se agranda de 0,96 a 1, tope de escalones). Debe haber también un botón visible "Ver más productos" como respaldo, un aviso `role="status"` ("Se cargaron 6 productos más"), y el pie de página siempre alcanzable. En escritorio puede mantenerse la rejilla completa. Para poder probarlo, **amplía los datos simulados a ~24 productos** en todas las categorías (varios con descuento, uno agotado, algunos con foto de las que existen).

**Criterios de aceptación fase 1:** carrusel sin botón y rotando a 8 s; solo el botón "Agregar" crece 2 %; header ordenado en todos los anchos probados; fondo de íconos visible y legible; las vistas de categoría muestran ofertas y recomendaciones compactas de otras categorías; en celular los productos se cargan por lotes con animación; sin desbordes horizontales; 0 errores de consola.

---

## Fase 2 — Superposiciones

**2.1 Menú de cuenta (Iniciar sesión / Registrarse).** Extrae de `MenuCategorias` un componente genérico `MenuDesplegable` (misma animación suave de cortina, cascada de opciones, chevron, Escape, flechas, `inert` cuando está cerrado) y úsalo en las dos cosas. Para "Ingresar": se abre al **pasar el cursor** (solo en dispositivos con hover, con ~120 ms de tolerancia al cerrar para no parpadear), y también con clic, Enter/Espacio y teclado (en celular y tablet táctil abre con toque). Opciones: **Iniciar sesión** (`/ingresar`) y **Registrarse** (`/registro`). Con sesión simulada activa muestra "Hola, {nombre}", Mi cuenta, Mis pedidos y Cerrar sesión.

**2.2 Carrito lateral (mini-carrito).** Al hacer clic en el carrito del header se abre un **panel lateral** deslizante desde la derecha (en celular ocupa casi todo el ancho): título con cantidad, lista de productos con foto, nombre, cantidad editable y eliminar, subtotal, barra de despacho gratis si el monto está definido, y botones "Ver carrito" (`/carrito`) y "Ir a pagar" (`/checkout`). Fondo oscurecido suave, scroll del fondo bloqueado, foco atrapado y devuelto al botón, Escape y clic fuera cierran, estado vacío con invitación a seguir comprando. Usa `<dialog>` con `showModal()` o un patrón equivalente accesible, con transiciones de entrada y salida. La burbuja que vuela al carrito sigue funcionando. `/carrito` se mantiene como vista completa.

**2.3 Modal de ofertas especiales.** Modal (`features/promociones`) que puede ser una **oferta simple** o una **galería con carrusel** (flechas, puntos de 44 px, deslizar con el dedo, sin rotación automática). Lo activa el administrador: hoy se controla desde un contrato `getCampanaModal()` con datos simulados (`activo`, `tipo`, `slides[{imagen, titulo, texto, enlace}]`, `vigenciaHasta`, `frecuencia`); cuando exista el panel de administración solo cambia el interior de esa función. Reglas: aparece unos segundos después de cargar (no sobre `/carrito`, `/checkout` ni páginas de cuenta), se muestra **una vez por sesión** (y se recuerda el cierre 24 h), se cierra con botón visible, Escape y clic fuera, atrapa el foco, respeta movimiento reducido y nunca bloquea al usuario.

**Criterios de aceptación fase 2:** menú de cuenta animado igual que el de categorías y operable con ratón, teclado y toque; mini-carrito abre/cierra suave, accesible y sincronizado con el estado; modal activable/desactivable desde los datos simulados, en modo simple y galería; todo probado en celular, tablet y escritorio.

---

## Fase 3 — Cuenta, pedidos y compra

Todo con datos simulados y un contrato claro (tipos y esquemas Zod en `types/` y `lib/validation/`): `Usuario`, `Sesion`, `Pedido`, `ItemPedido`, `EstadoPedido`, `EventoEnvio`, `Direccion`.

**3.1 `/ingresar` y `/registro`.** Formularios con etiquetas visibles, validación con Zod en el cliente, errores junto al campo y resumen accesible, mostrar/ocultar contraseña, enlace "Olvidé mi contraseña" (pantalla simulada), y estados de carga y error. La sesión es **simulada** y solo para desarrollo (indicador visible "modo demostración"); nunca almacenes ni registres contraseñas. Define el contrato de autenticación para que el backend lo reemplace después.

**3.2 Cuenta del cliente.** Rutas protegidas por la sesión simulada: `/cuenta` (resumen), `/cuenta/pedidos` (**historial de productos comprados** y pedidos anteriores, con volver a comprar) y `/cuenta/pedidos/[id]` (detalle del pedido con el **estado del pedido y del envío** en una línea de tiempo: recibido → preparando → en camino → entregado, con fechas, dirección y resumen). Integra el seguimiento con la página `/seguimiento`. Estados vacíos y de carga diseñados.

**3.3 Proceso de compra y pago.** `/checkout` en pasos con indicador de progreso: **1) Datos de contacto y despacho/retiro, 2) Resumen y método de pago, 3) Confirmación**, con el resumen del pedido siempre visible (a un lado en escritorio, plegable en celular). La pasarela (Webpay Plus o Mercado Pago) no está definida: el paso de pago muestra la selección de método y **redirige a una pantalla simulada**; no se piden datos de tarjeta en nuestra interfaz. Agrega `/checkout/exito` y `/checkout/error` y que el carrito se vacíe solo en el éxito. Costos y zonas de despacho en `lib/config.ts` como pendientes (`null`) hasta tener los datos.

**Criterios de aceptación fase 3:** se puede registrar, iniciar sesión simulada, ver historial y detalle con línea de tiempo, recorrer el checkout completo hasta éxito y hasta error, y cerrar sesión; todo accesible y responsive; pruebas de Vitest para el estado del pedido, los pasos del checkout y los esquemas.

---

## Decisiones confirmadas

1. Intervalo del carrusel: 8 s.
2. El hover de 2 % aplica al botón "Agregar" de todas las tarjetas de producto (claras y oscuras); el resto de botones mantiene su crecimiento de 5 %.
3. Imagen de referencia recibida: estilo de pizarra con garabatos de contorno; se replica el estilo con dibujos propios del negocio sobre fondo negro (punto 1.5).
4. **Backend: no se trabaja todavía.** Solo frontend, con datos simulados y contratos (tipos + Zod) para el futuro.

---

## Prompts listos para pegar

### Bloque 1A — Ajustes rápidos

> Ejecuta el **bloque 1A** de `docs/prompt-feedback-ronda-3.md` (puntos 1.1 a 1.4): (1) quita el botón de pausa del carrusel principal y que rote solo cada 8 s, con pausa solo al pasar el cursor o enfocar y sin rotar con movimiento reducido; (2) quita el crecimiento de la tarjeta de producto completa y haz que solo el botón "Agregar" crezca ~2 % al pasar el cursor, con transición suave; (3) rediseña el header con breakpoints explícitos (móvil <640, tablet 640–1023 en una sola fila compacta con ícono de cuenta y carrito con burbuja, completo desde 1024) para que nada se desordene cerca de 1013 px; (4) revisa tablet en home, categorías, ofertas, búsqueda y carrito. Prueba en 375, 640, 768, 820, 900, 1013, 1023, 1024, 1180 y 1440 px. No hagas commits ni toques el backend. Al terminar corre tsc, eslint, vitest y build, verifica en el navegador y entrégame un reporte corto.

### Bloque 1B — Doodles, ofertas en categorías y carga dinámica

> Ejecuta el **bloque 1B** de `docs/prompt-feedback-ronda-3.md` (puntos 1.5 a 1.7). (1.5) En la sección negra "exclusivo online" mantén el fondo negro y agrega un patrón de dibujos de contorno al estilo de la imagen de referencia (garabatos de línea, doble contorno, rotados, con espirales, destellos y rótulos como OFERTA o -30%) pero solo de cosas del negocio (carrito, canasto, etiqueta, camión, caja, abarrotes, confitería, bebidas, aseo, higiene, detergentes, burbujas), sin panadería ni repostería. Dibújalos tú como un SVG propio de mosaico repetible en dorado y morado (`public/patrones/doodles-comercio.svg`), aplicado como fondo con opacidad 10–16 %, escala distinta por pantalla y sin romper el contraste de los textos. (1.6) En `/categoria/[slug]` y `/buscar` agrega, bajo el listado, "Ofertas que te pueden servir" y "Recomendados para ti" con tarjetas compactas de otras categorías (tira deslizable en celular, 3 columnas en tablet, 4–5 en escritorio). (1.7) En celular y tablet carga los productos por lotes de 6 con esqueletos, entrada animada escalonada, botón "Ver más productos" de respaldo y aviso para lectores de pantalla; amplía los datos simulados a ~24 productos. No hagas commits ni toques el backend. Verifica en 375, 768, 1024 y 1440 px, con movimiento normal y reducido, y entrégame un reporte corto.

### Bloques siguientes

Se piden igual: "Ejecuta el **bloque 2A** (puntos 2.1 y 2.2)…", "**2B** (2.3)…", "**3A** (3.1 y 3.2)…" y "**3B** (3.3)…" de `docs/prompt-feedback-ronda-3.md`, siempre con datos simulados y sin backend.
