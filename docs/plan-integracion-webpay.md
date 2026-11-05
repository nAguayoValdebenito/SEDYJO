# Plan de integración de Transbank Webpay Plus — Comercial Sedyjo

Investigación y plan de implementación. Fecha: 4 de noviembre de 2026.

> **Estado:** documento de planificación. No se cambió código. Hoy el pago es una **simulación** (`src/features/checkout/acciones.ts`, `PagoSimulado.tsx`).
> **Alcance de lo verificado:** lo que dice "documentación de Transbank" viene de transbankdevelopers.cl (ver [Fuentes](#fuentes)). Lo que no pude confirmar está marcado como **⚠ por confirmar** y listado al final.

---

## 1. Resumen y recomendación

**Qué hay que hacer, en una frase:** el servidor (nunca el navegador) crea la transacción en Transbank, el cliente paga en el formulario de Webpay, y al volver el servidor **confirma** el pago (`commit`) y recién entonces marca el pedido como pagado.

**Recomendación (la forma más óptima para este proyecto):**

| Decisión                                     | Recomendación                                                                                                                           | Por qué                                                                                                                                                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dónde corre Transbank**                    | En el **backend** (la API Fastify de `api.sedyjo.com`), no en Next.js                                                                   | El backend es dueño de pedidos, stock y base de datos. La llave secreta vive solo allí, y el estado del pedido (pendiente → pagado) y la reconciliación necesitan persistencia. El frontend de cPanel no es el lugar para eso. |
| **Cómo hablar con Transbank**                | SDK oficial **`transbank-sdk`** (v6.1.1, Node ≥ 18, licencia BSD-3)                                                                     | Oficial y mantenido; evita errores de cabeceras y rutas (API v1.2). Son solo 3 llamadas: `create`, `commit`, `status` (+ `refund`).                                                                                            |
| **A dónde vuelve el cliente** (`return_url`) | Una ruta del **frontend** (`/checkout/retorno`) que llama al backend de servidor a servidor y luego redirige a la página de resultado   | El cliente vuelve al dominio de la tienda (confianza), no hay CORS ni redirecciones entre dominios, y la llave nunca pasa por el frontend.                                                                                     |
| **Producto**                                 | **Webpay Plus** (pago único, crédito/débito/prepago) con captura **simultánea**                                                         | Es lo que ya decidió el negocio ("solo Webpay Plus"). La captura diferida no aporta a un supermercado.                                                                                                                         |
| **Camino al piloto**                         | Empezar ya con el **ambiente de integración** (credenciales públicas de prueba) mientras se tramita el código de comercio de producción | Los trámites con Transbank y el desarrollo corren **en paralelo**; Transbank no valida integraciones que solo usen códigos de prueba.                                                                                          |

**Bloqueante de negocio:** hoy el costo de despacho es `null` ("por confirmar") y el total puede quedar sin definir. **Webpay necesita un monto final y exacto antes de crear la transacción.** Hay que definir el costo y las zonas de despacho (o decidir cobrar solo los productos y el despacho aparte) antes de integrar.

---

## 2. Cómo funciona Webpay Plus

### 2.1 Flujo completo

```
Cliente        Frontend (Next.js)        Backend (API Sedyjo)           Transbank
  │ "Pagar"          │                           │                          │
  │ ───────────────► │  POST /orders  (carrito + datos)                     │
  │                  │ ────────────────────────► │ valida precios y stock   │
  │                  │                           │ crea pedido PENDIENTE    │
  │                  │                           │ create(buy_order,        │
  │                  │                           │   session_id, amount,    │
  │                  │                           │   return_url) ─────────► │
  │                  │ ◄──────── { token, url } ◄┤ ◄──── { token, url } ────┤
  │ ◄─ formulario POST auto-enviado a `url` con `token_ws` ─────────────────►│
  │ paga en Webpay (banco, 3DS) ◄────────────────────────────────────────── │
  │ ◄──────────── redirección a return_url (token_ws / TBK_*) ──────────────┤
  │ ───────────────► │ /checkout/retorno         │                          │
  │                  │ POST /payments/webpay/return {parámetros recibidos}  │
  │                  │ ────────────────────────► │ commit(token_ws) ──────► │
  │                  │                           │ ◄── status, response_code│
  │                  │                           │ compara monto/orden,     │
  │                  │                           │ marca PAGADO y baja stock│
  │ ◄─ redirección a /checkout/exito o /checkout/error ◄─ resultado ────────┤
```

### 2.2 Las llamadas a la API REST (v1.2)

| Operación             | Método y ruta                                            | Notas (documentación de Transbank)                                                                                                                           |
| --------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Crear**             | `POST /rswebpaytransaction/api/webpay/v1.2/transactions` | Body: `buy_order` (máx. 26, único), `session_id` (máx. 61), `amount`, `return_url` (máx. 256). Responde `token` y `url`. El token **vence a los 5 minutos**. |
| **Confirmar**         | `PUT .../transactions/{token}`                           | Se llama al volver el cliente. Aprobado **solo si** `response_code == 0` **y** `status == "AUTHORIZED"`.                                                     |
| **Estado**            | `GET .../transactions/{token}`                           | Disponible hasta **7 días** después de crear. Sirve para reconciliar.                                                                                        |
| **Anular / reversar** | `POST .../transactions/{token}/refunds`                  | Body: `amount`. Ver [sección 7](#7-anulaciones-y-devoluciones).                                                                                              |

- **Hosts:** integración `https://webpay3gint.transbank.cl`, producción `https://webpay3g.transbank.cl`. Cabeceras: `Tbk-Api-Key-Id` (código de comercio) y `Tbk-Api-Key-Secret` (llave secreta). El SDK las pone solo.
- **Llevar al cliente al formulario de pago:** un `<form method="post" action={url}>` con un campo oculto `token_ws`. La documentación **desaconseja usar un iframe**.

### 2.3 Qué recibe `return_url` según lo que pasó

| Situación                                                                    | Parámetros recibidos                                  | Qué hacer                                                                           |
| ---------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Pagó o fue rechazado                                                         | `token_ws`                                            | `commit(token_ws)` y revisar `response_code` y `status`                             |
| El cliente apretó "anular" en Webpay                                         | `TBK_TOKEN`, `TBK_ID_SESION`, `TBK_ORDEN_COMPRA`      | No se confirma. Marcar el pedido como **cancelado** (opcional: `status(TBK_TOKEN)`) |
| Se acabó el tiempo en el formulario (4 min en producción, 10 en integración) | Solo `TBK_ID_SESION` y `TBK_ORDEN_COMPRA` (sin token) | Marcar como **tiempo agotado**                                                      |
| Página de error de Webpay, "volver al sitio"                                 | `token_ws` **y** `TBK_TOKEN`, etc.                    | Tratar como cancelación                                                             |

> **Importante:** el retorno puede llegar por **GET o por POST** según el escenario y el ambiente. La ruta de retorno debe aceptar **ambos**.

Esto calza con los motivos que ya maneja el frontend (`ResultadoPago` en `src/types/index.ts`): `rechazado`, `cancelado`, `tiempo-agotado`, `invalido`.

### 2.4 Códigos de respuesta

- `response_code == 0` → aprobada. Cualquier otro valor → rechazada (el cliente vuelve a intentar).
- Nivel 1 estándar: de -1 a -5 (p. ej. -4 rechazo del emisor, -5 riesgo de fraude). Nivel 2 (activable escribiendo a Transbank): de -1 a -11.
- **No validar el campo `vci`**: Transbank puede agregar valores nuevos sin documentarlos.

---

## 3. El proceso con Transbank (trámites)

Se hace **en paralelo** al desarrollo.

| Paso | Qué es                                                                                                                 | Quién                                                  | Notas                                                                                                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **Afiliación** del comercio: formulario en `publico.transbank.cl` (se firma digitalmente) o con un ejecutivo comercial | Dueño del negocio (razón social, RUT, cuenta bancaria) | Entrega el **código de comercio de producción** por correo. ⚠ Costos (comisiones) y plazos de afiliación: no los publica la documentación; consultar a Transbank. |
| 2    | Desarrollo y pruebas en **integración**                                                                                | Desarrollo                                             | Credenciales públicas de prueba (sección 8).                                                                                                                      |
| 3    | **Cumplir los requisitos** de validación                                                                               | Desarrollo + negocio                                   | Sitio web activo, todo en **HTTPS**, página de resultado con los datos exigidos, logo 130 × 59 px (ver sección 6.4).                                              |
| 4    | **Validación**: formulario online de Transbank (para Webpay Plus con SDK/API directa)                                  | Desarrollo                                             | Transbank compara tus casos de prueba con sus registros. Si hay observaciones, se corrige y se reenvía. Requiere el **código de producción**.                     |
| 5    | Transbank envía la **llave secreta de producción** por correo                                                          | Transbank                                              | Es como una contraseña: solo en variables de entorno del backend.                                                                                                 |
| 6    | **Compra real de prueba** (la documentación menciona $50)                                                              | Negocio + desarrollo                                   | Con esto se da por operativo.                                                                                                                                     |

**Contacto:** soporte@transbank.cl (validación e integración), 600 638 6380 (teléfono fijo) o +56 2 2661 2700 (móvil). Hay comunidad en Slack para dudas técnicas.

> **Nota:** la versión SOAP de Webpay se está descontinuando; se debe usar la **API REST** (la que se plantea aquí).

---

## 4. Decisión de arquitectura

### 4.1 Opciones evaluadas

|                                     | **A. En el backend Fastify (recomendada)** | **B. En Next.js (server actions / route handlers)**                                      | **C. Servicio aparte (serverless)** |
| ----------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------- |
| Dueño de pedidos, stock y BD        | ✅ Mismo lugar                             | ❌ Habría que duplicar o llamar al backend de todos modos                                | ⚠ Tercer sistema que mantener       |
| Llave secreta                       | ✅ Solo en el servidor de la API           | ⚠ En el hosting del frontend (cPanel)                                                    | ⚠ En otro lugar más                 |
| Persistencia del estado             | ✅ SQLite/BD del backend                   | ❌ El mapa en memoria de hoy (`pendientes`) se pierde al reiniciar o con varios procesos | ✅                                  |
| Reconciliación (tareas programadas) | ✅ Natural                                 | ❌ Difícil en cPanel                                                                     | ⚠                                   |
| Esfuerzo                            | Medio                                      | Bajo al inicio, alto después                                                             | Alto                                |

**Elegimos A.** B solo sirve para un **prototipo** contra el ambiente de integración mientras el backend no está listo; si se hace, debe dejarse detrás de la misma interfaz (sección 5.3) para reemplazarlo sin tocar las pantallas, y **nunca** con credenciales de producción.

### 4.2 SDK o llamadas REST directas

- **SDK `transbank-sdk`:** oficial, y hoy en la versión 6.1.1. La clase `Transaction` tiene `buildForIntegration`, `buildForProduction`, `create`, `commit`, `status` y `refund`. **Recomendado.**
- **REST directo con `fetch`:** son solo 4 llamadas; funcionaría y ahorra una dependencia. Se pierde la actualización automática si Transbank cambia detalles. Sin ventaja real.

### 4.3 ¿Dónde recibe el retorno? (`return_url`)

- **Recomendado: ruta del frontend** `https://www.sedyjo.com/checkout/retorno`. Acepta GET y POST, llama al backend (servidor a servidor, con una llave interna) y redirige a la página de resultado.
- **Alternativa:** que `return_url` sea del backend (`https://api.sedyjo.com/api/v1/payments/webpay/return`), que confirma y redirige (303) al frontend. Funciona igual y tiene un salto menos, pero el cliente pasa por el dominio de la API.

> En Next.js 16 las rutas `route.ts` tienen reglas propias con `cacheComponents`; revisar la guía en `node_modules/next/dist/docs/` antes de escribirla (leer `request` la hace dinámica).

---

## 5. Diseño técnico

### 5.1 Backend (API Sedyjo)

**Datos nuevos (tablas):**

- `orders`: `id`, `number` (público, p. ej. `SED-10482`), `status`, datos de contacto y despacho, `subtotal`, `shipping`, `total`, `created_at`, `user_id` opcional.
- `order_items`: producto, nombre y **precio congelado**, cantidad (el pedido queda con el precio del momento de la compra).
- `payments`: `order_id`, `buy_order`, `session_id`, `token`, `amount`, `status` (`PENDING`, `AUTHORIZED`, `FAILED`, `ABORTED`, `TIMEOUT`, `REFUNDED`), `response_code`, `authorization_code`, `card_last4`, `payment_type_code`, `installments_number`, `transaction_date`, `raw_response` (JSON, **sin** datos de tarjeta completos).

**Estados del pedido:** `pending_payment` → `paid` (= "recibido" en el frontend) → `preparing` → `on_the_way` → `delivered`, más `cancelled`.

**Endpoints:**

| Endpoint                                   | Qué hace                                                                                                                                                                                                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/v1/orders`                      | Recibe carrito (solo `productoId` y cantidad) + datos de entrega. **Recalcula precios, stock y despacho en el servidor.** Crea el pedido `pending_payment` y la transacción en Transbank. Responde `{ orderNumber, token, url }`. |
| `POST /api/v1/payments/webpay/return`      | Recibe lo que llegó a `return_url` (`token_ws` o `TBK_*`). Aplica la tabla de la sección 2.3. Es **idempotente**. Responde `{ resultado, orderNumber }`. Protegido con llave interna (la usa solo el frontend de servidor).       |
| `GET /api/v1/orders/:number`               | Para la página de resultado y el seguimiento. Exige un token de consulta de un solo uso o número + correo (no exponer pedidos por número solamente).                                                                              |
| `POST /api/v1/admin/orders/:number/refund` | Anulación (ver sección 7). Requiere `X-API-Key`.                                                                                                                                                                                  |
| Tarea programada                           | Reconciliación (sección 6.3).                                                                                                                                                                                                     |

**Reglas de `create`:**

- `amount` = total **final en pesos chilenos enteros**, calculado por el servidor. Nunca viene del navegador.
- `buy_order`: **único** y de **máx. 26 caracteres** (hay un conjunto limitado de símbolos permitidos). Se sugiere el propio número de pedido (`SED-10482`). No reutilizar entre intentos: si el cliente reintenta, es un pedido/`buy_order` nuevo o se agrega un sufijo.
- `session_id`: identificador interno (máx. 61), por ejemplo el id del pedido.
- `return_url`: `https://www.sedyjo.com/checkout/retorno` (máx. 256 caracteres).
- Guardar `token` y marcar el pago como `PENDING` **antes** de responder al frontend.

**Reglas de `commit` (retorno con `token_ws`):**

1. Buscar el pago por `token`. Si ya está resuelto, **devolver el resultado guardado sin volver a llamar a Transbank** (idempotencia: el cliente puede refrescar la página o volver atrás).
2. Llamar a `commit(token)`.
3. Aprobar solo si `response_code === 0` **y** `status === "AUTHORIZED"`.
4. **Verificar que `buy_order` y `amount` de la respuesta coincidan con los guardados.** Si no coinciden, no entregar el pedido y alertar (Transbank lo exige para validar).
5. En una sola transacción de base de datos: pago `AUTHORIZED`, pedido `paid`, descontar stock.
6. Si el rechazo o el error ocurre, pedido `pending_payment` → `payment_failed` (el stock no se toca).

**Stock:** descontarlo al confirmar el pago puede dejar vender dos veces la última unidad. Opciones: **(a)** reservar al crear el pedido con vencimiento de 15 minutos (recomendado), o **(b)** descontar al pagar y manejar el faltante con anulación automática. Decidir con el negocio.

### 5.2 Frontend (Next.js)

Cambios sobre lo que ya existe:

| Hoy                                                                                       | Cambio                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/features/checkout/acciones.ts` → `iniciarPago` (mapa en memoria, token `randomUUID`) | Llama a `POST /orders` del backend. Devuelve `{ orderNumber, token, url }`. Se elimina el mapa `pendientes`.                                                                                     |
| `confirmarPagoSimulado`                                                                   | Se elimina. Lo reemplaza la ruta de retorno.                                                                                                                                                     |
| `/checkout/pago-simulado` y `PagoSimulado.tsx` (botones de demostración)                  | Pasa a ser **"Redirigiendo a Webpay…"**: página con un `<form method="post" action={url}>` y `token_ws` oculto, que se envía solo (con un botón de respaldo si el JavaScript falla). Sin iframe. |
| —                                                                                         | Nueva ruta `app/checkout/retorno/route.ts` (acepta GET y POST): reenvía los parámetros al backend y redirige (303) a `/checkout/exito?pedido=…` o `/checkout/error?motivo=…`.                    |
| `ExitoCheckout` / `ErrorCheckout`                                                         | Leen el pedido desde la API (`GET /orders/:number` con el token de consulta), **ya no del `sessionStorage`**. Muestran el comprobante propio (sección 6.4).                                      |
| Carrito                                                                                   | Se vacía **solo** cuando el resultado es aprobado (hoy ya ocurre al confirmar). En `cancelado`, `rechazado` o `tiempo-agotado` el carrito queda intacto y se ofrece reintentar.                  |
| `ResultadoPago` (tipos)                                                                   | Se mantiene; solo agregar `numeroPedido`.                                                                                                                                                        |

### 5.3 Interfaz para cambiar de implementación sin tocar pantallas

Mantener una frontera única en `src/features/checkout/acciones.ts`:

```ts
iniciarPago(datos, items) → { ok: true, orderNumber, token, urlPago } | { ok: false, mensaje, campos? }
resolverRetorno(parametros) → ResultadoPago   // lo usa la ruta /checkout/retorno
```

Así se puede probar primero con un backend simulado y después conectar el real.

### 5.4 Variables de entorno

| Variable               | Dónde                   | Valor                                                                                              |
| ---------------------- | ----------------------- | -------------------------------------------------------------------------------------------------- |
| `WEBPAY_ENV`           | Backend                 | `integration` o `production`                                                                       |
| `WEBPAY_COMMERCE_CODE` | Backend                 | Código de comercio (integración: público; producción: el que entrega Transbank)                    |
| `WEBPAY_API_KEY`       | Backend                 | Llave secreta. **Nunca** en el frontend, nunca con prefijo `NEXT_PUBLIC_`, nunca en el repositorio |
| `WEBPAY_RETURN_URL`    | Backend                 | URL de retorno del frontend (HTTPS en producción)                                                  |
| `INTERNAL_API_KEY`     | Backend y servidor Next | Llave con la que el servidor de Next llama a `/payments/webpay/return`                             |

El backend debe **negarse a arrancar** en `production` si falta alguna.

---

## 6. Casos límite, seguridad y operación

### 6.1 Seguridad

- Llave secreta solo en el backend; las pantallas nunca ven tarjetas ni llaves (el cliente teclea sus datos en el sitio de Transbank).
- El total siempre lo calcula el servidor; el navegador solo envía qué productos y cuántos.
- Verificar `buy_order` y `amount` contra lo guardado.
- Todo en HTTPS. Los logs **no** guardan datos de tarjeta (solo los últimos 4 dígitos que devuelve Transbank).
- Límite de intentos (rate limit) en `POST /orders` y en la ruta de retorno.
- Transbank recomienda escaneos de vulnerabilidades al menos cada 3 meses y auditoría externa anual.

### 6.2 Situaciones a manejar

| Situación                                                    | Qué debe pasar                                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Cliente actualiza o vuelve atrás en la página de resultado   | Idempotencia: se devuelve el mismo resultado sin volver a confirmar                               |
| Cliente cierra el navegador **después de pagar** y no vuelve | El pedido queda `pending_payment` hasta que la **reconciliación** consulta `status` (sección 6.3) |
| El token vence (5 min) o el formulario (4 min)               | El retorno llega como tiempo agotado; mensaje claro y reintento                                   |
| Doble clic en "Pagar"                                        | Un solo pedido: deshabilitar el botón y usar una llave de idempotencia por carrito                |
| Caída del backend entre `commit` y la base de datos          | La reconciliación consulta `status` y completa el pedido                                          |
| Dos pestañas con el mismo carrito                            | Cada intento es un pedido y un `buy_order` distintos                                              |

### 6.3 Reconciliación (importante)

Tarea programada cada ~5–10 minutos: para pedidos `pending_payment` con más de 10 minutos y menos de 7 días, llamar `status(token)` y resolver el pedido según el resultado. El `status` solo existe **durante 7 días** desde la creación. Los pedidos sin respuesta pasados 15 minutos se cierran como "no pagado" y se libera el stock reservado.

> ⚠ La documentación no dice qué pasa en Transbank si nunca se llama a `commit` tras el retorno (si hay reversa automática y en cuánto tiempo). Confirmarlo con soporte antes del piloto; el diseño de reconciliación lo cubre igualmente.

### 6.4 Lo que debe mostrar la página de resultado

Según los requisitos de validación de Transbank, el comprobante **propio** de la tienda (no se muestra el de Transbank) incluye:

- Número de pedido (`buy_order`) y nombre del comercio
- Monto y moneda (CLP)
- **Código de autorización**
- Fecha y hora de la transacción
- Tipo de pago (débito o crédito) y número de cuotas
- Últimos 4 dígitos de la tarjeta
- Descripción de los productos o servicios
- Si se rechaza, una explicación clara y la opción de reintentar

Además, preparar el **logo de la tienda en GIF o PNG de 130 × 59 px** (se pide en la validación).

---

## 7. Anulaciones y devoluciones

Reglas de Transbank:

- **Reversa:** dentro de las **3 horas** siguientes a la confirmación y por el **monto total**.
- **Anulación:** después de las 3 horas, hasta **90 días** desde la venta. En crédito solo total (y parcial en venta normal / cuotas emisor); en débito y prepago, total y parcial.
- Si la venta ya fue abonada, la anulación genera una retención en abonos posteriores.

**Plan:** un endpoint de administración (`refund`) que llame a `refund(token, amount)`, guarde el resultado (`REVERSED` o `NULLIFIED`) y deje trazabilidad en el pedido. Debe quedar alineado con la página `/cambios-y-devoluciones` (hoy con texto pendiente): definir qué casos se anulan y en qué plazo.

---

## 8. Pruebas

### 8.1 Ambiente de integración (datos públicos de Transbank)

- Host: `https://webpay3gint.transbank.cl`
- Código de comercio Webpay Plus: `597055555532` (captura diferida: `597055555540`)
- Llave secreta: pública, en la documentación de Transbank (la de integración es la misma para todos los códigos). Cópiala de allí; no es secreta.
- Tarjetas de prueba (cualquier fecha futura): **Visa aprobada** `4051 8856 0044 6623`, CVV `123`; **Mastercard rechazada** `5186 0595 5959 0568`, CVV `123`; **Amex aprobada** `3700 0000 0002 032`, CVV `1234`.
- Autenticación del banco: RUT `11.111.111-1`, clave `123`.

### 8.2 Casos que hay que probar (y que Transbank compara en la validación)

1. Pago aprobado (Visa) → pedido `paid`, carrito vacío, comprobante completo.
2. Pago rechazado (Mastercard) → mensaje claro, carrito intacto, pedido no pagado.
3. El cliente anula en Webpay → `TBK_TOKEN`, pedido cancelado, carrito intacto.
4. Tiempo agotado en el formulario → solo `TBK_ID_SESION`/`TBK_ORDEN_COMPRA`.
5. Retorno repetido (refrescar) → mismo resultado, sin segundo `commit`.
6. Monto o `buy_order` distinto al guardado → se rechaza y se alerta.
7. Reconciliación: pago aprobado sin retorno del cliente → el pedido pasa a `paid`.

### 8.3 Pruebas automáticas

- **Unitarias (backend):** reglas de `commit`, idempotencia, comparación de monto, mapeo de parámetros de retorno a motivo.
- **E2E del frontend (CI):** **no** usar el Webpay real. Levantar un **Webpay falso** (servidor mínimo que imita `create`/`commit` y el formulario) y probar los 4 desenlaces de la sección 2.3. Las pruebas actuales (`e2e/compra.spec.ts`) se adaptan: los botones "Simular pago exitoso/rechazado" se reemplazan por el desenlace del Webpay falso.
- **Manual con integración real:** una checklist corta antes de enviar la validación a Transbank.

---

## 9. Plan por fases

| Fase                                              | Trabajo                                                                                                                                                                                    | Esfuerzo       | Depende de                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ---------------------------------------------- |
| **0. Decisiones y trámites**                      | Definir costo y zonas de despacho; iniciar la **afiliación** en Transbank; decidir stock (reserva); confirmar quién implementa el backend; preparar logo 130 × 59 px                       | S              | Dueño del negocio                              |
| **1. Contrato**                                   | Documento `docs/contratos-backend.md` (bloque 7B) con los endpoints de la sección 5.1, tipos de pedido y pago                                                                              | S              | Fase 0                                         |
| **2. Backend**                                    | Tablas, `POST /orders`, `POST /payments/webpay/return`, `GET /orders/:number`, idempotencia, variables de entorno, pruebas unitarias                                                       | M              | Fase 1                                         |
| **3. Frontend**                                   | Frontera `iniciarPago`/`resolverRetorno`, formulario de redirección, ruta `/checkout/retorno`, páginas de éxito y error con comprobante real, adaptación de pruebas E2E (con Webpay falso) | M              | Fase 1 (puede avanzar con un backend simulado) |
| **4. Integración contra Transbank (integración)** | Pruebas de la sección 8.2 con las tarjetas de prueba                                                                                                                                       | S              | Fases 2 y 3                                    |
| **5. Reconciliación y anulaciones**               | Tarea programada y endpoint de `refund`                                                                                                                                                    | S–M            | Fase 2                                         |
| **6. Validación de Transbank**                    | Formulario online con casos de prueba y evidencia; corregir observaciones                                                                                                                  | S (más espera) | Fase 4 + código de producción                  |
| **7. Salida a producción**                        | Credenciales de producción, `WEBPAY_ENV=production`, compra real de prueba ($50), monitoreo                                                                                                | S              | Fase 6 y **orden explícita del dueño**         |

> **Importante:** no se despliega ni se publica nada sin orden explícita del dueño (regla vigente del proyecto). La integración con el **ambiente de integración** (Fases 2–5) se puede probar en local sin desplegar.

### Criterios de "terminado"

- Una compra aprobada deja el pedido `paid`, descuenta stock, vacía el carrito y muestra el comprobante con todos los campos de la sección 6.4.
- Rechazo, anulación y tiempo agotado dejan el carrito intacto y explican qué pasó.
- Refrescar la página de resultado no genera un segundo cobro ni un segundo pedido.
- La reconciliación cierra los pedidos huérfanos.
- Cero llaves en el repositorio o en el navegador; el backend no arranca en producción sin configuración completa.
- Transbank aprueba la validación.

---

## 10. Pendientes y preguntas abiertas

**Para el negocio:**

1. Costo y zonas de despacho (**bloqueante**, sin ellos no hay monto final). Alternativa: cobrar solo productos.
2. Datos para la afiliación: razón social, RUT, cuenta bancaria, y quién firma digitalmente. Costos y comisiones de Transbank (consultar al ejecutivo).
3. Dominio definitivo con HTTPS (`www.sedyjo.com` y `api.sedyjo.com`) y correo de contacto definitivo.
4. Política de devoluciones y plazos (alimenta `/cambios-y-devoluciones` y las anulaciones).
5. Stock: reservar al crear el pedido o descontar al pagar.
6. Textos legales y de privacidad reales (hoy marcados como pendientes).

**Para Transbank (⚠ no confirmado en la documentación que revisé):**

- Qué pasa si no se llama a `commit` tras el retorno (¿reversa automática? ¿en cuánto tiempo?).
- Si hay ventana máxima para llamar a `commit` después del retorno.
- Si `return_url` debe ser HTTPS en integración (en producción sí lo pide para los endpoints del comercio) y si se permite `localhost`.
- Montos mínimo y máximo por transacción.
- Costos, comisiones y plazos de afiliación y validación.
- Requisitos exactos de la evidencia de validación (capturas).
- Existencia de condiciones especiales para emprendedores o pymes.

**Técnicos:**

- Quién y dónde se implementa el backend (hoy lo hace otra persona).
- Elegir la base de datos de producción si se sale de SQLite.
- Revisar la guía de Next.js 16 sobre `route.ts` con `cacheComponents` antes de escribir la ruta de retorno.

---

## Fuentes

- [Webpay Plus (flujo, retorno, commit, status, refund)](https://www.transbankdevelopers.cl/documentacion/webpay-plus)
- [Cómo empezar y paso a producción](https://www.transbankdevelopers.cl/documentacion/como_empezar)
- [Referencia API Webpay (endpoints, campos, códigos de error)](https://www.transbankdevelopers.cl/referencia/webpay)
- [Producto Webpay (anulaciones, tipos de pago, códigos de respuesta)](https://www.transbankdevelopers.cl/producto/webpay)
- [SDK oficial de Node.js](https://github.com/TransbankDevelopers/transbank-sdk-nodejs) · paquete [`transbank-sdk`](https://www.npmjs.com/package/transbank-sdk) 6.1.1 (publicado en diciembre de 2025, Node ≥ 18)
- [Guía de actualización API 1.2](https://www.transbankdevelopers.cl/public/files/Upgrade_API_1.2_V2.pdf)
