"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { SlidersHorizontal, LogOut } from "lucide-react";
import { Button } from "@/app/components/Button";

export function Header() {
  const { data: session } = useSession();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" }); // redireciona para home após sair
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Trabalhaí</span>
          </Link>

          {/* Navegação desktop */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-primary-600 font-medium px-3 py-2"
            >
              Dashboard
            </Link>

            {session?.user?.role === "PRESTADOR" && (
              <Link
                href="/prestador"
                className="text-gray-600 hover:text-primary-600 transition-colors px-3 py-2"
              >
                Meus Anúncios
              </Link>
            )}

            {session?.user?.role === "EMPREGADOR" && (
              <Link
                href="/empregador"
                className="text-gray-600 hover:text-primary-600 transition-colors px-3 py-2"
              >
                Minhas Vagas
              </Link>
            )}

            <Link
              href="/profile"
              className="text-gray-600 hover:text-primary-600 transition-colors px-3 py-2"
            >
              Perfil
            </Link>

            {/* Botão de sair */}
            {session && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            )}
          </nav>

          {/* Botão mobile */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden gap-2"
            onClick={() => setShowMobileFilters(true)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </Button>
        </div>
      </div>
    </header>
  );
}
