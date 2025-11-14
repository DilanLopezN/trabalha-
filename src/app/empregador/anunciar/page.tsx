import { Suspense } from "react";
import type { Metadata } from "next";
import CriarAnuncioPage from "./CriarAnuncio";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Anunciar oportunidade",
  description:
    "Crie anúncios patrocinados para dar mais visibilidade às suas vagas e alcançar profissionais com rapidez.",
  path: "/empregador/anunciar",
  keywords: [
    "anunciar vaga",
    "destacar anúncio",
    "patrocinar vaga",
    "empregador trabalhai",
  ],
});

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CriarAnuncioPage />
    </Suspense>
  );
}
