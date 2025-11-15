import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SUPPORT_TEAM_EMAIL, buildEmailTemplate, sendEmail } from "@/lib/email";

const supportSchema = z.object({
  title: z.string().min(3, "Informe um título com pelo menos 3 caracteres"),
  description: z
    .string()
    .min(20, "Descreva o problema com pelo menos 20 caracteres"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description } = supportSchema.parse(body);

    const requesterName = session.user.name || "Usuário Trabalhaí";
    const requesterEmail = session.user.email;

    const emailBody = `
      <p><strong>${requesterName}</strong> abriu um chamado de suporte.</p>
      <ul>
        <li><strong>Email:</strong> ${requesterEmail}</li>
        ${session.user.id ? `<li><strong>ID:</strong> ${session.user.id}</li>` : ""}
      </ul>
      <p><strong>Título:</strong> ${title}</p>
      <p><strong>Descrição:</strong></p>
      <div style="margin-top: 12px; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; white-space: pre-line;">${description}</div>
    `;

    const html = buildEmailTemplate({
      title: "Novo chamado de suporte",
      body: emailBody,
    });

    try {
      await sendEmail({
        to: SUPPORT_TEAM_EMAIL,
        subject: `[Suporte Trabalhaí] ${title}`,
        html,
        replyTo: requesterEmail,
      });
    } catch (emailError) {
      console.error("Falha ao enviar email de suporte:", emailError);
      return NextResponse.json(
        { error: "Não foi possível enviar o chamado de suporte" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao registrar suporte:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno ao enviar suporte" },
      { status: 500 }
    );
  }
}
