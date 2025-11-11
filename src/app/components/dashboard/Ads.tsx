"use client";

import Link from "next/link";
import { Ad } from "@/interfaces";
import { Card, CardBody } from "../Card";
import { ExternalLink } from "lucide-react";

interface AdsProps {
  ads: Ad[];
}

function AdBadge({ planCode }: { planCode: string }) {
  const badges = {
    BRONZE: { color: "bg-amber-700", text: "Bronze" },
    PRATA: { color: "bg-gray-400", text: "Prata" },
    OURO: { color: "bg-yellow-500", text: "Ouro" },
    PLATINA: { color: "bg-purple-600", text: "Platina" },
  };

  const badge = badges[planCode as keyof typeof badges];
  if (!badge) return null;

  return (
    <span
      className={`${badge.color} text-white text-xs font-bold px-2 py-1 rounded-full`}
    >
      ⭐ {badge.text}
    </span>
  );
}

export function Ads({ ads }: AdsProps) {
  if (ads.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Anúncios em Destaque
        </h2>
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                Nenhum anúncio ativo no momento
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Anúncios em Destaque
      </h2>

      <div className="space-y-4">
        {ads.map((ad) => (
          <Card
            key={ad.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            {ad.imageUrl && (
              <div className="relative w-full h-32 bg-gray-200">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardBody className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                  {ad.title}
                </h3>
                {ad.plan && <AdBadge planCode={ad.plan.code} />}
              </div>

              <p className="text-xs text-gray-600 line-clamp-3">{ad.content}</p>

              <button className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
                <span>Saiba mais</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Banner promocional */}
      <Card className="bg-gradient-to-br from-primary-600 to-primary-700">
        <CardBody className="text-center text-white space-y-2 py-6">
          <h3 className="font-bold text-lg">Destaque seu perfil!</h3>
          <p className="text-sm text-primary-100">
            Apareça primeiro nas buscas e conquiste mais clientes
          </p>
          <Link
            href="/prestador/comprar-destaque"
            className="inline-flex items-center justify-center mt-2 bg-white text-primary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Comprar Destaque
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
