import type { Metadata } from "next";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { AvisoModoDemostracion } from "@/features/auth/components/AvisoModoDemostracion";
import { FormularioContrasena } from "@/features/cuenta/components/FormularioContrasena";
import { FormularioPerfil } from "@/features/cuenta/components/FormularioPerfil";

export const metadata: Metadata = { title: "Mi perfil" };

export default function PaginaPerfil() {
  return (
    <>
      <EncabezadoSeccion titulo="Mi perfil" nivel={1} />
      <div className="flex flex-col gap-10">
        <section aria-labelledby="titulo-datos" className="flex flex-col gap-4">
          <h2 id="titulo-datos" className="font-titulos text-xl font-extrabold">
            Tus datos
          </h2>
          <FormularioPerfil />
        </section>
        <section aria-labelledby="titulo-clave" className="flex flex-col gap-4">
          <h2 id="titulo-clave" className="font-titulos text-xl font-extrabold">
            Cambiar contraseña
          </h2>
          <div className="max-w-lg">
            <AvisoModoDemostracion etiqueta="Modo demostración: contraseña">
              Para probar un error escribe <strong>incorrecta</strong> como contraseña actual.
            </AvisoModoDemostracion>
          </div>
          <FormularioContrasena />
        </section>
      </div>
    </>
  );
}
