import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";
import https from "https";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO Automation plugin — runs on every build/dev start
//
// Generates automatically (zero manual work required):
//   • public/sitemap.xml  — all recipe + category + static URLs
//   • public/rss.xml      — RSS 2.0 feed with latest recipes (newest first)
//   • public/robots.txt   — with Sitemap + Feed directives
//
// On production builds (VITE_SITE_URL set): pings Google to re-crawl sitemap.
//
// To add a new recipe: edit src/data/recipes.ts — everything updates itself.
// Override the canonical domain with the VITE_SITE_URL environment variable.
// ─────────────────────────────────────────────────────────────────────────────

// Extract all occurrences of a single-line string property from TypeScript source.
// e.g. extractField(src, "title") → ["Authentic Korean Beef Bulgogi", ...]
function extractField(source: string, field: string): string[] {
  const re = new RegExp(`^\\s*\\b${field}:\\s*["']([^"'\\n]+)["']`, "gm");
  return [...source.matchAll(re)].map((m) => m[1]);
}

// Convert ISO date (YYYY-MM-DD) to RFC 822 format required by RSS spec.
function toRfc822(isoDate: string): string {
  return new Date(isoDate).toUTCString();
}

// Escape XML special characters for RSS text content.
function xmlEsc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Escape a URL for use inside an XML attribute value.
// Only & needs escaping in URLs; other chars are valid in URIs.
function xmlUrl(url: string): string {
  return url.replace(/&/g, "&amp;");
}

// Convert any Unsplash URL to Pinterest-optimal 2:3 vertical (1000×1500).
function toPinterestImage(url: string): string {
  return url.split("?")[0] + "?w=1000&h=1500&fit=crop&q=85";
}

// Build a Pinterest-optimized description capped at 500 chars.
function buildPinDesc(meta: string): string {
  const cta = " High-protein, easy recipe — save this pin! → meatlovershub.com";
  const full = meta + cta;
  return full.length <= 500 ? full : full.slice(0, 497) + "...";
}

// Ping a search engine sitemap URL — fire-and-forget, never blocks the build.
function pingSitemap(pingUrl: string): void {
  try {
    const req = https.get(pingUrl, (res) => {
      console.log(`[seo] Google ping → ${res.statusCode} ${pingUrl}`);
    });
    req.on("error", (err) => {
      console.warn(`[seo] Google ping failed (non-fatal): ${err.message}`);
    });
    req.setTimeout(8000, () => {
      req.destroy();
      console.warn("[seo] Google ping timed out (non-fatal)");
    });
  } catch {
    // Network unavailable in dev sandbox — safe to ignore
  }
}

