import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SeoMeta } from "@/components/SeoMeta";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { SITE_URL } from "@/lib/siteUrl";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

/* ── Guide definitions ───────────────────────────────────────────────────── */
const GUIDES = [
  {
    title: "Ultimate Meat Temperature Guide",
    description: "Every cut, every doneness level, every meat type — with USDA-cited temperatures and a handy quick-reference table. The only guide you need before you cook anything.",
    badge: "Essential",
    badgeColor: "#B91C1C",
    icon: "🌡️",
    href: "/guides/meat-temperatures",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=450&fit=crop&q=80",
    meta: "12 min read",
    available: true,
  },
  {
    title: "Carnivore Diet Meal Plan — Full Week",
    description: "7 days of carnivore meals, tested by Joe. Breakfast, lunch, dinner — all meat, zero guesswork. Includes a printable PDF and email-unlock for the full plan.",
    badge: "Most Popular",
    badgeColor: "#166534",
    icon: "🥩",
    href: "/carnivore-meal-plan",
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=450&fit=crop&q=80",
    meta: "Free plan",
    available: true,
  },
  {
    title: "Reverse Searing Masterclass",
    description: "Why reverse sear beats the traditional sear-first method for thick steaks. The science, the technique, and Joe's exact step-by-step process — with photos.",
    badge: "Technique",
    badgeColor: "#7C3AED",
    icon: "⚡",
    href: "/recipes/reverse-sear-ribeye",
    image: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=800&h=450&fit=crop&q=80",
    meta: "Recipe + guide",
    available: true,
  },
  {
    title: "All Cooking Resources & References",
    description: "The full collection of guides, external references (USDA, Serious Eats, AmazingRibs), temperature charts, and category pillar guides.",
    badge: "Hub",
    badgeColor: "#B45309",
    icon: "📚",
    href: "/resources",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=450&fit=crop&q=80",
    meta: "Collection",
    available: true,
  },
  {
    title: "BBQ Wood Flavor Guide: Hickory, Cherry, Oak & Every Smoking Wood",
    description: "Flavor profiles, intensity ratings, and exact meat pairings for 8 smoking woods — hickory, cherry, post oak, mesquite, pecan, apple, alder, and maple. Plus chips vs chunks and blue smoke vs white smoke explained.",
    badge: "Technique",
    badgeColor: "#B45309",
    icon: "🔥",
    href: "/bbq-wood-flavor-guide",
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=450&fit=crop&q=80",
    meta: "~12 min read",
    available: true,
  },
  {
    title: "Butchery Knife Skills: How to French a Rack of Lamb",
    description: "Learn to French a rack of lamb at home — expose the bones cleanly, remove silver skin, and trim the fat cap to the right depth. Covers the right knives, 7-step process, and safety tips.",
    badge: "Technique",
    badgeColor: "#7C3AED",
    icon: "🔪",
    href: "/guides/butchery-knife-skills-frenching",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=450&fit=crop&q=80",
    meta: "~15 min read",
    available: true,
  },
  {
    title: "Complete BBQ Smoking Guide",
    description: "Wood selection, temperature control, stall management, bark formation — everything you need to master your smoker from the very first cook.",
    badge: "Coming Soon",
    badgeColor: "#888",
    icon: "🔥",
    href: "/guides/bbq-smoking",
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=450&fit=crop&q=80",
    meta: "~15 min read",
    available: false,
  },
  {
    title: "Meat Cuts Explained",
    description: "Primal cuts, sub-cuts, grain direction, marbling grades — a visual guide to understanding exactly what you're buying and how each cut should be cooked.",
    badge: "Coming Soon",
    badgeColor: "#888",
    icon: "🗡️",
    href: "/guides/meat-cuts",
    image: "https://images.unsplash.com/photo-1615937722923-67f6deaf2cc9?w=800&h=450&fit=crop&q=80",
    meta: "~10 min read",
    available: false,
  },
] as const;

type Guide = (typeof GUIDES)[number];

