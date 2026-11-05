"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CreditCard, Loader2, Truck } from "lucide-react";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { ResumenErrores } from "@/components/ui/ResumenErrores";
import { claseBoton } from "@/components/ui/boton";
import { useSesion } from "@/features/auth/store";
import { useCarrito } from "@/features/carrito/store";
import { useCuenta, useDirecciones } from "@/features/cuenta/store";
import { CampoComuna } from "@/features/despacho/components/CampoComuna";
import { useHidratado } from "@/features/carrito/useHidratado";
import { DESPACHO_GRATIS_DESDE, PLAZO_DESPACHO } from "@/lib/config";
import { MAX_DIRECCIONES, direccionPrincipal, mismaDireccion } from "@/lib/utils/direcciones";
import { formatoPrecio } from "@/lib/utils/format";
import { checkoutSchema, erroresCheckoutPorCampo } from "@/lib/validation/checkout";
import type { Cotizacion, DatosCheckout, Despacho } from "@/types";
import { cotizarCompra, iniciarPago, pagarPedido } from "../acciones";
import { useCheckout } from "../store";
import { EsqueletoCheckout } from "./EsqueletoCheckout";
import { IndicadorCheckout } from "./IndicadorCheckout";
import { ResumenCheckout, type LineaResumen } from "./ResumenCheckout";
import { SelectorDireccion } from "./SelectorDireccion";

const ETIQUETAS: Record<string, string> = {
  nombre: "Nombre",
  correo: "Correo",
  telefono: "Celular",
  calle: "Calle",
  numero: "Número",
  comuna: "Comuna",
  region: "Región",
};
const FONDO_NEUTRO = "#E8F4EE";

type Props = {
  /** Comunas con despacho y reglas de la API; `null` si no se pudieron cargar. */
  despacho: Despacho | null;
};

