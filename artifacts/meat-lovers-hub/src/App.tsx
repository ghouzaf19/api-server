import { useState, useRef, useCallback, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Link } from "wouter";
import { Search, Instagram, Youtube, Facebook, ArrowRight, X, Mail, Flame, Zap } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RecipeCard } from "@/components/RecipeCard";
import { motion, AnimatePresence } from "framer-motion";

const RecipePage            = lazy(() => import("@/pages/RecipePage").then(m => ({ default: m.RecipePage })));
const RecipesPage           = lazy(() => import("@/pages/RecipesPage").then(m => ({ default: m.RecipesPage })));
const CategoryPage          = lazy(() => import("@/pages/CategoryPage").then(m => ({ default: m.CategoryPage })));
const AboutPage             = lazy(() => import("@/pages/AboutPage").then(m => ({ default: m.AboutPage })));
const ContactPage           = lazy(() => import("@/pages/ContactPage").then(m => ({ default: m.ContactPage })));
const NewsletterPage        = lazy(() => import("@/pages/NewsletterPage").then(m => ({ default: m.NewsletterPage })));
const FollowPage            = lazy(() => import("@/pages/FollowPage").then(m => ({ default: m.FollowPage })));
const PrivacyPolicyPage     = lazy(() => import("@/pages/PrivacyPolicyPage").then(m => ({ default: m.PrivacyPolicyPage })));
const TermsPage             = lazy(() => import("@/pages/TermsPage").then(m => ({ default: m.TermsPage })));
const AuthorPage            = lazy(() => import("@/pages/AuthorPage").then(m => ({ default: m.AuthorPage })));
const EditorialPolicyPage   = lazy(() => import("@/pages/EditorialPolicyPage").then(m => ({ default: m.EditorialPolicyPage })));
const MeatTemperatureGuidePage = lazy(() => import("@/pages/MeatTemperatureGuidePage").then(m => ({ default: m.MeatTemperatureGuidePage })));
const ResourcesPage         = lazy(() => import("@/pages/ResourcesPage").then(m => ({ default: m.ResourcesPage })));
const CarnivoreMealPlanPage = lazy(() => import("@/pages/CarnivoreMealPlanPage").then(m => ({ default: m.CarnivoreMealPlanPage })));
const BlogPage              = lazy(() => import("@/pages/BlogPage").then(m => ({ default: m.BlogPage })));
const BlogPostPage          = lazy(() => import("@/pages/BlogPostPage").then(m => ({ default: m.BlogPostPage })));
import { RECIPES, getCategorySlug } from "@/data/recipes";
import { SITE_URL } from "@/lib/siteUrl";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { SeoMeta } from "@/components/SeoMeta";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { CollectionsProvider } from "@/contexts/CollectionsContext";
import { WebMCPLayer } from "@/components/WebMCPLayer";
import { WebMCPBridge } from "@/components/WebMCPBridge";
import { CookieBanner } from "@/components/CookieBanner";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

const CATEGORIES = [
  { label: "Steak",         image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80",  href: "/recipes/category/beef" },
  { label: "Chicken",       image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&q=80", href: "/recipes/category/chicken" },
  { label: "BBQ & Ribs",   image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80",  href: "/recipes/category/bbq" },
  { label: "Burgers",       image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", href: "/recipes/category/quick-meals" },
  { label: "Wild Game",     image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80", href: "/recipes/category/game-meat" },
  { label: "Weekend Grill", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",  href: "/recipes/category/bbq" },
];

function parseSaves(s: string): number {
  return parseFloat(s.replace("k", "")) * (s.includes("k") ? 1000 : 1);
}

const POPULAR_RECIPES = [...RECIPES].sort((a, b) => parseSaves(b.saves) - parseSaves(a.saves)).slice(0, 3);
const EASY_RECIPES    = RECIPES.filter((r) => r.difficulty === "Easy");


function Label({ children }: { children: string }) {
  return (
    <p style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#666" }}>
      {children}
    </p>
  );
}

function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }
  if (sent) {
    return (
      <div style={{ fontFamily: SS, fontSize: "0.85rem", color: "#4ade80", fontWeight: 600 }}>
        🥩 You're in! Check your inbox soon.
      </div>
    );
  }
  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}
      toolname="subscribe_newsletter"
      tooldescription="Subscribe a user to the Meat Lovers Hub newsletter. Requires a valid email address. Confirm with the user before submitting."
    >
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ flex: 1, minWidth: "210px", padding: "0.75rem 1.1rem", fontFamily: SS, fontSize: "0.85rem", borderRadius: "8px", border: "1.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", color: "#fff", outline: "none" }}
      />
      <button
        type="submit"
        style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#CC2222", color: "#fff", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.75rem 1.35rem", borderRadius: "8px", border: "none", cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(180,30,30,0.4)" }}
      >
        Subscribe Free <ArrowRight style={{ width: "0.8rem", height: "0.8rem" }} />
      </button>
    </form>
  );
}

