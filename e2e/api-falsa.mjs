// API de Sedyjo "falsa" para las pruebas E2E: node e2e/api-falsa.mjs
//
// Así las pruebas no crean pedidos, cuentas ni gastan stock en la API real:
// - Catálogo, categorías, ofertas, banners e imágenes del sitio: se piden a la API real (lectura).
// - Cuentas, sesión, direcciones, despacho, cotización, pedidos, pago simulado y seguimiento: se
//   resuelven aquí, en memoria, con el mismo formato que describe README.md de la API.
//
// Cuenta de ejemplo: demo@sedyjo.cl / Clave1234 (con dos pedidos pagados y una dirección).
// Atajos de prueba: error@sedyjo.cl responde 500 al ingresar; los pedidos con el correo
// rechazo@sedyjo.cl quedan rechazados y con sinpagos@sedyjo.cl el pago simulado no existe (404).
// El enlace de recuperación `token=token-valido` sirve; cualquier otro vence.
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const PUERTO = Number(process.env.API_FALSA_PUERTO ?? 3199);
const API_REAL = process.env.API_REAL ?? "https://api.sedyjo.com";
const GRATIS_DESDE = 49990;
const PLAZO = "24 a 48 horas";

const ZONAS = [
  ["Chiguayante", 2490],
  ["Concepción", 2490],
  ["Coronel", 3990],
  ["Hualpén", 2990],
  ["Lota", 4490],
  ["San Pedro de la Paz", 1990],
  ["Talcahuano", 3490],
].map(([comuna, costo], i) => ({ id: i + 1, region: "Biobío", comuna, costo, plazo: PLAZO }));

const LECTURAS_REALES = [
  "/api/v1/products",
  "/api/v1/categories",
  "/api/v1/banners",
  "/api/v1/site-images",
  "/api/v1/offers",
  "/api/v1/offers/daily",
];

const cacheReal = new Map();
async function pedirReal(ruta) {
  if (cacheReal.has(ruta)) return cacheReal.get(ruta);
  const respuesta = await fetch(`${API_REAL}${ruta}`);
  const resultado = { status: respuesta.status, cuerpo: await respuesta.text() };
  if (respuesta.ok) cacheReal.set(ruta, resultado);
  return resultado;
}

async function productos() {
  const { cuerpo } = await pedirReal("/api/v1/products?limit=100&page=1");
  return JSON.parse(cuerpo).data;
}

function slug(texto) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function cotizar(items, comuna) {
  const catalogo = await productos();
  const lineas = [];
  const problemas = [];
  for (const { productoId, cantidad } of items) {
    const p = catalogo.find((x) => String(x.id) === String(productoId));
    if (!p) {
      problemas.push({ productoId, codigo: "no_existe", disponible: null });
      continue;
    }
    if (cantidad > p.stock) {
      problemas.push({ productoId, codigo: "cantidad_excede", disponible: p.stock });
    }
    const precio = p.offerPrice ?? p.price;
    lineas.push({
      productoId: String(p.id),
      slug: p.slug ?? slug(p.name),
      nombre: p.name,
      precio,
      precioNormal: p.price,
      cantidad,
      subtotal: precio * cantidad,
      stock: p.stock,
      imagen: p.image,
      categoria: p.category,
    });
  }
  const subtotal = lineas.reduce((suma, l) => suma + l.subtotal, 0);
  const zona = ZONAS.find((z) => z.comuna === comuna);
  const despacho = zona ? (subtotal >= GRATIS_DESDE ? 0 : zona.costo) : null;
  return {
    items: lineas,
    subtotal,
    despacho,
    total: despacho === null ? null : subtotal + despacho,
    plazo: PLAZO,
    gratisDesde: GRATIS_DESDE,
    faltaParaGratis: Math.max(GRATIS_DESDE - subtotal, 0),
    cobertura: Boolean(zona),
    cotizable: Boolean(zona),
    valido: Boolean(zona) && problemas.length === 0,
    problemas,
  };
}

// ---- estado en memoria
const usuarios = new Map(); // correo -> { id, nombre, correo, clave, direcciones }
const sesiones = new Map(); // token -> correo
const pedidos = new Map(); // id -> { pedido, token, correo, usuarioCorreo }
const idempotencia = new Map(); // clave -> id
let contador = 20000;

