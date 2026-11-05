# Análisis de integraciones API pendientes — Comercial Sedyjo

**Fecha de revisión:** 3 de noviembre de 2026

**Alcance:** código de la rama `feature/frontend-completo`. Se revisó el repositorio local; no se verificó la disponibilidad ni la respuesta actual de la API desplegada.

**Propósito:** separar lo que el frontend ya consume de la API de Sedyjo, lo que solo funciona en modo demostración y los contratos que faltan acordar con el backend.

## Resumen ejecutivo

El proyecto implementa la experiencia de tienda: portada, catálogo, categorías, ficha, búsqueda, carrito, cuenta, checkout, historial y seguimiento. El repositorio contiene solo el frontend. Su única conexión HTTP con la API de Sedyjo está concentrada en `src/lib/data/catalogo-api.ts` y usa operaciones `GET` para productos, categorías, banners e imágenes del sitio.

La autenticación, el perfil, las direcciones, los pedidos y el pago tienen formularios, tipos, validaciones y estados de interfaz, pero sus acciones son simuladas. Una compra de prueba no cobra, no crea un pedido persistente y no actualiza inventario. Estas integraciones son necesarias antes de operar una tienda real.

## 1. Integraciones existentes

| Fuente | Uso actual | Implementación |
| --- | --- | --- |
| `GET /api/v1/products?limit=100&page=N` | Catálogo, ficha, recomendaciones, carrito al validar checkout y sitemap. Se recorren las páginas que informa `meta.totalPages`. | `src/lib/data/catalogo-api.ts`, `src/lib/data/productos.ts` |
| `GET /api/v1/categories` | Listados y navegación por categoría. | `src/lib/data/catalogo-api.ts`, `src/lib/data/categorias.ts` |
| `GET /api/v1/banners` | Carrusel principal, banners oscuros y diapositivas del modal. | `src/lib/data/catalogo-api.ts`, `src/lib/data/banners.ts`, `src/lib/data/promociones.ts` |
| `GET /api/v1/site-images` | Imágenes configurables por clave; actualmente el encabezado utiliza `logo`. | `src/lib/data/catalogo-api.ts`, `src/lib/data/imagenes-sitio.ts`, `src/components/layout/Encabezado.tsx` |

La URL base sale de `SEDYJO_API_URL` o, por defecto, `https://api.sedyjo.com` (`src/lib/config.ts`). Las respuestas se validan con Zod y se convierten a los tipos del frontend en `src/lib/data/adaptador-api.ts`. Productos y categorías usan caché; banners e imágenes devuelven un resultado vacío si falla la llamada. Esto describe la integración en el código, no una comprobación de que esos endpoints estén funcionando hoy en producción.

No se encontraron handlers `src/app/api/**/route.ts` ni otras llamadas `fetch` de negocio fuera de `src/lib/data/catalogo-api.ts`. Las funciones con `"use server"` de `src/features/` son acciones internas de Next.js y, por ahora, ejecutan lógica de demostración.

## 2. Integraciones imprescindibles para vender

### 2.1 Identidad y sesión — prioridad crítica

**Estado actual.** `src/features/auth/acciones.ts` simula `iniciarSesion`, `registrarse` y `solicitarRecuperacion`. Salvo correos reservados para pruebas, un correo y contraseña que pasen la validación permiten entrar. No se consulta una cuenta real ni se envía recuperación. `src/features/auth/store.ts` conserva únicamente el objeto de usuario en `localStorage`; `cerrarSesion` lo elimina localmente.

**Necesidad del backend.** Registro, inicio y cierre de sesión, consulta de la sesión vigente, solicitud y confirmación de recuperación de contraseña. La identidad que autoriza pedidos y direcciones debe venir de una sesión verificable en el servidor, no de un `usuarioId` enviado por el navegador. Conviene acordar también caducidad, manejo de sesión expirada y errores de credenciales o correo duplicado.

**Operaciones sugeridas para acordar, no endpoints existentes:** `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/password/forgot` y `POST /auth/password/reset`.

### 2.2 Cotización, despacho y total definitivo — prioridad crítica

