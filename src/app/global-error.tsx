"use client";

/**
 * Último recurso: se muestra si falla el diseño base de la tienda. Reemplaza al layout, así que
 * no cuenta con los estilos globales y lleva los suyos en línea.
 */
export default function ErrorGlobal({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#ffffff",
          color: "#1f2933",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
        }}
      >
        <main style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ color: "#2e7d5b", fontSize: 32, margin: "0 0 12px" }}>Comercial Sedyjo</h1>
          <h2 style={{ fontSize: 22, margin: "0 0 12px" }}>Algo salió mal</h2>
          <p style={{ color: "#566070", lineHeight: 1.5 }}>
            No pudimos cargar la tienda. Intenta de nuevo en un momento.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 16,
              height: 48,
              padding: "0 28px",
              border: 0,
              borderRadius: 8,
              background: "#2e7d5b",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
