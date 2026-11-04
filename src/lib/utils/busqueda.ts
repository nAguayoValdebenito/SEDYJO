/** Minúsculas y sin tildes: "Confitería" y "confiteria" son lo mismo al buscar. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** Todas las palabras de la consulta deben aparecer en alguno de los textos. */
export function coincideBusqueda(
  textos: Array<string | null | undefined>,
  consulta: string,
): boolean {
  const palabras = normalizarTexto(consulta).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return true;

  const pajar = normalizarTexto(textos.filter(Boolean).join(" "));
  return palabras.every((palabra) => pajar.includes(palabra));
}
