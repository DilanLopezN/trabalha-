import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.CLOUDFLARE_R2_ACCOUNT_ID) {
  throw new Error("CLOUDFLARE_R2_ACCOUNT_ID não configurado");
}

if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) {
  throw new Error("CLOUDFLARE_R2_ACCESS_KEY_ID não configurado");
}

if (!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
  throw new Error("CLOUDFLARE_R2_SECRET_ACCESS_KEY não configurado");
}

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME || "trabalhai";
export const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || "";

/**
 * Gera o caminho do arquivo no R2
 */
export function getR2Path(
  type: "profile" | "resume" | "ad",
  userId: string,
  filename: string
) {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

  switch (type) {
    case "profile":
      return `profiles/${userId}/${timestamp}-${sanitizedFilename}`;
    case "resume":
      return `resumes/${userId}/${timestamp}-${sanitizedFilename}`;
    case "ad":
      return `ads/${userId}/${timestamp}-${sanitizedFilename}`;
    default:
      throw new Error("Tipo de arquivo inválido");
  }
}

/**
 * Gera a URL pública do arquivo
 */
export function getPublicUrl(path: string): string {
  return `${R2_PUBLIC_URL}/${path}`;
}

/**
 * Valida tipo de arquivo para fotos de perfil
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Tipo de arquivo inválido. Use JPG, PNG, WEBP ou GIF",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Arquivo muito grande. Tamanho máximo: 5MB",
    };
  }

  return { valid: true };
}

/**
 * Valida tipo de arquivo para currículos
 */
export function validateResumeFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const validTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Tipo de arquivo inválido. Use PDF, DOC ou DOCX",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Arquivo muito grande. Tamanho máximo: 10MB",
    };
  }

  return { valid: true };
}
