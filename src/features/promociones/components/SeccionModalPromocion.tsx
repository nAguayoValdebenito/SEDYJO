import { getCampanaModal } from "@/lib/data";
import { ModalOfertaEspecial } from "./ModalOfertaEspecial";

/**
 * Pide la campaña del modal (los banners `modal` vigentes de la API) y, si hay, monta el modal.
 * En desarrollo se puede previsualizar con `?promo=simple|galeria`.
 */
export async function SeccionModalPromocion() {
  const permitirPrevisualizar = process.env.NODE_ENV !== "production";
  const campana = await getCampanaModal();

  if (!campana) return null;
  return <ModalOfertaEspecial campana={campana} permitirPrevisualizar={permitirPrevisualizar} />;
}
