import { useState } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChefHat, Users, ArrowRight, TrendingUp, Grid3X3, BookOpen, HelpCircle, ChevronDown } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  RECIPES, CATEGORIES, RecipeCategory,
  CATEGORY_FROM_SLUG, CATEGORY_TO_SLUG,
  CATEGORY_SEO, CATEGORY_COLORS,
  getCategorySlug, formatPublishedDate,
} from "@/data/recipes";
import { SeoMeta } from "@/components/SeoMeta";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { SaveButton } from "@/components/SaveButton";
import { PinterestButton } from "@/components/PinterestButton";
import { SITE_URL } from "@/lib/siteUrl";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

const DIFF_COLOR: Record<string, string> = {
  Easy: "#16a34a",
  Medium: "#d97706",
  Hard: "#dc2626",
};

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = CATEGORY_FROM_SLUG[slug ?? ""] as RecipeCategory | undefined;

  const [diffFilter, setDiffFilter] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [timeFilter, setTimeFilter] = useState<"All" | "Quick" | "Medium" | "Long">("All");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!category || !CATEGORY_SEO[category]) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SS, background: "#F9F6F1", gap: "1rem" }}>
        <h1 style={{ fontFamily: SF, fontSize: "2.5rem", color: "#111" }}>Category not found</h1>
        <Link href="/recipes" style={{ color: "#ff4d4d", fontWeight: 600, textDecoration: "none" }}>← All Recipes</Link>
      </div>
    );
  }

  const seo = CATEGORY_SEO[category];
  const color = CATEGORY_COLORS[category];
  const allCategoryRecipes = RECIPES.filter((r) => r.category === category);
  const otherCategories = CATEGORIES.filter((c) => c !== category);
  const pageUrl = `${SITE_URL}${window.location.pathname}`;

  // Most popular = highest saves (strip "k" suffix and parse)
  const parseSaves = (s: string) => parseFloat(s.replace("k", "")) * (s.includes("k") ? 1000 : 1);
  const mostPopular = [...allCategoryRecipes].sort((a, b) => parseSaves(b.saves) - parseSaves(a.saves))[0];

  // Filtered grid recipes
  const filtered = allCategoryRecipes.filter((r) => {
    const diffOk = diffFilter === "All" || r.difficulty === diffFilter;
    const timeOk =
      timeFilter === "All" ||
      (timeFilter === "Quick" && r.cookTimeMinutes <= 30) ||
      (timeFilter === "Medium" && r.cookTimeMinutes > 30 && r.cookTimeMinutes <= 60) ||
      (timeFilter === "Long" && r.cookTimeMinutes > 60);
    return diffOk && timeOk;
  });

  const avgTime = Math.round(allCategoryRecipes.reduce((s, r) => s + r.cookTimeMinutes, 0) / allCategoryRecipes.length);
  const easyCount = allCategoryRecipes.filter((r) => r.difficulty === "Easy").length;

  return (
    <>
      <SeoMeta
        title={seo.seoTitle}
        description={seo.metaDescription}
        image={seo.heroImage}
        imageAlt={`${category} recipes — Meat Lovers Hub`}
        url={pageUrl}
        type="website"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home",      url: `${SITE_URL}/` },
          { name: "Recipes",   url: `${SITE_URL}/recipes` },
          { name: category,    url: `${SITE_URL}/recipes/category/${slug}` },
        ]}
      />
      {/* ItemList JSON-LD — signals this is a collection/pillar page to Google */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": seo.seoTitle,
        "description": seo.metaDescription,
        "url": pageUrl,
        "about": { "@type": "Thing", "name": seo.targetKeyword },
        "mainEntity": {
          "@type": "ItemList",
          "name": `${category} Recipes`,
          "description": `Complete collection of ${category} recipes by Juicy Joe`,
          "numberOfItems": allCategoryRecipes.length,
          "itemListElement": allCategoryRecipes.map((r, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": r.title,
            "url": `${SITE_URL}/recipes/${r.id}`,
            "image": r.image,
            "description": r.description,
          })),
        },
        "author": { "@type": "Person", "name": "Juicy Joe", "url": `${SITE_URL}/author/juicy-joe` },
        "publisher": { "@type": "Organization", "name": "Meat Lovers Hub", "url": SITE_URL },
      }) }} />
      <div style={{ background: "#F9F6F1", minHeight: "100vh", fontFamily: SS, display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>

        <SiteHeader activeNav="/recipes" />

        {/* ── Hero ── */}
        <div style={{ position: "relative", overflow: "hidden", background: "#1a1008", width: "100%" }}>
          <img
            src={seo.heroImage}
            alt={`${category} recipes collection`}
            style={{ width: "100%", height: "420px", objectFit: "cover", display: "block", filter: "brightness(0.38)" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, rgba(0,0,0,0.85) 0%, ${color}22 100%)` }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 0 2.5rem" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "0 1.5rem" }}>
              {/* Breadcrumb */}
              <nav aria-label="breadcrumb" style={{ marginBottom: "1rem" }}>
                <ol style={{ display: "flex", gap: "0.4rem", listStyle: "none", padding: 0, margin: 0, alignItems: "center", fontSize: "0.72rem", fontFamily: SS, color: "rgba(255,255,255,0.45)" }}>
                  <li><Link href="/" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Home</Link></li>
                  <li>/</li>
                  <li><Link href="/recipes" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Recipes</Link></li>
                  <li>/</li>
                  <li style={{ color: "rgba(255,255,255,0.8)" }}>{category}</li>
                </ol>
              </nav>

              {/* Category badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: `${color}cc`, borderRadius: "6px", padding: "0.3rem 0.8rem", marginBottom: "0.75rem", fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff" }}>
                {category}
              </div>

              {/* H1 */}
              <h1 style={{ fontFamily: SF, fontSize: "clamp(2.8rem, 7vw, 5rem)", fontWeight: 600, color: "#fff", lineHeight: 1.0, letterSpacing: "-0.03em", marginBottom: "0.85rem" }}>
                {category} Recipes
              </h1>

              {/* Intro */}
              <p style={{ fontFamily: SS, fontSize: "0.95rem", color: "rgba(255,255,255,0.6)", maxWidth: "560px", lineHeight: 1.65, marginBottom: "1.5rem" }}>
                {seo.intro}
              </p>

              {/* Stats row */}
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                {[
                  { label: `${allCategoryRecipes.length} recipes`, icon: "📋" },
                  { label: `Avg ${avgTime} min`, icon: "⏱" },
                  { label: `${easyCount} easy recipes`, icon: "✅" },
                ].map((stat) => (
                  <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: SS, fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                    <span>{stat.icon}</span>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "3rem 1.5rem", boxSizing: "border-box" }}>

          {/* ── Complete Guide Section (Pillar Content) ── */}
          <section aria-labelledby="guide-heading" style={{ marginBottom: "4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <BookOpen style={{ width: "1rem", height: "1rem", color: color }} />
              <h2 id="guide-heading" style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em" }}>
                The Complete {category} Guide
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="md:grid-cols-[3fr_2fr]">
              {/* Pillar intro text */}
              <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "2rem", border: "1px solid #EAE5DC" }}>
                {seo.pillarIntro.split("\n\n").map((para, i) => (
                  <p key={i} style={{ fontFamily: SS, fontSize: "0.92rem", color: "#555", lineHeight: 1.8, margin: i === 0 ? "0 0 1rem" : "0 0 1rem" }}>
                    {para}
                  </p>
                ))}
              </div>

              {/* Subtopics */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: color, marginBottom: "0.25rem" }}>
                  What this guide covers
                </p>
                {seo.pillarSubtopics.map((sub, i) => (
                  <div key={i} style={{ padding: "1.1rem 1.25rem", background: "#fff", borderRadius: "1rem", border: "1px solid #EAE5DC", borderLeft: `3px solid ${color}` }}>
                    <p style={{ fontFamily: SF, fontSize: "1.05rem", fontWeight: 700, color: "#111", marginBottom: "0.4rem", lineHeight: 1.2 }}>
                      {sub.title}
                    </p>
                    <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#777", lineHeight: 1.65, margin: 0 }}>
                      {sub.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Most Popular ── */}
          {mostPopular && (
            <section aria-labelledby="popular-heading" style={{ marginBottom: "4rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <TrendingUp style={{ width: "1rem", height: "1rem", color: color }} />
                <h2 id="popular-heading" style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em" }}>
                  Most Popular in {category}
                </h2>
              </div>

              <Link href={`/recipes/${mostPopular.id}`} style={{ display: "block", textDecoration: "none" }}>
                <motion.div
                  whileHover={{ scale: 1.005 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ borderRadius: "20px", overflow: "hidden", background: "#fff", boxShadow: "0 4px 32px rgba(0,0,0,0.1)", border: "1px solid #EAE5DC", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "stretch" }}
                  className="featured-card"
                >
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <img src={mostPopular.imageTall} alt={mostPopular.imageAlt} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: "320px", display: "block", transition: "transform 0.4s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 50%, rgba(0,0,0,0.12))" }} />
                    <div style={{ position: "absolute", top: "1rem", left: "1rem", background: "rgba(220,38,38,0.9)", borderRadius: "6px", padding: "0.3rem 0.8rem", fontFamily: SS, fontSize: "0.6rem", fontWeight: 800, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      🔥 Most Popular
                    </div>
                  </div>
                  <div
                    style={{ padding: "2.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                    className="featured-card-content">
                    <div>
                      <div style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: color, marginBottom: "0.75rem" }}>
                        {mostPopular.category} · {formatPublishedDate(mostPopular.publishedAt)}
                      </div>
                      <h3 style={{ fontFamily: SF, fontSize: "2rem", fontWeight: 700, color: "#111", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
                        {mostPopular.pinTitle}
                      </h3>
                      <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "#666", lineHeight: 1.65, fontStyle: "italic", marginBottom: "1.5rem" }}>
                        {mostPopular.description}
                      </p>
                      <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: SS, fontSize: "0.75rem", color: "#888" }}>
                          <Clock style={{ width: "0.8rem", height: "0.8rem", color: "#ff4d4d" }} /> {mostPopular.cookTime}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: SS, fontSize: "0.75rem", color: "#888" }}>
                          <Users style={{ width: "0.8rem", height: "0.8rem", color: "#ff4d4d" }} /> Serves {mostPopular.serves}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: SS, fontSize: "0.75rem", fontWeight: 700, color: DIFF_COLOR[mostPopular.difficulty] }}>
                          <ChefHat style={{ width: "0.8rem", height: "0.8rem" }} /> {mostPopular.difficulty}
                        </span>
                        <span style={{ fontFamily: SS, fontSize: "0.75rem", color: "#E60023", fontWeight: 700 }}>📌 {mostPopular.saves} saves</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: color, color: "#fff", fontFamily: SS, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.65rem 1.25rem", borderRadius: "8px", whiteSpace: "nowrap" }}>
                        View Recipe <ArrowRight style={{ width: "0.8rem", height: "0.8rem" }} />
                      </span>
                      <SaveButton recipeId={mostPopular.id} />
                      <PinterestButton url={pageUrl} image={mostPopular.imageTall} description={mostPopular.pinTitle} variant="pill" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            </section>
          )}

          {/* ── Filters ── */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginBottom: "2rem", padding: "1rem 1.25rem", background: "#fff", borderRadius: "12px", border: "1px solid #EAE5DC" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#bbb", whiteSpace: "nowrap" }}>Difficulty</span>
              {(["All", "Easy", "Medium", "Hard"] as const).map((d) => (
                <button key={d} onClick={() => setDiffFilter(d)}
                  style={{ fontFamily: SS, fontSize: "0.74rem", fontWeight: 600, padding: "0.3rem 0.75rem", borderRadius: "999px", border: `1.5px solid ${diffFilter === d ? (DIFF_COLOR[d] ?? "#111") : "#D5CEBF"}`, background: diffFilter === d ? (DIFF_COLOR[d] ?? "#111") : "transparent", color: diffFilter === d ? "#fff" : "#777", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                  {d}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#bbb", whiteSpace: "nowrap" }}>Time</span>
              {([["All","All"],["≤30 min","Quick"],["≤1 hr","Medium"],["1+ hr","Long"]] as const).map(([label, val]) => (
                <button key={val} onClick={() => setTimeFilter(val)}
                  style={{ fontFamily: SS, fontSize: "0.74rem", fontWeight: 600, padding: "0.3rem 0.75rem", borderRadius: "999px", border: `1.5px solid ${timeFilter === val ? "#111" : "#D5CEBF"}`, background: timeFilter === val ? "#111" : "transparent", color: timeFilter === val ? "#fff" : "#777", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                  {label}
                </button>
              ))}
            </div>
            <p style={{ fontFamily: SS, fontSize: "0.78rem", color: "#bbb", marginLeft: "auto" }}>
              Showing <strong style={{ color: "#555" }}>{filtered.length}</strong> of <strong style={{ color: "#555" }}>{allCategoryRecipes.length}</strong> recipes
            </p>
          </div>

          {/* ── Recipe Grid ── */}
          <section aria-labelledby="recipes-grid-heading" style={{ marginBottom: "4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <Grid3X3 style={{ width: "1rem", height: "1rem", color: "#aaa" }} />
              <h2 id="recipes-grid-heading" style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em" }}>
                All {category} Recipes
              </h2>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 0", color: "#aaa" }}>
                <p style={{ fontFamily: SF, fontSize: "1.8rem", fontStyle: "italic" }}>No recipes match those filters.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
                  {filtered.map((recipe, i) => (
                    <motion.div key={recipe.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }}>
                      <Link href={`/recipes/${recipe.id}`} style={{ display: "block", textDecoration: "none" }}>
                        <motion.div
                          whileHover={{ y: -5, boxShadow: "0 12px 36px rgba(0,0,0,0.12)" }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          style={{ borderRadius: "16px", overflow: "hidden", background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #EAE5DC" }}
                        >
                          {/* Image */}
                          <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden" }}>
                            <motion.img
                              src={recipe.image}
                              alt={recipe.imageAlt}
                              loading="lazy"
                              decoding="async"
                              whileHover={{ scale: 1.06 }}
                              transition={{ duration: 0.4 }}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
                            {/* Viral badge */}
                            <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", borderRadius: "4px", padding: "0.22rem 0.55rem", fontFamily: SS, fontSize: "0.58rem", fontWeight: 800, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                              {recipe.viralLabel}
                            </div>
                            {/* Saves */}
                            <div style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem", right: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                              <span style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, color: "#E60023", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", padding: "0.25rem 0.6rem", borderRadius: "999px" }}>
                                📌 {recipe.saves}
                              </span>
                              <span style={{ fontFamily: SS, fontSize: "0.68rem", fontWeight: 700, color: DIFF_COLOR[recipe.difficulty], background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", padding: "0.25rem 0.6rem", borderRadius: "999px" }}>
                                {recipe.difficulty}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div style={{ padding: "1.1rem 1.25rem" }}>
                            <div style={{ fontFamily: SS, fontSize: "0.68rem", fontWeight: 600, color: "#bbb", marginBottom: "0.4rem" }}>
                              {formatPublishedDate(recipe.publishedAt)} · {recipe.cookTime}
                            </div>
                            <h3 style={{ fontFamily: SF, fontSize: "1.25rem", fontWeight: 700, color: "#111", lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: "0.5rem" }}>
                              {recipe.title}
                            </h3>
                            <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "#888", lineHeight: 1.55, marginBottom: "0.85rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                              {recipe.description}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, color: color }}>
                                View Recipe →
                              </span>
                              <div style={{ display: "flex", gap: "0.4rem" }}>
                                <SaveButton recipeId={recipe.id} />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </section>

          {/* ── Pillar FAQ ── */}
          <section aria-labelledby="pillar-faq-heading" style={{ marginBottom: "4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <HelpCircle style={{ width: "1rem", height: "1rem", color: color }} />
              <h2 id="pillar-faq-heading" style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em" }}>
                {category} Questions — Answered
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {seo.pillarFaq.map((item, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: "1rem", border: `1px solid ${openFaq === i ? color : "#EAE5DC"}`, overflow: "hidden", transition: "border-color 0.2s" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.4rem", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: "1rem" }}
                  >
                    <h3 style={{ fontFamily: SF, fontSize: "1.05rem", fontWeight: 600, color: "#111", margin: 0, lineHeight: 1.35 }}>
                      {item.q}
                    </h3>
                    <ChevronDown style={{ width: "1rem", height: "1rem", color: color, flexShrink: 0, transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s" }} />
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "#555", lineHeight: 1.75, padding: "0 1.4rem 1.2rem", margin: 0 }}>
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>

          {/* ── Related Categories ── */}
          <section aria-labelledby="related-categories-heading" style={{ marginBottom: "2rem" }}>
            <h2 id="related-categories-heading" style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
              More Recipe Categories
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
              {otherCategories.map((cat) => {
                const catRecipes = RECIPES.filter((r) => r.category === cat);
                const catColor = CATEGORY_COLORS[cat];
                const catSeo = CATEGORY_SEO[cat];
                return (
                  <Link key={cat} href={`/recipes/category/${getCategorySlug(cat)}`} style={{ textDecoration: "none" }}>
                    <motion.div
                      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      style={{ borderRadius: "14px", overflow: "hidden", background: "#fff", border: "1px solid #EAE5DC", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                    >
                      <div style={{ position: "relative", height: "100px", overflow: "hidden", background: "#1a1008" }}>
                        <img src={catSeo.heroImage} alt={`${cat} recipes`} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.55)" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        <div style={{ position: "absolute", inset: 0, background: `${catColor}55` }} />
                      </div>
                      <div style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ fontFamily: SS, fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: catColor, marginBottom: "0.2rem" }}>
                          {catRecipes.length} recipes
                        </div>
                        <p style={{ fontFamily: SF, fontSize: "1.1rem", fontWeight: 700, color: "#111", margin: 0, lineHeight: 1.2 }}>{cat}</p>
                        <p style={{ fontFamily: SS, fontSize: "0.72rem", color: "#888", margin: "0.25rem 0 0", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          Explore → <ArrowRight style={{ width: "0.65rem", height: "0.65rem" }} />
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <SiteFooter />
      </div>
      <style>{`
        @media (max-width: 640px) {
          .featured-card { grid-template-columns: 1fr !important; }
          .featured-card-content { padding: 1.25rem !important; }
        }
      `}</style>
    </>
  );
}
