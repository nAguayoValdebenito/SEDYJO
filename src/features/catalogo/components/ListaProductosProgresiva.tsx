"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { claseBoton } from "@/components/ui/boton";
import { RevelarGrupo } from "@/components/ui/Revelar";
import { cn } from "@/lib/utils/cn";
import type { Producto } from "@/types";
import { EsqueletoTarjetaProducto } from "./Esqueletos";
import { TarjetaProducto } from "./TarjetaProducto";

type Props = {
  productos: Producto[];
  /** Cuántos productos se suman por vez en celular y tablet. */
  lote?: number;
};

/** Cargas automáticas por scroll antes de pedir un toque en "Ver más" (así el pie siempre se alcanza). */
const CARGAS_AUTOMATICAS_MAX = 3;
/** Pausa que simula la espera de datos y deja ver los esqueletos. */
const ESPERA_SIMULADA_MS = 450;

const clasesGrilla =
  "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] lg:gap-4";

/**
 * Listado de productos que en celular y tablet (<1024 px) se carga por lotes mientras se baja:
 * primero un lote, y al acercarse al final llegan esqueletos y luego el siguiente lote con una
 * entrada escalonada. Hay un botón "Ver más productos" de respaldo y un aviso para lectores de
 * pantalla. En escritorio se ve la rejilla completa.
 * Todos los productos están en el HTML (sin JavaScript se ven todos); los que aún no toca
 * mostrar se ocultan solo por debajo de 1024 px.
 */
export function ListaProductosProgresiva({ productos, lote = 6 }: Props) {
  const total = productos.length;
  const [visibles, setVisibles] = useState(lote);
  const [desde, setDesde] = useState(lote);
  const [cargando, setCargando] = useState(false);
  const [anuncio, setAnuncio] = useState("");

  const visiblesRef = useRef(visibles);
  const cargandoRef = useRef(false);
  const cargasAuto = useRef(0);
  const centinela = useRef<HTMLDivElement>(null);

  useEffect(() => {
    visiblesRef.current = visibles;
  }, [visibles]);

  const cargarMas = useCallback(() => {
    if (cargandoRef.current || visiblesRef.current >= total) return;
    cargandoRef.current = true;
    setCargando(true);

    window.setTimeout(() => {
      const antes = visiblesRef.current;
      const despues = Math.min(antes + lote, total);
      setDesde(antes);
      setVisibles(despues);
      setCargando(false);
      cargandoRef.current = false;
      setAnuncio(`Se cargaron ${despues - antes} productos más. Mostrando ${despues} de ${total}.`);
    }, ESPERA_SIMULADA_MS);
  }, [lote, total]);

  // Carga automática al acercarse al final (solo celular y tablet, con tope).
  useEffect(() => {
    const el = centinela.current;
    if (!el || total <= lote) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada?.isIntersecting) return;
        if (!window.matchMedia("(max-width: 1023px)").matches) return;
        if (cargasAuto.current >= CARGAS_AUTOMATICAS_MAX) return;
        cargasAuto.current += 1;
        cargarMas();
      },
      { rootMargin: "0px 0px 160px 0px" },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [cargarMas, lote, total, visibles]);

  const quedan = visibles < total;

  return (
    <>
      <RevelarGrupo className={clasesGrilla}>
        {productos.map((p, i) => {
          const esNuevo = i >= desde && i < visibles;
          return (
            <TarjetaProducto
              key={p.id}
              producto={p}
              nivelTitulo={2}
              className={cn(i >= visibles && "max-lg:hidden", esNuevo && "entrada-lote")}
              style={esNuevo ? ({ "--i": i - desde } as CSSProperties) : undefined}
            />
          );
        })}
        {cargando &&
          Array.from({ length: Math.min(lote, total - visibles) }, (_, i) => (
            <div key={`esqueleto-${i}`} className="lg:hidden">
              <EsqueletoTarjetaProducto />
            </div>
          ))}
      </RevelarGrupo>

      {total > lote && (
        <div className="lg:hidden">
          <div ref={centinela} aria-hidden="true" className="h-px" />
          <span role="status" className="sr-only">
            {anuncio}
          </span>
          {quedan ? (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                disabled={cargando}
                onClick={cargarMas}
                className={claseBoton("contorno", "lg", "w-full sm:w-auto")}
              >
                {cargando ? "Cargando…" : `Ver más productos (${visibles} de ${total})`}
              </button>
            </div>
          ) : (
            <p className="mt-5 text-center text-sm text-gris-texto">
              Ya viste los {total} productos.
            </p>
          )}
        </div>
      )}
    </>
  );
}
