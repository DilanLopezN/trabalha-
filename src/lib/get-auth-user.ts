import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSession() {
  return await getServerSession(authOptions);
}

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

export function isProfileComplete(user: any): boolean {
  if (!user) return false;

  // Verificar campos básicos
  const hasBasicInfo = user.name && user.whatsapp;

  if (user.role === "PRESTADOR") {
    const profile = user.workerProfile;
    return !!(
      hasBasicInfo &&
      profile &&
      profile.categoryId &&
      profile.description &&
      profile.averagePrice > 0 &&
      Object.keys(profile.availability || {}).length > 0
    );
  } else if (user.role === "EMPREGADOR") {
    const profile = user.employerProfile;
    return !!(
      hasBasicInfo &&
      profile &&
      profile.advertisedService &&
      profile.budget > 0 &&
      Object.keys(profile.availability || {}).length > 0
    );
  }

  return false;
}

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

export async function isWorker(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === "PRESTADOR";
}

export async function isEmployer(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === "EMPREGADOR";
}
