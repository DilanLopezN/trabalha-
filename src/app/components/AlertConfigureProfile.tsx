"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "./Button";

interface CompleteProfileAlertProps {
  userName?: string;
}

export function CompleteProfileAlert({ userName }: CompleteProfileAlertProps) {
  return (
    <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-l-4 border-primary-600 p-6 rounded-lg shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Olá{userName ? `, ${userName}` : ""}! 👋
          </h3>
          <p className="text-gray-700 mb-4">
            Complete seu perfil em{" "}
            <span className="font-semibold">apenas 2 minutos</span> para começar
            a receber propostas e se conectar com oportunidades incríveis!
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/profile">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Completar Perfil Agora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <p className="text-sm text-gray-600 flex items-center">
              ✓ Rápido e fácil &nbsp;&nbsp; ✓ Sem complicação
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
