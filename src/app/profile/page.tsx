"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  MapPin,
  Briefcase,
  FileText,
  Calendar,
  Save,
  ArrowLeft,
  Loader2,
  Search,
} from "lucide-react";
import { BRAZIL_STATES } from "@/constants/brazil-states";

import { Card, CardBody, CardHeader } from "../components/Card";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { Button } from "../components/Button";
import { ProfilePhotoUpload } from "../components/profile/PhotoUpload";
import { ResumeUpload } from "../components/profile/ResumeUpload";
import { WeekScheduleSelector } from "../components/WeekSelector";
import { useApi } from "@/hooks/useApi";

const stateSelectOptions = [
  { value: "", label: "Selecione o estado" },
  ...BRAZIL_STATES,
];

// Schema de validação
const baseProfileSchema = z.object({
  // Básico
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  whatsapp: z.string().optional(),
  cnpj: z.string().optional(),
  profilePhotoUrl: z.string().nullable().optional(),

  // Endereço
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),

  // Prestador
  categoryId: z.string().optional(),
  description: z.string().optional(),
  hourlyRate: z.string().optional(),
  resumeUrl: z.string().nullable().optional(),

  // Empregador
  advertisedService: z.string().optional(),
  budget: z.string().optional(),

  // Disponibilidade
  availability: z
    .record(
      z.object({
        enabled: z.boolean(),
        slots: z.array(
          z.object({
            start: z.string(),
            end: z.string(),
          })
        ),
      })
    )
    .optional(),
});

