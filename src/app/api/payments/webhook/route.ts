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

  await prisma.$transaction(async (tx) => {
    await tx.highlight.updateMany({
      where: {
        userId,
        status: "ACTIVE",
        endsAt: { lte: now },
      },
      data: {
        status: "EXPIRED",
      },
    });

    await tx.highlight.updateMany({
      where: {
        userId,
        status: "ACTIVE",
        endsAt: { gt: now },
      },
      data: {
        status: "EXPIRED",
        endsAt: now,
      },
    });

    await tx.highlight.create({
      data: {
        userId,
        planId: plan.id,
        startsAt: now,
        endsAt: addDays(now, plan.durationDays),
        status: "ACTIVE",
      },
    });
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

async function handleJobHighlightPurchase(metadata: Stripe.Metadata) {
  const userId = metadata.userId as string;
  const vagaId = metadata.vagaId as string;
  const durationRaw = metadata.durationDays as string;

  if (!userId || !vagaId) {
    console.warn(
      "Checkout de destaque de vaga sem userId ou vagaId informado",
      {
        userId,
        vagaId,
      }
    );
    return;
  }

  const durationDays = Number.parseInt(durationRaw || "30", 10);
  const safeDuration =
    Number.isFinite(durationDays) && durationDays > 0 ? durationDays : 30;

  const vaga = await prisma.vaga.findUnique({ where: { id: vagaId } });

  if (!vaga) {
    console.warn("Vaga informada no checkout não encontrada", { vagaId });
    return;
  }

  if (vaga.empregadorId !== userId) {
    console.warn("Tentativa de destacar vaga de outro usuário", {
      vagaId,
      ownerId: vaga.empregadorId,
      userId,
    });
    return;
  }

  const now = new Date();
  const expiresAt = addDays(now, safeDuration);

  await prisma.vaga.update({
    where: { id: vagaId },
    data: {
      isPaidAd: true,
      paidAdExpiresAt: expiresAt,
      updatedAt: now,
    },
  });
}

async function processCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    console.log("Sessão de checkout ainda não paga", {
      sessionId: session.id,
      paymentStatus: session.payment_status,
    });
    return;
  }

  const metadata = session.metadata || {};

  if (metadata.purchaseType === "jobHighlight") {
    await handleJobHighlightPurchase(metadata);
    return;
  }

  const planId = metadata.planId as string;

  if (!planId) {
    console.warn("Checkout concluído sem planId na metadata", {
      sessionId: session.id,
    });
    return;
  }

  const plan = await prisma.highlightPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    console.warn("Plano informado na metadata não encontrado", {
      sessionId: session.id,
      planId,
    });
    return;
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

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(req: Request) {
  console.log("Recebido webhook de pagamento do Stripe", req);
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
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      await processCheckoutSession(session);
      return NextResponse.json({ received: true });
    }

    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.warn("Pagamento assíncrono falhou", {
        sessionId: session.id,
        paymentStatus: session.payment_status,
      });
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
