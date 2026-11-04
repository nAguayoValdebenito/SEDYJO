/**
 * Contratos de datos del frontend.
 * Son la base del acuerdo con el backend: se ajustan con la respuesta
 * a los puntos 11 y 14 del documento de decisiones.
 */

export type Categoria = {
  id: string;
  slug: string;
  nombre: string;
  /** Color de fondo de la tarjeta de categoría. */
  fondo: string;
  /** Imagen pre-optimizada (WebP). Si falta, se muestra un marcador. */
  imagen: string | null;
  /** Descripción de la foto sugerida mientras no exista la imagen. */
  sugerenciaFoto: string;
};

export type Producto = {
  id: string;
  slug: string;
  nombre: string;
  descripcionCorta: string;
  categoriaSlug: string;
  /** Etiqueta corta que se muestra sobre la foto (ej. "Abarrotes"). */
  etiqueta: string;
  /** Precio vigente en pesos chilenos (CLP, sin decimales). */
  precio: number;
  /** Precio antes del descuento, si corresponde. */
  precioAnterior: number | null;
  /** Presentación (ej. "400 g", "3 L"). */
  unidad: string;
  /** Precio por unidad de referencia, ya calculado (ej. "$3.475 / kg"). */
  precioPorUnidad: string;
  stock: number;
  imagenes: string[];
  marca: string | null;
  /** Color de fondo tras la foto, según tipo de producto u oferta. */
  fondo: string;
  /** Secciones del home donde aparece el producto. */
  colecciones: Coleccion[];
  /** Texto de oferta que reemplaza al precio en tarjetas oscuras (ej. "2x $5.990"). */
  promo: string | null;
};

export type Coleccion = "semana" | "exclusivo-online";

export type Banner = {
  id: string;
  /** Texto pequeño sobre el título; vacío si no hay. */
  etiqueta: string;
  titulo: string;
  texto: string;
  /** `null` si el banner no tiene enlace o texto de botón. */
  boton: { texto: string; href: string } | null;
  imagen: string | null;
  alt: string;
};

/** Banner secundario de fondo negro con dorado y morado neón. */
export type BannerOscuro = {
  id: string;
  titular: string;
  detalle: string;
  imagen: string;
  alt: string;
  colorTitular: "dorado" | "morado";
  /** Ruta de la tienda o URL externa; `null` si el banner no enlaza a nada. */
  href: string | null;
  /** Texto del enlace (ej. "Comprar"). */
  cta: string | null;
};

export type ItemCarrito = {
  productoId: string;
  slug: string;
  nombre: string;
  precio: number;
  imagen: string | null;
  fondo: string;
  cantidad: number;
};

/** Cliente con sesión iniciada. Hoy es simulado; el contrato real lo define el backend. */
export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
};

/** Una diapositiva del modal de ofertas especiales. */
export type SlideCampana = {
  id: string;
  imagen: string | null;
  titulo: string;
  texto: string;
  boton: { texto: string; href: string } | null;
};

/**
 * Campaña del modal de ofertas especiales. Hoy viene de datos simulados; cuando exista el
 * panel de administración, el administrador la activa y la configura desde allí.
 */
export type CampanaModal = {
  id: string;
  /** El administrador la enciende o la apaga. */
  activo: boolean;
  /** `simple` muestra solo la primera diapositiva; `galeria` las muestra todas en carrusel. */
  tipo: "simple" | "galeria";
  /** Fecha límite (ISO 8601). Pasada esa fecha el modal deja de mostrarse. `null` = sin límite. */
  vigenciaHasta: string | null;
  /** Horas que deben pasar, tras cerrarlo, para volver a mostrarlo al mismo cliente. */
  frecuenciaHoras: number;
  /** Segundos de espera tras cargar la página antes de mostrarlo. */
  retrasoSegundos: number;
  slides: SlideCampana[];
};

/** Pasos por los que avanza un pedido (solo se despacha a domicilio). */
export type EstadoPedido = "recibido" | "preparando" | "en-camino" | "entregado" | "cancelado";

export type MetodoEntrega = "despacho";
/** Solo se paga con Webpay Plus (Transbank). */
export type MetodoPago = "webpay";

/** Datos del formulario de compra. No contiene tarjetas ni contraseñas. */
export type DatosCheckout = {
  nombre: string;
  correo: string;
  telefono: string;
  metodoEntrega: MetodoEntrega;
  calle: string;
  numero: string;
  comuna: string;
  region: string;
  referencia: string;
  metodoPago: MetodoPago;
  usuarioId: string | null;
};

export type Direccion = {
  calle: string;
  numero: string;
  comuna: string;
  region: string;
  referencia: string | null;
};

/** Producto tal como se compró: precio y datos congelados al momento de la compra. */
export type ItemPedido = {
  productoId: string;
  slug: string;
  nombre: string;
  /** Precio unitario pagado (CLP). */
  precio: number;
  cantidad: number;
  imagen: string | null;
  fondo: string;
};

/** Un hito del pedido o del envío (por ejemplo "Salió a reparto"). */
export type EventoEnvio = {
  estado: EstadoPedido;
  /** Fecha y hora (ISO 8601). */
  fecha: string;
  detalle: string;
};

/**
 * Pedido del cliente. Es el contrato que el backend deberá entregar; hoy sale de datos simulados.
 */
export type Pedido = {
  id: string;
  /** Número visible para el cliente (ej. SED-10482). */
  numero: string;
  usuarioId: string;
  correo: string;
  fecha: string;
  estado: EstadoPedido;
  metodoEntrega: MetodoEntrega;
  /** `null` cuando se retira en tienda. */
  direccion: Direccion | null;
  items: ItemPedido[];
  subtotal: number;
  /** `null` cuando el costo de despacho sigue pendiente. */
  despacho: number | null;
  /** `null` hasta confirmar el costo de despacho. */
  total: number | null;
  metodoPago: string;
  eventos: EventoEnvio[];
};

export type ResultadoPago =
  | { ok: true; pedido: Pedido }
  | { ok: false; motivo: "rechazado" | "cancelado" | "tiempo-agotado" | "invalido" };

/** Resultado de las operaciones de cuenta. El backend real devolverá esta misma forma. */
export type ResultadoAuth =
  | { ok: true; usuario: Usuario }
  | {
      ok: false;
      error: {
        codigo: "credenciales" | "validacion" | "servidor";
        mensaje: string;
        /** Errores por campo (clave = nombre del campo). */
        campos?: Record<string, string>;
      };
    };

/** Dirección guardada en la libreta de la cuenta del cliente. */
export type DireccionGuardada = Direccion & {
  id: string;
  /** Nombre corto para reconocerla (por ejemplo "Casa" o "Trabajo"). */
  etiqueta: string;
  /** La que el checkout propone primero. Solo una por cliente. */
  principal: boolean;
};

/** Resultado de una operación de cuenta simulada. El backend real devolverá esta misma forma. */
export type ResultadoOperacion<T> =
  | { ok: true; datos: T }
  | {
      ok: false;
      error: {
        codigo: "credenciales" | "validacion" | "servidor";
        mensaje: string;
        /** Errores por campo (clave = nombre del campo). */
        campos?: Record<string, string>;
      };
    };
