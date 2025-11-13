"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Check, Loader2, Sparkles, Star, Zap } from "lucide-react";

import { Button } from "@/app/components/Button";
import { Card, CardBody } from "@/app/components/Card";
import { useApi } from "@/hooks/useApi";

const PIX_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_PIX_WHATSAPP_NUMBER || "";

interface HighlightPlan {
  id: string;
  code: string;
  name: string;
  price: number;
  durationDays: number;
  priority: number;
}

const perks: Record<string, string[]> = {
  BRONZE: [
    "Prioridade básica nas buscas",
    "Selo Bronze no perfil",
    "Duração de 7 dias",
  ],
  PRATA: [
    "Prioridade intermediária nas buscas",
    "Selo Prata no perfil",
    "Duração de 15 dias",
  ],
  OURO: [
    "Alta prioridade nas buscas",
    "Selo Ouro no perfil",
    "Duração de 30 dias",
  ],
  PLATINA: [
    "Máxima prioridade nas buscas",
    "Selo Platina no perfil",
    "Duração de 60 dias",
  ],
};

export default function ComprarDestaquePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { api } = useApi();
  const [plans, setPlans] = useState<HighlightPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPlanData = useMemo(
    () => plans.find((plan) => plan.code === selectedPlan) || null,
    [plans, selectedPlan]
  );

  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    if (checkoutStatus === "success") {
      setMessage(
        "Pagamento confirmado! Seu destaque será ativado em instantes."
      );
    } else if (checkoutStatus === "cancelled") {
      setError(
        "Pagamento cancelado. Tente novamente quando desejar destacar seu perfil."
      );
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user?.role && session.user.role !== "PRESTADOR") {
      router.push("/dashboard");
      return;
    }

    const loadPlans = async () => {
      try {
        const data = await api("/api/highlight-plans");
        setPlans(data.plans || []);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar planos de destaque"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, [status, session, router, api]);

  const handleCheckout = async () => {
    if (!selectedPlan) {
      setError("Selecione um plano para continuar");
      return;
    }

    setError(null);
    setMessage(null);
    setIsProcessing(true);

    try {
      const data: any = await api("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: selectedPlan,
          purchaseType: "highlight",
        }),
      });
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao redirecionar para o checkout"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePixCheckout = () => {
    setError(null);
    setMessage(null);

    if (!selectedPlanData) {
      setError("Selecione um plano para continuar");
      return;
    }

    if (!PIX_WHATSAPP_NUMBER) {
      setError(
        "Opção de pagamento via PIX indisponível. Tente novamente mais tarde."
      );
      return;
    }

    const sanitizedNumber = PIX_WHATSAPP_NUMBER.replace(/\D/g, "");

    if (!sanitizedNumber) {
      setError(
        "Número de WhatsApp para pagamento via PIX não está configurado corretamente."
      );
      return;
    }

    const pixMessage = `ola tenho interesse no destaque ${selectedPlanData.name} com pagamento em pix`;
    const whatsappUrl = `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent(
      pixMessage
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  const formatPrice = (price: number) =>
    price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">
            Comprar destaque
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Aumente sua visibilidade
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Escolha o plano ideal para destacar seu perfil
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Planos de destaque colocam seu perfil nas primeiras posições de
            busca e adicionam selos especiais para mostrar que você é prioridade
            na plataforma.
          </p>
        </div>

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.code;
            return (
              <Card
                key={plan.id}
                className={`relative transition-transform hover:-translate-y-1 cursor-pointer ${
                  isSelected ? "ring-2 ring-primary-500" : ""
                }`}
                onClick={() => {
                  setSelectedPlan(plan.code);
                  setError(null);
                }}
              >
                {plan.priority === 4 && (
                  <span className="absolute top-3 right-3 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Mais vendido
                  </span>
                )}
                <CardBody className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary-500" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Plano {plan.name}
                      </h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatPrice(plan.price)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Válido por {plan.durationDays} dias
                    </p>
                  </div>

                  <ul className="space-y-2 text-sm text-gray-600">
                    {(perks[plan.code] || []).map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary-500 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isSelected ? "primary" : "secondary"}
                    className="w-full"
                  >
                    {isSelected ? "Selecionado" : "Selecionar"}
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              O pagamento é processado com segurança pela Stripe, com opções de
              cartão ou boleto. Assim que a compra for confirmada, seu destaque
              será ativado automaticamente.
            </p>
            <p className="text-xs text-gray-500">
              Em caso de dúvidas, entre em contato com o suporte pelo e-mail
              suporte@trabalhai.com.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              size="lg"
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full md:w-auto"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecionando...
                </span>
              ) : (
                "Pagar com cartão ou boleto"
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handlePixCheckout}
              className="w-full md:w-auto"
            >
              Falar no WhatsApp para pagar com PIX
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          Precisa de ajuda?{" "}
          <Link
            href="mailto:suporte@trabalhai.com"
            className="text-primary-600 hover:underline"
          >
            Fale com o suporte
          </Link>
        </div>
      </main>
    </div>
  );
}
