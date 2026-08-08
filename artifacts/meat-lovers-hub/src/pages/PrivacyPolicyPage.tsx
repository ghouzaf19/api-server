import { Link } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

const sections = [
  {
    title: "What info we collect",
    body: "When you subscribe to our newsletter, we collect your email address — that's it. If you reach out via the contact form, we also collect your name and message. We don't collect payment info, location data, or anything sketchy.",
  },
  {
    title: "How we use your info",
    body: "Your email is used only to send you Meat Lovers Hub content: new recipes, tips, and occasional announcements. We never sell, rent, or share your data with third parties for marketing purposes. Full stop.",
  },
  {
    title: "Cookies",
    body: "We use minimal, functional cookies to keep the site running smoothly (like remembering your saved collections). We don't run invasive ad-tracking cookies. You can disable cookies in your browser at any time.",
  },
  {
    title: "Third-party links",
    body: "Our recipes may link to products or ingredients on third-party sites (like Amazon). We're not responsible for their privacy practices — check their policies before you share any personal data.",
  },
  {
    title: "Your rights",
    body: "You can unsubscribe from our emails at any time using the link at the bottom of any newsletter. To request deletion of your data, just drop us a message at contact@meatlovershub.com and we'll sort it out fast.",
  },
  {
    title: "Updates to this policy",
    body: "We may update this policy occasionally. If we make significant changes, we'll let newsletter subscribers know. The date at the top of this page always reflects the most recent version.",
  },
];

export function PrivacyPolicyPage() {
  return (
    <div style={{ background: "#F9F6F1", minHeight: "100vh" }}>
      <SiteHeader />

      {/* Hero */}
      <div style={{ background: "#111", padding: "5rem 2rem 4rem", textAlign: "center" }}>
        <p style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff4d4d", marginBottom: "1rem" }}>Legal stuff</p>
        <h1 style={{ fontFamily: SF, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 600, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
          Privacy Policy
        </h1>
        <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "rgba(255,255,255,0.35)", margin: "0 auto" }}>
          Last updated: January 1, 2026
        </p>
      </div>

      <div style={{ maxWidth: "740px", margin: "0 auto", padding: "4rem 2rem" }}>
        <div style={{ background: "#fff5f0", border: "1.5px solid #ffe0d6", borderRadius: "1rem", padding: "1.25rem 1.5rem", marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#c0392b", margin: 0, lineHeight: 1.6 }}>
            <strong>Plain-English version:</strong> We only collect what we need, we never sell your data, and you can opt out any time. The sections below explain everything in detail.
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
          <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#888", marginBottom: "1rem" }}>Questions about this policy?</p>
          <Link href="/contact" style={{ fontFamily: SS, fontSize: "0.82rem", fontWeight: 700, color: "#ff4d4d", textDecoration: "none" }}>Contact Joe →</Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
