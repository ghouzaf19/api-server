import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

function PinterestIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.27 8.27 0 0 0 4.85 1.56V7.16a4.85 4.85 0 0 1-1.08-.47z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

const SOCIALS = [
  {
    name: "Pinterest",
    handle: "@MeatLoversHub",
    url: "https://pinterest.com",
    desc: "76k+ saves. Our most popular recipes, beautifully pinned. Perfect for meal planning.",
    color: "#E60023",
    bg: "#fff0f0",
    icon: <PinterestIcon />,
    stat: "76k+ saves",
  },
  {
    name: "Instagram",
    handle: "@MeatLoversHub",
    url: "https://instagram.com",
    desc: "Behind-the-scenes cooking clips, sizzling reels, and Joe's kitchen moments.",
    color: "#E1306C",
    bg: "#fff0f5",
    icon: <InstagramIcon />,
    stat: "Coming soon",
  },
  {
    name: "TikTok",
    handle: "@JuicyJoeCooks",
    url: "https://tiktok.com",
    desc: "Short, punchy recipe videos that prove great meat doesn't need hours of prep.",
    color: "#010101",
    bg: "#f5f5f5",
    icon: <TikTokIcon />,
    stat: "Coming soon",
  },
];

export function FollowPage() {
  return (
    <div style={{ background: "#F9F6F1", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>
      <SiteHeader activeNav="/follow" />

      {/* Hero */}
      <div style={{ background: "#111", padding: "5rem 2rem 4rem", textAlign: "center" }}>
        <p style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff4d4d", marginBottom: "1rem" }}>Find Juicy Joe online</p>
        <h1 style={{ fontFamily: SF, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 600, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
          Follow Along for<br /><em style={{ fontWeight: 300 }}>Daily Meat Inspo</em> 🍖
        </h1>
        <p style={{ fontFamily: SS, fontSize: "1rem", color: "rgba(255,255,255,0.5)", maxWidth: "440px", margin: "0 auto", lineHeight: 1.7 }}>
          New recipes, sizzling clips, and Joe's unfiltered kitchen moments — choose your platform.
        </p>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "4rem 2rem", flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.75rem 2rem", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", textDecoration: "none", display: "flex", alignItems: "center", gap: "1.5rem", transition: "transform 0.2s, box-shadow 0.2s" }}
              className="hover:scale-[1.01]"
            >
              <div style={{ width: "56px", height: "56px", borderRadius: "1rem", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                  <p style={{ fontFamily: SS, fontSize: "1rem", fontWeight: 700, color: "#111", margin: 0 }}>{s.name}</p>
                  <span style={{ fontFamily: SS, fontSize: "0.72rem", fontWeight: 700, color: "#fff", background: s.color, borderRadius: "999px", padding: "0.15rem 0.6rem" }}>{s.stat}</span>
                </div>
                <p style={{ fontFamily: SS, fontSize: "0.78rem", color: "#999", margin: "0 0 0.25rem" }}>{s.handle}</p>
                <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#555", margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
