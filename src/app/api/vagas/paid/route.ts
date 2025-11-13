import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

const requestSchema = z.object({
  vagaId: z.string(),
  durationDays: z.number().int().min(1).max(365).optional(),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

const JOB_HIGHLIGHT_PRICE_CENTS = 1000;

function ensureStripeConfigured() {
  if (!process.env.STRIPE_TEST_SECRET_KEY) {
    throw new Error(
      "Stripe não está configurado. Defina STRIPE_SECRET_KEY ou STRIPE_TEST_SECRET_KEY."
    );
  }
}

function resolveUrl(
  fallbackPath: string,
  providedUrl: string | undefined,
  origin: string
) {
  if (providedUrl) {
    return providedUrl;
  }
  return `${origin}${fallbackPath}`;
}

function appendSessionIdPlaceholder(url: string) {
  const hasQuery = url.includes("?");
  const separator = hasQuery ? "&" : "?";
  return `${url}${separator}session_id={CHECKOUT_SESSION_ID}`;
}

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
    ensureStripeConfigured();

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

    const rawBody = await req.json();
    const parsed = requestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { vagaId, durationDays = 30, successUrl, cancelUrl } = parsed.data;

    const vaga = await prisma.vaga.findUnique({
      where: { id: vagaId },
    });

    if (!vaga || vaga.empregadorId !== user.id) {
      return NextResponse.json(
        { error: "Vaga não encontrada" },
        { status: 404 }
      );
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const stripeClient = getStripeClient();

    const checkoutSession = await stripeClient.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      success_url: appendSessionIdPlaceholder(
        resolveUrl("/empregador?checkout=success", successUrl, origin)
      ),
      cancel_url: resolveUrl(
        "/empregador?checkout=cancelled",
        cancelUrl,
        origin
      ),
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Destaque da vaga ${vaga.titulo}`,
            },
            unit_amount: JOB_HIGHLIGHT_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        purchaseType: "jobHighlight",
        userId: user.id,
        vagaId,
        durationDays: String(durationDays),
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Não foi possível iniciar o pagamento do destaque" },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  } catch (error) {
    console.error("Erro ao destacar vaga:", error);
    return NextResponse.json(
      { error: "Erro ao destacar vaga" },
      { status: 500 }
    );
  }
}
