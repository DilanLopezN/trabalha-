import { Suspense } from "react";
import EmpregadorPage from "./Empregador";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <EmpregadorPage />
    </Suspense>
  );
}
