# Comercial Sedyjo — Frontend

Tienda online (supermercado, Candelaria, San Pedro de la Paz). Este repositorio contiene **solo el frontend**.
Base: *Decisiones iniciales del frontend* (v0.1) y la maqueta del home (escritorio y móvil).

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS v4 · Zustand (carrito, localStorage) ·
Motion · Lucide · Zod · ESLint · Prettier · Vitest.

## Comandos

```bash
npm run dev          # desarrollo en http://localhost:3000
npm run build        # compilación de producción
npm run lint         # ESLint
npm test             # Vitest (lógica pura, esquemas y datos estructurados)
npm run test:e2e     # Compila y corre las pruebas de extremo a extremo (Playwright)
npm run test:e2e:rapido  # Solo las pruebas, sobre un build ya hecho
npm run format       # Prettier
npm run build:cpanel # build + prepara .next/standalone para subir por FTP
```

## Estructura (por funcionalidades)

```
src/
  app/          Rutas delgadas: / , /categoria/[slug], /producto/[slug], /carrito, /checkout, /cuenta
  features/     auth (sesión simulada), banners, carrito (incluye carrito lateral), catalogo (checkout y cuenta: pendientes)
  components/   ui/ (sin lógica de negocio) y layout/ (header, pie, fondo animado)
  lib/          data/ (acceso a datos + mock/*.json), utils/ (CLP), validation/ (Zod)
  types/        Contratos de datos: Producto, Categoria, Banner, ItemCarrito, Orden
  styles/       tokens.css (paleta y fuentes) y globals.css
public/         Logo e imágenes pre-optimizadas (WebP)
scripts/        optimizar-imagen.mjs, preparar-standalone.mjs
```

Reglas: las páginas de `app/` solo piden datos y arman secciones de `features/`; todo acceso a datos pasa por
`getProducts()`, `getProductBySlug()`, `getCategories()` y `getBanners()` (hoy leen JSON simulados; al llegar el
backend solo cambia su interior); servidor por defecto, cliente solo para carrito, selector de cantidad,
menú de categorías y carrusel.

## Catálogo desde la API de Sedyjo

Los productos y las categorías se leen de la API real (`https://api.sedyjo.com/api/v1`, solo `GET`, sin clave). La conexión vive en `src/lib/data/catalogo-api.ts` (red, caché de minutos) y `src/lib/data/adaptador-api.ts` (traduce la API a los tipos del frontend, con pruebas). Las pantallas siguen usando `getProducts`, `getCategories`, etc.

- Para apuntar a otra API (por ejemplo la local en `http://localhost:3004`): variable de entorno `SEDYJO_API_URL`.
- La API todavía no entrega slug, precio anterior, ofertas, marca ni unidad. El slug se genera del nombre; las ofertas y descuentos no se muestran hasta que existan; los destacados del inicio se reparten entre categorías de forma provisoria.
- Los fondos de color por categoría los define el frontend (`fondoDeCategoria`).
- Las fotos actuales son de prueba (DummyJSON); hay que reemplazarlas por fotos propias antes de publicar.
- Los pedidos de ejemplo (`mock/pedidos.json`) siguen simulados, pero con productos reales del catálogo.

## Modal de ofertas especiales

Una oferta simple o una galería con carrusel, que el administrador activa. Hoy se controla desde
`src/lib/data/mock/campana-modal.json` (`activo`, `tipo`: `simple` o `galeria`, `slides`, `vigenciaHasta`,
`frecuenciaHoras`, `retrasoSegundos`); cuando exista el panel de administración solo cambia el interior
de `getCampanaModal()` en `src/lib/data/promociones.ts`.

- Aparece unos segundos después de cargar, **una vez por sesión**, y no vuelve hasta pasadas `frecuenciaHoras` desde que el cliente lo cerró.
- Nunca aparece en `/carrito`, `/checkout`, `/cuenta`, `/ingresar` ni `/registro`, ni mientras hay otro panel abierto o el cliente escribe en un campo.
- En desarrollo se previsualiza aunque esté apagado con `/?promo=simple` o `/?promo=galeria` (en producción se ignora).

## Cuenta y pedidos (modo demostración)

No hay backend: la sesión y los pedidos son simulados (`src/features/auth/acciones.ts`, `src/features/pedidos/acciones.ts`) y los datos de ejemplo están en `src/lib/data/mock/pedidos.json`. Las pantallas ya usan los contratos finales (tipos + Zod), así que el backend solo reemplaza el interior de esas acciones.

