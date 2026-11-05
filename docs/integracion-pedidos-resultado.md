# Integración de despacho, pedidos y seguimiento — resultado

Resultado de integrar el frontend con las APIs descritas en `INTEGRACION-PEDIDOS.md`.
Fecha: 4 de noviembre de 2026.

> **Actualización (misma fecha):** con las guías nuevas de la API también se integraron la sesión real, el registro, la recuperación de contraseña (incluida la página `/recuperar/nueva`), el perfil, la contraseña, las direcciones, el historial de pedidos, las ofertas y el slug estable, y el pago pasó a un solo paso sin pantalla de demostración. Lo que sigue pendiente (Webpay, panel de administración y dominio) está en la sección "Qué falta" del `README.md`. La tabla "Lo que falta" de más abajo es la de la primera entrega.

## Resumen

Se integraron la cotización, la creación de pedidos, el pago simulado, la consulta del pedido y el seguimiento público con la API real (`https://api.sedyjo.com/api/v1`).

**Regla de oro:** los precios, el despacho y el total los calcula la API. El frontend solo envía qué productos y cuántos, y muestra lo que responde.

**Verificación:** pasan `tsc`, `eslint`, 101 pruebas unitarias, `npm run build` y 23 pruebas E2E. Los cambios no tienen commit.

## Qué se probó y qué no

- **Contra la API real, solo lecturas:**
  - **Cotización:** en el navegador, con Hualpén, dio despacho $2.990 y total $8.770 para 2 unidades de arroz.
  - **Comunas:** `/shipping` devuelve las 7 comunas con su costo.
- **Contra una API falsa, el resto:** la creación de pedidos, el pago simulado y el seguimiento se probaron contra una API falsa (`e2e/api-falsa.mjs`), porque el sistema bloqueó mi intento de crear un pedido de prueba en `api.sedyjo.com`.
  - Las pruebas E2E usan esa API falsa, así que no crean pedidos ni gastan stock en la real.
  - El adaptador acepta el pedido con o sin el envoltorio `data`, porque el markdown dice que hay que revisarlo en una respuesta real.
- **Pendiente de confirmar:** la creación real de un pedido y el formato exacto de su respuesta. Conviene hacer una prueba contra la API real con autorización.

## Qué se integró

| Paso             | Endpoint                             | Dónde se usa                                                                           |
| ---------------- | ------------------------------------ | -------------------------------------------------------------------------------------- |
| Reglas y comunas | `GET /shipping`                      | Selector de comuna del checkout y página `/despachos`                                  |
| Cotizar          | `POST /checkout/quote`               | Resumen del checkout; se recalcula al cambiar el carrito o la comuna                   |
| Crear pedido     | `POST /orders` con `Idempotency-Key` | Botón "Pagar"; la API reserva el stock por 30 minutos                                  |
| Pagar (pruebas)  | `POST /orders/:id/simulate-payment`  | `/checkout/pago-simulado`; solo existe mientras la API tenga `SIMULATED_PAYMENTS=true` |
| Confirmar        | `GET /orders/:id`                    | Después de pagar; el estado real está en `pago.estado`                                 |
| Seguimiento      | `POST /orders/track`                 | `/seguimiento`; número y correo                                                        |

### Comportamiento

