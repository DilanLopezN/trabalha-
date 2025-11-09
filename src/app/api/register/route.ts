import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash-auth";

// Schema de validação
const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["PRESTADOR", "EMPREGADOR"]),
  whatsapp: z.string().optional(),
  cnpj: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validar dados
    const validatedData = registerSchema.parse(body);

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const passwordHash = await hashPassword(validatedData.password);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        role: validatedData.role,
        whatsapp: validatedData.whatsapp,
        cnpj: validatedData.cnpj,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Criar perfil baseado no role
    if (validatedData.role === "PRESTADOR") {
      await prisma.workerProfile.create({
        data: {
          userId: user.id,
          categoryId: "", // Será preenchido depois
          averagePrice: 0,
          availability: {},
          description: "",
        },
      });
    } else if (validatedData.role === "EMPREGADOR") {
      await prisma.employerProfile.create({
        data: {
          userId: user.id,
          advertisedService: "",
          budget: 0,
          availability: {},
        },
      });
    }

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
