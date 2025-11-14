"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  MessageCircle,
  Briefcase,
  Calendar,
  FileText,
} from "lucide-react";
import { Card, CardBody } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { Avatar } from "@/app/components/Avatar";
import { ProfileModal } from "@/app/components/dashboard/ProfileModal";
import { SearchResult, WorkerProfile } from "@/interfaces";
import { useApi } from "@/hooks/useApi";

interface Candidato {
  id: string;
  prestador: {
    id: string;
    name: string;
    image: string | null;
    whatsapp: string | null;
    city?: string | null;
    state?: string | null;
    workerProfile: {
      id: string;
      userId: string;
      categoryId: string;
      category: {
        name: string;
      };
      description: string;
      averagePrice: number;
      availability?: Record<string, any>;
      resumeUrl?: string | null;
    } | null;
  };
  mensagem: string | null;
  status: string;
  createdAt: string;
}

export default function VagaCandidatosClientPage() {
  const params = useParams();
  const router = useRouter();
  const vagaId = params.id as string;
  const { api } = useApi();

  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<SearchResult | null>(
    null
  );
  const [showProfileModal, setShowProfileModal] = useState(false);

  const loadCandidatos = useCallback(async () => {
    try {
      const data = await api(`/api/vagas/candidatar?vagaId=${vagaId}`);
      setCandidatos(data.candidaturas || []);
    } catch (error) {
      console.error("Erro ao carregar candidatos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [api, vagaId]);

  useEffect(() => {
    loadCandidatos();
  }, [vagaId, loadCandidatos]);

  const handleWhatsApp = (whatsapp: string | null, nome: string) => {
    if (!whatsapp) return;
    const cleanedNumber = whatsapp.replace(/\D/g, "").replace(/^0+/, "");
    const message = `Olá ${nome}! Vi sua candidatura para nossa vaga. Vamos conversar?`;
    window.open(
      `https://wa.me/55${cleanedNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleOpenProfile = (candidato: Candidato) => {
    if (!candidato.prestador.workerProfile) return;

    const profile = candidato.prestador.workerProfile;
    // map category only if it contains required fields (id and slug), otherwise leave undefined
    const mappedCategory = (() => {
      const cat = profile?.category;
      if (!cat) return undefined;
      // runtime check for required fields
      if ("id" in cat && "slug" in cat) {
        return cat as any;
      }
      return undefined;
    })();

    const mappedProfile: WorkerProfile = {
      id: profile?.id || "",
      userId: profile?.userId || candidato.prestador.id,
      categoryId: profile?.categoryId || "",
      category: mappedCategory,
      averagePrice: Number(profile?.averagePrice || 0),
      availability: profile?.availability || {},
      description: profile?.description || "",
      resumeUrl: profile?.resumeUrl || null,
    };

    const mapped: SearchResult = {
      id: candidato.prestador.id,
      name: candidato.prestador.name,
      role: "PRESTADOR",
      image: candidato.prestador.image || undefined,
      whatsapp: candidato.prestador.whatsapp || undefined,
      city: candidato.prestador.city || null,
      state: candidato.prestador.state || null,
      profile: mappedProfile,
      highlightPlan: undefined,
      relevanceScore: 0,
    };

    setSelectedProfile(mapped);
    setShowProfileModal(true);
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
    setTimeout(() => setSelectedProfile(null), 200);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/empregador"
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar para Minhas Vagas</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Candidatos da Vaga
          </h1>
          <p className="text-gray-600">
            {candidatos.length}{" "}
            {candidatos.length === 1 ? "candidato" : "candidatos"} encontrado
            {candidatos.length === 1 ? "" : "s"}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-6 bg-white animate-pulse space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="flex gap-3">
                  <div className="h-8 bg-gray-200 rounded flex-1" />
                  <div className="h-8 bg-gray-200 rounded flex-1" />
                </div>
              </div>
            ))}
          </div>
        ) : candidatos.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum candidato ainda
              </h3>
              <p className="text-gray-600">
                Sua vaga ainda não recebeu candidaturas
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {candidatos.map((candidato) => (
              <Card
                key={candidato.id}
                className="hover:shadow-lg transition-all"
              >
                <CardBody>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <Avatar
                        src={candidato.prestador.image}
                        alt={candidato.prestador.name}
                        size={96}
                      />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {candidato.prestador.name}
                        </h3>
                        {candidato.prestador.workerProfile && (
                          <p className="text-primary-600 font-medium">
                            {candidato.prestador.workerProfile.category.name}
                          </p>
                        )}
                      </div>

                      {candidato.prestador.workerProfile && (
                        <>
                          <p className="text-gray-700 line-clamp-2">
                            {candidato.prestador.workerProfile.description}
                          </p>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Briefcase className="w-4 h-4" />
                            <span>
                              Valor médio:{" "}
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(
                                Number(
                                  candidato.prestador?.workerProfile
                                    ?.averagePrice
                                ) || 0
                              )}
                              /hora
                            </span>
                          </div>
                        </>
                      )}

                      {candidato.mensagem && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-2 mb-2">
                            <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span className="font-medium text-blue-900 text-sm">
                              Mensagem do candidato:
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 ml-6">
                            {candidato.mensagem}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Candidatou-se em{" "}
                          {new Date(candidato.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                      </div>

                      <div className="flex gap-3 pt-2 flex-wrap">
                        <Button
                          onClick={() =>
                            handleWhatsApp(
                              candidato.prestador.whatsapp,
                              candidato.prestador.name
                            )
                          }
                          disabled={!candidato.prestador.whatsapp}
                          className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Contatar no WhatsApp
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleOpenProfile(candidato)}
                        >
                          Ver Perfil Completo
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ProfileModal
        result={selectedProfile}
        isOpen={showProfileModal}
        onClose={handleCloseProfile}
      />
    </div>
  );
}