usuarios.set("demo@sedyjo.cl", {
  id: "u-demo",
  nombre: "Ana Pérez",
  correo: "demo@sedyjo.cl",
  clave: "Clave1234",
  direcciones: [
    {
      id: "dir-demo-1",
      etiqueta: "Casa",
      calle: "Los Aromos",
      numero: "1234",
      comuna: "San Pedro de la Paz",
      region: "Biobío",
      referencia: "Casa con reja verde",
      principal: true,
    },
  ],
});

function evento(estado, detalle, fecha = new Date().toISOString()) {
  return { estado, fecha, detalle };
}

function pedidoDeEjemplo(id, numero, estado, dias, items, despacho) {
  const fecha = new Date(Date.now() - dias * 86_400_000).toISOString();
  const subtotal = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
  const pedido = {
    id,
    numero,
    usuarioId: "u-demo",
    correo: "demo@sedyjo.cl",
    fecha,
    estado,
    metodoEntrega: "despacho",
    direccion: {
      calle: "Los Aromos",
      numero: "1234",
      comuna: "San Pedro de la Paz",
      region: "Biobío",
      referencia: null,
    },
    items,
    subtotal,
    despacho,
    total: subtotal + despacho,
    metodoPago: "webpay",
    pago: { estado: "pagado", fecha },
    eventos: [
      evento("recibido", "Pago confirmado. Recibimos tu pedido.", fecha),
      ...(estado === "preparando" || estado === "entregado"
        ? [evento("preparando", "Estamos preparando tu pedido.", fecha)]
        : []),
      ...(estado === "entregado" ? [evento("entregado", "Pedido entregado.", fecha)] : []),
    ],
  };
  pedidos.set(id, {
    pedido,
    token: `tok-${id}`,
    correo: "demo@sedyjo.cl",
    usuarioCorreo: "demo@sedyjo.cl",
  });
}

const linea = (productoId, nombre, precio, cantidad) => ({
  productoId,
  slug: slug(nombre),
  nombre,
  precio,
  cantidad,
  imagen: null,
  categoria: "Abarrotes",
});
pedidoDeEjemplo(
  "ped-10482",
  "SED-10482",
  "preparando",
  2,
  [
    linea("35", "Arroz Premium Grado 1 Banquete 2 kg", 2890, 2),
    linea("34", "Arroz Largo Ancho Miraflores 1 kg", 1590, 3),
  ],
  1990,
);
pedidoDeEjemplo(
  "ped-10517",
  "SED-10517",
  "entregado",
  20,
  [linea("32", "Spaghetti Carozzi 400 g", 1290, 4)],
  1990,
);

// ---- utilidades HTTP
async function cuerpoJson(req) {
  const trozos = [];
  for await (const t of req) trozos.push(t);
  try {
    return JSON.parse(Buffer.concat(trozos).toString("utf8") || "{}");
  } catch {
    return {};
  }
}

function responder(res, status, cuerpo) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(cuerpo === undefined ? "" : JSON.stringify(cuerpo));
}

const error = (res, status, code, mensaje, campos) =>
  responder(res, status, { error: mensaje, code, ...(campos ? { fields: campos } : {}) });

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function claveValida(clave) {
  return (
    typeof clave === "string" &&
    clave.length >= 8 &&
    clave.length <= 128 &&
    /[A-Za-z]/.test(clave) &&
    /\d/.test(clave)
  );
}
const publico = (u) => ({ id: u.id, nombre: u.nombre, correo: u.correo });
const expira = () => new Date(Date.now() + 30 * 86_400_000).toISOString();

function usuarioDeSesion(req) {
  const cabecera = req.headers.authorization ?? "";
  const token = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : null;
  if (!token) return { fallo: ["no_autenticado", "Debes iniciar sesión."] };
  const correo = sesiones.get(token);
  const usuario = correo && usuarios.get(correo);
  if (!usuario) return { fallo: ["sesion_expirada", "Tu sesión venció. Inicia sesión de nuevo."] };
  return { usuario, token };
}

