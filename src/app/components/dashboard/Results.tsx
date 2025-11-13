"use client";

import { MessageCircle, MapPin, Clock, DollarSign } from "lucide-react";
import { Button } from "../Button";
import { Card, CardBody } from "../Card";
import { EmployerProfile, SearchResult, WorkerProfile } from "@/interfaces";
import { Avatar } from "../Avatar";

function LoadingSkeletonCard() {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white animate-pulse space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="flex gap-3">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
      <div className="h-9 bg-gray-200 rounded" />
    </div>
  );
}

interface ResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  onOpenProfile: (result: SearchResult) => void;
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

function WorkerCard({
  result,
  onOpenProfile,
}: {
  result: SearchResult;
  onOpenProfile: (result: SearchResult) => void;
}) {
  const profile = result.profile as WorkerProfile;

  return (
    <Card
      className="relative hover:shadow-lg transition-all cursor-pointer"
      onClick={() => onOpenProfile(result)}
    >
      <HighlightBadge plan={result.highlightPlan} />
      <CardBody className="space-y-4">
        <div className="flex items-start gap-4">
          {/* Foto de perfil */}
          <Avatar src={result.image} alt={result.name} size={64} />

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {result.name}
            </h3>
            <p className="text-sm text-primary-600 font-medium">
              {profile.category?.name}
            </p>
            {(result.city || result.state) && (
              <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <MapPin className="w-3 h-3" />
                <span>
                  {[result.city, result.state].filter(Boolean).join(" - ")}
                </span>
              </p>
            )}
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
            <span>R$ {profile.averagePrice.toFixed(2)}/hora</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              Disponível em {Object.keys(profile.availability || {}).length}{" "}
              dias da semana
            </span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            fullWidth
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile(result);
            }}
          >
            Ver Perfil Completo
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function EmployerCard({
  result,
  onOpenProfile,
}: {
  result: SearchResult;
  onOpenProfile: (result: SearchResult) => void;
}) {
  const profile = result.profile as EmployerProfile;

  return (
    <Card
      className="relative hover:shadow-lg transition-all cursor-pointer"
      onClick={() => onOpenProfile(result)}
    >
      <HighlightBadge plan={result.highlightPlan} />
      <CardBody className="space-y-4">
        <div className="flex items-start gap-4">
          {/* Foto de perfil */}
          <Avatar src={result.image} alt={result.name} size={64} />

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {result.name}
            </h3>
            <p className="text-sm text-primary-600 font-medium">Empregador</p>
            {(result.city || result.state) && (
              <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <MapPin className="w-3 h-3" />
                <span>
                  {[result.city, result.state].filter(Boolean).join(" - ")}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Serviço Anunciado:
          </p>
          <p className="text-sm text-gray-900 line-clamp-2">
            {profile.advertisedService}
          </p>
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

        <div className="pt-2">
          <Button
            fullWidth
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile(result);
            }}
          >
            Ver Perfil Completo
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

export function Results({ results, isLoading, onOpenProfile }: ResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((key) => (
          <LoadingSkeletonCard key={key} />
        ))}
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
            <WorkerCard
              key={result.id}
              result={result}
              onOpenProfile={onOpenProfile}
            />
          ) : (
            <EmployerCard
              key={result.id}
              result={result}
              onOpenProfile={onOpenProfile}
            />
          )
        )}
      </div>
    </div>
  );
}
