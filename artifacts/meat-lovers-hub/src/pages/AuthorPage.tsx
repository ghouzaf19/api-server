import { useEffect } from "react";
import { Link } from "wouter";
import { SITE_URL } from "@/lib/siteUrl";
import { ArrowRight, ExternalLink, Award, BookOpen, Flame, Star } from "lucide-react";
import { SeoMeta } from "@/components/SeoMeta";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { RECIPES } from "@/data/recipes";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

const POPULAR_RECIPES = [...RECIPES].sort((a, b) =>
  parseFloat(b.saves.replace("k", "")) * (b.saves.includes("k") ? 1000 : 1) -
  parseFloat(a.saves.replace("k", "")) * (a.saves.includes("k") ? 1000 : 1)
).slice(0, 3);

const EXPERTISE = [
  { label: "Steak & Beef", emoji: "🥩" },
  { label: "BBQ & Smoking", emoji: "🔥" },
  { label: "Burgers", emoji: "🍔" },
  { label: "Slow Cooking", emoji: "🍲" },
  { label: "Grilling", emoji: "🍖" },
  { label: "Cast Iron Cooking", emoji: "🍳" },
];

export function AuthorPage() {
  const origin = SITE_URL;

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${origin}/#juicy-joe`,
      "name": "Juicy Joe",
      "url": `${origin}/author/juicy-joe`,
      "image": {
        "@type": "ImageObject",
        "url": "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop&q=85",
        "width": 400,
        "height": 400,
      },
      "description": "Home cook, food writer, and meat obsessive. Creator of Meat Lovers Hub — testing every recipe in a real home kitchen so you don't have to guess.",
      "jobTitle": "Recipe Developer & Food Writer",
      "worksFor": {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        "name": "Meat Lovers Hub",
      },
      "knowsAbout": [
        "Steak cooking techniques",
        "BBQ and grilling",
        "Burger recipes",
        "Slow cooking",
        "Meat thermometer use",
        "Cast iron cooking",
        "Food safety and safe meat temperatures",
      ],
      "sameAs": [
        "https://pinterest.com",
      ],
    };

    const existing = document.getElementById("author-person-jsonld");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "author-person-jsonld";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById("author-person-jsonld")?.remove(); };
  }, [origin]);

  return (
    <>
      <SeoMeta
        title="About Juicy Joe — Recipe Developer & Meat Cooking Expert"
        description="Meet Juicy Joe, the home cook behind Meat Lovers Hub. Over 200 recipes tested in a real kitchen. No chef school — just obsessive testing and insanely good results."
        image="https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=630&fit=crop&q=85"
        imageAlt="Juicy Joe's kitchen — cast iron skillet with perfectly seared steak"
        type="profile"
        url={`${origin}/author/juicy-joe`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${origin}/` },
          { name: "About", url: `${origin}/about` },
          { name: "Juicy Joe", url: `${origin}/author/juicy-joe` },
        ]}
      />

      <div style={{ background: "#F9F6F1", minHeight: "100vh" }}>
        <SiteHeader activeNav="/about" />

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #111 0%, #1a0a0a 100%)", padding: "5rem 2rem 4rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://images.unsplash.com/photo-1558030006-450675393462?w=1400&q=40)", backgroundSize: "cover", backgroundPosition: "center 35%", opacity: 0.12 }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff4d4d", marginBottom: "1.25rem" }}>
              Recipe Developer & Food Writer
            </p>

            {/* Avatar */}
            <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "linear-gradient(135deg, #ff4d4d, #ff8c00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", margin: "0 auto 1.5rem", boxShadow: "0 0 0 4px rgba(255,77,77,0.2), 0 0 0 8px rgba(255,77,77,0.08)", border: "3px solid rgba(255,255,255,0.12)" }}>
              🍖
            </div>

            <h1 style={{ fontFamily: SF, fontSize: "clamp(2.8rem, 7vw, 5.5rem)", fontWeight: 600, color: "#fff", lineHeight: 1.0, letterSpacing: "-0.03em", marginBottom: "1rem" }}>
              Juicy Joe
            </h1>
            <p style={{ fontFamily: SS, fontSize: "1rem", color: "rgba(255,255,255,0.55)", maxWidth: "520px", margin: "0 auto 2rem", lineHeight: 1.75 }}>
              Home cook turned meat obsessive. I've spent years testing, failing, and perfecting recipes in my real home kitchen — so every recipe you find here actually works.
            </p>

            {/* Expertise badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", justifyContent: "center", marginBottom: "2.5rem" }}>
              {EXPERTISE.map(({ label, emoji }) => (
                <span key={label} style={{ fontFamily: SS, fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "999px", padding: "0.3rem 0.85rem" }}>
                  {emoji} {label}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap" }}>
              {[
                { value: "200+", label: "Recipes Tested" },
                { value: "76k+", label: "Pinterest Saves" },
                { value: "5★", label: "Average Rating" },
                { value: "7+", label: "Years Cooking" },
              ].map(({ value, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: SF, fontSize: "2rem", fontWeight: 600, color: "#fff", lineHeight: 1, margin: 0 }}>{value}</p>
                  <p style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "0.2rem" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: "780px", margin: "0 auto", padding: "4rem 2rem" }}>

          {/* Story */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginBottom: "3rem" }}>

            <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "2.5rem", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
              <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff4d4d", marginBottom: "0.75rem" }}>How it started</p>
              <h2 style={{ fontFamily: SF, fontSize: "1.9rem", fontWeight: 600, color: "#111", marginBottom: "1rem", lineHeight: 1.1 }}>One terrible steak changed everything</h2>
              <p style={{ fontFamily: SS, fontSize: "0.92rem", color: "#555", lineHeight: 1.85, marginBottom: "1rem" }}>
                I spent years ordering overpriced, disappointing steaks at restaurants — until the night I decided to cook one myself. It was a disaster. Grey, chewy, zero flavour. But instead of giving up, I got <em>obsessed</em>.
              </p>
              <p style={{ fontFamily: SS, fontSize: "0.92rem", color: "#555", lineHeight: 1.85 }}>
                I read every article, watched every video, talked to butchers, and cooked hundreds of steaks until I figured out <em>exactly</em> what makes meat sing. And then I started writing it all down — not in chef-school language, but the way a friend would explain it: straightforward, honest, and actually useful.
              </p>
            </div>

            <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "2.5rem", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
              <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff4d4d", marginBottom: "0.75rem" }}>My credentials</p>
              <h2 style={{ fontFamily: SF, fontSize: "1.9rem", fontWeight: 600, color: "#111", marginBottom: "1.25rem", lineHeight: 1.1 }}>Real experience, not culinary school</h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {[
                  { icon: <Flame style={{ width: "1rem", height: "1rem", color: "#ff4d4d" }} />, text: "7+ years cooking meat professionally in my home kitchen — tested on real weeknights with real constraints" },
                  { icon: <Award style={{ width: "1rem", height: "1rem", color: "#ff4d4d" }} />, text: "200+ recipes developed, tested, and refined across all cuts and cooking methods" },
                  { icon: <Star style={{ width: "1rem", height: "1rem", color: "#ff4d4d" }} />, text: "76,000+ saves on Pinterest — proof these recipes actually work for real home cooks" },
                  { icon: <BookOpen style={{ width: "1rem", height: "1rem", color: "#ff4d4d" }} />, text: "Every recipe is cross-referenced with food safety guidelines (USDA) and culinary science resources" },
                ].map(({ icon, text }, i) => (
                  <li key={i} style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start", padding: "0.85rem 1rem", background: "#F9F6F1", borderRadius: "0.75rem" }}>
                    <span style={{ flexShrink: 0, marginTop: "0.1rem" }}>{icon}</span>
                    <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "#555", lineHeight: 1.65, margin: 0 }}>{text}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Testing Methodology */}
            <div style={{ background: "#111", borderRadius: "1.25rem", padding: "2.5rem" }}>
              <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff8080", marginBottom: "0.75rem" }}>How I develop recipes</p>
              <h2 style={{ fontFamily: SF, fontSize: "1.9rem", fontWeight: 600, color: "#fff", marginBottom: "1.25rem", lineHeight: 1.1 }}>Every recipe is tested — not assumed</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="md:grid-cols-2">
                {[
                  { step: "01", title: "First cook", desc: "I make the recipe as a beginner would — no shortcuts, just the base method." },
                  { step: "02", title: "I find the failures", desc: "I note every point where something could go wrong and test alternate approaches." },
                  { step: "03", title: "Multiple tests", desc: "I cook the recipe at least 3x before publishing, often more for complex dishes." },
                  { step: "04", title: "Real kitchen only", desc: "No commercial equipment. If it works on my standard home stove, it works everywhere." },
                ].map(({ step, title, desc }) => (
                  <div key={step} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "0.85rem", padding: "1.25rem" }}>
                    <p style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 800, color: "#ff4d4d", letterSpacing: "0.1em", margin: "0 0 0.35rem" }}>{step}</p>
                    <p style={{ fontFamily: SF, fontSize: "1.05rem", fontWeight: 700, color: "#fff", margin: "0 0 0.4rem" }}>{title}</p>
                    <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.65, margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <Link href="/editorial-policy" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: SS, fontSize: "0.8rem", fontWeight: 600, color: "#ff8080", textDecoration: "none" }}>
                  Read our full editorial policy <ArrowRight style={{ width: "0.85rem", height: "0.85rem" }} />
                </Link>
              </div>
            </div>

            {/* External references */}
            <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "2.5rem", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
              <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff4d4d", marginBottom: "0.75rem" }}>Sources I trust</p>
              <h2 style={{ fontFamily: SF, fontSize: "1.9rem", fontWeight: 600, color: "#111", marginBottom: "1rem", lineHeight: 1.1 }}>Built on science, not guesswork</h2>
              <p style={{ fontFamily: SS, fontSize: "0.92rem", color: "#555", lineHeight: 1.85, marginBottom: "1.25rem" }}>
                My recipes are backed by food science and safety standards, not just personal preference. I regularly reference these trusted sources:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[
                  { label: "USDA Food Safety & Inspection Service", url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation", note: "Safe meat temperatures & handling guidelines" },
                  { label: "Serious Eats — The Food Lab", url: "https://www.seriouseats.com/the-food-lab", note: "Science-backed cooking methodology" },
                  { label: "AmazingRibs.com", url: "https://amazingribs.com", note: "BBQ & grilling expertise and meat science" },
                  { label: "America's Test Kitchen", url: "https://www.americastestkitchen.com", note: "Tested recipes and culinary research" },
                ].map(({ label, url, note }) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem", background: "#F9F6F1", borderRadius: "0.75rem", textDecoration: "none", border: "1px solid #EAE5DC" }}>
                    <ExternalLink style={{ width: "0.85rem", height: "0.85rem", color: "#ff4d4d", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontFamily: SS, fontSize: "0.85rem", fontWeight: 600, color: "#111", margin: 0 }}>{label}</p>
                      <p style={{ fontFamily: SS, fontSize: "0.75rem", color: "#999", margin: 0 }}>{note}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Popular Recipes */}
          <div style={{ marginBottom: "3rem" }}>
            <p style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", marginBottom: "0.5rem" }}>Most saved recipes</p>
            <h2 style={{ fontFamily: SF, fontSize: "2.2rem", fontWeight: 300, color: "#111", letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
              Joe's Top <em>Recipes</em>
            </h2>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              {POPULAR_RECIPES.map((r) => (
                <Link key={r.id} href={`/recipes/${r.id}`} style={{ textDecoration: "none", display: "block", borderRadius: "1rem", overflow: "hidden", background: "#fff", border: "1px solid #EAE5DC", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                  <div style={{ height: "160px", overflow: "hidden" }}>
                    <img src={r.imageTall} alt={r.imageAlt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <p style={{ fontFamily: SF, fontSize: "1.05rem", fontWeight: 600, color: "#111", margin: "0 0 0.25rem", lineHeight: 1.25 }}>{r.title}</p>
                    <p style={{ fontFamily: SS, fontSize: "0.72rem", color: "#E60023", fontWeight: 700, margin: 0 }}>📌 {r.saves} saves</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/recipes" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#ff4d4d", color: "#fff", fontFamily: SS, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "1rem 2rem", borderRadius: "8px", textDecoration: "none", boxShadow: "0 4px 20px rgba(255,77,77,0.35)" }}>
              See All Recipes <ArrowRight style={{ width: "0.9rem", height: "0.9rem" }} />
            </Link>
            <Link href="/editorial-policy" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#fff", color: "#333", fontFamily: SS, fontSize: "0.82rem", fontWeight: 600, padding: "1rem 1.75rem", borderRadius: "8px", textDecoration: "none", border: "1.5px solid #E8E0D3" }}>
              Editorial Policy
            </Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    </>
  );
}
