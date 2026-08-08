import { Link } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

const sections = [
  {
    title: "Using this site",
    body: "Meat Lovers Hub is a free recipe blog run by Juicy Joe. You're welcome to browse, cook along, save your favorites, and share recipes with friends. Please don't scrape, copy, or republish our content in bulk — a link back is always appreciated.",
  },
  {
    title: "Recipe results",
    body: "All recipes are tested in a home kitchen and written in good faith. Cooking times, temperatures, and results may vary depending on your equipment and ingredients. Always use safe food handling practices and check internal temperatures with a meat thermometer.",
  },
  {
    title: "Nutritional information",
    body: "Any nutritional estimates provided are approximate and for general informational purposes only. They are not intended as dietary or medical advice. Consult a qualified nutritionist or doctor if you have specific dietary needs.",
  },
  {
    title: "Intellectual property",
    body: "All original text, photos, and recipes on this site are the property of Meat Lovers Hub / Juicy Joe. You may share a recipe link freely, but please don't copy and republish full recipes without permission. For collaboration or licensing inquiries, reach out via the contact page.",
  },
  {
    title: "External links",
    body: "We occasionally link to products, tools, or other websites. Some links may be affiliate links — if you buy something through them, we may earn a small commission at no extra cost to you. We only recommend things we'd actually use.",
  },
  {
    title: "Limitation of liability",
    body: "Meat Lovers Hub is not liable for any injury, illness, or damage arising from the use of recipes or information on this site. Cook safely, use proper equipment, and enjoy every bite. We're just here to help you cook great meat.",
  },
  {
    title: "Changes to these terms",
    body: "We reserve the right to update these terms at any time. Continued use of the site after changes are posted means you accept the updated terms. If you have questions, drop us a line via the contact page.",
  },
];

export function TermsPage() {
  return (
    <div style={{ background: "#F9F6F1", minHeight: "100vh" }}>
      <SiteHeader />

      {/* Hero */}
      <div style={{ background: "#111", padding: "5rem 2rem 4rem", textAlign: "center" }}>
        <p style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff4d4d", marginBottom: "1rem" }}>Legal stuff</p>
        <h1 style={{ fontFamily: SF, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 600, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
          Terms of Service
        </h1>
        <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "rgba(255,255,255,0.35)", margin: "0 auto" }}>
          Last updated: January 1, 2026
        </p>
      </div>

      <div style={{ maxWidth: "740px", margin: "0 auto", padding: "4rem 2rem" }}>
        <div style={{ background: "#fff5f0", border: "1.5px solid #ffe0d6", borderRadius: "1rem", padding: "1.25rem 1.5rem", marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#c0392b", margin: 0, lineHeight: 1.6 }}>
            <strong>Short version:</strong> Use the site for good, don't copy our work without credit, cook safely, and enjoy the recipes. By using Meat Lovers Hub, you agree to these terms.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {sections.map((s, i) => (
            <div key={s.title} style={{ background: "#fff", borderRadius: "1rem", padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <span style={{ fontFamily: SS, fontSize: "0.72rem", fontWeight: 800, color: "#ff4d4d", background: "#fff0ee", borderRadius: "999px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>{i + 1}</span>
                <div>
                  <h2 style={{ fontFamily: SF, fontSize: "1.35rem", fontWeight: 600, color: "#111", margin: "0 0 0.5rem", lineHeight: 1.1 }}>{s.title}</h2>
                  <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "#555", margin: 0, lineHeight: 1.8 }}>{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#888", marginBottom: "1rem" }}>Questions about these terms?</p>
          <Link href="/contact" style={{ fontFamily: SS, fontSize: "0.82rem", fontWeight: 700, color: "#ff4d4d", textDecoration: "none" }}>Contact Joe →</Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
