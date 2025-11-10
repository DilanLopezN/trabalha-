import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  r2Client,
  R2_BUCKET,
  getR2Path,
  getPublicUrl,
  validateImageFile,
  validateResumeFile,
} from "@/lib/r2";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
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

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as "profile" | "resume" | "ad";

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    if (!type || !["profile", "resume", "ad"].includes(type)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    // Validar arquivo
    let validation;
    if (type === "profile" || type === "ad") {
      validation = validateImageFile(file);
    } else {
      validation = validateResumeFile(file);
    }

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Gerar caminho do arquivo
    const filePath = getR2Path(type, user.id, file.name);

    // Converter arquivo para buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload para R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: filePath,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const publicUrl = getPublicUrl(filePath);

    // Atualizar banco de dados
    if (type === "profile") {
      // Deletar foto antiga se existir
      if (user.image && user.image.includes(R2_BUCKET)) {
        const oldPath = user.image.split(`${R2_BUCKET}/`)[1];
        if (oldPath) {
          try {
            await r2Client.send(
              new DeleteObjectCommand({
                Bucket: R2_BUCKET,
                Key: oldPath,
              })
            );
          } catch (error) {
            console.error("Erro ao deletar foto antiga:", error);
          }
        }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { image: publicUrl },
      });
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
    });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do arquivo" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");
    const type = searchParams.get("type");

    if (!path) {
      return NextResponse.json(
        { error: "Caminho do arquivo não fornecido" },
        { status: 400 }
      );
    }

    // Deletar do R2
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: path,
      })
    );

    // Atualizar banco de dados se for foto de perfil
    if (type === "profile") {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { image: null },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    return NextResponse.json(
      { error: "Erro ao deletar arquivo" },
      { status: 500 }
    );
  }
}