**Estado actual.** `src/lib/config.ts` fija el umbral de despacho gratis en $49.990, pero deja `COSTO_DESPACHO` y `ZONAS_DESPACHO` en `null`. `src/lib/utils/checkout.ts` calcula despacho `0` sobre el umbral; bajo ese monto deja `despacho` y `total` en `null`. La interfaz todavía permite recorrer una compra simulada con total por confirmar.

**Necesidad del backend.** Validar cobertura de la dirección o comuna, calcular costo, plazo y total definitivo antes de iniciar el pago. La cotización debe volver a comprobar productos, cantidades, precio y stock actuales. Hay que definir con el negocio tarifas, zonas, excepciones, monto mínimo para despacho gratis y qué ocurre cuando una dirección queda fuera de cobertura.

**Operaciones sugeridas:** `POST /checkout/quote` o `POST /shipping/quote`, y una fuente administrable para zonas y reglas de despacho. La respuesta debería incluir `items` con precios vigentes, `subtotal`, `despacho`, `total`, disponibilidad y vencimiento de la cotización.

### 2.3 Creación y persistencia de pedidos — prioridad crítica

**Estado actual.** `src/features/checkout/acciones.ts` vuelve a leer el catálogo y valida cantidades, precio y stock en `iniciarPago`. Después guarda un pago pendiente en un `Map` de memoria del proceso. `confirmarPagoSimulado` crea un objeto `Pedido` con número aleatorio, pero no lo escribe en una base de datos. El último pedido queda en `sessionStorage` a través de `src/features/checkout/store.ts`. El historial lo mezcla con pedidos de ejemplo en `src/features/pedidos/usePedidos.ts`.

**Necesidad del backend.** Crear un pedido durable con identificador y número únicos; guardar datos de comprador, dirección, líneas y precios congelados, despacho, total y estado del pago. Revalidar y reservar o descontar stock según la política de inventario. Evitar pedidos duplicados si el cliente repite la petición o el proveedor de pago reintenta una notificación. La confirmación de compra debe poder recuperarse después de cerrar la pestaña y en otro dispositivo.

**Operaciones sugeridas:** `POST /orders` o una operación conjunta `POST /checkout/start`, más `GET /orders/{id}` para consultar la confirmación. El backend debe decidir el momento exacto en que el pedido pasa de pendiente a confirmado.

### 2.4 Pago real con Webpay Plus — prioridad crítica

**Estado actual.** `src/features/checkout/components/Checkout.tsx` redirige a `/checkout/pago-simulado`. Allí el usuario elige manualmente éxito o rechazo; `src/features/checkout/acciones.ts` devuelve ese resultado sin contactar a Transbank. No hay cobro real.

**Necesidad del backend.** Crear la transacción por el total definitivo, entregar la URL y el token de redirección, procesar el retorno o confirmación de Webpay desde el servidor, consultar o confirmar el resultado ante Transbank y actualizar el pedido una sola vez. El frontend debe mostrar el estado obtenido del backend, incluso si el navegador se cierra durante el pago. El carrito se debe vaciar solo tras una confirmación real y verificable.

**Operaciones sugeridas:** `POST /payments/webpay/start`, `POST /payments/webpay/return` o la ruta de retorno requerida por la pasarela, y `GET /payments/{id}/status`. Los nombres y el flujo final dependen del contrato con el equipo de pagos.

## 3. Integraciones de cuenta y posventa

### 3.1 Historial y detalle de pedidos — prioridad alta

**Estado actual.** `src/lib/data/pedidos.ts` lee `src/lib/data/mock/pedidos.json` y filtra por `usuarioId`. `src/features/pedidos/acciones.ts` advierte que confía en el identificador recibido del navegador porque la sesión también es simulada. El pedido recién creado aparece únicamente desde el estado local de la pestaña.

**Necesidad del backend.** Listado paginado de pedidos del cliente autenticado y detalle por ID, con autorización calculada desde la sesión. Debe devolver precios históricos, estado de compra, método de pago, dirección y eventos de envío. El frontend ya tiene el tipo `Pedido` en `src/types/index.ts` y un esquema Zod en `src/lib/validation/schemas.ts` que sirven como punto de partida, sujetos a ajustes con el backend.

**Operaciones sugeridas:** `GET /me/orders` y `GET /me/orders/{id}`. Para “volver a comprar”, el catálogo actual puede seguir determinando precio y disponibilidad; el pedido histórico no debe usarse como fuente de precio vigente.

