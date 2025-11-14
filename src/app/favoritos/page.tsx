import { Suspense } from "react";
import type { Metadata } from "next";
import FavoritosPage from "./Favorito";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Favoritos",
  description:
    "Acesse a lista de profissionais e oportunidades que você salvou para acompanhar depois no Trabalhaí.",
  path: "/favoritos",
  keywords: [
    "favoritos trabalhai",
    "profissionais salvos",
    "vagas salvas",
    "lista de favoritos",
  ],
});

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <FavoritosPage />
    </Suspense>
  );
}