type ProfileFormData = z.infer<typeof baseProfileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { api } = useApi();
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const accountType = session?.user?.role;
  const validationSchema = useMemo(
    () =>
      baseProfileSchema.superRefine((data, ctx) => {
        if (accountType === "PRESTADOR") {
          if (!data.whatsapp || !data.whatsapp.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["whatsapp"],
              message: "WhatsApp é obrigatório para prestadores",
            });
          }
        }
      }),
    [accountType]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      availability: {},
    },
  });
  const availability = watch("availability") || {};
  const cep = watch("cep");

  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const { categories: cats } = await api("/api/categories");
      console.log("📦 Categorias carregadas:", cats);
      setCategories([
        { value: "", label: "Selecione uma categoria" },
        ...cats.map((cat: any) => ({
          value: cat.id,
          label: cat.name,
        })),
      ]);
    } catch (error) {
      console.error("❌ Erro ao carregar categorias:", error);
      setCategories([{ value: "", label: "Erro ao carregar categorias" }]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [api]);

  const loadProfile = useCallback(async () => {
    try {
      const { user } = await api("/api/profile");
      console.log("👤 Perfil carregado:", user);

      // Preparar dados para o formulário
      const formData: Partial<ProfileFormData> = {
        name: user.name || "",
        email: user.email || "",
        whatsapp: user.whatsapp || "",
        cnpj: user.cnpj || "",
        profilePhotoUrl: user.image || null, // Carregar foto
        // Endereço
        cep: user.cep || "",
        street: user.street || "",
        number: user.number || "",
        complement: user.complement || "",
        neighborhood: user.neighborhood || "",
        city: user.city || "",
        state: user.state || "",
      };

      // Carregar perfil específico
      if (user.role === "PRESTADOR" && user.workerProfile) {
        const profile = user.workerProfile;
        formData.categoryId = profile.categoryId || "";
        formData.description = profile.description || "";
        formData.hourlyRate = profile.averagePrice?.toString() || "";
        formData.resumeUrl = profile.resumeUrl || null;

        // Converter disponibilidade
        const availabilityData: Record<string, any> = {};
        const profileAvailability = profile.availability || {};
        Object.keys(profileAvailability).forEach((day) => {
          availabilityData[day] = {
            enabled: true,
            slots: profileAvailability[day] || [],
          };
        });
        formData.availability = availabilityData;
      } else if (user.role === "EMPREGADOR" && user.employerProfile) {
        const profile = user.employerProfile;
        formData.categoryId = profile.categoryId || "";
        formData.advertisedService = profile.advertisedService || "";
        formData.budget = profile.budget?.toString() || "";

        // Converter disponibilidade
        const availabilityData: Record<string, any> = {};
        const profileAvailability = profile.availability || {};
        Object.keys(profileAvailability).forEach((day) => {
          availabilityData[day] = {
            enabled: true,
            slots: profileAvailability[day] || [],
          };
        });
        formData.availability = availabilityData;
      }

      reset(formData);
    } catch (error) {
      console.error("❌ Erro ao carregar perfil:", error);
    }
  }, [api, reset]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      loadCategories();
      loadProfile();
    }
  }, [status, router, loadCategories, loadProfile]);

  const searchCep = async () => {
    if (!cep) return;

    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      alert("CEP inválido. Digite 8 dígitos.");
      return;
    }

    setIsLoadingCep(true);
    try {
      const data = await api(`/api/cep?cep=${cleanCep}`);
      console.log("📍 Endereço encontrado:", data);

      // Preencher os campos
      setValue("street", data.street || "");
      setValue("neighborhood", data.neighborhood || "");
      setValue("city", data.city || "");
      setValue("state", data.state || "");
      if (data.complement) {
        setValue("complement", data.complement);
      }

      // Focar no campo número
      setTimeout(() => {
        const numberInput = document.querySelector(
          'input[name="number"]'
        ) as HTMLInputElement;
        if (numberInput) {
          numberInput.focus();
        }
      }, 100);
    } catch (error) {
      console.error("❌ Erro ao buscar CEP:", error);
      const message =
        error instanceof Error
          ? error.message
          : (error as { message?: string })?.message ||
            "Erro ao buscar CEP. Tente novamente.";
      alert(message);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    console.log("🔍 Dados do formulário:", data);

    try {
      await api("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          whatsapp: data.whatsapp?.trim(),
          cnpj: data.cnpj,
          profilePhotoUrl: data.profilePhotoUrl,
          resumeUrl: data.resumeUrl,
          address: {
            cep: data.cep,
            street: data.street,
            number: data.number,
            complement: data.complement,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
          },
          categoryId: data.categoryId,
          description: data.description,
          hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : undefined,
          budget: data.budget ? parseFloat(data.budget) : undefined,
          advertisedService: data.advertisedService,
          availability: data.availability,
        }),
      });

      alert("Perfil salvo com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      console.error("❌ Erro ao salvar perfil:", error);
      const message =
        error instanceof Error
          ? error.message
          : (error as { message?: string })?.message ||
            "Erro ao salvar perfil";
      alert(message);
    }
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return value;
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substring(0, 18);
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/^(\d{5})(\d)/, "$1-$2").substring(0, 9);
  };

  if (status === "loading" || isLoadingCategories) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600 hover:text-primary-600 transition-colors">
                Voltar
              </span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Trabalhaí
              </span>
            </Link>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">
            Complete seu perfil para começar a receber propostas
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Foto de Perfil */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Foto de Perfil
              </h2>
            </CardHeader>
            <CardBody>
              <ProfilePhotoUpload
                currentPhoto={watch("profilePhotoUrl") || undefined}
                onPhotoChange={(url) => setValue("profilePhotoUrl", url)}
              />
            </CardBody>
          </Card>

          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Informações Básicas
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                <p className="text-sm text-primary-800">
                  <strong>Tipo de conta:</strong>{" "}
                  {accountType === "PRESTADOR"
                    ? "Prestador de Serviços"
                    : "Empregador"}
                </p>
              </div>

              <Input
                label="Nome Completo *"
                placeholder="João Silva"
                {...register("name")}
                error={errors.name?.message}
                fullWidth
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Email *"
                  type="email"
                  placeholder="seu@email.com"
                  {...register("email")}
                  disabled
                  fullWidth
                />

                <Input
                  label="WhatsApp *"
                  placeholder="(11) 99999-9999"
                  {...register("whatsapp")}
                  onChange={(e) => {
                    const formatted = formatWhatsApp(e.target.value);
                    setValue("whatsapp", formatted);
                  }}
                  error={errors.whatsapp?.message}
                  fullWidth
                />
              </div>

              <Input
                label="CNPJ (opcional)"
                placeholder="00.000.000/0000-00"
                {...register("cnpj")}
                onChange={(e) => {
                  const formatted = formatCNPJ(e.target.value);
                  setValue("cnpj", formatted);
                }}
                fullWidth
              />
            </CardBody>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Endereço
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    label="CEP"
                    placeholder="00000-000"
                    {...register("cep")}
                    onChange={(e) => {
                      const formatted = formatCEP(e.target.value);
                      setValue("cep", formatted);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        searchCep();
                      }
                    }}
                    fullWidth
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={searchCep}
                    disabled={isLoadingCep}
                    className="gap-2"
                  >
                    {isLoadingCep ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Buscar
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Rua"
                    placeholder="Nome da rua"
                    {...register("street")}
                    fullWidth
                  />
                </div>
                <Input
                  label="Número"
                  placeholder="123"
                  {...register("number")}
                  fullWidth
                />
              </div>

              <Input
                label="Complemento"
                placeholder="Apto 45"
                {...register("complement")}
                fullWidth
              />

              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Bairro"
                  placeholder="Centro"
                  {...register("neighborhood")}
                  fullWidth
                />
                <Input
                  label="Cidade"
                  placeholder="São Paulo"
                  {...register("city")}
                  fullWidth
                />
                <Select
                  label="Estado"
                  options={stateSelectOptions}
                  {...register("state")}
                  fullWidth
                />
              </div>
            </CardBody>
          </Card>

          {/* Campos específicos para PRESTADOR */}
          {accountType === "PRESTADOR" && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Informações Profissionais
                    </h2>
                  </div>
                </CardHeader>
                <CardBody className="space-y-4">
                  <Select
                    label="Categoria do Serviço *"
                    options={categories}
                    {...register("categoryId")}
                    error={errors.categoryId?.message}
                    fullWidth
                  />

                  <Textarea
                    label="Descrição dos Serviços *"
                    placeholder="Descreva sua experiência e os serviços que você oferece..."
                    rows={4}
                    {...register("description")}
                    error={errors.description?.message}
                    fullWidth
                  />

                  <Input
                    label="Valor por Hora *"
                    type="number"
                    step="0.01"
                    placeholder="50.00"
                    {...register("hourlyRate")}
                    error={errors.hourlyRate?.message}
                    fullWidth
                  />
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Currículo
                    </h2>
                  </div>
                </CardHeader>
                <CardBody>
                  <ResumeUpload
                    currentResume={watch("resumeUrl") || undefined}
                    onResumeChange={(url) => setValue("resumeUrl", url)}
                  />
                </CardBody>
              </Card>
            </>
          )}

          {/* Campos específicos para EMPREGADOR */}
          {accountType === "EMPREGADOR" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Informações do Serviço
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <Select
                  label="Categoria do Serviço Procurado"
                  options={categories}
                  {...register("categoryId")}
                  fullWidth
                />

                <Textarea
                  label="Descrição do Serviço Anunciado *"
                  placeholder="Descreva o serviço que você precisa..."
                  rows={4}
                  {...register("advertisedService")}
                  error={errors.advertisedService?.message}
                  fullWidth
                />

                <Input
                  label="Orçamento Disponível *"
                  type="number"
                  step="0.01"
                  placeholder="500.00"
                  {...register("budget")}
                  error={errors.budget?.message}
                  fullWidth
                />
              </CardBody>
            </Card>
          )}

          {/* Disponibilidade */}
          {accountType && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Disponibilidade Semanal
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Selecione os dias e horários em que você está disponível
                </p>
              </CardHeader>
              <CardBody>
                <WeekScheduleSelector
                  value={availability}
                  onChange={(schedule) => setValue("availability", schedule)}
                />
              </CardBody>
            </Card>
          )}

          {/* Botões */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="gap-2 bg-cyan-200 text-black hover:bg-cyan-300 w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Perfil
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
