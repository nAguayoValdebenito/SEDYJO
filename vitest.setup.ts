// localStorage en memoria para probar el carrito (persistido) fuera del navegador.
const datos = new Map<string, string>();

globalThis.localStorage = {
  getItem: (clave: string) => datos.get(clave) ?? null,
  setItem: (clave: string, valor: string) => void datos.set(clave, String(valor)),
  removeItem: (clave: string) => void datos.delete(clave),
  clear: () => datos.clear(),
  key: (indice: number) => [...datos.keys()][indice] ?? null,
  get length() {
    return datos.size;
  },
} as Storage;
