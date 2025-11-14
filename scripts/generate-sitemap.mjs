import { promises as fs } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const config = require("../next-sitemap.config.js");

const siteUrl = config.siteUrl.replace(/\/$/, "");
const changefreq = config.changefreq ?? "weekly";
const priority = config.priority ?? 0.7;

const staticRoutes = [
  "/",
  "/auth/signin",
  "/dashboard",
  "/empregador",
  "/empregador/criar",
  "/empregador/anunciar",
  "/favoritos",
  "/prestador",
  "/prestador/comprar-destaque",
  "/profile",
];

const excluded = new Set(config.exclude ?? []);
const now = new Date().toISOString();

const urls = staticRoutes
  .filter((route) => {
    return !Array.from(excluded).some((pattern) => {
      if (!pattern.includes("*")) {
        return pattern === route;
      }
      const regex = new RegExp(
        `^${pattern
          .split("*")
          .map((segment) => segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join(".*")}$`
      );
      return regex.test(route);
    });
  })
  .map((route) => {
    const loc = `${siteUrl}${route}`;
    const routePriority = route === "/" ? 1 : priority;
    return `    <url>\n      <loc>${loc}</loc>\n      <lastmod>${now}</lastmod>\n      <changefreq>${changefreq}</changefreq>\n      <priority>${routePriority.toFixed(1)}</priority>\n    </url>`;
  })
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

const publicDir = path.resolve(process.cwd(), "public");
await fs.mkdir(publicDir, { recursive: true });
await fs.writeFile(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");

const robotsLines = [
  "User-agent: *",
  "Allow: /",
  "",
  `Sitemap: ${siteUrl}/sitemap.xml`,
  `Host: ${siteUrl}`,
];

await fs.writeFile(
  path.join(publicDir, "robots.txt"),
  `${robotsLines.join("\n")}\n`,
  "utf8"
);