### 3.2 Seguimiento público y eventos de despacho — prioridad alta

**Estado actual.** `/seguimiento` solicita número y correo, pero busca en el JSON de ejemplo o en el último pedido guardado en la pestaña (`src/features/pedidos/components/BuscadorSeguimiento.tsx`). Los eventos de los pedidos de prueba son estáticos.

**Necesidad del backend.** Consulta de un pedido por número y correo, con respuesta limitada a la información apropiada para seguimiento. El equipo operativo necesita registrar cambios de estado y eventos con fecha. También deben definirse controles contra consultas masivas del seguimiento público y el comportamiento ante número o correo incorrecto.

**Operaciones sugeridas:** `POST /orders/track` para la consulta pública y operaciones administrativas para avanzar estados o registrar eventos. Si se usa `GET`, el correo no debería quedar expuesto innecesariamente en URL o registros.

### 3.3 Perfil, contraseña y direcciones — prioridad alta

**Estado actual.** `src/features/cuenta/acciones.ts` valida cambios de perfil, contraseña y dirección, pero no guarda nada en backend. `src/features/cuenta/store.ts` conserva la libreta por usuario en `localStorage`; las operaciones agregar, editar, eliminar y marcar principal se ejecutan en el navegador.

**Necesidad del backend.** Leer y actualizar perfil, cambiar contraseña después de verificar la actual y gestionar direcciones asociadas a la cuenta. El límite actual de cinco direcciones y la unicidad de la dirección principal deben quedar definidos en el contrato y aplicarse en el servidor. El checkout debe poder usar una dirección guardada de forma consistente entre dispositivos.

**Operaciones sugeridas:** `GET/PATCH /me`, `POST /me/password`, `GET/POST /me/addresses`, `PATCH/DELETE /me/addresses/{id}` y una operación para marcar la principal.

### 3.4 Comunicaciones transaccionales — prioridad alta

**Estado actual.** La pantalla de seguimiento dice que el número de pedido se envió al comprar, pero no hay integración de correo ni se genera una comunicación real (`src/features/pedidos/components/BuscadorSeguimiento.tsx`). La recuperación de contraseña también responde solo con una simulación.

**Necesidad del backend.** Enviar confirmación de pedido, comprobante o resumen, enlaces o códigos de recuperación y, si el negocio lo requiere, cambios relevantes de estado. Definir remitente, plantillas, manejo de fallos y qué mensajes son obligatorios. El envío debe dispararse a partir de estados persistidos, sin depender de que el cliente mantenga abierta la pestaña.

## 4. Mejoras del contrato de catálogo y contenido

Estas funciones ya consumen una API; lo pendiente es ampliar o ajustar el contrato para cubrir lo que muestra la interfaz.

| Necesidad | Estado en el código | Propuesta |
| --- | --- | --- |
| Ofertas reales | `precioAnterior` y `promo` quedan en `null` en `src/lib/data/adaptador-api.ts`. `/ofertas` solo muestra productos con alguno de esos campos. | Exponer precio anterior válido, promoción, vigencia y reglas aplicables; definir si el descuento se calcula o se entrega. |
| Destacados y colecciones de portada | `repartirColecciones` asigna productos a “semana” y “exclusivo online” a partir de fotos y categorías. | Exponer selección y orden administrables, o endpoints de colecciones. |
| Oferta del día | `getOfertaDelDia` elige localmente el mayor descuento, que hoy no llega desde la API. | Permitir configurar el producto y su vigencia; validar que haya stock. |
| Identificador público de producto | El slug se genera desde el nombre. Un cambio de nombre puede cambiar la URL; nombres iguales pueden compartir slug. | Exponer slug estable o usar un identificador público estable y redirecciones cuando cambie. |
| Búsqueda y escala | `searchProducts` descarga el catálogo y filtra en el servidor Next.js. | Acordar búsqueda, filtros, orden y paginación en la API cuando el volumen de productos lo justifique. |
| Frescura de stock y precio | Algunas funciones de catálogo usan caché de minutos y sus envoltorios usan caché de horas. | Definir invalidación tras cambios y confirmar siempre precio y stock en la cotización o creación del pedido. |
| Configuración del modal | `/banners` aporta las diapositivas `modal`; el frontend fija frecuencia en 24 horas y retraso en 4 segundos (`src/lib/data/adaptador-api.ts`). | Añadir activación, vigencia, frecuencia y retraso si el administrador debe controlarlos. |
| Imágenes de marca | `/site-images` se lee, pero solo `logo` se utiliza dinámicamente; favicon, Apple icon e imagen Open Graph salen de archivos del proyecto. | Integrar las otras claves solo si el negocio necesita modificarlas desde administración. |

