import DashboardClientPage from "./dashboard-client-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Painel",
  description:
    "Acompanhe resultados, vagas e recomendações personalizadas no painel do Trabalhaí.",
  path: "/dashboard",
  keywords: [
    "painel trabalhai",
    "dashboard trabalhai",
    "gestão de vagas",
    "prestadores de serviços",
  ],
});

export default function DashboardPage() {
  return <DashboardClientPage />;
}
