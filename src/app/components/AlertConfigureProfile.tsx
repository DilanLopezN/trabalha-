"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, X } from "lucide-react";
import { Button } from "./Button";

interface CompleteProfileAlertProps {
  userName?: string;
  role?: "PRESTADOR" | "EMPREGADOR";
  onDismiss?: () => void;
}

export function CompleteProfileAlert({
  userName,
  role = "PRESTADOR",
  onDismiss,
}: CompleteProfileAlertProps) {
  const isEmployer = role === "EMPREGADOR";
  const greeting = `Olá${userName ? `, ${userName}` : ""}!`;
  const title = isEmployer
    ? `${greeting} Vamos anunciar sua vaga?`
    : `${greeting} 👋`;
  const description = isEmployer
    ? "Complete seu perfil de empregador para liberar seus anúncios e atrair os melhores profissionais."
    : "Complete seu perfil em apenas 2 minutos para começar a receber propostas e se conectar com oportunidades incríveis!";
  const cta = isEmployer
    ? { href: "/empregador/criar", label: "Anunciar uma vaga" }
    : { href: "/profile", label: "Completar Perfil Agora" };
  const helperText = isEmployer
    ? "✓ Publique sua vaga em minutos  ✓ Alcance os melhores prestadores"
    : "✓ Rápido e fácil  ✓ Sem complicação";

  return (
    <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-l-4 border-primary-600 p-6 rounded-lg shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-700 mb-4">{description}</p>
            </div>

            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar lembrete"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={cta.href}>
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                {cta.label}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <p className="text-sm text-gray-600 flex items-center">{helperText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