El panel de administración mencionado en `docs/plan-desarrollo-frontend.md` es opcional y no forma parte de este frontend. Si se implementa, sus operaciones de escritura para productos, categorías, banners, imágenes y promociones deberán definirse por separado, con autenticación y permisos de administrador.

## 5. Contratos y decisiones que conviene cerrar antes de integrar

1. **Identidad:** mecanismo de sesión, recuperación, expiración y autorización de recursos del cliente. Ninguna operación de pedidos o direcciones debe confiar en un `usuarioId` proporcionado por el navegador.
2. **Dinero:** CLP enteros; fuente oficial de precio, promociones, umbral y costo de despacho; desglose que recibe el cliente antes de pagar. El backend debe rechazar cambios de precio o stock entre cotización y pago según una regla explícita.
3. **Pedido:** estados permitidos, transiciones, número único, política de reserva de stock, cancelaciones, reintentos e idempotencia.
4. **Pago:** correlación entre pedido y transacción, confirmación verificable con el proveedor, respuesta ante rechazo, abandono o retorno repetido.
5. **Despacho:** zonas atendidas, tarifas, plazos, datos mínimos de la dirección y origen de los eventos de seguimiento.
6. **Errores:** formato común para validación por campo, no autorizado, sesión expirada, sin stock, fuera de cobertura, pago rechazado y fallo temporal. Las pantallas ya distinguen varios de estos estados.
7. **Datos personales:** campos del perfil y del pedido, acceso a seguimiento público, retención y datos que se muestran en las respuestas.

Los paths propuestos en este documento son **ejemplos para acordar el contrato**, no rutas detectadas en la API existente. La implementación puede usar otros nombres o agrupar operaciones.

## 6. Orden de integración recomendado

| Fase | Entregable | Motivo |
| --- | --- | --- |
| 1 | Reglas de despacho, cotización y contrato de pedido | Permite presentar un total cobrable y congelar las reglas comerciales. |
| 2 | Autenticación y sesión real | Habilita autorización de cuenta, direcciones e historial. |
| 3 | Persistencia de pedido y Webpay Plus | Cierra la compra con estado y pago verificables. |
| 4 | Historial, seguimiento, direcciones, perfil y correos | Completa la experiencia posterior a la compra y entre dispositivos. |
| 5 | Ofertas, destacados, búsqueda y controles de contenido | Sustituye reglas provisionales y mejora la operación del catálogo. |

## Referencias principales del código

- `src/lib/data/catalogo-api.ts`: únicas llamadas HTTP detectadas a la API de Sedyjo.
- `src/lib/data/adaptador-api.ts`: contrato actual de catálogo, campos faltantes y reglas provisionales.
- `src/features/auth/acciones.ts` y `src/features/auth/store.ts`: autenticación y sesión simuladas.
- `src/features/cuenta/acciones.ts` y `src/features/cuenta/store.ts`: perfil y direcciones simulados.
- `src/features/checkout/acciones.ts` y `src/features/checkout/store.ts`: cotización parcial, pago y pedido de demostración.
- `src/lib/data/pedidos.ts` y `src/features/pedidos/acciones.ts`: historial y seguimiento basados en datos de ejemplo.
- `src/lib/config.ts`: valores de negocio y URL base de la API.
- `src/types/index.ts` y `src/lib/validation/`: tipos y esquemas disponibles para definir el contrato definitivo.

**Método de revisión:** inspección estática de rutas, capa de datos, acciones, estados, tipos, validaciones y documentación del repositorio. No se ejecutaron pruebas ni se consultó la API externa, porque el objetivo fue registrar el estado de las integraciones en el código actual.