// Deduplicated popular tags across all recipes
const POPULAR_TAGS = Array.from(
  new Set(RECIPES.flatMap((r) => r.tags))
).slice(0, 8);

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [timeFilter, setTimeFilter] = useState<"All" | "Quick" | "Medium" | "Long">("All");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);

  const focusSearch = useCallback(() => {
    document.getElementById("recipes")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => searchInputRef.current?.focus(), 350);
  }, []);


  const q = searchQuery.toLowerCase().trim();
  const filtered = RECIPES.filter((r) => {
    const matchSearch =
      q === "" ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q)) ||
      r.ingredients.some((ing) => ing.toLowerCase().includes(q));
    const matchDiff = difficultyFilter === "All" || r.difficulty === difficultyFilter;
    const mins      = r.cookTime.includes("hr") ? parseInt(r.cookTime) * 60 : parseInt(r.cookTime);
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
        title="Meat Lovers Hub — Delicious & Easy Meat Recipes"
        description="Foolproof, restaurant-quality meat recipes you can master at home. Ribeye steak, BBQ ribs, smash burgers, grilled chicken and more."
        image="https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=630&fit=crop&q=85"
        imageAlt="Juicy seared steak with garlic butter on a cast iron skillet"
        type="website"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${SITE_URL}/` },
        ]}
      />

      <div className="min-h-screen w-full flex flex-col" style={{ background: "#F9F6F1", fontFamily: SS }}>

        <SiteHeader showAnnouncement activeNav="/" />

        {/* ── HERO ── */}
        <section id="home" className="relative w-full overflow-hidden" style={{ height: "92vh", minHeight: "560px", maxHeight: "880px" }}>
          <img
            src="https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=80&auto=format&fit=crop"
            srcSet="https://images.unsplash.com/photo-1558030006-450675393462?w=768&q=75&auto=format&fit=crop 768w, https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=80&auto=format&fit=crop 1200w, https://images.unsplash.com/photo-1558030006-450675393462?w=1920&q=80&auto=format&fit=crop 1920w"
            sizes="100vw"
            alt="Perfectly seared steak with garlic butter and herbs on a cast iron skillet"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 35%" }}
            fetchPriority="high"
            decoding="sync"
          />
          {/* Richer, more dramatic gradient */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.1) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%)" }} />

          {/* Left: editorial copy */}
          <div className="absolute inset-0 flex flex-col justify-center pb-8 pl-10 md:pl-20" style={{ maxWidth: "600px" }}>
            <motion.div initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }}>
              {/* Trust badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,77,77,0.18)", border: "1px solid rgba(255,77,77,0.4)", borderRadius: "999px", padding: "0.35rem 0.9rem", marginBottom: "1.5rem" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ff4d4d", display: "inline-block", animation: "pulse 2s infinite" }} />
                <span style={{ fontFamily: SS, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff9090" }}>
                  76k+ Saves on Pinterest
                </span>
              </div>

              <h1 style={{ fontFamily: SF, fontSize: "clamp(2.8rem, 7vw, 6rem)", fontWeight: 600, color: "#fff", lineHeight: 1.0, letterSpacing: "-0.03em", marginBottom: "0.6rem" }}>
                Insanely Juicy.<br /><em style={{ fontWeight: 300 }}>Zero Stress.</em>
              </h1>
              <p style={{ fontFamily: SF, fontSize: "clamp(1.1rem, 2vw, 1.5rem)", color: "rgba(255,255,255,0.55)", fontWeight: 300, fontStyle: "italic", marginBottom: "1.5rem", lineHeight: 1.4 }}>
                Just meat — done right, every time 🍖
              </p>
              <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "rgba(255,255,255,0.65)", maxWidth: "380px", lineHeight: 1.7, marginBottom: "2rem", fontWeight: 300 }}>
                I'll walk you through every step — no chef experience needed. From juicy steaks to fall-off-the-bone BBQ, just real food that hits every time.
              </p>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <a href="#recipes" onClick={(e) => anchor(e, "recipes")}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#CC2222", color: "#fff", fontFamily: SS, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.85rem 2rem", borderRadius: "8px", textDecoration: "none", boxShadow: "0 4px 20px rgba(180,30,30,0.45)" }}
                  data-testid="link-hero-cta">
                  See All Recipes <ArrowRight style={{ width: "1rem", height: "1rem" }} />
                </a>
                <a href="#popular" onClick={(e) => anchor(e, "popular")}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.25)", color: "#fff", fontFamily: SS, fontSize: "0.82rem", fontWeight: 600, padding: "0.85rem 1.5rem", borderRadius: "8px", textDecoration: "none" }}>
                  🔥 What's Popular
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right: floating featured pin cards (desktop only) */}
          <div className="hidden lg:flex absolute right-12 xl:right-20 top-1/2 -translate-y-1/2 gap-4 items-end">
            {RECIPES.slice(0, 2).map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 30 + i * 15 }}
                animate={{ opacity: 1, y: i === 1 ? 40 : 0 }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.15, ease: [0.22,1,0.36,1] }}
                style={{ width: "165px" }}
              >
                <Link href={`/recipes/${r.id}`} style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ borderRadius: "12px", overflow: "hidden", aspectRatio: "2/3", position: "relative", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
                    <img src={r.imageTall} alt={r.imageAlt} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)" }} />
                    <div style={{ position: "absolute", top: "0.5rem", left: "0.5rem", background: "rgba(255,77,77,0.92)", borderRadius: "4px", padding: "0.18rem 0.45rem", fontFamily: SS, fontSize: "0.55rem", fontWeight: 800, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {r.viralLabel}
                    </div>
                    <div style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem", right: "0.75rem" }}>
                      <p style={{ fontFamily: SF, fontSize: "0.85rem", fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: "0.25rem" }}>{r.title}</p>
                      <p style={{ fontFamily: SS, fontSize: "0.6rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>📌 {r.saves} saves</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bottom stats bar */}
          <div className="absolute bottom-0 left-0 right-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)", padding: "1.5rem 2.5rem" }}>
            <div className="flex gap-8 flex-wrap">
              {[["76k+", "Pinterest Saves"], [`${RECIPES.length}+`, "Recipes"], ["5★", "Average Rating"], ["20 min", "Quickest Recipe"]].map(([val, lbl]) => (
                <div key={lbl}>
                  <p style={{ fontFamily: SF, fontSize: "1.4rem", fontWeight: 600, color: "#fff", lineHeight: 1 }}>{val}</p>
                  <p style={{ fontFamily: SS, fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, marginTop: "0.2rem" }}>{lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Editorial Category Strip ── */}
        <section aria-label="Browse recipes by category" style={{ overflow: "hidden", borderTop: "1px solid #EAE5DC" }}>
          <div style={{ display: "flex", height: "clamp(160px, 26vw, 320px)" }}>
            {([
              { name: "Beef",        slug: "beef",        img: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=600&h=800&fit=crop&q=75&auto=format" },
              { name: "Chicken",     slug: "chicken",     img: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&h=800&fit=crop&q=75&auto=format" },
              { name: "Game Meat",   slug: "game-meat",   img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=800&fit=crop&q=75&auto=format" },
              { name: "BBQ",         slug: "bbq",         img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=800&fit=crop&q=75&auto=format" },
              { name: "Quick Meals", slug: "quick-meals", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=800&fit=crop&q=75&auto=format" },
            ] as const).map(({ name, slug, img }, i) => (
              <Link
                key={slug}
                href={`/recipes/category/${slug}`}
                aria-label={`Browse ${name} recipes`}
                style={{ flex: 1, position: "relative", overflow: "hidden", textDecoration: "none", display: "block", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.15)" : "none" }}
                data-testid={`link-strip-${slug}`}
              >
                <motion.img
                  src={img}
                  alt={`${name} recipes`}
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }} />
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.22 }}
                  style={{ position: "absolute", bottom: "1rem", width: "100%", textAlign: "center" }}
                >
                  <span style={{ fontFamily: SF, fontSize: "clamp(0.82rem, 1.35vw, 1.1rem)", fontWeight: 600, color: "#fff", letterSpacing: "-0.01em", display: "block" }}>{name}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Categories ── */}
        <section className="py-16 max-w-7xl mx-auto w-full px-6" aria-labelledby="category-heading">
          <div className="text-center mb-10">
            <Label>Browse by Category</Label>
            <h2 id="category-heading" style={{ fontFamily: SF, fontSize: "2.6rem", fontWeight: 300, color: "#111", letterSpacing: "-0.02em", marginTop: "0.35rem" }}>
              Find Your <em>Next Favorite</em>
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-14">
            {CATEGORIES.map((cat) => (
              <motion.div
                key={cat.label}
                whileHover={{ y: -5, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                data-testid={`button-category-${cat.label.toLowerCase().replace(/[\s&]/g, "-")}`}
              >
                <Link href={cat.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.65rem", textDecoration: "none" }}>
                  <div className="overflow-hidden rounded-full" style={{ width: "100px", height: "100px", border: "2.5px solid #E8E0D3", boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}>
                    <img src={cat.image} alt={`${cat.label} recipes`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </div>
                  <p style={{ fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, color: "#333", textAlign: "center", maxWidth: "85px", lineHeight: 1.3 }}>{cat.label}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="max-w-7xl mx-auto w-full px-6"><hr style={{ borderColor: "#E8E0D3" }} /></div>

        {/* ── Pinterest social proof banner ── */}
        <div className="max-w-7xl mx-auto w-full px-6 pt-10">
          <div style={{ background: "linear-gradient(135deg, #fff5f5, #fff8f5)", border: "1.5px solid rgba(230,0,35,0.15)", borderRadius: "1.25rem", padding: "1.5rem 2rem", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <p style={{ fontFamily: SF, fontSize: "1.6rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em" }}>
                Loved by <span style={{ color: "#E60023" }}>1,000+</span> food lovers on Pinterest
              </p>
              <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#666", marginTop: "0.2rem" }}>
                Save your favorites and never lose a great recipe again.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              {RECIPES.slice(0, 3).map((r) => (
                <img key={r.id} src={r.imageTall} alt={r.imageAlt} loading="lazy" decoding="async" style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", marginLeft: "-10px" }} />
              ))}
              <span style={{ fontFamily: SS, fontSize: "0.82rem", fontWeight: 700, color: "#E60023", marginLeft: "6px" }}>76k+ saves</span>
            </div>
          </div>
        </div>

        {/* ── Featured Recipe Showcase ── */}
        <section className="max-w-7xl mx-auto w-full px-6 pt-14 pb-4" aria-label="Featured Recipe">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ borderRadius: "1.5rem", overflow: "hidden", background: "#111", display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "340px" }}
            className="featured-recipe-grid"
          >
            {/* Left: copy */}
            <div style={{ padding: "3rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,77,77,0.2)", border: "1px solid rgba(255,77,77,0.35)", borderRadius: "999px", padding: "0.3rem 0.85rem", marginBottom: "1.25rem", width: "fit-content" }}>
                <span style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ff8080" }}>🔥 Most Saved Recipe</span>
              </div>
              <h2 style={{ fontFamily: SF, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 600, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "0.85rem" }}>
                {POPULAR_RECIPES[0].title}
              </h2>
              <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "1.5rem", fontWeight: 300, maxWidth: "360px" }}>
                {POPULAR_RECIPES[0].joeIntro}
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                {[
                  { label: POPULAR_RECIPES[0].cookTime, icon: "⏱" },
                  { label: `Serves ${POPULAR_RECIPES[0].serves}`, icon: "👥" },
                  { label: POPULAR_RECIPES[0].difficulty, icon: "🎯" },
                ].map((m) => (
                  <span key={m.label} style={{ fontFamily: SS, fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "999px", padding: "0.3rem 0.8rem" }}>
                    {m.icon} {m.label}
                  </span>
                ))}
              </div>
              <Link href={`/recipes/${POPULAR_RECIPES[0].id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#CC2222", color: "#fff", fontFamily: SS, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.85rem 1.75rem", borderRadius: "8px", textDecoration: "none", boxShadow: "0 4px 20px rgba(180,30,30,0.4)", width: "fit-content" }}>
                Make This Recipe <ArrowRight style={{ width: "0.9rem", height: "0.9rem" }} />
              </Link>
            </div>
            {/* Right: image */}
            <div style={{ position: "relative", overflow: "hidden", minHeight: "300px" }}>
              <img
                src={POPULAR_RECIPES[0].imageTall}
                alt={POPULAR_RECIPES[0].imageAlt}
                loading="lazy"
                decoding="async"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(17,17,17,0.4) 0%, transparent 50%)" }} />
              <div style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(230,0,35,0.9)", borderRadius: "999px", padding: "0.4rem 1rem", fontFamily: SS, fontSize: "0.7rem", fontWeight: 800, color: "#fff" }}>
                📌 {POPULAR_RECIPES[0].saves} saves
              </div>
            </div>
          </motion.div>
        </section>

        <style>{`.featured-recipe-grid { grid-template-columns: 1fr 1fr; } @media (max-width: 768px) { .featured-recipe-grid { grid-template-columns: 1fr !important; } }`}</style>

        {/* ── Popular Recipes ── */}
        <section id="popular" className="py-16 max-w-7xl mx-auto w-full px-6" aria-labelledby="popular-heading">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                <Flame style={{ width: "0.85rem", height: "0.85rem", color: "#ff4d4d" }} />
                <Label>Most Saved on Pinterest</Label>
              </div>
              <h2 id="popular-heading" style={{ fontFamily: SF, fontSize: "2.6rem", fontWeight: 300, color: "#111", letterSpacing: "-0.02em", marginTop: "0.2rem" }}>
                Popular Recipes
              </h2>
            </div>
            <a href="#recipes" onClick={(e) => anchor(e, "recipes")}
              style={{ fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, color: "#B91C1C", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              View all <ArrowRight style={{ width: "0.85rem", height: "0.85rem" }} />
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {POPULAR_RECIPES.map((recipe, i) => (
              <motion.div key={recipe.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/recipes/${recipe.id}`} style={{ textDecoration: "none", display: "block" }} data-testid={`card-popular-${recipe.id}`}>
                  <motion.div whileHover="hover" initial="rest" animate="rest"
                    style={{ borderRadius: "1.25rem", overflow: "hidden", position: "relative", aspectRatio: "3/4", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
                    <motion.img src={recipe.imageTall} alt={recipe.imageAlt}
                      style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                      variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
                      transition={{ duration: 0.5 }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)" }} />
                    {/* Rank badge */}
                    <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", background: i === 0 ? "#CC2222" : "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", borderRadius: "999px", padding: "0.2rem 0.65rem", fontFamily: SS, fontSize: "0.67rem", fontWeight: 700, color: "#fff", letterSpacing: "0.06em" }}>
                      #{i + 1} Most Saved
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.25rem" }}>
                      <p style={{ fontFamily: SS, fontSize: "0.68rem", fontWeight: 600, color: "#ff8080", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                        📌 {recipe.saves} saves
                      </p>
                      <h3 style={{ fontFamily: SF, fontSize: "1.3rem", fontWeight: 600, color: "#fff", lineHeight: 1.2, marginBottom: "0.5rem" }}>
                        {recipe.title}
                      </h3>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ fontFamily: SS, fontSize: "0.68rem", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.12)", borderRadius: "999px", padding: "0.2rem 0.55rem" }}>
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

        {/* ── Easy Recipes ── */}
        {EASY_RECIPES.length > 0 && (
          <section className="py-12 w-full" style={{ background: "#F0EBE2" }} aria-labelledby="easy-heading">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                    <Zap style={{ width: "0.85rem", height: "0.85rem", color: "#16a34a" }} />
                    <Label>Quick &amp; Simple</Label>
                  </div>
                  <h2 id="easy-heading" style={{ fontFamily: SF, fontSize: "2.6rem", fontWeight: 300, color: "#111", letterSpacing: "-0.02em", marginTop: "0.2rem" }}>
                    Easy Recipes
                  </h2>
                </div>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => { setDifficultyFilter("Easy"); setSearchQuery(""); document.getElementById("recipes")?.scrollIntoView({ behavior: "smooth" }); }}
                  style={{ fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, color: "#166534", background: "transparent", border: "1.5px solid #166534", borderRadius: "999px", padding: "0.4rem 1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}
                  data-testid="button-show-all-easy">
                  See all easy <ArrowRight style={{ width: "0.85rem", height: "0.85rem" }} />
                </motion.button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {EASY_RECIPES.map((recipe, i) => (
                  <motion.div key={recipe.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <Link href={`/recipes/${recipe.id}`} style={{ textDecoration: "none", display: "block" }} data-testid={`card-easy-${recipe.id}`}>
                      <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        style={{ display: "flex", gap: "1.25rem", alignItems: "center", background: "#fff", borderRadius: "1.25rem", padding: "1rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                        <div style={{ flexShrink: 0, width: "90px", height: "90px", borderRadius: "0.75rem", overflow: "hidden" }}>
                          <img src={recipe.imageTall} alt={recipe.imageAlt} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                            <span style={{ fontFamily: SS, fontSize: "0.63rem", fontWeight: 700, color: "#166534", background: "rgba(22,101,52,0.1)", borderRadius: "999px", padding: "0.15rem 0.5rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Easy</span>
                            <span style={{ fontFamily: SS, fontSize: "0.63rem", color: "#666", background: "#f5f5f5", borderRadius: "999px", padding: "0.15rem 0.5rem" }}>{recipe.cookTime}</span>
                            <span style={{ fontFamily: SS, fontSize: "0.63rem", color: "#666", background: "#f5f5f5", borderRadius: "999px", padding: "0.15rem 0.5rem" }}>Serves {recipe.serves}</span>
                          </div>
                          <h3 style={{ fontFamily: SF, fontSize: "1.15rem", fontWeight: 600, color: "#111", lineHeight: 1.25, marginBottom: "0.25rem" }}>
                            {recipe.pinTitle}
                          </h3>
                          <p style={{ fontFamily: SS, fontSize: "0.76rem", color: "#666", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
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

        {/* ── Latest Drops ── */}
        {(() => {
          const latestRecipes = [...RECIPES]
            .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
            .slice(0, 3);
          return (
            <section aria-labelledby="latest-heading" style={{ background: "#fff", borderTop: "1px solid #EAE5DC", borderBottom: "1px solid #EAE5DC", padding: "3rem 0" }}>
              <div className="max-w-7xl mx-auto px-6">
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                      <span style={{ fontFamily: SS, fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", background: "#CC2222", color: "#fff", borderRadius: "4px", padding: "0.18rem 0.55rem" }}>NEW</span>
                      <span style={{ fontFamily: SS, fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#666" }}>Just Added</span>
                    </div>
                    <h2 id="latest-heading" style={{ fontFamily: SF, fontSize: "1.9rem", fontWeight: 300, color: "#111", letterSpacing: "-0.02em" }}>
                      Latest Drops
                    </h2>
                  </div>
                  <a
                    href="/rss.xml"
                    aria-label="Subscribe to RSS feed"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: SS, fontSize: "0.72rem", fontWeight: 700, color: "#b85000", textDecoration: "none", border: "1.5px solid #b85000", borderRadius: "999px", padding: "0.35rem 0.9rem", letterSpacing: "0.04em" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>
                    RSS Feed
                  </a>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
                  {latestRecipes.map((recipe, i) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: i * 0.07 }}
                      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
                      style={{ borderRadius: "16px", overflow: "hidden", background: "#F9F6F1", border: "1px solid #EAE5DC", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "box-shadow 0.2s ease" }}
                    >
                      <Link href={`/recipes/${recipe.id}`} style={{ display: "block", textDecoration: "none" }}>
                        <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
                          <motion.img
                            src={recipe.image}
                            alt={recipe.imageAlt}
                            whileHover={{ scale: 1.06 }}
                            transition={{ duration: 0.4 }}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)" }} />
                          <div style={{ position: "absolute", top: "0.7rem", left: "0.7rem", background: "#CC2222", borderRadius: "4px", padding: "0.18rem 0.5rem", fontFamily: SS, fontSize: "0.56rem", fontWeight: 800, color: "#fff", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                            New
                          </div>
                          <div style={{ position: "absolute", bottom: "0.7rem", left: "0.7rem", fontFamily: SS, fontSize: "0.62rem", fontWeight: 600, color: "rgba(255,255,255,0.85)", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", padding: "0.2rem 0.5rem", borderRadius: "999px" }}>
                            {recipe.cookTime}
                          </div>
                        </div>
                        <div style={{ padding: "1rem 1.2rem" }}>
                          <div style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 600, color: "#666", marginBottom: "0.35rem" }}>
                            {new Date(recipe.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                          </div>
                          <h3 style={{ fontFamily: SF, fontSize: "1.15rem", fontWeight: 700, color: "#111", lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: "0.4rem" }}>
                            {recipe.title}
                          </h3>
                          <p style={{ fontFamily: SS, fontSize: "0.76rem", color: "#666", lineHeight: 1.55, marginBottom: "0.75rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                            {recipe.description}
                          </p>
                          <span style={{ fontFamily: SS, fontSize: "0.75rem", fontWeight: 700, color: "#B91C1C" }}>
                            Read Recipe →
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

        {/* ── Recipe grid ── */}
        <section id="recipes" className="py-16 max-w-7xl mx-auto w-full px-6" aria-labelledby="recipes-heading">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-6">
            <div>
              <Label>Our Collection</Label>
              <h2 id="recipes-heading" style={{ fontFamily: SF, fontSize: "2.6rem", fontWeight: 300, color: "#111", letterSpacing: "-0.02em", marginTop: "0.35rem" }}>
                All Recipes
              </h2>
            </div>

            {/* Search input — annotated as WebMCP Declarative Tool */}
            <form
              role="search"
              onSubmit={(e) => e.preventDefault()}
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
                onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Quick-pick tag pills */}
          <div className="flex flex-wrap gap-2 mb-6" aria-label="Quick search tags">
            {POPULAR_TAGS.map((tag) => {
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

          {/* Filters row */}
          <div className="flex flex-wrap gap-5 mb-7">
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>Difficulty</span>
              {(["All","Easy","Medium","Hard"] as const).map((d) => {
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
              {([["All","All"],["Quick (≤30 min)","Quick"],["Med (≤1 hr)","Medium"],["Long (1+ hr)","Long"]] as const).map(([label, value]) => {
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
                    : <><span style={{ fontWeight: 700, color: "#333" }}>{filtered.length}</span> recipe{filtered.length !== 1 ? "s" : ""} found{q ? <> for <span style={{ fontWeight: 700, color: "#B91C1C" }}>"{searchQuery}"</span></> : ""}</>}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
              style={{ color: "#555" }}
            >
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

        {/* ── Newsletter ── */}
        <section className="w-full" style={{ background: "linear-gradient(135deg, #1a0a0a 0%, #2d1010 50%, #1a0808 100%)" }} aria-labelledby="newsletter-heading">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem", alignItems: "center" }} className="md:grid-cols-[1fr_1fr]">

              {/* Left copy */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "1rem" }}>
                  <Mail style={{ width: "0.9rem", height: "0.9rem", color: "#ff8080" }} />
                  <span style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff8080" }}>Free Weekly Recipes</span>
                </div>
                <h2 id="newsletter-heading" style={{ fontFamily: SF, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "1rem" }}>
                  Get the Best Recipes <em>Straight to Your Inbox</em>
                </h2>
                <p style={{ fontFamily: SS, fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontWeight: 300 }}>
                  Join 5,000+ meat lovers who get our freshest recipes, pro tips, and secret techniques every week — completely free.
                </p>
                <div style={{ marginTop: "1.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                  {["No spam, ever", "Unsubscribe anytime", "5,000+ subscribers"].map((t) => (
                    <span key={t} style={{ fontFamily: SS, fontSize: "0.75rem", color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <span style={{ color: "#ff4d4d" }}>✓</span> {t}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Right form */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <AnimatePresence mode="wait">
                  {newsletterSent ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ background: "rgba(255,255,255,0.06)", borderRadius: "1.25rem", padding: "2.5rem", textAlign: "center", border: "1.5px solid rgba(255,255,255,0.1)" }}
                    >
                      <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎉</p>
                      <h3 style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#fff", marginBottom: "0.5rem" }}>You're in!</h3>
                      <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>Check your inbox for a welcome recipe from us.</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ background: "rgba(255,255,255,0.06)", borderRadius: "1.25rem", padding: "2rem", border: "1.5px solid rgba(255,255,255,0.1)" }}
                    >
                      <p style={{ fontFamily: SF, fontSize: "1.3rem", fontWeight: 600, color: "#fff", marginBottom: "1.25rem" }}>
                        This Week's Recipe: <em>Smash Burger Sauce</em>
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <input
                          type="email"
                          placeholder="Your email address"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && newsletterEmail.includes("@")) { setNewsletterSent(true); } }}
                          aria-label="Email address for newsletter"
                          data-testid="input-newsletter-email"
                          style={{ width: "100%", padding: "0.85rem 1.1rem", borderRadius: "0.75rem", border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", fontFamily: SS, fontSize: "0.85rem", color: "#fff", outline: "none", boxSizing: "border-box" }}
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { if (newsletterEmail.includes("@")) setNewsletterSent(true); }}
                          data-testid="button-newsletter-subscribe"
                          style={{ width: "100%", padding: "0.85rem", borderRadius: "0.75rem", background: "#CC2222", border: "none", color: "#fff", fontFamily: SS, fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}
                        >
                          Subscribe — It's Free
                        </motion.button>
                      </div>
                      <p style={{ fontFamily: SS, fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", marginTop: "0.75rem", textAlign: "center" }}>
                        We respect your privacy. Unsubscribe at any time.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── About ── */}
        <section id="about" style={{ background: "#111", color: "#f5f2ee" }} className="py-24" aria-labelledby="about-heading">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Label>About Juicy Joe</Label>
              <h2 id="about-heading" style={{ fontFamily: SF, fontSize: "3.2rem", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.05, marginTop: "0.5rem", marginBottom: "1.5rem", color: "#fff" }}>
                Hey, I'm <em>Juicy Joe</em> 👋
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                <p style={{ fontFamily: SS, fontSize: "0.95rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.75, fontWeight: 300 }}>
                  I'm all about one thing: making insanely juicy meat recipes without the stress.
                </p>
                <p style={{ fontFamily: SS, fontSize: "0.95rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.75, fontWeight: 300 }}>
                  No complicated steps. No weird ingredients. Just real, satisfying food you'll actually want to cook again.
                </p>
                <p style={{ fontFamily: SS, fontSize: "0.95rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.75, fontWeight: 300 }}>
                  If you love grilled chicken, beef, and quick comfort meals — welcome to MeatLoversHub 🍖
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "2rem" }}>
                {["🥩 Loves meat", "⚡ Quick recipes", "😎 No-stress cooking", "🤝 Cooks like a friend"].map((badge) => (
                  <span key={badge} style={{ fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "999px", padding: "0.3rem 0.85rem" }}>{badge}</span>
                ))}
              </div>
              <div className="flex items-center gap-5">
                <a href="/follow" aria-label="Follow Juicy Joe on Instagram" className="hover:opacity-50 transition-opacity" data-testid="link-instagram"><Instagram style={{ width: "1.25rem", height: "1.25rem", color: "rgba(255,255,255,0.7)" }} /></a>
                <a href="/follow" aria-label="Follow Juicy Joe on YouTube" className="hover:opacity-50 transition-opacity" data-testid="link-youtube"><Youtube style={{ width: "1.25rem", height: "1.25rem", color: "rgba(255,255,255,0.7)" }} /></a>
                <a href="/follow" aria-label="Follow Juicy Joe on Facebook" className="hover:opacity-50 transition-opacity" data-testid="link-facebook"><Facebook style={{ width: "1.25rem", height: "1.25rem", color: "rgba(255,255,255,0.7)" }} /></a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {RECIPES.map((r, i) => (
                <div key={r.id} className="overflow-hidden rounded-2xl" style={{ aspectRatio: i % 2 === 0 ? "3/4" : "4/3" }}>
                  <img src={r.imageTall} alt={r.imageAlt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}

function Router() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#F9F6F1" }} />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/recipes" component={RecipesPage} />
        <Route path="/recipes/category/:slug" component={CategoryPage} />
        <Route path="/recipes/:id" component={RecipePage} />
        <Route path="/recipe/:id" component={RecipePage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/newsletter" component={NewsletterPage} />
        <Route path="/follow" component={FollowPage} />
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/author/juicy-joe" component={AuthorPage} />
        <Route path="/editorial-policy" component={EditorialPolicyPage} />
        <Route path="/guides/meat-temperatures" component={MeatTemperatureGuidePage} />
        <Route path="/resources" component={ResourcesPage} />
        <Route path="/carnivore-meal-plan" component={CarnivoreMealPlanPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route>
          <div className="min-h-screen flex items-center justify-center" style={{ background: "#F9F6F1" }}>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontFamily: SF, fontSize: "2.5rem", color: "#111", marginBottom: "1rem" }}>Page not found</h1>
              <Link href="/" style={{ color: "#B91C1C", fontFamily: SS, fontWeight: 600, textDecoration: "none" }}>← Back to all recipes</Link>
            </div>
          </div>
        </Route>
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <CollectionsProvider>
      <SiteJsonLd />
      <WebMCPLayer />
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <CookieBanner />
      <WebMCPBridge />
    </CollectionsProvider>
  );
}
