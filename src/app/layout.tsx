import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/auth-provider";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.trabalhai.com.br";
const metadataBase = (() => {
  try {
    return new URL(appUrl);
  } catch (error) {
    return new URL("https://www.trabalhai.com.br");
  }
})();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Trabalhaí - Conectando Prestadores e Empregadores",
    template: "%s | Trabalhaí",
  },
  description:
    "Plataforma que conecta trabalhadores informais e contratantes de forma rápida e segura.",
  keywords: [
    "trabalhos informais",
    "prestadores de serviços",
    "empregadores",
    "encontrar profissionais",
    "contratar serviços",
    "trabalhos rápidos",
    "Trabalhaí",
  ],
  authors: [{ name: "Trabalhaí" }],
  category: "Business",
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "/",
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Trabalhaí - Conectando Prestadores e Empregadores",
    description:
      "Encontre profissionais qualificados ou novas oportunidades de trabalho em poucos cliques na plataforma Trabalhaí.",
    siteName: "Trabalhaí",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trabalhaí - Conectando Prestadores e Empregadores",
    description:
      "Plataforma completa para conectar prestadores de serviços e empregadores de forma rápida e segura.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
