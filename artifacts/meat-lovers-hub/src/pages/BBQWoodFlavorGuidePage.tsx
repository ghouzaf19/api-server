import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight, Flame } from "lucide-react";
import { SeoMeta } from "@/components/SeoMeta";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { SITE_URL } from "@/lib/siteUrl";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

/* ── Data ────────────────────────────────────────────────────────────────── */

type Intensity = 1 | 2 | 3 | 4 | 5;

interface WoodEntry {
  name: string;
  emoji: string;
  flavor: string;
  intensity: Intensity;
  intensityLabel: string;
  color: string;
  bestFor: string[];
  avoidFor: string[];
  notes: string;
  proTip: string;
}

const WOODS: WoodEntry[] = [
  {
    name: "Post Oak",
    emoji: "🌳",
    flavor: "Clean, mild, earthy — a hint of vanilla without the sweetness",
    intensity: 2,
    intensityLabel: "Mild–Medium",
    color: "#92400e",
    bestFor: ["Beef brisket", "Beef ribs", "Chuck roasts", "Tri-tip"],
    avoidFor: ["Delicate fish", "Chicken breast (can overwhelm)"],
    notes: "The backbone of Central Texas BBQ for generations. Post oak burns long and clean with minimal creosote risk. Aaron Franklin has called it the only wood he uses at Franklin Barbecue. It lets the beef speak for itself — no competing sweetness, no harsh bite.",
    proTip: "Hardest to find outside Texas. Look for post oak chunks (not chips) from BBQ supply stores online. Chunks give you longer, more consistent smoke than chips on a charcoal fire.",
  },
  {
    name: "Hickory",
    emoji: "🌲",
    flavor: "Bold, bacon-forward, slightly sweet with a pungent edge",
    intensity: 4,
    intensityLabel: "Strong",
    color: "#78350f",
    bestFor: ["Pork ribs", "Pork shoulder (pulled pork)", "Bacon", "Beef brisket (sparingly)", "Venison"],
    avoidFor: ["Fish", "Poultry cooked hot-and-fast", "Long cooks where creosote can build"],
    notes: "The most widely used smoking wood in the American South. Hickory produces that classic BBQ flavor most people grew up eating. It pairs beautifully with pork — the fat in pork shoulder absorbs hickory smoke particularly well. Use too much on a long brisket cook and it can turn bitter.",
    proTip: "For a 12+ hour brisket, combine one chunk of hickory with two chunks of post oak or cherry. You get the complexity of hickory without risking an oversmoked result.",
  },
  {
    name: "Cherry",
    emoji: "🍒",
    flavor: "Sweet, fruity, mild — adds a beautiful deep mahogany bark color",
    intensity: 2,
    intensityLabel: "Mild",
    color: "#9f1239",
    bestFor: ["Chicken", "Pork ribs", "Duck", "Lamb", "Venison", "Turkey"],
    avoidFor: [],
    notes: "Cherry wood is exceptionally versatile — the most forgiving wood for beginners because it's virtually impossible to over-smoke with it alone. It contributes a gorgeous dark reddish-brown color to the bark that photographs beautifully. Frequently blended with hickory or oak to add color and sweetness.",
    proTip: "Cherry is the secret weapon for competition cooks who want a visually stunning bark without risking bitterness. Blend 50/50 with hickory for pork ribs — you get color, sweetness, and the bold backbone hickory provides.",
  },
  {
    name: "Apple",
    emoji: "🍎",
    flavor: "Sweet, mild, delicate — subtle fruity aroma",
    intensity: 1,
    intensityLabel: "Very Mild",
    color: "#dc2626",
    bestFor: ["Chicken", "Turkey", "Pork tenderloin", "Ham", "Fish", "Vegetables"],
    avoidFor: ["Beef brisket (too subtle)", "Lamb (needs more backbone)"],
    notes: "The mildest of the fruit woods — so gentle it can be hard to detect on strongly flavored meats like brisket or venison. It excels on chicken and pork tenderloin where you want just a whisper of smoke without dominating the meat's natural flavor. Great for poultry beginners.",
    proTip: "On a hot-and-fast chicken cook (325–350°F), use 3–4 chunks of apple at the start of the cook only. Adding wood continuously on a shorter cook creates too much smoke and can make the skin bitter.",
  },
  {
    name: "Mesquite",
    emoji: "🌵",
    flavor: "Earthy, intense, slightly bitter — the most aggressive smoking wood",
    intensity: 5,
    intensityLabel: "Very Strong",
    color: "#713f12",
    bestFor: ["Beef steaks (grilled hot-and-fast)", "Fajita beef", "Tex-Mex cooks"],
    avoidFor: ["Long low-and-slow cooks", "Pork", "Chicken", "Fish", "Any cook over 4 hours"],
    notes: "Mesquite burns extremely hot and produces an intense, almost medicinal smoke at high volumes. It's the dominant wood in West Texas and Tex-Mex cooking — and for good reason on a hot-and-fast grill where the beef gets a brief smoke hit. On a 12-hour brisket cook, even a single chunk of mesquite added late can produce an overwhelmingly bitter result. Use with extreme restraint.",
    proTip: "For mesquite, think 'a little goes a very long way.' One small chunk at the very start of a cook, then nothing after. Never add it continuously. If in doubt, cut the amount you planned in half — then half again.",
  },
  {
    name: "Pecan",
    emoji: "🥜",
    flavor: "Nutty, slightly sweet, rich — like a milder hickory",
    intensity: 3,
    intensityLabel: "Medium",
    color: "#a16207",
    bestFor: ["Pork ribs", "Pork shoulder", "Beef brisket", "Chicken", "Turkey", "Duck"],
    avoidFor: ["Fish (can be too rich)"],
    notes: "Pecan is often described as hickory's more refined cousin — it has the same savory backbone but with a nutty sweetness that smooths out the harder edges. It's extremely popular in the Gulf Coast BBQ tradition (Louisiana, Mississippi, Alabama). Because it's more forgiving than hickory, it's excellent for beginners who want a bold, complex result without the bitterness risk.",
    proTip: "Pecan shells (not just the wood) are also sold as a smoking medium and work exceptionally well in charcoal chimneys to add smoke to a kettle grill setup.",
  },
  {
    name: "Alder",
    emoji: "🌿",
    flavor: "Delicate, slightly sweet, neutral — almost no bite",
    intensity: 1,
    intensityLabel: "Very Mild",
    color: "#166534",
    bestFor: ["Salmon", "Trout", "All fish", "Shellfish", "Chicken", "Pork tenderloin"],
    avoidFor: ["Beef brisket", "Venison", "Any strong-flavored red meat"],
    notes: "The traditional wood for smoking Pacific Northwest salmon — so culturally tied to salmon that 'alder-smoked' is practically a flavor category on its own. Alder produces a delicate, clean smoke that doesn't compete with delicate proteins. On beef or game meat, the smoke is too subtle to notice.",
    proTip: "Alder chips (not chunks) work well in a smoker box over gas grill burners — the fine chips produce quick smoke that's ideal for the short cook times fish requires.",
  },
  {
    name: "Maple",
    emoji: "🍁",
    flavor: "Mildly sweet, clean, slightly caramel-like",
    intensity: 2,
    intensityLabel: "Mild",
    color: "#ea580c",
    bestFor: ["Pork", "Poultry", "Ham", "Vegetables", "Cheese"],
    avoidFor: ["Beef brisket (too mild)"],
    notes: "Maple wood produces a clean, lightly sweet smoke without the fruit-forward character of cherry or apple. It's excellent for ham — the natural affinity between maple flavors and pork makes it a classic pairing. Also outstanding for smoking cheese where you want a neutral smoke that doesn't compete.",
    proTip: "Maple syrup and maple wood are a natural combination: try brushing a maple glaze on pork ribs or ham during the last hour of a maple wood smoke for a layered maple flavor.",
  },
];

