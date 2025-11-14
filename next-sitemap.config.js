const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.trabalhai.com.br";

/** @type {{
 *   siteUrl: string;
 *   generateRobotsTxt: boolean;
 *   changefreq: string;
 *   priority: number;
 *   sitemapSize: number;
 *   autoLastmod: boolean;
 *   exclude: string[];
 *   robotsTxtOptions: {
 *     policies: { userAgent: string; allow: string }[];
 *     host: string;
 *   };
 * }}
 */
const config = {
  siteUrl,
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 7000,
  autoLastmod: true,
  exclude: ["/api/*"],
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
    host: siteUrl,
  },
};

module.exports = config;
