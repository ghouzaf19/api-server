import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { marked } from "marked";
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag, TrendingUp, BookOpen, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SeoMeta } from "@/components/SeoMeta";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { SITE_URL } from "@/lib/siteUrl";
import { heroSrc, heroSrcSet, cardSrc, cardSrcSet, HERO_SIZES, CARD_SIZES } from "@/lib/imageUrl";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

interface BlogPost {
  id: string;
  topic: string;
  niche: string;
  title: string;
  slug: string | null;
  featuredImage: string | null;
  pinterestImage: string | null;
  outline: string;
  content: string;
  seoScore: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function readTime(wordCount: number): string {
  return `${Math.max(1, Math.round(wordCount / 200))} min read`;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .trim();
}

function getMetaDescription(content: string): string {
  const plain = stripMarkdown(content);
  return plain.split(/\s+/).filter(Boolean).slice(0, 30).join(" ") + "…";
}

function nicheColor(niche: string): string {
  const n = niche.toLowerCase();
  if (n.includes("beef") || n.includes("steak")) return "#B91C1C";
  if (n.includes("chicken") || n.includes("poultry")) return "#B45309";
  if (n.includes("bbq") || n.includes("grill")) return "#b85000";
  if (n.includes("pork") || n.includes("rib")) return "#7C3AED";
  return "#166534";
}

/** Base Unsplash photo IDs for niche fallbacks — query params are built by imageUrl helpers */
const NICHE_PHOTOS: Record<string, string> = {
  beef:    "https://images.unsplash.com/photo-1558030006-450675393462",
  chicken: "https://images.unsplash.com/photo-1532550907401-a500c9a57435",
  bbq:     "https://images.unsplash.com/photo-1544025162-d76694265947",
  burger:  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
  pork:    "https://images.unsplash.com/photo-1544025162-d76694265947",
  default: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd",
};

function nichePhoto(niche: string, topic: string): string {
  const t = (niche + " " + topic).toLowerCase();
  if (t.includes("beef") || t.includes("steak") || t.includes("ribeye")) return NICHE_PHOTOS.beef!;
  if (t.includes("chicken") || t.includes("poultry")) return NICHE_PHOTOS.chicken!;
  if (t.includes("bbq") || t.includes("grill") || t.includes("smoke")) return NICHE_PHOTOS.bbq!;
  if (t.includes("burger") || t.includes("smash")) return NICHE_PHOTOS.burger!;
  if (t.includes("pork") || t.includes("rib") || t.includes("bacon")) return NICHE_PHOTOS.pork!;
  return NICHE_PHOTOS.default!;
}

/** Strip any existing query params so the URL can be a bare photo URL or a DB-stored URL */
function toBase(url: string): string {
  return url.split("?")[0] ?? url;
}

function nicheImage(niche: string, topic: string): string {
  return nichePhoto(niche, topic); // bare — consumers call heroSrc/cardSrc on it
}

marked.setOptions({ gfm: true, breaks: true });

// ── Scoring ──────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by","from",
  "is","was","are","were","be","been","have","has","had","do","does","did","will",
  "would","could","should","may","might","can","this","that","these","those","how",
  "what","when","where","why","your","you","my","our","its","vs","best","top","guide",
  "step","2024","2025","2026","complete","ultimate","full","into","more","about",
  "get","use","make","like","know","want","need","just","one","also","here","there",
  "so","if","it","all","new","most","other","some","time","than","then","very","each",
  "after","before","over","under","while","through","without","between","against",
]);

