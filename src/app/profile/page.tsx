import ProfileClientPage from "./profile-client-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Meu Perfil",
  description:
    "Atualize seus dados pessoais, endereço e disponibilidade para destacar seus serviços no Trabalhaí.",
  path: "/profile",
  keywords: [
    "perfil trabalhai",
    "configurar perfil",
    "dados profissionais",
    "agenda de serviços",
  ],
});

export default function ProfilePage() {
  return <ProfileClientPage />;
}
