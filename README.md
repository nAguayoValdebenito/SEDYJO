# Comercial Sedyjo — Frontend

Tienda online (supermercado, Candelaria, San Pedro de la Paz). Este repositorio contiene **solo el frontend**.
Base: _Decisiones iniciales del frontend_ (v0.1) y la maqueta del home (escritorio y móvil).

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

Productos, categorías, banners e imágenes del sitio se leen de la API real (`https://api.sedyjo.com/api/v1`, solo `GET`, sin clave). La conexión vive en `src/lib/data/catalogo-api.ts` (red, caché de minutos) y `src/lib/data/adaptador-api.ts` (traduce la API a los tipos del frontend, con pruebas). Las pantallas siguen usando `getProducts`, `getCategories`, `getBanners`, `getCampanaModal` y `getImagenesSitio`.

- Para apuntar a otra API (por ejemplo la local en `http://localhost:3004`): variable de entorno `SEDYJO_API_URL`.
- **Productos:** el slug viene de la API (estable: no cambia si se renombra; si faltara, se genera del nombre). La descripción llega como "Marca · presentación" y se separa en marca y unidad; el precio por kilo o litro se calcula cuando la presentación es una sola cantidad. Los precios de oferta (`offerPrice`), el slug estable y las ofertas vigentes (`/offers`, `/offers/daily`) vienen de la API: el producto se cobra al precio de oferta y muestra el normal tachado. "Ofertas de la semana" son los productos en oferta; la franja oscura de la portada muestra la primera oferta vigente que no es la del día; el panel de ingreso muestra la oferta del día. Sin ofertas, la portada cae a una selección provisoria de "Productos destacados".
- **Categorías:** foto de la API (`image`) o, si falta, la de su primer producto. Los fondos de color los define el frontend (`fondoDeCategoria`).
- **Banners** (`/banners`): `hero` → carrusel principal, `dark` → banners oscuros, `modal` → diapositivas del modal de ofertas (aparece solo si hay). La API valida los tamaños (`/image-rules`; ver `docs/guia-de-imagenes.md`). Los enlaces `/productos?category=X` se traducen a `/categoria/<slug>`. Si la API de banners falla, la portada se muestra sin ellos.
- **Imágenes del sitio** (`/site-images`): hoy el encabezado usa la clave `logo` si existe; `favicon`, `apple-icon` y `og-image` siguen siendo los archivos del proyecto.
- Las fotos y los banners actuales son de prueba (Open Food Facts y Lorem Picsum); hay que reemplazarlos por material propio antes de publicar.
- Los pedidos de ejemplo (`mock/pedidos.json`) siguen simulados, pero con productos reales del catálogo.
- En las pruebas E2E el modal de ofertas se marca como cerrado (`e2e/base.ts`) para que no tape la página.

## Modal de ofertas especiales

Una oferta simple o una galería con carrusel, que el administrador activa. Hoy se controla desde
`src/lib/data/mock/campana-modal.json` (`activo`, `tipo`: `simple` o `galeria`, `slides`, `vigenciaHasta`,
`frecuenciaHoras`, `retrasoSegundos`); cuando exista el panel de administración solo cambia el interior
de `getCampanaModal()` en `src/lib/data/promociones.ts`.

- Aparece unos segundos después de cargar, **una vez por sesión**, y no vuelve hasta pasadas `frecuenciaHoras` desde que el cliente lo cerró.
- Nunca aparece en `/carrito`, `/checkout`, `/cuenta`, `/ingresar` ni `/registro`, ni mientras hay otro panel abierto o el cliente escribe en un campo.
- En desarrollo se previsualiza aunque esté apagado con `/?promo=simple` o `/?promo=galeria` (en producción se ignora).

## Cuenta y sesión (API real)

Registro, ingreso, recuperación de contraseña, perfil, direcciones e historial usan la API de Sedyjo (`src/features/auth/acciones.ts`, `src/features/cuenta/acciones.ts`, `src/features/pedidos/acciones.ts`). La identidad sale siempre de la sesión: nunca se envía un `usuarioId` desde el navegador.

- **Sesión:** la API entrega un token opaco (30 días, se renueva al usarse). Vive en la cookie `HttpOnly` `sedyjo_token`, puesta desde el servidor de Next (`src/lib/sesion.ts`); el navegador solo guarda el nombre y el correo para pintar la interfaz (`useSesion`). `SincronizarSesion` confirma al abrir la tienda que la sesión sigue vigente; si venció, se olvida al cliente y las pantallas de la cuenta piden ingresar de nuevo.
- `/ingresar`, `/registro`: validación en el navegador y en el servidor; los errores de la API (`credenciales`, `correo_duplicado`, `demasiados_intentos`) salen junto a cada campo.
- `/recuperar` pide el correo (la API responde siempre igual). **`/recuperar/nueva?token=…`** es la página a la que llega el enlace del correo (vale 60 minutos y una sola vez); al guardar la contraseña nueva la API cierra todas las sesiones.
- `/cuenta/perfil`: nombre, correo y contraseña. **Cambiar el correo exige la contraseña actual** (el formulario la pide solo en ese caso). Cambiar la contraseña cierra las demás sesiones.
- `/cuenta/direcciones`: hasta 5 direcciones, una principal; las reglas (límite, duplicadas, principal única) las aplica la API. El checkout ofrece las guardadas y deshabilita las de comunas sin despacho.
- `/cuenta/pedidos`, `/cuenta/pedidos/[id]`: pedidos **pagados** del cliente (`/me/orders`), "volver a comprar" con el catálogo vigente.
- `/seguimiento`: consulta sin cuenta (número + correo). El enlace `?pedido=SED-…` rellena el número.

