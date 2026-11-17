import { describe, expect, it } from "vitest";
import {
  adaptarBannersOscuros,
  adaptarBannersPrincipales,
  adaptarCampanaModal,
  disenoDeApi,
  type BannerApi,
} from "@/lib/data/adaptador-api";
import { DISENO_VACIO, claseColorTexto, claseFondo, tamanoDelTitulo } from "./diseno";

describe("tamaño automático del título", () => {
  it("achica el título a medida que es más largo", () => {
    expect(tamanoDelTitulo("Té", null, "oscuro")).toBe("lg");
    expect(tamanoDelTitulo("Galletas y Papas", null, "oscuro")).toBe("md"); // el caso que se veía mal
    expect(tamanoDelTitulo("Galletas, snacks y mucho más", null, "oscuro")).toBe("sm");
    expect(tamanoDelTitulo("Abarrotes de todos los días", null, "principal")).toBe("md");
    expect(tamanoDelTitulo("Oferta del día", null, "modal")).toBe("lg");
    expect(tamanoDelTitulo("Lleva más, paga menos", null, "modal")).toBe("md");
  });

  it("respeta el tamaño que eligió el administrador", () => {
    expect(tamanoDelTitulo("Té", "sm", "oscuro")).toBe("sm");
    expect(tamanoDelTitulo("Un título larguísimo que no cabe en ninguna parte", "lg", "principal")).toBe("lg");
  });
});

describe("colores", () => {
  it("usa los fondos de cada zona y vuelve al de siempre si la clave no corresponde", () => {
    expect(claseFondo("oscuro", null)).toBe("bg-negro");
    expect(claseFondo("oscuro", "azul-oscuro")).toBe("bg-azul-oscuro");
    expect(claseFondo("oscuro", "crema")).toBe("bg-negro"); // un fondo claro no sirve en una zona oscura
    expect(claseFondo("principal", null)).toBe("bg-verde-suave");
    expect(claseFondo("principal", "celeste")).toBe("bg-celeste");
    expect(claseFondo("principal", "negro")).toBe("bg-verde-suave");
    expect(claseFondo("modal", "verde-profundo")).toBe("bg-verde-profundo");
  });

  it("el color del título solo cambia con una clave válida", () => {
    expect(claseColorTexto("blanco")).toBe("text-white");
    expect(claseColorTexto("menta")).toBe("text-verde-menta");
    expect(claseColorTexto(null)).toBeNull();
    expect(claseColorTexto("rojo")).toBeNull();
  });
});

const api = (extra: Partial<BannerApi> = {}): BannerApi => ({
  id: 1, placement: "dark", title: "Galletas y Papas", subtitle: "Para cada antojo", image: "https://api.test/images/a.webp",
  alt: null, linkUrl: "/productos", theme: "dorado", ctaLabel: "Comprar", position: 1, ...extra,
});

describe("lectura del diseño desde la API", () => {
  it("sin datos de diseño todo queda por defecto", () => {
    expect(disenoDeApi(api())).toEqual(DISENO_VACIO);
  });

  it("lee las opciones válidas y descarta las desconocidas", () => {
    expect(
      disenoDeApi(api({ titleSize: "sm", imageFit: "contain", imageSize: "lg", imageSide: "left", bgColor: "azul-oscuro", textColor: "blanco" })),
    ).toEqual({ tamanoTitulo: "sm", ajusteImagen: "contain", tamanoImagen: "lg", ladoImagen: "left", colorFondo: "azul-oscuro", colorTexto: "blanco" });
    const raro = disenoDeApi(api({ titleSize: "gigante", imageFit: "stretch", imageSide: "centro", imageSize: "xl" }));
    expect(raro.tamanoTitulo).toBeNull();
    expect(raro.ajusteImagen).toBeNull();
    expect(raro.ladoImagen).toBeNull();
    expect(raro.tamanoImagen).toBeNull();
  });

  it("el diseño llega a los tres tipos de banner", () => {
    const d = { titleSize: "md", imageSide: "left" };
    expect(adaptarBannersOscuros([api(d)])[0]?.diseno?.ladoImagen).toBe("left");
    expect(adaptarBannersPrincipales([api({ ...d, placement: "hero" })])[0]?.diseno?.tamanoTitulo).toBe("md");
    expect(adaptarCampanaModal([api({ ...d, placement: "modal" })])?.slides[0]?.diseno?.tamanoTitulo).toBe("md");
  });
});
