import { getCampanaModal } from "@/lib/data";
import { ModalOfertaEspecial } from "./ModalOfertaEspecial";

/**
 * Pide la campaña del modal y, si el administrador la activó, monta el modal.
 * En desarrollo también se monta apagada para poder previsualizarla (`?promo=simple|galeria`).
 */
export async function SeccionModalPromocion() {
  const permitirPrevisualizar = process.env.NODE_ENV !== "production";
  const campana = await getCampanaModal({ incluirInactiva: permitirPrevisualizar });

  if (!campana) return null;
  return <ModalOfertaEspecial campana={campana} permitirPrevisualizar={permitirPrevisualizar} />;
}
