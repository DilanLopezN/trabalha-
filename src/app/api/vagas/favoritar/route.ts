import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

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
        { error: "Apenas prestadores podem favoritar vagas" },
        { status: 403 }
      );
    }

    const { vagaId } = await req.json();

    if (!vagaId) {
      return NextResponse.json(
        { error: "ID da vaga é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se já existe
    const exists = await prisma.vagaFavorita.findUnique({
      where: {
        vagaId_prestadorId: {
          vagaId,
          prestadorId: user.id,
        },
      },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Vaga já está nos favoritos" },
        { status: 400 }
      );
    }

    const favorito = await prisma.vagaFavorita.create({
      data: {
        vagaId,
        prestadorId: user.id,
      },
    });

    return NextResponse.json({ favorito }, { status: 201 });
  } catch (error) {
    console.error("Erro ao favoritar vaga:", error);
    return NextResponse.json(
      { error: "Erro ao favoritar vaga" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    if (!vagaId) {
      return NextResponse.json(
        { error: "ID da vaga é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.vagaFavorita.deleteMany({
      where: {
        vagaId,
        prestadorId: user.id,
      },
    });

    return NextResponse.json({ message: "Removido dos favoritos" });
  } catch (error) {
    console.error("Erro ao remover favorito:", error);
    return NextResponse.json(
      { error: "Erro ao remover favorito" },
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

    if (!user || user.role !== "PRESTADOR") {
      return NextResponse.json(
        { error: "Apenas prestadores têm favoritos" },
        { status: 403 }
      );
    }

    const favoritos = await prisma.vagaFavorita.findMany({
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

    return NextResponse.json({ favoritos });
  } catch (error) {
    console.error("Erro ao buscar favoritos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar favoritos" },
      { status: 500 }
    );
  }
}
