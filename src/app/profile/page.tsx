"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  DollarSign,
  FileText,
  Calendar,
  Save,
  ArrowLeft,
} from "lucide-react";

import { Card, CardBody, CardHeader } from "../components/Card";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { Button } from "../components/Button";
import { ProfilePhotoUpload } from "../components/profile/PhotoUpload";
import { ResumeUpload } from "../components/profile/ResumeUpload";
import { WeekScheduleSelector } from "../components/WeekSelector";

interface WeekSchedule {
  [key: string]: {
    enabled: boolean;
    slots: { start: string; end: string }[];
  };
}

// Mock categories
const categories = [
  { value: "", label: "Selecione uma categoria" },
  { value: "1", label: "Elétrica" },
  { value: "2", label: "Hidráulica" },
  { value: "3", label: "Limpeza" },
  { value: "4", label: "Pintura" },
  { value: "5", label: "Marcenaria" },
  { value: "6", label: "Jardinagem" },
  { value: "7", label: "Babá" },
  { value: "8", label: "Cuidador" },
  { value: "9", label: "Pedreiro" },
];

const accountTypes = [
  { value: "", label: "Selecione o tipo de conta" },
  { value: "PRESTADOR", label: "Prestador de Serviços" },
  { value: "EMPREGADOR", label: "Empregador" },
];

const estados = [
  { value: "", label: "Selecione o estado" },
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export default function ProfilePage() {
  // Estados do formulário
  const [accountType, setAccountType] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cnpj, setCnpj] = useState("");

  // Endereço
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Campos específicos
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [budget, setBudget] = useState("");
  const [advertisedService, setAdvertisedService] = useState("");

  // Uploads
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);

  // Disponibilidade
  const [schedule, setSchedule] = useState<WeekSchedule>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Salvando perfil...", {
      accountType,
      name,
      email,
      whatsapp,
      cnpj,
      address: { cep, street, number, complement, neighborhood, city, state },
      category,
      description,
      hourlyRate,
      budget,
      advertisedService,
      schedule,
      profilePhoto,
      resume,
    });
    alert("Perfil salvo com sucesso! (simulação)");
  };

  const formatWhatsApp = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    // Formata (XX) XXXXX-XXXX
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
            <div className="w-20" /> {/* Spacer para centralizar */}
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto de Perfil */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Foto de Perfil
              </h2>
            </CardHeader>
            <CardBody>
              <ProfilePhotoUpload
                currentPhoto={undefined}
                onPhotoChange={setProfilePhoto}
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
              <Select
                label="Tipo de Conta *"
                options={accountTypes}
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                fullWidth
              />

              <Input
                label="Nome Completo *"
                placeholder="João Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Email *"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />

                <Input
                  label="WhatsApp"
                  placeholder="(11) 99999-9999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                  fullWidth
                />
              </div>

              <Input
                label="CNPJ (opcional)"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
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
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="CEP"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(formatCEP(e.target.value))}
                  fullWidth
                />
                <div className="md:col-span-2">
                  <Input
                    label="Rua"
                    placeholder="Nome da rua"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    fullWidth
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Número"
                  placeholder="123"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  fullWidth
                />
                <div className="md:col-span-2">
                  <Input
                    label="Complemento"
                    placeholder="Apto 45"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    fullWidth
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Bairro"
                  placeholder="Centro"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  fullWidth
                />
                <Input
                  label="Cidade"
                  placeholder="São Paulo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  fullWidth
                />
                <Select
                  label="Estado"
                  options={estados}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
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
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    fullWidth
                  />

                  <Textarea
                    label="Descrição dos Serviços *"
                    placeholder="Descreva sua experiência e os serviços que você oferece..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                  />

                  <Input
                    label="Valor por Hora *"
                    type="number"
                    placeholder="50.00"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
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
                    currentResume={undefined}
                    onResumeChange={setResume}
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
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  fullWidth
                />

                <Textarea
                  label="Descrição do Serviço Anunciado *"
                  placeholder="Descreva o serviço que você precisa..."
                  rows={4}
                  value={advertisedService}
                  onChange={(e) => setAdvertisedService(e.target.value)}
                  fullWidth
                />

                <Input
                  label="Orçamento Disponível *"
                  type="number"
                  placeholder="500.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  fullWidth
                />
              </CardBody>
            </Card>
          )}

          {/* Disponibilidade - Para ambos os tipos */}
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
                <WeekScheduleSelector value={schedule} onChange={setSchedule} />
              </CardBody>
            </Card>
          )}

          {/* Botão Salvar */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" size="lg">
              Cancelar
            </Button>
            <Button
              type="submit"
              size="lg"
              variant="black"
              className="gap-2 bg-cyan-200 text-black hover:bg-cyan-300"
            >
              <Save className="w-5 h-5" />
              Salvar Perfil
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