function extractKeywords(texts: string[]): Set<string> {
  const words = new Set<string>();
  for (const text of texts) {
    const plain = text
      .replace(/#{1,6}\s+/g, " ")
      .replace(/\*\*?(.+?)\*\*?/g, "$1")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .replace(/[^a-z0-9\s]/gi, " ")
      .toLowerCase();
    for (const word of plain.split(/\s+/)) {
      if (word.length > 3 && !STOP_WORDS.has(word)) words.add(word);
    }
  }
  return words;
}

function getContentPreview(content: string, wordCount = 200): string {
  return content
    .replace(/#{1,6}\s+/g, " ")
    .replace(/[*[\]`]/g, " ")
    .split(/\s+/)
    .slice(0, wordCount)
    .join(" ");
}

function scoreRelatedness(current: BlogPost, candidate: BlogPost): number {
  if (candidate.id === current.id) return -Infinity;
  let score = 0;

  // Signal 1: Same niche (+3)
  if (candidate.niche.toLowerCase() === current.niche.toLowerCase()) score += 3;

  // Signal 2: Shared keywords from title + topic + first 200 words of content (+2 each)
  const currentKw = extractKeywords([current.title, current.topic, getContentPreview(current.content)]);
  const candidateKw = extractKeywords([candidate.title, candidate.topic, getContentPreview(candidate.content)]);
  for (const kw of candidateKw) {
    if (currentKw.has(kw)) score += 2;
  }

  // Signal 3: Similar title words (+1 each, stacks with signal 2 for stronger title matches)
  const currentTitleKw = extractKeywords([current.title]);
  const candidateTitleKw = extractKeywords([candidate.title]);
  for (const w of candidateTitleKw) {
    if (currentTitleKw.has(w)) score += 1;
  }

  // Signal 4: Recent article boost (+1 if published in last 30 days)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  if (new Date(candidate.createdAt).getTime() > thirtyDaysAgo) score += 1;

  return score;
}

function getAnchorText(post: BlogPost): string {
  const words = post.title
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w.toLowerCase()));
  if (words.length >= 2) return words.slice(0, 3).join(" ");
  return post.topic;
}

function getExcerpt(content: string, wordLimit = 20): string {
  const plain = content
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/^[-*+>]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\n/g, " ")
    .trim();
  const words = plain.split(/\s+/).filter(Boolean);
  return words.slice(0, wordLimit).join(" ") + (words.length > wordLimit ? "…" : "");
}

export function BlogPostPage() {
  const { slug: param } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);

  // Fetch current post
  useEffect(() => {
    if (!param) return;
    setLoading(true);
    setError(null);

    if (UUID_RE.test(param)) {
      fetch(`/api/seo/posts/${param}`)
        .then((r) => {
          if (!r.ok) throw new Error(r.status === 404 ? "Article not found" : "Failed to load article");
          return r.json() as Promise<BlogPost>;
        })
        .then((data) => {
          if (data.slug) navigate(`/blog/${data.slug}`, { replace: true });
          else { setPost(data); setLoading(false); }
        })
        .catch((e: Error) => { setError(e.message); setLoading(false); });
    } else {
      fetch(`/api/seo/posts/by-slug/${encodeURIComponent(param)}`)
        .then((r) => {
          if (!r.ok) throw new Error(r.status === 404 ? "Article not found" : "Failed to load article");
          return r.json() as Promise<BlogPost>;
        })
        .then((data) => {
          // If the current slug differs from what we searched for, this is an
          // old-slug redirect — silently update the URL (replace: true so the
          // back button doesn't loop back to the old slug).
          if (data.slug && data.slug !== param) {
            navigate(`/blog/${data.slug}`, { replace: true });
          } else {
            setPost(data);
            setLoading(false);
          }
        })
        .catch((e: Error) => { setError(e.message); setLoading(false); });
    }
  }, [param]);

  // Fetch related articles using enhanced scoring
  useEffect(() => {
    if (!post) return;
    fetch("/api/seo/posts")
      .then((r) => r.json() as Promise<BlogPost[]>)
      .then((all) => {
        const scored = all
          .filter((p) => p.id !== post.id)
          .map((p) => ({ p, score: scoreRelatedness(post, p) }))
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            // Tiebreak: newer first
            return new Date(b.p.createdAt).getTime() - new Date(a.p.createdAt).getTime();
          })
          .slice(0, 3)
          .map(({ p }) => p);
        setRelated(scored);
      })
      .catch(() => {});
  }, [post?.id]);

  // Preload hero image for LCP — include imagesrcset so the browser fetches
  // the right responsive variant immediately instead of the fallback src.
  useEffect(() => {
    if (!post) return;
    const base = toBase(post.featuredImage ?? nicheImage(post.niche, post.topic));
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = heroSrc(base);
    link.setAttribute("fetchpriority", "high");
    link.setAttribute("imagesrcset", heroSrcSet(base));
    link.setAttribute("imagesizes", HERO_SIZES);
    document.head.appendChild(link);
    return () => link.remove();
  }, [post?.id]);

  if (loading) {
    return (
      <div style={{ background: "#F9F6F1", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>
        <SiteHeader />
        <div style={{ maxWidth: "760px", margin: "4rem auto", padding: "0 1.5rem", width: "100%", boxSizing: "border-box" }}>
          {[80, 60, 100, 90, 75].map((w, i) => (
            <div key={i} style={{ height: i === 0 ? "2.5rem" : "1rem", background: "linear-gradient(90deg, #f0ebe3 25%, #e8e2d9 50%, #f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: "6px", marginBottom: "1rem", width: `${w}%` }} />
          ))}
        </div>
        <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ background: "#F9F6F1", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>
        <SiteHeader />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "4rem 1.5rem" }}>
          <p style={{ fontFamily: SF, fontSize: "2.5rem", color: "#111" }}>{error || "Article not found"}</p>
          <Link href="/blog" style={{ color: "#B91C1C", fontFamily: SS, fontWeight: 600, textDecoration: "none" }}>← Back to Blog</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const color = nicheColor(post.niche);
  const heroImg = post.featuredImage ?? nicheImage(post.niche, post.topic);
  // Pinterest OG image: use the server-generated portrait image if available, else fall back to hero
  const ogImage = post.pinterestImage ? `${SITE_URL}${post.pinterestImage}` : heroImg;
  const metaDesc = getMetaDescription(post.content);
  const canonicalSlug = post.slug ?? post.id;
  const pageUrl = `${SITE_URL}/blog/${canonicalSlug}`;
  const htmlContent = marked(post.content) as string;

  return (
    <>
      <SeoMeta
        title={post.title}
        description={metaDesc}
        image={ogImage}
        imageAlt={post.title}
        url={pageUrl}
        type="article"
        publishedAt={post.createdAt}
        modifiedAt={post.updatedAt}
        authorName="Juicy Joe"
        tags={[post.niche, post.topic, "meat recipes", "cooking guide"]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: "Blog", url: `${SITE_URL}/blog` },
          { name: post.title, url: pageUrl },
        ]}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": metaDesc,
        "image": {
          "@type": "ImageObject",
          "url": ogImage,
          "width": 1200,
          "height": 630,
        },
        "datePublished": post.createdAt,
        "dateModified": post.updatedAt,
        "author": {
          "@type": "Person",
          "name": "Juicy Joe",
          "url": `${SITE_URL}/author/juicy-joe`,
        },
        "publisher": {
          "@type": "Organization",
          "name": "Meat Lovers Hub",
          "url": SITE_URL,
          "logo": {
            "@type": "ImageObject",
            "url": `${SITE_URL}/opengraph.jpg`,
            "width": 1200,
            "height": 630,
          },
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": pageUrl,
        },
        "url": pageUrl,
        "articleSection": post.niche,
        "keywords": [post.niche, post.topic, "meat recipes", "BBQ", "grilling", "carnivore diet"].join(", "),
        "wordCount": post.wordCount,
        "inLanguage": "en-US",
        "about": [
          { "@type": "Thing", "name": post.topic },
          { "@type": "Thing", "name": post.niche },
        ],
      }) }} />

      {/* ── Conditional Recipe / HowTo schema for technique-guide posts ── */}
      {post.slug === "best-bbq-rub-for-brisket" && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": post.title,
          "description": "A pitmaster's complete guide to building the perfect BBQ brisket bark — covering three rub recipes, the science of 16-mesh pepper, salt timing, wood pairing, troubleshooting, and food-safe resting.",
          "image": {
            "@type": "ImageObject",
            "url": `${SITE_URL}/blog-images/brisket-hero.jpg`,
            "caption": "Sliced Texas-style smoked brisket with a deep mahogany bark — hero image",
          },
          "totalTime": "PT16H",
          "estimatedCost": { "@type": "MonetaryAmount", "currency": "USD", "value": "12" },
          "tool": [
            { "@type": "HowToTool", "name": "Offset smoker or kamado" },
            { "@type": "HowToTool", "name": "Instant-read thermometer (calibrated)" },
            { "@type": "HowToTool", "name": "Unlined butcher paper" },
            { "@type": "HowToTool", "name": "Insulated cooler for resting" },
          ],
          "supply": [
            { "@type": "HowToSupply", "name": "Coarse kosher salt (Diamond Crystal recommended)" },
            { "@type": "HowToSupply", "name": "16-mesh coarse black pepper" },
            { "@type": "HowToSupply", "name": "Post oak, hickory, or cherry wood chunks" },
            { "@type": "HowToSupply", "name": "Whole packer brisket (12–15 lb / 5.4–6.8 kg)" },
          ],
          "step": [
            {
              "@type": "HowToStep",
              "name": "Apply the rub — salt timing is critical",
              "text": "Apply a 50/50 mix of coarse kosher salt and 16-mesh black pepper generously to all surfaces. Rest uncovered in the refrigerator for 12–24 hours minimum. Do not go straight to the smoker — moisture must reabsorb before cooking.",
              "image": `${SITE_URL}/blog-images/brisket-rub-application.jpg`,
            },
            {
              "@type": "HowToStep",
              "name": "Preheat smoker to 225°F (107°C)",
              "text": "Preheat your smoker to exactly 225°F (107°C) using post oak for a classic Texas profile. Maintain this temperature throughout the unwrapped phase.",
            },
            {
              "@type": "HowToStep",
              "name": "Smoke unwrapped until bark sets at 165°F (74°C)",
              "text": "Smoke fat-side up for 6–8 hours until the internal temperature reaches 165°F (74°C) and the bark is deep mahogany and firm to the touch. Do not wrap before the bark has set.",
            },
            {
              "@type": "HowToStep",
              "name": "Wrap and cook to probe-tender 200–205°F (93–96°C)",
              "text": "Wrap tightly in unlined butcher paper. Return to the smoker and continue cooking until a probe slides in with zero resistance — typically at 200–205°F (93–96°C). This usually takes 4–6 more hours.",
            },
            {
              "@type": "HowToStep",
              "name": "Rest in a cooler for 2–4 hours — monitor the Danger Zone",
              "text": "Wrap in a towel and place in an insulated cooler. Rest for a minimum of 1 hour, ideally 2–4 hours. Monitor that the brisket stays above 140°F (60°C) — the lower bound of food safety. Bacteria multiply rapidly in the 40–140°F Danger Zone.",
              "image": `${SITE_URL}/blog-images/brisket-finished-bark.jpg`,
            },
          ],
          "author": { "@type": "Person", "name": "Juicy Joe", "url": `${SITE_URL}/author/juicy-joe` },
          "datePublished": post.createdAt,
          "dateModified": post.updatedAt,
          "inLanguage": "en-US",
          "keywords": "BBQ brisket rub, 16-mesh pepper, bark formation, Texas brisket, salt timing, pitmaster guide",
        }) }} />
      )}

      {/* ── Recipe schema for lamb rack post ── */}
      {(post.slug === "grilled-lamb-rack-pomegranate-chimichurri" || post.slug === "lamb-rack-with-pomegranate-chimichurri-secret") && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Recipe",
          "name": "Perfect Lamb Rack with Pomegranate Chimichurri",
          "description": "A professional-level guide to grilling tender lamb rack with a vibrant pomegranate chimichurri sauce. Two-zone method, exact pull temperature, full silver skin and frenching technique.",
          "author": { "@type": "Person", "name": "Juicy Joe", "url": `${SITE_URL}/author/juicy-joe` },
          "datePublished": post.createdAt,
          "dateModified": post.updatedAt,
          "image": `${SITE_URL}/blog-images/lamb-chops-herbs-pomegranate-chimichurri.webp`,
          "recipeYield": "4 servings",
          "recipeCategory": "Main Course",
          "recipeCuisine": "BBQ/Fusion",
          "keywords": "rack of lamb, grilled lamb rack, pomegranate chimichurri, two-zone grilling, lamb medium rare",
          "prepTime": "PT45M",
          "cookTime": "PT30M",
          "totalTime": "PT1H15M",
          "recipeIngredient": [
            "1 full rack of lamb (8 ribs), French-trimmed, silver skin removed",
            "2 tbsp olive oil",
            "1½ tsp kosher salt",
            "1 tsp freshly cracked black pepper",
            "1 tsp garlic powder",
            "1 tsp fresh rosemary, finely chopped",
            "Zest of 1 lemon",
            "1 cup fresh flat-leaf parsley, finely chopped",
            "¼ cup fresh mint leaves, finely chopped",
            "3 cloves garlic, minced",
            "2 tbsp red wine vinegar",
            "1 tbsp fresh lemon juice",
            "½ tsp dried chili flakes",
            "6 tbsp extra-virgin olive oil",
            "½ cup fresh pomegranate arils",
          ],
          "recipeInstructions": [
            { "@type": "HowToStep", "position": 1, "name": "Trim and season", "text": "Remove silver skin from the loin muscle with a boning knife. French the bones clean. Rub with olive oil, salt, pepper, garlic powder, rosemary, and lemon zest. Rest uncovered in the refrigerator for 2–8 hours." },
            { "@type": "HowToStep", "position": 2, "name": "Make chimichurri", "text": "Combine finely chopped parsley, mint, garlic, red wine vinegar, lemon juice, chili flakes, salt, and olive oil. Rest at room temperature 30–60 minutes before serving. Fold in pomegranate arils just before plating." },
            { "@type": "HowToStep", "position": 3, "name": "Sear over direct heat", "text": "Preheat grill with two zones. Sear rack bone-side down over direct heat at 400°F for 3–4 minutes. Flip to fat side for 3–4 minutes. Sear thin edges 60 seconds each." },
            { "@type": "HowToStep", "position": 4, "name": "Finish on indirect heat", "text": "Move rack to indirect heat zone at 250°F, bone-side down. Close lid and cook until internal temperature reaches 125°F (52°C) at the thickest part of the loin muscle, away from bone — approximately 12–18 minutes." },
            { "@type": "HowToStep", "position": 5, "name": "Rest and serve", "text": "Tent with foil and rest 10 minutes. Slice between bones into individual chops. Spoon chimichurri over cut surfaces and serve immediately." },
          ],
        }) }} />
      )}

      {/* ── Recipe schema for Texas Smoked Brisket technique post ── */}
      {post.slug === "mount-everest-bbq-mastering-tender-juicy" && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Recipe",
          "name": "Tender & Juicy Texas-Style Smoked Brisket",
          "description": "Learn how to master the perfect smoked brisket with a dark obsidian bark and juicy interior using the Foil Boat method, 16-mesh pepper rub, and a long rest.",
          "author": { "@type": "Person", "name": "Juicy Joe", "url": `${SITE_URL}/author/juicy-joe` },
          "datePublished": post.createdAt,
          "dateModified": post.updatedAt,
          "image": `${SITE_URL}/blog-images/perfect-brisket-slice.webp`,
          "recipeYield": "12 servings",
          "recipeCategory": "Main Course",
          "recipeCuisine": "American BBQ",
          "keywords": "smoked brisket, Texas brisket, foil boat method, brisket stall, 16-mesh pepper, beef tallow, BBQ",
          "prepTime": "PT30M",
          "cookTime": "PT14H",
          "totalTime": "PT22H",
          "recipeIngredient": [
            "1 whole packer brisket (12–15 lbs), Choice or Prime grade",
            "¼ cup 16-mesh coarse black pepper",
            "¼ cup coarse kosher salt",
            "2–4 tbsp rendered beef tallow (from trimmings)",
          ],
          "recipeInstructions": [
            { "@type": "HowToStep", "position": 1, "name": "Select and trim", "text": "Choose Choice or Prime grade. Trim fat cap to ¼ inch. Do the Bend Test — a flexible raw brisket signals good marbling." },
            { "@type": "HowToStep", "position": 2, "name": "Apply the rub", "text": "Mix 16-mesh coarse black pepper and kosher salt 50/50 by volume. Apply generously to all surfaces and press firmly. Dry-brine uncovered in the refrigerator for 12–24 hours." },
            { "@type": "HowToStep", "position": 3, "name": "Smoke low and slow", "text": "Set smoker to 225°F–250°F with Post Oak wood. Place brisket fat-side down. Smoke until internal temp reaches 160°F–170°F and bark is set (4–6 hours)." },
            { "@type": "HowToStep", "position": 4, "name": "Foil Boat through the stall", "text": "Fold heavy-duty foil up the sides of the brisket, leaving the top exposed. Add rendered beef tallow to the bottom of the boat. Continue smoking until probe-tender at 200°F–205°F." },
            { "@type": "HowToStep", "position": 5, "name": "Rest before slicing", "text": "Hold in a 170°F oven (door cracked) or insulated cooler for 4–8 hours. Slice flat against the grain, point into cubes. Serve immediately." },
          ],
          "nutrition": {
            "@type": "NutritionInformation",
            "servingSize": "6 oz",
            "proteinContent": "38g",
            "fatContent": "22g",
          },
        }) }} />
      )}

      {/* ── Recipe schema for brisket rub post (Google Rich Results eligibility) ── */}
      {post.slug === "best-bbq-rub-for-brisket" && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Recipe",
          "name": "Pitmaster's Brisket Rub — Texas Salt & Pepper",
          "description": "The Aaron Franklin-standard Texas brisket rub: equal parts coarse kosher salt and 16-mesh black pepper. The simplest rub and the most reliable bark.",
          "author": { "@type": "Person", "name": "Juicy Joe", "url": `${SITE_URL}/author/juicy-joe` },
          "datePublished": post.createdAt,
          "dateModified": post.updatedAt,
          "image": `${SITE_URL}/blog-images/brisket-seasoning-rub-application.webp`,
          "recipeYield": "Enough rub for 1 full packer brisket (12–15 lb)",
          "recipeCategory": "BBQ Seasoning",
          "recipeCuisine": "American BBQ",
          "keywords": "brisket rub, 16-mesh pepper, Texas brisket, bark formation, BBQ rub",
          "prepTime": "PT5M",
          "cookTime": "PT16H",
          "totalTime": "PT16H5M",
          "recipeIngredient": [
            "¼ cup coarse kosher salt (Diamond Crystal recommended)",
            "¼ cup 16-mesh coarse black pepper (butcher grind)",
            "Optional: 1 tbsp smoked paprika",
            "Optional: 1 tbsp garlic powder",
            "Optional: 1 tbsp dark brown sugar (competition rub)",
            "Optional: 1 tbsp finely ground espresso (espresso-chili rub)",
          ],
          "recipeInstructions": [
            { "@type": "HowToStep", "position": 1, "name": "Trim fat cap", "text": "Trim the brisket fat cap to approximately ¼ inch (6mm). Too much fat blocks the rub from reaching the meat surface; too little removes the self-basting layer." },
            { "@type": "HowToStep", "position": 2, "name": "Mix and apply rub", "text": "Combine kosher salt and 16-mesh black pepper in a 50/50 ratio by volume. Apply generously to all surfaces of the brisket — top, bottom, and sides. Press firmly so the rub adheres." },
            { "@type": "HowToStep", "position": 3, "name": "Dry-brine overnight", "text": "Place the rubbed brisket uncovered on a wire rack in the refrigerator for 12–24 hours. The salt will draw moisture to the surface, then reabsorb — this is dry-brining, and it is the foundation of bark formation." },
          ],
          "nutrition": {
            "@type": "NutritionInformation",
            "servingSize": "1 portion",
            "sodiumContent": "High — brisket is salted during the rub process",
          },
        }) }} />
      )}

      <div style={{ background: "#F9F6F1", minHeight: "100vh", fontFamily: SS, display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>
        <SiteHeader />

        {/* ── Hero ── */}
        <div style={{ position: "relative", overflow: "hidden", background: "#1a1008", width: "100%" }}>
          <img
            src={heroSrc(toBase(heroImg))}
            srcSet={heroSrcSet(toBase(heroImg))}
            sizes={HERO_SIZES}
            alt={`${post.title} — Meat Lovers Hub`}
            fetchPriority="high"
            decoding="async"
            width={1200}
            height={514}
            style={{ width: "100%", height: "400px", objectFit: "cover", display: "block", filter: "brightness(0.35)" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 0 2.5rem" }}>
            <div style={{ maxWidth: "860px", margin: "0 auto", width: "100%", padding: "0 1.5rem", boxSizing: "border-box" }}>
              <nav style={{ marginBottom: "1rem" }}>
                <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontFamily: SS, fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                  <ArrowLeft style={{ width: "0.7rem", height: "0.7rem" }} /> Blog
                </Link>
              </nav>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: `${color}cc`, borderRadius: "5px", padding: "0.25rem 0.7rem", marginBottom: "0.75rem", fontFamily: SS, fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>
                <Tag style={{ width: "0.6rem", height: "0.6rem" }} /> {post.niche}
              </div>
              <h1 style={{ fontFamily: SF, fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 600, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: "1rem" }}>
                {post.title}
              </h1>
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: SS, fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                  <Calendar style={{ width: "0.75rem", height: "0.75rem" }} /> {formatDate(post.createdAt)}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: SS, fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                  <Clock style={{ width: "0.75rem", height: "0.75rem" }} /> {readTime(post.wordCount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Article Body ── */}
        <div style={{ maxWidth: "860px", width: "100%", margin: "0 auto", padding: "3rem 1.5rem 4rem", boxSizing: "border-box" }}>
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />

          <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #EAE5DC" }}>
            <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: SS, fontSize: "0.82rem", fontWeight: 700, color: "#B91C1C", textDecoration: "none" }}>
              <ArrowLeft style={{ width: "0.8rem", height: "0.8rem" }} /> Back to all articles
            </Link>
          </div>
        </div>

        {/* ── You Might Also Like ── */}
        {related.length > 0 && (
          <div style={{ background: "#1a1008", width: "100%", padding: "3.5rem 1.5rem" }}>
            <div style={{ maxWidth: "860px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Sparkles style={{ width: "0.9rem", height: "0.9rem", color: "#ff8080" }} />
                <span style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ff8080" }}>
                  Curated For You
                </span>
              </div>
              <h2 style={{ fontFamily: SF, fontSize: "clamp(1.7rem, 4vw, 2.4rem)", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", margin: "0 0 2rem", lineHeight: 1.1 }}>
                You Might Also <em>Like</em>
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.25rem" }}>
                {related.map((r, i) => {
                  const rColor = nicheColor(r.niche);
                  const rImg = r.featuredImage ?? nicheImage(r.niche, r.topic);
                  const rHref = `/blog/${r.slug ?? r.id}`;
                  const rExcerpt = getExcerpt(r.content, 18);
                  const anchorText = getAnchorText(r);
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.07 }}
                    >
                      <Link href={rHref} style={{ display: "block", textDecoration: "none", height: "100%" }}>
                        <motion.div
                          whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(0,0,0,0.5)" }}
                          transition={{ type: "spring", stiffness: 320, damping: 22 }}
                          style={{ borderRadius: "14px", overflow: "hidden", background: "#2a1a0e", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", height: "100%", cursor: "pointer" }}
                        >
                          {/* Thumbnail */}
                          <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", flexShrink: 0 }}>
                            <motion.img
                              src={cardSrc(toBase(rImg))}
                              srcSet={cardSrcSet(toBase(rImg))}
                              sizes={CARD_SIZES}
                              alt={`${r.title} — Meat Lovers Hub`}
                              loading="lazy"
                              decoding="async"
                              width={800}
                              height={450}
                              whileHover={{ scale: 1.08 }}
                              transition={{ duration: 0.45 }}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "brightness(0.7)" }}
                            />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
                            <div style={{ position: "absolute", top: "0.6rem", left: "0.6rem", background: `${rColor}dd`, borderRadius: "4px", padding: "0.15rem 0.5rem", fontFamily: SS, fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>
                              {r.niche}
                            </div>
                          </div>

                          {/* Text */}
                          <div style={{ padding: "1rem 1rem 1.1rem", display: "flex", flexDirection: "column", flex: 1 }}>
                            <h3 style={{ fontFamily: SF, fontSize: "1.05rem", fontWeight: 700, color: "#fff", lineHeight: 1.25, letterSpacing: "-0.01em", margin: "0 0 0.5rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                              {r.title}
                            </h3>
                            <p style={{ fontFamily: SS, fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.55, margin: "0 0 0.85rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", flex: 1 }}>
                              {rExcerpt}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontFamily: SS, fontSize: "0.65rem", color: "rgba(255,255,255,0.35)" }}>
                                <Clock style={{ width: "0.6rem", height: "0.6rem" }} />
                                {Math.max(1, Math.round(r.wordCount / 200))} min read
                              </span>
                              <span
                                title={r.title}
                                style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: SS, fontSize: "0.68rem", fontWeight: 700, color: rColor, maxWidth: "55%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                              >
                                {anchorText} <ArrowRight style={{ width: "0.6rem", height: "0.6rem", flexShrink: 0 }} />
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <SiteFooter />
      </div>

      <style>{`
        .blog-content {
          font-family: ${SS};
          color: #333;
          line-height: 1.8;
          font-size: 1rem;
        }
        .blog-content h1 {
          font-family: ${SF};
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 700;
          color: #111;
          letter-spacing: -0.025em;
          line-height: 1.1;
          margin: 2.5rem 0 1rem;
        }
        .blog-content h2 {
          font-family: ${SF};
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 600;
          color: #111;
          letter-spacing: -0.02em;
          line-height: 1.15;
          margin: 2.5rem 0 0.85rem;
          padding-bottom: 0.4rem;
          border-bottom: 2px solid #EAE5DC;
        }
        .blog-content h3 {
          font-family: ${SF};
          font-size: 1.35rem;
          font-weight: 600;
          color: #222;
          margin: 2rem 0 0.6rem;
        }
        .blog-content h4, .blog-content h5, .blog-content h6 {
          font-family: ${SS};
          font-size: 0.8rem;
          font-weight: 700;
          color: #333;
          margin: 1.5rem 0 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .blog-content p { margin: 0 0 1.4rem; color: #444; line-height: 1.85; }
        .blog-content strong { color: #111; font-weight: 700; }
        .blog-content em { font-style: italic; color: #555; }
        .blog-content ul, .blog-content ol { margin: 0 0 1.4rem 1.5rem; padding: 0; }
        .blog-content li { margin-bottom: 0.5rem; line-height: 1.7; color: #444; }
        .blog-content blockquote {
          margin: 1.75rem 0;
          padding: 1.25rem 1.5rem;
          border-left: 4px solid #CC2222;
          background: #fff8f8;
          border-radius: 0 8px 8px 0;
          font-family: ${SF};
          font-size: 1.1rem;
          font-style: italic;
          color: #555;
        }
        .blog-content code {
          background: #f4f0ea;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-size: 0.85em;
          font-family: monospace;
          color: #B91C1C;
        }
        .blog-content pre {
          background: #1a1008;
          color: #f5f2ee;
          padding: 1.25rem 1.5rem;
          border-radius: 10px;
          overflow-x: auto;
          margin: 1.5rem 0;
          font-size: 0.88rem;
          line-height: 1.6;
        }
        .blog-content pre code { background: none; color: inherit; padding: 0; }
        .blog-content a { color: #B91C1C; text-decoration: underline; text-underline-offset: 3px; }
        .blog-content a:hover { color: #CC2222; }
        .blog-content hr { border: none; border-top: 1px solid #EAE5DC; margin: 2.5rem 0; }
        .blog-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0; display: block; }
        .blog-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.88rem; }
        .blog-content th {
          background: #1a1008;
          color: #fff;
          padding: 0.65rem 1rem;
          text-align: left;
          font-family: ${SS};
          font-weight: 700;
          font-size: 0.75rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .blog-content td { padding: 0.65rem 1rem; border-bottom: 1px solid #EAE5DC; color: #444; }
        .blog-content tr:last-child td { border-bottom: none; }
        .blog-content tr:nth-child(even) td { background: #f9f6f1; }
      `}</style>
    </>
  );
}
