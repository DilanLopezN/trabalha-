const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

export const SUPPORT_TEAM_EMAIL = "dilanlopez009@gmail.com";

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string | string[];
};

async function requestResend<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao enviar email: ${response.status} - ${errorText}`);
  }

  return (await response.json()) as T;
}

export async function sendEmail(params: SendEmailParams) {
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    console.warn(
      "Resend não configurado. Configure RESEND_API_KEY e RESEND_FROM_EMAIL para envio de emails."
    );
    return;
  }

  const payload = {
    from: RESEND_FROM_EMAIL,
    to: Array.isArray(params.to) ? params.to : [params.to],
    subject: params.subject,
    html: params.html,
    ...(params.text ? { text: params.text } : {}),
    ...(params.replyTo ? { reply_to: params.replyTo } : {}),
  };

  await requestResend(payload);
}

export function buildEmailTemplate({
  title,
  greeting,
  body,
  footer,
}: {
  title: string;
  greeting?: string;
  body: string;
  footer?: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #111827; color: #fff; padding: 16px 24px;">
          <h1 style="margin: 0; font-size: 20px;">${title}</h1>
        </div>
        <div style="padding: 24px; line-height: 1.6;">
          ${greeting ? `<p style="margin-top: 0;">${greeting}</p>` : ""}
          ${body}
        </div>
        <div style="background: #f9fafb; padding: 16px 24px; font-size: 12px; color: #6b7280;">
          ${
            footer ||
            "Você está recebendo este email porque realizou uma ação recente no Trabalhaí."
          }
        </div>
      </div>
    </div>
  `;
}
