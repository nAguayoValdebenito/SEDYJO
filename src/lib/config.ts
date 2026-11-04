/**
 * Datos del negocio. Mientras un valor sea `null`, las partes de la interfaz que lo usan no se
 * muestran o indican "por confirmar".
 */

/** Monto mínimo de compra (CLP) para despacho gratis. */
export const DESPACHO_GRATIS_DESDE: number | null = 49990;
/** Plazo de entrega a domicilio. */
export const PLAZO_DESPACHO = "24 a 48 horas";
/** Costo de despacho en CLP bajo el mínimo gratis. Pendiente de definir con el negocio. */
export const COSTO_DESPACHO: number | null = null;
/** Comunas atendidas. Pendiente de definir con el negocio. */
export const ZONAS_DESPACHO: string[] | null = null;

/**
 * Dirección de la API de productos de Sedyjo, sin barra final (solo se usa en el servidor).
 * Se puede cambiar con `SEDYJO_API_URL`, por ejemplo a `http://localhost:3004` en desarrollo.
 */
export const URL_API = (process.env.SEDYJO_API_URL ?? "https://api.sedyjo.com").replace(/\/$/, "");

/** Celular de contacto (formato internacional para enlaces `tel:` y visible). */
export const TELEFONO_CONTACTO = "+56966423803";
export const TELEFONO_CONTACTO_VISIBLE = "+56 9 6642 3803";
/** Correo de contacto (por confirmar con el negocio). */
export const CORREO_CONTACTO = "contacto@sedyjo.com";

/**
 * Dirección pública de la tienda, sin barra final. Se puede cambiar con la variable de entorno
 * `NEXT_PUBLIC_SITE_URL` al desplegar; mientras no se confirme el dominio se usa este valor.
 */
export const URL_SITIO = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sedyjo.com").replace(
  /\/$/,
  "",
);
export const NOMBRE_SITIO = "Comercial Sedyjo";
export const DESCRIPCION_SITIO =
  "Abarrotes, confitería, bebidas, aseo, higiene personal y detergentes. Compra online en Comercial Sedyjo, con despacho a domicilio en San Pedro de la Paz.";
