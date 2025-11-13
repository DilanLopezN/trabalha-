"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Heart,
  Loader2,
  Briefcase,
  DollarSign,
  Calendar,
  Building2,
} from "lucide-react";
import { Card, CardBody } from "../components/Card";
import { Button } from "../components/Button";
import { Header } from "../components/dashboard/Header";
import { useApi } from "@/hooks/useApi";

interface VagaFavorita {
  id: string;
  vaga: {
    id: string;
    titulo: string;
    descricao: string;
    salarioTipo: "FIXO" | "A_COMBINAR";
    salarioValor: number | null;
    category: {
      name: string;
    };
    empregador: {
      name: string;
      image: string | null;
    };
    etapas: Array<{
      nome: string;
      ordem: number;
    }>;
    createdAt: string;
  };
  createdAt: string;
}

export default function FavoritosPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { api } = useApi();
  const [favoritos, setFavoritos] = useState<VagaFavorita[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavoritos = useCallback(async () => {
    try {
      const data = await api("/api/vagas/favoritar");
      setFavoritos(data.favoritos || []);
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "PRESTADOR") {
        router.push("/dashboard");
      } else {
        loadFavoritos();
      }
    }
  }, [status, session, router, loadFavoritos]);

  const handleRemoveFavorito = async (vagaId: string) => {
    try {
      await api(`/api/vagas/favoritar?vagaId=${vagaId}`, {
        method: "DELETE",
      });

      setFavoritos((prev) => prev.filter((f) => f.vaga.id !== vagaId));
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vagas Favoritas
          </h1>
          <p className="text-gray-600">
            {favoritos.length}{" "}
            {favoritos.length === 1 ? "vaga salva" : "vagas salvas"}
          </p>
        </div>

        {favoritos.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma vaga favorita
              </h3>
              <p className="text-gray-600 mb-6">
                Favorite vagas no dashboard para vê-las aqui
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Ir para Dashboard
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-6">
            {favoritos.map((favorito) => (
              <Card
                key={favorito.id}
                className="hover:shadow-lg transition-all"
              >
                <CardBody className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {favorito.vaga.titulo}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4" />
                        <span>{favorito.vaga.empregador.name}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFavorito(favorito.vaga.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Heart className="w-6 h-6 fill-current" />
                    </button>
                  </div>

                  <p className="text-gray-700 line-clamp-2">
                    {favorito.vaga.descricao}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {favorito.vaga.salarioTipo === "FIXO"
                          ? Number(
                              favorito.vaga.salarioValor || 0
                            ).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                          : "A Combinar"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>{favorito.vaga.category.name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(favorito.vaga.createdAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                  </div>

                  {favorito.vaga.etapas.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 mb-2">
                        Etapas do Processo:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {favorito.vaga.etapas.map((etapa) => (
                          <span
                            key={etapa.ordem}
                            className="px-2 py-1 bg-white border border-blue-200 rounded text-xs text-blue-900"
                          >
                            {etapa.ordem}. {etapa.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      fullWidth
                      onClick={() =>
                        router.push(`/dashboard?vaga=${favorito.vaga.id}`)
                      }
                    >
                      Ver Detalhes e Candidatar-se
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
