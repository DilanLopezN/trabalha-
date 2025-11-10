"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Mail, Lock, Chrome } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/app/components/Card";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegister = searchParams.get("register") === "true";
  const role = searchParams.get("role");

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email inválido";
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    }

    if (isRegister && !name) {
      newErrors.name = "Nome é obrigatório";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      if (isRegister) {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            name,
            role: role || "PRESTADOR",
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Erro ao criar conta");
        }

        // Após registro, fazer login
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setErrors({ general: "Erro ao fazer login após registro" });
        } else {
          router.push("/dashboard");
        }
      } else {
        // Login
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setErrors({ general: "Credenciais inválidas" });
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Erro ao processar solicitação",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      setErrors({ general: "Erro ao fazer login com Google" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">Trabalhaí</span>
        </Link>

        <Card variant="elevated">
          <CardHeader>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {isRegister ? "Criar Conta" : "Entrar"}
              </h1>
              <p className="text-gray-600 mt-2">
                {isRegister
                  ? role === "empregador"
                    ? "Cadastre-se como empregador"
                    : "Cadastre-se como prestador de serviços"
                  : "Bem-vindo de volta!"}
              </p>
            </div>
          </CardHeader>

          <CardBody>
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <Input
                  label="Nome completo"
                  type="text"
                  placeholder="João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  disabled={isLoading}
                  fullWidth
                />
              )}

              <div className="relative">
                <Input
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  disabled={isLoading}
                  fullWidth
                />
                <Mail className="absolute right-3 top-9 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <Input
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  disabled={isLoading}
                  fullWidth
                />
                <Lock className="absolute right-3 top-9 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {!isRegister && (
                <div className="flex justify-end">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              )}

              <Button type="submit" fullWidth size="lg" disabled={isLoading}>
                {isLoading
                  ? "Processando..."
                  : isRegister
                  ? "Criar Conta"
                  : "Entrar"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Ou continue com
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              fullWidth
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="gap-2"
            >
              <Chrome className="w-5 h-5" />
              Google
            </Button>

            <div className="mt-6 text-center text-sm text-gray-600">
              {isRegister ? (
                <>
                  Já tem uma conta?{" "}
                  <Link
                    href="/auth/signin"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Faça login
                  </Link>
                </>
              ) : (
                <>
                  Não tem uma conta?{" "}
                  <Link
                    href="/auth/signin?register=true"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Cadastre-se
                  </Link>
                </>
              )}
            </div>
          </CardBody>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Ao continuar, você concorda com nossos Termos de Uso e Política de
          Privacidade
        </p>
      </div>
    </div>
  );
}
