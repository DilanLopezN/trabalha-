"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Check,
  Loader2,
  Megaphone,
  Sparkles,
  Target,
} from "lucide-react";

import { Button } from "@/app/components/Button";
import { Card, CardBody } from "@/app/components/Card";
import { AdImageUpload } from "@/app/components/ad/UploadAdImage";

interface HighlightPlan {
  id: string;
  code: string;
  name: string;
  price: number;
  durationDays: number;
  priority: number;
}

type AdTargetOption = "ALL" | "WORKERS" | "EMPLOYERS";

const targetLabels: Record<AdTargetOption, string> = {
  ALL: "Todos os usuários",
  WORKERS: "Somente prestadores",
  EMPLOYERS: "Somente empregadores",
};

const planBenefits: Record<string, string[]> = {
  BRONZE: ["Exibição básica na dashboard", "Duração de 7 dias"],
  PRATA: [
    "Exibição priorizada na dashboard",
    "Duração de 15 dias",
    "Maior alcance nas buscas",
  ],
  OURO: [
    "Exposição máxima na dashboard",
    "Duração de 30 dias",
    "Alcance ampliado com destaque visual",
  ],
  PLATINA: [
    "Topo garantido por 60 dias",
    "Selo de destaque premium",
    "Maior prioridade nos filtros de busca",
  ],
};

export default function CriarAnuncioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [plans, setPlans] = useState<HighlightPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState<AdTargetOption>("ALL");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    if (checkoutStatus === "success") {
      setMessage("Pagamento confirmado! Seu anúncio será publicado automaticamente.");
    } else if (checkoutStatus === "cancelled") {
      setError("Pagamento cancelado. Você pode tentar novamente quando quiser anunciar.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user?.role && session.user.role !== "EMPREGADOR") {
      router.push("/dashboard");
      return;
    }

    const loadPlans = async () => {
      try {
        const response = await fetch("/api/highlight-plans");
        if (!response.ok) {
          throw new Error("Não foi possível carregar os planos");
        }
        const data = await response.json();
        setPlans(data.plans || []);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar planos de anúncio"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, [status, session, router]);

  const handleCheckout = async () => {
    if (!selectedPlan) {
      setError("Selecione um plano para continuar");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Informe título e descrição para o anúncio");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: selectedPlan,
          purchaseType: "ad",
          adTitle: title.trim(),
          adContent: content.trim(),
          adTarget: target,
          adImageUrl: imageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Não foi possível iniciar o checkout");
      }

      const data = await response.json();
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
      setIsProcessing(false);
    }
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
          <p className="text-gray-600">Preparando ambiente para o seu anúncio...</p>
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
            Criar anúncio destacado
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
            <Megaphone className="w-4 h-4" />
            Alcance os melhores profissionais
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Destaque suas oportunidades para atrair mais candidatos
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Crie anúncios visuais com prioridade máxima dentro da plataforma e
            atinja o público ideal para suas vagas.
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

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardBody className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Título do anúncio
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex: Preciso de equipe de manutenção predial"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={5}
                  placeholder="Explique o serviço, benefícios e como os profissionais podem entrar em contato"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition"
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">
                  Público alvo
                </span>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(Object.keys(targetLabels) as AdTargetOption[]).map((option) => {
                    const isActive = target === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setTarget(option)}
                        className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                          isActive
                            ? "border-primary-500 bg-primary-50 text-primary-600"
                            : "border-gray-200 text-gray-600 hover:border-primary-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 justify-center">
                          <Target className="w-4 h-4" />
                          {targetLabels[option]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  Escolha um plano
                </h3>
                <p className="text-sm text-gray-600">
                  Planos determinam a duração e a prioridade do seu anúncio no dashboard.
                </p>
              </div>

              <div className="space-y-3">
                {plans.map((plan) => {
                  const isSelected = selectedPlan === plan.code;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlan(plan.code);
                        setError(null);
                      }}
                      className={`w-full text-left border rounded-xl px-4 py-3 transition ${
                        isSelected
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-primary-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-semibold text-gray-900">
                            Plano {plan.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {plan.durationDays} dias de exibição
                          </p>
                        </div>
                        <span className="text-base font-semibold text-primary-600">
                          {formatPrice(plan.price)}
                        </span>
                      </div>
                      <ul className="mt-3 space-y-1 text-xs text-gray-600">
                        {(planBenefits[plan.code] || []).map((benefit) => (
                          <li key={benefit} className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-primary-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Imagem do anúncio</h3>
                <p className="text-sm text-gray-600">
                  Utilize uma imagem chamativa para destacar ainda mais sua oportunidade.
                </p>
              </div>
              <AdImageUpload
                currentImage={imageUrl || undefined}
                onImageChange={setImageUrl}
              />
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              Pagamentos processados pela Stripe. Assim que confirmados, seu anúncio
              ficará visível automaticamente para o público selecionado.
            </p>
            <p className="text-xs text-gray-500">
              Em caso de dúvidas, entre em contato com o suporte pelo e-mail
              suporte@trabalhai.com.
            </p>
          </div>
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
              "Comprar anúncio"
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500">
          Precisa de ajuda? <Link href="mailto:suporte@trabalhai.com" className="text-primary-600 hover:underline">Fale com o suporte</Link>
        </div>
      </main>
    </div>
  );
}
