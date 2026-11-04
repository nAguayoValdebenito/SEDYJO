import type { Metadata } from "next";
import { ResumenCuenta } from "@/features/pedidos/components/ResumenCuenta";

export const metadata: Metadata = { title: "Mi cuenta" };

export default function PaginaCuenta() {
  return <ResumenCuenta />;
}
