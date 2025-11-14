import { Suspense } from "react";
import type { Metadata } from "next";
import SignInPage from "./signin";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Entrar ou cadastrar",
  description:
    "Acesse sua conta Trabalhaí ou cadastre-se para encontrar profissionais e oportunidades de trabalho.",
  path: "/auth/signin",
  keywords: [
    "login trabalhai",
    "cadastro trabalhai",
    "entrar trabalhai",
    "acessar plataforma trabalhai",
  ],
});

export default function SignInWrapper() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SignInPage />
    </Suspense>
  );
}
