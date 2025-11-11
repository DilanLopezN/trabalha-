import {
  Heart,
  Briefcase,
  DollarSign,
  Calendar,
  Building2,
} from "lucide-react";
import { Button } from "../Button";
import { Card, CardBody } from "../Card";
import { useState } from "react";

interface VagaCardProps {
  vaga: {
    id: string;
    titulo: string;
    descricao: string;
    salarioTipo: "FIXO" | "A_COMBINAR";
    salarioValor: number | null;
    category: { name: string };
    empregador: { name: string; image: string | null };
    favoritos: any[];
    candidaturas: any[];
    etapas: Array<{ nome: string; ordem: number }>;
    createdAt: string;
  };
  onFavoritar: (vagaId: string) => void;
  onCandidatar: (vagaId: string) => void;
}

export function VagaCard({ vaga, onFavoritar, onCandidatar }: VagaCardProps) {
  const [isFavorited, setIsFavorited] = useState(vaga?.favoritos?.length > 0);
  const [isCandidated, setIsCandidated] = useState(
    vaga.candidaturas?.length > 0
  );

  const handleFavoritar = async () => {
    await onFavoritar(vaga.id);
    setIsFavorited(!isFavorited);
  };

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardBody className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {vaga.titulo}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="w-4 h-4" />
              <span>{vaga?.empregador?.name}</span>
            </div>
          </div>

          <button
            onClick={handleFavoritar}
            className={`transition-colors ${
              isFavorited ? "text-red-500" : "text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart className={`w-6 h-6 ${isFavorited ? "fill-current" : ""}`} />
          </button>
        </div>

        <p className="text-gray-700 line-clamp-2">{vaga.descricao}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            <span>{vaga?.category?.name}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(vaga?.createdAt).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>

        {vaga.etapas?.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-medium text-blue-900 mb-2">
              Etapas do Processo:
            </p>
            <div className="flex flex-wrap gap-2">
              {vaga.etapas?.map((etapa) => (
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

        <Button
          fullWidth
          onClick={() => onCandidatar(vaga.id)}
          disabled={isCandidated}
        >
          {isCandidated ? "Já Candidatado" : "Candidatar-se"}
        </Button>
      </CardBody>
    </Card>
  );
}
