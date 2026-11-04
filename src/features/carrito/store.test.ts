import { beforeEach, describe, expect, it } from "vitest";
import {
  seleccionarCantidadDe,
  seleccionarCantidadTotal,
  seleccionarSubtotal,
  useCarrito,
  type ProductoParaCarrito,
} from "./store";

const leche: ProductoParaCarrito = {
  productoId: "p-004",
  slug: "leche-entera-1-l",
  nombre: "Leche entera 1 L",
  precio: 1090,
  imagen: null,
  fondo: "#BFE0F7",
};

const galletas: ProductoParaCarrito = {
  productoId: "p-003",
  slug: "galletas-surtidas-400-g",
  nombre: "Galletas surtidas 400 g",
  precio: 1390,
  imagen: null,
  fondo: "#F8C9DA",
};

beforeEach(() => {
  useCarrito.setState({ items: [] });
});

describe("carrito", () => {
  it("agrega un producto nuevo con cantidad 1", () => {
    useCarrito.getState().agregar(leche);
    expect(useCarrito.getState().items).toHaveLength(1);
    expect(seleccionarCantidadDe("p-004")(useCarrito.getState())).toBe(1);
  });

  it("suma cantidades al repetir producto y calcula totales", () => {
    const { agregar } = useCarrito.getState();
    agregar(leche);
    agregar(leche);
    agregar(galletas);

    const estado = useCarrito.getState();
    expect(seleccionarCantidadTotal(estado)).toBe(3);
    expect(seleccionarSubtotal(estado)).toBe(1090 * 2 + 1390);
  });

  it("quita el producto cuando la cantidad llega a cero", () => {
    const { agregar, cambiarCantidad } = useCarrito.getState();
    agregar(leche);
    cambiarCantidad("p-004", -1);
    expect(useCarrito.getState().items).toHaveLength(0);
  });

  it("vacía el carrito", () => {
    const { agregar, vaciar } = useCarrito.getState();
    agregar(leche);
    agregar(galletas);
    vaciar();
    expect(useCarrito.getState().items).toEqual([]);
  });

  it("suma varias unidades de una vez y respeta lo que ya había", () => {
    const { agregar, agregarCantidad } = useCarrito.getState();
    agregar(leche);
    agregarCantidad(leche, 5);
    agregarCantidad(galletas, 2);
    agregarCantidad(galletas, 0);
    const items = useCarrito.getState().items;
    expect(items.find((i) => i.productoId === "p-004")?.cantidad).toBe(6);
    expect(items.find((i) => i.productoId === "p-003")?.cantidad).toBe(2);
  });
});
