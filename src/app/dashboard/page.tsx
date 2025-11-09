"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";

import { Results } from "../components/dashboard/Results";
import { Ads } from "../components/dashboard/Ads";
import { Sheet } from "../components/dashboard/Sheet";
import { Button } from "../components/Button";
import { Ad, Category, SearchFilters, SearchResult } from "@/interfaces";
import { Filters } from "../components/dashboard/Filters";

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

const mockAds: Ad[] = [
  {
    id: "1",
    ownerId: "1",
    planId: "1",
    plan: {
      id: "1",
      code: "OURO",
      price: 30,
      durationDays: 7,
      priority: 3,
    },
    title: "Ferramentas Profissionais com Desconto",
    content:
      "Compre as melhores ferramentas para seu trabalho com até 30% de desconto!",
    imageUrl: undefined,
    target: "ALL",
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "ACTIVE",
  },
  {
    id: "2",
    ownerId: "2",
    planId: "2",
    plan: {
      id: "2",
      code: "PRATA",
      price: 25,
      durationDays: 5,
      priority: 2,
    },
    title: "Curso de Capacitação Profissional",
    content:
      "Aprimore suas habilidades e destaque-se no mercado. Inscrições abertas!",
    target: "WORKERS",
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: "ACTIVE",
  },
];

const mockResults: SearchResult[] = [
  {
    id: "1",
    name: "João Silva",
    role: "PRESTADOR",
    whatsapp: "5511999999999",
    profile: {
      id: "1",
      userId: "1",
      categoryId: "1",
      category: { id: "1", name: "Elétrica", slug: "eletrica" },
      averagePrice: 150.0,
      availability: {
        mon: [{ start: "08:00", end: "18:00" }],
        tue: [{ start: "08:00", end: "18:00" }],
        wed: [{ start: "08:00", end: "18:00" }],
      },
      description:
        "Eletricista com 10 anos de experiência. Atendo residências e comércios.",
    },
    highlightPlan: "OURO",
    relevanceScore: 95,
  },
  {
    id: "2",
    name: "Maria Santos",
    role: "PRESTADOR",
    whatsapp: "5511988888888",
    profile: {
      id: "2",
      userId: "2",
      categoryId: "3",
      category: { id: "3", name: "Limpeza", slug: "limpeza" },
      averagePrice: 80.0,
      availability: {
        mon: [{ start: "09:00", end: "17:00" }],
        thu: [{ start: "09:00", end: "17:00" }],
        fri: [{ start: "09:00", end: "17:00" }],
      },
      description:
        "Serviços de limpeza residencial e comercial. Profissional dedicada e pontual.",
    },
    highlightPlan: "PRATA",
    relevanceScore: 85,
  },
  {
    id: "3",
    name: "Pedro Costa",
    role: "EMPREGADOR",
    whatsapp: "5511977777777",
    profile: {
      id: "3",
      userId: "3",
      advertisedService: "Preciso de pintor para apartamento de 80m²",
      budget: 2500.0,
      categoryId: "4",
      category: { id: "4", name: "Pintura", slug: "pintura" },
      availability: {
        sat: [{ start: "08:00", end: "18:00" }],
        sun: [{ start: "08:00", end: "18:00" }],
      },
    },
    relevanceScore: 75,
  },
];

export default function DashboardPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    type: "workers",
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Simular busca na API
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);

      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Filtrar mock results baseado nos filtros
      let filtered = mockResults.filter(
        (r) =>
          (filters.type === "workers" && r.role === "PRESTADOR") ||
          (filters.type === "employers" && r.role === "EMPREGADOR")
      );

      // Filtrar por categoria
      if (filters.categoryId) {
        filtered = filtered.filter((r) => {
          if ("categoryId" in r.profile) {
            return r.profile.categoryId === filters.categoryId;
          }
          return false;
        });
      }

      // Filtrar por busca de texto
      if (filters.q) {
        const query = filters.q.toLowerCase();
        filtered = filtered.filter((r) => r.name.toLowerCase().includes(query));
      }

      // Ordenar por relevância (highlight + score)
      filtered.sort((a, b) => {
        const priorityOrder = { PLATINA: 4, OURO: 3, PRATA: 2, BRONZE: 1 };
        const aPriority = a.highlightPlan ? priorityOrder[a.highlightPlan] : 0;
        const bPriority = b.highlightPlan ? priorityOrder[b.highlightPlan] : 0;

        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }

        return b.relevanceScore - a.relevanceScore;
      });

      setResults(filtered);
      setIsLoading(false);
    };

    fetchResults();
  }, [filters]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setShowMobileFilters(false);
  };

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
              <Link
                href="/prestador"
                className="text-gray-600 hover:text-primary-600 transition-colors px-3 py-2"
              >
                Prestador
              </Link>
              <Link
                href="/empregador"
                className="text-gray-600 hover:text-primary-600 transition-colors px-3 py-2"
              >
                Empregador
              </Link>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-primary-600 transition-colors px-3 py-2"
              >
                Perfil
              </Link>
            </nav>

            {/* Mobile filter button */}
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

      {/* Main Content - 3 colunas */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda - Filtros (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Filtros
                </h2>
                <Filters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  categories={mockCategories}
                />
              </div>
            </div>
          </aside>

          {/* Coluna Central - Resultados */}
          <main className="lg:col-span-6">
            <Results results={results} isLoading={isLoading} />
          </main>

          {/* Coluna Direita - Anúncios */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <Ads ads={mockAds} />
            </div>
          </aside>
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
