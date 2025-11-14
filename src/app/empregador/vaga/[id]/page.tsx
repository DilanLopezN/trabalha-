import type { Metadata } from "next";
import VagaCandidatosClientPage from "./vaga-candidatos-client";
import { buildMetadata } from "@/lib/seo";

type PageParams = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;

  return buildMetadata({
    title: "Candidatos da vaga",
    description:
      "Visualize e gerencie os profissionais que se candidataram às suas oportunidades no Trabalhaí.",
    path: `/empregador/vaga/${id}`,
    keywords: [
      "candidatos vaga",
      "gestão de candidatos",
      "empregador trabalhai",
      "processo seletivo",
    ],
  });
}

export default function VagaCandidatosPage() {
  return <VagaCandidatosClientPage />;
}
