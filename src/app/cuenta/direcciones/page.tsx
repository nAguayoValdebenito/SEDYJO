import type { Metadata } from "next";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { LibretaDirecciones } from "@/features/cuenta/components/LibretaDirecciones";

export const metadata: Metadata = { title: "Mis direcciones" };

export default function PaginaDirecciones() {
  return (
    <>
      <EncabezadoSeccion titulo="Direcciones" nivel={1} />
      <LibretaDirecciones />
    </>
  );
}
