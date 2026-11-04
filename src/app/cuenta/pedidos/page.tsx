import type { Metadata } from "next";
import { HistorialPedidos } from "@/features/pedidos/components/HistorialPedidos";

export const metadata: Metadata = { title: "Mis pedidos" };

export default function PaginaMisPedidos() {
  return <HistorialPedidos />;
}
