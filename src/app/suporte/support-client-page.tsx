"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LifeBuoy, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

import { Header } from "../components/dashboard/Header";
import { Card, CardBody, CardHeader } from "../components/Card";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";
import { Button } from "../components/Button";
import { useApi } from "@/hooks/useApi";

export default function SupportClientPage() {
  const router = useRouter();
  const { status } = useSession();
  const { api } = useApi();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (title.trim().length < 3 || description.trim().length < 20) {
      setErrorMessage(
        "Informe um título e descreva o problema com pelo menos 20 caracteres."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await api("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      setSuccessMessage(
        "Chamado enviado com sucesso! Entraremos em contato no seu email."
      );
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Erro ao enviar suporte:", error);
      setErrorMessage(
        (error as { message?: string })?.message ||
          "Não foi possível enviar o chamado. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-8">
          <p className="text-sm uppercase font-semibold text-primary-600 tracking-wide">
            Central de Suporte
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-3">
            Como podemos ajudar?
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Envie um chamado descrevendo o que está acontecendo. Nossa equipe recebe o
            pedido diretamente por email e responde usando o endereço cadastrado no
            Trabalhaí.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2" variant="elevated">
            <CardHeader className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                <LifeBuoy className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Abrir chamado</h2>
                <p className="text-sm text-gray-600">
                  Preencha o formulário para nos contar o que está acontecendo.
                </p>
              </div>
            </CardHeader>
            <CardBody>
              {successMessage && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-50 text-green-800 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 text-red-800 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                  label="Título"
                  placeholder="Ex: Não consigo concluir o pagamento"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
                <Textarea
                  label="Descrição do problema"
                  placeholder="Conte com detalhes o que estava fazendo, o que esperava que acontecesse e o que ocorreu de fato."
                  rows={6}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? "Enviando..." : "Enviar para o suporte"}
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Nossa equipe responde
              </h2>
              <p className="text-sm text-gray-600">
                O chamado é encaminhado automaticamente para
                <br />
                <strong>dilanlopez009@gmail.com</strong>
              </p>
            </CardHeader>
            <CardBody className="space-y-4 text-sm text-gray-600">
              <p>
                Inclua o máximo de detalhes possível para acelerarmos a análise. Se
                tiver prints ou anexos, conte isso na mensagem que te orientamos na
                resposta.
              </p>
              <p>
                Nossa equipe responde durante horário comercial, mas monitoramos o
                canal para emergências relacionadas a pagamentos.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
