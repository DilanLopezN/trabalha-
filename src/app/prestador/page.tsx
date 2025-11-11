import { Suspense } from "react";
import PrestadorPage from "./Prestador";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PrestadorPage />
    </Suspense>
  );
}