## Despacho, pedidos y seguimiento desde la API

El checkout y el seguimiento usan la API real (`src/lib/data/pedidos-api.ts`, `adaptador-pedidos.ts`, `src/features/checkout/acciones.ts`). Regla de oro: **los precios, el despacho y el total los calcula la API**; el frontend solo envía qué productos y cuántos, y muestra lo que responde.

| Paso             | Endpoint                               | Dónde se usa                                                                           |
| ---------------- | -------------------------------------- | -------------------------------------------------------------------------------------- |
| Reglas y comunas | `GET /shipping`                        | Selector de comuna del checkout y `/despachos`                                         |
| Cotizar          | `POST /checkout/quote`                 | Resumen del checkout (se recalcula al cambiar el carrito o la comuna)                  |
| Crear pedido     | `POST /orders` (con `Idempotency-Key`) | Botón "Pagar"; reserva el stock 30 minutos                                             |
| Pagar (pruebas)  | `POST /orders/:id/simulate-payment`    | `/checkout/pago-simulado`; solo existe mientras la API tenga `SIMULATED_PAYMENTS=true` |
| Confirmar        | `GET /orders/:id`                      | Después de pagar; el estado real está en `pago.estado`                                 |
| Seguimiento      | `POST /orders/track`                   | `/seguimiento` (número + correo; dirección reducida a comuna y región)                 |

- **Tokens:** el `accessToken` del pedido se guarda en una cookie `HttpOnly` (`sedyjo_pedido_<id>`) puesta desde el servidor de Next; el navegador nunca lo lee. Las llamadas con tokens se hacen siempre desde acciones del servidor.
- **Comunas:** solo se puede elegir una comuna con despacho (la región se completa sola). Las direcciones guardadas de otras comunas aparecen deshabilitadas.
- **Idempotencia:** mientras no cambien los datos de la compra, un reintento reutiliza la misma clave y no duplica el pedido.
- **Pago:** "Pagar" crea el pedido y confirma el pago en un solo paso (`pagarPedido` en `src/features/checkout/acciones.ts`, el **único punto** que se reemplazará por Webpay; ver `docs/plan-integracion-webpay.md`). Hoy la API lo confirma con su pasarela simulada y el cliente no ve avisos de demostración. Si la API apaga los pagos simulados, el checkout avisa que los pagos no están habilitados.
- **Con sesión:** el pedido queda en la cuenta del cliente (la cookie `sedyjo_token` viaja como `Authorization: Bearer`); sin sesión se crea como invitado y se consulta con el token del pedido.
- Para probar sin crear pedidos en la API real, las pruebas E2E usan una API falsa (`e2e/api-falsa.mjs`): `npm run test:e2e`.

### Qué falta

- **Webpay Plus** (integración en la API y trámites con Transbank). Antes de vender hay que apagar `SIMULATED_PAYMENTS` en la API.
- **Panel de administración:** los estados del pedido (preparando, en camino, entregado) se cambian hoy solo con la API y su clave de administrador.
- **Dominio:** la API arma los enlaces de los correos con `FRONTEND_URL` (`https://sedyjo.com` por defecto); debe coincidir con `NEXT_PUBLIC_SITE_URL`.
- Los datos del negocio (teléfono, correo, plazo y monto de despacho gratis como respaldo) están en `src/lib/config.ts`.

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
3. En _Setup Node.js App_: Node 20.9 o superior, modo Production, archivo de inicio `server.js`.
4. Reiniciar la app desde cPanel tras cada actualización.

## Pendientes

- Ayuda y quiénes somos siguen con textos pendientes del negocio. Cuenta, seguimiento y checkout funcionan en modo demostración hasta integrar el backend.
- Monto mínimo de despacho gratis: definirlo en `src/lib/config.ts` (`DESPACHO_GRATIS_DESDE`); mientras sea `null` la barra de avance del carrito no se muestra.
- Fotos reales de productos y categorías (hoy marcadores punteados) y textos entre `[corchetes]`.
- Respuestas de backend/hosting (sección 8 del documento) para cerrar el contrato de datos.
- Auditoría de diseño y plan de animaciones: `docs/auditoria-frontend.md`.
