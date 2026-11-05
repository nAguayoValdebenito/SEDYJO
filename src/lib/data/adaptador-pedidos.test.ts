import { describe, expect, it } from "vitest";
import {
  adaptarCotizacion,
  adaptarDespacho,
  cotizacionApiSchema,
  despachoApiSchema,
  leerRespuestaPedido,
} from "./adaptador-pedidos";

const pedidoApi = {
  id: "5b0e1c6e-0000-4000-8000-000000000001",
  numero: "SED-10482",
  usuarioId: null,
  correo: "ana@example.cl",
  fecha: "2026-11-04T01:20:00.000Z",
  estado: "recibido",
  metodoEntrega: "despacho",
  direccion: {
    calle: "Av. Colón",
    numero: "1234",
    comuna: "Hualpén",
    region: "Biobío",
    referencia: "Portón negro",
  },
  items: [
    {
      productoId: "35",
      slug: "arroz-premium-grado-1-banquete-2-kg",
      nombre: "Arroz Premium Grado 1 Banquete 2 kg",
      precio: 2890,
      cantidad: 2,
      imagen: "https://api.sedyjo.com/images/arroz.jpg",
      categoria: "Abarrotes",
    },
  ],
  subtotal: 5780,
  despacho: 2990,
  total: 8770,
  metodoPago: "webpay",
  pago: { estado: "pagado", fecha: "2026-11-04T01:21:00.000Z" },
  eventos: [{ estado: "recibido", fecha: "2026-11-04T01:21:00.000Z", detalle: "Pago confirmado." }],
};

describe("despacho", () => {
  it("ordena las comunas por nombre y conserva costo y plazo", () => {
    const despacho = adaptarDespacho(
      despachoApiSchema.parse({
        data: {
          gratisDesde: 49990,
          costoGeneral: null,
          plazo: "24 a 48 horas",
          zonas: [
            { id: 2, region: "Biobío", comuna: "Concepción", costo: 2490, plazo: "24 a 48 horas" },
            {
              id: 1,
              region: "Biobío",
              comuna: "San Pedro de la Paz",
              costo: 1990,
              plazo: "24 a 48 horas",
            },
          ],
        },
      }).data,
    );
    expect(despacho.gratisDesde).toBe(49990);
    expect(despacho.zonas.map((z) => z.comuna)).toEqual(["Concepción", "San Pedro de la Paz"]);
    expect(despacho.zonas[1].costo).toBe(1990);
  });
});

describe("cotización", () => {
  const base = {
    items: [
      {
        productoId: "35",
        slug: "x",
        nombre: "Arroz",
        precio: 2890,
        precioNormal: 2890,
        cantidad: 2,
        subtotal: 5780,
        stock: 50,
        imagen: null,
      },
    ],
    subtotal: 5780,
    plazo: "24 a 48 horas",
    gratisDesde: 49990,
    faltaParaGratis: 44210,
  };

  it("deja despacho y total en null cuando no hay cobertura", () => {
    const cotizacion = adaptarCotizacion(
      cotizacionApiSchema.parse({
        data: {
          ...base,
          despacho: null,
          total: null,
          cobertura: false,
          cotizable: false,
          valido: false,
          problemas: [],
        },
      }).data,
    );
    expect(cotizacion.despacho).toBeNull();
    expect(cotizacion.total).toBeNull();
    expect(cotizacion.cobertura).toBe(false);
  });

  it("conserva los problemas de stock", () => {
    const cotizacion = adaptarCotizacion(
      cotizacionApiSchema.parse({
        data: {
          ...base,
          despacho: 2990,
          total: 8770,
          cobertura: true,
          cotizable: true,
          valido: false,
          problemas: [{ productoId: "35", codigo: "cantidad_excede", disponible: 1 }],
        },
      }).data,
    );
    expect(cotizacion.valido).toBe(false);
    expect(cotizacion.problemas).toEqual([
      { productoId: "35", codigo: "cantidad_excede", disponible: 1 },
    ]);
  });
});

describe("pedido", () => {
  it("lee el pedido con el token de acceso dentro de data (formato actual)", () => {
    const { pedido, accessToken, repetido } = leerRespuestaPedido({
      data: { ...pedidoApi, accessToken: "tok-123" },
    });
    expect(accessToken).toBe("tok-123");
    expect(repetido).toBe(false);
    expect(pedido).toMatchObject({
      numero: "SED-10482",
      usuarioId: null,
      total: 8770,
      metodoPago: "Webpay Plus",
      pago: { estado: "pagado" },
    });
    // El color de fondo lo decide el frontend a partir de la categoría.
    expect(pedido.items[0].fondo).toBe("#F6E3A1");
  });

  it("también acepta el token junto a data", () => {
    const { accessToken } = leerRespuestaPedido({ data: pedidoApi, accessToken: "tok-456" });
    expect(accessToken).toBe("tok-456");
  });

  it("marca los reintentos repetidos, dentro o fuera de data", () => {
    expect(leerRespuestaPedido({ data: { ...pedidoApi, repetido: true } }).repetido).toBe(true);
    expect(leerRespuestaPedido({ data: pedidoApi, repetido: true }).repetido).toBe(true);
  });

  it("también acepta el pedido plano", () => {
    const { pedido, repetido } = leerRespuestaPedido({ ...pedidoApi, repetido: true });
    expect(pedido.id).toBe(pedidoApi.id);
    expect(repetido).toBe(true);
  });

  it("tolera el seguimiento público: sin correo ni calle", () => {
    const { pedido } = leerRespuestaPedido({
      data: {
        ...pedidoApi,
        usuarioId: undefined,
        correo: undefined,
        direccion: {
          calle: null,
          numero: null,
          comuna: "Hualpén",
          region: "Biobío",
          referencia: null,
        },
      },
    });
    expect(pedido.correo).toBe("");
    expect(pedido.direccion).toMatchObject({ calle: null, comuna: "Hualpén" });
  });

  it("rechaza una respuesta que no es un pedido", () => {
    expect(() => leerRespuestaPedido({ data: { id: "x" } })).toThrow();
  });
});