- `/ingresar`, `/registro`, `/recuperar`: formularios con validación y errores accesibles. Nunca se guarda ni se registra una contraseña.
- `/cuenta`, `/cuenta/pedidos`, `/cuenta/pedidos/[id]`: protegidas por la sesión simulada; historial, "volver a comprar" y línea de tiempo del envío.
- `/seguimiento`: consulta sin cuenta (número + correo). Prueba con `SED-10482` y `demo@sedyjo.cl`.
- `/cuenta/perfil` (nombre, correo y cambio de contraseña) y `/cuenta/direcciones` (libreta de hasta 5 direcciones con una principal): acciones simuladas en `src/features/cuenta/acciones.ts`; la libreta vive en este navegador. El checkout ofrece elegir una dirección guardada o guardar la nueva. Atajos de prueba: correo `error@sedyjo.cl` en el perfil simula una falla del servidor y la contraseña actual `incorrecta` simula credenciales inválidas.
- Cuentas de prueba: `demo@sedyjo.cl` (con pedidos), `error@sedyjo.cl` (error de servidor), `bloqueado@sedyjo.cl` (credenciales inválidas); cualquier otro correo crea un usuario sin pedidos.

## Checkout (modo demostración)

`/checkout` reúne contacto, dirección de despacho y pago. Solo hay despacho a domicilio (24 a 48 horas, gratis sobre $49.990) y solo se paga con Webpay Plus (Transbank); no hay retiro en tienda ni otros medios. `/checkout/pago-simulado` permite probar éxito, rechazo y cancelación; el resultado aparece en `/checkout/exito` o `/checkout/error`. No se solicitan datos de tarjeta ni se hace un cobro real. El carrito se vacía solo al abrir la confirmación de éxito.

Para forzar un rechazo, usa `error@sedyjo.cl` como correo de compra. La cuenta `demo@sedyjo.cl` (cualquier contraseña válida) permite probar el historial; un pedido nuevo aparece solo en la pestaña donde se creó, hasta cerrar esa pestaña. El enlace de seguimiento requiere el número y el correo de la compra.

Los datos del negocio (teléfono, correo, plazo y monto de despacho gratis) están en `src/lib/config.ts`. Quedan pendientes `COSTO_DESPACHO`, `ZONAS_DESPACHO`, la persistencia de pedidos y una pasarela real. Mientras el costo de despacho siga sin definir, se muestra “Por confirmar” y no se calcula un total definitivo.

## Animaciones

Las animaciones se muestran siempre, aunque el sistema operativo tenga activado "reducir movimiento" (decisión del negocio): no hay variantes `prefers-reduced-motion` en el CSS ni en el código.

## Pruebas de extremo a extremo

Están en `e2e/` y corren sobre el build de producción en el puerto 3100 (22 escenarios): buscar, agregar y pagar con éxito; pago rechazado y cancelado con el carrito intacto; validaciones del pago; despacho gratis; registro e ingreso (con sus errores); historial, "volver a comprar", direcciones guardadas y perfil; seguimiento sin cuenta; ficha de producto, 404, sitemap, robots y `noindex`.

- Por defecto usan el Chrome instalado en el equipo. Con otro equipo: `npx playwright install chromium` y `E2E_CANAL=chromium npm run test:e2e`.
- El informe queda en `playwright-report/` y las trazas de los fallos en `test-results/` (ambas carpetas se ignoran en git).
- Los formularios solo validan cuando el JavaScript terminó de cargar; los escenarios esperan ese momento (`networkidle`) antes de escribir.

## Imágenes

Se pre-optimizan antes de subirlas (`images.unoptimized: true` evita gastar CPU del hosting):

```bash
node scripts/optimizar-imagen.mjs <origen.png> public/images/productos/<nombre>.webp 600
```

## Despliegue en cPanel (por FTP)

1. `npm run build:cpanel` en un computador (nunca en el servidor).
2. Subir el contenido de `.next/standalone` por FTP.
3. En *Setup Node.js App*: Node 20.9 o superior, modo Production, archivo de inicio `server.js`.
4. Reiniciar la app desde cPanel tras cada actualización.

## Pendientes

- Ayuda y quiénes somos siguen con textos pendientes del negocio. Cuenta, seguimiento y checkout funcionan en modo demostración hasta integrar el backend.
- Monto mínimo de despacho gratis: definirlo en `src/lib/config.ts` (`DESPACHO_GRATIS_DESDE`); mientras sea `null` la barra de avance del carrito no se muestra.
- Fotos reales de productos y categorías (hoy marcadores punteados) y textos entre `[corchetes]`.
- Respuestas de backend/hosting (sección 8 del documento) para cerrar el contrato de datos.
- Auditoría de diseño y plan de animaciones: `docs/auditoria-frontend.md`.
