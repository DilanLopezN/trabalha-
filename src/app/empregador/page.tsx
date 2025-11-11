"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Briefcase,
  DollarSign,
  MapPin,
  Calendar,
  Loader2,
  Eye,
} from "lucide-react";

import { Card, CardBody, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { Header } from "../components/dashboard/Header";

interface Vaga {
  id: string;
  titulo: string;
  descricao: string;
  salarioTipo: "FIXO" | "A_COMBINAR";
  salarioValor: number | null;
  category: {
    name: string;
  };
  status: "ABERTA" | "PAUSADA" | "FECHADA";
  createdAt: string;
  _count: {
    candidaturas: number;
  };
}

export default function EmpregadorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "EMPREGADOR") {
        router.push("/dashboard");
      } else {
        loadVagas();
      }
    }
  }, [status, session, router]);

  const loadVagas = async () => {
    try {
      const response = await fetch("/api/vagas");
      if (response.ok) {
        const data = await response.json();
        setVagas(data.vagas || []);
      }
    } catch (error) {
      console.error("Erro ao carregar vagas:", error);
    } finally {
      setIsLoading(false);
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
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Minhas Vagas
          </h1>
          <p className="text-gray-600">
            Gerencie suas vagas e encontre os melhores profissionais
          </p>
        </div>

        {/* CTA Card */}
        <Card className="mb-8 bg-gradient-to-br from-primary-600 to-primary-700 border-0">
          <CardBody className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  Anuncie uma Nova Vaga!
                </h2>
                <p className="text-primary-100 mb-4">
                  Publique sua vaga e receba propostas de profissionais
                  qualificados
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Alcance milhares de profissionais</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Receba propostas qualificadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Gratuito e sem taxas</span>
                  </li>
                </ul>
              </div>
              <div>
                <Link href="/empregador/criar">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Plus className="w-5 h-5" />
                    Criar Nova Vaga
                  </Button>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Vagas Ativas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Vagas Ativas
          </h2>

          {vagas.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma vaga publicada
                </h3>
                <p className="text-gray-600 mb-6">
                  Crie sua primeira vaga e comece a receber propostas
                </p>
                <Link href="/empregador/criar">
                  <Button className="gap-2">
                    <Plus className="w-5 h-5" />
                    Criar Primeira Vaga
                  </Button>
                </Link>
              </CardBody>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {vagas.map((vaga) => (
                <Card key={vaga.id} className="hover:shadow-lg transition-all">
                  <CardBody className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {vaga.titulo}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          vaga.status === "ABERTA"
                            ? "bg-green-100 text-green-700"
                            : vaga.status === "PAUSADA"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {vaga.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {vaga.descricao}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          {vaga.salarioTipo === "FIXO"
                            ? `R$ ${Number(vaga.salarioValor || 0).toFixed(2)}`
                            : "A Combinar"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        <span>{vaga.category.name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(vaga.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        className="gap-2"
                        onClick={() =>
                          router.push(`/empregador/vaga/${vaga.id}`)
                        }
                      >
                        <Eye className="w-4 h-4" />
                        Ver Candidatos ({vaga._count.candidaturas})
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Banner */}
        <Card className="bg-blue-50 border-blue-200">
          <CardBody className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Dica: Seja específico
              </h3>
              <p className="text-sm text-gray-700">
                Vagas com descrições detalhadas e orçamento claro recebem até 3x
                mais propostas de profissionais qualificados.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
