import { Link } from "wouter";
import { motion } from "framer-motion";
import { Thermometer, BookOpen, ExternalLink, ArrowRight } from "lucide-react";
import { SeoMeta } from "@/components/SeoMeta";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { CATEGORIES, CATEGORY_SEO, getCategorySlug } from "@/data/recipes";
import { SITE_URL } from "@/lib/siteUrl";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

const EXTERNAL_RESOURCES = [
  {
    title: "USDA Safe Minimum Internal Temperature Chart",
    description: "The official USDA food safety temperature reference for all meat, poultry, and seafood.",
    url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart",
    source: "USDA FSIS",
    color: "#16a34a",
  },
  {
    title: "The Food Lab: Science of the Perfect Steak",
    description: "J. Kenji López-Alt's definitive guide to the science behind pan-searing steak. Required reading.",
    url: "https://www.seriouseats.com/the-food-lab-complete-guide-to-pan-seared-steaks",
    source: "Serious Eats",
    color: "#ea580c",
  },
  {
    title: "AmazingRibs.com — BBQ & Grilling Science",
    description: "The most comprehensive BBQ science resource on the internet. Meathead Goldwyn's work on smoke rings, bark, and temperature is unmatched.",
    url: "https://amazingribs.com",
    source: "AmazingRibs.com",
    color: "#b91c1c",
  },
  {
    title: "Collagen and Gelatin — Why Low-and-Slow Works",
    description: "The science behind why tough cuts become tender at low temperatures over time.",
    url: "https://amazingribs.com/more-technique-and-science/more-cooking-science/collagen-and-gelatin/",
    source: "AmazingRibs.com",
    color: "#9333ea",
  },
];

