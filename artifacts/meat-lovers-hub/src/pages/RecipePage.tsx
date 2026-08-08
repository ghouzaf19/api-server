import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, ChefHat, ArrowLeft, Check, Lightbulb, HelpCircle, AlertTriangle, Lock, Unlock, Download, Save, CheckCircle } from "lucide-react";
import { getRecipeById, getRelatedRecipes, formatPublishedDate, toIsoDuration, getCategorySlug, CATEGORY_COLORS, CATEGORY_SEO, RECIPES } from "@/data/recipes";
import { ExternalLink } from "lucide-react";
import { PinterestButton } from "@/components/PinterestButton";
import { PrintButton } from "@/components/PrintButton";
import { SaveButton } from "@/components/SaveButton";
import { SeoMeta } from "@/components/SeoMeta";
import { SITE_URL } from "@/lib/siteUrl";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { ReviewSection } from "@/components/ReviewSection";
import { StarDisplay } from "@/components/StarRating";
import { useRatings } from "@/hooks/useRatings";
import { RelatedRecipes } from "@/components/RelatedRecipes";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

const DIFF_COLOR: Record<string, string> = {
  Easy: "#16a34a",
  Medium: "#d97706",
  Hard: "#dc2626",
};

function formatTotalTime(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr${h > 1 ? "s" : ""}`;
}

type MealDay = {
  day: number;
  breakfast: { recipe: string; note: string };
  lunch: { recipe: string; note: string };
  dinner: { recipe: string; note: string };
};

type MealPlanResult = {
  days: number;
  preference: string;
  totalProteinFocus: string;
  plan: MealDay[];
  tip: string;
};

export function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const recipe = getRecipeById(id);
  const { average, count } = useRatings(id ?? "");

  const [showSticky, setShowSticky] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlanResult | null>(null);
  const [mealPlanLoading, setMealPlanLoading] = useState(false);
  const [emailUnlocked, setEmailUnlocked] = useState(() => !!localStorage.getItem("mlh:meal-plan-unlocked"));
  const [emailInput, setEmailInput] = useState("");
  const [planSaved, setPlanSaved] = useState(false);

  const MEAL_PLAN_LOCKED_FROM = 2;
  const MEAL_PLAN_WEEKDAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Schema.org Recipe JSON-LD — fully optimised for Google Rich Results
  useEffect(() => {
    if (!recipe) return;

    const origin = (import.meta.env.VITE_SITE_URL as string | undefined) || "https://www.meatlovershub.com";

    const schema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Recipe",
      "name": recipe.title,
      "url": `${origin}/recipes/${recipe.id}`,
      "image": [
        { "@type": "ImageObject", "url": recipe.image,     "width": 800, "height": 534 },
        { "@type": "ImageObject", "url": recipe.imageTall, "width": 600, "height": 900 },
      ],
      "description": recipe.metaDescription,
      "keywords": recipe.tags.join(", "),
      "author": {
        "@type": "Person",
        "@id": `${origin}/#juicy-joe`,
        "name": recipe.author,
        "url": `${origin}/author/juicy-joe`,
      },
      "publisher": {
        "@type": "Organization",
        "name": "Meat Lovers Hub",
        "@id": `${origin}/#organization`,
        "url": `${origin}/`,
        "logo": {
          "@type": "ImageObject",
          "url": `${origin}/favicon.svg`,
        },
      },
      "datePublished": recipe.publishedAt,
      "dateModified": recipe.updatedAt ?? recipe.publishedAt,
      "prepTime": `PT${recipe.prepTimeMinutes}M`,
      "cookTime": toIsoDuration(recipe.cookTimeMinutes),
      "totalTime": toIsoDuration(recipe.cookTimeMinutes + recipe.prepTimeMinutes),
      "recipeYield": `${recipe.serves} serving${Number(recipe.serves) > 1 ? "s" : ""}`,
      "recipeCategory": recipe.category,
      "recipeCuisine": "American",
      "recipeIngredient": recipe.ingredients,
      "recipeInstructions": recipe.steps.map((step, i) => ({
        "@type": "HowToStep",
        "position": i + 1,
        "text": step,
      })),
    };

    // Only include aggregateRating when real reviews exist
    if (count > 0) {
      schema["aggregateRating"] = {
        "@type": "AggregateRating",
        "ratingValue": average.toFixed(1),
        "reviewCount": count,
        "bestRating": "5",
        "worstRating": "1",
      };
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "recipe-schema-jsonld";
    script.text = JSON.stringify(schema);
    const existing = document.getElementById("recipe-schema-jsonld");
    if (existing) existing.remove();
    document.head.appendChild(script);

    // FAQPage schema — injected as a separate script for "People Also Ask" rich results
    if (recipe.faq && recipe.faq.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": recipe.faq.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": a,
          },
        })),
      };
      const faqScript = document.createElement("script");
      faqScript.type = "application/ld+json";
      faqScript.id = "faq-schema-jsonld";
      faqScript.text = JSON.stringify(faqSchema);
      const existingFaq = document.getElementById("faq-schema-jsonld");
      if (existingFaq) existingFaq.remove();
      document.head.appendChild(faqScript);
    }

    return () => {
      document.getElementById("recipe-schema-jsonld")?.remove();
      document.getElementById("faq-schema-jsonld")?.remove();
    };
  }, [recipe, average, count]);

  // Sticky save bar — appears after scrolling past hero
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      setShowSticky(scrolled > 380 && scrolled < docHeight - 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!recipe) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SS, background: "#F9F6F1" }}>
        <h1 style={{ fontFamily: SF, fontSize: "2.5rem", color: "#111", marginBottom: "1rem" }}>Recipe not found</h1>
        <Link href="/" style={{ color: "#ff4d4d", fontWeight: 600, textDecoration: "none" }}>← Back to all recipes</Link>
      </div>
    );
  }

  const pageUrl = `${(import.meta.env.VITE_SITE_URL as string | undefined) || "https://www.meatlovershub.com"}/recipes/${recipe.id}`;

  return (
    <>
      {/* ── Sticky Save Bar ── */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="no-print"
            style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: "rgba(10,10,10,0.96)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "0.85rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: 0 }}>Saving this recipe?</p>
              <p style={{ fontFamily: SF, fontSize: "1rem", fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {recipe.title}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
              <SaveButton recipeId={recipe.id} />
              <PinterestButton url={pageUrl} image={recipe.imageTall} description={recipe.pinTitle} variant="pill" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SeoMeta
        title={recipe.pinTitle}
        description={recipe.metaDescription}
        image={recipe.image}
        imageAlt={recipe.imageAlt}
        url={pageUrl}
        publishedAt={recipe.publishedAt}
        modifiedAt={recipe.updatedAt ?? recipe.publishedAt}
        authorName={recipe.author}
        tags={recipe.tags}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home",             url: `${SITE_URL}/` },
          { name: "Recipes",          url: `${SITE_URL}/recipes` },
          { name: recipe.category,    url: `${SITE_URL}/recipes/category/${getCategorySlug(recipe.category)}` },
          { name: recipe.title,       url: `${SITE_URL}/recipes/${recipe.id}` },
        ]}
      />

      <div style={{ background: "#F9F6F1", minHeight: "100vh", fontFamily: SS }}>

        {/* ── Sticky header ── */}
        <header className="no-print" style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(249,246,241,0.94)", backdropFilter: "blur(12px)", borderBottom: "1px solid #EAE5DC" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem", height: "62px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: "#555", fontFamily: SS, fontSize: "0.82rem", fontWeight: 500 }}
              data-testid="link-back-home">
              <ArrowLeft style={{ width: "1rem", height: "1rem" }} /> Back to Recipes
            </Link>
            <span style={{ fontFamily: SF, fontSize: "1.4rem", fontWeight: 600, color: "#111", letterSpacing: "-0.03em" }}>Meat Lovers Hub</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <PrintButton variant="icon" />
              <SaveButton recipeId={recipe.id} />
              <PinterestButton url={pageUrl} image={recipe.imageTall} description={recipe.pinTitle} variant="pill" />
            </div>
          </div>
        </header>

        {/* ── PRINT-ONLY LAYOUT ── rendered only when printing ── */}
        <div className="print-only">
          <div className="print-header">
            <span className="print-header-logo">Meat Lovers Hub</span>
            <span className="print-header-url">www.meatlovershub.com/recipes/{recipe.id}</span>
          </div>

          <div className="print-tags">
            {recipe.tags.slice(0, 5).map(tag => (
              <span key={tag} className="print-tag">#{tag}</span>
            ))}
          </div>

          <h1 className="print-recipe-title">{recipe.pinTitle}</h1>
          <p className="print-recipe-desc">{recipe.description}</p>

          <div className="print-meta">
            <div className="print-meta-item">
              <span className="print-meta-label">⏱ Cook Time:</span>
              <span className="print-meta-value">{recipe.cookTime}</span>
            </div>
            <div className="print-meta-item">
              <span className="print-meta-label">👥 Serves:</span>
              <span className="print-meta-value">{recipe.serves}</span>
            </div>
            <div className="print-meta-item">
              <span className="print-meta-label">🎯 Difficulty:</span>
              <span className="print-meta-value">{recipe.difficulty}</span>
            </div>
          </div>

          <div className="print-columns">
            <div>
              <p className="print-section-title">Ingredients</p>
              <ul className="print-ingredients">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="print-section-title">Step-by-Step Instructions</p>
              <ol className="print-steps">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="print-step">
                    <span className="print-step-num">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="print-footer">
            <span className="print-footer-note">Find more recipes at www.meatlovershub.com</span>
            <span className="print-footer-note">© {new Date().getFullYear()} Meat Lovers Hub</span>
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem" }} className="md:grid-cols-[2fr_1fr]">

            {/* Left: content */}
            <article>
              {/* Breadcrumb */}
              <nav aria-label="breadcrumb" style={{ marginBottom: "1.25rem" }}>
                <ol style={{ display: "flex", gap: "0.4rem", listStyle: "none", padding: 0, margin: 0, alignItems: "center", fontSize: "0.75rem", color: "#999", fontFamily: SS }}>
                  <li><Link href="/" style={{ color: "#aaa", textDecoration: "none" }}>Home</Link></li>
                  <li style={{ color: "#ccc" }}>/</li>
                  <li><Link href="/recipes" style={{ color: "#aaa", textDecoration: "none" }}>Recipes</Link></li>
                  <li style={{ color: "#ccc" }}>/</li>
                  <li><Link href={`/recipes/category/${getCategorySlug(recipe.category)}`} style={{ color: "#aaa", textDecoration: "none" }}>{recipe.category}</Link></li>
                  <li style={{ color: "#ccc" }}>/</li>
                  <li style={{ color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>{recipe.title}</li>
                </ol>
              </nav>

              {/* Category + date + author */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                <Link href={`/recipes/category/${getCategorySlug(recipe.category)}`} style={{ fontFamily: SS, fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: CATEGORY_COLORS[recipe.category] ?? "#ff4d4d", textDecoration: "none", background: `${CATEGORY_COLORS[recipe.category] ?? "#ff4d4d"}18`, padding: "0.25rem 0.7rem", borderRadius: "4px" }}>
                  {recipe.category}
                </Link>
                <span style={{ fontFamily: SS, fontSize: "0.75rem", color: "#bbb" }}>
                  {formatPublishedDate(recipe.publishedAt)}
                </span>
                <span style={{ fontFamily: SS, fontSize: "0.75rem", color: "#bbb" }}>·</span>
                <span style={{ fontFamily: SS, fontSize: "0.75rem", color: "#bbb" }}>By{" "}
                  <Link href="/author/juicy-joe" style={{ color: "#ff4d4d", fontWeight: 600, textDecoration: "none" }}>
                    {recipe.author}
                  </Link>
                </span>
                <span style={{ fontFamily: SS, fontSize: "0.75rem", color: "#bbb" }}>·</span>
                <span style={{ fontFamily: SS, fontSize: "0.75rem", color: "#bbb" }}>{recipe.readTime}</span>
                {recipe.updatedAt && recipe.updatedAt !== recipe.publishedAt && (
                  <>
                    <span style={{ fontFamily: SS, fontSize: "0.75rem", color: "#bbb" }}>·</span>
                    <span style={{ fontFamily: SS, fontSize: "0.72rem", color: "#aaa", background: "#F0EBE2", borderRadius: "4px", padding: "0.15rem 0.55rem" }}>
                      Updated {formatPublishedDate(recipe.updatedAt)}
                    </span>
                  </>
                )}
              </div>

              {/* Tags */}
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                {recipe.tags.slice(0, 4).map((tag) => (
                  <span key={tag} style={{ fontFamily: SS, fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#aaa", background: "#F0EBE2", padding: "0.2rem 0.6rem", borderRadius: "4px" }}>
                    #{tag}
                  </span>
                ))}
              </div>

              {/* ── Cluster → Pillar link ── */}
              {(() => {
                const catSlug = getCategorySlug(recipe.category);
                const catColor = CATEGORY_COLORS[recipe.category];
                const catRecipeCount = RECIPES.filter(r => r.category === recipe.category).length;
                return (
                  <Link href={`/recipes/category/${catSlug}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.65rem 1rem", marginBottom: "1.5rem", background: `${catColor}0d`, border: `1px solid ${catColor}30`, borderLeft: `3px solid ${catColor}`, borderRadius: "8px", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = `${catColor}1a`)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = `${catColor}0d`)}
                    >
                      <span style={{ fontFamily: SS, fontSize: "0.76rem", color: "#666" }}>
                        Part of the{" "}
                        <strong style={{ color: catColor }}>{recipe.category} collection</strong>
                        {" "}· {catRecipeCount} recipes
                      </span>
                      <span style={{ fontFamily: SS, fontSize: "0.72rem", fontWeight: 700, color: catColor, whiteSpace: "nowrap" }}>
                        Browse all →
                      </span>
                    </div>
                  </Link>
                );
              })()}

              {/* H1 Title */}
              <h1 style={{ fontFamily: SF, fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 600, color: "#111", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "1rem" }}>
                {recipe.pinTitle}
              </h1>

              {/* Description */}
              <p style={{ fontSize: "1.05rem", color: "#666", lineHeight: 1.7, fontWeight: 300, marginBottom: "1.25rem", fontStyle: "italic" }}>
                {recipe.description}
              </p>

              {/* Joe's intro */}
              <div style={{ padding: "1.1rem 1.4rem", background: "linear-gradient(135deg, #fff8f5, #fff5f0)", border: "1.5px solid rgba(255,77,77,0.18)", borderLeft: "4px solid #ff4d4d", borderRadius: "0.85rem", marginBottom: "1.25rem", display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.5rem", lineHeight: 1, flexShrink: 0 }}>🍖</span>
                <p style={{ fontFamily: SS, fontSize: "0.92rem", color: "#555", lineHeight: 1.7, margin: 0 }}>
                  {recipe.joeIntro}
                </p>
              </div>

              {/* Jump to Recipe */}
              <div style={{ marginBottom: "2rem" }}>
                <button
                  onClick={() => document.getElementById("ingredients-heading")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#111", color: "#fff", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.7rem 1.5rem", borderRadius: "8px", border: "none", cursor: "pointer" }}
                >
                  ↓ Jump to Recipe
                </button>
              </div>

              {/* ── Recipe Overview Card ── */}
              <div style={{ marginBottom: "2rem", background: "#fff", borderRadius: "1rem", border: "1px solid #EAE5DC", overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}>
                  {[
                    { label: "Prep Time", value: `${recipe.prepTimeMinutes} min`, icon: <Clock style={{ width: "1.1rem", height: "1.1rem", color: "#ff4d4d" }} /> },
                    { label: "Cook Time", value: recipe.cookTime, icon: <span style={{ fontSize: "1.1rem" }}>🔥</span> },
                    { label: "Total Time", value: formatTotalTime(recipe.prepTimeMinutes + recipe.cookTimeMinutes), icon: <span style={{ fontSize: "1.1rem" }}>⏱</span> },
                    { label: "Servings", value: recipe.serves, icon: <Users style={{ width: "1.1rem", height: "1.1rem", color: "#ff4d4d" }} /> },
                    { label: "Difficulty", value: recipe.difficulty, icon: <ChefHat style={{ width: "1.1rem", height: "1.1rem", color: DIFF_COLOR[recipe.difficulty] }} />, color: DIFF_COLOR[recipe.difficulty] },
                  ].map((item, i) => (
                    <div key={item.label} style={{ padding: "1.1rem 0.5rem", textAlign: "center", borderLeft: i > 0 ? "1px solid #EAE5DC" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.4rem" }}>{item.icon}</div>
                      <p style={{ fontFamily: SF, fontSize: "1.05rem", fontWeight: 700, color: item.color ?? "#111", margin: "0 0 0.18rem", lineHeight: 1 }}>{item.value}</p>
                      <p style={{ fontFamily: SS, fontSize: "0.58rem", fontWeight: 700, color: "#bbb", letterSpacing: "0.09em", textTransform: "uppercase", margin: 0 }}>{item.label}</p>
                    </div>
                  ))}
                </div>
                {(count > 0 || recipe.saves) && (
                  <div style={{ borderTop: "1px solid #EAE5DC", padding: "0.6rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", background: "#fafaf8" }}>
                    <span style={{ fontFamily: SS, fontSize: "0.75rem", fontWeight: 700, color: "#E60023" }}>📌 {recipe.saves} saves on Pinterest</span>
                    {count > 0 && <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><StarDisplay value={average} size="sm" count={count} /></span>}
                  </div>
                )}
              </div>

              {/* Hero image (mobile) */}
              <div className="block md:hidden" style={{ marginBottom: "2rem", background: "#1a1008", borderRadius: "1.25rem" }}>
                <img
                  src={recipe.imageTall}
                  alt={recipe.imageAlt}
                  fetchPriority="high"
                  decoding="async"
                  style={{ width: "100%", borderRadius: "1.25rem", objectFit: "cover", maxHeight: "420px" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>

              {/* ── Ingredients ── */}
              <section aria-labelledby="ingredients-heading" style={{ marginBottom: "2.5rem" }}>
                <h2 id="ingredients-heading" style={{ fontFamily: SF, fontSize: "2rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em", marginBottom: "1.25rem" }}>
                  Ingredients
                </h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.75rem 1rem", background: "#fff", borderRadius: "0.75rem", border: "1px solid #EAE5DC" }}>
                      <span style={{ flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%", background: "rgba(255,77,77,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "0.05rem" }}>
                        <Check style={{ width: "0.75rem", height: "0.75rem", color: "#ff4d4d" }} />
                      </span>
                      <span style={{ fontSize: "0.9rem", color: "#444", lineHeight: 1.45 }}>{ing}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* ── Instructions ── */}
              <section aria-labelledby="instructions-heading" style={{ marginBottom: "3rem" }}>
                <h2 id="instructions-heading" style={{ fontFamily: SF, fontSize: "2rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em", marginBottom: "1.25rem" }}>
                  Step-by-Step Instructions
                </h2>
                <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {recipe.steps.map((step, i) => (
                    <li key={i} style={{ display: "flex", gap: "1rem", padding: "1.1rem 1.25rem", background: "#fff", borderRadius: "1rem", border: "1px solid #EAE5DC" }}>
                      <span style={{ flexShrink: 0, width: "32px", height: "32px", borderRadius: "50%", background: "#ff4d4d", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SF, fontSize: "1.05rem", fontWeight: 700 }}>
                        {i + 1}
                      </span>
                      <p style={{ fontSize: "0.9rem", color: "#444", lineHeight: 1.6, margin: 0, paddingTop: "0.3rem" }}>{step}</p>
                    </li>
                  ))}
                </ol>
              </section>

              {/* ── Joe's Tips ── */}
              {recipe.tips && recipe.tips.length > 0 && (
                <section aria-labelledby="tips-heading" style={{ marginBottom: "3rem" }}>
                  <h2 id="tips-heading" style={{ fontFamily: SF, fontSize: "2rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em", marginBottom: "1.25rem" }}>
                    Joe's Tips 💡
                  </h2>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {recipe.tips.map((tip, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem", padding: "1rem 1.25rem", background: "linear-gradient(135deg, #fffbeb, #fef9f0)", borderRadius: "0.85rem", border: "1px solid #fde68a" }}>
                        <Lightbulb style={{ flexShrink: 0, width: "1rem", height: "1rem", color: "#d97706", marginTop: "0.15rem" }} />
                        <p style={{ fontSize: "0.88rem", color: "#444", lineHeight: 1.6, margin: 0 }}>{tip}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* ── Common Mistakes ── */}
              {recipe.mistakes && recipe.mistakes.length > 0 && (
                <section aria-labelledby="mistakes-heading" style={{ marginBottom: "3rem" }}>
                  <h2 id="mistakes-heading" style={{ fontFamily: SF, fontSize: "2rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <AlertTriangle style={{ width: "1.3rem", height: "1.3rem", color: "#dc2626", flexShrink: 0 }} />
                    Common Mistakes to Avoid
                  </h2>
                  <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#aaa", marginBottom: "1.1rem" }}>
                    Most failures with this recipe come down to one of these three things.
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                    {recipe.mistakes.map((mistake, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem", padding: "1rem 1.25rem", background: "linear-gradient(135deg, #fff5f5, #fff)", borderRadius: "0.85rem", border: "1px solid rgba(220,38,38,0.18)", borderLeft: "4px solid #dc2626" }}>
                        <span style={{ flexShrink: 0, minWidth: "22px", height: "22px", borderRadius: "50%", background: "#dc2626", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, marginTop: "0.05rem" }}>
                          {i + 1}
                        </span>
                        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.65, margin: 0 }}>{mistake}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* ── Temperature Guide Callout ── */}
              <Link href="/guides/meat-temperatures" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", background: "linear-gradient(135deg, #0f0606, #1f0808)", borderRadius: "0.85rem", marginBottom: "2rem", border: "1px solid rgba(255,77,77,0.25)" }}>
                <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>🌡️</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: SF, fontSize: "1rem", fontWeight: 700, color: "#fff", margin: "0 0 0.15rem", lineHeight: 1.2 }}>
                    Not sure about the right temperature?
                  </p>
                  <p style={{ fontFamily: SS, fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                    See our complete meat temperature guide — all cuts, all doneness levels, USDA safe minimums.
                  </p>
                </div>
                <span style={{ fontFamily: SS, fontSize: "0.72rem", fontWeight: 700, color: "#ff7777", whiteSpace: "nowrap" }}>View Guide →</span>
              </Link>

              {/* ── Written by Juicy Joe ── */}
              <Link href="/author/juicy-joe" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem 1.5rem", background: "#fff", border: "1px solid #EAE5DC", borderRadius: "1rem", marginBottom: "2rem", transition: "border-color 0.15s", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#ff4d4d")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#EAE5DC")}
              >
                <div style={{ flexShrink: 0, width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #ff4d4d, #ff8c00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                  🍖
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: SS, fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", margin: "0 0 0.2rem" }}>Written by</p>
                  <p style={{ fontFamily: SF, fontSize: "1.1rem", fontWeight: 700, color: "#111", margin: "0 0 0.15rem" }}>Juicy Joe</p>
                  <p style={{ fontFamily: SS, fontSize: "0.78rem", color: "#888", margin: 0, lineHeight: 1.4 }}>Recipe developer & food writer — 200+ recipes tested in a real home kitchen. <span style={{ color: "#ff4d4d", fontWeight: 600 }}>View full profile →</span></p>
                </div>
              </Link>

              {/* ── Citations & Sources ── */}
              {recipe.citations && recipe.citations.length > 0 && (
                <section aria-labelledby="citations-heading" style={{ marginBottom: "2rem" }}>
                  <h2 id="citations-heading" style={{ fontFamily: SF, fontSize: "1.4rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em", marginBottom: "0.85rem" }}>
                    Sources & References
                  </h2>
                  <div style={{ background: "#F9F6F1", borderRadius: "0.85rem", padding: "1.25rem", border: "1px solid #EAE5DC" }}>
                    <p style={{ fontFamily: SS, fontSize: "0.78rem", color: "#999", marginBottom: "0.75rem", margin: "0 0 0.75rem" }}>
                      This recipe is informed by the following authoritative sources:
                    </p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                      {recipe.citations.map((cite, i) => (
                        <li key={i}>
                          <a
                            href={cite.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none", color: "inherit" }}
                          >
                            <ExternalLink style={{ width: "0.75rem", height: "0.75rem", color: "#ff4d4d", flexShrink: 0 }} />
                            <span style={{ fontFamily: SS, fontSize: "0.82rem", color: "#555", lineHeight: 1.4 }}>
                              <strong style={{ color: "#333" }}>{cite.source}:</strong>{" "}{cite.title}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* ── FAQ Section ── */}
              {recipe.faq && recipe.faq.length > 0 && (
                <section aria-labelledby="faq-heading" style={{ marginBottom: "2.5rem" }}>
                  <h2 id="faq-heading" style={{ fontFamily: SF, fontSize: "2rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <HelpCircle style={{ width: "1.4rem", height: "1.4rem", color: "#ff4d4d", flexShrink: 0 }} />
                    Frequently Asked Questions
                  </h2>
                  <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#aaa", marginBottom: "1.25rem" }}>
                    Common questions about this recipe, answered.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {recipe.faq.map((item, i) => (
                      <details
                        key={i}
                        style={{ background: "#fff", borderRadius: "0.85rem", border: "1px solid #EAE5DC", overflow: "hidden" }}
                      >
                        <summary style={{ fontFamily: SS, fontSize: "0.92rem", fontWeight: 600, color: "#222", padding: "1rem 1.25rem", cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", userSelect: "none" }}>
                          <span>{item.q}</span>
                          <span style={{ flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%", background: "rgba(255,77,77,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff4d4d", fontSize: "1rem", fontWeight: 700, lineHeight: 1 }}>
                            +
                          </span>
                        </summary>
                        <div style={{ padding: "0 1.25rem 1rem", borderTop: "1px solid #f0ebe2" }}>
                          <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "#555", lineHeight: 1.7, margin: "0.85rem 0 0" }}>
                            {item.a}
                          </p>
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Carnivore Meal Plan CTA (shown for carnivore-tagged recipes) ── */}
              {recipe.tags.some((t) => t.toLowerCase().includes("carnivore")) && (
                <section
                  id="meal-plan-result"
                  aria-label="Generate your custom carnivore meal plan"
                  style={{ marginBottom: "2rem" }}
                >
                  {/* ── CTA header card ── */}
                  <div style={{
                    background: "linear-gradient(135deg, #0d1f0d, #0a1a0a)",
                    border: "1.5px solid rgba(74,222,128,0.25)",
                    borderRadius: "1.25rem",
                    padding: "1.75rem 2rem",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "1.25rem",
                    marginBottom: mealPlan ? "1.25rem" : 0,
                  }}>
                    <div style={{ flex: 1, minWidth: "220px" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "999px", padding: "0.2rem 0.7rem", marginBottom: "0.6rem" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                        <span style={{ fontFamily: SS, fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#4ade80" }}>AI Tool</span>
                      </div>
                      <h3 style={{ fontFamily: SF, fontSize: "1.45rem", fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: "0 0 0.5rem" }}>
                        {mealPlan ? `Your ${mealPlan.days}-Day Carnivore Meal Plan` : "Generate Your Custom Carnivore Meal Plan"}
                      </h3>
                      <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: 0 }}>
                        {mealPlan
                          ? mealPlan.tip
                          : "Our tool builds a personalised 7-day carnivore meal plan using every recipe on the site — breakfast, lunch, and dinner."}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setMealPlanLoading(true);
                        setMealPlan(null);
                        const tools = (window as unknown as Record<string, unknown>)["__webmcp_tools__"] as Record<string, { handler: (a: Record<string, unknown>) => unknown }> | undefined;
                        setTimeout(() => {
                          try {
                            let result: MealPlanResult | null = null;
                            if (tools?.get_carnivore_meal_plan) {
                              result = tools.get_carnivore_meal_plan.handler({ days: 7, preference: "mixed" }) as MealPlanResult;
                            } else {
                              const pick = () => RECIPES[Math.floor(Math.random() * RECIPES.length)].title;
                              result = {
                                days: 7, preference: "mixed",
                                totalProteinFocus: "High — all meals are carnivore/meat-forward",
                                plan: Array.from({ length: 7 }, (_, i) => ({
                                  day: i + 1,
                                  breakfast: { recipe: pick(), note: "Can prep the night before for maximum freshness." },
                                  lunch: { recipe: pick(), note: "Excellent reheated — portion from dinner leftovers." },
                                  dinner: { recipe: pick(), note: "Primary cook. Scales well for meal prep." },
                                })),
                                tip: "Batch cook on Sundays for the week. Ribeye and slow-braised venison shoulder reheat exceptionally well.",
                              };
                            }
                            console.log("[WebMCP] get_carnivore_meal_plan result →", result);
                            window.dispatchEvent(new CustomEvent("webmcp:tool_called", {
                              detail: { ts: new Date().toISOString(), tool: "get_carnivore_meal_plan", layer: "Imperative (JS)", args: { days: 7 }, resultSummary: `${result?.days}-day plan generated` }
                            }));
                            if (result) setMealPlan(result);
                          } finally {
                            setMealPlanLoading(false);
                          }
                        }, 600);
                      }}
                      disabled={mealPlanLoading}
                      style={{
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: mealPlanLoading ? "#166534" : "linear-gradient(135deg, #16a34a, #15803d)",
                        color: "#fff",
                        fontFamily: SS,
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        padding: "0.85rem 1.5rem",
                        borderRadius: "10px",
                        border: "none",
                        cursor: mealPlanLoading ? "default" : "pointer",
                        opacity: mealPlanLoading ? 0.7 : 1,
                        boxShadow: "0 4px 18px rgba(22,163,74,0.4)",
                        whiteSpace: "nowrap",
                        transition: "opacity 0.2s",
                      }}
                      data-testid="button-carnivore-meal-plan-cta"
                    >
                      {mealPlanLoading ? "⏳ Generating…" : mealPlan ? "🔄 Regenerate Plan" : "🥩 Generate Meal Plan"}
                    </button>
                  </div>

                  {/* ── Meal plan result grid ── */}
                  <AnimatePresence>
                    {mealPlan && (
                        <motion.div
                          key="meal-plan-grid"
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.35 }}
                        >
                          {/* Summary bar */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1rem", alignItems: "center" }}>
                            {[
                              { label: "Days", value: String(mealPlan.days) },
                              { label: "Meals", value: String(mealPlan.days * 3) },
                              { label: "Carbs", value: "Zero" },
                              { label: "Focus", value: mealPlan.totalProteinFocus },
                            ].map((s) => (
                              <div key={s.label} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "999px", padding: "0.25rem 0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <span style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}:</span>
                                <span style={{ fontFamily: SS, fontSize: "0.7rem", color: "#166534" }}>{s.value}</span>
                              </div>
                            ))}
                            {emailUnlocked && (
                              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.3rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "999px", padding: "0.25rem 0.75rem" }}>
                                <CheckCircle style={{ width: "0.7rem", height: "0.7rem", color: "#16a34a" }} />
                                <span style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 700, color: "#16a34a", letterSpacing: "0.06em" }}>FULL PLAN UNLOCKED</span>
                              </div>
                            )}
                          </div>

                          {/* Day cards */}
                          <div id="meal-plan-print-area" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {mealPlan.plan.map((day, idx) => {
                              const isLocked = !emailUnlocked && idx >= MEAL_PLAN_LOCKED_FROM;
                              return (
                                <motion.div
                                  key={day.day}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.04, duration: 0.28 }}
                                  style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", overflow: "hidden", position: "relative" }}
                                >
                                  {/* Day header */}
                                  <div style={{ background: isLocked ? "#1a1a1a" : "linear-gradient(90deg, #14532d, #166534)", padding: "0.6rem 1.25rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                    {isLocked
                                      ? <Lock style={{ width: "0.75rem", height: "0.75rem", color: "#555" }} />
                                      : <span style={{ fontSize: "0.7rem" }}>✅</span>
                                    }
                                    <span style={{ fontFamily: SF, fontSize: "0.95rem", fontWeight: 700, color: isLocked ? "#555" : "#fff" }}>
                                      Day {day.day}
                                    </span>
                                    <span style={{ fontFamily: SS, fontSize: "0.6rem", color: isLocked ? "#444" : "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                      — {MEAL_PLAN_WEEKDAYS[(day.day - 1) % 7]}
                                    </span>
                                    {isLocked && (
                                      <span style={{ marginLeft: "auto", fontFamily: SS, fontSize: "0.58rem", fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>🔒 LOCKED</span>
                                    )}
                                  </div>

                                  {/* Meal cells */}
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", filter: isLocked ? "blur(6px)" : "none", userSelect: isLocked ? "none" : "auto" }}>
                                    {(["breakfast", "lunch", "dinner"] as const).map((meal, mi) => {
                                      const icons = ["🍳", "🥗", "🥩"];
                                      const labels = ["Breakfast", "Lunch", "Dinner"];
                                      const bg = ["#f0fdf4", "#f9fafb", "#fff8f5"];
                                      const accent = ["#16a34a", "#6b7280", "#ea580c"];
                                      const isHighProtein = meal === "dinner";
                                      const m = day[meal];
                                      return (
                                        <div key={meal} style={{ padding: "0.85rem 1rem", borderLeft: mi > 0 ? "1px solid #f3f4f6" : "none", background: bg[mi] }}>
                                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                              <span style={{ fontSize: "0.85rem" }}>{icons[mi]}</span>
                                              <span style={{ fontFamily: SS, fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: accent[mi] }}>{labels[mi]}</span>
                                            </div>
                                            {isHighProtein && (
                                              <span style={{ fontFamily: SS, fontSize: "0.5rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", background: "#fef3c7", color: "#92400e", padding: "0.1rem 0.4rem", borderRadius: "999px", border: "1px solid #fde68a", whiteSpace: "nowrap" }}>
                                                HIGH PROTEIN
                                              </span>
                                            )}
                                          </div>
                                          <p style={{ fontFamily: SF, fontSize: "0.88rem", fontWeight: 600, color: "#111", lineHeight: 1.3, margin: "0 0 0.25rem" }}>
                                            {m.recipe}
                                          </p>
                                          <p style={{ fontFamily: SS, fontSize: "0.65rem", color: "#9ca3af", lineHeight: 1.5, margin: 0 }}>
                                            {m.note}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Email gate overlay on day 3 (first locked card) */}
                                  {isLocked && idx === MEAL_PLAN_LOCKED_FROM && (
                                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(249,246,241,0.93)", backdropFilter: "blur(2px)", padding: "1.25rem" }}>
                                      <div style={{ textAlign: "center", maxWidth: "380px" }}>
                                        <Unlock style={{ width: "1.75rem", height: "1.75rem", color: "#16a34a", margin: "0 auto 0.6rem" }} />
                                        <p style={{ fontFamily: SF, fontSize: "1.1rem", fontWeight: 700, color: "#111", margin: "0 0 0.3rem" }}>
                                          Unlock Days 3–7 Free
                                        </p>
                                        <p style={{ fontFamily: SS, fontSize: "0.75rem", color: "#777", margin: "0 0 0.9rem", lineHeight: 1.5 }}>
                                          Enter your email to access the full plan + Juicy Joe's weekly carnivore tips.
                                        </p>
                                        <form
                                          onSubmit={(e) => {
                                            e.preventDefault();
                                            if (!emailInput.trim()) return;
                                            localStorage.setItem("mlh:meal-plan-unlocked", emailInput.trim());
                                            setEmailUnlocked(true);
                                          }}
                                          style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", justifyContent: "center" }}
                                        >
                                          <input
                                            type="email" required
                                            placeholder="your@email.com"
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                            style={{ flex: 1, minWidth: "180px", padding: "0.65rem 0.9rem", fontFamily: SS, fontSize: "0.8rem", border: "1.5px solid #d1d5db", borderRadius: "8px", background: "#fff", outline: "none" }}
                                          />
                                          <button type="submit" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", fontFamily: SS, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.65rem 1.2rem", borderRadius: "8px", border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(22,163,74,0.35)", whiteSpace: "nowrap" }}>
                                            <Unlock style={{ width: "0.65rem", height: "0.65rem" }} />
                                            Unlock Free
                                          </button>
                                        </form>
                                        <p style={{ fontFamily: SS, fontSize: "0.6rem", color: "#bbb", marginTop: "0.5rem" }}>
                                          No spam. Unsubscribe anytime.
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Blur cover for days 4-7 */}
                                  {isLocked && idx > MEAL_PLAN_LOCKED_FROM && (
                                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(249,246,241,0.75)" }}>
                                      <Lock style={{ width: "1.25rem", height: "1.25rem", color: "#ccc" }} />
                                    </div>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Locked nudge banner */}
                          {!emailUnlocked && (
                            <div style={{ marginTop: "0.85rem", padding: "0.85rem 1.25rem", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1px solid #bbf7d0", borderRadius: "0.85rem", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                              <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "#166534", margin: 0 }}>
                                <strong>Days 3–7 locked.</strong> Enter your email on Day 3 above to unlock the full plan free.
                              </p>
                              <Link href="/carnivore-meal-plan" style={{ fontFamily: SS, fontSize: "0.72rem", fontWeight: 700, color: "#16a34a", textDecoration: "none", whiteSpace: "nowrap" }}>
                                Full generator page →
                              </Link>
                            </div>
                          )}

                          {/* Joe's tip */}
                          {emailUnlocked && (
                            <div style={{ marginTop: "1rem", padding: "0.9rem 1.25rem", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderRadius: "0.85rem", border: "1px solid #bbf7d0", display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
                              <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "0.05rem" }}>💡</span>
                              <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "#166534", lineHeight: 1.6, margin: 0 }}>
                                <strong>Joe's meal prep tip:</strong> {mealPlan.tip}
                              </p>
                            </div>
                          )}

                          {/* Action row */}
                          <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.6rem", alignItems: "center" }}>
                            <button
                              onClick={() => {
                                if (!mealPlan) return;
                                localStorage.setItem("mlh:saved-meal-plan", JSON.stringify(mealPlan));
                                setPlanSaved(true);
                                setTimeout(() => setPlanSaved(false), 3000);
                              }}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                background: planSaved ? "#f0fdf4" : "#fff",
                                border: `1.5px solid ${planSaved ? "#bbf7d0" : "#d1d5db"}`,
                                color: planSaved ? "#16a34a" : "#333",
                                fontFamily: SS, fontSize: "0.72rem", fontWeight: 600,
                                padding: "0.65rem 1.1rem", borderRadius: "8px", cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              data-testid="button-save-meal-plan"
                            >
                              {planSaved ? <CheckCircle style={{ width: "0.75rem", height: "0.75rem" }} /> : <Save style={{ width: "0.75rem", height: "0.75rem" }} />}
                              {planSaved ? "Saved!" : "Save Plan"}
                            </button>
                            <button
                              onClick={() => { document.body.classList.add("printing-meal-plan"); window.print(); document.body.classList.remove("printing-meal-plan"); }}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                background: "#fff", border: "1.5px solid #d1d5db",
                                color: "#333", fontFamily: SS, fontSize: "0.72rem", fontWeight: 600,
                                padding: "0.65rem 1.1rem", borderRadius: "8px", cursor: "pointer",
                              }}
                              data-testid="button-download-pdf"
                            >
                              <Download style={{ width: "0.75rem", height: "0.75rem" }} />
                              Download PDF
                            </button>
                            <Link
                              href="/carnivore-meal-plan"
                              style={{
                                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                background: "#fff", border: "1.5px solid #d1d5db",
                                color: "#333", fontFamily: SS, fontSize: "0.72rem", fontWeight: 600,
                                padding: "0.65rem 1.1rem", borderRadius: "8px", textDecoration: "none",
                              }}
                            >
                              🥩 Full Meal Plan Page →
                            </Link>
                          </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              )}

              {/* ── Pinterest CTA ── */}
              <div style={{ padding: "2rem", background: "linear-gradient(135deg, #fff5f5, #fff)", border: "1.5px solid rgba(230,0,35,0.15)", borderRadius: "1.25rem", marginBottom: "3rem", textAlign: "center" }}>
                <p style={{ fontFamily: SF, fontSize: "1.5rem", fontWeight: 600, color: "#111", marginBottom: "0.4rem" }}>
                  Loved by {recipe.saves} food lovers
                </p>
                <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#888", marginBottom: "1.25rem" }}>
                  Save this recipe to your Pinterest board so you never lose it!
                </p>
                <PinterestButton url={pageUrl} image={recipe.imageTall} description={recipe.pinTitle} variant="full" />
              </div>

              {/* ── Ratings & Reviews ── */}
              <ReviewSection recipeId={recipe.id} />
            </article>

            {/* Right: sticky image column (desktop) */}
            <aside className="hidden md:block">
              <div style={{ position: "sticky", top: "90px" }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ borderRadius: "1.25rem", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.12)", position: "relative" }}
                >
                  <img
                    src={recipe.imageTall}
                    alt={recipe.imageAlt}
                    fetchPriority="high"
                    decoding="async"
                    style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)" }} />
                  <div style={{ position: "absolute", bottom: "1.25rem", left: "1.25rem", right: "1.25rem" }}>
                    <p style={{ fontFamily: SF, fontSize: "1.1rem", fontWeight: 600, color: "#fff", lineHeight: 1.2, marginBottom: "0.75rem" }}>
                      {recipe.pinTitle}
                    </p>
                    <PinterestButton url={pageUrl} image={recipe.imageTall} description={recipe.pinTitle} variant="pill" />
                  </div>
                </motion.div>

                {/* Social proof */}
                <div style={{ marginTop: "1.25rem", padding: "1rem 1.25rem", background: "#fff", borderRadius: "1rem", border: "1px solid #EAE5DC", textAlign: "center" }}>
                  <p style={{ fontFamily: SF, fontSize: "1.6rem", fontWeight: 700, color: "#E60023", marginBottom: "0.1rem" }}>{recipe.saves}</p>
                  <p style={{ fontFamily: SS, fontSize: "0.75rem", color: "#888", letterSpacing: "0.04em" }}>SAVES ON PINTEREST</p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <RelatedRecipes currentId={id ?? ""} category={recipe.category} />

        {/* ── Footer ── */}
        <footer style={{ background: "#0A0A0A", color: "#666", padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <p style={{ fontFamily: SF, fontSize: "1.2rem", fontWeight: 600, color: "#f5f2ee", marginBottom: "0.5rem" }}>Meat Lovers Hub</p>
          <p style={{ fontFamily: SS, fontSize: "0.78rem" }}>© {new Date().getFullYear()} Meat Lovers Hub. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
