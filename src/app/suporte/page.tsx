import SupportClientPage from "./support-client-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Suporte Trabalhaí",
  description:
    "Abra chamados e fale diretamente com o time do Trabalhaí para reportar problemas ou tirar dúvidas.",
  path: "/suporte",
  keywords: [
    "suporte trabalhai",
    "ajuda trabalhai",
    "central de suporte",
    "contato trabalhai",
  ],
});

export default function SupportPage() {
  return <SupportClientPage />;
}
