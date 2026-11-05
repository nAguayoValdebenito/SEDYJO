import type { Metadata } from "next";
import { Suspense } from "react";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { LibretaDirecciones } from "@/features/cuenta/components/LibretaDirecciones";
import { getDespacho } from "@/lib/data";

export const metadata: Metadata = { title: "Mis direcciones" };

/** Las comunas con despacho vienen de la API: la comuna de cada dirección se elige de esa lista. */
async function LibretaConComunas() {
  const despacho = await getDespacho();
  return <LibretaDirecciones zonas={despacho?.zonas ?? []} />;
}

export default function PaginaDirecciones() {
  return (
    <>
      <EncabezadoSeccion titulo="Direcciones" nivel={1} />
      <Suspense fallback={<Esqueleto className="h-40 w-full max-w-xl rounded-[10px]" />}>
        <LibretaConComunas />
      </Suspense>
    </>
  );
}
