import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  Search, ArrowRight, X, Mail, Flame, Zap, Clock,
  Instagram, Youtube, Facebook, ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RECIPES } from "@/data/recipes";
import { SITE_URL } from "@/lib/siteUrl";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { SeoMeta } from "@/components/SeoMeta";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RecipeCard } from "@/components/RecipeCard";

/* ── Font/colour tokens ─────────────────────────────────────────────────── */
const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

/* ── Recipe selectors ───────────────────────────────────────────────────── */
function parseSaves(s: string): number {
  return parseFloat(s.replace("k", "")) * (s.includes("k") ? 1000 : 1);
}

const TRENDING    = [...RECIPES].sort((a, b) => parseSaves(b.saves) - parseSaves(a.saves)).slice(0, 6);
const POPULAR     = [...RECIPES].sort((a, b) => parseSaves(b.saves) - parseSaves(a.saves)).slice(0, 3);
const QUICK       = RECIPES.filter(r => r.cookTimeMinutes <= 30);
const EASY        = RECIPES.filter(r => r.difficulty === "Easy");
const POPULAR_TAGS = Array.from(new Set(RECIPES.flatMap(r => r.tags))).slice(0, 8);

/* ── Category strip config ──────────────────────────────────────────────── */
const CAT_STRIP = [
  { name: "Beef & Steak",  slug: "beef",        img: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=600&h=900&fit=crop&q=75&auto=format",   emoji: "🥩" },
  { name: "Chicken",       slug: "chicken",     img: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&h=900&fit=crop&q=75&auto=format", emoji: "🍗" },
  { name: "Game Meat",     slug: "game-meat",   img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=900&fit=crop&q=75&auto=format",   emoji: "🦌" },
  { name: "BBQ & Ribs",    slug: "bbq",         img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=900&fit=crop&q=75&auto=format",   emoji: "🔥" },
  { name: "Quick Meals",   slug: "quick-meals", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=900&fit=crop&q=75&auto=format", emoji: "⚡" },
] as const;

/* ── Category bubble config ─────────────────────────────────────────────── */
const CAT_BUBBLES = [
  { label: "Steak",         image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80",  href: "/recipes/category/beef" },
  { label: "Chicken",       image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&q=80", href: "/recipes/category/chicken" },
  { label: "BBQ & Ribs",    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80",  href: "/recipes/category/bbq" },
  { label: "Burgers",       image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", href: "/recipes/category/quick-meals" },
  { label: "Wild Game",     image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",  href: "/recipes/category/game-meat" },
  { label: "Weekend Grill", image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&q=80", href: "/recipes/category/bbq" },
];

/* ── Seasonal / BBQ section config ─────────────────────────────────────── */
const SEASONAL = [
  {
    label: "Summer BBQ Season",
    desc: "Low & slow smoked ribs, brisket, and pulled pork for your next cookout",
    href: "/recipes/category/bbq",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&h=500&fit=crop&q=80",
    accent: "#CC2222",
    tag: "🔥 BBQ",
  },
  {
    label: "Game Day Burgers",
    desc: "Crowd-pleasing smash burgers, cheeseburgers, and sliders ready in 20 minutes",
    href: "/recipes/category/quick-meals",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&h=500&fit=crop&q=80",
    accent: "#B45309",
    tag: "🍔 Quick Wins",
  },
  {
    label: "Weekend Grill Ideas",
    desc: "From reverse-sear ribeye to tomahawk steaks — weekend recipes worth the wait",
    href: "/recipes",
    img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=900&h=500&fit=crop&q=80",
    accent: "#166534",
    tag: "🥩 Grill Night",
  },
];

/* ── Reusable label chip ────────────────────────────────────────────────── */
function SectionLabel({ children, light }: { children: string; light?: boolean }) {
  return (
    <p style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: light ? "rgba(255,255,255,0.45)" : "#666" }}>
      {children}
    </p>
  );
}

/* ── Authentic cooking gallery data ─────────────────────────────────────── */
const ABOUT_GALLERY_LEFT = [
  { src: "https://images.unsplash.com/photo-1544025162-d76694265947?w=640&h=440&fit=crop&q=82", alt: "Rack of BBQ ribs fresh off the smoker — real cooking", ratio: "4/3" },
  { src: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=640&h=860&fit=crop&q=82", alt: "BBQ grill scene with rising smoke — authentic BBQ setup", ratio: "2/3" },
  { src: "https://images.unsplash.com/photo-1558030006-450675393462?w=640&h=440&fit=crop&q=82", alt: "Cast iron skillet searing a steak — real home cooking", ratio: "4/3" },
];
const ABOUT_GALLERY_RIGHT = [
  { src: "https://images.unsplash.com/photo-1615937722923-67f6deaf2cc9?w=640&h=860&fit=crop&q=82", alt: "Tomahawk steak resting on a rustic wooden cutting board", ratio: "2/3" },
  { src: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=640&h=440&fit=crop&q=82", alt: "Close-up of a juicy seared steak — rich buttery texture", ratio: "4/3" },
  { src: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=640&h=440&fit=crop&q=82", alt: "Honey garlic chicken thighs sizzling in a cast iron pan", ratio: "4/3" },
];

/* ── Social icon button ──────────────────────────────────────────────────── */
function SocialIcon({ href, label, children, brandColor, glowColor, testId }: {
  href: string; label: string; children: React.ReactNode;
  brandColor: string; glowColor: string; testId?: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <motion.a
      href={href}
      aria-label={label}
      data-testid={testId}
      whileHover={{ scale: 1.12, y: -3 }}
      whileTap={{ scale: 0.94 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "46px", height: "46px", borderRadius: "12px", flexShrink: 0,
        background: hov ? brandColor : "rgba(255,255,255,0.07)",
        border: `1px solid ${hov ? "transparent" : "rgba(255,255,255,0.1)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hov ? "#fff" : "rgba(255,255,255,0.55)",
        textDecoration: "none",
        boxShadow: hov ? `0 6px 22px ${glowColor}` : "none",
        transition: "background 0.22s, color 0.22s, box-shadow 0.22s, border-color 0.22s",
      }}
    >
      {children}
    </motion.a>
  );
}

/* ── Trending card ──────────────────────────────────────────────────────── */
function TrendingCard({ recipe, index }: { recipe: typeof TRENDING[number]; index: number }) {
  const diffColor = recipe.difficulty === "Easy" ? "#4ade80" : recipe.difficulty === "Medium" ? "#fbbf24" : "#f87171";
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/recipes/${recipe.id}`} style={{ textDecoration: "none", display: "block" }}>
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{ borderRadius: "1.25rem", overflow: "hidden", position: "relative", aspectRatio: "2/3", boxShadow: "0 6px 28px rgba(0,0,0,0.15)", cursor: "pointer", background: "#111" }}
        >
          <img
            src={recipe.imageTall}
            alt={recipe.imageAlt}
            loading={index < 3 ? "eager" : "lazy"}
            decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.45s ease" }}
          />
          {/* Gradient overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.05) 100%)" }} />

          {/* Top row: saves + label */}
          <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", right: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ background: "#CC2222", borderRadius: "4px", padding: "0.2rem 0.55rem", fontFamily: SS, fontSize: "0.55rem", fontWeight: 800, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {recipe.viralLabel}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: "rgba(230,0,35,0.92)", backdropFilter: "blur(6px)", borderRadius: "999px", padding: "0.28rem 0.65rem" }}>
              <span style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 800, color: "#fff", letterSpacing: "0.02em" }}>📌 {recipe.saves}</span>
            </div>
          </div>

          {/* Bottom: meta + title */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.25rem 1rem" }}>
            <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.45rem", flexWrap: "wrap" }}>
              <span style={{ fontFamily: SS, fontSize: "0.6rem", fontWeight: 700, color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.14)", backdropFilter: "blur(4px)", borderRadius: "999px", padding: "0.18rem 0.55rem" }}>
                {recipe.category}
              </span>
              <span style={{ fontFamily: SS, fontSize: "0.6rem", fontWeight: 600, color: diffColor }}>
                {recipe.difficulty}
              </span>
            </div>
            <h3 style={{ fontFamily: SF, fontSize: "1.1rem", fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: "0.5rem", letterSpacing: "-0.01em" }}>
              {recipe.title}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Clock style={{ width: "0.7rem", height: "0.7rem", color: "rgba(255,255,255,0.55)" }} />
              <span style={{ fontFamily: SS, fontSize: "0.65rem", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{recipe.cookTime}</span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ── Quick meal card ─────────────────────────────────────────────────────── */
function QuickCard({ recipe }: { recipe: typeof QUICK[number] }) {
  return (
    <Link href={`/recipes/${recipe.id}`} style={{ textDecoration: "none", display: "block", flexShrink: 0, width: "clamp(200px, 22vw, 260px)" }}>
      <motion.div
        whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(0,0,0,0.18)" }}
        transition={{ duration: 0.28 }}
        style={{ borderRadius: "1rem", overflow: "hidden", background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
      >
        <div style={{ position: "relative", aspectRatio: "3/2", overflow: "hidden" }}>
          <img
            src={recipe.image}
            alt={recipe.imageAlt}
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
          {/* Big cook time */}
          <div style={{ position: "absolute", bottom: "0.6rem", left: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ fontFamily: SS, fontSize: "1.05rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>{recipe.cookTime}</span>
          </div>
          {/* Top: easy badge */}
          <div style={{ position: "absolute", top: "0.6rem", right: "0.6rem", background: "#166534", borderRadius: "999px", padding: "0.18rem 0.55rem", fontFamily: SS, fontSize: "0.55rem", fontWeight: 800, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ⚡ Fast
          </div>
        </div>
        <div style={{ padding: "0.85rem 1rem" }}>
          <h3 style={{ fontFamily: SF, fontSize: "1rem", fontWeight: 700, color: "#111", lineHeight: 1.2, marginBottom: "0.3rem" }}>
            {recipe.title}
          </h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: SS, fontSize: "0.65rem", color: "#888", fontWeight: 500 }}>Serves {recipe.serves}</span>
            <span style={{ fontFamily: SS, fontSize: "0.6rem", fontWeight: 700, color: "#E60023" }}>📌 {recipe.saves}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ── Newsletter form ─────────────────────────────────────────────────────── */
function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "1.5rem 0" }}>
        <p style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎉</p>
        <p style={{ fontFamily: SF, fontSize: "1.5rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>You're in!</p>
        <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", marginTop: "0.4rem" }}>
          Check your inbox — Friday recipe incoming.
        </p>
      </motion.div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && email.includes("@")) setSent(true); }}
        aria-label="Email address for newsletter"
        data-testid="input-newsletter-email"
        style={{ width: "100%", padding: "0.85rem 1.1rem", borderRadius: "0.75rem", border: "1.5px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.07)", fontFamily: SS, fontSize: "0.84rem", color: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
        onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(204,34,34,0.6)"; }}
        onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.14)"; }}
      />
      <motion.button
        whileHover={{ scale: 1.02, boxShadow: "0 10px 32px rgba(180,30,30,0.55)" }}
        whileTap={{ scale: 0.98 }}
        onClick={() => { if (email.includes("@")) setSent(true); }}
        data-testid="button-newsletter-subscribe"
        style={{ width: "100%", padding: "0.92rem", borderRadius: "0.75rem", background: "#CC2222", border: "none", color: "#fff", fontFamily: SS, fontSize: "0.84rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 4px 20px rgba(180,30,30,0.4)" }}
      >
        Get Free Weekly Recipes
      </motion.button>
      <p style={{ fontFamily: SS, fontSize: "0.66rem", color: "rgba(255,255,255,0.38)", textAlign: "center", lineHeight: 1.5 }}>
        Every Friday. No spam. Cancel any time.
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   HOME PAGE
   ════════════════════════════════════════════════════════════════════════════ */
export function HomePage() {
  const [searchQuery, setSearchQuery]         = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [timeFilter, setTimeFilter]           = useState<"All" | "Quick" | "Medium" | "Long">("All");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const focusSearch = useCallback(() => {
    document.getElementById("recipes")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => searchInputRef.current?.focus(), 350);
  }, []);

  const q = searchQuery.toLowerCase().trim();
  const filtered = RECIPES.filter(r => {
    const matchSearch = q === "" || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q)) || r.ingredients.some(ing => ing.toLowerCase().includes(q));
    const matchDiff = difficultyFilter === "All" || r.difficulty === difficultyFilter;
    const mins = r.cookTimeMinutes;
    const matchTime = timeFilter === "All" || (timeFilter === "Quick" && mins <= 30) || (timeFilter === "Medium" && mins > 30 && mins <= 60) || (timeFilter === "Long" && mins > 60);
    return matchSearch && matchDiff && matchTime;
  });
  const isFiltered = q !== "" || difficultyFilter !== "All" || timeFilter !== "All";

  const anchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <SeoMeta
        title="Meat Lovers Hub — Real BBQ & Steak Recipes That Actually Work"
        description="Foolproof, restaurant-quality meat recipes trusted by 76,000+ home cooks. Ribeye steak, smoked brisket, BBQ ribs, smash burgers and more — every recipe tested and perfected."
        image="https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=630&fit=crop&q=85"
        imageAlt="Juicy seared steak with garlic butter and herbs on a cast iron skillet — Meat Lovers Hub"
        type="website"
      />
      <BreadcrumbJsonLd items={[{ name: "Home", url: `${SITE_URL}/` }]} />

      <div className="min-h-screen w-full flex flex-col" style={{ background: "#F9F6F1", fontFamily: SS }}>
        <SiteHeader showAnnouncement activeNav="/" />

        {/* ══════════════════════════════════════════════════════════════
            HERO
            ══════════════════════════════════════════════════════════════ */}
        <section
          id="home"
          aria-label="Hero"
          className="relative w-full overflow-hidden"
          style={{ height: "92vh", minHeight: "560px", maxHeight: "900px" }}
        >
          {/* Background image — brightness bumped slightly so meat texture shows */}
          <img
            src="https://images.unsplash.com/photo-1558030006-450675393462?w=1400&q=85&auto=format&fit=crop"
            srcSet="https://images.unsplash.com/photo-1558030006-450675393462?w=768&q=78&auto=format&fit=crop 768w, https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=82&auto=format&fit=crop 1200w, https://images.unsplash.com/photo-1558030006-450675393462?w=1920&q=85&auto=format&fit=crop 1920w"
            sizes="100vw"
            alt="Perfectly seared steak with garlic butter and herbs on a cast iron skillet — Meat Lovers Hub"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 35%", filter: "brightness(1.08) contrast(1.04)" }}
            fetchPriority="high"
            decoding="sync"
          />

          {/* Smoke/heat shimmer overlay — subtle CSS animation */}
          <div className="smoke-layer" aria-hidden="true" />

          {/* Dramatic dual gradient */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.52) 52%, rgba(0,0,0,0.08) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 38%)" }} />

          {/* ── Hero copy ── */}
          <div className="absolute inset-0 flex flex-col justify-center pb-8 pl-8 md:pl-20" style={{ maxWidth: "620px" }}>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}>

              {/* Trust badge row */}
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1.6rem" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "rgba(255,77,77,0.18)", border: "1px solid rgba(255,77,77,0.4)", borderRadius: "999px", padding: "0.32rem 0.85rem" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ff4d4d", display: "inline-block", animation: "pulse 2s infinite" }} aria-hidden="true" />
                  <span style={{ fontFamily: SS, fontSize: "0.67rem", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: "#ff9090" }}>76k+ Pinterest Saves</span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "999px", padding: "0.32rem 0.85rem" }}>
                  <span style={{ fontFamily: SS, fontSize: "0.67rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>✓ Real Tested Recipes</span>
                </div>
              </div>

              {/* H1 */}
              <h1 style={{ fontFamily: SF, fontSize: "clamp(2.8rem, 7vw, 6rem)", fontWeight: 600, color: "#fff", lineHeight: 1.0, letterSpacing: "-0.03em", marginBottom: "0.6rem" }}>
                Insanely Juicy.<br /><em style={{ fontWeight: 300 }}>Zero Stress.</em>
              </h1>

              <p style={{ fontFamily: SF, fontSize: "clamp(1.05rem, 1.8vw, 1.4rem)", color: "rgba(255,255,255,0.55)", fontWeight: 300, fontStyle: "italic", marginBottom: "1.25rem", lineHeight: 1.4 }}>
                Real BBQ & steak recipes — done right, every time 🍖
              </p>

              {/* Intro body copy (SEO-rich, human tone) */}
              <p style={{ fontFamily: SS, fontSize: "0.87rem", color: "rgba(255,255,255,0.62)", maxWidth: "390px", lineHeight: 1.75, marginBottom: "2rem", fontWeight: 300 }}>
                I'm Juicy Joe — and I walk you through every step, no chef skills needed. Trusted by thousands of home cooks who actually make this food every week.
              </p>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <a
                  href="#trending"
                  onClick={e => anchor(e, "trending")}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#CC2222", color: "#fff", fontFamily: SS, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.88rem 2rem", borderRadius: "8px", textDecoration: "none", boxShadow: "0 4px 22px rgba(180,30,30,0.5)", transition: "transform 0.15s, box-shadow 0.15s" }}
                  data-testid="link-hero-cta"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(180,30,30,0.6)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 22px rgba(180,30,30,0.5)"; }}
                >
                  🔥 See Trending Recipes <ArrowRight style={{ width: "1rem", height: "1rem" }} />
                </a>
                <a
                  href="#recipes"
                  onClick={e => anchor(e, "recipes")}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.28)", color: "#fff", fontFamily: SS, fontSize: "0.82rem", fontWeight: 600, padding: "0.88rem 1.5rem", borderRadius: "8px", textDecoration: "none", transition: "background 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
                >
                  All Recipes
                </a>
              </div>
            </motion.div>
          </div>

          {/* ── Hero floating pin cards (desktop) ── */}
          <div className="hidden lg:flex absolute right-10 xl:right-20 top-1/2 -translate-y-1/2 gap-4 items-end">
            {TRENDING.slice(0, 2).map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 30 + i * 15 }}
                animate={{ opacity: 1, y: i === 1 ? 40 : 0 }}
                transition={{ duration: 0.8, delay: 0.35 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: "165px" }}
              >
                <Link href={`/recipes/${r.id}`} style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ borderRadius: "14px", overflow: "hidden", aspectRatio: "2/3", position: "relative", boxShadow: "0 18px 48px rgba(0,0,0,0.55)" }}>
                    <img src={r.imageTall} alt={r.imageAlt} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 55%)" }} />
                    <div style={{ position: "absolute", top: "0.5rem", left: "0.5rem", background: "#CC2222", borderRadius: "4px", padding: "0.18rem 0.45rem", fontFamily: SS, fontSize: "0.52rem", fontWeight: 800, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {r.viralLabel}
                    </div>
                    <div style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem", right: "0.75rem" }}>
                      <p style={{ fontFamily: SF, fontSize: "0.82rem", fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: "0.25rem" }}>{r.title}</p>
                      <p style={{ fontFamily: SS, fontSize: "0.58rem", color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>📌 {r.saves} saves</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* ── Bottom stats bar ── */}
          <div className="absolute bottom-0 left-0 right-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72), transparent)", padding: "1.5rem 2.5rem" }}>
            <div className="flex gap-8 flex-wrap">
              {[["76k+", "Pinterest Saves"], [`${RECIPES.length}+`, "Recipes"], ["5★", "Avg. Rating"], ["20 min", "Quickest"]].map(([val, lbl]) => (
                <div key={lbl}>
                  <p style={{ fontFamily: SF, fontSize: "1.35rem", fontWeight: 600, color: "#fff", lineHeight: 1 }}>{val}</p>
                  <p style={{ fontFamily: SS, fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, marginTop: "0.2rem" }}>{lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SEO INTRO — visible text below fold for Google
            ══════════════════════════════════════════════════════════════ */}
        <div style={{ background: "#1a0a0a", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-5xl mx-auto px-6 py-5 text-center">
            <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.85, fontWeight: 300, maxWidth: "760px", margin: "0 auto" }}>
              <strong style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Meat Lovers Hub</strong> is your home for foolproof, restaurant-quality meat recipes — from perfectly seared ribeye steaks and fall-off-the-bone BBQ ribs to quick 20-minute weeknight dinners. Every recipe is tested by real home cooks and built for maximum flavour with minimal fuss.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            🔥 TRENDING RECIPES
            ══════════════════════════════════════════════════════════════ */}
        <section id="trending" className="py-16 max-w-7xl mx-auto w-full px-6" aria-labelledby="trending-heading">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                <Flame style={{ width: "0.9rem", height: "0.9rem", color: "#CC2222" }} />
                <SectionLabel>Most Saved on Pinterest</SectionLabel>
              </div>
              <h2 id="trending-heading" style={{ fontFamily: SF, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, color: "#111", letterSpacing: "-0.025em", marginTop: "0.2rem" }}>
                Trending <em>Right Now</em>
              </h2>
              <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#888", marginTop: "0.4rem", fontWeight: 300 }}>
                The recipes every meat lover is pinning this week
              </p>
            </div>
            <Link
              href="/recipes"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, color: "#B91C1C", textDecoration: "none", border: "1.5px solid rgba(185,28,28,0.35)", borderRadius: "999px", padding: "0.42rem 1rem", transition: "background 0.15s" }}
            >
              View all <ArrowRight style={{ width: "0.8rem", height: "0.8rem" }} />
            </Link>
          </div>

          {/* Trending grid — 2 col mobile, 3 col tablet, 6 col desktop */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "1.25rem" }}>
            {TRENDING.map((recipe, i) => (
              <TrendingCard key={recipe.id} recipe={recipe} index={i} />
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            CATEGORY STRIP — editorial full-bleed
            ══════════════════════════════════════════════════════════════ */}
        <section aria-label="Browse recipes by category" style={{ overflow: "hidden", borderTop: "1px solid #EAE5DC" }}>
          <div style={{ display: "flex", height: "clamp(180px, 30vw, 360px)" }}>
            {CAT_STRIP.map(({ name, slug, img, emoji }, i) => (
              <Link
                key={slug}
                href={`/recipes/category/${slug}`}
                aria-label={`Browse ${name} recipes`}
                style={{ flex: 1, position: "relative", overflow: "hidden", textDecoration: "none", display: "block", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.12)" : "none" }}
                data-testid={`link-strip-${slug}`}
              >
                <motion.img
                  src={img}
                  alt={`${name} recipes`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.12) 60%, transparent 100%)" }} />
                {/* Hover tint */}
                <motion.div
                  style={{ position: "absolute", inset: 0, background: "rgba(204,34,34,0)", transition: "background 0.3s" }}
                  whileHover={{ background: "rgba(204,34,34,0.12)" }}
                />
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.22 }}
                  style={{ position: "absolute", bottom: "1.1rem", width: "100%", textAlign: "center", padding: "0 0.5rem" }}
                >
                  <span style={{ display: "block", fontSize: "1.1rem", marginBottom: "0.2rem" }}>{emoji}</span>
                  <span style={{ fontFamily: SF, fontSize: "clamp(0.78rem, 1.3vw, 1.05rem)", fontWeight: 600, color: "#fff", letterSpacing: "-0.01em", display: "block" }}>{name}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            PINTEREST PROOF BANNER
            ══════════════════════════════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto w-full px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ background: "linear-gradient(135deg, #fff5f5 0%, #fff8f5 100%)", border: "1.5px solid rgba(230,0,35,0.15)", borderRadius: "1.5rem", padding: "1.5rem 2rem", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}
          >
            <div>
              <p style={{ fontFamily: SF, fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", fontWeight: 600, color: "#111", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                Loved by <span style={{ color: "#E60023" }}>76,000+</span> meat lovers on Pinterest
              </p>
              <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#666", marginTop: "0.3rem", fontWeight: 300 }}>
                Save your favourites and never lose a great recipe again.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              {TRENDING.slice(0, 4).map((r, i) => (
                <img key={r.id} src={r.imageTall} alt={r.imageAlt} loading="lazy" decoding="async"
                  style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "2.5px solid #fff", marginLeft: i > 0 ? "-10px" : 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
              ))}
              <Link
                href="/recipes"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginLeft: "0.5rem", background: "#E60023", color: "#fff", fontFamily: SS, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.55rem 1.1rem", borderRadius: "8px", textDecoration: "none", boxShadow: "0 3px 14px rgba(230,0,35,0.35)" }}
              >
                Browse Recipes <ArrowRight style={{ width: "0.75rem", height: "0.75rem" }} />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            FEATURED RECIPE SHOWCASE
            ══════════════════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto w-full px-6 pb-4" aria-label="Featured Recipe">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="featured-recipe-grid"
            style={{ borderRadius: "1.75rem", overflow: "hidden", background: "#111", display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "360px" }}
          >
            <div style={{ padding: "3rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,77,77,0.2)", border: "1px solid rgba(255,77,77,0.35)", borderRadius: "999px", padding: "0.3rem 0.85rem", marginBottom: "1.25rem", width: "fit-content" }}>
                <span style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ff8080" }}>🔥 Most Saved Recipe</span>
              </div>
              <h2 style={{ fontFamily: SF, fontSize: "clamp(1.6rem, 3vw, 2.5rem)", fontWeight: 600, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "0.85rem" }}>
                {POPULAR[0].title}
              </h2>
              <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "rgba(255,255,255,0.52)", lineHeight: 1.75, marginBottom: "1.5rem", fontWeight: 300, maxWidth: "360px" }}>
                {POPULAR[0].joeIntro}
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                {[{ label: POPULAR[0].cookTime, icon: "⏱" }, { label: `Serves ${POPULAR[0].serves}`, icon: "👥" }, { label: POPULAR[0].difficulty, icon: "🎯" }].map(m => (
                  <span key={m.label} style={{ fontFamily: SS, fontSize: "0.75rem", color: "rgba(255,255,255,0.62)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "999px", padding: "0.3rem 0.8rem" }}>
                    {m.icon} {m.label}
                  </span>
                ))}
              </div>
              <Link
                href={`/recipes/${POPULAR[0].id}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#CC2222", color: "#fff", fontFamily: SS, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.88rem 1.75rem", borderRadius: "8px", textDecoration: "none", boxShadow: "0 4px 20px rgba(180,30,30,0.4)", width: "fit-content" }}
              >
                Make This Recipe <ArrowRight style={{ width: "0.9rem", height: "0.9rem" }} />
              </Link>
            </div>
            <div style={{ position: "relative", overflow: "hidden", minHeight: "300px" }}>
              <img
                src={POPULAR[0].imageTall}
                alt={POPULAR[0].imageAlt}
                loading="lazy"
                decoding="async"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(17,17,17,0.38) 0%, transparent 50%)" }} />
              <div style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(230,0,35,0.92)", backdropFilter: "blur(6px)", borderRadius: "999px", padding: "0.42rem 1rem", fontFamily: SS, fontSize: "0.7rem", fontWeight: 800, color: "#fff" }}>
                📌 {POPULAR[0].saves} saves
              </div>
            </div>
          </motion.div>
        </section>

        <style>{`
          .featured-recipe-grid { grid-template-columns: 1fr 1fr; }
          @media (max-width: 768px) { .featured-recipe-grid { grid-template-columns: 1fr !important; } }

          .about-grid { grid-template-columns: 1fr 1fr; }
          @media (max-width: 768px) { .about-grid { grid-template-columns: 1fr !important; } }

          .quick-scroll-row::-webkit-scrollbar { display: none; }

          @keyframes smokeRise {
            0%   { opacity: 0; transform: translateY(0px) scale(1); }
            20%  { opacity: 1; }
            100% { opacity: 0; transform: translateY(-80px) scale(1.4); }
          }
          .smoke-layer {
            position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 1;
          }
          .smoke-layer::before, .smoke-layer::after {
            content: "";
            position: absolute;
            bottom: 15%;
            width: 120px; height: 200px;
            background: radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%);
            border-radius: 50%;
            animation: smokeRise 8s ease-out infinite;
          }
          .smoke-layer::before { left: 35%; animation-delay: 0s; }
          .smoke-layer::after  { left: 55%; animation-delay: 3.5s; width: 90px; height: 160px; }
        `}</style>

        {/* ══════════════════════════════════════════════════════════════
            POPULAR RECIPES — Top 3
            ══════════════════════════════════════════════════════════════ */}
        <section id="popular" className="py-16 max-w-7xl mx-auto w-full px-6" aria-labelledby="popular-heading">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                <Flame style={{ width: "0.85rem", height: "0.85rem", color: "#ff4d4d" }} />
                <SectionLabel>Most Saved on Pinterest</SectionLabel>
              </div>
              <h2 id="popular-heading" style={{ fontFamily: SF, fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 300, color: "#111", letterSpacing: "-0.02em", marginTop: "0.2rem" }}>
                Community <em>Favourites</em>
              </h2>
            </div>
            <a
              href="#recipes"
              onClick={e => anchor(e, "recipes")}
              style={{ fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, color: "#B91C1C", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              View all <ArrowRight style={{ width: "0.85rem", height: "0.85rem" }} />
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {POPULAR.map((recipe, i) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/recipes/${recipe.id}`} style={{ textDecoration: "none", display: "block" }} data-testid={`card-popular-${recipe.id}`}>
                  <motion.div
                    whileHover="hover"
                    initial="rest"
                    animate="rest"
                    style={{ borderRadius: "1.25rem", overflow: "hidden", position: "relative", aspectRatio: "3/4", boxShadow: "0 6px 28px rgba(0,0,0,0.14)" }}
                  >
                    <motion.img
                      src={recipe.imageTall}
                      alt={recipe.imageAlt}
                      style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                      variants={{ rest: { scale: 1 }, hover: { scale: 1.07 } }}
                      transition={{ duration: 0.45 }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)" }} />
                    <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", background: i === 0 ? "#CC2222" : "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", borderRadius: "999px", padding: "0.22rem 0.7rem", fontFamily: SS, fontSize: "0.65rem", fontWeight: 700, color: "#fff", letterSpacing: "0.06em" }}>
                      #{i + 1} Most Saved
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.25rem" }}>
                      <p style={{ fontFamily: SS, fontSize: "0.68rem", fontWeight: 700, color: "#ff8080", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                        📌 {recipe.saves} saves
                      </p>
                      <h3 style={{ fontFamily: SF, fontSize: "1.3rem", fontWeight: 600, color: "#fff", lineHeight: 1.2, marginBottom: "0.5rem" }}>
                        {recipe.title}
                      </h3>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ fontFamily: SS, fontSize: "0.68rem", color: "rgba(255,255,255,0.72)", background: "rgba(255,255,255,0.12)", borderRadius: "999px", padding: "0.2rem 0.55rem" }}>
                          {recipe.cookTime}
                        </span>
                        <span style={{ fontFamily: SS, fontSize: "0.68rem", fontWeight: 600, color: recipe.difficulty === "Easy" ? "#4ade80" : recipe.difficulty === "Medium" ? "#fbbf24" : "#f87171" }}>
                          {recipe.difficulty}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            ⚡ 20-MINUTE MEAT MEALS (Quick meals section)
            ══════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="quick-heading" style={{ background: "#111", overflow: "hidden" }}>
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                  <Zap style={{ width: "0.9rem", height: "0.9rem", color: "#4ade80" }} />
                  <span style={{ fontFamily: SS, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#4ade80" }}>Quick &amp; Easy</span>
                </div>
                <h2 id="quick-heading" style={{ fontFamily: SF, fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 300, color: "#fff", letterSpacing: "-0.025em", marginTop: "0.2rem" }}>
                  20-Minute <em>Meat Meals</em>
                </h2>
                <p style={{ fontFamily: SS, fontSize: "0.84rem", color: "rgba(255,255,255,0.45)", marginTop: "0.4rem", fontWeight: 300 }}>
                  High-protein weeknight dinners — no fuss, no waiting
                </p>
              </div>
              <a
                href="#recipes"
                onClick={e => anchor(e, "recipes")}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontFamily: SS, fontSize: "0.76rem", fontWeight: 700, color: "#4ade80", textDecoration: "none", border: "1.5px solid rgba(74,222,128,0.35)", borderRadius: "999px", padding: "0.42rem 1rem" }}
              >
                All quick recipes <ChevronRight style={{ width: "0.8rem", height: "0.8rem" }} />
              </a>
            </div>

            {/* Horizontal scroll on mobile, auto grid on desktop */}
            <div
              style={{ display: "flex", gap: "1.1rem", overflowX: "auto", paddingBottom: "0.5rem", scrollbarWidth: "none" }}
              className="quick-scroll-row"
            >
              {QUICK.map(recipe => (
                <QuickCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            CATEGORY BUBBLES
            ══════════════════════════════════════════════════════════════ */}
        <section className="py-16 max-w-7xl mx-auto w-full px-6" aria-labelledby="category-heading">
          <div className="text-center mb-10">
            <SectionLabel>Browse by Category</SectionLabel>
            <h2 id="category-heading" style={{ fontFamily: SF, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 300, color: "#111", letterSpacing: "-0.02em", marginTop: "0.35rem" }}>
              Find Your <em>Next Favourite</em>
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {CAT_BUBBLES.map(cat => (
              <motion.div
                key={cat.label}
                whileHover={{ y: -6, scale: 1.06 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
              >
                <Link href={cat.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.7rem", textDecoration: "none" }}>
                  <div
                    className="overflow-hidden rounded-full"
                    style={{ width: "120px", height: "120px", border: "3px solid #E8E0D3", boxShadow: "0 6px 20px rgba(0,0,0,0.12)", transition: "border-color 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#CC2222"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(204,34,34,0.25)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E8E0D3"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"; }}
                  >
                    <img src={cat.image} alt={`${cat.label} recipes`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </div>
                  <p style={{ fontFamily: SS, fontSize: "0.8rem", fontWeight: 700, color: "#333", textAlign: "center", maxWidth: "90px", lineHeight: 1.3 }}>{cat.label}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="max-w-7xl mx-auto w-full px-6"><hr style={{ borderColor: "#E8E0D3" }} /></div>

        {/* ══════════════════════════════════════════════════════════════
            🌞 BBQ & SEASONAL SECTION
            ══════════════════════════════════════════════════════════════ */}
        <section className="py-16 max-w-7xl mx-auto w-full px-6" aria-labelledby="seasonal-heading">
          <div className="text-center mb-10">
            <SectionLabel>Seasonal Picks</SectionLabel>
            <h2 id="seasonal-heading" style={{ fontFamily: SF, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 300, color: "#111", letterSpacing: "-0.02em", marginTop: "0.35rem" }}>
              What to <em>Cook This Weekend</em>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {SEASONAL.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={item.href} style={{ textDecoration: "none", display: "block" }}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.28 }}
                    style={{ borderRadius: "1.5rem", overflow: "hidden", position: "relative", aspectRatio: "16/9", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", cursor: "pointer" }}
                  >
                    <motion.img
                      src={item.img}
                      alt={item.label}
                      loading="lazy"
                      decoding="async"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.45 }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.08) 100%)" }} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "1.5rem" }}>
                      <span style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", borderRadius: "999px", padding: "0.22rem 0.65rem", display: "inline-block", width: "fit-content", marginBottom: "0.6rem" }}>
                        {item.tag}
                      </span>
                      <h3 style={{ fontFamily: SF, fontSize: "clamp(1.25rem, 2.2vw, 1.7rem)", fontWeight: 600, color: "#fff", lineHeight: 1.15, marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
                        {item.label}
                      </h3>
                      <p style={{ fontFamily: SS, fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.55, marginBottom: "1rem", fontWeight: 300, maxWidth: "300px" }}>
                        {item.desc}
                      </p>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#fff", fontFamily: SS, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em" }}>
                        Explore <ArrowRight style={{ width: "0.75rem", height: "0.75rem" }} />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            EASY RECIPES — horizontal list
            ══════════════════════════════════════════════════════════════ */}
        {EASY.length > 0 && (
          <section className="py-12 w-full" style={{ background: "#F0EBE2" }} aria-labelledby="easy-heading">
            <div className="max-w-7xl mx-auto px-6">
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                    <Zap style={{ width: "0.85rem", height: "0.85rem", color: "#166534" }} />
                    <SectionLabel>Quick &amp; Simple</SectionLabel>
                  </div>
                  <h2 id="easy-heading" style={{ fontFamily: SF, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 300, color: "#111", letterSpacing: "-0.02em", marginTop: "0.2rem" }}>
                    Easy Recipes
                  </h2>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setDifficultyFilter("Easy"); setSearchQuery(""); document.getElementById("recipes")?.scrollIntoView({ behavior: "smooth" }); }}
                  style={{ fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, color: "#166534", background: "transparent", border: "1.5px solid #166534", borderRadius: "999px", padding: "0.4rem 1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}
                  data-testid="button-show-all-easy"
                >
                  See all easy <ArrowRight style={{ width: "0.85rem", height: "0.85rem" }} />
                </motion.button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {EASY.map((recipe, i) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                  >
                    <Link href={`/recipes/${recipe.id}`} style={{ textDecoration: "none", display: "block" }} data-testid={`card-easy-${recipe.id}`}>
                      <motion.div
                        whileHover={{ x: 5, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        style={{ display: "flex", gap: "1.25rem", alignItems: "center", background: "#fff", borderRadius: "1.25rem", padding: "0.95rem 1rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                      >
                        <div style={{ flexShrink: 0, width: "88px", height: "88px", borderRadius: "0.85rem", overflow: "hidden" }}>
                          <img src={recipe.imageTall} alt={recipe.imageAlt} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                            <span style={{ fontFamily: SS, fontSize: "0.6rem", fontWeight: 700, color: "#166534", background: "rgba(22,101,52,0.1)", borderRadius: "999px", padding: "0.15rem 0.5rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Easy</span>
                            <span style={{ fontFamily: SS, fontSize: "0.6rem", color: "#666", background: "#f5f5f5", borderRadius: "999px", padding: "0.15rem 0.5rem" }}>{recipe.cookTime}</span>
                            <span style={{ fontFamily: SS, fontSize: "0.6rem", color: "#666", background: "#f5f5f5", borderRadius: "999px", padding: "0.15rem 0.5rem" }}>Serves {recipe.serves}</span>
                          </div>
                          <h3 style={{ fontFamily: SF, fontSize: "1.1rem", fontWeight: 600, color: "#111", lineHeight: 1.25, marginBottom: "0.2rem" }}>
                            {recipe.pinTitle}
                          </h3>
                          <p style={{ fontFamily: SS, fontSize: "0.74rem", color: "#666", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                            {recipe.description}
                          </p>
                        </div>
                        <ArrowRight style={{ flexShrink: 0, width: "1rem", height: "1rem", color: "#ccc" }} />
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            LATEST DROPS
            ══════════════════════════════════════════════════════════════ */}
        {(() => {
          const latest = [...RECIPES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3);
          return (
            <section aria-labelledby="latest-heading" style={{ background: "#fff", borderTop: "1px solid #EAE5DC", borderBottom: "1px solid #EAE5DC", padding: "3rem 0" }}>
              <div className="max-w-7xl mx-auto px-6">
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                      <span style={{ fontFamily: SS, fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", background: "#CC2222", color: "#fff", borderRadius: "4px", padding: "0.18rem 0.55rem" }}>NEW</span>
                      <span style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#666" }}>Just Added</span>
                    </div>
                    <h2 id="latest-heading" style={{ fontFamily: SF, fontSize: "clamp(1.6rem, 3vw, 2rem)", fontWeight: 300, color: "#111", letterSpacing: "-0.02em" }}>
                      Latest Drops
                    </h2>
                  </div>
                  <a
                    href="/rss.xml"
                    aria-label="Subscribe to RSS feed"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: SS, fontSize: "0.72rem", fontWeight: 700, color: "#b85000", textDecoration: "none", border: "1.5px solid #b85000", borderRadius: "999px", padding: "0.35rem 0.9rem", letterSpacing: "0.04em" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>
                    RSS Feed
                  </a>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
                  {latest.map((recipe, i) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: i * 0.07 }}
                      whileHover={{ y: -5, boxShadow: "0 16px 36px rgba(0,0,0,0.12)" }}
                      style={{ borderRadius: "16px", overflow: "hidden", background: "#F9F6F1", border: "1px solid #EAE5DC", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "box-shadow 0.22s ease" }}
                    >
                      <Link href={`/recipes/${recipe.id}`} style={{ display: "block", textDecoration: "none" }}>
                        <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
                          <motion.img
                            src={recipe.image}
                            alt={recipe.imageAlt}
                            whileHover={{ scale: 1.07 }}
                            transition={{ duration: 0.4 }}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)" }} />
                          <div style={{ position: "absolute", top: "0.7rem", left: "0.7rem", background: "#CC2222", borderRadius: "4px", padding: "0.18rem 0.5rem", fontFamily: SS, fontSize: "0.55rem", fontWeight: 800, color: "#fff", letterSpacing: "0.12em", textTransform: "uppercase" }}>New</div>
                          <div style={{ position: "absolute", bottom: "0.7rem", left: "0.7rem", fontFamily: SS, fontSize: "0.6rem", fontWeight: 600, color: "rgba(255,255,255,0.85)", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", padding: "0.2rem 0.5rem", borderRadius: "999px" }}>
                            {recipe.cookTime}
                          </div>
                        </div>
                        <div style={{ padding: "1rem 1.2rem" }}>
                          <div style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 600, color: "#666", marginBottom: "0.35rem" }}>
                            {new Date(recipe.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                          </div>
                          <h3 style={{ fontFamily: SF, fontSize: "1.1rem", fontWeight: 700, color: "#111", lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: "0.4rem" }}>
                            {recipe.title}
                          </h3>
                          <p style={{ fontFamily: SS, fontSize: "0.75rem", color: "#666", lineHeight: 1.55, marginBottom: "0.75rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                            {recipe.description}
                          </p>
                          <span style={{ fontFamily: SS, fontSize: "0.75rem", fontWeight: 700, color: "#B91C1C" }}>Read Recipe →</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

        {/* ══════════════════════════════════════════════════════════════
            ALL RECIPES — searchable, filterable grid
            ══════════════════════════════════════════════════════════════ */}
        <section id="recipes" className="py-16 max-w-7xl mx-auto w-full px-6" aria-labelledby="recipes-heading">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-6">
            <div>
              <SectionLabel>Our Collection</SectionLabel>
              <h2 id="recipes-heading" style={{ fontFamily: SF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 300, color: "#111", letterSpacing: "-0.02em", marginTop: "0.35rem" }}>
                All Recipes
              </h2>
            </div>
            <form
              role="search"
              onSubmit={e => e.preventDefault()}
              className="relative"
              style={{ minWidth: "280px" }}
              toolname="site_search"
              tooldescription="Search Meat Lovers Hub for carnivore and BBQ recipes by name, ingredient, category, or dietary tag. Returns matching recipe titles, cook times, difficulty levels, and URLs."
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ width: "0.95rem", height: "0.95rem", color: "#aaa" }} />
              <input
                ref={searchInputRef}
                type="search"
                name="query"
                placeholder="Search by name, tag, or ingredient…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search recipes by name, tag, or ingredient"
                style={{ width: "100%", paddingLeft: "2.4rem", paddingRight: searchQuery ? "2.6rem" : "1rem", paddingTop: "0.7rem", paddingBottom: "0.7rem", borderRadius: "999px", border: `1.5px solid ${searchQuery ? "#ff4d4d" : "#DDD8CF"}`, background: "#fff", fontFamily: SS, fontSize: "0.82rem", color: "#333", outline: "none", transition: "border-color 0.2s", boxShadow: searchQuery ? "0 0 0 3px rgba(255,77,77,0.1)" : "none" }}
                data-testid="input-search-recipes"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }}
                    aria-label="Clear search"
                    data-testid="button-clear-search"
                    style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "#eee", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                  >
                    <X style={{ width: "0.65rem", height: "0.65rem", color: "#888" }} />
                  </motion.button>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Tag pills */}
          <div className="flex flex-wrap gap-2 mb-6" aria-label="Quick search tags">
            {POPULAR_TAGS.map(tag => {
              const active = q === tag.toLowerCase();
              return (
                <motion.button
                  key={tag}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setSearchQuery(active ? "" : tag)}
                  aria-pressed={active}
                  data-testid={`tag-pill-${tag.replace(/\s+/g, "-").toLowerCase()}`}
                  style={{ fontFamily: SS, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.28rem 0.8rem", borderRadius: "999px", border: `1.5px solid ${active ? "#CC2222" : "#D5CEBF"}`, background: active ? "#CC2222" : "transparent", color: active ? "#fff" : "#555", cursor: "pointer", transition: "all 0.15s" }}
                >
                  #{tag}
                </motion.button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-5 mb-7">
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>Difficulty</span>
              {(["All", "Easy", "Medium", "Hard"] as const).map(d => {
                const active = difficultyFilter === d;
                const col: Record<string, string> = { All: "#111", Easy: "#166534", Medium: "#B45309", Hard: "#dc2626" };
                return (
                  <motion.button key={d} whileTap={{ scale: 0.95 }} onClick={() => setDifficultyFilter(d)}
                    style={{ fontFamily: SS, fontSize: "0.76rem", fontWeight: 600, padding: "0.3rem 0.85rem", borderRadius: "999px", border: `1.5px solid ${active ? col[d] : "#D5CEBF"}`, background: active ? col[d] : "transparent", color: active ? "#fff" : "#555", cursor: "pointer", transition: "all 0.15s" }}
                    data-testid={`filter-difficulty-${d.toLowerCase()}`}>{d}</motion.button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>Time</span>
              {([["All", "All"], ["Quick (≤30 min)", "Quick"], ["Med (≤1 hr)", "Medium"], ["Long (1+ hr)", "Long"]] as const).map(([label, value]) => {
                const active = timeFilter === value;
                return (
                  <motion.button key={value} whileTap={{ scale: 0.95 }} onClick={() => setTimeFilter(value)}
                    style={{ fontFamily: SS, fontSize: "0.76rem", fontWeight: 600, padding: "0.3rem 0.85rem", borderRadius: "999px", border: `1.5px solid ${active ? "#111" : "#D5CEBF"}`, background: active ? "#111" : "transparent", color: active ? "#fff" : "#555", cursor: "pointer", transition: "all 0.15s" }}
                    data-testid={`filter-time-${value.toLowerCase()}`}>{label}</motion.button>
                );
              })}
            </div>
          </div>

          {/* Results count */}
          <AnimatePresence>
            {isFiltered && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}
              >
                <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#666" }}>
                  {filtered.length === 0
                    ? "No recipes matched — try a different search."
                    : <><span style={{ fontWeight: 700, color: "#333" }}>{filtered.length}</span> recipe{filtered.length !== 1 ? "s" : ""} found{q ? <> for <span style={{ fontWeight: 700, color: "#B91C1C" }}>"{searchQuery}"</span></> : ""}</>
                  }
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSearchQuery(""); setDifficultyFilter("All"); setTimeFilter("All"); }}
                  style={{ fontFamily: SS, fontSize: "0.72rem", fontWeight: 600, color: "#B91C1C", background: "transparent", border: "1px solid rgba(185,28,28,0.3)", borderRadius: "999px", padding: "0.25rem 0.75rem", cursor: "pointer" }}
                  data-testid="button-clear-all-filters"
                >
                  Clear all
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24" style={{ color: "#555" }}>
              <p style={{ fontFamily: SF, fontSize: "2rem", fontStyle: "italic", marginBottom: "0.5rem" }}>No recipes found.</p>
              <p style={{ fontFamily: SS, fontSize: "0.85rem" }}>Try searching for "beef", "garlic", "bbq", or "quick".</p>
            </motion.div>
          ) : (
            <div className="masonry-grid">
              {filtered.map((recipe, i) => (
                <RecipeCard key={recipe.id} recipe={recipe} tall={i % 3 === 0} />
              ))}
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════════════════════════
            NEWSLETTER — Joe's Inner Circle
            ══════════════════════════════════════════════════════════════ */}
        <section
          className="w-full"
          style={{ position: "relative", overflow: "hidden", background: "linear-gradient(155deg, #0e0404 0%, #1e0808 45%, #0b0202 100%)" }}
          aria-labelledby="newsletter-heading"
        >
          {/* Grain texture */}
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />
          {/* Ember glow */}
          <div aria-hidden="true" style={{ position: "absolute", top: "50%", left: "28%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(180,30,30,0.1) 0%, transparent 70%)", transform: "translateY(-50%)", pointerEvents: "none" }} />

          <div className="max-w-7xl mx-auto px-6 py-20" style={{ position: "relative" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3.5rem", alignItems: "center" }} className="md:grid-cols-[1.2fr_0.8fr]">

              {/* Left: community story */}
              <motion.div
                initial={{ opacity: 0, x: -28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                  <div style={{ width: "26px", height: "26px", background: "#CC2222", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", flexShrink: 0 }} aria-hidden="true">🔥</div>
                  <span style={{ fontFamily: SS, fontSize: "0.63rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,128,128,0.85)" }}>Juicy Joe's Inner Circle</span>
                </div>
                <h2 id="newsletter-heading" style={{ fontFamily: SF, fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 300, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.0, marginBottom: "1.1rem" }}>
                  Join <span style={{ color: "#ff8080" }}>5,000+</span> Meat Lovers<br /><em>Getting Weekly Recipes</em>
                </h2>
                <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.85, fontWeight: 300, maxWidth: "400px", marginBottom: "1.75rem" }}>
                  Every Friday I send one killer recipe — tested in my kitchen, perfected over multiple tries, with all my real notes. No filler. Just real BBQ and steak knowledge.
                </p>

                {/* Avatar stack + star rating */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex" }}>
                    {TRENDING.slice(0, 5).map((r, i) => (
                      <img key={r.id} src={r.imageTall} alt="" aria-hidden="true" loading="lazy" decoding="async"
                        style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", border: "2.5px solid #0e0404", marginLeft: i > 0 ? "-9px" : 0 }} />
                    ))}
                  </div>
                  <div>
                    <div style={{ display: "flex", gap: "1px", marginBottom: "2px" }}>
                      {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: "#fbbf24", fontSize: "0.65rem" }}>★</span>)}
                    </div>
                    <p style={{ fontFamily: SS, fontSize: "0.7rem", color: "rgba(255,255,255,0.38)", lineHeight: 1 }}>Loved by 5,000+ subscribers</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1.75rem", flexWrap: "wrap" }}>
                  {[["✓", "No spam, ever"], ["✓", "Cancel any time"], ["✓", "Real tested recipes only"]].map(([icon, text]) => (
                    <span key={text} style={{ fontFamily: SS, fontSize: "0.74rem", color: "rgba(255,255,255,0.48)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ color: "#CC2222", fontWeight: 800 }}>{icon}</span> {text}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Right: form card with recipe preview */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: "rgba(255,255,255,0.045)", backdropFilter: "blur(16px)", borderRadius: "1.75rem", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}
              >
                {/* Recipe preview image */}
                <div style={{ position: "relative", height: "158px", overflow: "hidden" }}>
                  <img src={TRENDING[0].imageTall} alt="This week's featured recipe" loading="lazy" decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(14,4,4,0.95) 0%, rgba(0,0,0,0.12) 100%)" }} />
                  <div style={{ position: "absolute", bottom: "1rem", left: "1.25rem", right: "1.25rem" }}>
                    <p style={{ fontFamily: SS, fontSize: "0.54rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff8080", marginBottom: "0.2rem" }}>This Friday's Recipe</p>
                    <p style={{ fontFamily: SF, fontSize: "1rem", fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>Smash Burger Secret Sauce</p>
                  </div>
                </div>
                {/* Form */}
                <div style={{ padding: "1.6rem" }}>
                  <NewsletterForm />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            ABOUT — Juicy Joe (authentic personal brand)
            ══════════════════════════════════════════════════════════════ */}
        <section id="about" style={{ background: "#0f0f0f" }} className="py-24" aria-labelledby="about-heading">
          <div className="max-w-7xl mx-auto px-6">
            <div style={{ display: "grid", gap: "4rem", alignItems: "start" }} className="about-grid">

              {/* Left: personal story */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionLabel light>About Juicy Joe</SectionLabel>
                <h2 id="about-heading" style={{ fontFamily: SF, fontSize: "clamp(2.5rem, 5vw, 3.8rem)", fontWeight: 300, letterSpacing: "-0.035em", lineHeight: 0.98, marginTop: "0.5rem", marginBottom: "1.5rem", color: "#fff" }}>
                  Hey, I'm <em>Juicy Joe</em> 👋
                </h2>

                {/* Signature quote block */}
                <blockquote style={{ borderLeft: "3px solid #CC2222", paddingLeft: "1.25rem", margin: "0 0 1.75rem" }}>
                  <p style={{ fontFamily: SF, fontSize: "clamp(1.05rem, 1.8vw, 1.22rem)", fontStyle: "italic", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>
                    "I'm not a chef. I'm just a guy who got obsessed with making the perfect steak — and never stopped."
                  </p>
                </blockquote>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", marginBottom: "1.75rem" }}>
                  <p style={{ fontFamily: SS, fontSize: "0.9rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.9, fontWeight: 300 }}>
                    I test every recipe myself — on a real stove, with real ingredients, usually at 10pm after work. If I'm not satisfied with it, it doesn't go on the site. Period.
                  </p>
                  <p style={{ fontFamily: SS, fontSize: "0.9rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.9, fontWeight: 300 }}>
                    No complicated equipment. No Michelin-star techniques. Just food you'll actually want to cook again — and brag about when it hits the table.
                  </p>
                </div>

                {/* Personal stat row */}
                <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.07)", marginBottom: "2rem" }}>
                  {[["14+", "Years Grilling"], ["17+", "Recipes Perfected"], ["100%", "Real Tested"]].map(([val, lbl]) => (
                    <div key={lbl}>
                      <p style={{ fontFamily: SF, fontSize: "1.65rem", fontWeight: 600, color: "#CC2222", lineHeight: 1, marginBottom: "0.28rem" }}>{val}</p>
                      <p style={{ fontFamily: SS, fontSize: "0.58rem", fontWeight: 700, color: "rgba(255,255,255,0.32)", letterSpacing: "0.13em", textTransform: "uppercase" }}>{lbl}</p>
                    </div>
                  ))}
                </div>

                {/* Trait pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2.25rem" }}>
                  {["🥩 Meat obsessed", "⚡ 20-min recipes", "🔥 Pitmaster tricks", "😎 Zero fuss cooking"].map(badge => (
                    <span key={badge} style={{ fontFamily: SS, fontSize: "0.76rem", fontWeight: 600, color: "rgba(255,255,255,0.58)", background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "999px", padding: "0.32rem 0.9rem" }}>
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Social icons + Full Bio CTA */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <SocialIcon href="/follow" label="Follow Juicy Joe on Instagram" brandColor="rgba(193,53,132,0.88)" glowColor="rgba(193,53,132,0.35)" testId="link-instagram">
                    <Instagram style={{ width: "1.1rem", height: "1.1rem" }} />
                  </SocialIcon>
                  <SocialIcon href="/follow" label="Follow Juicy Joe on YouTube" brandColor="rgba(255,0,0,0.85)" glowColor="rgba(255,0,0,0.3)" testId="link-youtube">
                    <Youtube style={{ width: "1.1rem", height: "1.1rem" }} />
                  </SocialIcon>
                  <SocialIcon href="/follow" label="Follow Juicy Joe on Facebook" brandColor="rgba(24,119,242,0.88)" glowColor="rgba(24,119,242,0.3)" testId="link-facebook">
                    <Facebook style={{ width: "1.1rem", height: "1.1rem" }} />
                  </SocialIcon>

                  {/* Premium "Meet Joe" outlined button */}
                  <motion.a
                    href="/author/juicy-joe"
                    whileHover={{ y: -3, boxShadow: "0 10px 30px rgba(255,255,255,0.07)" }}
                    whileTap={{ scale: 0.97 }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.42)"; el.style.color = "#fff"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.2)"; el.style.color = "rgba(255,255,255,0.8)"; }}
                    data-testid="link-about-full-bio"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "0.72rem 1.4rem", textDecoration: "none", background: "transparent", marginLeft: "0.25rem", transition: "border-color 0.2s, color 0.2s" }}
                  >
                    Meet Joe <ArrowRight style={{ width: "0.8rem", height: "0.8rem" }} />
                  </motion.a>
                </div>
              </motion.div>

              {/* Right: authentic 2-column masonry cooking gallery */}
              <div style={{ display: "flex", gap: "0.85rem" }}>
                {/* Left gallery column: landscape → portrait → landscape */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", flex: 1 }}>
                  {ABOUT_GALLERY_LEFT.map((img, i) => (
                    <motion.div
                      key={img.src}
                      initial={{ opacity: 0, scale: 0.96 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.09 }}
                      style={{ borderRadius: "1rem", overflow: "hidden", aspectRatio: img.ratio, boxShadow: "0 8px 32px rgba(0,0,0,0.55)", position: "relative", flexShrink: 0 }}
                    >
                      <motion.img
                        src={img.src} alt={img.alt} loading="lazy" decoding="async"
                        whileHover={{ scale: 1.07 }}
                        transition={{ duration: 0.45 }}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 55%)", pointerEvents: "none" }} />
                    </motion.div>
                  ))}
                </div>
                {/* Right gallery column: portrait → landscape → landscape */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", flex: 1 }}>
                  {ABOUT_GALLERY_RIGHT.map((img, i) => (
                    <motion.div
                      key={img.src}
                      initial={{ opacity: 0, scale: 0.96 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.09 + 0.1 }}
                      style={{ borderRadius: "1rem", overflow: "hidden", aspectRatio: img.ratio, boxShadow: "0 8px 32px rgba(0,0,0,0.55)", position: "relative", flexShrink: 0 }}
                    >
                      <motion.img
                        src={img.src} alt={img.alt} loading="lazy" decoding="async"
                        whileHover={{ scale: 1.07 }}
                        transition={{ duration: 0.45 }}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 55%)", pointerEvents: "none" }} />
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}
