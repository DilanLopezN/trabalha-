"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Input } from "../../components/Input";
import { Textarea } from "../../components/Textarea";
import { Button } from "../../components/Button";
import { Select } from "../../components/Select";
import { Card, CardBody, CardHeader } from "../../components/Card";
import { useApi } from "@/hooks/useApi";

const vagaSchema = z.object({
  titulo: z.string().min(5, "Título deve ter no mínimo 5 caracteres"),
  descricao: z.string().min(20, "Descrição deve ter no mínimo 20 caracteres"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  salarioTipo: z.enum(["FIXO", "A_COMBINAR"]),
  salarioValor: z.string().optional(),
});

type VagaFormData = z.infer<typeof vagaSchema>;

interface Etapa {
  nome: string;
  ordem: number;
}

export default function CriarVagaPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [novaEtapa, setNovaEtapa] = useState("");
  const { api } = useApi();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VagaFormData>({
    resolver: zodResolver(vagaSchema),
  });

  const salarioTipo = watch("salarioTipo");

  const loadCategories = useCallback(async () => {
    try {
      const { categories: cats } = await api("/api/categories");
      setCategories([
        { value: "", label: "Selecione uma categoria" },
        ...cats.map((cat: any) => ({
          value: cat.id,
          label: cat.name,
        })),
      ]);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  }, [api]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const adicionarEtapa = () => {
    if (novaEtapa.trim()) {
      setEtapas([...etapas, { nome: novaEtapa, ordem: etapas.length + 1 }]);
      setNovaEtapa("");
    }
  };

  const removerEtapa = (ordem: number) => {
    setEtapas(etapas.filter((e) => e.ordem !== ordem));
  };

  const onSubmit = async (data: VagaFormData) => {
    try {
      await api("/api/vagas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: data.titulo,
          descricao: data.descricao,
          categoryId: data.categoryId,
          salarioTipo: data.salarioTipo,
          salarioValor:
            data.salarioTipo === "FIXO" && data.salarioValor
              ? parseFloat(data.salarioValor)
              : null,
          etapas: etapas.length > 0 ? etapas : undefined,
        }),
      });

      alert("Vaga criada com sucesso!");
      router.push("/empregador");
    } catch (error) {
      console.error("Erro ao criar vaga:", error);
      const message =
        error instanceof Error
          ? error.message
          : (error as { message?: string })?.message || "Erro ao criar vaga";
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/empregador"
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Criar Nova Vaga
          </h1>
          <p className="text-gray-600">
            Preencha os detalhes e encontre o profissional ideal
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Informações Básicas
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Título da Vaga *"
                placeholder="Ex: Desenvolvedor Full Stack"
                {...register("titulo")}
                error={errors.titulo?.message}
                fullWidth
              />

              <Select
                label="Categoria *"
                options={categories}
                {...register("categoryId")}
                error={errors.categoryId?.message}
                fullWidth
              />

              <Textarea
                label="Descrição da Vaga *"
                placeholder="Descreva as responsabilidades, requisitos e benefícios..."
                rows={6}
                {...register("descricao")}
                error={errors.descricao?.message}
                fullWidth
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Remuneração
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Salário *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:border-primary-500">
                    <input
                      type="radio"
                      value="FIXO"
                      {...register("salarioTipo")}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span>Valor Fixo</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:border-primary-500">
                    <input
                      type="radio"
                      value="A_COMBINAR"
                      {...register("salarioTipo")}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span>A Combinar</span>
                  </label>
                </div>
                {errors.salarioTipo && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.salarioTipo.message}
                  </p>
                )}
              </div>

              {salarioTipo === "FIXO" && (
                <Input
                  label="Valor (R$) *"
                  type="number"
                  step="0.01"
                  placeholder="5000.00"
                  {...register("salarioValor")}
                  error={errors.salarioValor?.message}
                  fullWidth
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Etapas do Processo Seletivo (Opcional)
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Entrevista com RH"
                  value={novaEtapa}
                  onChange={(e) => setNovaEtapa(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), adicionarEtapa())
                  }
                  fullWidth
                />
                <Button
                  type="button"
                  onClick={adicionarEtapa}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              </div>

              {etapas.length > 0 && (
                <div className="space-y-2">
                  {etapas.map((etapa) => (
                    <div
                      key={etapa.ordem}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {etapa.ordem}
                        </span>
                        <span className="text-gray-900">{etapa.nome}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerEtapa(etapa.ordem)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => router.push("/empregador")}
            >
              Cancelar
            </Button>
            <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                "Publicar Vaga"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
