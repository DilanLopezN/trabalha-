"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  MessageCircle,
  Briefcase,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/app/components/Card";
import { Button } from "@/app/components/Button";

interface Candidato {
  id: string;
  prestador: {
    id: string;
    name: string;
    image: string | null;
    whatsapp: string | null;
    workerProfile: {
      category: {
        name: string;
      };
      description: string;
      averagePrice: number;
    } | null;
  };
  mensagem: string | null;
  status: string;
  createdAt: string;
}

export default function VagaCandidatosPage() {
  const params = useParams();
  const router = useRouter();
  const vagaId = params.id as string;

  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCandidatos();
  }, [vagaId]);

  const loadCandidatos = async () => {
    try {
      const response = await fetch(`/api/vagas/candidatar?vagaId=${vagaId}`);
      if (response.ok) {
        const data = await response.json();
        setCandidatos(data.candidaturas || []);
      }
    } catch (error) {
      console.error("Erro ao carregar candidatos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = (whatsapp: string | null, nome: string) => {
    if (!whatsapp) return;
    const cleanedNumber = whatsapp.replace(/\D/g, "").replace(/^0+/, "");
    const message = `Olá ${nome}! Vi sua candidatura para nossa vaga. Vamos conversar?`;
    window.open(
      `https://wa.me/55${cleanedNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando candidatos...</p>
        </div>
      </div>
    );
  }

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

        {candidatos.length === 0 ? (
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
                    {/* Foto */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-100">
                        {candidato.prestador.image ? (
                          <img
                            src={candidato.prestador.image}
                            alt={candidato.prestador.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl font-bold text-primary-600">
                              {candidato.prestador.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Informações */}
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
                              Valor médio: R${" "}
                              {candidato.prestador.workerProfile.averagePrice.toFixed(
                                2
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

                      <div className="flex gap-3 pt-2">
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
                          onClick={() =>
                            router.push(`/profile/${candidato.prestador.id}`)
                          }
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
    </div>
  );
}
