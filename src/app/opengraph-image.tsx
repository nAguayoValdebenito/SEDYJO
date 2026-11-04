import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { DESPACHO_GRATIS_DESDE, NOMBRE_SITIO, PLAZO_DESPACHO } from "@/lib/config";
import { formatoPrecio } from "@/lib/utils/format";

export const alt = `${NOMBRE_SITIO} | Supermercado online en San Pedro de la Paz`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen que se ve al compartir la tienda en redes y mensajería (1200×630). */
export default async function ImagenParaCompartir() {
  const logo = await readFile(join(process.cwd(), "src/app/apple-icon.png"));
  const logoDatos = `data:image/png;base64,${logo.toString("base64")}`;
  const monto =
    DESPACHO_GRATIS_DESDE === null ? "" : ` sobre ${formatoPrecio(DESPACHO_GRATIS_DESDE)}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#17382a",
        color: "#ffffff",
        padding: "64px 72px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoDatos} width={120} height={120} alt="" style={{ borderRadius: 60 }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#a8d8bf" }}>COMERCIAL</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1 }}>SEDYJO</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, maxWidth: 940 }}>
          Tu supermercado de siempre, ahora online
        </div>
        <div style={{ fontSize: 32, color: "#d9efe4" }}>
          Abarrotes, confitería, bebidas, aseo e higiene en San Pedro de la Paz
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "flex",
            background: "#ffc83d",
            color: "#0b0b0f",
            fontSize: 40,
            fontWeight: 800,
            padding: "10px 28px",
            borderRadius: 14,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          DESPACHO GRATIS
        </div>
        <div style={{ fontSize: 28, whiteSpace: "nowrap" }}>
          {`Compras${monto} · Entrega en ${PLAZO_DESPACHO}`}
        </div>
      </div>
    </div>,
    { ...size },
  );
}