function sitemapPlugin(): Plugin {
  return {
    name: "seo-automation",

    // ── Dev server: serve XML/text files with strict headers so no browser
    //    extension or Vite transform pipeline can inject <script> tags ──────
    configureServer(server) {
      const publicDir = path.resolve(import.meta.dirname, "public");
      const XML_ROUTES: Record<string, { contentType: string; file: string }> = {
        "/sitemap.xml": { contentType: "application/xml; charset=utf-8", file: "sitemap.xml" },
        "/rss.xml":     { contentType: "application/rss+xml; charset=utf-8", file: "rss.xml" },
        "/robots.txt":  { contentType: "text/plain; charset=utf-8",          file: "robots.txt" },
      };

      server.middlewares.use((req, res, next) => {
        const route = XML_ROUTES[req.url ?? ""];
        if (!route) return next();

        const filePath = path.join(publicDir, route.file);
        if (!fs.existsSync(filePath)) return next();

        const content = fs.readFileSync(filePath, "utf-8");
        res.setHeader("Content-Type", route.contentType);
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.setHeader("Content-Length", Buffer.byteLength(content, "utf-8"));
        res.statusCode = 200;
        res.end(content);
      });
    },

    buildStart() {
      const siteUrl =
        process.env.VITE_SITE_URL ||
        `https://${(process.env.REPLIT_DOMAINS ?? "").split(",")[0].trim()}`;

      const isProd = !!process.env.VITE_SITE_URL;

      // ── 1. Parse recipes.ts ──────────────────────────────────────────────
      const recipesFilePath = path.resolve(
        import.meta.dirname,
        "src/data/recipes.ts",
      );
      const src = fs.readFileSync(recipesFilePath, "utf-8");

      // Recipe IDs — unique slugs only
      const recipeIds = [...new Set(
        [...src.matchAll(/\bid:\s*["']([a-z0-9][a-z0-9-]+)["']/g)].map((m) => m[1]),
      )];

      // Per-recipe metadata (positional — same order as IDs in the file)
      const titles       = extractField(src, "title");
      const descriptions = extractField(src, "description");
      const publishedAts = extractField(src, "publishedAt");
      const images       = extractField(src, "image");
      const categories   = extractField(src, "category");
      const authors      = extractField(src, "author");
      const pinTitles    = extractField(src, "pinTitle");
      const imageTalls   = extractField(src, "imageTall");
      const metaDescs    = extractField(src, "metaDescription");

      interface RecipeMeta {
        id: string; title: string; description: string;
        publishedAt: string; image: string; category: string; author: string;
        pinTitle: string; imageTall: string; metaDesc: string;
      }

      // Combine into recipe objects; sort newest → oldest for RSS
      const recipes: RecipeMeta[] = recipeIds.map((id, i) => ({
        id,
        title:       titles[i]       ?? id,
        description: descriptions[i] ?? "",
        publishedAt: publishedAts[i] ?? "2024-01-01",
        image:       images[i]       ?? "",
        category:    categories[i]   ?? "",
        author:      authors[i]      ?? "Meat Lovers Hub",
        pinTitle:    pinTitles[i]    ?? titles[i] ?? id,
        imageTall:   imageTalls[i]   ?? images[i] ?? "",
        metaDesc:    metaDescs[i]    ?? descriptions[i] ?? "",
      })).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

      // Category slugs from CATEGORY_TO_SLUG mapping
      const categorySlugs = [...new Set(
        [...src.matchAll(/"([A-Za-z\s]+)":\s*"([a-z-]+)"/g)]
          .map((m) => m[2])
          .filter((s) => /^[a-z][a-z-]+$/.test(s) && s.length > 2),
      )];

      const today = new Date().toISOString().split("T")[0];
      const publicDir = path.resolve(import.meta.dirname, "public");

      // ── 2. Generate sitemap.xml ──────────────────────────────────────────
      interface SitemapEntry {
        loc: string; lastmod: string; changefreq: string; priority: string;
      }

      const allPages: SitemapEntry[] = [
        // ── Core ──────────────────────────────────────────────────────────
        { loc: `${siteUrl}/`,                          lastmod: today, changefreq: "daily",   priority: "1.0" },
        { loc: `${siteUrl}/recipes`,                   lastmod: today, changefreq: "weekly",  priority: "0.9" },

        // ── Landing pages (high-value SEO targets) ────────────────────────
        { loc: `${siteUrl}/carnivore-meal-plan`,       lastmod: today, changefreq: "weekly",  priority: "0.9" },

        // ── Guides & Resources ────────────────────────────────────────────
        { loc: `${siteUrl}/resources`,                 lastmod: today, changefreq: "monthly", priority: "0.8" },
        { loc: `${siteUrl}/guides/meat-temperatures`,  lastmod: today, changefreq: "monthly", priority: "0.85" },

        // ── Recipe categories ─────────────────────────────────────────────
        ...categorySlugs.map((slug) => ({
          loc: `${siteUrl}/recipes/category/${slug}`,
          lastmod: today, changefreq: "weekly", priority: "0.75",
        })),

        // ── Individual recipes ────────────────────────────────────────────
        ...recipes.map((r) => ({
          loc: `${siteUrl}/recipes/${r.id}`,
          lastmod: r.publishedAt, changefreq: "weekly", priority: "0.8",
        })),

        // ── Author & editorial trust pages ────────────────────────────────
        { loc: `${siteUrl}/author/juicy-joe`,          lastmod: today, changefreq: "monthly", priority: "0.7" },
        { loc: `${siteUrl}/editorial-policy`,          lastmod: today, changefreq: "yearly",  priority: "0.5" },

        // ── Contact & community ───────────────────────────────────────────
        { loc: `${siteUrl}/newsletter`,                lastmod: today, changefreq: "monthly", priority: "0.6" },
        { loc: `${siteUrl}/contact`,                   lastmod: today, changefreq: "yearly",  priority: "0.4" },
        { loc: `${siteUrl}/follow`,                    lastmod: today, changefreq: "yearly",  priority: "0.35" },

        // ── Legal ─────────────────────────────────────────────────────────
        { loc: `${siteUrl}/privacy-policy`,            lastmod: today, changefreq: "yearly",  priority: "0.3" },
        { loc: `${siteUrl}/terms`,                     lastmod: today, changefreq: "yearly",  priority: "0.3" },
      ];

      const sitemap = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<!-- Auto-generated by seo-automation plugin — DO NOT EDIT MANUALLY -->`,
        `<!-- Add recipes to src/data/recipes.ts — sitemap and RSS update automatically -->`,
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
        ...allPages.map((p) =>
          `  <url>\n    <loc>${xmlUrl(p.loc)}</loc>\n    <lastmod>${p.lastmod}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
        ),
        `</urlset>`,
      ].join("\n");

      fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf-8");
      console.log(`[seo] sitemap.xml → ${allPages.length} URLs (${recipes.length} recipes, ${categorySlugs.length} categories)`);

      // ── 3. Generate rss.xml ──────────────────────────────────────────────
      const buildDate = new Date().toUTCString();

      const rssItems = recipes.map((r) => {
        const pinImg = toPinterestImage(r.imageTall || r.image);
        const recipeUrl = `${siteUrl}/recipes/${r.id}`;
        return `  <item>
    <title>${xmlEsc(r.pinTitle)}</title>
    <link>${xmlUrl(recipeUrl)}</link>
    <guid isPermaLink="true">${xmlUrl(recipeUrl)}</guid>
    <description><![CDATA[${buildPinDesc(r.metaDesc)}]]></description>
    <pubDate>${toRfc822(r.publishedAt)}</pubDate>
    <dc:creator>${xmlEsc(r.author)}</dc:creator>
    <category>${xmlEsc(r.category)}</category>
    <enclosure url="${xmlUrl(pinImg)}" type="image/jpeg" length="0" />
    <media:content url="${xmlUrl(pinImg)}" medium="image" width="1000" height="1500" />
  </item>`;
      }).join("\n");

      const rss = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Auto-generated by seo-automation plugin — DO NOT EDIT MANUALLY -->
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Meat Lovers Hub</title>
    <link>${siteUrl}/</link>
    <description>Foolproof, restaurant-quality meat recipes you can master at home — ribeye steak, BBQ ribs, smash burgers, grilled chicken and more.</description>
    <language>en-US</language>
    <copyright>© ${new Date().getFullYear()} Meat Lovers Hub</copyright>
    <managingEditor>hello@meatlovershub.com (Meat Lovers Hub)</managingEditor>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <ttl>1440</ttl>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>https://images.unsplash.com/photo-1558030006-450675393462?w=144&amp;h=144&amp;fit=crop</url>
      <title>Meat Lovers Hub</title>
      <link>${siteUrl}/</link>
    </image>
${rssItems}
  </channel>
</rss>`;

      fs.writeFileSync(path.join(publicDir, "rss.xml"), rss, "utf-8");
      console.log(`[seo] rss.xml → ${recipes.length} items (newest first)`);

      // ── 3b. Generate pinterest-feed.json ─────────────────────────────────
      const pinterestFeed = recipes.map((r) => ({
        title:       r.pinTitle,
        description: buildPinDesc(r.metaDesc),
        image:       toPinterestImage(r.imageTall || r.image),
        url:         `${siteUrl}/recipes/${r.id}`,
      }));
      fs.writeFileSync(
        path.join(publicDir, "pinterest-feed.json"),
        JSON.stringify(pinterestFeed, null, 2),
        "utf-8",
      );
      console.log(`[seo] pinterest-feed.json → ${pinterestFeed.length} items`);

      // ── 4. Generate robots.txt ───────────────────────────────────────────
      const robots = [
        `User-agent: *`,
        `Allow: /`,
        ``,
        `# Block internal Replit paths`,
        `Disallow: /__repl*`,
        `Disallow: /assets/`,
        ``,
        `# Sitemaps & feeds`,
        `Sitemap: ${siteUrl}/sitemap.xml`,
        ``,
        `# RSS Feed`,
        `# Feed: ${siteUrl}/rss.xml`,
      ].join("\n");

      fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf-8");
      console.log(`[seo] robots.txt → Sitemap + Feed directives`);

      // ── 5. Ping Google (production only) ─────────────────────────────────
      if (isProd) {
        const sitemapPingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${siteUrl}/sitemap.xml`)}`;
        console.log(`[seo] Pinging Google: ${sitemapPingUrl}`);
        pingSitemap(sitemapPingUrl);
      } else {
        console.log(`[seo] Skipping Google ping (set VITE_SITE_URL to enable in production)`);
      }

      console.log(`[seo] Domain: ${siteUrl}`);
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    sitemapPlugin(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react":  ["react", "react-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-charts": ["recharts"],
          "vendor-query":  ["@tanstack/react-query"],
          "vendor-radix":  [
            "@radix-ui/react-dialog",
            "@radix-ui/react-tabs",
            "@radix-ui/react-select",
            "@radix-ui/react-accordion",
            "@radix-ui/react-tooltip",
          ],
        },
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
