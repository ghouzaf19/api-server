import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight, Scissors } from "lucide-react";
import { SeoMeta } from "@/components/SeoMeta";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { SITE_URL } from "@/lib/siteUrl";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

/* ── Data ────────────────────────────────────────────────────────────────── */

interface KnifeEntry {
  name: string;
  emoji: string;
  use: string;
  blade: string;
  tip: string;
}

const KNIVES: KnifeEntry[] = [
  {
    name: "Boning Knife",
    emoji: "🔪",
    use: "Frenching racks, separating joints, removing silver skin",
    blade: "6-inch flexible blade — curves around bone without tearing",
    tip: "Keep it sharp. A dull boning knife slips and causes injuries far more than a sharp one.",
  },
  {
    name: "Chef's Knife",
    emoji: "🔪",
    use: "Trimming fat caps, portioning large cuts, halving whole loins",
    blade: "8–10 inch — your general workhorse for butchery prep",
    tip: "Use the full length of the blade in a single draw-cut rather than sawing. Less tearing, cleaner edges.",
  },
  {
    name: "Breaking Knife",
    emoji: "🔪",
    use: "Splitting ribs, breaking down primals, heavy trim work",
    blade: "10–12 inch curved blade — designed for leverage through large cuts",
    tip: "Usually only needed when working with whole primals. For home cooks, a long chef's knife covers most of the same ground.",
  },
  {
    name: "Honing Steel (Ceramic or Diamond)",
    emoji: "⚙️",
    use: "Realigning the edge between sharpening sessions",
    blade: "Use before every session — 4–5 passes per side at 20°",
    tip: "Honing is not sharpening. It straightens the existing edge. Sharpen with a whetstone every 3–6 months depending on use.",
  },
];

interface FrenchingStep {
  step: number;
  title: string;
  detail: string;
  safety?: string;
}

