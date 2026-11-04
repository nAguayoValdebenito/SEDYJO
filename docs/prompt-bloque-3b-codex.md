# Prompt — Bloque 3B (checkout y pago simulado)

> Pégalo completo en Codex, con el repositorio `C:\Users\Administrator\Desktop\Sedyjo` abierto.

---

Trabaja en el frontend de **Comercial Sedyjo** (supermercado de San Pedro de la Paz; Next.js 16.4, TypeScript, Tailwind v4). Ejecuta el **bloque 3B (punto 3.3)** de `docs/prompt-feedback-ronda-3.md`: proceso de compra y pago, **solo frontend con datos simulados**.

## Antes de empezar (obligatorio)
1. Lee `CLAUDE.md`, `AGENTS.md` y las skills del proyecto en `.claude/skills/` (`sedyjo-frontend`, `sedyjo-nueva-seccion`).
2. Next.js 16 difiere de versiones anteriores: lee la guía en `node_modules/next/dist/docs/` (Cache Components: `params`/`searchParams`/`usePathname`/`useSearchParams` van dentro de `<Suspense>`, o el build falla).
3. Mira cómo está resuelto el bloque 3A para copiar sus patrones: `src/features/auth/` (formularios, store de sesión), `src/features/pedidos/` (acciones simuladas, componentes), `src/components/ui/CampoTexto.tsx`, `ResumenErrores.tsx`, `TarjetaFormulario.tsx`, `src/features/carrito/` (store, `PanelCarrito`, `ResumenCarrito`), `src/lib/validation/auth.ts`, `src/lib/utils/pedidos.ts`.

## Reglas fijas
- **No hagas commits, push ni nada en GitHub.** No pidas ni muestres datos reales de tarjeta; nada de credenciales ni pagos reales.
- No hay backend: todo lo que dependa de él va en **Server Actions simuladas** (`"use server"`, con pausa artificial ~500 ms) con **tipos + esquemas Zod como contrato**, de modo que el backend futuro solo reemplace el interior de las funciones. Valida en cliente y otra vez en la acción.
- Arquitectura por funcionalidades: crea `src/features/checkout/` (`acciones.ts`, `store.ts` si hace falta, `components/`). `components/ui` sin lógica de negocio. Colores solo con tokens de `src/styles/tokens.css` (dorado/morado solo sobre fondo negro; rojo solo descuentos; `--color-error` para errores de formulario).
- Accesibilidad: etiquetas visibles, `aria-invalid`/`aria-describedby`, resumen de errores con `role="alert"` que recibe el foco, anuncios `role="status"`, objetivos de 44 px, un solo `h1` por página, foco gestionado al cambiar de paso. Respeta `prefers-reduced-motion` (usa `motion-safe:`/`motion-reduce:`).
- Responsive en 375, 640, 768, 820, 1013, 1024, 1180 y 1440 px, sin desborde horizontal.
- Prettier: `npx prettier --write src`.

## Qué construir

### 1. Contratos y configuración
- `src/lib/config.ts`: agrega pendientes en `null` (igual que `DESPACHO_GRATIS_DESDE`): `COSTO_DESPACHO: number | null` y `ZONAS_DESPACHO: string[] | null` (comunas atendidas). Mientras sean `null`, la interfaz muestra "Se confirma al pagar / por definir" en vez de inventar cifras. No inventes montos.
- `src/types/index.ts` ya tiene `Pedido`, `ItemPedido`, `Direccion`, `MetodoEntrega`, `EstadoPedido`. Agrega lo que falte: `MetodoPago` (`"webpay" | "mercadopago"`, texto "(simulado)"), `DatosCheckout` (contacto + entrega + método de pago) y `ResultadoPago` (`{ok:true, pedido}` | `{ok:false, motivo}`).
- `src/lib/validation/checkout.ts` (Zod): contacto (nombre ≥2, correo válido, teléfono chileno razonable, p. ej. `+56 9 XXXX XXXX` o 9 dígitos), entrega (`despacho` exige calle, número, comuna, región; referencia opcional; `retiro` no exige dirección), método de pago. Exporta también un helper de errores por campo (reutiliza `erroresPorCampo` de `validation/auth.ts`).
- `src/lib/utils/checkout.ts` (lógica pura): pasos (`["datos","pago","confirmacion"]`), siguiente/anterior paso, validación de si se puede avanzar, `calcularTotales(subtotal, metodoEntrega)` usando `COSTO_DESPACHO`/`DESPACHO_GRATIS_DESDE` (si son `null`, despacho = `null`/"por confirmar" sin romper los números). **Agrega pruebas Vitest** (`*.test.ts`) de pasos, totales y esquemas (válido/ inválido).

