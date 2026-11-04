import { describe, expect, it } from "vitest";
import { checkoutSchema, itemsCheckoutSchema } from "@/lib/validation/checkout";
import type { DatosCheckout } from "@/types";
import { anteriorPaso, calcularTotales, puedeAvanzar, siguientePaso } from "./checkout";

const valido: DatosCheckout = {
  nombre: "Ana Pérez",
  correo: "ana@example.cl",
  telefono: "+56 9 1234 5678",
  metodoEntrega: "despacho",
  calle: "Los Aromos",
  numero: "123",
  comuna: "San Pedro de la Paz",
  region: "Biobío",
  referencia: "",
  metodoPago: "webpay",
  usuarioId: null,
};

describe("pasos del checkout", () => {
  it("avanza y retrocede sin salir de los límites", () => {
    expect(siguientePaso("datos")).toBe("pago");
    expect(siguientePaso("pago")).toBe("confirmacion");
    expect(siguientePaso("confirmacion")).toBe("confirmacion");
    expect(anteriorPaso("datos")).toBe("datos");
    expect(anteriorPaso("pago")).toBe("datos");
  });
  it("solo permite avanzar con datos válidos", () => {
    expect(puedeAvanzar("datos", valido)).toBe(true);
    expect(puedeAvanzar("pago", { ...valido, telefono: "123" })).toBe(false);
    expect(puedeAvanzar("confirmacion", valido)).toBe(false);
  });
});

describe("totales", () => {
  it("despacho gratis desde el monto mínimo", () =>
    expect(calcularTotales(49990)).toEqual({
      subtotal: 49990,
      despacho: 0,
      total: 49990,
    }));
  it("despacho pendiente no inventa un total", () =>
    expect(calcularTotales(12000)).toEqual({
      subtotal: 12000,
      despacho: null,
      total: null,
    }));
});

describe("contratos de checkout", () => {
  it("acepta despacho completo y rechaza retiro en tienda", () => {
    expect(checkoutSchema.safeParse(valido).success).toBe(true);
    expect(
      checkoutSchema.safeParse({
        ...valido,
        metodoEntrega: "retiro",
        calle: "",
        numero: "",
        comuna: "",
        region: "",
      }).success,
    ).toBe(false);
  });
  it("rechaza despacho incompleto, celular, correo y método inválidos", () => {
    expect(checkoutSchema.safeParse({ ...valido, calle: "" }).success).toBe(false);
    expect(
      checkoutSchema.safeParse({
        ...valido,
        telefono: "123",
        correo: "mal",
        metodoPago: "efectivo",
      }).success,
    ).toBe(false);
    expect(itemsCheckoutSchema.safeParse([]).success).toBe(false);
    expect(itemsCheckoutSchema.safeParse([{ productoId: "p1", cantidad: 0 }]).success).toBe(false);
  });
});
