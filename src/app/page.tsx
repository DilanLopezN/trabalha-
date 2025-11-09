import Link from "next/link";

import { Briefcase, Search, User2, Users, Zap } from "lucide-react";
import { Button } from "./components/Button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Trabalhaí</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#como-funciona"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Como funciona
            </Link>
            <Link
              href="#vantagens"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Vantagens
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/auth/signin?register=true">
              <Button>Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
            Conectando <span className="text-primary-600">Talentos</span> e{" "}
            <span className="text-primary-600">Oportunidades</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 text-balance">
            A plataforma que une prestadores de serviços e empregadores de forma
            simples, rápida e segura.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin?register=true&role=prestador">
              <Button size="lg" variant="outline" className="gap-2">
                <Users className="w-5 h-5" />
                Sou Prestador
              </Button>
            </Link>
            <Link href="/auth/signin?register=true&role=empregador">
              <Button size="lg" variant="outline" className="gap-2">
                <Briefcase className="w-5 h-5" />
                Sou Empregador
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="como-funciona" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600">Simples, rápido e eficiente</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Crie seu Perfil
              </h3>
              <p className="text-gray-600">
                Cadastre-se como prestador ou empregador e preencha suas
                informações em poucos minutos.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Encontre Oportunidades
              </h3>
              <p className="text-gray-600">
                Use nossos filtros inteligentes para encontrar exatamente o que
                procura, de forma personalizada.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Conecte-se Direto
              </h3>
              <p className="text-gray-600">
                Entre em contato via WhatsApp com apenas um clique e feche o
                negócio rapidamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section
        id="vantagens"
        className="py-20 bg-gradient-to-b from-white to-primary-50"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Por que escolher o Trabalhaí?
              </h2>
              <p className="text-xl text-gray-600">
                Vantagens para todos os lados
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold text-primary-600 mb-6">
                  Para Prestadores
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      Encontre clientes que procuram exatamente seu serviço
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      Destaque seu perfil e receba mais propostas
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      Gerencie sua disponibilidade e preços com facilidade
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-primary-600 mb-6">
                  Para Empregadores
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      Encontre profissionais qualificados rapidamente
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      Filtre por preço, disponibilidade e categoria
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">
                      Contato direto sem intermediários ou taxas escondidas
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de prestadores e empregadores que já encontraram
            o que procuravam
          </p>
          <Link href="/auth/signin?register=true">
            <Button size="lg" variant="secondary" className="text-primary-600">
              Criar Conta Grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-white">Trabalhaí</span>
            </div>
            <p className="text-sm">
              © 2024 Trabalhaí. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