/* ════════════════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════════════════ */
export function GuidesPage() {
  const pageUrl = `${SITE_URL}/guides`;

  return (
    <>
      <SeoMeta
        title="BBQ & Meat Cooking Guides — Juicy Joe's Complete Library"
        description="Step-by-step cooking guides for BBQ, steak, and meat by Juicy Joe. Temperature charts, smoking guides, carnivore meal plans, reverse sear tutorials — all tested."
        image="https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=630&fit=crop&q=85"
        url={pageUrl}
        type="website"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: "Guides", url: pageUrl },
        ]}
      />

      <div style={{ background: "#F9F6F1", minHeight: "100vh", fontFamily: SS, display: "flex", flexDirection: "column" }}>
        <SiteHeader activeNav="/guides" />

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "linear-gradient(155deg, #0e0404 0%, #1b0909 55%, #0c0202 100%)",
            padding: "5rem 1.5rem 4.5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Dot-grid texture */}
          <div
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.016) 1px, transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }}
          />
          {/* Ember glow */}
          <div
            aria-hidden="true"
            style={{ position: "absolute", top: "40%", left: "18%", width: "480px", height: "480px", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(176,28,28,0.13) 0%, transparent 70%)", transform: "translateY(-50%)", pointerEvents: "none" }}
          />

          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>

            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" style={{ marginBottom: "1.5rem" }}>
              <ol style={{ display: "flex", gap: "0.4rem", listStyle: "none", padding: 0, margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", flexWrap: "wrap" }}>
                <li><Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Home</Link></li>
                <li>/</li>
                <li style={{ color: "rgba(255,255,255,0.7)" }}>Guides</li>
              </ol>
            </nav>

            {/* Label */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "1.25rem" }}>
              <div style={{ width: "26px", height: "26px", background: "#CC2222", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", flexShrink: 0 }} aria-hidden="true">
                📖
              </div>
              <span style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.17em", textTransform: "uppercase", color: "rgba(255,120,120,0.88)" }}>
                Joe's Complete Library
              </span>
            </div>

            <h1 style={{ fontFamily: SF, fontSize: "clamp(2.8rem, 6vw, 4.6rem)", fontWeight: 300, color: "#fff", lineHeight: 1.0, letterSpacing: "-0.035em", marginBottom: "1.1rem" }}>
              Cooking Guides &amp; <em>Deep Dives</em>
            </h1>

            <p style={{ fontFamily: SS, fontSize: "0.93rem", color: "rgba(255,255,255,0.48)", maxWidth: "510px", lineHeight: 1.78, fontWeight: 300, marginBottom: "2.2rem" }}>
              Long-form, evergreen guides on temperatures, techniques, and tools — all tested by Joe. Real knowledge, no filler.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link
                href="/guides/meat-temperatures"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#CC2222", color: "#fff", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.85rem 1.5rem", borderRadius: "8px", textDecoration: "none", boxShadow: "0 4px 22px rgba(180,30,30,0.42)" }}
              >
                🌡️ Temperature Guide <ArrowRight style={{ width: "0.78rem", height: "0.78rem" }} />
              </Link>
              <Link
                href="/carnivore-meal-plan"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.82)", fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, padding: "0.85rem 1.5rem", borderRadius: "8px", textDecoration: "none" }}
              >
                🥩 Meal Plan
              </Link>
            </div>
          </div>
        </div>

        {/* ── Guides grid ───────────────────────────────────────────────── */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 1.5rem 2rem", width: "100%", boxSizing: "border-box" }}>

          <h2 style={{ fontFamily: SF, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 400, color: "#111", letterSpacing: "-0.025em", marginBottom: "0.4rem" }}>
            All Guides
          </h2>
          <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "#888", marginBottom: "2.25rem" }}>
            {GUIDES.filter(g => g.available).length} guides available &mdash; {GUIDES.filter(g => !g.available).length} more in progress
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: "1.5rem" }}>
            {GUIDES.map((guide, i) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.42, delay: i * 0.07 }}
              >
                {guide.available ? (
                  <Link href={guide.href} style={{ display: "block", textDecoration: "none", height: "100%" }}>
                    <GuideCard guide={guide} />
                  </Link>
                ) : (
                  <GuideCard guide={guide} comingSoon />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Internal link band ─────────────────────────────────────────── */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem 5rem", width: "100%", boxSizing: "border-box" }}>
          <div
            style={{ marginTop: "3rem", padding: "2.5rem 2.25rem", background: "#111", borderRadius: "1.25rem", display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", justifyContent: "space-between" }}
          >
            <div>
              <p style={{ fontFamily: SF, fontSize: "clamp(1.4rem, 3vw, 1.8rem)", fontWeight: 500, color: "#fff", letterSpacing: "-0.025em", marginBottom: "0.4rem", lineHeight: 1.2 }}>
                Ready to cook? <em>Start with a recipe.</em>
              </p>
              <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>
                17+ tested recipes — weeknight quick meals to weekend showstoppers.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", flexShrink: 0 }}>
              <Link
                href="/recipes"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "#CC2222", color: "#fff", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.85rem 1.5rem", borderRadius: "8px", textDecoration: "none", boxShadow: "0 4px 18px rgba(180,30,30,0.35)", whiteSpace: "nowrap" }}
              >
                Browse Recipes <ArrowRight style={{ width: "0.78rem", height: "0.78rem" }} />
              </Link>
              <Link
                href="/blog"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)", fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, padding: "0.85rem 1.5rem", borderRadius: "8px", textDecoration: "none", whiteSpace: "nowrap" }}
              >
                Read the Blog
              </Link>
            </div>
          </div>
        </div>

        <SiteFooter />
      </div>
    </>
  );
}

/* ── Guide card ──────────────────────────────────────────────────────────── */
function GuideCard({ guide, comingSoon }: { guide: Guide; comingSoon?: boolean }) {
  return (
    <motion.div
      whileHover={comingSoon ? {} : { y: -5, boxShadow: "0 14px 42px rgba(0,0,0,0.13)" }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        border: "1px solid #EAE5DC",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        opacity: comingSoon ? 0.68 : 1,
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", flexShrink: 0 }}>
        <motion.img
          src={guide.image}
          alt={guide.title}
          loading="lazy"
          decoding="async"
          whileHover={comingSoon ? {} : { scale: 1.05 }}
          transition={{ duration: 0.4 }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.52) 0%, transparent 55%)" }} />
        <div
          style={{
            position: "absolute", top: "0.75rem", left: "0.75rem",
            background: `${guide.badgeColor}dd`,
            borderRadius: "5px", padding: "0.2rem 0.65rem",
            fontFamily: SS, fontSize: "0.58rem", fontWeight: 800,
            color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase",
          }}
        >
          {guide.badge}
        </div>
        {comingSoon && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: SS, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", background: "rgba(0,0,0,0.55)", padding: "0.4rem 0.9rem", borderRadius: "6px" }}>
              Coming Soon
            </span>
          </div>
        )}
        <div style={{ position: "absolute", bottom: "0.75rem", right: "0.85rem", fontFamily: SS, fontSize: "0.63rem", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
          {guide.meta}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: "1.3rem", marginBottom: "0.45rem", lineHeight: 1 }} aria-hidden="true">{guide.icon}</div>
        <h2 style={{ fontFamily: SF, fontSize: "1.2rem", fontWeight: 700, color: "#111", lineHeight: 1.25, letterSpacing: "-0.01em", marginBottom: "0.55rem" }}>
          {guide.title}
        </h2>
        <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "#888", lineHeight: 1.65, flex: 1, marginBottom: comingSoon ? 0 : "1rem" }}>
          {guide.description}
        </p>
        {!comingSoon && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, color: guide.badgeColor }}>
            Read Guide <ArrowRight style={{ width: "0.7rem", height: "0.7rem" }} />
          </span>
        )}
      </div>
    </motion.div>
  );
}