export function ResourcesPage() {
  const pageUrl = `${SITE_URL}${window.location.pathname}`;

  return (
    <>
      <SeoMeta
        title="Cooking Guides & Resources — Meat Lovers Hub"
        description="Reference guides, temperature charts, and trusted external resources for home meat cooking. Everything you need to cook beef, chicken, pork, and lamb perfectly."
        image="https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=630&fit=crop&q=85"
        imageAlt="Collection of cooking guides and resources for meat lovers"
        url={pageUrl}
        type="website"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: "Guides & Resources", url: pageUrl },
        ]}
      />

      <div style={{ background: "#F9F6F1", minHeight: "100vh", fontFamily: SS }}>
        <SiteHeader activeNav="/resources" />

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 1.5rem" }}>

          {/* Page heading */}
          <nav aria-label="breadcrumb" style={{ marginBottom: "1.5rem" }}>
            <ol style={{ display: "flex", gap: "0.4rem", listStyle: "none", padding: 0, margin: 0, fontSize: "0.75rem", color: "#aaa" }}>
              <li><Link href="/" style={{ color: "#aaa", textDecoration: "none" }}>Home</Link></li>
              <li>/</li>
              <li style={{ color: "#555" }}>Guides & Resources</li>
            </ol>
          </nav>

          <h1 style={{ fontFamily: SF, fontSize: "clamp(2.5rem, 5vw, 3.8rem)", fontWeight: 600, color: "#111", letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
            Cooking Guides & Resources
          </h1>
          <p style={{ fontFamily: SS, fontSize: "0.95rem", color: "#777", maxWidth: "560px", lineHeight: 1.7, marginBottom: "3rem" }}>
            Reference tools, temperature charts, and trusted external resources. Everything you need to cook meat with confidence.
          </p>

          {/* ── Primary Guides (internal) ── */}
          <section aria-labelledby="guides-heading" style={{ marginBottom: "4rem" }}>
            <h2 id="guides-heading" style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BookOpen style={{ width: "1rem", height: "1rem", color: "#ff4d4d" }} />
              Reference Guides
            </h2>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link href="/guides/meat-temperatures" style={{ textDecoration: "none", display: "block" }}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 16px 48px rgba(0,0,0,0.12)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{ background: "linear-gradient(135deg, #111 0%, #1f0a0a 100%)", borderRadius: "1.25rem", padding: "2.5rem", display: "flex", alignItems: "flex-start", gap: "1.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
                >
                  <div style={{ width: "52px", height: "52px", background: "rgba(255,77,77,0.18)", border: "1px solid rgba(255,77,77,0.35)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Thermometer style={{ width: "1.4rem", height: "1.4rem", color: "#ff7777" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff9090", background: "rgba(255,77,77,0.15)", border: "1px solid rgba(255,77,77,0.3)", padding: "0.2rem 0.6rem", borderRadius: "4px" }}>
                        Essential Reference
                      </span>
                    </div>
                    <h3 style={{ fontFamily: SF, fontSize: "1.6rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
                      Meat Cooking Temperature Guide
                    </h3>
                    <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, marginBottom: "1.25rem", maxWidth: "480px" }}>
                      Complete temperature chart for beef (all doneness levels), chicken, pork, and lamb — USDA safe minimums alongside chef-recommended targets. Includes carry-over cooking, thermometer tips, and a full FAQ.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      {["Beef", "Chicken", "Pork", "Lamb", "Ground Meats"].map((t) => (
                        <span key={t} style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.07)", padding: "0.2rem 0.6rem", borderRadius: "4px" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: SS, fontSize: "0.8rem", fontWeight: 700, color: "#ff7777", whiteSpace: "nowrap", alignSelf: "center" }}>
                    Read Guide <ArrowRight style={{ width: "0.8rem", height: "0.8rem" }} />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </section>

          {/* ── Pillar pages (category guides) ── */}
          <section aria-labelledby="category-guides-heading" style={{ marginBottom: "4rem" }}>
            <h2 id="category-guides-heading" style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BookOpen style={{ width: "1rem", height: "1rem", color: "#ff4d4d" }} />
              Complete Cooking Guides
            </h2>
            <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#aaa", marginBottom: "1.5rem" }}>
              Each guide covers the techniques, science, and recipes for one meat type.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {CATEGORIES.map((cat) => {
                const seo = CATEGORY_SEO[cat];
                const slug = getCategorySlug(cat);
                return (
                  <Link key={cat} href={`/recipes/category/${slug}`} style={{ textDecoration: "none" }}>
                    <motion.div
                      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #EAE5DC", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                    >
                      <div style={{ position: "relative", height: "120px", overflow: "hidden", background: "#1a1008" }}>
                        <img src={seo.heroImage} alt={`${cat} cooking guide`} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5)" }} />
                        <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", background: "rgba(0,0,0,0.5)", borderRadius: "4px", padding: "0.2rem 0.6rem" }}>
                          <span style={{ fontFamily: SS, fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>Complete Guide</span>
                        </div>
                      </div>
                      <div style={{ padding: "1.1rem 1.25rem" }}>
                        <h3 style={{ fontFamily: SF, fontSize: "1.2rem", fontWeight: 700, color: "#111", marginBottom: "0.4rem" }}>
                          The Complete {cat} Guide
                        </h3>
                        <p style={{ fontFamily: SS, fontSize: "0.78rem", color: "#888", lineHeight: 1.55, marginBottom: "0.75rem" }}>
                          {seo.pillarSubtopics[0]?.title} · {seo.pillarSubtopics[1]?.title}
                        </p>
                        <span style={{ fontFamily: SS, fontSize: "0.75rem", fontWeight: 700, color: "#ff4d4d" }}>
                          Browse Guide →
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ── External Resources ── */}
          <section aria-labelledby="external-resources-heading" style={{ marginBottom: "3rem" }}>
            <h2 id="external-resources-heading" style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ExternalLink style={{ width: "1rem", height: "1rem", color: "#ff4d4d" }} />
              Trusted External Resources
            </h2>
            <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#aaa", marginBottom: "1.5rem" }}>
              The sources we cite and trust for food safety and cooking science.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {EXTERNAL_RESOURCES.map((res) => (
                <a key={res.url} href={res.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{ background: "#fff", borderRadius: "0.85rem", padding: "1.1rem 1.4rem", border: "1px solid #EAE5DC", borderLeft: `3px solid ${res.color}`, display: "flex", alignItems: "center", gap: "1rem" }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: SF, fontSize: "1.05rem", fontWeight: 700, color: "#111", marginBottom: "0.2rem" }}>{res.title}</p>
                      <p style={{ fontFamily: SS, fontSize: "0.78rem", color: "#888", lineHeight: 1.5, margin: 0 }}>{res.description}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.3rem", flexShrink: 0 }}>
                      <span style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 700, color: res.color, background: `${res.color}14`, padding: "0.15rem 0.5rem", borderRadius: "4px", letterSpacing: "0.06em" }}>{res.source}</span>
                      <ExternalLink style={{ width: "0.75rem", height: "0.75rem", color: "#ccc" }} />
                    </div>
                  </motion.div>
                </a>
              ))}
            </div>
          </section>
        </div>

        <SiteFooter />
      </div>
    </>
  );
}
