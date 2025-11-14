import { Suspense } from "react";
import type { Metadata } from "next";
import EmpregadorPage from "./Empregador";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Área do empregador",
  description:
    "Gerencie vagas, acompanhe candidaturas e destaque seus anúncios na plataforma Trabalhaí.",
  path: "/empregador",
  keywords: [
    "empregador trabalhai",
    "minhas vagas",
    "gestão de vagas",
    "contratar prestadores",
  ],
});

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <EmpregadorPage />
    </Suspense>
  );
}
