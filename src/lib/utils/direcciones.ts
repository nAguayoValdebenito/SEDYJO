import type { DireccionGuardada } from "@/types";

export type EntradaDireccionLibreta = Omit<DireccionGuardada, "id" | "principal">;

/** Máximo de direcciones guardadas por cliente. */
export const MAX_DIRECCIONES = 5;

/** La dirección principal (la primera si por algún motivo ninguna está marcada). */
export function direccionPrincipal(lista: DireccionGuardada[]): DireccionGuardada | null {
  return lista.find((d) => d.principal) ?? lista[0] ?? null;
}

/** Deja exactamente una principal: la indicada, o la primera si no hay ninguna. */
function normalizar(lista: DireccionGuardada[], principalId?: string): DireccionGuardada[] {
  if (lista.length === 0) return lista;
  const elegida =
    principalId && lista.some((d) => d.id === principalId)
      ? principalId
      : (lista.find((d) => d.principal)?.id ?? lista[0]!.id);
  return lista.map((d) => ({ ...d, principal: d.id === elegida }));
}

/** Agrega una dirección. La primera que se guarda queda como principal. */
export function agregarDireccion(
  lista: DireccionGuardada[],
  entrada: EntradaDireccionLibreta,
  id: string,
  hacerPrincipal = false,
): DireccionGuardada[] {
  if (lista.length >= MAX_DIRECCIONES) return lista;
  const nueva: DireccionGuardada = { ...entrada, id, principal: false };
  return normalizar([...lista, nueva], hacerPrincipal || lista.length === 0 ? id : undefined);
}

/** Reemplaza los datos de una dirección sin cambiar su id ni si es la principal. */
export function editarDireccion(
  lista: DireccionGuardada[],
  id: string,
  entrada: EntradaDireccionLibreta,
): DireccionGuardada[] {
  return lista.map((d) => (d.id === id ? { ...entrada, id, principal: d.principal } : d));
}

/** Quita una dirección; si era la principal, la primera que queda pasa a serlo. */
export function eliminarDireccion(lista: DireccionGuardada[], id: string): DireccionGuardada[] {
  return normalizar(lista.filter((d) => d.id !== id));
}

export function marcarPrincipal(lista: DireccionGuardada[], id: string): DireccionGuardada[] {
  return normalizar(lista, id);
}

const limpiar = (texto: string) => texto.trim().toLowerCase().replace(/\s+/g, " ");

/** Dos direcciones son la misma si coinciden calle, número, comuna y región. */
export function mismaDireccion(
  a: Pick<DireccionGuardada, "calle" | "numero" | "comuna" | "region">,
  b: Pick<DireccionGuardada, "calle" | "numero" | "comuna" | "region">,
): boolean {
  return (
    limpiar(a.calle) === limpiar(b.calle) &&
    limpiar(a.numero) === limpiar(b.numero) &&
    limpiar(a.comuna) === limpiar(b.comuna) &&
    limpiar(a.region) === limpiar(b.region)
  );
}
