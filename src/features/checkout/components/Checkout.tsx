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
import { useHidratado } from "@/features/carrito/useHidratado";
import { DESPACHO_GRATIS_DESDE, PLAZO_DESPACHO, ZONAS_DESPACHO } from "@/lib/config";
import { MAX_DIRECCIONES, direccionPrincipal, mismaDireccion } from "@/lib/utils/direcciones";
import { formatoPrecio } from "@/lib/utils/format";
import { checkoutSchema, erroresCheckoutPorCampo } from "@/lib/validation/checkout";
import type { DatosCheckout } from "@/types";
import { iniciarPago } from "../acciones";
import { useCheckout } from "../store";
import { EsqueletoCheckout } from "./EsqueletoCheckout";
import { IndicadorCheckout } from "./IndicadorCheckout";
import { ResumenCheckout } from "./ResumenCheckout";
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
export function Checkout() {
  const router = useRouter();
  const hidratado = useHidratado();
  const usuario = useSesion((s) => s.usuario);
  const items = useCarrito((s) => s.items);
  const { datos, paso, cambiarDatos, cambiarPaso, guardarToken } = useCheckout();
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const direcciones = useDirecciones(usuario?.id ?? null);
  const guardarEnLibreta = useCuenta((s) => s.agregar);
  const [eleccionManual, setEleccionManual] = useState<string | null>(null);
  const [guardarNueva, setGuardarNueva] = useState(false);
  const resumen = useRef<HTMLDivElement>(null);
  const aviso = useRef<HTMLDivElement>(null);
  const tituloPaso = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (usuario && !datos.nombre && !datos.correo)
      cambiarDatos({ nombre: usuario.nombre, correo: usuario.correo, usuarioId: usuario.id });
  }, [usuario, datos.nombre, datos.correo, cambiarDatos]);

  // Dirección elegida: la que el cliente marcó; si no, la guardada que coincide con lo escrito o
  // la principal (que se completa sola al entrar). Sin direcciones guardadas se escribe una nueva.
  const principal = direccionPrincipal(direcciones);
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
      guardarEnLibreta(usuario.id, {
        etiqueta: direcciones.length === 0 ? "Casa" : `Dirección ${direcciones.length + 1}`,
        calle: datos.calle.trim(),
        numero: datos.numero.trim(),
        comuna: datos.comuna.trim(),
        region: datos.region.trim(),
        referencia: datos.referencia.trim() || null,
      });
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
      const resultado = await iniciarPago(
        entrada,
        items.map(({ productoId, cantidad }) => ({ productoId, cantidad })),
      );
      if (!resultado.ok) {
        setErrores(resultado.campos ?? {});
        setErrorGeneral(resultado.mensaje);
        if (resultado.campos) irAlPaso("datos");
        enfocarError();
        return;
      }
      guardarToken(resultado.token, resultado.resumen);
      router.push("/checkout/pago-simulado");
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
                  etiqueta="Celular chileno"
                  type="tel"
                  value={datos.telefono}
                  onChange={(e) => cambiar("telefono", e.target.value)}
                  error={errores.telefono}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+56 9 1234 5678"
                  required
                />
                <p
                  id="checkout-entrega-ayuda"
                  className="flex items-start gap-2 rounded-lg bg-verde-suave p-3 text-sm font-medium text-verde-oscuro"
                >
                  <Truck size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span>
                    Despacho a domicilio en {PLAZO_DESPACHO}. Gratis en compras sobre{" "}
                    {DESPACHO_GRATIS_DESDE === null
                      ? "el monto mínimo"
                      : formatoPrecio(DESPACHO_GRATIS_DESDE)}
                    .
                  </span>
                </p>
                {direcciones.length > 0 && (
                  <SelectorDireccion
                    direcciones={direcciones}
                    elegida={eleccion}
                    onElegir={elegirDireccion}
                  />
                )}
                {mostrarCampos && (
                  <div className="space-y-4 rounded-lg bg-gris-fondo p-4">
                    {ZONAS_DESPACHO && (
                      <p className="text-sm">Comunas atendidas: {ZONAS_DESPACHO.join(", ")}</p>
                    )}
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
                      <CampoTexto
                        id="checkout-comuna"
                        etiqueta="Comuna"
                        value={datos.comuna}
                        onChange={(e) => cambiar("comuna", e.target.value)}
                        error={errores.comuna}
                        autoComplete="address-level2"
                        required
                      />
                      <CampoTexto
                        id="checkout-region"
                        etiqueta="Región"
                        value={datos.region}
                        onChange={(e) => cambiar("region", e.target.value)}
                        error={errores.region}
                        autoComplete="address-level1"
                        required
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
                      Webpay Plus <span className="text-gris-medio">(Transbank, simulado)</span>
                    </span>
                  </div>
                </div>
                <p className="rounded-lg bg-verde-suave p-3 text-sm font-medium text-verde-oscuro">
                  Modo demostración: no se piden datos de tarjeta ni se realiza un cobro real.
                </p>
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
                    disabled={enviando}
                    aria-busy={enviando}
                    className={claseBoton("primario", "lg")}
                  >
                    {enviando ? (
                      <>
                        <Loader2 size={18} aria-hidden="true" className="animate-spin" />
                        Preparando pago…
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
          <ResumenCheckout items={items} />
        </div>
      </div>
    </>
  );
}