function seguimiento(pedido) {
  const copia = { ...pedido };
  delete copia.usuarioId;
  delete copia.correo;
  copia.direccion = {
    calle: null,
    numero: null,
    comuna: pedido.direccion.comuna,
    region: pedido.direccion.region,
    referencia: null,
  };
  return copia;
}

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PUERTO}`);
  const ruta = url.pathname;
  const metodo = req.method ?? "GET";
  try {
    if (ruta === "/health") return responder(res, 200, { status: "ok" });

    // ---- lectura del catálogo y contenido: la API real
    if (metodo === "GET" && LECTURAS_REALES.includes(ruta)) {
      const real = await pedirReal(`${ruta}${url.search}`);
      res.writeHead(real.status, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(real.cuerpo);
    }

    // ---- despacho y cotización
    if (metodo === "GET" && ruta === "/api/v1/shipping") {
      return responder(res, 200, {
        data: {
          gratisDesde: GRATIS_DESDE,
          costoGeneral: null,
          plazo: PLAZO,
          cobertura: "zonas",
          zonas: ZONAS,
        },
      });
    }
    if (metodo === "POST" && ruta === "/api/v1/checkout/quote") {
      const { items = [], comuna } = await cuerpoJson(req);
      return responder(res, 200, { data: await cotizar(items, comuna) });
    }

    // ---- cuentas y sesión
    if (metodo === "POST" && ruta === "/api/v1/auth/register") {
      const { nombre = "", correo = "", contrasena = "", confirmar } = await cuerpoJson(req);
      const campos = {};
      if (String(nombre).trim().length < 2)
        campos.nombre = "Escribe tu nombre (al menos 2 letras).";
      if (!CORREO.test(String(correo).trim())) campos.correo = "Escribe un correo válido.";
      if (!claveValida(contrasena))
        campos.contrasena = "La contraseña debe tener al menos 8 caracteres.";
      if (confirmar !== undefined && confirmar !== contrasena)
        campos.confirmar = "Las contraseñas no coinciden.";
      if (Object.keys(campos).length) {
        return error(res, 400, "validacion", "Revisa los datos marcados en rojo.", campos);
      }
      const mail = String(correo).trim().toLowerCase();
      if (usuarios.has(mail)) {
        return error(res, 409, "correo_duplicado", "Ya existe una cuenta con ese correo.");
      }
      const usuario = {
        id: randomUUID(),
        nombre: String(nombre).trim(),
        correo: mail,
        clave: contrasena,
        direcciones: [],
      };
      usuarios.set(mail, usuario);
      const token = randomUUID();
      sesiones.set(token, mail);
      return responder(res, 201, {
        data: { usuario: publico(usuario), token, expiraEn: expira() },
      });
    }

    if (metodo === "POST" && ruta === "/api/v1/auth/login") {
      const { correo = "", contrasena = "" } = await cuerpoJson(req);
      const campos = {};
      if (!String(correo).trim()) campos.correo = "Escribe tu correo.";
      if (!contrasena) campos.contrasena = "Escribe tu contraseña.";
      if (Object.keys(campos).length) {
        return error(res, 400, "validacion", "Revisa los datos marcados en rojo.", campos);
      }
      const mail = String(correo).trim().toLowerCase();
      if (mail === "error@sedyjo.cl")
        return error(res, 500, "error_interno", "Error del servidor.");
      const usuario = usuarios.get(mail);
      if (!usuario || usuario.clave !== contrasena) {
        return error(res, 401, "credenciales", "El correo o la contraseña no son correctos.");
      }
      const token = randomUUID();
      sesiones.set(token, mail);
      return responder(res, 200, {
        data: { usuario: publico(usuario), token, expiraEn: expira() },
      });
    }

    if (metodo === "POST" && ruta === "/api/v1/auth/password/forgot") {
      const { correo = "" } = await cuerpoJson(req);
      if (!CORREO.test(String(correo).trim())) {
        return error(res, 400, "validacion", "Revisa los datos marcados en rojo.", {
          correo: "Escribe tu correo.",
        });
      }
      return responder(res, 200, { data: { enviado: true } });
    }

    if (metodo === "POST" && ruta === "/api/v1/auth/password/reset") {
      const { token = "", contrasena = "", confirmar } = await cuerpoJson(req);
      const campos = {};
      if (!claveValida(contrasena))
        campos.contrasena = "La contraseña debe tener al menos 8 caracteres.";
      if (confirmar !== undefined && confirmar !== contrasena)
        campos.confirmar = "Las contraseñas no coinciden.";
      if (Object.keys(campos).length) {
        return error(res, 400, "validacion", "Revisa los datos marcados en rojo.", campos);
      }
      if (token !== "token-valido")
        return error(res, 400, "token_invalido", "El enlace no es válido.");
      return responder(res, 200, { data: { restablecida: true } });
    }

    // ---- rutas con sesión
    if (ruta === "/api/v1/auth/logout" && metodo === "POST") {
      const { fallo, token } = usuarioDeSesion(req);
      if (fallo) return error(res, 401, fallo[0], fallo[1]);
      sesiones.delete(token);
      return responder(res, 204);
    }

    if (["/api/v1/auth/me", "/api/v1/me"].includes(ruta) && metodo === "GET") {
      const { fallo, usuario } = usuarioDeSesion(req);
      if (fallo) return error(res, 401, fallo[0], fallo[1]);
      return responder(res, 200, { data: { usuario: publico(usuario) } });
    }

    if (ruta === "/api/v1/me" && metodo === "PATCH") {
      const { fallo, usuario } = usuarioDeSesion(req);
      if (fallo) return error(res, 401, fallo[0], fallo[1]);
      const { nombre, correo, contrasena } = await cuerpoJson(req);
      const nuevoCorreo =
        correo === undefined ? usuario.correo : String(correo).trim().toLowerCase();
      if (nuevoCorreo !== usuario.correo) {
        if (!contrasena) {
          return error(
            res,
            400,
            "contrasena_requerida",
            "Escribe tu contraseña actual para cambiar el correo.",
          );
        }
        if (contrasena !== usuario.clave) {
          return error(res, 400, "credenciales", "La contraseña no es correcta.");
        }
        if (usuarios.has(nuevoCorreo)) {
          return error(res, 409, "correo_duplicado", "Ya existe una cuenta con ese correo.");
        }
        usuarios.delete(usuario.correo);
        for (const [t, c] of sesiones) if (c === usuario.correo) sesiones.set(t, nuevoCorreo);
        for (const registro of pedidos.values()) {
          if (registro.usuarioCorreo === usuario.correo) registro.usuarioCorreo = nuevoCorreo;
        }
        usuario.correo = nuevoCorreo;
        usuarios.set(nuevoCorreo, usuario);
      }
      if (nombre !== undefined) usuario.nombre = String(nombre).trim();
      return responder(res, 200, { data: { usuario: publico(usuario) } });
    }

    if (ruta === "/api/v1/me/password" && metodo === "POST") {
      const { fallo, usuario } = usuarioDeSesion(req);
      if (fallo) return error(res, 401, fallo[0], fallo[1]);
      const { actual = "", nueva = "", confirmar } = await cuerpoJson(req);
      if (actual !== usuario.clave) {
        return error(res, 400, "credenciales", "La contraseña actual no es correcta.");
      }
      if (!claveValida(nueva) || nueva !== confirmar) {
        return error(res, 400, "validacion", "Revisa los datos marcados en rojo.", {
          nueva: "La contraseña no es válida.",
        });
      }
      usuario.clave = nueva;
      return responder(res, 200, { data: { actualizada: true } });
    }

    // ---- direcciones
    const direccionRuta = /^\/api\/v1\/me\/addresses(?:\/([^/]+?)(\/primary)?)?$/.exec(ruta);
    if (direccionRuta) {
      const { fallo, usuario } = usuarioDeSesion(req);
      if (fallo) return error(res, 401, fallo[0], fallo[1]);
      const lista = usuario.direcciones;
      const ordenada = () => [...lista].sort((a, b) => Number(b.principal) - Number(a.principal));
      const id = direccionRuta[1] ? decodeURIComponent(direccionRuta[1]) : null;
      const marcar = (d) => {
        for (const x of lista) x.principal = x === d;
      };

      if (!id && metodo === "GET") return responder(res, 200, { data: ordenada() });
      if (!id && metodo === "POST") {
        const c = await cuerpoJson(req);
        const campos = {};
        for (const k of ["etiqueta", "calle", "numero", "comuna", "region"]) {
          if (!String(c[k] ?? "").trim()) campos[k] = "Este dato es obligatorio.";
        }
        if (Object.keys(campos).length) {
          return error(res, 400, "validacion", "Revisa los datos marcados en rojo.", campos);
        }
        if (lista.length >= 5)
          return error(res, 409, "limite_direcciones", "Ya tienes 5 direcciones.");
        const clave = (d) => [d.calle, d.numero, d.comuna, d.region].join("|").toLowerCase();
        if (lista.some((d) => clave(d) === clave(c))) {
          return error(res, 409, "direccion_duplicada", "Ya guardaste esa dirección.");
        }
        const nueva = {
          id: randomUUID(),
          etiqueta: c.etiqueta,
          calle: c.calle,
          numero: c.numero,
          comuna: c.comuna,
          region: c.region,
          referencia: c.referencia ?? null,
          principal: false,
        };
        lista.push(nueva);
        if (lista.length === 1 || c.principal) marcar(nueva);
        return responder(res, 201, { data: nueva });
      }
      const direccion = id ? lista.find((d) => d.id === id) : null;
      if (id && !direccion) return error(res, 404, "no_encontrada", "La dirección no existe.");
      if (id && direccionRuta[2] && metodo === "POST") {
        marcar(direccion);
        return responder(res, 200, { data: ordenada() });
      }
      if (id && metodo === "PATCH") {
        const c = await cuerpoJson(req);
        for (const k of ["etiqueta", "calle", "numero", "comuna", "region", "referencia"]) {
          if (c[k] !== undefined) direccion[k] = c[k];
        }
        if (c.principal) marcar(direccion);
        return responder(res, 200, { data: direccion });
      }
      if (id && metodo === "DELETE") {
        lista.splice(lista.indexOf(direccion), 1);
        if (direccion.principal && lista[0]) marcar(lista[0]);
        return responder(res, 204);
      }
    }

    // ---- historial del cliente
    if (ruta === "/api/v1/me/orders" && metodo === "GET") {
      const { fallo, usuario } = usuarioDeSesion(req);
      if (fallo) return error(res, 401, fallo[0], fallo[1]);
      const propios = [...pedidos.values()]
        .filter((r) => r.usuarioCorreo === usuario.correo && r.pedido.pago?.estado === "pagado")
        .map((r) => r.pedido)
        .sort((a, b) => b.fecha.localeCompare(a.fecha));
      const limit = Number(url.searchParams.get("limit") ?? 10);
      const page = Number(url.searchParams.get("page") ?? 1);
      return responder(res, 200, {
        data: propios.slice((page - 1) * limit, page * limit),
        meta: {
          page,
          limit,
          total: propios.length,
          totalPages: Math.max(Math.ceil(propios.length / limit), 1),
        },
      });
    }
    const detalle = /^\/api\/v1\/me\/orders\/([^/]+)$/.exec(ruta);
    if (detalle && metodo === "GET") {
      const { fallo, usuario } = usuarioDeSesion(req);
      if (fallo) return error(res, 401, fallo[0], fallo[1]);
      const buscado = decodeURIComponent(detalle[1]);
      const registro = [...pedidos.values()].find(
        (r) =>
          (r.pedido.id === buscado || r.pedido.numero === buscado) &&
          r.usuarioCorreo === usuario.correo &&
          r.pedido.pago?.estado === "pagado",
      );
      if (!registro) return error(res, 404, "no_encontrado", "Pedido no encontrado.");
      return responder(res, 200, { data: registro.pedido });
    }

    // ---- crear pedido
    if (metodo === "POST" && ruta === "/api/v1/orders") {
      let duenio = null;
      if (req.headers.authorization) {
        const { fallo, usuario } = usuarioDeSesion(req);
        if (fallo) return error(res, 401, fallo[0], fallo[1]);
        duenio = usuario;
      }
      const cuerpo = await cuerpoJson(req);
      const clave = req.headers["idempotency-key"];
      if (clave && idempotencia.has(clave)) {
        const previo = pedidos.get(idempotencia.get(clave));
        return responder(res, 200, { data: { ...previo.pedido, repetido: true } });
      }
      const campos = {};
      for (const campo of ["nombre", "correo", "telefono", "calle", "numero", "comuna", "region"]) {
        if (!String(cuerpo[campo] ?? "").trim()) campos[campo] = `Falta ${campo}.`;
      }
      if (Object.keys(campos).length) {
        return error(res, 400, "validacion", "Revisa los datos marcados en rojo.", campos);
      }
      const cotizacion = await cotizar(cuerpo.items ?? [], cuerpo.comuna);
      if (!cotizacion.cobertura) {
        return error(res, 422, "fuera_de_cobertura", "No despachamos a esa comuna.");
      }
      if (cotizacion.problemas.length) {
        return responder(res, 409, {
          error: "Hay productos sin stock suficiente.",
          code: "items_invalidos",
          items: cotizacion.problemas,
        });
      }
      contador += 1;
      const id = randomUUID();
      const token = randomUUID();
      const pedido = {
        id,
        numero: `SED-${contador}`,
        usuarioId: duenio?.id ?? null,
        correo: cuerpo.correo,
        fecha: new Date().toISOString(),
        estado: "recibido",
        metodoEntrega: "despacho",
        direccion: {
          calle: cuerpo.calle,
          numero: cuerpo.numero,
          comuna: cuerpo.comuna,
          region: cuerpo.region,
          referencia: cuerpo.referencia || null,
        },
        items: cotizacion.items.map(
          ({ productoId, slug: s, nombre, precio, cantidad, imagen, categoria }) => ({
            productoId,
            slug: s,
            nombre,
            precio,
            cantidad,
            imagen,
            categoria,
          }),
        ),
        subtotal: cotizacion.subtotal,
        despacho: cotizacion.despacho,
        total: cotizacion.total,
        metodoPago: "webpay",
        pago: { estado: "pendiente", fecha: null },
        eventos: [],
      };
      pedidos.set(id, {
        pedido,
        token,
        correo: cuerpo.correo,
        usuarioCorreo: duenio?.correo ?? null,
      });
      if (clave) idempotencia.set(clave, id);
      return responder(res, 201, { data: { ...pedido, accessToken: token } });
    }

    // ---- seguimiento público
    if (metodo === "POST" && ruta === "/api/v1/orders/track") {
      const { numero = "", correo = "" } = await cuerpoJson(req);
      const encontrado = [...pedidos.values()].find(
        (p) =>
          p.pedido.numero === String(numero).trim().toUpperCase() &&
          p.correo.toLowerCase() === String(correo).trim().toLowerCase() &&
          p.pedido.pago?.estado === "pagado",
      );
      if (!encontrado) {
        return error(
          res,
          404,
          "pedido_no_encontrado",
          "No encontramos un pedido con ese número y correo.",
        );
      }
      return responder(res, 200, { data: seguimiento(encontrado.pedido) });
    }

    // ---- consultar y pagar un pedido
    const coincidencia = /^\/api\/v1\/orders\/([^/]+)(\/simulate-payment)?$/.exec(ruta);
    if (coincidencia) {
      const registro = pedidos.get(decodeURIComponent(coincidencia[1]));
      const sesion = req.headers.authorization ? usuarioDeSesion(req) : null;
      const autorizado =
        registro &&
        (req.headers["x-order-token"] === registro.token ||
          (sesion?.usuario && sesion.usuario.correo === registro.usuarioCorreo));
      if (!autorizado) return error(res, 404, "no_encontrado", "Pedido no encontrado.");

      if (metodo === "GET" && !coincidencia[2])
        return responder(res, 200, { data: registro.pedido });

      if (metodo === "POST" && coincidencia[2]) {
        const { resultado } = await cuerpoJson(req);
        const pedido = registro.pedido;
        if (registro.correo.toLowerCase() === "sinpagos@sedyjo.cl") {
          return error(res, 404, "no_encontrado", "Ruta no encontrada.");
        }
        const ahora = new Date().toISOString();
        if (resultado === "pagado" && registro.correo.toLowerCase() !== "rechazo@sedyjo.cl") {
          pedido.pago = { estado: "pagado", fecha: ahora };
          pedido.eventos = [evento("recibido", "Pago confirmado. Recibimos tu pedido.")];
        } else {
          pedido.pago = {
            estado: resultado === "cancelado" ? "expirado" : "rechazado",
            fecha: ahora,
          };
          pedido.estado = "cancelado";
        }
        return responder(res, 200, { data: pedido });
      }
    }

    return error(res, 404, "no_encontrado", "Ruta no encontrada.");
  } catch (fallo) {
    return error(res, 500, "error_interno", String(fallo?.message ?? fallo));
  }
});

servidor.listen(PUERTO, () => console.log(`API falsa de Sedyjo en http://localhost:${PUERTO}`));
