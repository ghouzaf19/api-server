import { Router, type Request, type Response } from "express";
import { db, blogPostsTable, slugRedirectsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreatePostBody,
  GetPostParams,
  DeletePostParams,
} from "@workspace/api-zod";

const router = Router();

// ── Smart slug generation ────────────────────────────────────────────────────

/**
 * Words that add zero SEO value to a URL slug.
 * Prepositions that give context ("for", "with", "from") are kept — only
 * stripped when they appear at the trailing end.
 */
const SLUG_NOISE = new Set([
  // marketing superlatives
  "best", "top", "great", "good", "easy", "simple", "quick", "fast", "perfect",
  "amazing", "awesome", "ultimate", "complete", "comprehensive", "definitive",
  "essential", "detailed", "thorough", "proven",
  // content-type labels
  "guide", "guides", "tutorial", "recipe", "recipes", "tips", "tricks", "hacks",
  "overview", "summary", "review", "comparison", "compared", "introduction", "intro",
  // experience-level labels
  "beginners", "beginner", "experts", "expert", "advanced", "professionals",
  // structural words
  "step", "steps", "stepbystep",
  // year numbers
  "2024", "2025", "2026", "2027",
  // connectors
  "vs", "versus", "and", "or",
  // question words
  "how", "why", "what", "when", "where",
  // articles + light prepositions (no contextual meaning in a URL)
  "a", "an", "the", "in", "on", "at", "to", "by", "of",
  // misc
  "pitmaster", "your", "our", "their", "its",
]);

/** Prepositions/conjunctions that are awkward at the very end of a slug. */
const TRAILING_STOP = new Set([
  "for", "with", "from", "about", "and", "or",
  "a", "an", "the", "in", "on", "at", "to", "by", "of",
]);

/**
 * Generate a clean, short SEO-friendly slug from an article title.
 * Example: "Best BBQ Rub for Brisket – Ultimate Recipe & Pitmaster Guide"
 *        → "bbq-rub-for-brisket"
 */
function toSmartSlug(title: string, wordLimit = 6): string {
  let words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !SLUG_NOISE.has(w));

  // Remove trailing orphaned prepositions/conjunctions
  while (words.length > 1 && TRAILING_STOP.has(words[words.length - 1]!)) {
    words.pop();
  }

  return words
    .slice(0, wordLimit)
    .join("-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let candidate = base;
  let n = 1;
  while (true) {
    const rows = await db
      .select({ id: blogPostsTable.id })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.slug, candidate));
    const conflict = rows.find((r) => r.id !== excludeId);
    if (!conflict) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

// ── Unsplash image pools ─────────────────────────────────────────────────────

const Q = "?w=1400&h=700&fit=crop&q=72&fm=webp&auto=compress";
const PQ = "?w=1000&h=1080&fit=crop&q=72&fm=webp&auto=compress";
const U = "https://images.unsplash.com/photo-";

const IMAGE_POOLS: Record<string, string[]> = {
  beef:    [`${U}1558030006-450675393462${Q}`, `${U}1600891964092-4316c288032e${Q}`, `${U}1546964124-0cce460f38ef${Q}`],
  chicken: [`${U}1532550907401-a500c9a57435${Q}`, `${U}1598515214221-89a3e4a95dc3${Q}`],
  bbq:     [`${U}1529193591184-b1d58069ecdd${Q}`, `${U}1544025162-d76694265947${Q}`, `${U}1555993539-b9e5d4af2ff4${Q}`],
  burger:  [`${U}1568901346375-23c9450c58cd${Q}`, `${U}1571091718767-18b5b1457add${Q}`],
  pork:    [`${U}1544025162-d76694265947${Q}`, `${U}1555939594-58d7cb561ad1${Q}`],
  lamb:    [`${U}1555939594-58d7cb561ad1${Q}`],
  default: [`${U}1529193591184-b1d58069ecdd${Q}`, `${U}1558030006-450675393462${Q}`, `${U}1555939594-58d7cb561ad1${Q}`],
};

function selectFeaturedImage(niche: string, topic: string, seed: string): string {
  const t = (niche + " " + topic).toLowerCase();
  let pool: string[];
  if (t.includes("beef") || t.includes("steak") || t.includes("ribeye") || t.includes("brisket")) pool = IMAGE_POOLS.beef!;
  else if (t.includes("chicken") || t.includes("poultry")) pool = IMAGE_POOLS.chicken!;
  else if (t.includes("bbq") || t.includes("grill") || t.includes("smoke") || t.includes("barbecue")) pool = IMAGE_POOLS.bbq!;
  else if (t.includes("burger") || t.includes("smash")) pool = IMAGE_POOLS.burger!;
  else if (t.includes("pork") || t.includes("rib") || t.includes("bacon") || t.includes("sausage") || t.includes("pulled")) pool = IMAGE_POOLS.pork!;
  else if (t.includes("lamb") || t.includes("game") || t.includes("venison")) pool = IMAGE_POOLS.lamb!;
  else pool = IMAGE_POOLS.default!;
  const hex = seed.replace(/-/g, "").slice(-2);
  return pool[parseInt(hex, 16) % pool.length]!;
}

