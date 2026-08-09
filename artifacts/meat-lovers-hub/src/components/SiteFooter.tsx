import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

/* ── SVG social icons ────────────────────────────────────────────────────── */
const PINTEREST_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);
const INSTAGRAM_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);
const TIKTOK_SVG = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.27 8.27 0 0 0 4.85 1.56V7.16a4.85 4.85 0 0 1-1.08-.47z" />
  </svg>
);

/* ── Footer social icon with branded hover ───────────────────────────────── */
function FooterSocialIcon({ href, label, children, brandColor, glowColor }: {
  href: string; label: string; children: React.ReactNode;
  brandColor: string; glowColor: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <motion.a
      href={href}
      aria-label={label}
      whileHover={{ scale: 1.12, y: -3 }}
      whileTap={{ scale: 0.94 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
        background: hov ? brandColor : "rgba(255,255,255,0.06)",
        border: `1px solid ${hov ? "transparent" : "rgba(255,255,255,0.08)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hov ? "#fff" : "rgba(255,255,255,0.48)",
        textDecoration: "none",
        boxShadow: hov ? `0 6px 20px ${glowColor}` : "none",
        transition: "background 0.22s, color 0.22s, box-shadow 0.22s, border-color 0.22s",
      }}
    >
      {children}
    </motion.a>
  );
}

/* ── Footer newsletter form ──────────────────────────────────────────────── */
function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ fontFamily: SS, fontSize: "0.88rem", color: "#4ade80", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}
      >
        🥩 You're in! Check your inbox Friday.
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={e => { e.preventDefault(); if (email.includes("@")) setSent(true); }}
      style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}
    >
      <label htmlFor="footer-nl-email" className="sr-only">Email address for weekly recipe newsletter</label>
      <input
        id="footer-nl-email"
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ flex: 1, minWidth: "200px", padding: "0.78rem 1.1rem", fontFamily: SS, fontSize: "0.82rem", borderRadius: "8px", border: "1.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.055)", color: "#fff", outline: "none", transition: "border-color 0.2s" }}
        onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(204,34,34,0.5)"; }}
        onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
      />
      <button
        type="submit"
        style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#CC2222", color: "#fff", fontFamily: SS, fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.78rem 1.3rem", borderRadius: "8px", border: "none", cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(180,30,30,0.38)", transition: "box-shadow 0.2s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 22px rgba(180,30,30,0.55)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(180,30,30,0.38)"; }}
      >
        Subscribe Free <ArrowRight style={{ width: "0.8rem", height: "0.8rem" }} />
      </button>
    </form>
  );
}

/* ── Top recipe links ────────────────────────────────────────────────────── */
const TOP_RECIPE_LINKS = [
  { label: "Carnivore Diet Meal Plan",  href: "/recipes/carnivore-meal-plan" },
  { label: "Tomahawk Steak Guide",      href: "/recipes/tomahawk-steak" },
  { label: "Smoked Beef Brisket",       href: "/recipes/smoked-beef-brisket" },
  { label: "Smash Burger Secret Sauce", href: "/recipes/smash-burger" },
  { label: "Reverse Sear Ribeye",       href: "/recipes/reverse-sear-ribeye" },
] as const;

/* ════════════════════════════════════════════════════════════════════════════
   SITE FOOTER
   ════════════════════════════════════════════════════════════════════════════ */
export function SiteFooter() {
  return (
    <footer style={{ background: "#0A0A0A" }}>

      {/* ── Community newsletter band ─────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.055)", padding: "3.5rem 2rem" }}>
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gap: "2.5rem", alignItems: "center" }}
          className="footer-nl-grid"
        >
          {/* Left: community pitch */}
          <div>
            <p style={{ fontFamily: SS, fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#CC2222", marginBottom: "0.8rem" }}>
              📩 From Joe's Kitchen
            </p>
            <p style={{ fontFamily: SF, fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)", fontWeight: 600, color: "#fff", letterSpacing: "-0.025em", marginBottom: "0.5rem", lineHeight: 1.15 }}>
              Get Your Friday Recipe From <em>Juicy Joe</em>
            </p>
            <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", margin: "0 0 1.25rem", lineHeight: 1.75, maxWidth: "380px", fontWeight: 300 }}>
              One tested recipe every Friday — real notes, real results. No spam. No fluff. Just insanely good meat.
            </p>
            {/* Subscriber avatar stack */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ display: "flex" }}>
                {["photo-1546964124-0cce460f38ef", "photo-1544025162-d76694265947", "photo-1558030006-450675393462", "photo-1615937722923-67f6deaf2cc9"].map((id, i) => (
                  <img
                    key={id}
                    src={`https://images.unsplash.com/${id}?w=80&h=80&fit=crop&q=70`}
                    alt="" aria-hidden="true" loading="lazy" decoding="async"
                    style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover", border: "2px solid #0A0A0A", marginLeft: i > 0 ? "-8px" : 0 }}
                  />
                ))}
              </div>
              <span style={{ fontFamily: SS, fontSize: "0.71rem", color: "rgba(255,255,255,0.35)" }}>
                5,000+ meat lovers already in
              </span>
            </div>
          </div>

          {/* Right: form */}
          <div>
            <FooterNewsletterForm />
            <p style={{ fontFamily: SS, fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", marginTop: "0.65rem" }}>
              ✓ No spam &nbsp;·&nbsp; ✓ Cancel any time &nbsp;·&nbsp; ✓ Real tested recipes only
            </p>
          </div>
        </div>
      </div>

      {/* ── Main columns ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3.5rem 2rem 2.5rem" }}>
        <div className="footer-grid" style={{ display: "grid", gap: "2.5rem", marginBottom: "3rem" }}>

          {/* Col 1: Brand */}
          <div>
            <p style={{ fontFamily: SF, fontSize: "1.4rem", fontWeight: 700, color: "#f5f2ee", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>
              Meat Lovers Hub
            </p>
            <p style={{ fontFamily: SS, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#CC2222", marginBottom: "0.9rem" }}>
              Real recipes. Real results.
            </p>
            <p style={{ fontFamily: SS, fontSize: "0.79rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.9, maxWidth: "240px", marginBottom: "1.6rem", fontWeight: 300 }}>
              A real guy obsessed with making insanely good meat — no stress, no fluff.
            </p>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
              <FooterSocialIcon href="/follow" label="Follow Juicy Joe on Pinterest" brandColor="rgba(230,0,35,0.85)" glowColor="rgba(230,0,35,0.28)">
                {PINTEREST_SVG}
              </FooterSocialIcon>
              <FooterSocialIcon href="/follow" label="Follow Juicy Joe on Instagram" brandColor="rgba(193,53,132,0.85)" glowColor="rgba(193,53,132,0.28)">
                {INSTAGRAM_SVG}
              </FooterSocialIcon>
              <FooterSocialIcon href="/follow" label="Follow Juicy Joe on TikTok" brandColor="rgba(255,255,255,0.12)" glowColor="rgba(255,255,255,0.1)">
                {TIKTOK_SVG}
              </FooterSocialIcon>
            </div>
          </div>

          {/* Col 2: Top Recipes */}
          <div>
            <p style={{ fontFamily: SF, fontSize: "0.95rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em", marginBottom: "1.3rem" }}>
              Top Recipes
            </p>
            {TOP_RECIPE_LINKS.map(({ label, href }) => (
              <div key={label} style={{ marginBottom: "0.72rem" }}>
                <Link
                  href={href}
                  style={{ fontFamily: SS, fontSize: "0.79rem", color: "rgba(255,255,255,0.48)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                  className="hover:text-white transition-colors"
                >
                  <span style={{ color: "#CC2222", fontSize: "0.48rem", lineHeight: 1 }}>▸</span> {label}
                </Link>
              </div>
            ))}
          </div>

          {/* Col 3: Guides & More */}
          <div>
            <p style={{ fontFamily: SF, fontSize: "0.95rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em", marginBottom: "1.3rem" }}>
              Guides & More
            </p>
            {([
              ["🌡️ Meat Temperatures", "/guides/meat-temperatures"],
              ["🔪 Butchery Guide",    "/guides/butchery-knife-skills-frenching"],
              ["🌲 BBQ Wood Guide",    "/bbq-wood-flavor-guide"],
              ["📖 All Guides",        "/guides"],
              ["🏆 Meal Plan",         "/carnivore-meal-plan"],
              ["About Joe",            "/about"],
              ["Contact",              "/contact"],
              ["Privacy Policy",       "/privacy-policy"],
            ] as const).map(([label, href]) => (
              <div key={label} style={{ marginBottom: "0.72rem" }}>
                <Link
                  href={href}
                  style={{ fontFamily: SS, fontSize: "0.79rem", color: "rgba(255,255,255,0.48)", textDecoration: "none" }}
                  className="hover:text-white transition-colors"
                >
                  {label}
                </Link>
              </div>
            ))}
          </div>

          {/* Col 4: Follow Joe */}
          <div>
            <p style={{ fontFamily: SF, fontSize: "0.95rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em", marginBottom: "1.3rem" }}>
              Follow Joe
            </p>
            {([
              ["📌 Pinterest",   "/follow"],
              ["📸 Instagram",   "/follow"],
              ["🎵 TikTok",      "/follow"],
              ["📩 Newsletter",  "/newsletter"],
              ["🎙 Full Bio",    "/author/juicy-joe"],
            ] as const).map(([label, href]) => (
              <div key={label} style={{ marginBottom: "0.72rem" }}>
                <Link
                  href={href}
                  style={{ fontFamily: SS, fontSize: "0.79rem", color: "rgba(255,255,255,0.48)", textDecoration: "none" }}
                  className="hover:text-white transition-colors"
                >
                  {label}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.055)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <p style={{ fontFamily: SS, fontSize: "0.72rem", color: "rgba(255,255,255,0.28)", margin: 0 }}>
            © 2026 MeatLoversHub — Built with 🔥 by Juicy Joe
          </p>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {([
              ["Privacy",    "/privacy-policy"],
              ["Terms",      "/terms"],
              ["Editorial",  "/editorial-policy"],
              ["Contact",    "/contact"],
              ["About Joe",  "/author/juicy-joe"],
            ] as const).map(([label, href]) => (
              <Link
                key={href}
                href={href}
                style={{ fontFamily: SS, fontSize: "0.71rem", color: "rgba(255,255,255,0.28)", textDecoration: "none" }}
                className="hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .footer-grid    { grid-template-columns: 1.5fr 1fr 1fr 1fr; }
        .footer-nl-grid { grid-template-columns: 1fr 1fr; }
        @media (max-width: 960px) {
          .footer-grid    { grid-template-columns: 1fr 1fr !important; gap: 2rem !important; }
          .footer-nl-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          .footer-grid    { grid-template-columns: 1fr !important; gap: 1.75rem !important; }
        }
      `}</style>
    </footer>
  );
}
