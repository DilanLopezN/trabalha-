"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { SlidersHorizontal, X } from "lucide-react";

import { Results } from "../components/dashboard/Results";
import { Ads } from "../components/dashboard/Ads";
import { Sheet } from "../components/dashboard/Sheet";
import { Button } from "../components/Button";

import { Ad, Category, SearchFilters, SearchResult } from "@/interfaces";
import { Filters } from "../components/dashboard/Filters";
import { CompleteProfileAlert } from "../components/AlertConfigureProfile";

// Mock data - será substituído por dados reais da API
const mockCategories: Category[] = [
  { id: "1", name: "Elétrica", slug: "eletrica" },
  { id: "2", name: "Hidráulica", slug: "hidraulica" },
  { id: "3", name: "Limpeza", slug: "limpeza" },
  { id: "4", name: "Pintura", slug: "pintura" },
  { id: "5", name: "Marcenaria", slug: "marcenaria" },
  { id: "6", name: "Jardinagem", slug: "jardinagem" },
  { id: "7", name: "Babá", slug: "baba" },
  { id: "8", name: "Cuidador", slug: "cuidador" },
  { id: "9", name: "Pedreiro", slug: "pedreiro" },
];

// ... rest of mock data

export default function DashboardPage() {
  const { data: session } = useSession();
  const [profileComplete, setProfileComplete] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    type: "workers",
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setShowMobileFilters(false);
  };

  const checkProfileStatus = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const { user } = await response.json();

        const hasBasicInfo = user.name && user.whatsapp;

        let isComplete = false;
        if (user.role === "PRESTADOR" && user.workerProfile) {
          const profile = user.workerProfile;
          isComplete = !!(
            hasBasicInfo &&
            profile.categoryId &&
            profile.description &&
            profile.averagePrice > 0 &&
            Object.keys(profile.availability || {}).length > 0
          );
        } else if (user.role === "EMPREGADOR" && user.employerProfile) {
          const profile = user.employerProfile;
          isComplete = !!(
            hasBasicInfo &&
            profile.advertisedService &&
            profile.budget > 0 &&
            Object.keys(profile.availability || {}).length > 0
          );
        }

        setProfileComplete(isComplete);
      }
    } catch (error) {
      console.error("Erro ao verificar perfil:", error);
    }
  };

  // ... resto do código continua igual

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Trabalhaí
              </span>
            </Link>

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
            </nav>

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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Alerta de perfil incompleto */}
        {!profileComplete && (
          <div className="mb-6">
            <CompleteProfileAlert userName={session?.user?.name || undefined} />
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-6">
          {/* resto do código... */}
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      <Sheet
        open={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        title="Filtros de Busca"
      >
        <Filters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          categories={mockCategories}
        />
      </Sheet>
    </div>
  );
}
