import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Thermometer, ChevronDown, ExternalLink, Check, ArrowRight } from "lucide-react";
import { SeoMeta } from "@/components/SeoMeta";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { SITE_URL } from "@/lib/siteUrl";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

interface TempRow {
  doneness: string;
  fahrenheit: string;
  celsius: string;
  description: string;
  usda?: string;
  color: string;
}

interface MeatSection {
  meat: string;
  emoji: string;
  color: string;
  intro: string;
  rows: TempRow[];
  proTip: string;
  recipes?: { title: string; href: string }[];
}

const SECTIONS: MeatSection[] = [
  {
    meat: "Beef (Steaks & Roasts)",
    emoji: "🥩",
    color: "#b91c1c",
    intro: "Whole muscle beef cuts (ribeye, sirloin, strip, tenderloin) can be served at a range of temperatures. The USDA's safe minimum is 145°F with a 3-minute rest — but medium-rare at 130–135°F is widely accepted for whole intact cuts where the exterior heat kills surface bacteria.",
    rows: [
      { doneness: "Rare", fahrenheit: "120–125°F", celsius: "49–52°C", description: "Deep red center, cool to the touch internally. Very soft and buttery texture.", color: "#dc2626" },
      { doneness: "Medium-Rare", fahrenheit: "130–135°F", celsius: "54–57°C", description: "Pink throughout, warm center. The gold standard for ribeye and strip steak — maximum juiciness.", color: "#ea580c", usda: "Chef's preferred; USDA minimum is 145°F for whole cuts" },
      { doneness: "Medium", fahrenheit: "140–145°F", celsius: "60–63°C", description: "Pink center fading to grey-brown edges. Slightly less juicy but still tender.", color: "#d97706" },
      { doneness: "Medium-Well", fahrenheit: "150–155°F", celsius: "66–68°C", description: "Slightly pink in the very center only. Noticeably drier and firmer.", color: "#ca8a04" },
      { doneness: "Well Done", fahrenheit: "160°F+", celsius: "71°C+", description: "No pink at all. Fully cooked through. Very firm texture; juices largely cooked out.", color: "#65a30d" },
    ],
    proTip: "Pull the steak 5°F before your target — carry-over cooking during the 5-minute rest will bring it exactly to temperature. A $15 instant-read thermometer is the single best kitchen investment you can make.",
    recipes: [
      { title: "Garlic Butter Ribeye Steak", href: "/recipes/juicy-steak" },
    ],
  },
  {
    meat: "Ground Beef (Burgers)",
    emoji: "🍔",
    color: "#b91c1c",
    intro: "Ground beef is fundamentally different from whole cuts. The grinding process distributes any surface bacteria throughout the meat. The USDA's 160°F minimum is non-negotiable for food safety — there is no safe medium-rare burger made from standard ground beef.",
    rows: [
      { doneness: "Safe (USDA Minimum)", fahrenheit: "160°F", celsius: "71°C", description: "Fully cooked through with no pink. This is the only temperature to target for ground beef. At 160°F a good 80/20 burger is still juicy.", color: "#16a34a", usda: "USDA minimum — required for food safety" },
    ],
    proTip: "If you want a juicy burger at 160°F, use 80/20 ground beef (never leaner), salt only at the last minute, and press a thumbprint dimple into the center. Lean beef at 160°F will be dry regardless of technique.",
    recipes: [
      { title: "The Perfect Smash Burger", href: "/recipes/smash-burger" },
      { title: "BBQ Bacon Cheeseburger", href: "/recipes/bbq-bacon-cheeseburger" },
    ],
  },
  {
    meat: "Chicken & Poultry",
    emoji: "🍗",
    color: "#d97706",
    intro: "Poultry must always reach 165°F (74°C) internal temperature — this applies to breasts, thighs, whole birds, and ground chicken alike. The good news: chicken thighs are actually better at 175–185°F where the collagen fully breaks down.",
    rows: [
      { doneness: "Safe Minimum (Breasts)", fahrenheit: "165°F", celsius: "74°C", description: "Fully cooked, white throughout, juices run clear. The target for chicken breasts — don't go higher or they'll dry out.", color: "#16a34a", usda: "USDA minimum — required for all poultry" },
      { doneness: "Optimal (Thighs)", fahrenheit: "175–185°F", celsius: "79–85°C", description: "Thighs become more tender as temperature rises — the collagen converts to gelatin. At 175°F+ the texture is far superior to exactly 165°F.", color: "#16a34a", usda: "USDA minimum 165°F; higher = better for thighs" },
    ],
    proTip: "Thighs and breasts cook differently. If cooking a whole bird, the thighs will reach 175°F before the breast hits 165°F in most cases. If cooking a split bird, consider separating thighs and breasts and cooking them differently.",
    recipes: [
      { title: "Herb-Grilled Chicken Breasts", href: "/recipes/grilled-chicken" },
      { title: "Honey Garlic Chicken Thighs", href: "/recipes/honey-garlic-chicken-thighs" },
    ],
  },
  {
    meat: "Pork",
    emoji: "🐖",
    color: "#9333ea",
    intro: "In 2011, the USDA updated their pork guidelines — whole pork cuts are now safe at 145°F (down from 160°F). This means a slightly pink center is perfectly safe in pork chops and roasts. Exception: ground pork and sausage still require 160°F.",
    rows: [
      { doneness: "Chops & Loins (Minimum)", fahrenheit: "145°F", celsius: "63°C", description: "Slightly pink in the center. Moist and tender. This is the USDA-approved safe temperature as of 2011.", color: "#16a34a", usda: "USDA minimum (updated 2011) — must rest 3 minutes" },
      { doneness: "Ground Pork & Sausage", fahrenheit: "160°F", celsius: "71°C", description: "No pink at all. Required for any ground or mixed pork products including sausage and meatballs.", color: "#16a34a", usda: "USDA minimum for ground pork" },
      { doneness: "Ribs & Pulled Pork", fahrenheit: "195–205°F", celsius: "90–96°C", description: "Well above the safe minimum — this temperature range is about texture, not safety. Collagen fully converts to gelatin at 195°F+, giving you the fall-apart tenderness BBQ is famous for.", color: "#ea580c" },
    ],
    proTip: "For pulled pork and ribs, don't go by time — go by feel and temperature. When a fork slides into the thickest part with zero resistance and the internal temp is 200–205°F, it's done. Every piece of meat is different.",
    recipes: [
      { title: "Fall-Off-The-Bone BBQ Ribs (3-2-1)", href: "/recipes/bbq-ribs" },
      { title: "Slow Cooker Venison Shoulder", href: "/recipes/slow-cooker-venison-shoulder" },
    ],
  },
  {
    meat: "Lamb",
    emoji: "🫀",
    color: "#0891b2",
    intro: "Lamb follows similar doneness guidelines to beef — whole muscle cuts can be served pink. The USDA recommends 145°F for whole cuts with a 3-minute rest, but medium-rare at 130–135°F is traditional and widely served.",
    rows: [
      { doneness: "Rare", fahrenheit: "120–125°F", celsius: "49–52°C", description: "Deep pink-red throughout. Soft and very tender. Some find the lamb flavor more pronounced at rare.", color: "#dc2626" },
      { doneness: "Medium-Rare", fahrenheit: "130–135°F", celsius: "54–57°C", description: "Pink throughout. The preferred target for rack of lamb and loin chops — optimal tenderness and juiciness.", color: "#ea580c" },
      { doneness: "Medium", fahrenheit: "140–145°F", celsius: "60–63°C", description: "Light pink center. USDA minimum with rest. Still tender but noticeably firmer than medium-rare.", color: "#d97706", usda: "USDA minimum for whole cuts" },
      { doneness: "Well Done", fahrenheit: "160°F+", celsius: "71°C+", description: "No pink. Very firm. Some find the gamey notes more pronounced at this temperature.", color: "#65a30d" },
    ],
    proTip: "Let lamb chops rest at room temperature for 30 minutes before cooking. Cold lamb from the fridge causes the outside to overcook before the centre reaches the right temperature. A simple salt-and-pepper crust is all you need.",
    recipes: [
      { title: "Pan-Seared Lamb Chops with Garlic Butter", href: "/recipes/pan-seared-lamb-chops" },
    ],
  },
];

