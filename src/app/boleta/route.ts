import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { boletaPedidoApi, boletaPublicaApi, type BoletaPdf } from "@/lib/data/pedidos-api";
import type { ResultadoApi } from "@/lib/data/cliente-api";
import { leerTokenSesion } from "@/lib/sesion";

/**
 * Descarga de la boleta electrónica (PDF). Los tokens viajan en cookies HttpOnly, por eso el PDF
 * se pide desde el servidor de Next: el navegador nunca ve ni envía el token a la API.
 *   GET  /boleta?pedido=<id>          → dueño con sesión, o quien hizo la compra en este navegador
 *   POST /boleta { numero, correo }   → seguimiento público
 */

function responder(r: ResultadoApi<BoletaPdf>) {
  if (!r.ok) {
    const status = r.status === 404 || r.status === 400 || r.status === 429 ? r.status : 502;
    return NextResponse.json({ error: r.mensaje }, { status, headers: { "Cache-Control": "no-store" } });
  }
  return new NextResponse(r.data.pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${r.data.nombre.replace(/[^\w.-]/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("pedido") ?? "";
  if (!id || id.length > 100) return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  const almacen = await cookies();
  return responder(
    await boletaPedidoApi(id, {
      sesion: await leerTokenSesion(),
      pedido: almacen.get(`sedyjo_pedido_${id}`)?.value ?? null,
    }),
  );
}

export async function POST(req: NextRequest) {
  const cuerpo = (await req.json().catch(() => null)) as { numero?: unknown; correo?: unknown } | null;
  const numero = typeof cuerpo?.numero === "string" ? cuerpo.numero.trim() : "";
  const correo = typeof cuerpo?.correo === "string" ? cuerpo.correo.trim() : "";
  if (!numero || !correo || numero.length > 40 || correo.length > 120) {
    return NextResponse.json({ error: "Faltan el número de pedido y el correo." }, { status: 400 });
  }
  return responder(await boletaPublicaApi(numero, correo));
}
