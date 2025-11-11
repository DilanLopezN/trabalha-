import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

const requestSchema = z.object({
  planCode: z.string(),
  purchaseType: z.enum(["highlight", "ad"]),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
  adTitle: z.string().optional(),
  adContent: z.string().optional(),
  adTarget: z.enum(["ALL", "WORKERS", "EMPLOYERS"]).optional(),
  adImageUrl: z.string().optional(),
});

function ensureStripeConfigured() {
  if (!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_TEST_SECRET_KEY) {
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

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const rawBody = await req.json();
    const parsed = requestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.purchaseType === "ad" && user.role !== "EMPREGADOR") {
      return NextResponse.json(
        { error: "Apenas empregadores podem contratar anúncios" },
        { status: 403 }
      );
    }

    if (data.purchaseType === "ad") {
      if (!data.adTitle || !data.adContent || !data.adTarget) {
        return NextResponse.json(
          { error: "Informe título, conteúdo e público-alvo do anúncio" },
          { status: 400 }
        );
      }
    }

    const plan = await prisma.highlightPlan.findUnique({
      where: { code: data.planCode as any },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const successUrl = resolveUrl(
      data.purchaseType === "ad"
        ? "/empregador?checkout=success"
        : "/prestador?checkout=success",
      data.successUrl,
      origin
    );

    const cancelUrl = resolveUrl(
      data.purchaseType === "ad"
        ? "/empregador/anunciar?checkout=cancelled"
        : "/prestador/comprar-destaque?checkout=cancelled",
      data.cancelUrl,
      origin
    );

    const stripeClient = getStripeClient();

    const sessionCheckout = await stripeClient.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      success_url: appendSessionIdPlaceholder(successUrl),
      cancel_url: cancelUrl,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name:
                data.purchaseType === "ad"
                  ? `Plano de anúncio ${plan.name}`
                  : `Plano de destaque ${plan.name}`,
            },
            unit_amount: Math.round(Number(plan.price) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        planId: plan.id,
        planCode: plan.code,
        purchaseType: data.purchaseType,
        ...(data.purchaseType === "ad"
          ? {
              adTitle: data.adTitle?.slice(0, 200) ?? "",
              adContent: data.adContent?.slice(0, 500) ?? "",
              adTarget: data.adTarget,
              adImageUrl: data.adImageUrl ?? "",
            }
          : {}),
      },
    });

    if (!sessionCheckout.url) {
      return NextResponse.json(
        { error: "Não foi possível iniciar o pagamento" },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl: sessionCheckout.url });
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error);
    return NextResponse.json(
      { error: "Erro ao iniciar pagamento" },
      { status: 500 }
    );
  }
}
