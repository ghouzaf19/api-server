import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

interface ImageEntry { loc: string; title: string; caption?: string; }
interface UrlEntry {
  loc: string; lastmod: string; changefreq: string; priority: string;
  images?: ImageEntry[];
}

const PRODUCTION_DOMAIN = "https://www.meatlovershub.com";

function getSiteUrl(): string {
  if (process.env.VITE_SITE_URL) return process.env.VITE_SITE_URL;
  return PRODUCTION_DOMAIN;
}

function xmlUrl(s: string): string { return s.replace(/&/g, "&amp;"); }
function xmlEsc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderUrl(u: UrlEntry): string {
  const imgs = (u.images ?? []).map((img) =>
    [
      `    <image:image>`,
      `      <image:loc>${xmlUrl(img.loc)}</image:loc>`,
      `      <image:title>${img.title}</image:title>`,
      img.caption ? `      <image:caption>${img.caption}</image:caption>` : "",
      `    </image:image>`,
    ].filter(Boolean).join("\n")
  ).join("\n");
  return [
    `  <url>`,
    `    <loc>${xmlUrl(u.loc)}</loc>`,
    `    <lastmod>${u.lastmod}</lastmod>`,
    `    <changefreq>${u.changefreq}</changefreq>`,
    `    <priority>${u.priority}</priority>`,
    imgs,
    `  </url>`,
  ].filter(Boolean).join("\n");
}

const CATEGORY_IMAGES: Record<string, string> = {
  "beef":        "https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=630&fit=crop&q=85",
  "chicken":     "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=1200&h=630&fit=crop&q=85",
  "game-meat":   "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=630&fit=crop&q=85",
  "bbq":         "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=630&fit=crop&q=85",
  "quick-meals": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=630&fit=crop&q=85",
};

