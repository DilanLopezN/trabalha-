import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { buildEmailTemplate, sendEmail } from "@/lib/email";
import { z } from "zod";

const candidaturaSchema = z.object({
  vagaId: z.string(),
  mensagem: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "PRESTADOR") {
      return NextResponse.json(
        { error: "Apenas prestadores podem candidatar-se" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { vagaId, mensagem } = candidaturaSchema.parse(body);

    // Verificar se já existe candidatura
    const exists = await prisma.candidatura.findUnique({
      where: {
        vagaId_prestadorId: {
          vagaId,
          prestadorId: user.id,
        },
      },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Você já se candidatou a esta vaga" },
        { status: 400 }
      );
    }

    const candidatura = await prisma.candidatura.create({
      data: {
        vagaId,
        prestadorId: user.id,
        mensagem,
      },
      include: {
        vaga: {
          include: {
            category: true,
            empregador: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        prestador: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
            state: true,
            whatsapp: true,
          },
        },
      },
    });

    const recruiterEmail = candidatura.vaga.empregador?.email;

    if (recruiterEmail) {
      const candidateName = candidatura.prestador?.name || "Um profissional";
      const greeting = candidatura.vaga.empregador?.name
        ? `Olá ${candidatura.vaga.empregador.name},`
        : undefined;
      const location = [
        candidatura.prestador?.city,
        candidatura.prestador?.state,
      ]
        .filter(Boolean)
        .join("/");

      const contactLines = [
        candidatura.prestador?.email
          ? `<li><strong>Email:</strong> ${candidatura.prestador.email}</li>`
          : "",
        candidatura.prestador?.whatsapp
          ? `<li><strong>WhatsApp:</strong> ${candidatura.prestador.whatsapp}</li>`
          : "",
        location
          ? `<li><strong>Localização:</strong> ${location}</li>`
          : "",
      ]
        .filter(Boolean)
        .join("");

      const body = `
        <p><strong>${candidateName}</strong> acabou de se candidatar à vaga <strong>${candidatura.vaga.titulo}</strong>.</p>
        <p>${
          candidatura.vaga.category
            ? `Categoria: ${candidatura.vaga.category.name}`
            : ""
        }</p>
        ${contactLines ? `<ul>${contactLines}</ul>` : ""}
        ${
          candidatura.mensagem
            ? `<p><strong>Mensagem enviada:</strong></p><blockquote style="margin: 12px 0; padding: 12px; background:#f3f4f6; border-left: 4px solid #6366f1;">${candidatura.mensagem}</blockquote>`
            : ""
        }
        <p>Acesse seu painel do Trabalhaí para visualizar todos os detalhes e responder ao candidato.</p>
      `;

      const emailTemplate = buildEmailTemplate({
        title: "Nova candidatura recebida",
        greeting,
        body,
      });

      try {
        await sendEmail({
          to: recruiterEmail,
          subject: `Nova candidatura - ${candidatura.vaga.titulo}`,
          html: emailTemplate,
        });
      } catch (emailError) {
        console.error("Falha ao enviar email de nova candidatura:", emailError);
      }
    }

    return NextResponse.json({ candidatura }, { status: 201 });
  } catch (error) {
    console.error("Erro ao candidatar-se:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao candidatar-se" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const vagaId = searchParams.get("vagaId");

    // Se é empregador buscando candidatos de uma vaga específica
    if (user.role === "EMPREGADOR" && vagaId) {
      const candidaturas = await prisma.candidatura.findMany({
        where: {
          vagaId,
          vaga: {
            empregadorId: user.id,
          },
        },
        include: {
          prestador: {
            select: {
              id: true,
              name: true,
              image: true,
              whatsapp: true,
              role: true,
              city: true,
              state: true,
              workerProfile: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ candidaturas });
    }

    // Se é prestador buscando suas candidaturas
    if (user.role === "PRESTADOR") {
      const candidaturas = await prisma.candidatura.findMany({
        where: {
          prestadorId: user.id,
        },
        include: {
          vaga: {
            include: {
              empregador: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              category: true,
              etapas: {
                orderBy: { ordem: "asc" },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ candidaturas });
    }

    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  } catch (error) {
    console.error("Erro ao buscar candidaturas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar candidaturas" },
      { status: 500 }
    );
  }
}
