import { Suspense } from "react";
import type { Metadata } from "next";
import PrestadorPage from "./Prestador";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Área do prestador",
  description:
    "Encontre novas oportunidades, personalize seu perfil e destaque seus serviços na plataforma Trabalhaí.",
  path: "/prestador",
  keywords: [
    "prestador trabalhai",
    "encontrar oportunidades",
    "trabalhos informais",
    "serviços profissionais",
  ],
});

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PrestadorPage />
    </Suspense>
  );
}