- **Comunas:** solo se puede elegir una comuna con despacho. La región se completa sola. Las direcciones guardadas de comunas sin despacho aparecen deshabilitadas.
- **Resumen del checkout:** muestra los precios vigentes, el despacho, el total y "te faltan $X para despacho gratis". Avisa si falta stock o si no hay cobertura.
- **Idempotencia:** mientras no cambien los datos de la compra, un reintento reutiliza la misma clave y no duplica el pedido.
- **Tokens:** el `accessToken` del pedido se guarda en una cookie `HttpOnly` (`sedyjo_pedido_<id>`) puesta desde el servidor de Next. El navegador nunca la lee. Las llamadas con tokens se hacen siempre desde acciones del servidor.
- **Pago:** sigue siendo una simulación. Si la API apaga los pagos simulados, el checkout avisa que los pagos no están habilitados.
- **Pantalla de éxito:** ahora dice que el pago fue una simulación y que no se realizó ningún cobro.
- **Seguimiento:** la API devuelve la dirección reducida a comuna y región. Si el número o el correo no coinciden, la respuesta es siempre la misma.
- **Pedidos de invitados:** se crean sin cuenta. Cuando exista el inicio de sesión real, el token de sesión (cookie `sedyjo_token`) se enviará como `Authorization: Bearer` y el pedido quedará en la cuenta.

### Cambios en el código

- **Eliminado:** el cálculo de totales en el cliente (`calcularTotales`) y las constantes `COSTO_DESPACHO` y `ZONAS_DESPACHO`.
- **Seguimiento:** se quitó el aviso "Prueba con SED-10482", porque ese pedido de ejemplo ya no existe en la API real. También se cambió el texto "el número que te enviamos", porque todavía no sale ningún correo.
- **Archivos nuevos principales:**
  - `src/lib/data/pedidos-api.ts`: llamadas a la API.
  - `src/lib/data/adaptador-pedidos.ts`: traduce las respuestas a los tipos del frontend, con pruebas.
  - `src/components/ui/CampoSelect.tsx`: lista desplegable de comunas.
  - `e2e/api-falsa.mjs`: API falsa para las pruebas.

## Lo que falta

Casi todo depende de que se entregue el `README.md` de la API, que el markdown cita como "el contrato completo".

| #   | Pendiente                | Estado                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Sesión real y cuenta** | Los endpoints existen: `/auth/register`, `/auth/login`, `/auth/password/forgot`, `/auth/logout`, `/auth/me`, `/me`, `/me/orders` y `/me/addresses`. Se comprobó con peticiones vacías. Falta saber qué responden al tener éxito, el nombre del token y su caducidad. Con eso se integran el inicio de sesión, el registro, la recuperación de contraseña, el perfil, las direcciones y el historial. |
| 2   | **Pedidos con sesión**   | El código ya envía el token si existe la cookie `sedyjo_token`, pero nadie la crea hasta integrar el inicio de sesión. Por eso los pedidos se crean como invitado y "Mis pedidos" sigue con datos de ejemplo.                                                                                                                                                                                        |
| 3   | **Webpay Plus**          | No está integrado en la API. Cuando lo esté, el frontend solo tendrá que redirigir a Webpay y consultar el pedido. Plan en `docs/plan-integracion-webpay.md`.                                                                                                                                                                                                                                        |
| 4   | **Correos**              | La confirmación de pedido y la recuperación de contraseña no salen hasta configurar el SMTP del dominio.                                                                                                                                                                                                                                                                                             |
| 5   | **Ofertas y destacados** | La API no los entrega todavía; siguen con las reglas provisorias.                                                                                                                                                                                                                                                                                                                                    |

## Detalle para quien mantiene la API

El paso 4 del checklist pide cotizar con una comuna de la lista. La API acepta el nombre con o sin tilde, pero con tilde solo si el JSON viaja en UTF-8. Las primeras pruebas fallaron porque la consola enviaba otra codificación, no por un error de la API. Desde el frontend no es un problema, porque Node envía UTF-8.

## Cómo probar

```bash
npm run test:e2e          # compila y corre las 23 pruebas con la API falsa
npm run test:e2e:rapido   # igual, sin compilar de nuevo
```

Para probar a mano contra la API real: `npm run build`, `npm start` y el checkout. Ojo: el botón "Pagar" crea un pedido real en la API.

## Archivos sin versionar

Hay archivos que no son de esta tarea: `docs/analisis-integraciones-api-pendientes.md`, `docs/plan-integracion-webpay.md` y la imagen `2b397365-…png`.
