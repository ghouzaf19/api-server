import { useState } from "react";
import { Link } from "wouter";
import { Mail, Star, Zap, Gift, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

const PERKS = [
  { icon: <Zap style={{ width: "1.1rem", height: "1.1rem", color: "#ff4d4d" }} />, title: "Fresh recipes every week", desc: "New cuts, new techniques — straight to your inbox before they hit the site." },
  { icon: <Star style={{ width: "1.1rem", height: "1.1rem", color: "#ff4d4d" }} />, title: "Joe's secret tips", desc: "The little tricks that take your meat from good to jaw-dropping." },
  { icon: <Gift style={{ width: "1.1rem", height: "1.1rem", color: "#ff4d4d" }} />, title: "Subscriber-only recipes", desc: "Special recipes that never get posted publicly. Only for the crew." },
  { icon: <Mail style={{ width: "1.1rem", height: "1.1rem", color: "#ff4d4d" }} />, title: "No spam. Ever.", desc: "One email a week. Useful, fun, and always about meat. Unsubscribe any time." },
];

export function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJoined(true);
  }

  return (
    <div style={{ background: "#F9F6F1", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>
      <SiteHeader activeNav="/newsletter" />

      {/* Hero */}
      <div style={{ background: "#111", padding: "5rem 2rem 4rem", textAlign: "center" }}>
        <p style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff4d4d", marginBottom: "1rem" }}>Join the crew</p>
        <h1 style={{ fontFamily: SF, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 600, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
          Get Juicy Recipes<br /><em style={{ fontWeight: 300 }}>Straight to Your Inbox</em>
        </h1>
        <p style={{ fontFamily: SS, fontSize: "1rem", color: "rgba(255,255,255,0.5)", maxWidth: "460px", margin: "0 auto", lineHeight: 1.7 }}>
          Join 4,000+ meat lovers who get fresh recipes, secret tips, and exclusive content every week. It's free. It's good. It's very meaty.
        </p>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "4rem 2rem", flex: 1 }}>

        {/* Perks grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "3rem" }}>
          {PERKS.map((p) => (
            <div key={p.title} style={{ background: "#fff", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ marginBottom: "0.65rem" }}>{p.icon}</div>
              <p style={{ fontFamily: SS, fontSize: "0.85rem", fontWeight: 700, color: "#111", margin: "0 0 0.35rem" }}>{p.title}</p>
              <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "#777", margin: 0, lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Signup form */}
        {joined ? (
          <div style={{ background: "#111", borderRadius: "1.5rem", padding: "3rem", textAlign: "center" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🥩🔥</p>
            <h2 style={{ fontFamily: SF, fontSize: "2rem", fontWeight: 600, color: "#fff", marginBottom: "0.75rem" }}>You're in the crew!</h2>
            <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: "360px", margin: "0 auto 1.75rem" }}>
              Juicy Joe is already working on your first recipe drop. Check your inbox soon. 🍖
            </p>
            <Link href="/recipes" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#ff4d4d", color: "#fff", fontFamily: SS, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.9rem 1.75rem", borderRadius: "8px", textDecoration: "none" }}>
              Browse Recipes <ArrowRight style={{ width: "0.85rem", height: "0.85rem" }} />
            </Link>
          </div>
        ) : (
          <div style={{ background: "#111", borderRadius: "1.5rem", padding: "2.5rem" }}>
            <h2 style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#fff", marginBottom: "0.5rem", lineHeight: 1.1 }}>Ready to level up your meat game?</h2>
            <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", marginBottom: "1.75rem", lineHeight: 1.6 }}>Drop your email below — one tap, that's it.</p>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ flex: 1, minWidth: "220px", padding: "0.85rem 1.25rem", fontFamily: SS, fontSize: "0.9rem", borderRadius: "8px", border: "1.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", color: "#fff", outline: "none" }}
              />
              <button
                type="submit"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#ff4d4d", color: "#fff", fontFamily: SS, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.85rem 1.5rem", borderRadius: "8px", border: "none", cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(255,77,77,0.4)" }}
              >
                Subscribe Free <ArrowRight style={{ width: "0.85rem", height: "0.85rem" }} />
              </button>
            </form>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