const FRENCHING_STEPS: FrenchingStep[] = [
  {
    step: 1,
    title: "Score the fat line",
    detail: "Place the rack bone-side down. Measure 2–3 inches (5–8 cm) from the end of the bones and score a straight line across the fat cap with your boning knife — cut just deep enough to reach the bone. This is your reference line for the entire process.",
    safety: "Always cut away from your body. Anchor the rack firmly with your non-knife hand behind the line you're cutting toward.",
  },
  {
    step: 2,
    title: "Remove the fat cap above the score line",
    detail: "Working from your score line upward toward the bone tips, slice off the large fat-and-meat flap in one clean piece if possible. Hold the flap with your non-knife hand and use the boning knife to separate it with short, controlled strokes that follow the contour of the rib bones.",
  },
  {
    step: 3,
    title: "Clean between the rib bones",
    detail: "With the fat cap removed, you'll see meat and connective tissue still bridging the gaps between the exposed rib bones. Insert the tip of your boning knife between two bones and slice downward along one bone, then reverse and slice along the adjacent bone. The tissue between them will come free. Repeat for every gap.",
  },
  {
    step: 4,
    title: "Scrape the bones clean",
    detail: "Hold the cleaned section of bone firmly and scrape from the meat end toward the bone tip — removing any remaining membrane or tissue. A paper towel gripped around the bone helps strip the last traces. The goal: bones that are white, clean, and presentable at the table.",
  },
  {
    step: 5,
    title: "Remove silver skin from the eye of meat",
    detail: "Flip the rack and locate the silver skin — the thin, pearlescent membrane running along the eye of the lamb. Slide the tip of your boning knife under one edge, then angle the blade slightly upward and run it along the membrane in a long sweeping stroke, keeping the blade almost parallel to the meat surface. Silver skin doesn't break down during cooking; it tightens and makes the meat tough if left on.",
    safety: "Silver skin removal is the step where most cuts happen. Keep the blade flat and move slowly. Never rush the sweep.",
  },
  {
    step: 6,
    title: "Trim the fat cap to ¼ inch",
    detail: "If not already done by the butcher, trim the fat cap on the curved side of the rack down to approximately ¼ inch (6 mm). Too much fat prevents seasoning from reaching the meat and can flare on a hot grill. Too little and you lose the self-basting layer that keeps the eye of meat moist during roasting.",
  },
  {
    step: 7,
    title: "Cap the exposed bones before cooking",
    detail: "Before the rack goes in the oven or on the grill, wrap the exposed bones in aluminium foil. This prevents them from charring and keeps the presentation clean. Remove the foil 5 minutes before serving.",
  },
];

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: "Can I ask my butcher to French the rack for me?",
    a: "Yes — and most will do it at no extra charge. But knowing the technique yourself means you can buy whole racks on sale and prepare them at home, saving significantly over pre-Frenched racks. It also lets you control exactly how much fat you leave on.",
  },
  {
    q: "Does Frenching affect the flavour of the lamb?",
    a: "Not significantly. The bones themselves contribute little flavour during a short roast. The technique is primarily about presentation and even heat distribution — the exposed bones allow the rack to cook more evenly and make portioning at the table cleaner.",
  },
  {
    q: "What temperature should rack of lamb be cooked to?",
    a: "For medium-rare — the gold standard for lamb — pull at 125–130°F (52–54°C) internal and rest for 8–10 minutes. Carry-over will bring it to 130–135°F. The USDA minimum for lamb is 145°F (63°C) with a 3-minute rest, which corresponds to medium.",
  },
  {
    q: "How sharp does my boning knife need to be for Frenching?",
    a: "Razor sharp. If the knife drags or tears the membrane between the bones rather than slicing cleanly through it, you need to hone or sharpen before you start. A sharp blade gives you control; a dull blade forces you to apply pressure, which is when the knife slips.",
  },
  {
    q: "Can these techniques be applied to pork ribs or veal?",
    a: "Yes. Frenching pork rib roasts (\"crown roast of pork\") uses exactly the same technique. Veal racks are even more delicate and benefit from the same careful silver-skin removal. The principles — score, strip, clean between bones, scrape — apply across species.",
  },
];

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════════════════════ */
export function ButcheryKnifeSkillsGuidePage() {
  const pageUrl = `${SITE_URL}/guides/butchery-knife-skills-frenching`;

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to French a Rack of Lamb — Butchery Knife Skills Guide",
    "description": "Step-by-step guide to Frenching a rack of lamb at home: scoring the fat line, cleaning between rib bones, removing silver skin, and achieving a professional butcher-quality presentation.",
    "totalTime": "PT20M",
    "estimatedCost": { "@type": "MonetaryAmount", "currency": "USD", "value": "0" },
    "tool": [
      { "@type": "HowToTool", "name": "6-inch flexible boning knife" },
      { "@type": "HowToTool", "name": "Cutting board (non-slip)" },
      { "@type": "HowToTool", "name": "Paper towels" },
      { "@type": "HowToTool", "name": "Honing steel" },
    ],
    "supply": [
      { "@type": "HowToSupply", "name": "Rack of lamb (8-bone, Frenched or un-Frenched)" },
    ],
    "step": FRENCHING_STEPS.map(s => ({
      "@type": "HowToStep",
      "name": s.title,
      "text": s.detail,
    })),
    "author": { "@type": "Person", "name": "Juicy Joe", "url": `${SITE_URL}/author/juicy-joe` },
    "inLanguage": "en-US",
    "keywords": "how to French a rack of lamb, Frenching lamb chops, butchery knife skills, boning knife technique, remove silver skin, rack of lamb preparation",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": { "@type": "Answer", "text": faq.a },
    })),
  };

  return (
    <>
      <SeoMeta
        title="How to French a Rack of Lamb — Butchery Knife Skills Guide"
        description="Master the Frenching technique: score the fat line, clean between rib bones, strip silver skin, and achieve a restaurant-quality rack of lamb at home. Step-by-step with knife safety tips."
        image="https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=630&fit=crop&q=85"
        url={pageUrl}
        type="article"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: "Guides", url: `${SITE_URL}/guides` },
          { name: "Butchery: Frenching a Rack of Lamb", url: pageUrl },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div style={{ background: "#F9F6F1", minHeight: "100vh", fontFamily: SS, display: "flex", flexDirection: "column" }}>
        <SiteHeader activeNav="/guides" />

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "linear-gradient(155deg, #0e0404 0%, #1a0c0c 55%, #0c0202 100%)",
            padding: "5rem 1.5rem 4.5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.016) 1px, transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }}
          />
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
                <li><Link href="/guides" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Guides</Link></li>
                <li>/</li>
                <li style={{ color: "rgba(255,255,255,0.7)" }}>Butchery: Frenching</li>
              </ol>
            </nav>

            {/* Label */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "1.25rem" }}>
              <div style={{ width: "26px", height: "26px", background: "#CC2222", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden="true">
                <Scissors style={{ width: "0.8rem", height: "0.8rem", color: "#fff" }} />
              </div>
              <span style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.17em", textTransform: "uppercase", color: "rgba(255,120,120,0.88)" }}>
                Butchery Technique
              </span>
            </div>

            <h1 style={{ fontFamily: SF, fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)", fontWeight: 300, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.035em", marginBottom: "1.1rem" }}>
              How to French a Rack of Lamb<br /><em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.72)" }}>& Essential Butchery Knife Skills</em>
            </h1>

            <p style={{ fontFamily: SS, fontSize: "0.93rem", color: "rgba(255,255,255,0.48)", maxWidth: "520px", lineHeight: 1.78, fontWeight: 300, marginBottom: "2rem" }}>
              Frenching exposes the rib bones for a restaurant-quality presentation — and it takes less than 20 minutes once you know the technique. This guide covers the right knives, the 7-step process, silver-skin removal, and common mistakes to avoid.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <a
                href="#frenching-steps"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#CC2222", color: "#fff", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.85rem 1.5rem", borderRadius: "8px", textDecoration: "none", boxShadow: "0 4px 22px rgba(180,30,30,0.42)" }}
              >
                Start the Guide <ArrowRight style={{ width: "0.78rem", height: "0.78rem" }} />
              </a>
              <Link
                href="/guides/meat-temperatures"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.82)", fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, padding: "0.85rem 1.5rem", borderRadius: "8px", textDecoration: "none" }}
              >
                🌡️ Lamb Temperatures
              </Link>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {[
                { label: "Prep time", value: "~20 min" },
                { label: "Skill level", value: "Intermediate" },
                { label: "Key tool", value: "Boning knife" },
                { label: "Applies to", value: "Lamb, pork, veal" },
              ].map(stat => (
                <div key={stat.label}>
                  <p style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "0.25rem" }}>{stat.label}</p>
                  <p style={{ fontFamily: SF, fontSize: "1.05rem", fontWeight: 500, color: "#fff", letterSpacing: "-0.01em" }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Hero image ────────────────────────────────────────────────── */}
        <div style={{ width: "100%", maxHeight: "480px", overflow: "hidden", position: "relative" }}>
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1400&h=480&fit=crop&q=80"
            alt="Rack of lamb with Frenched rib bones exposed and tied with butcher's twine, resting on a wooden cutting board beside a boning knife"
            width={1400}
            height={480}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{ width: "100%", height: "480px", objectFit: "cover", display: "block" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, #F9F6F1 100%)" }} />
        </div>

        {/* ── Main content ──────────────────────────────────────────────── */}
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "3.5rem 1.5rem", width: "100%", boxSizing: "border-box" }}>

          {/* Intro callout */}
          <div
            style={{ background: "#fff", border: "1px solid #EAE5DC", borderLeft: "4px solid #CC2222", borderRadius: "10px", padding: "1.5rem 1.75rem", marginBottom: "3rem" }}
          >
            <p style={{ fontFamily: SS, fontSize: "0.88rem", lineHeight: 1.75, color: "#444", margin: 0 }}>
              <strong style={{ color: "#111" }}>What does "Frenching" mean?</strong> Frenching refers to the technique of exposing the rib bones of a rack by removing the fat cap, cleaning the meat from between the bones, and scraping the bone surface clean. The result is the classic "lollipop" presentation seen in restaurant rack of lamb — elegant, even, and easier to portion at the table. The same method applies to pork rib roasts and veal racks.
            </p>
          </div>

          {/* ── Knives section ───────────────────────────────────────────── */}
          <section aria-labelledby="knives-heading" style={{ marginBottom: "4rem" }}>
            <h2
              id="knives-heading"
              style={{ fontFamily: SF, fontSize: "clamp(1.7rem, 3.5vw, 2.3rem)", fontWeight: 400, color: "#111", letterSpacing: "-0.025em", marginBottom: "0.5rem" }}
            >
              The Right Knives
            </h2>
            <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#666", lineHeight: 1.7, marginBottom: "2rem" }}>
              You don't need a full set of professional butchery knives. For Frenching a rack at home, a sharp boning knife covers 90% of the work. Here's what each knife does and when it matters.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {KNIVES.map((knife) => (
                <motion.div
                  key={knife.name}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.38 }}
                  style={{ background: "#fff", border: "1px solid #EAE5DC", borderRadius: "10px", padding: "1.35rem 1.5rem" }}
                >
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "1.4rem", flexShrink: 0, lineHeight: 1 }} aria-hidden="true">{knife.emoji}</span>
                    <div>
                      <h3 style={{ fontFamily: SF, fontSize: "1.2rem", fontWeight: 700, color: "#111", marginBottom: "0.2rem", letterSpacing: "-0.01em" }}>
                        {knife.name}
                      </h3>
                      <p style={{ fontFamily: SS, fontSize: "0.78rem", color: "#CC2222", fontWeight: 600, marginBottom: "0.6rem" }}>
                        {knife.blade}
                      </p>
                      <p style={{ fontFamily: SS, fontSize: "0.84rem", color: "#555", lineHeight: 1.65, marginBottom: "0.5rem" }}>
                        <strong style={{ color: "#111" }}>Best for:</strong> {knife.use}
                      </p>
                      <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#777", lineHeight: 1.6, borderTop: "1px solid #F3EFE7", paddingTop: "0.55rem", margin: 0 }}>
                        💡 {knife.tip}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Knife safety callout ─────────────────────────────────────── */}
          <div
            style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "1.4rem 1.75rem", marginBottom: "4rem" }}
          >
            <p style={{ fontFamily: SS, fontSize: "0.72rem", fontWeight: 700, color: "#B91C1C", marginBottom: "0.5rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              ⚠️ Knife Safety — Before You Start
            </p>
            <ul style={{ fontFamily: SS, fontSize: "0.85rem", color: "#7F1D1D", lineHeight: 1.75, margin: 0, paddingLeft: "1.25rem" }}>
              <li>Always cut <strong>away from your body</strong> and keep your non-knife hand behind the blade path.</li>
              <li>Use a <strong>non-slip cutting board</strong> — place a damp towel underneath if needed.</li>
              <li>A sharp knife is safer than a dull one. A dull blade requires more pressure and is far more likely to slip.</li>
              <li>When scraping bone surfaces, <strong>anchor the bone firmly</strong> before applying any downward pressure.</li>
            </ul>
          </div>

          {/* ── Frenching steps ───────────────────────────────────────────── */}
          <section id="frenching-steps" aria-labelledby="frenching-heading" style={{ marginBottom: "4rem" }}>
            <h2
              id="frenching-heading"
              style={{ fontFamily: SF, fontSize: "clamp(1.7rem, 3.5vw, 2.3rem)", fontWeight: 400, color: "#111", letterSpacing: "-0.025em", marginBottom: "0.5rem" }}
            >
              How to French a Rack of Lamb
            </h2>
            <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#666", lineHeight: 1.7, marginBottom: "2rem" }}>
              A standard 8-bone rack takes 15–20 minutes to French at home. Work methodically — speed comes with repetition. The steps below assume an un-Frenched rack as bought from a supermarket or wholesaler.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {FRENCHING_STEPS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  style={{ display: "flex", gap: "1.25rem", paddingBottom: "2rem", position: "relative" }}
                >
                  {/* Step number + connector line */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div
                      style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#CC2222", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SS, fontSize: "0.88rem", fontWeight: 800, flexShrink: 0, zIndex: 1 }}
                      aria-hidden="true"
                    >
                      {step.step}
                    </div>
                    {i < FRENCHING_STEPS.length - 1 && (
                      <div style={{ width: "2px", flex: 1, background: "#EAE5DC", marginTop: "0.5rem" }} aria-hidden="true" />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ paddingTop: "0.4rem", flex: 1 }}>
                    <h3 style={{ fontFamily: SF, fontSize: "1.22rem", fontWeight: 700, color: "#111", marginBottom: "0.55rem", letterSpacing: "-0.01em" }}>
                      {step.title}
                    </h3>
                    <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#444", lineHeight: 1.75, marginBottom: step.safety ? "0.75rem" : 0 }}>
                      {step.detail}
                    </p>
                    {step.safety && (
                      <div
                        style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "7px", padding: "0.65rem 1rem", fontSize: "0.8rem", color: "#7F1D1D", fontFamily: SS, lineHeight: 1.6 }}
                      >
                        ⚠️ <strong>Safety:</strong> {step.safety}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Result callout ────────────────────────────────────────────── */}
          <div
            style={{ background: "#111", borderRadius: "14px", padding: "2rem 2.25rem", marginBottom: "4rem", display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}
          >
            <div style={{ fontSize: "2rem", lineHeight: 1, flexShrink: 0 }} aria-hidden="true">🏆</div>
            <div>
              <h3 style={{ fontFamily: SF, fontSize: "1.35rem", color: "#fff", marginBottom: "0.5rem", fontWeight: 500 }}>
                What a properly Frenched rack looks like
              </h3>
              <p style={{ fontFamily: SS, fontSize: "0.84rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.75, margin: 0 }}>
                Clean white bones extending 2–3 inches above the eye of meat. No membrane, no meat scraps bridging the gaps between bones. The fat cap on the curved side is trimmed to a uniform ¼ inch. The eye of meat is smooth and free of silver skin. When the rack is stood upright on its bones ("crown roast" style), every bone is exposed equally. That's the benchmark.
              </p>
            </div>
          </div>

          {/* ── Trimming note with internal link ─────────────────────────── */}
          <section aria-labelledby="trimming-heading" style={{ marginBottom: "4rem" }}>
            <h2
              id="trimming-heading"
              style={{ fontFamily: SF, fontSize: "clamp(1.7rem, 3.5vw, 2.3rem)", fontWeight: 400, color: "#111", letterSpacing: "-0.025em", marginBottom: "0.5rem" }}
            >
              Trimming & Fat Management
            </h2>
            <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#444", lineHeight: 1.75, marginBottom: "1rem" }}>
              The same fat-trimming discipline that makes a Frenched rack cook evenly applies across all large cuts. A ¼-inch fat cap is the general rule: enough to self-baste the meat during cooking, thin enough to allow seasoning to penetrate and bark to form. Too thick and the fat insulates instead of renders; too thin and you lose the protective layer.
            </p>
            <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#444", lineHeight: 1.75 }}>
              For cuts where fat quality and surface dryness matter even more — particularly steaks and roasts destined for a hard sear — it's worth understanding the principles behind{" "}
              <Link
                href="/blog/dry-aging-steak-home"
                style={{ color: "#CC2222", textDecoration: "underline", textUnderlineOffset: "3px", fontWeight: 600 }}
                title="The Ultimate Guide to Dry Aging Steak at Home"
              >
                dry aging at home
              </Link>
              . Dry-aged surfaces draw seasoning in dramatically faster and develop crust far more readily — the same reason butchers often prefer aged cuts for precise technique work.
            </p>
          </section>

          {/* ── Temperature reminder ─────────────────────────────────────── */}
          <div
            style={{ background: "#fff", border: "1px solid #EAE5DC", borderLeft: "4px solid #B45309", borderRadius: "10px", padding: "1.4rem 1.75rem", marginBottom: "4rem" }}
          >
            <p style={{ fontFamily: SS, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#B45309", marginBottom: "0.75rem" }}>
              🌡️ Lamb Temperatures (USDA-cited)
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
              {[
                { label: "Medium-Rare (pull temp)", temp: "125–130°F / 52–54°C", note: "Rest 8–10 min — carry-over to 130–135°F" },
                { label: "Medium (USDA minimum)", temp: "145°F / 63°C", note: "3-minute rest required per USDA FSIS" },
                { label: "Well Done", temp: "160°F+ / 71°C+", note: "Still safe; noticeably drier texture" },
              ].map(row => (
                <div key={row.label} style={{ background: "#F9F6F1", borderRadius: "8px", padding: "0.9rem" }}>
                  <p style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.25rem" }}>{row.label}</p>
                  <p style={{ fontFamily: SF, fontSize: "1.05rem", fontWeight: 700, color: "#111", marginBottom: "0.2rem" }}>{row.temp}</p>
                  <p style={{ fontFamily: SS, fontSize: "0.72rem", color: "#888", lineHeight: 1.5 }}>{row.note}</p>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: SS, fontSize: "0.78rem", color: "#999", marginTop: "0.9rem", marginBottom: 0 }}>
              Full temperature guide →{" "}
              <Link href="/guides/meat-temperatures" style={{ color: "#B45309", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: "2px" }}>
                Meat Temperatures: Every Cut, Every Doneness
              </Link>
            </p>
          </div>

          {/* ── FAQ ───────────────────────────────────────────────────────── */}
          <section aria-labelledby="faq-heading" style={{ marginBottom: "4rem" }}>
            <h2
              id="faq-heading"
              style={{ fontFamily: SF, fontSize: "clamp(1.7rem, 3.5vw, 2.3rem)", fontWeight: 400, color: "#111", letterSpacing: "-0.025em", marginBottom: "1.75rem" }}
            >
              Frequently Asked Questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {FAQS.map((faq) => (
                <FAQItem key={faq.q} faq={faq} />
              ))}
            </div>
          </section>

          {/* ── CTA band ──────────────────────────────────────────────────── */}
          <div
            style={{ background: "#111", borderRadius: "14px", padding: "2.25rem 2.25rem", display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", justifyContent: "space-between" }}
          >
            <div>
              <p style={{ fontFamily: SF, fontSize: "clamp(1.3rem, 3vw, 1.7rem)", fontWeight: 500, color: "#fff", letterSpacing: "-0.02em", marginBottom: "0.35rem", lineHeight: 1.2 }}>
                Ready to cook? <em>Find a recipe.</em>
              </p>
              <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>
                Beef, chicken, BBQ, game meat — all tested by Joe.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", flexShrink: 0 }}>
              <Link
                href="/recipes"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "#CC2222", color: "#fff", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.85rem 1.4rem", borderRadius: "8px", textDecoration: "none", boxShadow: "0 4px 18px rgba(180,30,30,0.35)", whiteSpace: "nowrap" }}
              >
                Browse Recipes <ArrowRight style={{ width: "0.78rem", height: "0.78rem" }} />
              </Link>
              <Link
                href="/guides"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)", fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, padding: "0.85rem 1.4rem", borderRadius: "8px", textDecoration: "none", whiteSpace: "nowrap" }}
              >
                All Guides
              </Link>
            </div>
          </div>
        </div>

        <SiteFooter />
      </div>
    </>
  );
}

/* ── FAQ accordion item ───────────────────────────────────────────────────── */
function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#fff", border: "1px solid #EAE5DC", borderRadius: "10px", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: "1rem", padding: "1.15rem 1.4rem", background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontFamily: SF, fontSize: "1.08rem", fontWeight: 600, color: "#111", lineHeight: 1.3 }}>
          {faq.q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }} style={{ flexShrink: 0 }}>
          <ChevronDown style={{ width: "1rem", height: "1rem", color: "#888" }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#555", lineHeight: 1.75, padding: "0 1.4rem 1.2rem" }}>
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
