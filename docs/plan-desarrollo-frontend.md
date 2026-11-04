# Plan de desarrollo del frontend — Comercial Sedyjo

Alcance: **solo frontend**, con datos simulados y contratos (tipos + Zod). Nada de backend ni pagos reales.
Estado de partida: portada, categorías, ofertas, búsqueda, cuenta, carrito, checkout simulado (despacho a domicilio + Webpay) y seguimiento ya funcionan. Las animaciones están siempre activas por decisión del negocio.

## Reglas que aplican a todos los bloques
- No hacer commits ni tocar GitHub salvo orden expresa.
- Arquitectura por funcionalidades; `components/ui` sin lógica de negocio; colores solo con tokens (dorado y morado solo sobre fondo negro; rojo solo en descuentos).
- Accesible (teclado, lector de pantalla, objetivos de 44 px, un `h1` por página) y responsive en 375, 640, 768, 820, 1013, 1024, 1180 y 1440 px.
- Cada bloque cierra con `npx tsc --noEmit && npx eslint && npm test && npm run build`, verificación en navegador y pruebas Vitest para la lógica nueva.
- Datos del negocio siempre en `src/lib/config.ts`.

## Resumen del calendario sugerido

| Bloque | Contenido | Esfuerzo | Depende de |
|---|---|---|---|
| **4A** | Ficha de producto | M | — |
| **4B** | Páginas de error, 404 y carga | S | — |
| **5A** | Datos de la cuenta (perfil, direcciones, contraseña) | M | — |
| **5B** | Páginas legales, ayuda y quiénes somos | S | Textos del negocio (se arma con relleno marcado) |
| **6A** | SEO y compartir | S | 4A |
| **6B** | Accesibilidad y tablet | M | 4A–5B |
| **6C** | Pruebas de extremo a extremo | M | 4A–5A |
| **7A** | Despliegue en cPanel | S | 6B |
| **7B** | Documento de contratos para el backend | S | 5A |
| **7C** | Panel de administración simulado (opcional) | L | 7B |

Esfuerzo: S = medio día, M = 1 a 2 días, L = 3 días o más. Los bloques 4A, 4B, 5A y 5B son independientes entre sí y se pueden trabajar en paralelo.

---

## Bloque 4A — Ficha de producto `/producto/[slug]`
**Objetivo:** que cada producto tenga su página; hoy los enlaces apuntan a una ruta inexistente.

**Tareas**
1. Ruta `app/producto/[slug]/page.tsx` (params dentro de `<Suspense>`), usando `getProductBySlug` y `generateStaticParams` con los productos simulados.
2. Galería de imágenes con miniaturas y marcador mientras no haya fotos (`FotoOMarcador`), sin saltos de diseño.
3. Bloque de compra: nombre, marca, unidad, precio, precio anterior tachado, insignia de descuento, precio por unidad, estado de stock (disponible, pocas unidades, agotado) y `AgregarAlCarrito` con cantidad.
4. Descripción corta y datos del producto; aviso de despacho gratis sobre $49.990 y plazo de 24 a 48 horas.
5. "Productos relacionados" reutilizando `getRecommendations` y `TarjetaProductoCompacta`.
6. Migas de pan (inicio › categoría › producto) y enlaces desde todas las tarjetas, el carrito, los pedidos y "Lo que ya compraste".
7. Estados: carga con esqueleto, producto no encontrado (404 propio) y agotado.

**Criterios de aceptación:** todos los enlaces a producto funcionan; agregar desde la ficha abre el flujo del carrito con la burbuja y el contador; 375 a 1440 px sin desbordes; Vitest para la lógica de stock y descuento.

## Bloque 4B — Páginas de error, 404 y carga
**Tareas**
1. `app/not-found.tsx` con la marca (burbujas), buscador y accesos a categorías.
2. `app/error.tsx` y `app/global-error.tsx` con "Reintentar" y "Volver al inicio".
3. `loading.tsx` por sección con esqueletos que mantengan la altura del contenido real (evitar saltos de diseño).
4. Corregir los saltos de diseño medidos: 0,064 en `/cuenta` y 0,032 en `/checkout`.

**Criterios:** una ruta inexistente muestra el 404 de marca; un error simulado muestra la pantalla de error y permite reintentar; sin saltos de diseño visibles.

## Bloque 5A — Datos de la cuenta
**Tareas**
1. `/cuenta/perfil`: editar nombre y correo con validación Zod y mensajes accesibles.
2. `/cuenta/direcciones`: libreta de direcciones (agregar, editar, eliminar, marcar principal) con contrato `Direccion`, guardada en la sesión simulada.
3. El checkout ofrece elegir una dirección guardada o escribir una nueva, y permite guardarla.
4. Cambiar contraseña (formulario simulado; nunca se guarda ni se registra).
5. Agregar "Perfil" y "Direcciones" a la navegación de la cuenta y al menú de usuario.
6. Acciones simuladas en `features/cuenta/acciones.ts` con el contrato que luego reemplazará el backend.

