"use client";

import {
  X,
  MessageCircle,
  FileText,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  MapPin,
} from "lucide-react";
import { Button } from "../Button";
import { Card, CardBody, CardHeader } from "../Card";
import { SearchResult, WorkerProfile, EmployerProfile } from "@/interfaces";
import { Avatar } from "../Avatar";

interface ProfileModalProps {
  result: SearchResult | null;
  isOpen: boolean;
  onClose: () => void;
}

const DAYS_PT: Record<string, string> = {
  mon: "Segunda-feira",
  tue: "Terça-feira",
  wed: "Quarta-feira",
  thu: "Quinta-feira",
  fri: "Sexta-feira",
  sat: "Sábado",
  sun: "Domingo",
};

export function ProfileModal({ result, isOpen, onClose }: ProfileModalProps) {
  if (!isOpen || !result) return null;

  const isWorker = result.role === "PRESTADOR";
  const profile = result.profile as WorkerProfile | EmployerProfile;

  const whatsappLink = result.whatsapp
    ? (() => {
        const cleanedNumber = result.whatsapp
          .replace(/\D/g, "") // remove tudo que não for número
          .replace(/^0+/, ""); // remove zeros à esquerda se houver

        const message = isWorker
          ? `Olá ${result.name}! Tenho interesse nos seus serviços. Podemos conversar?`
          : `Olá ${result.name}! Tenho interesse na vaga anunciada. Podemos conversar?`;

        return `https://wa.me/55${cleanedNumber}?text=${encodeURIComponent(
          message
        )}`;
      })()
    : null;

  const availability = profile.availability || {};
  const availableDays = Object.entries(availability).filter(
    ([_, slots]) => slots && slots.length > 0
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Perfil de {result.name}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Foto e Informações Básicas */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar
                src={result.image}
                alt={result.name}
                size={128}
                className="ring-4 ring-primary-50"
                fallbackClassName="text-4xl"
              />

              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {result.name}
                </h3>
                {(result.city || result.state) && (
                  <p className="flex items-center gap-2 text-gray-500 justify-center sm:justify-start mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {[result.city, result.state].filter(Boolean).join(" - ")}
                    </span>
                  </p>
                )}
                {isWorker ? (
                  <>
                    <p className="text-lg text-primary-600 font-medium mb-1">
                      {(profile as WorkerProfile).category?.name}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 mb-4">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-lg font-semibold">
                        R$ {(profile as WorkerProfile).averagePrice.toFixed(2)}
                        /hora
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-lg text-primary-600 font-medium mb-4">
                    Empregador
                  </p>
                )}

                <Button
                  onClick={() =>
                    whatsappLink && window.open(whatsappLink, "_blank")
                  }
                  disabled={!whatsappLink}
                  className="gap-2 w-full sm:w-auto"
                >
                  <MessageCircle className="w-5 h-5" />
                  Conversar no WhatsApp
                </Button>
              </div>
            </div>

            {/* Descrição / Serviço */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    {isWorker ? "Sobre o Profissional" : "Serviço Anunciado"}
                  </h4>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {isWorker
                    ? (profile as WorkerProfile).description
                    : (profile as EmployerProfile).advertisedService}
                </p>
                {!isWorker && (profile as EmployerProfile).category && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Categoria:</strong>{" "}
                      {(profile as EmployerProfile).category?.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Orçamento:</strong> R${" "}
                      {(profile as EmployerProfile).budget.toFixed(2)}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Currículo (só para prestadores) */}
            {isWorker && (profile as WorkerProfile).resumeUrl && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Currículo
                    </h4>
                  </div>
                </CardHeader>
                <CardBody>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const url = (profile as WorkerProfile).resumeUrl;
                      if (typeof url === "string") window.open(url, "_blank");
                    }}
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Visualizar Currículo
                  </Button>
                </CardBody>
              </Card>
            )}

            {/* Disponibilidade */}
            {availableDays.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Disponibilidade
                    </h4>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {availableDays.map(([day, slots]) => (
                      <div
                        key={day}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="font-medium text-gray-900">
                            {DAYS_PT[day] || day}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(slots as any[]).map((slot, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm"
                            >
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="text-gray-700">
                                {slot.start} - {slot.end}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
                <Button
                  onClick={() =>
                    whatsappLink && window.open(whatsappLink, "_blank")
                  }
                  disabled={!whatsappLink}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                >
                  <MessageCircle className="w-4 h-4" />
                  Entrar em Contato
                </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
