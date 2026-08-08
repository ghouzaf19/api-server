import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Mail } from "lucide-react";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div style={{ fontFamily: SS, fontSize: "0.85rem", color: "#4ade80", fontWeight: 600 }}>
        🥩 You're in! Check your inbox soon.
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSent(true); }}
      style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}
    >
      <label htmlFor="footer-newsletter-email" className="sr-only">
        Email address for weekly recipe newsletter
      </label>
      <input
        id="footer-newsletter-email"
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          flex: 1,
          minWidth: "210px",
          padding: "0.75rem 1.1rem",
          fontFamily: SS,
          fontSize: "0.85rem",
          borderRadius: "8px",
          border: "1.5px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.07)",
          color: "#fff",
        }}
      />
      <button
        type="submit"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "#CC2222",
          color: "#fff",
          fontFamily: SS,
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "0.75rem 1.35rem",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          whiteSpace: "nowrap",
          boxShadow: "0 4px 16px rgba(180,30,30,0.4)",
        }}
      >
        Subscribe Free <ArrowRight style={{ width: "0.8rem", height: "0.8rem" }} />
      </button>
    </form>
  );
}

const PINTEREST_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

const INSTAGRAM_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const TIKTOK_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.27 8.27 0 0 0 4.85 1.56V7.16a4.85 4.85 0 0 1-1.08-.47z" />
  </svg>
);

const socialIconStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.07)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255,255,255,0.5)",
  textDecoration: "none",
  transition: "background 0.2s",
};

export function SiteFooter() {
  return (
    <footer style={{ background: "#0A0A0A" }}>
      {/* Newsletter band */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "3rem 2rem" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "2rem",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: SF,
                fontSize: "1.6rem",
                fontWeight: 600,
                color: "#fff",
                letterSpacing: "-0.02em",
                marginBottom: "0.3rem",
                lineHeight: 1.1,
              }}
            >
              Get weekly recipes from Juicy Joe 🍖
            </p>
            <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", margin: 0 }}>
              Free. No spam. Just insanely good meat recipes in your inbox.
            </p>
          </div>
          <FooterNewsletter />
        </div>
      </div>

      {/* Main footer columns */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3.5rem 2rem 2.5rem" }}>
        <div
          className="footer-grid"
          style={{ display: "grid", gap: "3rem", marginBottom: "3rem" }}
        >
          {/* Brand */}
          <div>
            <p
              style={{
                fontFamily: SF,
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#f5f2ee",
                letterSpacing: "-0.03em",
                marginBottom: "0.6rem",
              }}
            >
              Meat Lovers Hub
            </p>
            <p
              style={{
                fontFamily: SS,
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.8,
                maxWidth: "260px",
                marginBottom: "1.5rem",
              }}
            >
              Real meat recipes from a real guy who got obsessed with getting it right. No fluff — just results.
            </p>
            <div style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}>
              <a href="/follow" aria-label="Follow Juicy Joe on Pinterest" style={socialIconStyle} className="hover:bg-white/20" data-dark-focus>
                {PINTEREST_SVG}
              </a>
              <a href="/follow" aria-label="Follow Juicy Joe on Instagram" style={socialIconStyle} className="hover:bg-white/20" data-dark-focus>
                {INSTAGRAM_SVG}
              </a>
              <a href="/follow" aria-label="Follow Juicy Joe on TikTok" style={socialIconStyle} className="hover:bg-white/20" data-dark-focus>
                {TIKTOK_SVG}
              </a>
            </div>
          </div>

          {/* Guides & Tools */}
          <div>
            <p
              style={{
                fontFamily: SS,
                fontSize: "0.62rem",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                marginBottom: "1.1rem",
              }}
            >
              Guides & Tools
            </p>
            {(
              [
                ["🌡️ Temperature Guide", "/guides/meat-temperatures"],
                ["📖 All Guides", "/resources"],
                ["About Joe", "/about"],
                ["Contact", "/contact"],
                ["Privacy Policy", "/privacy-policy"],
              ] as const
            ).map(([label, href]) => (
              <div key={label} style={{ marginBottom: "0.6rem" }}>
                <Link
                  href={href}
                  style={{
                    fontFamily: SS,
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.65)",
                    textDecoration: "none",
                    lineHeight: 1,
                  }}
                  className="hover:text-white transition-colors"
                >
                  {label}
                </Link>
              </div>
            ))}
          </div>

          {/* Follow */}
          <div>
            <p
              style={{
                fontFamily: SS,
                fontSize: "0.62rem",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                marginBottom: "1.1rem",
              }}
            >
              Follow Joe
            </p>
            {(
              [
                ["Pinterest", "/follow"],
                ["Instagram", "/follow"],
                ["TikTok", "/follow"],
                ["Newsletter", "/newsletter"],
              ] as const
            ).map(([label, href]) => (
              <div key={label} style={{ marginBottom: "0.6rem" }}>
                <Link
                  href={href}
                  style={{
                    fontFamily: SS,
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.65)",
                    textDecoration: "none",
                  }}
                  className="hover:text-white transition-colors"
                >
                  {label}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <p style={{ fontFamily: SS, fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>
            © 2026 MeatLoversHub — Built by Juicy Joe 🍖
          </p>
          <div style={{ display: "flex", gap: "1.75rem", flexWrap: "wrap" }}>
            {(
              [
                ["Privacy", "/privacy-policy"],
                ["Terms", "/terms"],
                ["Contact", "/contact"],
                ["About Joe", "/author/juicy-joe"],
                ["Editorial Policy", "/editorial-policy"],
              ] as const
            ).map(([label, href]) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: SS,
                  fontSize: "0.73rem",
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                }}
                className="hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .footer-grid { grid-template-columns: 2fr 1fr 1fr; }
        @media (max-width: 640px) { .footer-grid { grid-template-columns: 1fr !important; gap: 2rem !important; } }
      `}</style>
    </footer>
  );
}
