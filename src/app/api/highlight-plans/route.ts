import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.highlightPlan.findMany({
      orderBy: { priority: "asc" },
    });

    return NextResponse.json({
      plans: plans.map((plan) => ({
        id: plan.id,
        code: plan.code,
        name: plan.name,
        price: Number(plan.price),
        durationDays: plan.durationDays,
        priority: plan.priority,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar planos de destaque:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os planos de destaque" },
      { status: 500 }
    );
  }
}
