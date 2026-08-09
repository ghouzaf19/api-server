import { Link } from "wouter";
import { ArrowRight, ExternalLink } from "lucide-react";
import { SITE_URL } from "@/lib/siteUrl";
import { SeoMeta } from "@/components/SeoMeta";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

export function AboutPage() {
  const origin = SITE_URL;

  return (
    <>
      <SeoMeta
        title="About Meat Lovers Hub — Real Recipes, Real Kitchen"
        description="Meat Lovers Hub is a home cooking blog dedicated to foolproof meat recipes. Created by Juicy Joe — tested 200+ times in a real home kitchen."
        image="https://images.unsplash.com/photo-1558030006-450675393462?w=1200&h=630&fit=crop&q=85"
        imageAlt="Juicy seared steak on a cast iron skillet"
        type="website"
        url={`${origin}/about`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${origin}/` },
          { name: "About", url: `${origin}/about` },
        ]}
      />

      <div style={{ background: "#F9F6F1", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>
        <SiteHeader activeNav="/about" />

        {/* Hero */}
        <div style={{ background: "#111", padding: "5rem 2rem 4rem", textAlign: "center" }}>
          <p style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CC2222", marginBottom: "1rem" }}>About the chef</p>
          <h1 style={{ fontFamily: SF, fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 600, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
            Welcome to the Hub:<br /><em style={{ fontWeight: 300 }}>I'm Juicy Joe</em>
          </h1>
          <p style={{ fontFamily: SS, fontSize: "1rem", color: "rgba(255,255,255,0.5)", maxWidth: "520px", margin: "0 auto 1.5rem", lineHeight: 1.75 }}>
            They call me Juicy Joe, not just because I know my way around a brisket, but because I'm obsessed with one thing: <strong style={{ color: "rgba(255,255,255,0.75)" }}>The Science of Flavor.</strong>
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/author/juicy-joe" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#CC2222", color: "#fff", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.75rem 1.5rem", borderRadius: "8px", textDecoration: "none" }}>
              Full Author Profile <ArrowRight style={{ width: "0.8rem", height: "0.8rem" }} />
            </Link>
            <Link href="/editorial-policy" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, padding: "0.75rem 1.5rem", borderRadius: "8px", textDecoration: "none" }}>
              Editorial Policy
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div style={{ maxWidth: "740px", margin: "0 auto", padding: "4rem 2rem", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

            {/* Photo + intro */}
            <div style={{ background: "#fff", borderRadius: "1.25rem", overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
              <img
                src="/blog-images/juicy-joe.png"
                alt="Juicy Joe standing in front of his backyard smoker with tongs, wearing a leather apron that reads 'Juicy Joe's Pit'"
                width="1024"
                height="683"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <div style={{ padding: "2rem 2.5rem 2.5rem" }}>
                <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CC2222", marginBottom: "0.75rem" }}>How it started</p>
                <h2 style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#111", marginBottom: "1rem", lineHeight: 1.1 }}>Backyard charcoal dust & 16-mesh black pepper</h2>
                <p style={{ fontFamily: SS, fontSize: "0.92rem", color: "#555", lineHeight: 1.8 }}>
                  MeatLoversHub didn't start in a boardroom; it started in my backyard, covered in charcoal dust and 16-mesh black pepper. After years of trial, error, and a few "burnt offerings," I decided to build this space for people who take their meat as seriously as I do.
                </p>
              </div>
            </div>

            {/* Why Trust Juicy Joe */}
            <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "2.5rem", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
              <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CC2222", marginBottom: "0.75rem" }}>Why trust Juicy Joe?</p>
              <h2 style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#111", marginBottom: "1rem", lineHeight: 1.1 }}>Lived Experience — not AI-generated recipes</h2>
              <p style={{ fontFamily: SS, fontSize: "0.92rem", color: "#555", lineHeight: 1.8 }}>
                In a world full of AI-generated recipes, I'm here to give you the "Lived Experience." Whether it's debunking the myth of soaking wood chips or perfecting the 125°F lamb rack sear, every guide on this site is tested by my own hands and tasted by my own (very happy) family.
              </p>
            </div>

            {/* My Promise */}
            <div style={{ background: "#111", borderRadius: "1.25rem", padding: "2.5rem" }}>
              <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff8080", marginBottom: "0.75rem" }}>My Promise</p>
              <h2 style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#fff", marginBottom: "1rem", lineHeight: 1.1 }}>No fluff. No fake recipes. Pure BBQ wisdom.</h2>
              <p style={{ fontFamily: SS, fontSize: "0.92rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                Just pure, unadulterated BBQ wisdom to help you master the fire. Keep it low, keep it slow, and stay juicy!
              </p>
              <p style={{ fontFamily: SF, fontSize: "1.25rem", fontWeight: 600, color: "rgba(255,255,255,0.85)", fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "1.25rem", margin: 0 }}>
                — Juicy Joe
              </p>
            </div>

            {/* E-E-A-T stats */}
            <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "2.5rem", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
              <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CC2222", marginBottom: "0.75rem" }}>Trusted by</p>
              <h2 style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#111", marginBottom: "1.25rem", lineHeight: 1.1 }}>Built on real experience</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {[
                  { value: "200+", label: "Recipes tested" },
                  { value: "76k+", label: "Pinterest saves" },
                  { value: "7+", label: "Years cooking" },
                  { value: "5★", label: "Average recipe rating" },
                ].map(({ value, label }) => (
                  <div key={label} style={{ textAlign: "center", padding: "1.25rem", background: "#F9F6F1", borderRadius: "0.85rem", border: "1px solid #EAE5DC" }}>
                    <p style={{ fontFamily: SF, fontSize: "2rem", fontWeight: 600, color: "#CC2222", margin: "0 0 0.2rem" }}>{value}</p>
                    <p style={{ fontFamily: SS, fontSize: "0.75rem", fontWeight: 600, color: "#666", margin: 0 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* External resources */}
            <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "2.5rem", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
              <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CC2222", marginBottom: "0.75rem" }}>Sources I rely on</p>
              <h2 style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#111", marginBottom: "1rem", lineHeight: 1.1 }}>Science-backed, not guesswork</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[
                  { label: "USDA Food Safety & Inspection Service", url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation", note: "Safe temperatures & food handling" },
                  { label: "Serious Eats — The Food Lab", url: "https://www.seriouseats.com/the-food-lab", note: "Science-backed cooking methodology" },
                  { label: "AmazingRibs.com", url: "https://amazingribs.com", note: "BBQ & grilling science" },
                ].map(({ label, url, note }) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem", background: "#F9F6F1", borderRadius: "0.75rem", textDecoration: "none", border: "1px solid #EAE5DC" }}>
                    <ExternalLink style={{ width: "0.85rem", height: "0.85rem", color: "#CC2222", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontFamily: SS, fontSize: "0.85rem", fontWeight: 600, color: "#111", margin: 0 }}>{label}</p>
                      <p style={{ fontFamily: SS, fontSize: "0.75rem", color: "#666", margin: 0 }}>{note}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div style={{ textAlign: "center", marginTop: "3.5rem", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
            <Link href="/author/juicy-joe" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#CC2222", color: "#fff", fontFamily: SS, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "1rem 2rem", borderRadius: "8px", textDecoration: "none", boxShadow: "0 4px 20px rgba(204,34,34,0.35)" }}>
              Full Author Profile <ArrowRight style={{ width: "0.9rem", height: "0.9rem" }} />
            </Link>
            <Link href="/recipes" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontFamily: SS, fontSize: "0.82rem", fontWeight: 600, color: "#555", textDecoration: "none" }}>
              See All Recipes <ArrowRight style={{ width: "0.9rem", height: "0.9rem" }} />
            </Link>
          </div>
        </div>

        <SiteFooter />
      </div>
    </>
  );
}
