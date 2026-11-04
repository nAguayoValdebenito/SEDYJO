import { cacheLife } from "next/cache";
import { bannersSchema } from "@/lib/validation/schemas";
import type { Banner, BannerOscuro } from "@/types";
import bannersMock from "./mock/banners.json";

type Banners = { principales: Banner[]; oscuros: BannerOscuro[] };

export async function getBanners(): Promise<Banners> {
  "use cache";
  cacheLife("hours");

  return bannersSchema.parse(bannersMock);
}
