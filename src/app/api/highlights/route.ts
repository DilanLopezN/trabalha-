import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const highlights = await prisma.highlight.findMany({
      where: {
        userId: user.id,
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedHighlights = highlights.map((h) => ({
      id: h.id,
      planCode: h.plan.code,
      planName: h.plan.name,
      startsAt: h.startsAt.toISOString(),
      endsAt: h.endsAt.toISOString(),
      status: h.status,
    }));

    return NextResponse.json({ highlights: formattedHighlights });
  } catch (error) {
    console.error("Erro ao buscar destaques:", error);
    return NextResponse.json(
      { error: "Erro ao buscar destaques" },
      { status: 500 }
    );
  }
}