const RECIPE_SLUGS: { id: string; date: string; image: string; title: string; desc: string }[] = [
  { id: "carnivore-steak-and-eggs",   date: "2026-05-03", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e", title: "Carnivore Steak and Eggs", desc: "Classic carnivore breakfast — ribeye steak with fried eggs and butter" },
  { id: "smoked-beef-brisket",        date: "2026-05-03", image: "https://images.unsplash.com/photo-1544025162-d76694265947", title: "Smoked Beef Brisket", desc: "12-hour smoked brisket with a deep mahogany bark and smoke ring" },
  { id: "reverse-sear-ribeye",        date: "2026-05-03", image: "https://images.unsplash.com/photo-1558030006-450675393462", title: "Reverse Sear Ribeye", desc: "Perfect medium-rare reverse sear ribeye every time" },
  { id: "beef-tallow",                date: "2026-05-03", image: "", title: "Homemade Beef Tallow", desc: "" },
  { id: "tomahawk-steak",             date: "2026-05-03", image: "https://images.unsplash.com/photo-1546964124-0cce460f38ef", title: "Tomahawk Steak", desc: "Massive tomahawk ribeye seared to perfection with a golden crust" },
  { id: "carnivore-meal-plan",        date: "2026-05-03", image: "", title: "Carnivore Meal Plan", desc: "" },
  { id: "carnivore-scotch-eggs-beef", date: "2026-05-03", image: "", title: "Carnivore Scotch Eggs", desc: "" },
  { id: "venison-steak-juniper-butter", date: "2025-03-10", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1", title: "Venison Steak with Juniper Butter", desc: "Pan-seared venison steak with juniper berry butter and wild herbs" },
  { id: "bbq-bacon-cheeseburger",     date: "2024-05-09", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd", title: "BBQ Bacon Cheeseburger", desc: "Stacked BBQ bacon cheeseburger with caramelised onions" },
  { id: "pan-seared-lamb-chops",      date: "2024-05-02", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1", title: "Pan Seared Lamb Chops", desc: "Perfectly seared lamb chops with rosemary and garlic butter" },
  { id: "korean-beef-bulgogi",        date: "2024-04-19", image: "https://images.unsplash.com/photo-1558030006-450675393462", title: "Korean Beef Bulgogi", desc: "Tender marinated beef bulgogi with sesame and spring onion" },
  { id: "honey-garlic-chicken-thighs",date: "2024-04-12", image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435", title: "Honey Garlic Chicken Thighs", desc: "Crispy honey garlic chicken thighs glazed in cast iron" },
  { id: "slow-cooker-venison-shoulder",date: "2024-04-05", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1", title: "Slow Cooker Venison Shoulder", desc: "Fall-apart slow-cooked venison shoulder with root vegetables" },
  { id: "smash-burger",               date: "2024-03-15", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd", title: "Smash Burger", desc: "Perfectly smashed beef patty with lacy crispy edges" },
  { id: "bbq-ribs",                   date: "2024-02-28", image: "https://images.unsplash.com/photo-1544025162-d76694265947", title: "BBQ Ribs", desc: "Slow-smoked BBQ pork ribs glazed with house sauce" },
  { id: "juicy-steak",                date: "2024-01-20", image: "https://images.unsplash.com/photo-1558030006-450675393462", title: "Juicy Steak", desc: "How to cook the perfect juicy steak every time" },
  { id: "grilled-chicken",            date: "2024-01-08", image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435", title: "Grilled Chicken", desc: "Juicy grilled chicken with char marks and herb marinade" },
];

const CATEGORY_SLUGS = ["beef", "chicken", "game-meat", "bbq", "quick-meals"];

function buildSitemap(): string {
  const site = getSiteUrl();
  const today = new Date().toISOString().split("T")[0];

  const blogPosts: UrlEntry[] = [
    {
      loc: `${site}/blog`, lastmod: today, changefreq: "daily", priority: "0.9",
      images: [{ loc: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1200&h=630&fit=crop&q=85", title: "Meat &amp; BBQ Blog — Tips, Guides &amp; Expert Techniques", caption: "In-depth guides on choosing the right cut and mastering the perfect crust" }],
    },
    {
      loc: `${site}/blog/bbq-rub-for-brisket`, lastmod: "2026-05-09", changefreq: "weekly", priority: "0.85",
      images: [{ loc: "https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=630&fit=crop&q=85", title: "Best BBQ Rub for Brisket — Ultimate Pitmaster Recipe", caption: "The perfect bark-building BBQ rub for competition-level brisket" }],
    },
    {
      loc: `${site}/blog/steak-bites-shell-pasta-creamy-garlic`, lastmod: "2026-05-09", changefreq: "weekly", priority: "0.85",
      images: [
        { loc: "https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=630&fit=crop&q=85", title: "Steak Bites and Shell Pasta in Creamy Garlic Butter Alfredo Sauce", caption: "Golden seared steak bites tossed with shell pasta in garlic butter Alfredo" },
        { loc: `${site}/blog-images/steak-bites-skillet-garlic-herbs.webp`, title: "Steak bites sizzling in cast iron with garlic and herbs" },
        { loc: `${site}/blog-images/steak-bites-cream-sauce-skillet.webp`, title: "Creamy garlic Alfredo sauce with steak bites in skillet" },
      ],
    },
    {
      loc: `${site}/blog/dry-aging-steak-home`, lastmod: "2026-05-09", changefreq: "weekly", priority: "0.85",
      images: [
        { loc: "https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=630&fit=crop&q=85", title: "Ultimate Guide to Dry Aging Steak at Home" },
        { loc: `${site}/blog-images/brisket-dry-aged-crust.webp`, title: "Dry aged brisket pelicle crust after 21 days" },
        { loc: `${site}/blog-images/dry-ager-fridge-beef.webp`, title: "Dry aging fridge cabinet with beef hanging inside" },
        { loc: `${site}/blog-images/dry-aging-progression-day7-21-45.webp`, title: "Dry aging beef progression at day 7, 21, and 45" },
        { loc: `${site}/blog-images/dry-aged-ribeye-trimmed-marbled.webp`, title: "Trimmed dry aged ribeye showing intense marbling" },
      ],
    },
    {
      loc: `${site}/blog/carnivore-diet-meals-for-fat-loss`, lastmod: "2026-05-10", changefreq: "weekly", priority: "0.85",
      images: [
        { loc: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200&h=630&fit=crop&q=85", title: "Best Carnivore Diet Meals for Fat Loss &amp; Energy", caption: "Ribeye steak and eggs — the ultimate carnivore diet meal for fat loss" },
        { loc: "https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=630&fit=crop&q=85", title: "Carnivore diet food selection — ribeye, eggs, pork belly" },
      ],
    },
  ];

  const urls: UrlEntry[] = [
    { loc: `${site}/`,       lastmod: today, changefreq: "daily",   priority: "1.0", images: [{ loc: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1200&h=630&fit=crop&q=85", title: "Meat Lovers Hub — BBQ &amp; Grilling Recipes", caption: "Homepage hero: expertly grilled meats from Meat Lovers Hub" }] },
    { loc: `${site}/recipes`, lastmod: today, changefreq: "weekly",  priority: "0.9", images: [{ loc: "https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=630&fit=crop&q=85", title: "All Meat Recipes — Steak, BBQ, Chicken &amp; More" }] },
    { loc: `${site}/carnivore-meal-plan`,      lastmod: today, changefreq: "weekly",  priority: "0.9" },
    { loc: `${site}/resources`,                lastmod: today, changefreq: "monthly", priority: "0.8" },
    { loc: `${site}/guides/meat-temperatures`, lastmod: today, changefreq: "monthly", priority: "0.85" },
    ...blogPosts,
    ...CATEGORY_SLUGS.map((s) => ({
      loc: `${site}/recipes/category/${s}`,
      lastmod: today, changefreq: "weekly", priority: "0.75",
      images: CATEGORY_IMAGES[s] ? [{ loc: CATEGORY_IMAGES[s]!, title: xmlEsc(`${s.replace(/-/g, " ")} recipes — Meat Lovers Hub`) }] : undefined,
    })),
    ...RECIPE_SLUGS.map((r) => ({
      loc: `${site}/recipes/${r.id}`,
      lastmod: r.date, changefreq: "weekly", priority: "0.8",
      images: r.image ? [{ loc: `${r.image}?w=1200&h=630&fit=crop&q=85`, title: xmlEsc(r.title), caption: xmlEsc(r.desc) }] : undefined,
    })),
    { loc: `${site}/author/juicy-joe`,   lastmod: today, changefreq: "monthly", priority: "0.7" },
    { loc: `${site}/editorial-policy`,   lastmod: today, changefreq: "yearly",  priority: "0.5" },
    { loc: `${site}/newsletter`,         lastmod: today, changefreq: "monthly", priority: "0.6" },
    { loc: `${site}/contact`,            lastmod: today, changefreq: "yearly",  priority: "0.4" },
    { loc: `${site}/follow`,             lastmod: today, changefreq: "yearly",  priority: "0.35" },
    { loc: `${site}/privacy-policy`,     lastmod: today, changefreq: "yearly",  priority: "0.3" },
    { loc: `${site}/terms`,              lastmod: today, changefreq: "yearly",  priority: "0.3" },
  ];

  const entries = urls.map(renderUrl).join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
    entries,
    `</urlset>`,
  ].join("\n");
}

function buildRobots(): string {
  const site = getSiteUrl();
  return [
    "User-agent: *",
    "Allow: /",
    "",
    "Disallow: /__repl*",
    "Disallow: /assets/",
    "",
    `Sitemap: ${site}/sitemap.xml`,
    "",
    `# RSS Feed: ${site}/rss.xml`,
  ].join("\n");
}

const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "public, max-age=3600, s-maxage=86400",
} as const;

const TXT_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "public, max-age=86400",
} as const;

router.get("/sitemap.xml", (_req, res) => {
  logger.info("serving sitemap.xml");
  const body = buildSitemap();
  Object.entries(XML_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  res.status(200).send(body);
});

router.get("/robots.txt", (_req, res) => {
  logger.info("serving robots.txt");
  const body = buildRobots();
  Object.entries(TXT_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  res.status(200).send(body);
});

// ── Google Search Console verification (HTML file method) ──────────────────
const GSC_TOKEN = process.env.GOOGLE_SITE_VERIFICATION || "google6a5a0337cafa49d3";
const GSC_FILENAME = GSC_TOKEN.startsWith("google") ? GSC_TOKEN : `google${GSC_TOKEN}`;

router.get(`/${GSC_FILENAME}.html`, (_req, res) => {
  logger.info(`serving Google Search Console verification file: ${GSC_FILENAME}.html`);
  const body = `google-site-verification: ${GSC_FILENAME}.html`;
  res.writeHead(200, {
    "Content-Type": "text/html",
    "Content-Length": Buffer.byteLength(body, "utf-8"),
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(body, "utf-8");
});

export default router;
