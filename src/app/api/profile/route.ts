import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { normalizeCityName } from "@/lib/strings";

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

    // Verificar se a categoria existe (se fornecida)
    if (validatedData.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!categoryExists) {
        return NextResponse.json(
          { error: `Categoria não encontrada` },
          { status: 400 }
        );
      }
    }

    const normalizedCity =
      body.address?.city === undefined
        ? undefined
        : body.address.city
        ? normalizeCityName(body.address.city)
        : null;
    const normalizedState =
      body.address?.state === undefined
        ? undefined
        : body.address.state
        ? body.address.state.toUpperCase()
        : null;

    // Atualizar dados básicos do usuário (incluindo endereço)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: validatedData.name,
        whatsapp: validatedData.whatsapp,
        cnpj: validatedData.cnpj,
        image: body.profilePhotoUrl || user.image,
        // Endereço
        cep: body.address?.cep || user.cep,
        street: body.address?.street || user.street,
        number: body.address?.number || user.number,
        complement: body.address?.complement || user.complement,
        neighborhood: body.address?.neighborhood || user.neighborhood,
        city: normalizedCity !== undefined ? normalizedCity : user.city,
        state: normalizedState !== undefined ? normalizedState : user.state,
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
            resumeUrl: body.resumeUrl || user.workerProfile.resumeUrl,
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
            resumeUrl: body.resumeUrl || null,
          },
        });
      }
    } else if (user.role === "EMPREGADOR") {
      if (user.employerProfile) {
        const employerData: {
          advertisedService?: string;
          budget?: number;
          categoryId?: string;
          availability: typeof availability;
        } = {
          advertisedService:
            validatedData.advertisedService ??
            user.employerProfile.advertisedService,
          budget: validatedData.budget ?? Number(user.employerProfile.budget),
          availability,
        };

        if (validatedData.categoryId) {
          employerData.categoryId = validatedData.categoryId;
        }

        await prisma.employerProfile.update({
          where: { userId: user.id },
          data: employerData,
        });
      } else {
        if (!validatedData.categoryId) {
          return NextResponse.json(
            {
              error:
                "Selecione uma categoria antes de criar o perfil de empregador",
            },
            { status: 400 }
          );
        }

        await prisma.employerProfile.create({
          data: {
            userId: user.id,
            advertisedService: validatedData.advertisedService || "",
            budget: validatedData.budget ?? 0,
            categoryId: validatedData.categoryId,
            availability,
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

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "Não foi possível salvar porque os dados relacionados são inválidos. Verifique a categoria selecionada.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Erro ao atualizar perfil" },
      { status: 500 }
    );
  }
}
