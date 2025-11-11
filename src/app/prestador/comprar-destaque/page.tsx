import { Suspense } from "react";
import ComprarDestaquePage from "./ComprarDestaque";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ComprarDestaquePage />
    </Suspense>
  );
}