**Criterios:** todo el flujo funciona con teclado; las direcciones se reutilizan en el checkout; Vitest para los esquemas y la lógica de la libreta.

## Bloque 5B — Páginas legales, ayuda y quiénes somos
**Tareas**
1. Rutas: `/terminos`, `/privacidad`, `/cambios-y-devoluciones`, `/despachos` y `/preguntas-frecuentes` con una plantilla común de lectura.
2. Reemplazar "próximamente" en `/ayuda` y `/quienes-somos` por la estructura final, con relleno claramente marcado `[...]` para que el negocio solo pegue su texto.
3. `/despachos` ya con los datos reales: plazo 24 a 48 horas, despacho gratis sobre $49.990 y pago con Webpay; costo y zonas como "por confirmar".
4. Enlaces en el pie de página y la barra superior; sacar el texto "[Cambios y devoluciones]" entre corchetes.
5. Aviso de consentimiento de cookies solo si el negocio lo define (hoy no se usan cookies de seguimiento).

**Criterios:** ningún enlace del pie lleva a una página vacía; textos legibles (ancho de línea, jerarquía de títulos).

## Bloque 6A — SEO y compartir
**Tareas:** `sitemap.ts` y `robots.ts`; metadatos y `openGraph` por página; imagen para redes sociales; datos estructurados (`Product`, `Organization`, `BreadcrumbList`) en la ficha; `lang` y títulos únicos por ruta; `noindex` en carrito, checkout y cuenta.
**Criterios:** el `sitemap` lista categorías y productos; los títulos no se repiten.

## Bloque 6B — Accesibilidad y tablet
**Tareas**
1. Recorrido completo con teclado y lector de pantalla de portada, categoría, ficha, carrito, checkout y cuenta.
2. Revisar contraste (incluido el borde de controles) y el orden del foco en modales y paneles.
3. Revisar 640 a 1180 px tras los últimos cambios (franja de despacho, panel verde de ingreso, checkout).
4. Decidir con el negocio si se agrega un botón propio de "reducir animaciones" (hoy las animaciones están siempre activas).

**Criterios:** lista de verificación firmada por vista; sin desbordes horizontales en los ocho anchos.

## Bloque 6C — Pruebas de extremo a extremo
**Tareas:** configurar Playwright como prueba del proyecto; escenarios: buscar → agregar → pagar con éxito, pago rechazado con carrito intacto, registro e ingreso, volver a comprar, seguimiento sin cuenta, carrito vacío, validaciones del checkout. Agregar el script `npm run test:e2e`.
**Criterios:** los escenarios pasan sobre el build de producción.

## Bloque 7A — Despliegue en cPanel
**Tareas:** ejecutar `npm run build:cpanel` y probar que `standalone` arranque con Node 20.9 o superior; revisar archivos estáticos, fuentes e imágenes; documentar el procedimiento de subida por FTP y el reinicio en el README.
**Criterios:** la tienda funciona completa desde la carpeta de salida.

## Bloque 7B — Documento de contratos para el backend
**Tareas:** `docs/contratos-backend.md` con tipos, esquemas Zod, cada acción simulada con el endpoint que la reemplazará (entrada, salida, errores), reglas de negocio (precios y stock recalculados en servidor, estados del pedido, despacho gratis sobre $49.990) y los datos de ejemplo actuales como referencia.
**Criterios:** quien haga el backend puede construir sin leer el código de las pantallas.

## Bloque 7C — Panel de administración simulado (opcional)
Interfaz con datos locales para activar el modal de ofertas, editar banners y elegir la oferta del día. Conviene dejarlo para el final, porque depende de cómo el backend lo exponga.

---

## Pendientes del negocio (no son código)
| Dato | Dónde se usa | Estado |
|---|---|---|
| Costo y zonas de despacho | `COSTO_DESPACHO`, `ZONAS_DESPACHO` en `src/lib/config.ts` | Pendiente |
| Correo definitivo | `CORREO_CONTACTO` (hoy `contacto@sedyjo.com`) | Por confirmar |
| Fotos reales de productos y categorías | `public/images/productos` | Pendiente |
| Textos oficiales (banners, ofertas, ayuda, quiénes somos, legales) | Marcadores `[...]` | Pendiente |
| Respuestas de backend y hosting (sección 8 del documento original) | Contratos de datos | Pendiente |

## Riesgos
- **Textos legales:** deben ser revisados por quien corresponda antes de publicar; el frontend solo deja la estructura.
- **Animaciones siempre activas:** quienes tienen sensibilidad al movimiento no pueden reducirlas. Considerar el botón propio del bloque 6B.
- **Datos de pedidos:** los pedidos nuevos de la demostración viven solo en la pestaña donde se crean; se resuelve con el backend.
