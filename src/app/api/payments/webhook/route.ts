import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function handleHighlightPurchase(
  metadata: Stripe.Metadata,
  plan: { id: string; durationDays: number }
) {
  const userId = metadata.userId as string;
  if (!userId) {
    console.warn("Checkout sem userId informado em metadata");
    return;
  }

  const now = new Date();

  await prisma.highlight.updateMany({
    where: {
      userId,
      status: "ACTIVE",
      endsAt: { lte: now },
    },
    data: { status: "EXPIRED" },
  });

  const activeHighlight = await prisma.highlight.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endsAt: { gt: now },
    },
    orderBy: { endsAt: "desc" },
  });

  if (activeHighlight) {
    const baseDate =
      activeHighlight.endsAt > now ? activeHighlight.endsAt : now;
    const newEndsAt = addDays(baseDate, plan.durationDays);
    await prisma.highlight.update({
      where: { id: activeHighlight.id },
      data: {
        planId: plan.id,
        endsAt: newEndsAt,
        status: "ACTIVE",
        updatedAt: new Date(),
      },
    });
    return;
  }

  await prisma.highlight.create({
    data: {
      userId,
      planId: plan.id,
      startsAt: now,
      endsAt: addDays(now, plan.durationDays),
      status: "ACTIVE",
    },
  });
}

async function handleAdPurchase(metadata: Stripe.Metadata, planId: string) {
  const userId = metadata.userId as string;
  const adTitle = (metadata.adTitle as string) || "Anúncio Trabalhaí";
  const adContent = (metadata.adContent as string) || "";
  const adTargetRaw = ((metadata.adTarget as string) || "ALL").toUpperCase();
  const allowedTargets = new Set(["ALL", "WORKERS", "EMPLOYERS"]);
  const adTarget = allowedTargets.has(adTargetRaw) ? adTargetRaw : "ALL";
  const adImageUrl = (metadata.adImageUrl as string) || undefined;

  if (!userId) {
    console.warn("Checkout de anúncio sem userId informado em metadata");
    return;
  }

  const plan = await prisma.highlightPlan.findUnique({ where: { id: planId } });

  if (!plan) {
    console.warn("Plano associado ao anúncio não encontrado", { planId });
    return;
  }

  const now = new Date();

  await prisma.ad.updateMany({
    where: {
      ownerId: userId,
      status: "ACTIVE",
      endsAt: { lte: now },
    },
    data: { status: "EXPIRED" },
  });

  await prisma.ad.create({
    data: {
      ownerId: userId,
      planId: plan.id,
      title: adTitle || `Anúncio ${plan.name}`,
      content: adContent,
      imageUrl: adImageUrl,
      target: adTarget as any,
      startsAt: now,
      endsAt: addDays(now, plan.durationDays),
      status: "ACTIVE",
    },
  });
}

export async function POST(req: Request) {
  const signature = (await headers()).get("stripe-signature");

  if (!WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET não configurada");
    return NextResponse.json(
      { error: "Webhook não configurado" },
      { status: 500 }
    );
  }

  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const payload = await req.text();
    const stripeClient = getStripeClient();
    event = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Falha ao validar webhook do Stripe:", err);
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};
      const planId = metadata.planId as string;

      if (!planId) {
        console.warn("Checkout concluído sem planId na metadata");
        return NextResponse.json({ received: true });
      }

      const plan = await prisma.highlightPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        console.warn("Plano informado na metadata não encontrado", { planId });
        return NextResponse.json({ received: true });
      }

      if (metadata.purchaseType === "ad") {
        await handleAdPurchase(metadata, plan.id);
      } else {
        await handleHighlightPurchase(metadata, {
          id: plan.id,
          durationDays: plan.durationDays,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook do Stripe:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
