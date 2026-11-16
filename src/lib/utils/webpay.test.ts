import { describe, expect, it } from "vitest";
import { esUrlWebpay, motivoRetorno } from "./webpay";

describe("esUrlWebpay", () => {
  it("acepta solo el formulario de Webpay (producción y pruebas) por https", () => {
    expect(esUrlWebpay("https://webpay3g.transbank.cl/webpayserver/initTransaction")).toBe(true);
    expect(esUrlWebpay("https://webpay3gint.transbank.cl/webpayserver/initTransaction")).toBe(true);
  });

  it("rechaza otros sitios, http y direcciones inválidas", () => {
    expect(esUrlWebpay("http://webpay3g.transbank.cl/webpayserver/initTransaction")).toBe(false);
    expect(esUrlWebpay("https://webpay3g.transbank.cl.malo.com/pago")).toBe(false);
    expect(esUrlWebpay("https://evil.example.com/webpay3g.transbank.cl")).toBe(false);
    expect(esUrlWebpay("javascript:alert(1)")).toBe(false);
    expect(esUrlWebpay("no es una url")).toBe(false);
  });
});

describe("motivoRetorno", () => {
  it("reconoce los motivos conocidos y descarta el resto", () => {
    expect(motivoRetorno("cancelado")).toBe("cancelado");
    expect(motivoRetorno("tiempo-agotado")).toBe("tiempo-agotado");
    expect(motivoRetorno("otro")).toBeNull();
    expect(motivoRetorno(null)).toBeNull();
  });
});
