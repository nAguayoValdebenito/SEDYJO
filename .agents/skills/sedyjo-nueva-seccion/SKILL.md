---
name: sedyjo-nueva-seccion
description: Receta paso a paso para agregar una pantalla o sección nueva al frontend de Comercial Sedyjo (ruta, feature, datos simulados, componentes y verificación). Úsala al crear páginas como ficha de producto, buscador, checkout, cuenta u ofertas.
---

# Agregar una pantalla o sección a Sedyjo

Lee primero la skill `sedyjo-frontend` (convenciones, paleta, reglas de datos).

## Pasos

1. **Contrato de datos.** Si la pantalla necesita datos nuevos: tipo en `src/types/`, esquema en `src/lib/validation/schemas.ts` y JSON en `src/lib/data/mock/`.
2. **Función de datos.** Créala en `src/lib/data/` con `"use cache"` + `cacheLife(...)` y expórtala desde `src/lib/data/index.ts`. Nunca leas el JSON desde la pantalla.
3. **Feature.** Componentes en `src/features/<funcionalidad>/components/`. Lógica de estado o hooks dentro de la misma feature. Si aparece lógica de negocio, que no suba a `components/ui`.
4. **Ruta delgada.** `src/app/<ruta>/page.tsx` solo pide datos y arma componentes. Si usa `params`/`searchParams`, léelos dentro de un componente envuelto en `<Suspense>`; para rutas dinámicas define `generateStaticParams` y `generateMetadata`.
5. **Estrategia de renderizado** (según el plan): inicio/categoría/producto → estática con caché; carrito → cliente; checkout y pago → dinámica en servidor; registro/ingreso/cuenta → dinámica.
6. **Estilos.** Tokens de `tokens.css`, Tailwind mobile first, íconos Lucide, foto con `FotoOMarcador` si aún no existe la imagen. Textos pendientes entre `[corchetes]`.
7. **Pruebas.** Lógica pura (formato, carrito, validación) con Vitest junto al archivo (`*.test.ts`).
8. **Verificar:** `npx tsc --noEmit && npx eslint && npm test && npm run build`, y revisar en navegador a 1440 px y 375 px.

## Cuidados

- Formularios: validar con Zod; los endpoints de pago, registro y correo usan Route Handlers o Server Actions y nunca exponen llaves al cliente.
- Si hay enlaces a rutas inexistentes, anótalas en la sección "Pendientes" del `README.md`.
- No hacer commits ni tocar GitHub salvo orden expresa del usuario.
