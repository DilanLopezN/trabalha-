import type { Metadata } from "next";

const DEFAULT_APP_URL = "https://www.trabalhai.com.br";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL;

export const siteName = "Trabalhaí";

export const metadataBase = (() => {
  try {
    return new URL(appUrl);
  } catch (error) {
    return new URL(DEFAULT_APP_URL);
  }
})();

const defaultKeywords = [
  "trabalhos informais",
  "prestadores de serviços",
  "empregadores",
  "encontrar profissionais",
  "contratar serviços",
  "trabalhos rápidos",
  siteName,
];

const defaultImagePath =
  process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE ??
  "https://og-image.vercel.app/Trabalha%C3%AD.png?theme=light&md=1&fontSize=100px&images=";

const resolveImageUrl = (imagePath: string) => {
  try {
    const url = new URL(imagePath, metadataBase);
    return url.toString();
  } catch (error) {
    return new URL(defaultImagePath, metadataBase).toString();
  }
};

const mergeKeywords = (keywords?: string[]) => {
  const merged = new Set([...defaultKeywords, ...(keywords ?? [])]);
  return Array.from(merged);
};

export const defaultMetadata: Metadata = {
  metadataBase,
  title: {
    default: `${siteName} - Conectando Prestadores e Empregadores`,
    template: "%s | Trabalhaí",
  },
  description:
    "Plataforma que conecta trabalhadores informais e contratantes de forma rápida e segura.",
  keywords: defaultKeywords,
  authors: [{ name: siteName }],
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
    title: `${siteName} - Conectando Prestadores e Empregadores`,
    description:
      "Encontre profissionais qualificados ou novas oportunidades de trabalho em poucos cliques na plataforma Trabalhaí.",
    siteName,
    locale: "pt_BR",
    images: [
      {
        url: resolveImageUrl(defaultImagePath),
        width: 1200,
        height: 630,
        alt: `${siteName} - Conectando Prestadores e Empregadores`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Conectando Prestadores e Empregadores`,
    description:
      "Plataforma completa para conectar prestadores de serviços e empregadores de forma rápida e segura.",
    images: [resolveImageUrl(defaultImagePath)],
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

export type BuildMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  images?: { url: string; alt?: string }[];
  type?: Metadata["openGraph"] extends infer T
    ? T extends { type: infer X }
      ? X
      : never
    : never;
};

export const buildMetadata = ({
  title,
  description,
  path,
  keywords,
  images,
  type,
}: BuildMetadataOptions): Metadata => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const imageEntries = images?.length
    ? images.map((image) => ({
        url: resolveImageUrl(image.url),
        width: 1200,
        height: 630,
        alt: image.alt ?? `${title} | ${siteName}`,
      }))
    : [
        {
          url: resolveImageUrl(defaultImagePath),
          width: 1200,
          height: 630,
          alt: `${title} | ${siteName}`,
        },
      ];

  const resolvedKeywords = mergeKeywords(keywords);

  return {
    title,
    description,
    keywords: resolvedKeywords,
    alternates: {
      canonical: normalizedPath,
    },
    openGraph: {
      type: type ?? "website",
      url: normalizedPath,
      title: `${title} | ${siteName}`,
      description,
      siteName,
      locale: "pt_BR",
      images: imageEntries,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: imageEntries.map((image) => image.url),
    },
  };
};
