import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || 5);

    const paidAds = await prisma.vaga.findMany({
      where: {
        status: "ABERTA",
        // @ts-expect-error - campo adicionado na atualização do schema
        isPaidAd: true,
        OR: [
          {
            // @ts-expect-error - campo adicionado na atualização do schema
            paidAdExpiresAt: null,
          },
          {
            // @ts-expect-error - campo adicionado na atualização do schema
            paidAdExpiresAt: {
              gt: new Date(),
            },
          },
        ],
      },
      include: {
        empregador: {
          select: {
            id: true,
            name: true,
            image: true,
            city: true,
            state: true,
          },
        },
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ paidAds });
  } catch (error) {
    console.error("Erro ao buscar anúncios pagos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar anúncios pagos" },
      { status: 500 }
    );
  }
}

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
        { error: "Apenas empregadores podem destacar vagas" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { vagaId, durationDays = 30 } = body;

    if (!vagaId) {
      return NextResponse.json(
        { error: "Informe a vaga que deseja destacar" },
        { status: 400 }
      );
    }

    const vaga = await prisma.vaga.findUnique({
      where: { id: vagaId },
    });

    if (!vaga || vaga.empregadorId !== user.id) {
      return NextResponse.json(
        { error: "Vaga não encontrada" },
        { status: 404 }
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(durationDays));

    await prisma.vaga.update({
      where: { id: vagaId },
      data: {
        // @ts-expect-error - campo adicionado na atualização do schema
        isPaidAd: true,
        // @ts-expect-error - campo adicionado na atualização do schema
        paidAdExpiresAt: expiresAt,
      },
    });

    return NextResponse.json({ message: "Vaga destacada com sucesso" });
  } catch (error) {
    console.error("Erro ao destacar vaga:", error);
    return NextResponse.json(
      { error: "Erro ao destacar vaga" },
      { status: 500 }
    );
  }
}
