import { Suspense } from "react";
import type { Metadata } from "next";
import ComprarDestaquePage from "./ComprarDestaque";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Comprar destaque",
  description:
    "Adquira planos de destaque para posicionar seu perfil entre os primeiros resultados do Trabalhaí.",
  path: "/prestador/comprar-destaque",
  keywords: [
    "destaque trabalhai",
    "plano premium",
    "promover perfil",
    "mais clientes",
  ],
});

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ComprarDestaquePage />
    </Suspense>
  );
}
