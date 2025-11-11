import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const candidaturaSchema = z.object({
  vagaId: z.string(),
  mensagem: z.string().optional(),
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

    if (!user || user.role !== "PRESTADOR") {
      return NextResponse.json(
        { error: "Apenas prestadores podem candidatar-se" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { vagaId, mensagem } = candidaturaSchema.parse(body);

    // Verificar se já existe candidatura
    const exists = await prisma.candidatura.findUnique({
      where: {
        vagaId_prestadorId: {
          vagaId,
          prestadorId: user.id,
        },
      },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Você já se candidatou a esta vaga" },
        { status: 400 }
      );
    }

    const candidatura = await prisma.candidatura.create({
      data: {
        vagaId,
        prestadorId: user.id,
        mensagem,
      },
      include: {
        vaga: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json({ candidatura }, { status: 201 });
  } catch (error) {
    console.error("Erro ao candidatar-se:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao candidatar-se" },
      { status: 500 }
    );
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

    const { searchParams } = new URL(req.url);
    const vagaId = searchParams.get("vagaId");

    // Se é empregador buscando candidatos de uma vaga específica
    if (user.role === "EMPREGADOR" && vagaId) {
      const candidaturas = await prisma.candidatura.findMany({
        where: {
          vagaId,
          vaga: {
            empregadorId: user.id,
          },
        },
        include: {
          prestador: {
            select: {
              id: true,
              name: true,
              image: true,
              whatsapp: true,
              workerProfile: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ candidaturas });
    }

    // Se é prestador buscando suas candidaturas
    if (user.role === "PRESTADOR") {
      const candidaturas = await prisma.candidatura.findMany({
        where: {
          prestadorId: user.id,
        },
        include: {
          vaga: {
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
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ candidaturas });
    }

    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  } catch (error) {
    console.error("Erro ao buscar candidaturas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar candidaturas" },
      { status: 500 }
    );
  }
}
