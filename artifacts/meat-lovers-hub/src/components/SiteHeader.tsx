import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Search, Bookmark, Menu, X, ArrowRight } from "lucide-react";
import { useCollections } from "@/contexts/CollectionsContext";
import { CollectionsDrawer } from "@/components/CollectionsDrawer";
import { RECIPES } from "@/data/recipes";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

const NEWEST_RECIPE = [...RECIPES].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
)[0];

interface SiteHeaderProps {
  showAnnouncement?: boolean;
  activeNav?: string;
}

export function SiteHeader({ showAnnouncement = false, activeNav }: SiteHeaderProps) {
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  const handleSearch = useCallback(() => {
    if (location === "/") {
      document.getElementById("recipes")?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
        input?.focus();
      }, 350);
    } else {
      window.location.href = "/recipes";
    }
  }, [location]);

  const { totalSaved } = useCollections();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "All Recipes", href: "/recipes" },
    { label: "Beef", href: "/recipes/category/beef" },
    { label: "Chicken", href: "/recipes/category/chicken" },
    { label: "BBQ", href: "/recipes/category/bbq" },
    { label: "Quick", href: "/recipes/category/quick-meals" },
    { label: "Blog", href: "/blog" },
    { label: "📖 Guides", href: "/resources", accent: true },
    { label: "About", href: "/about" },
  ];

  return (
    <>
      {showAnnouncement && NEWEST_RECIPE && (
        <div
          role="region"
          aria-label="Latest recipe announcement"
          style={{
            background: "#111",
            color: "#f5f2ee",
            fontFamily: SS,
            fontSize: "0.8rem",
            fontWeight: 500,
            letterSpacing: "0.04em",
          }}
          className="text-center py-2.5"
        >
          New recipe just dropped: {NEWEST_RECIPE.title} &rarr;&nbsp;
          <Link
            href={`/recipes/${NEWEST_RECIPE.id}`}
            className="underline underline-offset-2 hover:opacity-60 transition-opacity"
            data-testid="link-announcement"
          >
            Make it now
          </Link>
        </div>
      )}

      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(249,246,241,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #EAE5DC",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[62px] flex items-center justify-between">
          <Link href="/" style={{ textDecoration: "none" }} data-testid="link-home-logo">
            <span
              style={{
                fontFamily: SF,
                fontSize: "1.55rem",
                fontWeight: 700,
                color: "#111",
                letterSpacing: "-0.04em",
              }}
            >
              Meat Lovers Hub
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = activeNav === link.href || location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: SS,
                    fontSize: "0.8rem",
                    fontWeight: link.accent ? 600 : 500,
                    color: link.accent ? "#ff4d4d" : isActive ? "#111" : "#555",
                    textDecoration: "none",
                    letterSpacing: "0.01em",
                    borderBottom: isActive && !link.accent ? "2px solid #ff4d4d" : "none",
                    paddingBottom: isActive && !link.accent ? "2px" : "0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                  className="hover:text-black transition-colors"
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/[^a-z]/g, "")}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <button
              onClick={handleSearch}
              className="p-2 rounded-full hover:bg-black/5 transition-colors"
              aria-label="Search recipes"
              data-testid="button-search"
            >
              <Search style={{ color: "#666", width: "1.1rem", height: "1.1rem" }} />
            </button>

            <button
              onClick={() => setCollectionsOpen(true)}
              aria-label="My Collections"
              aria-expanded={collectionsOpen}
              aria-haspopup="dialog"
              style={{
                position: "relative",
                padding: "0.5rem",
                borderRadius: "999px",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              data-testid="button-collections"
            >
              <Bookmark
                style={{
                  color: totalSaved > 0 ? "#ff4d4d" : "#666",
                  fill: totalSaved > 0 ? "#ff4d4d" : "none",
                  width: "1.1rem",
                  height: "1.1rem",
                  transition: "all 0.2s",
                }}
              />
              {totalSaved > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    width: "14px",
                    height: "14px",
                    background: "#ff4d4d",
                    borderRadius: "50%",
                    border: "2px solid #F9F6F1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: SS,
                    fontSize: "0.5rem",
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {totalSaved > 9 ? "9+" : totalSaved}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-full hover:bg-black/5 transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              data-testid="button-mobile-menu"
            >
              {mobileOpen ? (
                <X style={{ color: "#333", width: "1.2rem", height: "1.2rem" }} />
              ) : (
                <Menu style={{ color: "#333", width: "1.2rem", height: "1.2rem" }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div
            id="mobile-nav"
            style={{
              background: "#fff",
              borderTop: "1px solid #EAE5DC",
              padding: "1.25rem 1.5rem 1.75rem",
              boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
            }}
          >
            <nav aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 0",
                    borderBottom: "1px solid #f0ede8",
                    fontFamily: SS,
                    fontSize: "0.95rem",
                    fontWeight: link.accent ? 700 : 500,
                    color: link.accent ? "#ff4d4d" : "#222",
                    textDecoration: "none",
                  }}
                >
                  <span>{link.label}</span>
                  <ArrowRight style={{ width: "0.85rem", height: "0.85rem", color: "#ccc" }} />
                </Link>
              ))}

              <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem" }}>
                <Link
                  href="/newsletter"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    background: "#ff4d4d",
                    color: "#fff",
                    fontFamily: SS,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "8px",
                    textDecoration: "none",
                  }}
                >
                  Subscribe Free
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "transparent",
                    border: "1.5px solid #ddd",
                    color: "#444",
                    fontFamily: SS,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    padding: "0.75rem 1.25rem",
                    borderRadius: "8px",
                    textDecoration: "none",
                  }}
                >
                  Contact
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <CollectionsDrawer open={collectionsOpen} onClose={() => setCollectionsOpen(false)} />
    </>
  );
}