const TOOL_FAQ = [
  { q: "What's the best thermometer for home cooking?", a: "An instant-read digital thermometer is all you need. The ThermoWorks Thermapen and ThermoPop are the gold standard ($35–$105), but any instant-read digital thermometer with a 2-second read time and accuracy of ±1°F works fine. Avoid dial thermometers — they're slow and inaccurate." },
  { q: "Where do I insert the thermometer?", a: "Insert it into the thickest part of the meat, avoiding bone, fat pockets, or the pan surface. For irregular cuts, probe multiple spots. For burgers, insert from the side through the center of the patty. Always probe before you think it's done — you can always cook more, you can't uncook." },
  { q: "What is carry-over cooking?", a: "When you remove meat from heat, the exterior temperature keeps conducting inward for 3–10 minutes, raising the internal temperature by 3–8°F depending on thickness and starting temperature. This is why you pull steaks 5°F before your target and rest them — you're using carry-over to finish the cook without drying out the exterior." },
  { q: "Why does the USDA safe temperature differ from what restaurants serve?", a: "The USDA sets safety minimums that eliminate risk for the broadest population, including immunocompromised individuals. For whole intact cuts, the actual risk at lower temperatures is extremely low since harmful bacteria are on the surface, which is always exposed to high heat. Ground meats are a different story — grinding distributes surface bacteria throughout, which is why 160°F is non-negotiable for burgers." },
  { q: "What if I don't have a thermometer?", a: "Use one. Seriously — a thermometer is a $15 investment that eliminates guessing permanently. The 'poke test', colour methods, and 'juices run clear' are unreliable indicators and the source of most overcooked meat. If you're going to cook meat at home, a thermometer is not optional equipment." },
];

