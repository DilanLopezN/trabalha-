import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";
import { buildEmailTemplate, sendEmail } from "@/lib/email";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_WEBHOOK_IPS = new Set([
  "3.18.12.63",
  "3.130.192.231",
  "13.235.14.237",
  "13.235.122.149",
  "18.211.135.69",
  "35.154.171.200",
  "52.15.183.38",
  "54.88.130.119",
  "54.88.130.237",
  "54.187.174.169",
  "54.187.205.235",
  "54.187.216.72",
]);

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getRequestIp() {
  const headerList = headers();
  const forwarded = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");
  const firstForwarded = forwarded?.split(",")[0]?.trim();
  return firstForwarded || realIp || null;
}

function isAllowedStripeIp(ip: string | null) {
  if (process.env.NODE_ENV !== "production") return true;
  if (!ip) return false;
  return STRIPE_WEBHOOK_IPS.has(ip);
}

async function sendPurchaseConfirmationEmail({
  userId,
  subject,
  body,
}: {
  userId: string;
  subject: string;
  body: string;
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      console.warn("Não foi possível enviar email: usuário sem email", {
        userId,
      });
      return;
    }

    const html = buildEmailTemplate({
      title: "Confirmação de compra",
      greeting: user.name ? `Olá ${user.name},` : undefined,
      body,
    });

    await sendEmail({
      to: user.email,
      subject,
      html,
    });
  } catch (emailError) {
    console.error("Falha ao enviar email de confirmação de compra:", emailError);
  }
}

async function handleHighlightPurchase(
  metadata: Stripe.Metadata,
  plan: { id: string; durationDays: number; name: string }
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

  await sendPurchaseConfirmationEmail({
    userId,
    subject: `Plano ${plan.name} ativado`,
    body: `
      <p>Seu plano <strong>${plan.name}</strong> foi ativado com sucesso.</p>
      <ul>
        <li><strong>Início:</strong> ${now.toLocaleDateString("pt-BR")}</li>
        <li><strong>Término:</strong> ${addDays(now, plan.durationDays).toLocaleDateString(
          "pt-BR"
        )}</li>
        <li><strong>Duração:</strong> ${plan.durationDays} dias</li>
      </ul>
      <p>Você já pode aproveitar os destaques no Trabalhaí.</p>
    `,
  });
}

async function handleAdPurchase(
  metadata: Stripe.Metadata,
  plan: { id: string; name: string; durationDays: number }
) {
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

  await sendPurchaseConfirmationEmail({
    userId,
    subject: "Confirmação de anúncio destacado",
    body: `
      <p>Seu anúncio <strong>${adTitle}</strong> foi ativado com o plano <strong>${plan.name}</strong>.</p>
      <ul>
        <li><strong>Segmentação:</strong> ${adTarget}</li>
        <li><strong>Duração:</strong> ${plan.durationDays} dias</li>
      </ul>
      <p>Ele ficará visível para o público selecionado até ${addDays(now, plan.durationDays).toLocaleDateString(
        "pt-BR"
      )}.</p>
    `,
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

  await sendPurchaseConfirmationEmail({
    userId,
    subject: `Vaga ${vaga.titulo} destacada`,
    body: `
      <p>A vaga <strong>${vaga.titulo}</strong> foi destacada por ${safeDuration} dias.</p>
      <ul>
        <li><strong>Início:</strong> ${now.toLocaleDateString("pt-BR")}</li>
        <li><strong>Expira em:</strong> ${expiresAt.toLocaleDateString("pt-BR")}</li>
      </ul>
      <p>O destaque já está ativo em nosso marketplace.</p>
    `,
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

  const planData = {
    id: plan.id,
    name: plan.name,
    durationDays: plan.durationDays,
  };

  if (metadata.purchaseType === "ad") {
    await handleAdPurchase(metadata, planData);
  } else {
    await handleHighlightPurchase(metadata, planData);
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(req: Request) {
  console.log("Recebido webhook de pagamento do Stripe", req);
  const signature = headers().get("stripe-signature");
  const clientIp = getRequestIp();

  if (!isAllowedStripeIp(clientIp)) {
    console.warn("Webhook do Stripe bloqueado por IP não autorizado", {
      clientIp,
    });
    return NextResponse.json({ error: "IP não autorizado" }, { status: 403 });
  }

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