export function Checkout({ despacho }: Props) {
  const router = useRouter();
  const hidratado = useHidratado();
  const usuario = useSesion((s) => s.usuario);
  const items = useCarrito((s) => s.items);
  const { datos, paso, cambiarDatos, cambiarPaso, guardarPedido, guardarError } = useCheckout();
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const clavePago = useRef<{ firma: string; uuid: string } | null>(null);
  const zonas = despacho?.zonas ?? [];
  const comunasAtendidas = zonas.map((z) => z.comuna);
  const direcciones = useDirecciones(usuario?.id ?? null);
  const guardarEnLibreta = useCuenta((s) => s.guardar);
  const [eleccionManual, setEleccionManual] = useState<string | null>(null);
  const [guardarNueva, setGuardarNueva] = useState(false);
  const resumen = useRef<HTMLDivElement>(null);
  const aviso = useRef<HTMLDivElement>(null);
  const tituloPaso = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (usuario && !datos.nombre && !datos.correo)
      cambiarDatos({ nombre: usuario.nombre, correo: usuario.correo, usuarioId: usuario.id });
  }, [usuario, datos.nombre, datos.correo, cambiarDatos]);

  // Cotización: precios vigentes, despacho y total los calcula la API cada vez que cambia el
  // carrito o la comuna. Mientras responde se sigue mostrando la cotización anterior.
  const firmaItems = items.map((i) => `${i.productoId}:${i.cantidad}`).join("|");
  const claveCotizacion = `${firmaItems}@${datos.comuna}`;
  const [resultadoCotizacion, setResultadoCotizacion] = useState<{
    clave: string;
    cotizacion: Cotizacion | null;
  } | null>(null);

  useEffect(() => {
    if (!hidratado || items.length === 0) return;
    let vigente = true;
    const espera = setTimeout(() => {
      cotizarCompra(
        items.map(({ productoId, cantidad }) => ({ productoId, cantidad })),
        datos.comuna || undefined,
      )
        .then((r) => r)
        .catch(() => ({ ok: false as const }))
        .then((r) => {
          if (vigente) {
            setResultadoCotizacion({
              clave: claveCotizacion,
              cotizacion: r.ok && "cotizacion" in r ? r.cotizacion : null,
            });
          }
        });
    }, 250);
    return () => {
      vigente = false;
      clearTimeout(espera);
    };
  }, [hidratado, items, datos.comuna, claveCotizacion]);

  const cotizacion = resultadoCotizacion?.cotizacion ?? null;
  const cotizando = resultadoCotizacion?.clave !== claveCotizacion;
  const fallaCotizacion = !cotizando && resultadoCotizacion?.cotizacion === null;
  const nombrePorId = new Map(items.map((i) => [i.productoId, i.nombre]));
  const problemas = cotizacion?.problemas ?? [];
  const textoProblemas = problemas
    .map((p) => nombrePorId.get(p.productoId) ?? "Un producto")
    .join(", ");

  const lineasResumen: LineaResumen[] = cotizacion
    ? cotizacion.items.map((i) => ({
        productoId: i.productoId,
        nombre: i.nombre,
        precio: i.precio,
        cantidad: i.cantidad,
        imagen: i.imagen,
        fondo: items.find((c) => c.productoId === i.productoId)?.fondo ?? FONDO_NEUTRO,
      }))
    : items;
  const subtotalResumen =
    cotizacion?.subtotal ?? items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
  const despachoPendiente = !datos.comuna
    ? "Elige tu comuna"
    : cotizacion && !cotizacion.cobertura
      ? "Sin despacho a esta comuna"
      : "Calculando…";

  // Dirección elegida: la que el cliente marcó; si no, la guardada que coincide con lo escrito o
  // la principal (que se completa sola al entrar). Sin direcciones guardadas se escribe una nueva.
  const principalGuardada = direccionPrincipal(direcciones);
  const principal =
    principalGuardada && comunasAtendidas.includes(principalGuardada.comuna)
      ? principalGuardada
      : undefined;
  const coincidente = direcciones.find((d) => mismaDireccion(d, datos));
  const eleccion =
    eleccionManual ?? coincidente?.id ?? (!datos.calle && principal ? principal.id : "otra");
  const mostrarCampos = eleccion === "otra";

  useEffect(() => {
    if (eleccionManual !== null || datos.calle || !principal) return;
    cambiarDatos({
      calle: principal.calle,
      numero: principal.numero,
      comuna: principal.comuna,
      region: principal.region,
      referencia: principal.referencia ?? "",
    });
  }, [eleccionManual, datos.calle, principal, cambiarDatos]);

  const elegirDireccion = (d: (typeof direcciones)[number] | null) => {
    setEleccionManual(d ? d.id : "otra");
    cambiarDatos(
      d
        ? {
            calle: d.calle,
            numero: d.numero,
            comuna: d.comuna,
            region: d.region,
            referencia: d.referencia ?? "",
          }
        : { calle: "", numero: "", comuna: "", region: "", referencia: "" },
    );
    setErrores({});
  };

  const elegirComuna = (comuna: string) => {
    const zona = zonas.find((z) => z.comuna === comuna);
    cambiarDatos({ comuna, region: zona?.region ?? "" });
    setErrores((actual) => {
      const copia = { ...actual };
      delete copia.comuna;
      delete copia.region;
      return copia;
    });
  };

  const cambiar = (campo: keyof DatosCheckout, valor: string) => {
    cambiarDatos({ [campo]: valor });
    setErrores((actual) => {
      const copia = { ...actual };
      delete copia[campo];
      return copia;
    });
  };
  const enfocarError = () =>
    requestAnimationFrame(() => (resumen.current ?? aviso.current)?.focus());
  const irAlPaso = (nuevo: "datos" | "pago") => {
    cambiarPaso(nuevo);
    requestAnimationFrame(() => tituloPaso.current?.focus());
  };

  const continuar = (evento: FormEvent) => {
    evento.preventDefault();
    const validacion = checkoutSchema.safeParse({ ...datos, usuarioId: usuario?.id ?? null });
    if (!validacion.success) {
      setErrores(erroresCheckoutPorCampo(validacion.error));
      enfocarError();
      return;
    }
    if (
      usuario &&
      guardarNueva &&
      mostrarCampos &&
      direcciones.length < MAX_DIRECCIONES &&
      !direcciones.some((d) => mismaDireccion(d, datos))
    ) {
      void guardarEnLibreta({
        etiqueta: direcciones.length === 0 ? "Casa" : `Dirección ${direcciones.length + 1}`,
        calle: datos.calle.trim(),
        numero: datos.numero.trim(),
        comuna: datos.comuna.trim(),
        region: datos.region.trim(),
        referencia: datos.referencia.trim() || null,
      });
    }
    if (cotizando || !cotizacion) {
      setErrorGeneral("Estamos calculando tu total. Espera un momento e inténtalo de nuevo.");
      enfocarError();
      return;
    }
    if (problemas.length > 0) {
      setErrorGeneral(`No hay stock suficiente de: ${textoProblemas}. Ajusta tu carrito.`);
      enfocarError();
      return;
    }
    if (!cotizacion.cobertura) {
      setErrores({ comuna: "Sin despacho a esta comuna." });
      enfocarError();
      return;
    }
    if (cotizacion.total === null) {
      setErrorGeneral("No pudimos calcular el despacho de tu pedido. Intenta más tarde.");
      enfocarError();
      return;
    }
    setErrores({});
    setErrorGeneral("");
    irAlPaso("pago");
  };

  const pagar = async (evento: FormEvent) => {
    evento.preventDefault();
    const entrada = { ...datos, usuarioId: usuario?.id ?? null };
    const validacion = checkoutSchema.safeParse(entrada);
    if (!validacion.success) {
      setErrores(erroresCheckoutPorCampo(validacion.error));
      irAlPaso("datos");
      enfocarError();
      return;
    }
    setErrores({});
    setErrorGeneral("");
    setEnviando(true);
    try {
      const itemsEntrada = items.map(({ productoId, cantidad }) => ({ productoId, cantidad }));
      // Misma clave mientras no cambien los datos: un reintento no duplica el pedido.
      const firma = JSON.stringify([entrada, itemsEntrada]);
      if (clavePago.current?.firma !== firma) {
        clavePago.current = { firma, uuid: crypto.randomUUID() };
      }
      const resultado = await iniciarPago(entrada, itemsEntrada, clavePago.current.uuid);
      if (!resultado.ok) {
        clavePago.current = null;
        setErrores(resultado.campos ?? {});
        setErrorGeneral(
          resultado.problemas?.length
            ? `No hay stock suficiente de: ${resultado.problemas
                .map((p) => nombrePorId.get(p.productoId) ?? "un producto")
                .join(", ")}. Ajusta tu carrito.`
            : resultado.mensaje,
        );
        if (resultado.campos) irAlPaso("datos");
        enfocarError();
        return;
      }
      clavePago.current = null;
      const pago = await pagarPedido(resultado.pedido.id);
      if (pago.ok) {
        guardarPedido(pago.pedido);
        router.replace("/checkout/exito");
      } else {
        guardarError(pago.motivo);
        router.replace("/checkout/error");
      }
    } catch {
      setErrorGeneral("No pudimos iniciar el pago. Intenta de nuevo.");
      enfocarError();
    } finally {
      setEnviando(false);
    }
  };

  if (!hidratado) return <EsqueletoCheckout />;
  if (items.length === 0)
    return (
      <div className="rounded-xl border border-borde bg-white p-6">
        <p className="mb-4 text-gris-medio">
          Tu carrito está vacío. Agrega productos para comenzar una compra.
        </p>
        <Link href="/" className={claseBoton("primario", "lg")}>
          Seguir comprando
        </Link>
      </div>
    );

  return (
    <>
      <IndicadorCheckout paso={paso} />
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
        <div className="order-2 min-w-0 lg:order-1">
          <div className="rounded-xl border border-borde bg-white p-4 sm:p-6">
            <h2
              ref={tituloPaso}
              tabIndex={-1}
              className="mb-4 font-titulos text-xl font-extrabold outline-none"
            >
              {paso === "datos" ? "Contacto y entrega" : "Revisa y paga"}
            </h2>
            {errorGeneral && (
              <div
                ref={aviso}
                role="alert"
                tabIndex={-1}
                className="mb-4 rounded-lg border-2 border-error p-3 font-medium text-error outline-none"
              >
                {errorGeneral}
              </div>
            )}
            {problemas.length > 0 && (
              <p
                role="alert"
                className="mb-4 rounded-lg border-2 border-error p-3 font-medium text-error"
              >
                No hay stock suficiente de: {textoProblemas}.{" "}
                <Link href="/carrito" className="underline">
                  Ajustar mi carrito
                </Link>
              </p>
            )}
            {fallaCotizacion && (
              <p
                role="alert"
                className="mb-4 rounded-lg border border-error p-3 text-sm text-error"
              >
                No pudimos calcular el total con el servidor. Revisa tu conexión e inténtalo de
                nuevo.
              </p>
            )}
            {paso === "datos" ? (
              <form key="datos" onSubmit={continuar} noValidate className="entrada-paso space-y-4">
                <ResumenErrores
                  ref={resumen}
                  errores={errores}
                  etiquetas={ETIQUETAS}
                  prefijo="checkout"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoTexto
                    id="checkout-nombre"
                    etiqueta="Nombre"
                    value={datos.nombre}
                    onChange={(e) => cambiar("nombre", e.target.value)}
                    error={errores.nombre}
                    autoComplete="name"
                    required
                  />
                  <CampoTexto
                    id="checkout-correo"
                    etiqueta="Correo"
                    type="email"
                    value={datos.correo}
                    onChange={(e) => cambiar("correo", e.target.value)}
                    error={errores.correo}
                    autoComplete="email"
                    required
                  />
                </div>
                <CampoTexto
                  id="checkout-telefono"
                  etiqueta="Celular chileno (ejemplo: +56 9 1234 5678)"
                  type="tel"
                  value={datos.telefono}
                  onChange={(e) => cambiar("telefono", e.target.value)}
                  error={errores.telefono}
                  autoComplete="tel"
                  inputMode="tel"
                  required
                />
                <p
                  id="checkout-entrega-ayuda"
                  className="flex items-start gap-2 rounded-lg bg-verde-suave p-3 text-sm font-medium text-verde-oscuro"
                >
                  <Truck size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span>
                    Despacho a domicilio en {despacho?.plazo ?? PLAZO_DESPACHO}. Gratis en compras
                    sobre{" "}
                    {(despacho?.gratisDesde ?? DESPACHO_GRATIS_DESDE) === null
                      ? "el monto mínimo"
                      : formatoPrecio((despacho?.gratisDesde ?? DESPACHO_GRATIS_DESDE) as number)}
                    .
                  </span>
                </p>
                {!despacho && (
                  <p role="alert" className="rounded-lg border border-error p-3 text-sm text-error">
                    No pudimos cargar las comunas con despacho. Recarga la página para intentarlo de
                    nuevo.
                  </p>
                )}
                {direcciones.length > 0 && (
                  <SelectorDireccion
                    direcciones={direcciones}
                    elegida={eleccion}
                    onElegir={elegirDireccion}
                    comunasAtendidas={comunasAtendidas}
                  />
                )}
                {mostrarCampos && (
                  <div className="space-y-4 rounded-lg bg-gris-fondo p-4">
                    <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                      <CampoTexto
                        id="checkout-calle"
                        etiqueta="Calle"
                        value={datos.calle}
                        onChange={(e) => cambiar("calle", e.target.value)}
                        error={errores.calle}
                        autoComplete="address-line1"
                        required
                      />
                      <CampoTexto
                        id="checkout-numero"
                        etiqueta="Número"
                        value={datos.numero}
                        onChange={(e) => cambiar("numero", e.target.value)}
                        error={errores.numero}
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <CampoComuna
                        prefijo="checkout"
                        zonas={zonas}
                        comuna={datos.comuna}
                        region={datos.region}
                        onElegir={elegirComuna}
                        error={errores.comuna}
                      />
                    </div>
                    <CampoTexto
                      id="checkout-referencia"
                      etiqueta="Referencia (opcional)"
                      value={datos.referencia}
                      onChange={(e) => cambiar("referencia", e.target.value)}
                    />
                    {usuario && direcciones.length < MAX_DIRECCIONES && (
                      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm [&_input]:accent-verde">
                        <input
                          type="checkbox"
                          className="size-5"
                          checked={guardarNueva}
                          onChange={(e) => setGuardarNueva(e.target.checked)}
                        />
                        Guardar esta dirección en mi cuenta
                      </label>
                    )}
                  </div>
                )}
                <button type="submit" className={claseBoton("primario", "lg", "w-full sm:w-auto")}>
                  Continuar al pago
                </button>
              </form>
            ) : (
              <form key="pago" onSubmit={pagar} className="entrada-paso space-y-5">
                <div className="rounded-lg bg-gris-fondo p-4 text-sm">
                  <p className="font-bold">Tus datos</p>
                  <p>
                    {datos.nombre} · {datos.correo} · {datos.telefono}
                  </p>
                  <p>
                    Despacho: {datos.calle} {datos.numero}, {datos.comuna}, {datos.region}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm font-bold">Método de pago</p>
                  <div className="flex min-h-11 items-center gap-3 rounded-lg border border-verde bg-verde-suave p-3">
                    <CreditCard
                      size={20}
                      aria-hidden="true"
                      className="shrink-0 text-verde-oscuro"
                    />
                    <span>
                      Webpay Plus <span className="text-gris-medio">(Transbank)</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => irAlPaso("datos")}
                    className={claseBoton("contorno", "lg")}
                  >
                    Volver a mis datos
                  </button>
                  <button
                    type="submit"
                    disabled={enviando || cotizando || !cotizacion || cotizacion.total === null}
                    aria-busy={enviando}
                    className={claseBoton("primario", "lg")}
                  >
                    {enviando ? (
                      <>
                        <Loader2 size={18} aria-hidden="true" className="animate-spin" />
                        Procesando pago…
                      </>
                    ) : (
                      "Pagar"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <ResumenCheckout
            items={lineasResumen}
            subtotal={subtotalResumen}
            despacho={cotizacion?.despacho ?? null}
            total={cotizacion?.total ?? null}
            despachoPendiente={despachoPendiente}
            calculando={cotizando}
            faltaParaGratis={cotizacion?.faltaParaGratis}
          />
        </div>
      </div>
    </>
  );
}
