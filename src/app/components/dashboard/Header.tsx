"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/app/components/Button";

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Limpar qualquer storage local se necessário
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Fazer logout e redirecionar para home
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 hidden sm:inline">
              Trabalhaí
            </span>
          </Link>

          {/* Navegação desktop */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-primary-600 font-medium px-3 py-2 hover:bg-primary-50 rounded-lg transition-colors"
            >
              Dashboard
            </Link>

            {session?.user?.role === "PRESTADOR" && (
              <>
                <Link
                  href="/prestador"
                  className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors px-3 py-2 rounded-lg"
                >
                  Meus Anúncios
                </Link>
                <Link
                  href="/favoritos"
                  className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors px-3 py-2 rounded-lg"
                >
                  Favoritos
                </Link>
              </>
            )}

            {session?.user?.role === "EMPREGADOR" && (
              <Link
                href="/empregador"
                className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors px-3 py-2 rounded-lg"
              >
                Minhas Vagas
              </Link>
            )}

            <Link
              href="/profile"
              className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors px-3 py-2 rounded-lg"
            >
              Perfil
            </Link>

            {/* Botão de sair */}
            {session && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Saindo..." : "Sair"}
              </Button>
            )}
          </nav>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="gap-2"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu mobile expandido */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col gap-2">
              <Link
                href="/dashboard"
                onClick={() => setShowMobileMenu(false)}
                className="text-primary-600 font-medium px-3 py-2 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Dashboard
              </Link>

              {session?.user?.role === "PRESTADOR" && (
                <>
                  <Link
                    href="/prestador"
                    onClick={() => setShowMobileMenu(false)}
                    className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors px-3 py-2 rounded-lg"
                  >
                    Meus Anúncios
                  </Link>
                  <Link
                    href="/favoritos"
                    onClick={() => setShowMobileMenu(false)}
                    className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors px-3 py-2 rounded-lg"
                  >
                    Favoritos
                  </Link>
                </>
              )}

              {session?.user?.role === "EMPREGADOR" && (
                <Link
                  href="/empregador"
                  onClick={() => setShowMobileMenu(false)}
                  className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors px-3 py-2 rounded-lg"
                >
                  Minhas Vagas
                </Link>
              )}

              <Link
                href="/profile"
                onClick={() => setShowMobileMenu(false)}
                className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors px-3 py-2 rounded-lg"
              >
                Perfil
              </Link>

              {session && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2 justify-start w-full"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? "Saindo..." : "Sair"}
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
