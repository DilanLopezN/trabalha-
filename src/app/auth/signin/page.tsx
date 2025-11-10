import { Suspense } from "react";
import SignInPage from "./signin";

export default function SignInWrapper() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SignInPage />
    </Suspense>
  );
}
