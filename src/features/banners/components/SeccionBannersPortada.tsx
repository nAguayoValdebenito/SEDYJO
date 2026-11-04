import { getBanners } from "@/lib/data";
import { BannerOscuro } from "./BannerOscuro";
import { BannerPrincipal } from "./BannerPrincipal";

/** Portada: banner principal a la izquierda y dos banners oscuros apilados (en celular, deslizables). */
export async function SeccionBannersPortada() {
  const { principales, oscuros } = await getBanners();
  if (principales.length === 0 && oscuros.length === 0) return null;

  return (
    <div className="grid gap-2.5 sm:gap-4 lg:grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))]">
      {principales.length > 0 && <BannerPrincipal banners={principales} />}
      {/* En celular es una tira deslizable: se enfoca con teclado para poder desplazarla con las flechas. */}
      {oscuros.length > 0 && (
        <div
          tabIndex={0}
          role="group"
          aria-label="Ofertas destacadas"
          className="-mx-3 flex snap-x scroll-px-3 gap-2.5 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:p-0 lg:grid-cols-1 lg:grid-rows-2"
        >
          {oscuros.map((b) => (
            <BannerOscuro key={b.id} banner={b} />
          ))}
        </div>
      )}
    </div>
  );
}
