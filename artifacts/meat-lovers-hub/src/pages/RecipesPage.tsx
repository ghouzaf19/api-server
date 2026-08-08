import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChefHat, Users, ArrowRight, Search } from "lucide-react";
import { RECIPES, CATEGORIES, RecipeCategory, formatPublishedDate, getCategorySlug, CATEGORY_COLORS } from "@/data/recipes";
import { SeoMeta } from "@/components/SeoMeta";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { SaveButton } from "@/components/SaveButton";
import { SITE_URL } from "@/lib/siteUrl";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

const DIFF_COLOR: Record<string, string> = {
  Easy: "#16a34a",
  Medium: "#d97706",
  Hard: "#dc2626",
};

const CAT_COLOR: Record<string, string> = {
  Beef: "#b91c1c",
  Chicken: "#d97706",
  "Game Meat": "#16a34a",
  BBQ: "#ea580c",
  "Quick Meals": "#0891b2",
};

const PAGE_SIZE = 4;

export function RecipesPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const urlCategory = params.get("category") as RecipeCategory | null;

  const [activeCategory, setActiveCategory] = useState<RecipeCategory | "All">(
    urlCategory && (CATEGORIES as string[]).includes(urlCategory) ? urlCategory : "All"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Sync when URL param changes
  useEffect(() => {
    const p = new URLSearchParams(search);
    const cat = p.get("category") as RecipeCategory | null;
    if (cat && (CATEGORIES as string[]).includes(cat)) {
      setActiveCategory(cat);
    } else {
      setActiveCategory("All");
    }
    setVisibleCount(PAGE_SIZE);
  }, [search]);

  const q = searchQuery.toLowerCase().trim();
  const filtered = RECIPES.filter((r) => {
    const matchCat = activeCategory === "All" || r.category === activeCategory;
    const matchSearch =
      q === "" ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <>
      <SeoMeta
        title="All Meat Recipes — Blog"
        description="Browse all our viral meat recipes — juicy steaks, fall-off-the-bone BBQ ribs, smash burgers and more. Filter by category and find your next favourite meal."
        image="https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=630&fit=crop&q=85"
        imageAlt="Meat recipe blog — juicy seared steak on a cast iron skillet"
        type="website"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home",    url: `${SITE_URL}/` },
          { name: "Recipes", url: `${SITE_URL}/recipes` },
        ]}
      />

      <div style={{ background: "#F9F6F1", minHeight: "100vh", fontFamily: SS, display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>

        <SiteHeader activeNav="/recipes" />

        {/* ── Page header ── */}
        <div style={{ background: "linear-gradient(135deg, #1a0a0a 0%, #2d1010 60%, #111 100%)", padding: "4rem 1.5rem 3rem" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" style={{ marginBottom: "1.25rem" }}>
              <ol style={{ display: "flex", gap: "0.4rem", listStyle: "none", padding: 0, margin: 0, alignItems: "center", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", fontFamily: SS }}>
                <li><Link href="/" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Home</Link></li>
                <li>/</li>
                <li style={{ color: "rgba(255,255,255,0.7)" }}>Recipes</li>
              </ol>
            </nav>
            <h1 style={{ fontFamily: SF, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 600, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
              All Recipes
            </h1>
            <p style={{ fontFamily: SS, fontSize: "1rem", color: "rgba(255,255,255,0.55)", maxWidth: "480px", lineHeight: 1.65, marginBottom: "2rem" }}>
              {RECIPES.length} insanely good meat recipes from Juicy Joe — steaks, BBQ ribs, burgers, and more. No stress, just results. Filter by category and get cooking.
            </p>

            {/* Search */}
            <div style={{ position: "relative", maxWidth: "420px" }}>
              <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "0.9rem", height: "0.9rem", color: "rgba(255,255,255,0.4)", pointerEvents: "none" }} />
              <input
                type="search"
                placeholder="Search recipes, ingredients…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
                aria-label="Search all recipes"
                style={{ width: "100%", paddingLeft: "2.6rem", paddingRight: "1rem", paddingTop: "0.75rem", paddingBottom: "0.75rem", borderRadius: "8px", border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", fontFamily: SS, fontSize: "0.85rem", color: "#fff", outline: "none" }}
              />
            </div>
          </div>
        </div>

        {/* ── Category tabs ── */}
        <div style={{ background: "#fff", borderBottom: "1px solid #EAE5DC", overflowX: "auto" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem", display: "flex", gap: "0", alignItems: "stretch" }}>
            {(["All", ...CATEGORIES] as const).map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat as RecipeCategory | "All"); setVisibleCount(PAGE_SIZE); }}
                  style={{
                    fontFamily: SS, fontSize: "0.8rem", fontWeight: active ? 700 : 500,
                    color: active ? "#ff4d4d" : "#777",
                    background: "none", border: "none", borderBottom: `3px solid ${active ? "#ff4d4d" : "transparent"}`,
                    padding: "1rem 1.25rem", cursor: "pointer", whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  {cat}
                  <span style={{ marginLeft: "0.4rem", fontSize: "0.65rem", fontWeight: 600, color: active ? "#ff9090" : "#bbb" }}>
                    ({cat === "All" ? RECIPES.length : RECIPES.filter((r) => r.category === cat).length})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Recipe listing ── */}
        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem" }}>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 0", color: "#aaa" }}>
              <p style={{ fontFamily: SF, fontSize: "2rem", fontStyle: "italic" }}>No recipes found.</p>
              <p style={{ fontFamily: SS, fontSize: "0.85rem", marginTop: "0.5rem" }}>Try a different search or category.</p>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: SS, fontSize: "0.78rem", color: "#aaa", marginBottom: "2rem" }}>
                Showing <strong style={{ color: "#555" }}>{Math.min(visibleCount, filtered.length)}</strong> of <strong style={{ color: "#555" }}>{filtered.length}</strong> recipes
                {activeCategory !== "All" && <> in <strong style={{ color: "#ff4d4d" }}>{activeCategory}</strong></>}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <AnimatePresence mode="popLayout">
                  {visible.map((recipe, i) => (
                    <motion.article
                      key={recipe.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.35, delay: i * 0.05 }}
                      style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #EAE5DC", display: "grid", gridTemplateColumns: "280px 1fr", alignItems: "stretch" }}
                      className="blog-card"
                    >
                      {/* Featured image */}
                      <Link href={`/recipes/${recipe.id}`} style={{ display: "block", textDecoration: "none", position: "relative", overflow: "hidden" }}>
                        <img
                          src={recipe.image}
                          alt={recipe.imageAlt}
                          loading="lazy"
                          decoding="async"
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(0,0,0,0.18))" }} />
                        {/* Viral badge */}
                        <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", background: recipe.viralLabel.includes("TRENDING") ? "rgba(220,38,38,0.92)" : recipe.viralLabel.includes("#1") ? "rgba(234,88,12,0.92)" : "rgba(0,0,0,0.55)", borderRadius: "4px", padding: "0.22rem 0.55rem", fontFamily: SS, fontSize: "0.58rem", fontWeight: 800, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          {recipe.viralLabel}
                        </div>
                      </Link>

                      {/* Content */}
                      <div style={{ padding: "1.75rem 2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          {/* Category + date */}
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                            <Link
                              href={`/recipes/category/${getCategorySlug(recipe.category)}`}
                              style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: CATEGORY_COLORS[recipe.category] ?? "#ff4d4d", textDecoration: "none", background: `${CATEGORY_COLORS[recipe.category] ?? "#ff4d4d"}18`, padding: "0.2rem 0.6rem", borderRadius: "4px" }}
                            >
                              {recipe.category}
                            </Link>
                            <span style={{ fontFamily: SS, fontSize: "0.7rem", color: "#bbb" }}>
                              {formatPublishedDate(recipe.publishedAt)}
                            </span>
                            <span style={{ fontFamily: SS, fontSize: "0.7rem", color: "#bbb" }}>·</span>
                            <span style={{ fontFamily: SS, fontSize: "0.7rem", color: "#bbb" }}>{recipe.readTime}</span>
                          </div>

                          {/* H2 Title — maps to WordPress post title */}
                          <h2 style={{ fontFamily: SF, fontSize: "1.65rem", fontWeight: 700, color: "#111", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "0.6rem" }}>
                            <Link href={`/recipes/${recipe.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                              {recipe.pinTitle}
                            </Link>
                          </h2>

                          {/* Description — maps to WP excerpt */}
                          <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "#666", lineHeight: 1.65, marginBottom: "1rem", fontStyle: "italic" }}>
                            {recipe.description}
                          </p>

                          {/* Meta: cook time, serves, difficulty */}
                          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: SS, fontSize: "0.75rem", color: "#888" }}>
                              <Clock style={{ width: "0.8rem", height: "0.8rem", color: "#ff4d4d" }} />
                              {recipe.cookTime}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: SS, fontSize: "0.75rem", color: "#888" }}>
                              <Users style={{ width: "0.8rem", height: "0.8rem", color: "#ff4d4d" }} />
                              Serves {recipe.serves}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: SS, fontSize: "0.75rem", fontWeight: 700, color: DIFF_COLOR[recipe.difficulty] }}>
                              <ChefHat style={{ width: "0.8rem", height: "0.8rem" }} />
                              {recipe.difficulty}
                            </span>
                            <span style={{ fontFamily: SS, fontSize: "0.75rem", color: "#E60023", fontWeight: 700 }}>
                              📌 {recipe.saves} saves
                            </span>
                          </div>

                          {/* Tags — maps to WP tags */}
                          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                            {recipe.tags.slice(0, 4).map((tag) => (
                              <span key={tag} style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#aaa", background: "#F0EBE2", padding: "0.2rem 0.55rem", borderRadius: "4px" }}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Footer: author + CTA */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #F0EBE2", paddingTop: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
                          <span style={{ fontFamily: SS, fontSize: "0.75rem", color: "#aaa" }}>
                            By <strong style={{ color: "#555" }}>{recipe.author}</strong>
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <SaveButton recipeId={recipe.id} />
                            <Link
                              href={`/recipes/${recipe.id}`}
                              style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "#ff4d4d", color: "#fff", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.55rem 1.25rem", borderRadius: "8px", textDecoration: "none", transition: "background 0.15s" }}
                            >
                              View Recipe <ArrowRight style={{ width: "0.78rem", height: "0.78rem" }} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>

              {/* Load More */}
              {hasMore && (
                <div style={{ textAlign: "center", marginTop: "3rem" }}>
                  <button
                    onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                    style={{ fontFamily: SS, fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ff4d4d", background: "#fff", border: "2px solid #ff4d4d", borderRadius: "8px", padding: "0.85rem 2.5rem", cursor: "pointer", transition: "all 0.18s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#ff4d4d"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.color = "#ff4d4d"; }}
                  >
                    Load More Recipes ({filtered.length - visibleCount} remaining)
                  </button>
                </div>
              )}

              {!hasMore && filtered.length > PAGE_SIZE && (
                <p style={{ textAlign: "center", fontFamily: SS, fontSize: "0.78rem", color: "#bbb", marginTop: "2.5rem" }}>
                  You've seen all {filtered.length} recipes in this category.
                </p>
              )}
            </>
          )}
        </main>

        <SiteFooter />
      </div>

      <style>{`
        @media (max-width: 640px) {
          .blog-card { grid-template-columns: 1fr !important; }
          .blog-card img { max-height: 220px; }
        }
      `}</style>
    </>
  );
}
