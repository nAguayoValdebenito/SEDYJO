import type { Metadata } from "next";
import { Suspense } from "react";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { DetallePedido } from "@/features/pedidos/components/DetallePedido";

export const metadata: Metadata = { title: "Detalle del pedido" };

async function Detalle({ params }: PageProps<"/cuenta/pedidos/[id]">) {
  const { id } = await params;
  return <DetallePedido id={id} />;
}

export default function PaginaDetallePedido(props: PageProps<"/cuenta/pedidos/[id]">) {
  return (
    <Suspense fallback={<Esqueleto className="h-64 w-full rounded-[10px]" />}>
      <Detalle {...props} />
    </Suspense>
  );
}
