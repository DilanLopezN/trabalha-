import { getServerSession } from "next-auth/next";

import { prisma } from "@/lib/prisma";
import { authOptions } from "./next-auth";

/**
 * Obtém a sessão do usuário autenticado
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Obtém o usuário completo do banco de dados
 * Retorna null se não estiver autenticado
 */
export async function getCurrentUser() {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        workerProfile: {
          include: {
            category: true,
          },
        },
        employerProfile: {
          include: {
            category: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Verifica se o usuário tem destaque ativo
 */
export async function hasActiveHighlight(userId: string): Promise<boolean> {
  const now = new Date();

  const activeHighlight = await prisma.highlight.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endsAt: {
        gt: now,
      },
    },
  });

  return !!activeHighlight;
}

/**
 * Obtém o destaque ativo do usuário
 */
export async function getActiveHighlight(userId: string) {
  const now = new Date();

  return await prisma.highlight.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endsAt: {
        gt: now,
      },
    },
    include: {
      plan: true,
    },
    orderBy: {
      plan: {
        priority: "desc",
      },
    },
  });
}
