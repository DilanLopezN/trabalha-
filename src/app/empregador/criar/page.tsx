import CriarVagaClientPage from "./criar-vaga-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Criar vaga",
  description:
    "Cadastre uma nova vaga no Trabalhaí e alcance prestadores qualificados para a sua necessidade.",
  path: "/empregador/criar",
  keywords: [
    "criar vaga",
    "anunciar vaga",
    "empregador trabalhai",
    "contratar profissionais",
  ],
});

export default function CriarVagaPage() {
  return <CriarVagaClientPage />;
}