// ── Pinterest SVG ────────────────────────────────────────────────────────────

function escapeSvg(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    if (!cur) { cur = word; continue; }
    if ((cur + " " + word).length <= maxChars) { cur += " " + word; }
    else { lines.push(cur); cur = word; }
  }
  if (cur) lines.push(cur);
  return lines;
}

function generatePinterestSvg(title: string, niche: string, featuredImageUrl: string | null): string {
  const bgImg = (featuredImageUrl ?? `${U}1529193591184-b1d58069ecdd${PQ}`).replace(/\?.*$/, PQ);
  const lines = wrapText(title, 26).slice(0, 5);
  const e = escapeSvg;
  const titleStartY = 1110;
  const lineH = 68;
  const titleSvg = lines
    .map((l, i) => `<text x="60" y="${titleStartY + i * lineH}" font-family="Georgia, 'Times New Roman', serif" font-size="54" font-weight="bold" fill="#ffffff" letter-spacing="-0.5">${e(l)}</text>`)
    .join("\n  ");
  const nicheW = Math.min(niche.length * 14 + 48, 420);
  const dividerY = titleStartY + lines.length * lineH + 28;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1000 1500" width="1000" height="1500">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0.05"/>
      <stop offset="55%" stop-color="#1a1008" stop-opacity="0.78"/>
      <stop offset="100%" stop-color="#1a1008" stop-opacity="1"/>
    </linearGradient>
    <clipPath id="c"><rect x="0" y="0" width="1000" height="1085"/></clipPath>
  </defs>
  <rect x="0" y="0" width="1000" height="1500" fill="#1a1008"/>
  <image href="${bgImg}" x="0" y="0" width="1000" height="1085" preserveAspectRatio="xMidYMid slice" clip-path="url(#c)"/>
  <rect x="0" y="0" width="1000" height="1085" fill="url(#g)"/>
  <rect x="0" y="1084" width="1000" height="416" fill="#1a1008"/>
  <rect x="60" y="1000" width="${nicheW}" height="46" rx="6" fill="#CC2222"/>
  <text x="80" y="1032" font-family="'Helvetica Neue', Arial, sans-serif" font-size="21" font-weight="800" fill="#fff" letter-spacing="3">${e(niche.toUpperCase())}</text>
  ${titleSvg}
  <rect x="60" y="${dividerY}" width="100" height="3" fill="#CC2222" opacity="0.7"/>
  <text x="60" y="1475" font-family="'Helvetica Neue', Arial, sans-serif" font-size="23" font-weight="700" fill="rgba(255,255,255,0.38)" letter-spacing="5">MEAT LOVERS HUB</text>
</svg>`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPost(p: typeof blogPostsTable.$inferSelect) {
  return {
    ...p,
    seoScore: Number(p.seoScore),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// ── RSS helpers ───────────────────────────────────────────────────────────────

const SITE_ORIGIN = "https://www.meatlovershub.com";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripMarkdownRss(md: string): string {
  return md
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*{1,3}(.+?)\*{1,3}/g, "$1")
    .replace(/_{1,3}(.+?)_{1,3}/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .trim();
}

function rssExcerpt(content: string, words = 55): string {
  const plain = stripMarkdownRss(content);
  const arr = plain.split(/\s+/).filter(Boolean);
  return arr.slice(0, words).join(" ") + (arr.length > words ? "…" : "");
}

// ── Routes ───────────────────────────────────────────────────────────────────

router.get("/rss.xml", async (req: Request, res: Response) => {
  try {
    const posts = await db
      .select()
      .from(blogPostsTable)
      .orderBy(desc(blogPostsTable.createdAt))
      .limit(20);

    const feedUrl = `${SITE_ORIGIN}/api/seo/rss.xml`;

    const items = posts
      .map((post) => {
        const slug = post.slug ?? post.id;
        const link = `${SITE_ORIGIN}/blog/${slug}`;
        const pubDate = new Date(post.createdAt).toUTCString();
        const description = escapeXml(rssExcerpt(post.content ?? ""));
        const title = escapeXml(post.title ?? "Untitled");
        const category = escapeXml(post.niche ?? "BBQ & Meat");
        return [
          "    <item>",
          `      <title>${title}</title>`,
          `      <link>${link}</link>`,
          `      <guid isPermaLink="true">${link}</guid>`,
          `      <pubDate>${pubDate}</pubDate>`,
          `      <description>${description}</description>`,
          `      <category>${category}</category>`,
          "    </item>",
        ].join("\n");
      })
      .join("\n");

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
      "  <channel>",
      "    <title>Meat Lovers Hub — BBQ &amp; Grilling Blog</title>",
      `    <link>${SITE_ORIGIN}/blog</link>`,
      "    <description>In-depth guides, grilling tips, and expert techniques for cooking perfect steak, BBQ, chicken and more from Juicy Joe.</description>",
      "    <language>en-us</language>",
      "    <ttl>60</ttl>",
      `    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>`,
      "    <image>",
      `      <url>https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=144&amp;h=144&amp;fit=crop&amp;q=85</url>`,
      "      <title>Meat Lovers Hub</title>",
      `      <link>${SITE_ORIGIN}/blog</link>`,
      "    </image>",
      items,
      "  </channel>",
      "</rss>",
    ].join("\n");

    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    req.log.error({ err }, "Failed to generate RSS feed");
    res.status(500).send("Failed to generate RSS feed");
  }
});

router.get("/posts", async (req: Request, res: Response) => {
  try {
    const posts = await db.select().from(blogPostsTable).orderBy(blogPostsTable.createdAt);
    res.json(posts.map(formatPost));
  } catch (err) {
    req.log.error({ err }, "Failed to list posts");
    res.status(500).json({ error: "Failed to list posts" });
  }
});

router.post("/posts", async (req: Request, res: Response) => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { topic, niche, title, outline, content, seoScore, wordCount, customImage } = parsed.data;

  const slugBase = toSmartSlug(title);
  const slug = await uniqueSlug(slugBase);
  const seed = crypto.randomUUID();
  const featuredImage = (customImage as string | null | undefined) ?? selectFeaturedImage(niche, topic, seed);

  try {
    const [post] = await db
      .insert(blogPostsTable)
      .values({ topic, niche, title, slug, featuredImage, outline, content, seoScore: String(seoScore), wordCount })
      .returning();

    const pinterestImage = `/api/seo/posts/${post!.id}/og-image`;
    const [updated] = await db
      .update(blogPostsTable)
      .set({ pinterestImage })
      .where(eq(blogPostsTable.id, post!.id))
      .returning();

    res.status(201).json(formatPost(updated!));
  } catch (err) {
    req.log.error({ err }, "Failed to create post");
    res.status(500).json({ error: "Failed to create post" });
  }
});

/**
 * Fetch by slug — with automatic 301-equivalent redirect for old slugs.
 * 1. Check current slugs in blog_posts.
 * 2. If not found, check slug_redirects.
 * 3. The response always carries the post's *current* slug so the client
 *    can update the URL without a full page reload (replace-navigation).
 */
router.get("/posts/by-slug/:slug", async (req: Request, res: Response) => {
  const slug = String(req.params["slug"] ?? "");
  if (!slug) { res.status(400).json({ error: "Slug required" }); return; }

  try {
    // 1. Direct match
    const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, slug));
    if (post) {
      res.json(formatPost(post));
      return;
    }

    // 2. Redirect lookup
    const [redirect] = await db
      .select({ postId: slugRedirectsTable.postId })
      .from(slugRedirectsTable)
      .where(eq(slugRedirectsTable.oldSlug, slug));

    if (redirect) {
      const [redirectPost] = await db
        .select()
        .from(blogPostsTable)
        .where(eq(blogPostsTable.id, redirect.postId));
      if (redirectPost) {
        // Signal to the client that this was a redirect so it can update the URL
        res.setHeader("X-Redirected-Slug", redirectPost.slug ?? "");
        res.json(formatPost(redirectPost));
        return;
      }
    }

    res.status(404).json({ error: "Not found" });
  } catch (err) {
    req.log.error({ err }, "Failed to get post by slug");
    res.status(500).json({ error: "Failed to get post by slug" });
  }
});

router.get("/posts/:id/og-image", async (req: Request, res: Response) => {
  const id = String(req.params["id"] ?? "");
  try {
    const [post] = await db
      .select({ title: blogPostsTable.title, niche: blogPostsTable.niche, featuredImage: blogPostsTable.featuredImage })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, id));
    if (!post) { res.status(404).send("Not found"); return; }
    const svg = generatePinterestSvg(post.title, post.niche, post.featuredImage);
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(svg);
  } catch (err) {
    req.log.error({ err }, "Failed to generate OG image");
    res.status(500).send("Error");
  }
});

router.get("/posts/:id", async (req: Request, res: Response) => {
  const parsed = GetPostParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, parsed.data.id));
    if (!post) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatPost(post));
  } catch (err) {
    req.log.error({ err }, "Failed to get post");
    res.status(500).json({ error: "Failed to get post" });
  }
});

router.patch("/posts/:id", async (req: Request, res: Response) => {
  const parsed = GetPostParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { content } = req.body as { content?: string };
  if (!content) { res.status(400).json({ error: "content is required" }); return; }
  try {
    const [post] = await db
      .update(blogPostsTable)
      .set({ content, updatedAt: new Date() })
      .where(eq(blogPostsTable.id, parsed.data.id))
      .returning();
    if (!post) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatPost(post));
  } catch (err) {
    req.log.error({ err }, "Failed to update post");
    res.status(500).json({ error: "Failed to update post" });
  }
});

router.delete("/posts/:id", async (req: Request, res: Response) => {
  const parsed = DeletePostParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, parsed.data.id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete post");
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
