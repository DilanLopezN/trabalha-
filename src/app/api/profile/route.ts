import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(3),
  whatsapp: z.string().optional(),
  cnpj: z.string().optional(),

  // Endereço
  address: z
    .object({
      cep: z.string().optional(),
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
    })
    .optional(),

  // Campos específicos
  categoryId: z.string().optional(),
  description: z.string().optional(),
  hourlyRate: z.number().optional(),
  budget: z.number().optional(),
  advertisedService: z.string().optional(),
  availability: z
    .record(
      z.object({
        enabled: z.boolean(),
        slots: z.array(
          z.object({
            start: z.string(),
            end: z.string(),
          })
        ),
      })
    )
    .optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json(
      { error: "Erro ao buscar perfil" },
      { status: 500 }
    );
  }
}
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = profileSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workerProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar dados básicos do usuário (incluindo foto)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: validatedData.name,
        whatsapp: validatedData.whatsapp,
        cnpj: validatedData.cnpj,
        image: body.profilePhotoUrl || user.image, // ADICIONAR
      },
    });

    // Processar disponibilidade
    const availability = validatedData.availability
      ? Object.fromEntries(
          Object.entries(validatedData.availability)
            .filter(([_, value]) => value.enabled)
            .map(([key, value]) => [key, value.slots])
        )
      : {};

    // Atualizar perfil específico
    if (user.role === "PRESTADOR") {
      if (user.workerProfile) {
        await prisma.workerProfile.update({
          where: { userId: user.id },
          data: {
            categoryId:
              validatedData.categoryId || user.workerProfile.categoryId,
            description:
              validatedData.description || user.workerProfile.description,
            averagePrice:
              validatedData.hourlyRate || user.workerProfile.averagePrice,
            availability: availability,
            resumeUrl: body.resumeUrl || user.workerProfile.resumeUrl, // ADICIONAR
          },
        });
      } else if (validatedData.categoryId) {
        await prisma.workerProfile.create({
          data: {
            userId: user.id,
            categoryId: validatedData.categoryId,
            description: validatedData.description || "",
            averagePrice: validatedData.hourlyRate || 0,
            availability: availability,
            resumeUrl: body.resumeUrl || null, // ADICIONAR
          },
        });
      }
    } else if (user.role === "EMPREGADOR") {
      if (user.employerProfile) {
        await prisma.employerProfile.update({
          where: { userId: user.id },
          data: {
            advertisedService:
              validatedData.advertisedService ||
              user.employerProfile.advertisedService,
            budget: validatedData.budget || user.employerProfile.budget,
            categoryId:
              validatedData.categoryId || user.employerProfile.categoryId || "",
            availability: availability,
          },
        });
      } else {
        await prisma.employerProfile.create({
          data: {
            userId: user.id,
            advertisedService: validatedData.advertisedService || "",
            budget: validatedData.budget || 0,
            categoryId: validatedData.categoryId || "",
            availability: availability,
          },
        });
      }
    }

    return NextResponse.json({ message: "Perfil atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar perfil" },
      { status: 500 }
    );
  }
}
