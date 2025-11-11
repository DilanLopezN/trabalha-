import { Suspense } from "react";
import FavoritosPage from "./Favorito";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <FavoritosPage />
    </Suspense>
  );
}