interface PairingRow {
  meat: string;
  emoji: string;
  primary: string;
  secondary: string;
  avoid: string;
  why: string;
}

const PAIRINGS: PairingRow[] = [
  { meat: "Beef Brisket", emoji: "🥩", primary: "Post Oak", secondary: "Pecan, Cherry", avoid: "Mesquite, Alder", why: "Brisket cooks 12–18 hours — gentle, clean woods prevent creosote buildup. Post oak lets beef fat do the work." },
  { meat: "Pork Ribs", emoji: "🍖", primary: "Hickory", secondary: "Cherry, Pecan", avoid: "Mesquite", why: "Pork fat absorbs bold smoke well. Cherry adds color and sweetness to balance hickory's pungency." },
  { meat: "Pulled Pork", emoji: "🐖", primary: "Hickory", secondary: "Apple, Pecan", avoid: "Mesquite", why: "8–12 hour cook — avoid intense woods. Hickory with a fruit-wood secondary is the classic combination." },
  { meat: "Chicken", emoji: "🍗", primary: "Cherry", secondary: "Apple, Pecan", avoid: "Mesquite, Hickory (heavy use)", why: "Poultry skin is porous and absorbs smoke aggressively. Mild woods prevent bitter, resinous skin." },
  { meat: "Salmon & Fish", emoji: "🐟", primary: "Alder", secondary: "Apple, Cherry", avoid: "Hickory, Mesquite, Oak", why: "Fish cooks fast and has a delicate flavor — strong woods completely overwhelm it." },
  { meat: "Lamb", emoji: "🫀", primary: "Cherry", secondary: "Hickory (light)", avoid: "Mesquite", why: "Lamb has natural gamey notes — cherry wood's sweetness complements and softens them." },
  { meat: "Venison", emoji: "🦌", primary: "Hickory", secondary: "Cherry, Pecan", avoid: "Mesquite", why: "Game meat's strong flavor stands up to hickory. Cherry blended in adds balance." },
  { meat: "Turkey", emoji: "🦃", primary: "Apple", secondary: "Cherry, Pecan", avoid: "Mesquite, Heavy hickory", why: "Turkey cooks long but is mild — fruit woods add smoke presence without bitterness risk." },
];

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: "Chips vs chunks vs logs — what's the difference?",
    a: "Chips (small pieces) burn fast — 20–40 minutes — ideal for gas grills, quick cooks, or adding a burst of smoke. Chunks (fist-sized pieces) burn 45–90 minutes and are the right choice for charcoal and offset smoker cooks under 4 hours. Logs are used in dedicated offset smokers and stick burners for all-day cooks. For most home cooks on a kettle or ceramic cooker, chunks are the format to use.",
  },
  {
    q: "Wet vs dry wood — should I soak my chips?",
    a: "Soaking does not produce more smoke — it produces steam, then smoke once the water evaporates. The result is a longer delay before you get smoke, and potentially more particulate/white smoke (which carries bitter compounds) rather than the clean blue smoke you want. Dry wood is better. The 'soak your chips' advice is outdated. The exception: on a very hot gas grill where chips would catch fire instantly, a brief 30-minute soak can slow combustion enough to get smoke output.",
  },
  {
    q: "How much wood should I use?",
    a: "Far less than most beginners think. For a 12-hour brisket cook, 4–6 fist-sized chunks in the first 4–5 hours is typically enough. Meat absorbs most of its smoke in the first half of any cook — once the bark has set, adding more wood contributes little extra flavor and risks bitterness. The goal is thin blue smoke from the chimney, not billowing white clouds.",
  },
  {
    q: "What is blue smoke vs white smoke?",
    a: "Thin, almost invisible blue smoke is what you want — it's produced by clean combustion and carries the flavor compounds (guaiacol and syringol) that create the BBQ flavor we love. White or grey billowing smoke is produced by incomplete combustion and carries bitter, harsh compounds including creosote. If your smoker is producing white smoke, wait for it to clear before adding meat. Managing your fire to produce blue smoke consistently is the single biggest quality lever in smoking.",
  },
  {
    q: "Can I use any hardwood, or only BBQ-specific wood?",
    a: "Use only dry, untreated hardwoods. Never use softwoods (pine, cedar, fir, spruce) — they contain resins and terpenes that produce toxic, bitter smoke. Never use treated, painted, or composite wood. Avoid wood from trees that produce toxic berries or leaves (oleander, yew). The safest approach: buy wood specifically sold for cooking from reputable BBQ supply companies.",
  },
  {
    q: "Does the wood type affect the smoke ring?",
    a: "Slightly — but the smoke ring is primarily caused by nitrogen dioxide (NO₂) in the smoke reacting with myoglobin in the meat, not the wood species. Any hardwood produces this reaction. Temperature matters more: a smoke ring develops most aggressively when meat is cold and the surface is wet. Starting with a cold brisket straight from the fridge gives you a better smoke ring than pre-warming it.",
  },
];

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════════════════════ */
export function BBQWoodFlavorGuidePage() {
  const pageUrl = `${SITE_URL}/bbq-wood-flavor-guide`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "BBQ Wood Flavor Guide: Hickory, Cherry, Oak & Every Smoking Wood Explained",
    "description": "The complete guide to BBQ smoking woods — flavor profiles, intensity ratings, meat pairings, and pitmaster tips for hickory, cherry, apple, post oak, mesquite, pecan, alder, and maple.",
    "url": pageUrl,
    "author": { "@type": "Person", "name": "Juicy Joe", "url": `${SITE_URL}/author/juicy-joe` },
    "publisher": { "@type": "Organization", "name": "Meat Lovers Hub", "url": SITE_URL },
    "datePublished": "2026-05-13",
    "dateModified": "2026-05-13",
    "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl },
    "about": [
      { "@type": "Thing", "name": "BBQ Smoking Woods" },
      { "@type": "Thing", "name": "Wood Flavor Profiles" },
      { "@type": "Thing", "name": "Barbecue Technique" },
    ],
    "keywords": "BBQ wood chips, hickory smoke flavor, cherry wood BBQ, post oak brisket, mesquite vs hickory, best wood for smoking, wood pairing guide",
    "inLanguage": "en-US",
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
        title="BBQ Wood Flavor Guide: Hickory, Cherry, Oak & Every Smoking Wood Explained"
        description="Hickory vs cherry vs post oak vs mesquite — flavor profiles, intensity ratings, and exact meat pairings for every BBQ smoking wood. Includes chips vs chunks, blue smoke vs white smoke, and pitmaster tips."
        image="/blog-images/bbq-smoking-woods-oak-hickory-cherry.webp"
        url={pageUrl}
        type="article"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: "Guides", url: `${SITE_URL}/guides` },
          { name: "BBQ Wood Flavor Guide", url: pageUrl },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ background: "#F9F6F1", minHeight: "100vh", fontFamily: SS, display: "flex", flexDirection: "column" }}>
        <SiteHeader activeNav="/guides" />

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "linear-gradient(155deg, #0c0a02 0%, #1a1206 55%, #0e0b03 100%)",
            padding: "5rem 1.5rem 4.5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.016) 1px, transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div aria-hidden="true" style={{ position: "absolute", top: "40%", left: "18%", width: "520px", height: "520px", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(180,69,14,0.15) 0%, transparent 70%)", transform: "translateY(-50%)", pointerEvents: "none" }} />

          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" style={{ marginBottom: "1.5rem" }}>
              <ol style={{ display: "flex", gap: "0.4rem", listStyle: "none", padding: 0, margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", flexWrap: "wrap" }}>
                <li><Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Home</Link></li>
                <li>/</li>
                <li><Link href="/guides" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Guides</Link></li>
                <li>/</li>
                <li style={{ color: "rgba(255,255,255,0.7)" }}>BBQ Wood Guide</li>
              </ol>
            </nav>

            {/* Label */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "1.25rem" }}>
              <div style={{ width: "26px", height: "26px", background: "#b45309", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden="true">
                <Flame style={{ width: "0.8rem", height: "0.8rem", color: "#fff" }} />
              </div>
              <span style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.17em", textTransform: "uppercase", color: "rgba(255,190,90,0.85)" }}>
                Smoking Technique
              </span>
            </div>

            <h1 style={{ fontFamily: SF, fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)", fontWeight: 300, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.035em", marginBottom: "1.1rem" }}>
              BBQ Wood Flavor Guide<br /><em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.65)" }}>Hickory, Cherry, Oak & Every Smoking Wood</em>
            </h1>

            <p style={{ fontFamily: SS, fontSize: "0.93rem", color: "rgba(255,255,255,0.46)", maxWidth: "540px", lineHeight: 1.78, fontWeight: 300, marginBottom: "2rem" }}>
              Eight woods, detailed flavor profiles, intensity ratings, exact meat pairings, and the answers to chips vs chunks, soaking, and blue smoke vs white — everything you need to choose the right wood every time.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <a
                href="#wood-profiles"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#b45309", color: "#fff", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.85rem 1.5rem", borderRadius: "8px", textDecoration: "none", boxShadow: "0 4px 22px rgba(180,83,9,0.42)" }}
              >
                Explore the Woods <ArrowRight style={{ width: "0.78rem", height: "0.78rem" }} />
              </a>
              <a
                href="#pairing-table"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.82)", fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, padding: "0.85rem 1.5rem", borderRadius: "8px", textDecoration: "none" }}
              >
                🗂️ Pairing Table
              </a>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {[
                { label: "Woods covered", value: "8" },
                { label: "Meat pairings", value: "8 cuts" },
                { label: "Reading time", value: "~12 min" },
                { label: "Skill level", value: "All levels" },
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
        <div style={{ width: "100%", maxHeight: "420px", overflow: "hidden", position: "relative" }}>
          <img
            src="/blog-images/bbq-smoking-woods-oak-hickory-cherry.webp"
            alt="Three piles of BBQ smoking wood — oak, hickory, and cherry — labeled on a rustic table with thin blue smoke rising"
            width={1400}
            height={420}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{ width: "100%", height: "420px", objectFit: "cover", display: "block" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 55%, #F9F6F1 100%)" }} />
        </div>

        {/* ── Main content ──────────────────────────────────────────────── */}
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "3.5rem 1.5rem", width: "100%", boxSizing: "border-box" }}>

          {/* Blue smoke callout */}
          <div style={{ background: "#fff", border: "1px solid #EAE5DC", borderLeft: "4px solid #b45309", borderRadius: "10px", padding: "1.5rem 1.75rem", marginBottom: "3rem" }}>
            <p style={{ fontFamily: SS, fontSize: "0.88rem", lineHeight: 1.75, color: "#444", margin: 0 }}>
              <strong style={{ color: "#111" }}>The first rule of smoking wood:</strong> the species matters less than the combustion. Thin, almost-invisible <strong>blue smoke</strong> from any quality hardwood produces the flavor BBQ is famous for. Billowing white or grey smoke — from any wood — carries bitter creosote compounds that ruin food. Master your fire first, then choose your wood.
            </p>
          </div>

          {/* ── Intensity reference ───────────────────────────────────────── */}
          <section aria-labelledby="intensity-heading" style={{ marginBottom: "3.5rem" }}>
            <h2 id="intensity-heading" style={{ fontFamily: SF, fontSize: "clamp(1.7rem, 3.5vw, 2.3rem)", fontWeight: 400, color: "#111", letterSpacing: "-0.025em", marginBottom: "1.5rem" }}>
              Smoke Intensity Scale
            </h2>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              {[
                { level: 1, label: "Very Mild", color: "#86efac", examples: "Alder, Apple" },
                { level: 2, label: "Mild", color: "#fde68a", examples: "Post Oak, Cherry, Maple" },
                { level: 3, label: "Medium", color: "#fdba74", examples: "Pecan" },
                { level: 4, label: "Strong", color: "#fca5a5", examples: "Hickory" },
                { level: 5, label: "Very Strong", color: "#f87171", examples: "Mesquite" },
              ].map(s => (
                <div key={s.level} style={{ flex: "1 1 150px", background: "#fff", border: "1px solid #EAE5DC", borderRadius: "10px", padding: "1rem 1.1rem" }}>
                  <div style={{ display: "flex", gap: "0.2rem", marginBottom: "0.5rem" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} style={{ width: "18px", height: "6px", borderRadius: "3px", background: i < s.level ? s.color : "#EAE5DC" }} />
                    ))}
                  </div>
                  <p style={{ fontFamily: SS, fontSize: "0.8rem", fontWeight: 700, color: "#111", marginBottom: "0.15rem" }}>{s.label}</p>
                  <p style={{ fontFamily: SS, fontSize: "0.72rem", color: "#888" }}>{s.examples}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Wood profiles ─────────────────────────────────────────────── */}
          <section id="wood-profiles" aria-labelledby="woods-heading" style={{ marginBottom: "4rem" }}>
            <h2 id="woods-heading" style={{ fontFamily: SF, fontSize: "clamp(1.7rem, 3.5vw, 2.3rem)", fontWeight: 400, color: "#111", letterSpacing: "-0.025em", marginBottom: "0.5rem" }}>
              The 8 Essential Smoking Woods
            </h2>
            <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#666", lineHeight: 1.7, marginBottom: "2rem" }}>
              Each profile includes flavor description, intensity rating, best meat pairings, what to avoid, and a pitmaster tip you won't find on the bag.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: "1.25rem" }}>
              {WOODS.map((wood) => (
                <WoodCard key={wood.name} wood={wood} />
              ))}
            </div>
          </section>

          {/* ── Pairing table ─────────────────────────────────────────────── */}
          <section id="pairing-table" aria-labelledby="pairing-heading" style={{ marginBottom: "4rem" }}>
            <h2 id="pairing-heading" style={{ fontFamily: SF, fontSize: "clamp(1.7rem, 3.5vw, 2.3rem)", fontWeight: 400, color: "#111", letterSpacing: "-0.025em", marginBottom: "0.5rem" }}>
              Meat-to-Wood Pairing Quick Reference
            </h2>
            <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#666", lineHeight: 1.7, marginBottom: "1.75rem" }}>
              Pick your meat, find your primary wood, add the secondary for complexity, and know what to avoid.
            </p>
            <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #EAE5DC" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: SS, fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "#111", color: "#fff" }}>
                    {["Meat", "Primary Wood", "Secondary / Blend", "Avoid", "Why"].map(h => (
                      <th key={h} style={{ padding: "0.9rem 1.1rem", textAlign: "left", fontWeight: 700, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PAIRINGS.map((row, i) => (
                    <tr key={row.meat} style={{ background: i % 2 === 0 ? "#fff" : "#F9F6F1", borderBottom: "1px solid #EAE5DC" }}>
                      <td style={{ padding: "0.85rem 1.1rem", fontWeight: 700, color: "#111", whiteSpace: "nowrap" }}>{row.emoji} {row.meat}</td>
                      <td style={{ padding: "0.85rem 1.1rem", color: "#B45309", fontWeight: 700 }}>{row.primary}</td>
                      <td style={{ padding: "0.85rem 1.1rem", color: "#555" }}>{row.secondary}</td>
                      <td style={{ padding: "0.85rem 1.1rem", color: "#B91C1C" }}>{row.avoid}</td>
                      <td style={{ padding: "0.85rem 1.1rem", color: "#666", lineHeight: 1.55 }}>{row.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Chips vs chunks ───────────────────────────────────────────── */}
          <section aria-labelledby="format-heading" style={{ marginBottom: "4rem" }}>
            <h2 id="format-heading" style={{ fontFamily: SF, fontSize: "clamp(1.7rem, 3.5vw, 2.3rem)", fontWeight: 400, color: "#111", letterSpacing: "-0.025em", marginBottom: "0.5rem" }}>
              Chips, Chunks & Logs — Which Format to Use
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
              {[
                { format: "Chips", icon: "🪵", burn: "20–40 min", use: "Gas grills, smoker boxes, quick hot-and-fast cooks", tip: "Don't soak them. Add in small batches — a handful at a time. Refresh every 20 minutes if needed." },
                { format: "Chunks", icon: "🪨", burn: "45–90 min", use: "Charcoal kettles, ceramic kamados, offset smokers (shorter cooks)", tip: "The format most home cooks should use. Place 2–3 chunks on unlit coals before lighting for a slow smoke onset." },
                { format: "Logs", icon: "🌲", burn: "2–4 hours", use: "Offset stick burners and large dedicated smokers", tip: "Split logs to 3–4 inch diameter for consistent combustion. Pre-split logs ignite faster and produce cleaner smoke than whole rounds." },
              ].map(f => (
                <motion.div
                  key={f.format}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.38 }}
                  style={{ background: "#fff", border: "1px solid #EAE5DC", borderRadius: "12px", padding: "1.4rem 1.5rem" }}
                >
                  <div style={{ fontSize: "1.8rem", marginBottom: "0.6rem" }} aria-hidden="true">{f.icon}</div>
                  <h3 style={{ fontFamily: SF, fontSize: "1.2rem", fontWeight: 700, color: "#111", marginBottom: "0.3rem" }}>{f.format}</h3>
                  <p style={{ fontFamily: SS, fontSize: "0.72rem", fontWeight: 700, color: "#B45309", marginBottom: "0.6rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>Burns: {f.burn}</p>
                  <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#555", lineHeight: 1.65, marginBottom: "0.75rem" }}><strong style={{ color: "#111" }}>Best for:</strong> {f.use}</p>
                  <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "#777", borderTop: "1px solid #F3EFE7", paddingTop: "0.65rem", lineHeight: 1.6 }}>💡 {f.tip}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Internal link to brisket rub ──────────────────────────────── */}
          <div style={{ background: "#fff", border: "1px solid #EAE5DC", borderLeft: "4px solid #CC2222", borderRadius: "10px", padding: "1.4rem 1.75rem", marginBottom: "4rem" }}>
            <p style={{ fontFamily: SS, fontSize: "0.88rem", lineHeight: 1.75, color: "#444", margin: 0 }}>
              <strong style={{ color: "#111" }}>Wood + rub work together.</strong> The wood you choose should complement your rub, not compete with it. Post oak pairs with a simple salt-and-pepper crust; hickory or cherry suits a competition rub with brown sugar. Read how each pairing works in practice in{" "}
              <Link href="/blog/best-bbq-rub-for-brisket" style={{ color: "#CC2222", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                the brisket rub guide — including the "Science of 16-Mesh Pepper" section
              </Link>{" "}
              that explains how rub texture affects smoke adhesion.
            </p>
          </div>

          {/* ── FAQ ───────────────────────────────────────────────────────── */}
          <section aria-labelledby="faq-heading" style={{ marginBottom: "4rem" }}>
            <h2 id="faq-heading" style={{ fontFamily: SF, fontSize: "clamp(1.7rem, 3.5vw, 2.3rem)", fontWeight: 400, color: "#111", letterSpacing: "-0.025em", marginBottom: "1.75rem" }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {FAQS.map(faq => (
                <FAQItem key={faq.q} faq={faq} />
              ))}
            </div>
          </section>

          {/* ── CTA band ──────────────────────────────────────────────────── */}
          <div style={{ background: "#111", borderRadius: "14px", padding: "2.25rem 2.25rem", display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontFamily: SF, fontSize: "clamp(1.3rem, 3vw, 1.7rem)", fontWeight: 500, color: "#fff", letterSpacing: "-0.02em", marginBottom: "0.35rem", lineHeight: 1.2 }}>
                Pick your wood. <em>Cook something.</em>
              </p>
              <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>
                Brisket, ribs, chicken, venison — all the recipes are here.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", flexShrink: 0 }}>
              <Link href="/recipes/category/bbq" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "#b45309", color: "#fff", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.85rem 1.4rem", borderRadius: "8px", textDecoration: "none", boxShadow: "0 4px 18px rgba(180,83,9,0.38)", whiteSpace: "nowrap" }}>
                BBQ Recipes <ArrowRight style={{ width: "0.78rem", height: "0.78rem" }} />
              </Link>
              <Link href="/guides" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)", fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, padding: "0.85rem 1.4rem", borderRadius: "8px", textDecoration: "none", whiteSpace: "nowrap" }}>
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

/* ── Wood card ────────────────────────────────────────────────────────────── */
function WoodCard({ wood }: { wood: WoodEntry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      style={{ background: "#fff", border: "1px solid #EAE5DC", borderRadius: "12px", overflow: "hidden" }}
    >
      {/* Header strip */}
      <div style={{ background: wood.color, padding: "1rem 1.4rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.5rem", lineHeight: 1 }} aria-hidden="true">{wood.emoji}</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: SF, fontSize: "1.3rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", marginBottom: "0.1rem" }}>{wood.name}</h3>
          <p style={{ fontFamily: SS, fontSize: "0.7rem", color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{wood.flavor}</p>
        </div>
        {/* Intensity dots */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.3rem", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "3px" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: i < wood.intensity ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.22)" }} aria-hidden="true" />
            ))}
          </div>
          <span style={{ fontFamily: SS, fontSize: "0.63rem", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>{wood.intensityLabel}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "1.25rem 1.4rem" }}>
        <p style={{ fontFamily: SS, fontSize: "0.83rem", color: "#444", lineHeight: 1.7, marginBottom: "1rem" }}>{wood.notes}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.9rem" }}>
          <div style={{ background: "#F0FDF4", borderRadius: "8px", padding: "0.75rem" }}>
            <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, color: "#166534", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.35rem" }}>✓ Best for</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {wood.bestFor.map(b => (
                <li key={b} style={{ fontFamily: SS, fontSize: "0.78rem", color: "#166534", marginBottom: "0.15rem" }}>{b}</li>
              ))}
            </ul>
          </div>
          <div style={{ background: wood.avoidFor.length ? "#FEF2F2" : "#F9F6F1", borderRadius: "8px", padding: "0.75rem" }}>
            <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, color: wood.avoidFor.length ? "#991B1B" : "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.35rem" }}>
              {wood.avoidFor.length ? "✗ Avoid for" : "✓ Very versatile"}
            </p>
            {wood.avoidFor.length ? (
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {wood.avoidFor.map(a => (
                  <li key={a} style={{ fontFamily: SS, fontSize: "0.78rem", color: "#991B1B", marginBottom: "0.15rem" }}>{a}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontFamily: SS, fontSize: "0.78rem", color: "#888" }}>Works with virtually any meat</p>
            )}
          </div>
        </div>

        <div style={{ background: "#FEF3C7", borderRadius: "8px", padding: "0.75rem 0.9rem" }}>
          <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "#78350f", lineHeight: 1.6, margin: 0 }}>
            🔥 <strong>Pitmaster tip:</strong> {wood.proTip}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── FAQ accordion ────────────────────────────────────────────────────────── */
function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#fff", border: "1px solid #EAE5DC", borderRadius: "10px", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "1.15rem 1.4rem", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ fontFamily: SF, fontSize: "1.08rem", fontWeight: 600, color: "#111", lineHeight: 1.3 }}>{faq.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }} style={{ flexShrink: 0 }}>
          <ChevronDown style={{ width: "1rem", height: "1rem", color: "#888" }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
            <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#555", lineHeight: 1.75, padding: "0 1.4rem 1.2rem" }}>{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