### 2. Acciones simuladas (`src/features/checkout/acciones.ts`)
- `iniciarPago(datos, items)`: revalida con Zod, **recalcula precios y stock desde `getProducts()`** (nunca confía en los precios del navegador), rechaza si algún producto está agotado, y devuelve un `token` simulado + el resumen validado.
- `confirmarPagoSimulado(token, resultado: "exito" | "error")`: en éxito crea un `Pedido` (estado `recibido`, `eventos` con el primer hito, número tipo `SED-1xxxx`, `usuarioId` si hay sesión) y lo devuelve; en error devuelve un motivo (`"rechazado"`, `"cancelado"`, `"tiempo-agotado"`). Persistencia simulada sin base de datos (no es necesario guardarlo en servidor; el cliente puede guardarlo para mostrarlo en éxito y, si hay sesión, no hace falta que aparezca en `/cuenta/pedidos`, pero si es simple de hacer sin backend, hazlo y documenta la limitación).
- Correo especial para probar el error: p. ej. `error@sedyjo.cl` siempre termina en error de pago; documenta las cuentas/atajos de prueba.

### 3. Pantallas (`src/app/checkout/`)
- `/checkout` (reemplaza el "próximamente"), en **3 pasos con indicador de progreso** accesible (`<ol>`, `aria-current="step"`, texto de paso "Paso 2 de 3"):
  1. **Datos de contacto y despacho/retiro**: formulario con selección despacho a domicilio / retiro en tienda (radios accesibles), dirección solo si es despacho, mostrar `ZONAS_DESPACHO` si existe. Si hay sesión simulada, precarga nombre y correo.
  2. **Resumen y método de pago**: revisa datos, elige Webpay Plus o Mercado Pago (radios con texto "(simulado)") y un aviso visible de "modo demostración: no se piden datos de tarjeta". El botón "Pagar" **redirige a una pantalla simulada de pasarela** (por ejemplo `/checkout/pago-simulado`) con dos botones: "Simular pago exitoso" y "Simular pago rechazado" (+ "Volver y cancelar"). **No hay campos de tarjeta en ningún lado.**
  3. **Confirmación**: la que se ve tras el éxito (puede ser `/checkout/exito`, ver abajo); el indicador de progreso marca los 3 pasos como completos.
- **Resumen del pedido siempre visible**: a un lado (sticky) en escritorio ≥1024 px; **plegable** (`<details>` o botón con `aria-expanded`) arriba en celular/tablet, mostrando el total incluso plegado.
- `/checkout/exito`: confirmación con número de pedido, resumen, método de entrega, enlace a `/cuenta/pedidos/[id]` (si hay sesión) y a `/seguimiento?pedido=SED-…`, y botón "Seguir comprando". **El carrito se vacía SOLO aquí** (y solo una vez; protege contra recargar la página).
- `/checkout/error`: explica el motivo en lenguaje claro, **el carrito queda intacto**, botones "Reintentar el pago" (vuelve al paso 2 con los datos conservados) y "Volver al carrito".
- Protecciones: si el carrito está vacío, `/checkout` muestra mensaje y enlace a seguir comprando (no un formulario vacío); `/checkout/exito` sin datos de un pago válido redirige o muestra "no hay un pedido reciente".
- Estados: esqueleto mientras hidrata el carrito (`useHidratado`), botón con `aria-busy` y spinner mientras se procesa, error del servidor con mensaje y reintento.
- Estado entre pasos y rutas: usa un store Zustand **sin contraseñas ni datos de tarjeta** (puede ir en `sessionStorage`) para conservar los datos del formulario al reintentar; límpialo en éxito.
- Enlace "Ir a pagar" del carrito y del `PanelCarrito` ya apuntan a `/checkout`; verifica que sigan funcionando.
- Metadatos de página (`metadata.title`) en cada ruta y `Suspense` donde se usen hooks de URL.

## Criterios de aceptación
Se puede recorrer el checkout completo hasta **éxito** (carrito vacío, pedido con número) y hasta **error** (carrito intacto, se puede reintentar); funciona con teclado y lector de pantalla; sin desbordes en los anchos indicados; movimiento reducido respetado; costos/zonas de despacho en `lib/config.ts` como `null` y la UI no inventa valores; pruebas Vitest para pasos, totales y esquemas.

## Verificación (corre todo y arregla lo que falle)
```bash
npx next typegen
npx prettier --write src
npx tsc --noEmit && npx eslint && npm test && npm run build
```
Luego levanta `npm start -- -p 3100` y prueba en el navegador: flujo éxito, flujo error + reintento, carrito vacío, validaciones, 375/768/1024/1440 px, teclado y movimiento reducido. Detén el servidor al terminar y borra `.playwright-mcp` y `.next/dev` si los creaste.

## Cierre
- Agrega a `README.md` una sección corta "Checkout (modo demostración)" con las rutas, el atajo de prueba de error y lo pendiente (`COSTO_DESPACHO`, `ZONAS_DESPACHO`, `DESPACHO_GRATIS_DESDE`, pasarela real).
- Entrega un reporte corto: qué cambió, qué verificaste (anchos, flujos) y qué queda pendiente. **Sin commits.**
