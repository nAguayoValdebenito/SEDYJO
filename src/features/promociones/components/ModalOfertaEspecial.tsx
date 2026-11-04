"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { interaccionVivaBase } from "@/components/ui/boton";
import { FondoDoodlesComercio } from "@/components/ui/FondoDoodlesComercio";
import { cn } from "@/lib/utils/cn";
import type { CampanaModal } from "@/types";
import { debeMostrarse } from "../logica";
import { GaleriaCampana } from "./GaleriaCampana";

type Props = {
  campana: CampanaModal;
  /** Solo en desarrollo: permite verla con `?promo=simple` o `?promo=galeria`. */
  permitirPrevisualizar: boolean;
};

/** Debe coincidir con la duración de la transición del modal. */
const DURACION_MS = 360;
const REINTENTOS_MAX = 3;
const ESPERA_REINTENTO_MS = 3000;

function leerNumero(clave: string): number | null {
  try {
    const valor = window.localStorage.getItem(clave);
    return valor === null ? null : Number(valor);
  } catch {
    return null;
  }
}

function guardar(almacen: "local" | "sesion", clave: string, valor: string) {
  try {
    (almacen === "local" ? window.localStorage : window.sessionStorage).setItem(clave, valor);
  } catch {
    // Sin almacenamiento disponible (modo privado, bloqueado): el modal sigue funcionando.
  }
}

/**
 * Modal de ofertas especiales: una oferta simple o una galería con carrusel, según la campaña
 * que active el administrador. Aparece unos segundos después de cargar, una vez por sesión y
 * no antes de `frecuenciaHoras` tras cerrarlo; nunca sobre el carrito, el pago ni la cuenta,
 * ni mientras otro panel está abierto o el cliente escribe en un campo.
 * Se cierra con el botón, "Ahora no", Escape o un clic fuera. Foco atrapado (`<dialog>` modal).
 */
export function ModalOfertaEspecial({ campana, permitirPrevisualizar }: Props) {
  const pathname = usePathname();
  const parametros = useSearchParams();
  const vista = permitirPrevisualizar ? parametros.get("promo") : null;
  const forzado = vista === "simple" || vista === "galeria";
  const tipo = forzado ? vista : campana.tipo;
  const slides = tipo === "simple" ? campana.slides.slice(0, 1) : campana.slides;

  const [abierto, setAbierto] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);

  const claveCierre = `sedyjo-promo-cierre-${campana.id}`;
  const claveVista = `sedyjo-promo-vista-${campana.id}`;

  const cerrar = () => {
    guardar("local", claveCierre, String(Date.now()));
    setAbierto(false);
  };

  // Espera unos segundos tras cargar la página y decide si corresponde mostrarlo.
  useEffect(() => {
    if (abierto) return;
    let id: number | undefined;

    const intentar = (reintento: number) => {
      // Otro panel (carrito lateral) ya está abierto: no se encima.
      if (document.querySelector("dialog[open]")) return;

      const activo = document.activeElement;
      const escribiendo = !!activo && /^(INPUT|TEXTAREA|SELECT)$/.test(activo.tagName);
      if (!forzado && escribiendo && reintento < REINTENTOS_MAX) {
        id = window.setTimeout(() => intentar(reintento + 1), ESPERA_REINTENTO_MS);
        return;
      }

      const mostrar =
        forzado ||
        debeMostrarse({
          campana,
          ahora: Date.now(),
          ultimoCierre: leerNumero(claveCierre),
          vistaEnSesion: (() => {
            try {
              return window.sessionStorage.getItem(claveVista) === "1";
            } catch {
              return false;
            }
          })(),
          pathname,
        });

      if (mostrar) {
        guardar("sesion", claveVista, "1");
        setAbierto(true);
      }
    };

    id = window.setTimeout(() => intentar(0), (forzado ? 1 : campana.retrasoSegundos) * 1000);
    return () => window.clearTimeout(id);
  }, [abierto, campana, claveCierre, claveVista, forzado, pathname]);

  // Abre y cierra el <dialog> con transición de entrada y de salida.
  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;

    if (abierto) {
      if (!d.open) d.showModal();
      document.documentElement.style.overflow = "hidden";
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          d.dataset.visible = "true";
        }),
      );
      return () => cancelAnimationFrame(id);
    }

    d.dataset.visible = "false";
    document.documentElement.style.overflow = "";
    const id = window.setTimeout(() => {
      if (d.open) d.close();
    }, DURACION_MS);
    return () => window.clearTimeout(id);
  }, [abierto]);

  return (
    <dialog
      ref={dialogo}
      aria-label={
        tipo === "galeria" && slides.length > 1 ? "Ofertas especiales" : "Oferta especial"
      }
      data-visible="false"
      onCancel={(e) => {
        e.preventDefault();
        cerrar();
      }}
      onClose={() => setAbierto(false)}
      onClick={(e) => {
        // Un clic sobre el fondo oscurecido llega al propio <dialog>.
        if (e.target === e.currentTarget) cerrar();
      }}
      className={cn(
        "relative m-auto max-h-[92dvh] w-[min(92vw,520px)] overflow-hidden rounded-2xl bg-negro p-0 text-white",
        "shadow-[0_30px_70px_-30px_rgb(0_0_0/0.8)]",
        "scale-95 translate-y-3 opacity-0 transition-[opacity,scale,translate] duration-[360ms] ease-[var(--ease-salida)]",
        "data-[visible=true]:translate-y-0 data-[visible=true]:scale-100 data-[visible=true]:opacity-100",
        "backdrop:bg-negro/70 backdrop:opacity-0 backdrop:transition-opacity backdrop:duration-[360ms] data-[visible=true]:backdrop:opacity-100",
        "",
      )}
    >
      <FondoDoodlesComercio />

      <div className="sobre-oscuro relative max-h-[92dvh] overflow-y-auto overscroll-contain">
        <button
          type="button"
          aria-label="Cerrar oferta"
          onClick={cerrar}
          className={cn(
            "absolute right-3 top-3 z-10 flex size-11 items-center justify-center rounded-full bg-negro/75 text-white hover:bg-negro hover:text-oro",
            interaccionVivaBase,
          )}
        >
          <X size={22} aria-hidden="true" />
        </button>

        <GaleriaCampana slides={slides} alElegirEnlace={cerrar} />

        <div className="flex justify-center pb-4 pt-1">
          <button
            type="button"
            onClick={cerrar}
            className="min-h-11 rounded-lg px-4 text-sm text-gris-claro underline-offset-4 transition-colors duration-200 hover:text-white hover:underline"
          >
            Ahora no, gracias
          </button>
        </div>
      </div>
    </dialog>
  );
}
