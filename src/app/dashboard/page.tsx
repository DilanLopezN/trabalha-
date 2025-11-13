"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useApi } from "@/hooks/useApi";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { api } = useApi();
  const [profileComplete, setProfileComplete] = useState(true);
  const [showProfileReminder, setShowProfileReminder] = useState(false);
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

  const loadVagas = useCallback(async () => {
    try {
      const data = await api("/api/vagas");
      setVagas(data.vagas || []);
    } catch (error) {
      console.error("Erro ao carregar vagas:", error);
    }
  }, [api]);

  const checkProfileStatus = useCallback(async () => {
    try {
      const { user } = await api("/api/profile");

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
    } catch (error) {
      console.error("Erro ao verificar perfil:", error);
    }
  }, [api]);

  const loadCategories = useCallback(async () => {
    try {
      const { categories: cats } = await api("/api/categories");
      setCategories(cats);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  }, [api]);

  const loadResults = useCallback(async () => {
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

      const { results: data } = await api(`/api/search?${params.toString()}`);
      setResults(data);
    } catch (error) {
      console.error("Erro ao carregar resultados:", error);
    } finally {
      setIsLoading(false);
    }
  }, [api, filters]);

  const loadPaidAds = useCallback(async () => {
    setIsLoadingPaidAds(true);
    try {
      const data = await api("/api/vagas/paid?limit=5");
      setPaidAds(data.paidAds || []);
    } catch (error) {
      console.error("Erro ao carregar anúncios pagos:", error);
    } finally {
      setIsLoadingPaidAds(false);
    }
  }, [api]);

  useEffect(() => {
    checkProfileStatus();
    loadCategories();
    loadResults();
    loadPaidAds();
  }, [checkProfileStatus, loadCategories, loadResults, loadPaidAds]);

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
  }, [filters, loadResults, loadVagas]);

  const handleFavoritar = async (vagaId: string) => {
    try {
      const favorito = vagas.find((v: any) => v.id === vagaId);
      if (favorito?.favoritos?.length > 0) {
        await api(`/api/vagas/favoritar?vagaId=${vagaId}`, {
          method: "DELETE",
        });
      } else {
        await api("/api/vagas/favoritar", {
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
      await api("/api/vagas/candidatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vagaId, mensagem }),
      });

      alert("Candidatura enviada com sucesso!");
      loadVagas();
      loadPaidAds();
    } catch (error) {
      console.error("Erro ao candidatar:", error);
      const message =
        error instanceof Error
          ? error.message
          : (error as { message?: string })?.message ||
            "Erro ao candidatar-se";
      alert(message);
    }
  };

  useEffect(() => {
    if (!session?.user?.role) {
      setShowProfileReminder(false);
      return;
    }

    if (profileComplete) {
      setShowProfileReminder(false);
      return;
    }

    if (session.user.role === "EMPREGADOR") {
      if (typeof window === "undefined" || !session.user.id) {
        return;
      }

      const storageKey = `emp-profile-reminder-${session.user.id}`;
      const hasSeen = window.localStorage.getItem(storageKey);

      if (!hasSeen) {
        window.localStorage.setItem(storageKey, "seen");
        setShowProfileReminder(true);
      } else {
        setShowProfileReminder(false);
      }
    } else {
      setShowProfileReminder(true);
    }
  }, [profileComplete, session?.user?.role, session?.user?.id]);

  const handleDismissProfileReminder = useCallback(() => {
    if (session?.user?.role === "EMPREGADOR" && session.user.id) {
      const storageKey = `emp-profile-reminder-${session.user.id}`;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, "dismissed");
      }
    }
    setShowProfileReminder(false);
  }, [session?.user?.id, session?.user?.role]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Alerta de perfil incompleto */}
        {!profileComplete && showProfileReminder && (
          <div className="mb-6">
            <CompleteProfileAlert
              userName={session?.user?.name || undefined}
              role={session?.user?.role as "PRESTADOR" | "EMPREGADOR" | undefined}
              onDismiss={
                session?.user?.role === "EMPREGADOR"
                  ? handleDismissProfileReminder
                  : undefined
              }
            />
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
              <PaidJobAds
                ads={paidAds}
                isLoading={isLoadingPaidAds}
                currentUserRole={session?.user?.role}
                onCandidatar={handleCandidatar}
              />
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