export function MeatTemperatureGuidePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const pageUrl = `${SITE_URL}${window.location.pathname}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "The Complete Meat Cooking Temperature Guide — Safe & Best Temperatures",
    "description": "Comprehensive meat cooking temperatures for beef, chicken, pork and lamb — USDA safe minimums alongside chef-recommended targets for every level of doneness.",
    "url": pageUrl,
    "author": { "@type": "Person", "name": "Juicy Joe", "url": `${SITE_URL}/author/juicy-joe` },
    "publisher": { "@type": "Organization", "name": "Meat Lovers Hub" },
    "datePublished": "2024-03-01",
    "dateModified": "2026-05-03",
    "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl },
    "about": [
      { "@type": "Thing", "name": "Meat Cooking Temperatures" },
      { "@type": "Thing", "name": "Food Safety" },
      { "@type": "Thing", "name": "USDA Cooking Guidelines" },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": TOOL_FAQ.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a },
    })),
  };

  return (
    <>
      <SeoMeta
        title="Meat Cooking Temperature Guide — Safe & Best Temps for Every Cut"
        description="Complete meat cooking temperature chart: USDA safe minimums and chef-recommended targets for beef, chicken, pork, and lamb. Includes doneness guide, thermometer tips, and carry-over cooking explained."
        image="https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=630&fit=crop&q=85"
        imageAlt="Instant-read thermometer inserted into a juicy cooked steak"
        url={pageUrl}
        type="article"
        authorName="Juicy Joe"
        publishedAt="2024-03-01"
        modifiedAt="2026-05-03"
        tags={["meat temperatures", "cooking temperatures", "USDA safe temperatures", "beef doneness", "chicken temperature", "food safety"]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: "Guides", url: `${SITE_URL}/guides` },
          { name: "Meat Temperature Guide", url: pageUrl },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div style={{ background: "#F9F6F1", minHeight: "100vh", fontFamily: SS }}>
        <SiteHeader activeNav="/guides" />

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #111 0%, #1f0a0a 100%)", padding: "4rem 1.5rem 3rem" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <nav aria-label="breadcrumb" style={{ marginBottom: "1.5rem" }}>
              <ol style={{ display: "flex", gap: "0.4rem", listStyle: "none", padding: 0, margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
                <li><Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Home</Link></li>
                <li>/</li>
                <li><Link href="/resources" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Guides</Link></li>
                <li>/</li>
                <li style={{ color: "rgba(255,255,255,0.7)" }}>Meat Temperature Guide</li>
              </ol>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ background: "rgba(255,77,77,0.2)", border: "1px solid rgba(255,77,77,0.4)", borderRadius: "6px", padding: "0.3rem 0.75rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Thermometer style={{ width: "0.75rem", height: "0.75rem", color: "#ff7777" }} />
                <span style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff9090" }}>Reference Guide</span>
              </div>
            </div>

            <h1 style={{ fontFamily: SF, fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 600, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "1rem" }}>
              Meat Cooking Temperature Guide
            </h1>
            <p style={{ fontFamily: SS, fontSize: "1rem", color: "rgba(255,255,255,0.6)", maxWidth: "600px", lineHeight: 1.7 }}>
              Every cut, every doneness level — USDA safe minimums alongside chef-recommended targets. Bookmark this page and never guess again.
            </p>

            <div style={{ display: "flex", gap: "2rem", marginTop: "2rem", flexWrap: "wrap" }}>
              {[["5", "Meat Types"], ["USDA", "Referenced"], ["Updated", "May 2026"]].map(([val, lbl]) => (
                <div key={lbl}>
                  <p style={{ fontFamily: SF, fontSize: "1.4rem", fontWeight: 600, color: "#fff", lineHeight: 1 }}>{val}</p>
                  <p style={{ fontFamily: SS, fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginTop: "0.2rem" }}>{lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* USDA disclaimer */}
        <div style={{ background: "linear-gradient(135deg, #eff6ff, #f0f9ff)", borderBottom: "1px solid #bae6fd" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem 1.5rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>ℹ️</span>
            <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "#0369a1", lineHeight: 1.6, margin: 0 }}>
              <strong>About this guide:</strong> USDA safe minimum temperatures are noted where applicable and are the legally recognized food safety standards. Chef-recommended temperatures for whole intact muscle cuts reflect widely accepted culinary practice. Ground meats must always reach 160°F (71°C) for food safety — no exceptions.{" "}
              <a href="https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart" target="_blank" rel="noopener noreferrer" style={{ color: "#0369a1", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                USDA Safe Temperature Chart <ExternalLink style={{ width: "0.7rem", height: "0.7rem" }} />
              </a>
            </p>
          </div>
        </div>

        {/* Temperature Sections */}
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem" }}>

          {/* Quick-jump nav */}
          <nav aria-label="Jump to meat type" style={{ background: "#fff", borderRadius: "1rem", padding: "1rem 1.25rem", border: "1px solid #EAE5DC", marginBottom: "3rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontFamily: SS, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#bbb", alignSelf: "center", marginRight: "0.25rem" }}>Jump to:</span>
            {SECTIONS.map((s) => (
              <a key={s.meat} href={`#${s.meat.toLowerCase().replace(/[^a-z]/g, "-")}`}
                style={{ fontFamily: SS, fontSize: "0.75rem", fontWeight: 600, color: s.color, background: `${s.color}12`, border: `1px solid ${s.color}30`, padding: "0.25rem 0.7rem", borderRadius: "999px", textDecoration: "none" }}>
                {s.emoji} {s.meat.split(" (")[0]}
              </a>
            ))}
            <a href="#thermometer-faq" style={{ fontFamily: SS, fontSize: "0.75rem", fontWeight: 600, color: "#666", background: "#f5f5f5", border: "1px solid #e5e5e5", padding: "0.25rem 0.7rem", borderRadius: "999px", textDecoration: "none" }}>
              🌡️ Thermometer FAQ
            </a>
          </nav>

          {SECTIONS.map((section) => (
            <motion.section
              key={section.meat}
              id={section.meat.toLowerCase().replace(/[^a-z]/g, "-")}
              aria-labelledby={`${section.meat.toLowerCase().replace(/[^a-z]/g, "-")}-heading`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45 }}
              style={{ marginBottom: "3.5rem" }}
            >
              {/* Section header */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "1.8rem" }}>{section.emoji}</span>
                <h2 id={`${section.meat.toLowerCase().replace(/[^a-z]/g, "-")}-heading`}
                  style={{ fontFamily: SF, fontSize: "2rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em" }}>
                  {section.meat}
                </h2>
              </div>
              <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "#666", lineHeight: 1.7, marginBottom: "1.5rem", maxWidth: "680px" }}>
                {section.intro}
              </p>

              {/* Temperature table */}
              <div style={{ borderRadius: "1rem", overflow: "hidden", border: "1px solid #EAE5DC", background: "#fff", marginBottom: "1rem" }}>
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 2fr", gap: 0, background: section.color, padding: "0.65rem 1.25rem" }}>
                  {["Doneness", "°F", "°C", "Description"].map((h) => (
                    <span key={h} style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>{h}</span>
                  ))}
                </div>

                {section.rows.map((row, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 2fr", gap: 0, padding: "1rem 1.25rem", borderTop: i > 0 ? "1px solid #F0EBE2" : "none", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: row.color, flexShrink: 0 }} />
                      <span style={{ fontFamily: SF, fontSize: "1rem", fontWeight: 700, color: "#111" }}>{row.doneness}</span>
                    </div>
                    <span style={{ fontFamily: SS, fontSize: "0.88rem", fontWeight: 700, color: row.color }}>{row.fahrenheit}</span>
                    <span style={{ fontFamily: SS, fontSize: "0.82rem", color: "#999" }}>{row.celsius}</span>
                    <div>
                      <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#555", lineHeight: 1.55, margin: 0 }}>{row.description}</p>
                      {row.usda && (
                        <p style={{ fontFamily: SS, fontSize: "0.7rem", color: "#0369a1", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Check style={{ width: "0.65rem", height: "0.65rem", flexShrink: 0 }} />
                          {row.usda}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pro tip */}
              <div style={{ padding: "1rem 1.25rem", background: `${section.color}0c`, border: `1px solid ${section.color}25`, borderLeft: `3px solid ${section.color}`, borderRadius: "0.75rem", marginBottom: section.recipes ? "1rem" : 0 }}>
                <p style={{ fontFamily: SS, fontSize: "0.83rem", color: "#555", lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: section.color }}>Pro tip:</strong> {section.proTip}
                </p>
              </div>

              {/* Related recipes */}
              {section.recipes && section.recipes.length > 0 && (
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: SS, fontSize: "0.7rem", color: "#bbb", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", alignSelf: "center" }}>Try it:</span>
                  {section.recipes.map((r) => (
                    <Link key={r.href} href={r.href}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontFamily: SS, fontSize: "0.76rem", fontWeight: 700, color: section.color, background: `${section.color}10`, border: `1px solid ${section.color}30`, padding: "0.3rem 0.8rem", borderRadius: "999px", textDecoration: "none" }}>
                      {r.title} <ArrowRight style={{ width: "0.65rem", height: "0.65rem" }} />
                    </Link>
                  ))}
                </div>
              )}
            </motion.section>
          ))}

          {/* Thermometer FAQ */}
          <section id="thermometer-faq" aria-labelledby="thermometer-faq-heading" style={{ marginBottom: "3.5rem" }}>
            <h2 id="thermometer-faq-heading" style={{ fontFamily: SF, fontSize: "2rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
              🌡️ Thermometer & Temperature FAQ
            </h2>
            <p style={{ fontFamily: SS, fontSize: "0.87rem", color: "#999", marginBottom: "1.5rem" }}>
              The questions we get asked most about meat temperatures.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {TOOL_FAQ.map((item, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: "1rem", border: `1px solid ${openFaq === i ? "#ff4d4d" : "#EAE5DC"}`, overflow: "hidden", transition: "border-color 0.2s" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.4rem", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: "1rem" }}
                  >
                    <h3 style={{ fontFamily: SF, fontSize: "1.05rem", fontWeight: 600, color: "#111", margin: 0, lineHeight: 1.35 }}>{item.q}</h3>
                    <ChevronDown style={{ width: "1rem", height: "1rem", color: "#ff4d4d", flexShrink: 0, transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s" }} />
                  </button>
                  {openFaq === i && (
                    <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "#555", lineHeight: 1.75, padding: "0 1.4rem 1.2rem", margin: 0 }}>
                      {item.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Sources */}
          <section aria-labelledby="sources-heading" style={{ marginBottom: "3rem", padding: "1.5rem", background: "#fff", borderRadius: "1rem", border: "1px solid #EAE5DC" }}>
            <h2 id="sources-heading" style={{ fontFamily: SF, fontSize: "1.4rem", fontWeight: 600, color: "#111", letterSpacing: "-0.01em", marginBottom: "1rem" }}>
              Sources & References
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { title: "Safe Minimum Internal Temperature Chart", url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart", source: "USDA FSIS" },
                { title: "USDA Meat and Poultry Hotline – Cooking Safely", url: "https://www.fsis.usda.gov/contact/meat-poultry-hotline", source: "USDA FSIS" },
                { title: "The Food Lab: The Science of the Perfect Steak", url: "https://www.seriouseats.com/the-food-lab-complete-guide-to-pan-seared-steaks", source: "Serious Eats" },
                { title: "Carryover Cooking Guide", url: "https://amazingribs.com/more-technique-and-science/more-cooking-science/carryover-cooking/", source: "AmazingRibs.com" },
              ].map((ref, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                  <ExternalLink style={{ width: "0.75rem", height: "0.75rem", color: "#aaa", flexShrink: 0, marginTop: "0.2rem" }} />
                  <span style={{ fontFamily: SS, fontSize: "0.8rem" }}>
                    <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{ color: "#333", textDecoration: "underline", textUnderlineOffset: "2px" }}>{ref.title}</a>
                    <span style={{ color: "#bbb" }}> — {ref.source}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* CTA back to recipes */}
          <div style={{ background: "linear-gradient(135deg, #111, #1f0a0a)", borderRadius: "1.25rem", padding: "2.5rem", textAlign: "center" }}>
            <p style={{ fontFamily: SF, fontSize: "2rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
              Ready to put it into practice?
            </p>
            <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", marginBottom: "1.5rem" }}>
              Browse all our recipes — every one of them tells you the exact target temperature.
            </p>
            <Link href="/recipes" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#ff4d4d", color: "#fff", fontFamily: SS, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.85rem 2rem", borderRadius: "8px", textDecoration: "none", boxShadow: "0 4px 20px rgba(255,77,77,0.4)" }}>
              See All Recipes <ArrowRight style={{ width: "0.9rem", height: "0.9rem" }} />
            </Link>
          </div>
        </div>

        <SiteFooter />
      </div>
    </>
  );
}
