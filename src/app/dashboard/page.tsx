"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { SlidersHorizontal } from "lucide-react";

import { Results } from "../components/dashboard/Results";

import { Sheet } from "../components/dashboard/Sheet";
import { Button } from "../components/Button";

import { SearchFilters, SearchResult, Category } from "@/interfaces";
import { Filters } from "../components/dashboard/Filters";
import { CompleteProfileAlert } from "../components/AlertConfigureProfile";
import { ProfileModal } from "../components/dashboard/ProfileModal";
import { Header } from "../components/dashboard/Header";
import { VagaCard } from "../components/dashboard/VagaCard";
import { PaidJobAds } from "../components/dashboard/PaidJobAds";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [profileComplete, setProfileComplete] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    type: "workers",
    showVagas: false,
  });
  const [vagas, setVagas] = useState<any[]>([]);
  const [paidAds, setPaidAds] = useState<any[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPaidAds, setIsLoadingPaidAds] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modal
  const [selectedProfile, setSelectedProfile] = useState<SearchResult | null>(
    null
  );
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    checkProfileStatus();
    loadCategories();
    loadResults();
    loadPaidAds();
  }, []);

  const loadVagas = async () => {
    try {
      const response = await fetch("/api/vagas");
      if (response.ok) {
        const data = await response.json();
        setVagas(data.vagas || []);
      }
    } catch (error) {
      console.error("Erro ao carregar vagas:", error);
    }
  };

  const checkProfileStatus = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const { user } = await response.json();

        const hasAddress = !!(
          user.cep &&
          user.street &&
          user.number &&
          user.neighborhood &&
          user.city &&
          user.state
        );

        let isComplete = false;

        if (user.role === "PRESTADOR" && user.workerProfile) {
          const profile = user.workerProfile;
          isComplete = !!(
            hasAddress &&
            profile.categoryId &&
            profile.averagePrice > 0 &&
            Object.keys(profile.availability || {}).length > 0
          );
        } else if (user.role === "EMPREGADOR") {
          const hasCnpj = Boolean(user.cnpj);
          isComplete = hasAddress && hasCnpj;
        }

        setProfileComplete(isComplete);
      }
    } catch (error) {
      console.error("Erro ao verificar perfil:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const { categories: cats } = await response.json();
        setCategories(cats);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const loadResults = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("type", filters.type);
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.q) params.append("q", filters.q);
      if (filters.state) params.append("state", filters.state);
      if (filters.city) params.append("city", filters.city);
      if (filters.minPrice)
        params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice)
        params.append("maxPrice", filters.maxPrice.toString());
      if (filters.minBudget)
        params.append("minBudget", filters.minBudget.toString());
      if (filters.maxBudget)
        params.append("maxBudget", filters.maxBudget.toString());

      const response = await fetch(`/api/search?${params.toString()}`);
      if (response.ok) {
        const { results: data } = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Erro ao carregar resultados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaidAds = async () => {
    setIsLoadingPaidAds(true);
    try {
      const response = await fetch("/api/vagas/paid?limit=5");
      if (response.ok) {
        const data = await response.json();
        setPaidAds(data.paidAds || []);
      }
    } catch (error) {
      console.error("Erro ao carregar anúncios pagos:", error);
    } finally {
      setIsLoadingPaidAds(false);
    }
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setShowMobileFilters(false);
  };

  const handleOpenProfile = (result: SearchResult) => {
    setSelectedProfile(result);
    setShowProfileModal(true);
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
    setTimeout(() => setSelectedProfile(null), 300);
  };

  useEffect(() => {
    if (filters.showVagas) {
      loadVagas();
    } else {
      loadResults();
    }
  }, [filters]);

  const handleFavoritar = async (vagaId: string) => {
    try {
      const favorito = vagas.find((v: any) => v.id === vagaId);
      if (favorito?.favoritos?.length > 0) {
        await fetch(`/api/vagas/favoritar?vagaId=${vagaId}`, {
          method: "DELETE",
        });
      } else {
        await fetch("/api/vagas/favoritar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vagaId }),
        });
      }
      loadVagas();
    } catch (error) {
      console.error("Erro ao favoritar:", error);
    }
  };

  const handleCandidatar = async (vagaId: string) => {
    const mensagem = prompt("Mensagem opcional para o empregador:");
    try {
      const response = await fetch("/api/vagas/candidatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vagaId, mensagem }),
      });

      if (response.ok) {
        alert("Candidatura enviada com sucesso!");
        loadVagas();
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao candidatar-se");
      }
    } catch (error) {
      console.error("Erro ao candidatar:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Alerta de perfil incompleto */}
        {!profileComplete && (
          <div className="mb-6">
            <CompleteProfileAlert userName={session?.user?.name || undefined} />
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar - Filtros */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <Filters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                categories={categories}
              />
            </div>
          </aside>

          {/* Main Content - Resultados */}
          <main className="lg:col-span-6">
            {filters.showVagas ? (
              <div className="grid gap-4">
                {vagas.map((vaga: any) => (
                  <VagaCard
                    key={vaga.id}
                    vaga={vaga}
                    onFavoritar={handleFavoritar}
                    onCandidatar={handleCandidatar}
                  />
                ))}
              </div>
            ) : (
              <Results
                results={results}
                isLoading={isLoading}
                onOpenProfile={handleOpenProfile}
              />
            )}
          </main>

          {/* Paid Ads */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <PaidJobAds ads={paidAds} isLoading={isLoadingPaidAds} />
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
          categories={categories}
        />
      </Sheet>

      {/* Profile Modal */}
      <ProfileModal
        result={selectedProfile}
        isOpen={showProfileModal}
        onClose={handleCloseProfile}
      />
    </div>
  );
}
