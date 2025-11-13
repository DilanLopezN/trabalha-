"use client";

import Link from "next/link";
import { MapPin, Briefcase, Sparkles } from "lucide-react";
import { Avatar } from "../Avatar";

interface PaidJobAdProps {
  ads: Array<{
    id: string;
    titulo: string;
    descricao: string;
    salarioTipo: string;
    salarioValor?: number | null;
    category?: { id: string; name: string } | null;
    empregador: {
      id: string;
      name: string | null;
      image: string | null;
      city: string | null;
      state: string | null;
    };
  }>;
  isLoading?: boolean;
}

function PaidAdSkeleton() {
  return (
    <div className="border border-primary-100 bg-white rounded-xl p-4 animate-pulse space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-primary-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-primary-100 rounded w-3/4" />
          <div className="h-3 bg-primary-100 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-primary-100 rounded w-full" />
      <div className="h-8 bg-primary-100 rounded" />
    </div>
  );
}

export function PaidJobAds({ ads, isLoading = false }: PaidJobAdProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Vagas em destaque</h2>
        {[0, 1, 2].map((index) => (
          <PaidAdSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Vagas em destaque</h2>
        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Anúncio pago
        </span>
      </div>

      {ads.length === 0 ? (
        <div className="border border-dashed border-primary-200 rounded-xl p-6 text-center bg-primary-50/40">
          <p className="text-sm text-primary-700">
            Ainda não há anúncios pagos ativos. Destaque sua vaga por apenas R$ 10,00.
          </p>
          <Link
            href="/empregador/anunciar"
            className="inline-flex items-center justify-center mt-3 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Criar anúncio pago
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="border border-primary-200 bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-3">
                <Avatar
                  src={ad.empregador.image}
                  alt={ad.empregador.name || "Empregador"}
                  size={48}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                    {ad.titulo}
                  </h3>
                  <p className="text-sm text-primary-600">
                    {ad.empregador.name || "Empregador"}
                  </p>
                  {(ad.empregador.city || ad.empregador.state) && (
                    <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {[ad.empregador.city, ad.empregador.state]
                          .filter(Boolean)
                          .join(" - ")}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {ad.category && (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                  <Briefcase className="w-3 h-3" />
                  <span>{ad.category.name}</span>
                </div>
              )}

              <Link
                href={`/dashboard?vaga=${ad.id}`}
                className="mt-4 inline-flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Ver detalhes da vaga
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
