"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { Card, CardBody, CardHeader } from "../components/Card";
import { Button } from "../components/Button";

interface Highlight {
  id: string;
  planCode: string;
  planName: string;
  startsAt: string;
  endsAt: string;
  status: string;
}

export default function PrestadorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "PRESTADOR") {
        router.push("/dashboard");
      } else {
        loadHighlights();
      }
    }
  }, [status, session, router]);

  const loadHighlights = async () => {
    try {
      const response = await fetch("/api/highlights");
      if (response.ok) {
        const data = await response.json();
        setHighlights(data.highlights || []);
      }
    } catch (error) {
      console.error("Erro ao carregar destaques:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyHighlight = () => {
    router.push("/prestador/comprar-destaque");
  };

  const getPlanBadge = (code: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      BRONZE: { bg: "bg-amber-700", text: "Bronze" },
      PRATA: { bg: "bg-gray-400", text: "Prata" },
      OURO: { bg: "bg-yellow-500", text: "Ouro" },
      PLATINA: { bg: "bg-purple-600", text: "Platina" },
    };
    return badges[code] || badges.BRONZE;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  };

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const activeHighlights = highlights.filter((h) => h.status === "ACTIVE");
  const expiredHighlights = highlights.filter((h) => h.status === "EXPIRED");

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
                className="text-gray-600 hover:text-primary-600 transition-colors px-3 py-2"
              >
                Dashboard
              </Link>
              <Link
                href="/prestador"
                className="text-primary-600 font-medium px-3 py-2"
              >
                Meus Anúncios
              </Link>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-primary-600 transition-colors px-3 py-2"
              >
                Perfil
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meus Destaques
          </h1>
          <p className="text-gray-600">
            Gerencie seus planos de destaque e apareça primeiro nas buscas
          </p>
        </div>

        {/* CTA Card */}
        <Card className="mb-8 bg-gradient-to-br from-primary-600 to-primary-700 border-0">
          <CardBody className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  Destaque seu Perfil!
                </h2>
                <p className="text-primary-100 mb-4">
                  Apareça no topo das buscas e receba até 3x mais propostas de
                  trabalho
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    <span>Prioridade nas buscas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span>Mais visualizações do seu perfil</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    <span>Planos a partir de R$ 15</span>
                  </li>
                </ul>
              </div>
              <div>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleBuyHighlight}
                  className="gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Comprar Destaque
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Destaques Ativos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Destaques Ativos
          </h2>

          {activeHighlights.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EyeOff className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum destaque ativo
                </h3>
                <p className="text-gray-600 mb-6">
                  Compre um plano de destaque e apareça primeiro nas buscas
                </p>
                <Button onClick={handleBuyHighlight} className="gap-2">
                  <Plus className="w-5 h-5" />
                  Comprar Destaque
                </Button>
              </CardBody>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {activeHighlights.map((highlight) => {
                const badge = getPlanBadge(highlight.planCode);
                const daysRemaining = getDaysRemaining(highlight.endsAt);

                return (
                  <Card key={highlight.id} className="relative overflow-hidden">
                    <div
                      className={`absolute top-0 right-0 ${badge.bg} text-white px-4 py-2 rounded-bl-lg`}
                    >
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span className="font-bold text-sm">{badge.text}</span>
                      </div>
                    </div>

                    <CardBody className="pt-16">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Plano {highlight.planName}
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Válido até {formatDate(highlight.endsAt)}</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              daysRemaining > 3
                                ? "bg-green-500"
                                : daysRemaining > 1
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span
                            className={`font-medium ${
                              daysRemaining > 3
                                ? "text-green-700"
                                : daysRemaining > 1
                                ? "text-yellow-700"
                                : "text-red-700"
                            }`}
                          >
                            {daysRemaining === 0
                              ? "Expira hoje"
                              : `${daysRemaining} ${
                                  daysRemaining === 1 ? "dia" : "dias"
                                } restantes`}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <Button
                          fullWidth
                          variant="outline"
                          size="sm"
                          onClick={handleBuyHighlight}
                        >
                          Renovar Destaque
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Histórico */}
        {expiredHighlights.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Histórico</h2>

            <Card>
              <CardBody>
                <div className="space-y-4">
                  {expiredHighlights.map((highlight) => {
                    const badge = getPlanBadge(highlight.planCode);

                    return (
                      <div
                        key={highlight.id}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`${badge.bg} text-white px-3 py-1 rounded-full text-xs font-bold`}
                          >
                            {badge.text}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {highlight.planName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(highlight.startsAt)} -{" "}
                              {formatDate(highlight.endsAt)}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">Expirado</span>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
