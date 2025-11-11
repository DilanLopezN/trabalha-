import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createVagaSchema = z.object({
  titulo: z.string().min(5, "Título deve ter no mínimo 5 caracteres"),
  descricao: z.string().min(20, "Descrição deve ter no mínimo 20 caracteres"),
  categoryId: z.string(),
  salarioTipo: z.enum(["FIXO", "A_COMBINAR"]),
  salarioValor: z.number().optional(),
  etapas: z
    .array(
      z.object({
        nome: z.string(),
        ordem: z.number(),
      })
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "EMPREGADOR") {
      return NextResponse.json(
        { error: "Apenas empregadores podem criar vagas" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createVagaSchema.parse(body);

    const vaga = await prisma.vaga.create({
      data: {
        empregadorId: user.id,
        titulo: validatedData.titulo,
        descricao: validatedData.descricao,
        categoryId: validatedData.categoryId,
        salarioTipo: validatedData.salarioTipo,
        salarioValor: validatedData.salarioValor,
        etapas: validatedData.etapas
          ? {
              create: validatedData.etapas.map((etapa) => ({
                nome: etapa.nome,
                ordem: etapa.ordem,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        etapas: {
          orderBy: { ordem: "asc" },
        },
      },
    });

    return NextResponse.json({ vaga }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar vaga:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Erro ao criar vaga" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Se for empregador, retorna suas vagas
    if (user.role === "EMPREGADOR") {
      const vagas = await prisma.vaga.findMany({
        where: {
          empregadorId: user.id,
        },
        include: {
          category: true,
          etapas: {
            orderBy: { ordem: "asc" },
          },
          _count: {
            select: {
              candidaturas: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ vagas });
    }

    // Se for prestador, retorna todas vagas abertas
    const vagas = await prisma.vaga.findMany({
      where: {
        status: "ABERTA",
      },
      include: {
        empregador: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
        etapas: {
          orderBy: { ordem: "asc" },
        },
        favoritos: {
          where: {
            prestadorId: user.id,
          },
        },
        candidaturas: {
          where: {
            prestadorId: user.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ vagas });
  } catch (error) {
    console.error("Erro ao buscar vagas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar vagas" },
      { status: 500 }
    );
  }
}
