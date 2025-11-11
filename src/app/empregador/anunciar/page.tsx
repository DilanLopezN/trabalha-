import { Suspense } from "react";
import CriarAnuncioPage from "./CriarAnuncio";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CriarAnuncioPage />
    </Suspense>
  );
}
