"use client";

import { MessageCircle, MapPin, Clock, DollarSign } from "lucide-react";
import { Button } from "../Button";
import { Card, CardBody } from "../Card";
import { EmployerProfile, SearchResult, WorkerProfile } from "@/interfaces";

interface ResultsProps {
  results: SearchResult[];
  isLoading: boolean;
}

function HighlightBadge({ plan }: { plan?: string }) {
  if (!plan) return null;

  const badges = {
    BRONZE: { color: "bg-amber-700", text: "Bronze" },
    PRATA: { color: "bg-gray-400", text: "Prata" },
    OURO: { color: "bg-yellow-500", text: "Ouro" },
    PLATINA: { color: "bg-purple-600", text: "Platina" },
  };

  const badge = badges[plan as keyof typeof badges];
  if (!badge) return null;

  return (
    <span
      className={`absolute top-2 right-2 ${badge.color} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg`}
    >
      ⭐ {badge.text}
    </span>
  );
}

function WorkerCard({ result }: { result: SearchResult }) {
  const profile = result.profile as WorkerProfile;
  const whatsappLink = result.whatsapp
    ? `https://wa.me/${result.whatsapp}?text=${encodeURIComponent(
        `Olá! Tenho interesse nos seus serviços de ${profile.category?.name}. Podemos conversar?`
      )}`
    : null;

  return (
    <Card className="relative hover:shadow-md transition-shadow">
      <HighlightBadge plan={result.highlightPlan} />
      <CardBody className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-primary-600">
              {result.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {result.name}
            </h3>
            <p className="text-sm text-primary-600 font-medium">
              {profile.category?.name}
            </p>
          </div>
        </div>

        {profile.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {profile.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>Preço médio: R$ {profile.averagePrice.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              Disponível em {Object.keys(profile.availability || {}).length}{" "}
              dias da semana
            </span>
          </div>
        </div>

        {whatsappLink && (
          <Button
            fullWidth
            variant="primary"
            size="md"
            onClick={() => window.open(whatsappLink, "_blank")}
            className="gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Conversar no WhatsApp
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

function EmployerCard({ result }: { result: SearchResult }) {
  const profile = result.profile as EmployerProfile;
  const whatsappLink = result.whatsapp
    ? `https://wa.me/${result.whatsapp}?text=${encodeURIComponent(
        `Olá! Tenho interesse no trabalho de ${profile.advertisedService}. Podemos conversar?`
      )}`
    : null;

  return (
    <Card className="relative hover:shadow-md transition-shadow">
      <HighlightBadge plan={result.highlightPlan} />
      <CardBody className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-primary-600">
              {result.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {result.name}
            </h3>
            <p className="text-sm text-primary-600 font-medium">Empregador</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Serviço Anunciado:
          </p>
          <p className="text-sm text-gray-900">{profile.advertisedService}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>Orçamento: R$ {profile.budget.toFixed(2)}</span>
          </div>

          {profile.category && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Categoria: {profile.category.name}</span>
            </div>
          )}
        </div>

        {whatsappLink && (
          <Button
            fullWidth
            variant="primary"
            size="md"
            onClick={() => window.open(whatsappLink, "_blank")}
            className="gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Conversar no WhatsApp
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

export function Results({ results, isLoading }: ResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Buscando resultados...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum resultado encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou realizar uma nova busca.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {results.length} {results.length === 1 ? "resultado" : "resultados"}{" "}
          encontrado{results.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-4">
        {results.map((result) =>
          result.role === "PRESTADOR" ? (
            <WorkerCard key={result.id} result={result} />
          ) : (
            <EmployerCard key={result.id} result={result} />
          )
        )}
      </div>
    </div>
  );
}
