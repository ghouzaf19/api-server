import { Link } from "wouter";
import { ArrowRight, CheckCircle, RefreshCw, BookOpen, Mail, AlertCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/siteUrl";
import { SeoMeta } from "@/components/SeoMeta";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

const PROCESS_STEPS = [
  {
    num: "01",
    title: "Initial research",
    desc: "Each recipe begins with thorough research — studying cooking techniques, reading culinary science resources, and reviewing USDA food safety guidelines for safe internal temperatures.",
  },
  {
    num: "02",
    title: "First test cook",
    desc: "The recipe is cooked from scratch using standard home kitchen equipment — no commercial ovens, no chef tools. If it doesn't work on a regular stove, it doesn't publish.",
  },
  {
    num: "03",
    title: "Failure analysis",
    desc: "Every step where something could go wrong is identified. Timing, temperature, and technique variations are tested to find the most reliable path to a great result.",
  },
  {
    num: "04",
    title: "Multiple test cooks",
    desc: "Recipes are cooked at least 3 times before publishing — often more for complex dishes. Each test refines the instructions until they're genuinely foolproof.",
  },
  {
    num: "05",
    title: "Food safety verification",
    desc: "All safe cooking temperatures and food handling practices are verified against USDA guidelines before a recipe is approved.",
  },
  {
    num: "06",
    title: "Publication & monitoring",
    desc: "Once published, reader feedback, new research, and updated food safety guidance are monitored. Recipes are updated whenever improvement is warranted.",
  },
];

export function EditorialPolicyPage() {
  const origin = SITE_URL;

  return (
    <>
      <SeoMeta
        title="Editorial Policy — How We Develop & Test Recipes"
        description="Learn how Meat Lovers Hub develops, tests, and updates recipes. Our editorial standards, food safety practices, citation policy, and correction process."
        image="https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=630&fit=crop&q=85"
        imageAlt="Cast iron skillet on a home kitchen stove"
        type="website"
        url={`${origin}/editorial-policy`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${origin}/` },
          { name: "Editorial Policy", url: `${origin}/editorial-policy` },
        ]}
      />

      <div style={{ background: "#F9F6F1", minHeight: "100vh" }}>
        <SiteHeader />

        {/* Hero */}
        <div style={{ background: "#111", padding: "5rem 2rem 4rem", textAlign: "center" }}>
          <p style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff4d4d", marginBottom: "1rem" }}>Transparency first</p>
          <h1 style={{ fontFamily: SF, fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 600, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
            Editorial <em style={{ fontWeight: 300 }}>Policy</em>
          </h1>
          <p style={{ fontFamily: SS, fontSize: "1rem", color: "rgba(255,255,255,0.5)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.75 }}>
            Every recipe on Meat Lovers Hub is developed and tested in a real home kitchen. Here's exactly how we do it — and our standards for accuracy, safety, and freshness.
          </p>
        </div>

        <div style={{ maxWidth: "780px", margin: "0 auto", padding: "4rem 2rem" }}>

          {/* Recipe Development Process */}
          <section style={{ marginBottom: "3rem" }}>
            <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff4d4d", marginBottom: "0.5rem" }}>How we work</p>
            <h2 style={{ fontFamily: SF, fontSize: "2.2rem", fontWeight: 600, color: "#111", marginBottom: "0.75rem", lineHeight: 1.1 }}>Recipe Development Process</h2>
            <p style={{ fontFamily: SS, fontSize: "0.92rem", color: "#777", lineHeight: 1.8, marginBottom: "2rem" }}>
              Every recipe goes through a structured, multi-step development process before it's published. We don't publish untested recipes.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {PROCESS_STEPS.map(({ num, title, desc }) => (
                <div key={num} style={{ display: "flex", gap: "1.25rem", background: "#fff", borderRadius: "1rem", padding: "1.5rem", border: "1px solid #EAE5DC", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ flexShrink: 0, width: "36px", height: "36px", borderRadius: "50%", background: "#ff4d4d", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SS, fontSize: "0.72rem", fontWeight: 800 }}>
                    {num}
                  </div>
                  <div>
                    <p style={{ fontFamily: SF, fontSize: "1.15rem", fontWeight: 700, color: "#111", margin: "0 0 0.35rem" }}>{title}</p>
                    <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#666", lineHeight: 1.7, margin: 0 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Food Safety Standards */}
          <section style={{ marginBottom: "3rem", background: "linear-gradient(135deg, #fff8f5, #fff5f0)", border: "1.5px solid rgba(255,77,77,0.15)", borderRadius: "1.25rem", padding: "2.5rem" }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <AlertCircle style={{ width: "1.4rem", height: "1.4rem", color: "#ff4d4d", flexShrink: 0, marginTop: "0.1rem" }} />
              <div>
                <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff4d4d", marginBottom: "0.35rem" }}>Food safety</p>
                <h2 style={{ fontFamily: SF, fontSize: "1.9rem", fontWeight: 600, color: "#111", marginBottom: "0.75rem", lineHeight: 1.1 }}>Safe Temperatures Are Non-Negotiable</h2>
              </div>
            </div>
            <p style={{ fontFamily: SS, fontSize: "0.92rem", color: "#555", lineHeight: 1.85, marginBottom: "1.25rem" }}>
              All meat temperatures and food safety guidelines on this site are aligned with <a href="https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation" target="_blank" rel="noopener noreferrer" style={{ color: "#ff4d4d", fontWeight: 600 }}>USDA FSIS recommendations</a>. We include internal temperature targets in every recipe where applicable.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { meat: "Whole beef, pork, lamb", temp: "145°F (63°C)" },
                { meat: "Ground beef, pork", temp: "160°F (71°C)" },
                { meat: "Poultry (all forms)", temp: "165°F (74°C)" },
                { meat: "Fish & seafood", temp: "145°F (63°C)" },
              ].map(({ meat, temp }) => (
                <div key={meat} style={{ background: "#fff", borderRadius: "0.75rem", padding: "0.85rem 1rem", border: "1px solid rgba(255,77,77,0.12)" }}>
                  <p style={{ fontFamily: SS, fontSize: "0.8rem", fontWeight: 600, color: "#333", margin: "0 0 0.2rem" }}>{meat}</p>
                  <p style={{ fontFamily: SF, fontSize: "1rem", fontWeight: 700, color: "#ff4d4d", margin: 0 }}>{temp}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Update policy */}
          <section style={{ marginBottom: "3rem", background: "#fff", borderRadius: "1.25rem", padding: "2.5rem", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.25rem" }}>
              <RefreshCw style={{ width: "1.2rem", height: "1.2rem", color: "#ff4d4d" }} />
              <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff4d4d", margin: 0 }}>Keeping content fresh</p>
            </div>
            <h2 style={{ fontFamily: SF, fontSize: "1.9rem", fontWeight: 600, color: "#111", marginBottom: "0.85rem", lineHeight: 1.1 }}>Update & Freshness Policy</h2>
            <p style={{ fontFamily: SS, fontSize: "0.92rem", color: "#555", lineHeight: 1.85, marginBottom: "1rem" }}>
              We actively maintain every published recipe. Each recipe page displays both the original publication date and the most recent update date when content has been revised.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {[
                "Recipes are reviewed and updated when new food safety guidelines are issued",
                "Reader feedback and common mistakes drive improvements to instructions",
                "Updated publication dates reflect meaningful content changes, not minor edits",
                "Ingredient substitutions and technique improvements are added over time",
              ].map((point, i) => (
                <li key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <CheckCircle style={{ width: "1rem", height: "1rem", color: "#ff4d4d", flexShrink: 0, marginTop: "0.15rem" }} />
                  <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "#555", lineHeight: 1.65, margin: 0 }}>{point}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Citations policy */}
          <section style={{ marginBottom: "3rem", background: "#fff", borderRadius: "1.25rem", padding: "2.5rem", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.25rem" }}>
              <BookOpen style={{ width: "1.2rem", height: "1.2rem", color: "#ff4d4d" }} />
              <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff4d4d", margin: 0 }}>External sources</p>
            </div>
            <h2 style={{ fontFamily: SF, fontSize: "1.9rem", fontWeight: 600, color: "#111", marginBottom: "0.85rem", lineHeight: 1.1 }}>Citation & Linking Policy</h2>
            <p style={{ fontFamily: SS, fontSize: "0.92rem", color: "#555", lineHeight: 1.85, marginBottom: "1rem" }}>
              When we reference food science, safety standards, or expert techniques, we link to primary or authoritative sources. We only link to sources we trust and have verified:
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {[
                "Government food safety agencies (USDA, FDA)",
                "Established culinary science publications (Serious Eats, America's Test Kitchen)",
                "Recognised subject-matter expert sites (AmazingRibs.com for BBQ)",
                "We do not link to low-quality, spam, or commercially-motivated sites",
              ].map((point, i) => (
                <li key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <CheckCircle style={{ width: "1rem", height: "1rem", color: "#16a34a", flexShrink: 0, marginTop: "0.15rem" }} />
                  <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "#555", lineHeight: 1.65, margin: 0 }}>{point}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Corrections */}
          <section style={{ background: "#111", borderRadius: "1.25rem", padding: "2.5rem", marginBottom: "3rem" }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.25rem" }}>
              <Mail style={{ width: "1.2rem", height: "1.2rem", color: "#ff8080" }} />
              <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff8080", margin: 0 }}>We're accountable</p>
            </div>
            <h2 style={{ fontFamily: SF, fontSize: "1.9rem", fontWeight: 600, color: "#fff", marginBottom: "0.85rem", lineHeight: 1.1 }}>Corrections & Feedback</h2>
            <p style={{ fontFamily: SS, fontSize: "0.92rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.85, marginBottom: "1.5rem" }}>
              Found an error in a recipe? Noticed an outdated temperature guideline or a step that doesn't work as written? We want to know. We correct mistakes promptly and transparently.
            </p>
            <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#ff4d4d", color: "#fff", fontFamily: SS, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.9rem 1.75rem", borderRadius: "8px", textDecoration: "none", boxShadow: "0 4px 16px rgba(255,77,77,0.3)" }}>
              Contact Us <ArrowRight style={{ width: "0.85rem", height: "0.85rem" }} />
            </Link>
          </section>

          {/* Author card */}
          <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "2rem", border: "1px solid #EAE5DC", display: "flex", gap: "1.25rem", alignItems: "center" }}>
            <div style={{ flexShrink: 0, width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #ff4d4d, #ff8c00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem" }}>
              🍖
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", margin: "0 0 0.2rem" }}>Written & maintained by</p>
              <p style={{ fontFamily: SF, fontSize: "1.2rem", fontWeight: 700, color: "#111", margin: "0 0 0.2rem" }}>Juicy Joe</p>
              <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "#888", margin: 0 }}>Recipe developer and creator of Meat Lovers Hub</p>
            </div>
            <Link href="/author/juicy-joe" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontFamily: SS, fontSize: "0.8rem", fontWeight: 600, color: "#ff4d4d", textDecoration: "none", flexShrink: 0 }}>
              View profile <ArrowRight style={{ width: "0.8rem", height: "0.8rem" }} />
            </Link>
          </div>

        </div>
        <SiteFooter />
      </div>
    </>
  );
}
