# Lista de verificación de accesibilidad y tablet (bloque 6B)

Fecha de la revisión: 3 de noviembre de 2026. Versión de producción local, con sesión demo y un producto en el carrito.

## Cómo se revisó
- **axe-core** (reglas WCAG 2.0, 2.1 y 2.2 nivel A y AA, más buenas prácticas) sobre 20 rutas, en escritorio (1280 px) y celular (390 px).
- **Desbordes horizontales** en 14 rutas a 640, 768, 820, 900, 1013, 1024 y 1180 px.
- **Teclado** en el encabezado, el enlace "Saltar al contenido", el carrito lateral y el menú de categorías.
- **Capturas** de portada, pago, ingreso y cuenta a 768 y 1013 px.

## Resultado

| Revisión | Estado |
|---|---|
| Violaciones axe en 20 rutas × 2 anchos | Ninguna (después de corregir las de abajo) |
| Contraste de color (WCAG AA) | Sin hallazgos |
| Desbordes horizontales en 7 anchos × 14 rutas | Ninguno |
| Encabezado en tablet (640–1023 px) | Una sola fila de 72 px |
| Enlace "Saltar al contenido" | Lleva a `#contenido` |
| Carrito lateral con teclado | Abre con Enter, el foco queda dentro, Escape cierra y el foco vuelve al botón del carrito |
| Menú de categorías con teclado | Enter abre, flecha abajo entra a la lista, Escape cierra y devuelve el foco |
| Orden de tabulación del encabezado | Contacto, ayuda, logo, categorías, buscador, cuenta, carrito |

## Qué se corrigió
1. **Nombre accesible = texto visible (WCAG 2.5.3)** en el logo, el botón de cuenta ("Hola, Ana, mi cuenta" / "Ingresar, mi cuenta") y el carrito (el número de la burbuja se dibuja con CSS para que no se mezcle con el precio).
2. **Región sin nombre:** la franja superior de contacto ahora es una región con nombre.
3. **Orden de títulos:** en listados de productos (categoría, ofertas, búsqueda) el nombre del producto es `h2`, sin saltarse del `h1` al `h3`.
4. **Imagen redundante:** la foto de la tarjeta de categoría es decorativa (el nombre ya está en el enlace). El logo del encabezado también.
5. **Regiones repetidas:** el buscador del encabezado y el de la página 404 tienen nombres distintos; el aviso de demostración de la página de perfil tiene un nombre propio.
6. **Tira deslizable de banners en celular:** se puede enfocar con teclado para desplazarla.

## Pendiente o decisión del negocio
- **Lector de pantalla:** no se probó con un lector real (NVDA, VoiceOver o TalkBack). axe detecta una parte de los problemas, no todos. Conviene una pasada manual antes de publicar.
- **Animaciones siempre activas:** por decisión del negocio no se respeta la preferencia "reducir movimiento" del sistema (WCAG 2.3.3, nivel AAA). Quienes son sensibles al movimiento no tienen cómo reducirlo. Opción: un botón propio de "Reducir animaciones" en el pie de página.
- **Tira de banners en escritorio:** el contenedor deslizable es enfocable también donde no se desliza (desde 640 px). Es un punto de tabulación extra.
- **Enlaces de nombre de producto:** miden unos 18 px de alto en las tarjetas (cumplen la regla de espaciado de WCAG 2.2, pero son pequeños para el dedo). La foto de la tarjeta es un enlace más grande al mismo destino.
- **Zoom y texto grande:** no se probó al 200 % ni 400 % ni con tamaño de letra del sistema ampliado.
