/**
 * Efectos del momento "Agregar al carrito": una burbuja sube desde el botón hasta el
 * carrito del header, el carrito hace un pulso y salen burbujitas. Solo usa transform y
 * opacity, se limpia sola. Se muestra siempre, aunque el sistema pida reducir el movimiento.
 */

const EASE_SALIDA = "cubic-bezier(0.16, 1, 0.3, 1)";
const DURACION_VUELO_MS = 560;
const TAMANO_BURBUJA = 22;

function crearBurbuja(tamano: number, tema: "claro" | "oscuro"): HTMLSpanElement {
  const burbuja = document.createElement("span");
  burbuja.className = "burbuja-vuelo";
  burbuja.dataset.tema = tema;
  burbuja.setAttribute("aria-hidden", "true");
  burbuja.style.width = `${tamano}px`;
  burbuja.style.height = `${tamano}px`;
  return burbuja;
}

function pulsarCarrito(destino: HTMLElement) {
  destino.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }],
    { duration: 340, easing: EASE_SALIDA },
  );
  destino
    .querySelector<HTMLElement>("[data-carrito-badge]")
    ?.animate([{ transform: "scale(1)" }, { transform: "scale(1.4)" }, { transform: "scale(1)" }], {
      duration: 380,
      easing: EASE_SALIDA,
    });
}

/** Seis burbujitas que se abren desde el carrito y se desvanecen. */
function estallar(destino: HTMLElement, tema: "claro" | "oscuro") {
  const caja = destino.getBoundingClientRect();
  const x = caja.left + caja.width / 2;
  const y = caja.top + caja.height / 2;

  for (let i = 0; i < 6; i++) {
    const angulo = (Math.PI * 2 * i) / 6 + Math.PI / 6;
    const distancia = 26 + (i % 2) * 8;
    const tamano = 7 + (i % 3) * 2;
    const burbuja = crearBurbuja(tamano, tema);
    burbuja.style.left = `${x - tamano / 2}px`;
    burbuja.style.top = `${y - tamano / 2}px`;
    document.body.appendChild(burbuja);

    const animacion = burbuja.animate(
      [
        { transform: "translate(0, 0) scale(0.6)", opacity: 0.95 },
        {
          transform: `translate(${Math.cos(angulo) * distancia}px, ${Math.sin(angulo) * distancia}px) scale(1)`,
          opacity: 0,
        },
      ],
      { duration: 480, easing: EASE_SALIDA },
    );
    animacion.onfinish = () => burbuja.remove();
    animacion.oncancel = () => burbuja.remove();
  }
}

/** Lanza la burbuja desde `origen` hacia el elemento marcado con `data-carrito-destino`. */
export function volarAlCarrito(origen: HTMLElement, tema: "claro" | "oscuro" = "claro") {
  const destino = document.querySelector<HTMLElement>("[data-carrito-destino]");
  if (!destino) return;

  const desde = origen.getBoundingClientRect();
  const hasta = destino.getBoundingClientRect();
  const x0 = desde.left + desde.width / 2;
  const y0 = desde.top + desde.height / 2;
  const dx = hasta.left + hasta.width / 2 - x0;
  // Si el header ya salió de pantalla, la burbuja sube hasta el borde superior.
  const dy = Math.max(hasta.top + hasta.height / 2, 12) - y0;

  const burbuja = crearBurbuja(TAMANO_BURBUJA, tema);
  burbuja.style.left = `${x0 - TAMANO_BURBUJA / 2}px`;
  burbuja.style.top = `${y0 - TAMANO_BURBUJA / 2}px`;
  document.body.appendChild(burbuja);

  const animacion = burbuja.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      {
        transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 70}px) scale(1.15)`,
        opacity: 1,
        offset: 0.45,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0.9 },
    ],
    { duration: DURACION_VUELO_MS, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  );

  animacion.onfinish = () => {
    burbuja.remove();
    pulsarCarrito(destino);
    estallar(destino, "claro");
  };
  animacion.oncancel = () => burbuja.remove();
}
