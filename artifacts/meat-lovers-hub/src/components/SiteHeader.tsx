import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Search, Bookmark, Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

/* ── Desktop nav links ───────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Home",        href: "/" },
  { label: "Recipes",     href: "/recipes" },
  { label: "Beef",        href: "/recipes/category/beef" },
  { label: "Chicken",     href: "/recipes/category/chicken" },
  { label: "BBQ",         href: "/recipes/category/bbq" },
  { label: "Quick Meals", href: "/recipes/category/quick-meals" },
  { label: "Guides",      href: "/guides", accent: true },
  { label: "Blog",        href: "/blog" },
  { label: "About",       href: "/about" },
];

/* ── Mobile nav sections ─────────────────────────────────────────────────── */
const MOBILE_SECTIONS = [
  {
    heading: "Browse Recipes",
    links: [
      { label: "All Recipes",       href: "/recipes",                      emoji: "🍽️" },
      { label: "Beef & Steak",      href: "/recipes/category/beef",        emoji: "🥩" },
      { label: "Chicken",           href: "/recipes/category/chicken",     emoji: "🍗" },
      { label: "BBQ & Grilling",    href: "/recipes/category/bbq",        emoji: "🔥" },
      { label: "Quick Meals",       href: "/recipes/category/quick-meals", emoji: "⚡" },
    ],
  },
  {
    heading: "Learn & Discover",
    links: [
      { label: "Guides Hub",          href: "/guides",                   emoji: "📖" },
      { label: "Temperature Guide",   href: "/guides/meat-temperatures",              emoji: "🌡️" },
      { label: "Butchery: Frenching", href: "/guides/butchery-knife-skills-frenching", emoji: "🔪" },
      { label: "BBQ Wood Guide",      href: "/bbq-wood-flavor-guide",                  emoji: "🌲" },
      { label: "Carnivore Meal Plan", href: "/carnivore-meal-plan",      emoji: "🏆" },
      { label: "Blog & Articles",     href: "/blog",                     emoji: "📝" },
    ],
  },
  {
    heading: "Joe's Corner",
    links: [
      { label: "About Joe",  href: "/about",      emoji: "👨‍🍳" },
      { label: "Newsletter", href: "/newsletter", emoji: "📩" },
      { label: "Contact",    href: "/contact",    emoji: "💬" },
    ],
  },
];

/* ── Quick-pill links shown at the bottom of the mobile drawer ───────────── */
const QUICK_PILLS = [
  { label: "🔥 Trending",     href: "/recipes" },
  { label: "🥩 Most Saved",   href: "/recipes" },
  { label: "⚡ Under 20 Min", href: "/recipes/category/quick-meals" },
  { label: "🌡️ Temp Guide",  href: "/guides/meat-temperatures" },
];

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════════════════════ */
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

  return (
    <>
      {/* ── Announcement bar ───────────────────────────────────────── */}
      {showAnnouncement && NEWEST_RECIPE && (
        <div
          role="region"
          aria-label="Latest recipe announcement"
          style={{ background: "#111", color: "#f5f2ee", fontFamily: SS, fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.04em" }}
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
        style={{ background: "rgba(249,246,241,0.96)", backdropFilter: "blur(14px)", borderBottom: "1px solid #EAE5DC" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[62px] flex items-center justify-between">

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }} data-testid="link-home-logo">
            <span style={{ fontFamily: SF, fontSize: "1.55rem", fontWeight: 700, color: "#111", letterSpacing: "-0.04em" }}>
              Meat Lovers Hub
            </span>
          </Link>

          {/* ── Desktop nav ──────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {NAV_LINKS.filter(l => l.label !== "Home").map((link) => {
              const isActive = activeNav === link.href || location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: SS,
                    fontSize: "0.8rem",
                    fontWeight: link.accent ? 700 : 500,
                    color: link.accent ? "#B91C1C" : isActive ? "#111" : "#555",
                    textDecoration: "none",
                    letterSpacing: link.accent ? "0.03em" : "0.01em",
                    borderBottom: isActive && !link.accent ? "2px solid #B91C1C" : "none",
                    paddingBottom: isActive && !link.accent ? "2px" : "0",
                    whiteSpace: "nowrap",
                  }}
                  className="hover:text-black transition-colors"
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/[^a-z]/g, "")}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Right icons ──────────────────────────────────────────── */}
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
              style={{ position: "relative", padding: "0.5rem", borderRadius: "999px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              data-testid="button-collections"
            >
              <Bookmark
                style={{ color: totalSaved > 0 ? "#B91C1C" : "#666", fill: totalSaved > 0 ? "#B91C1C" : "none", width: "1.1rem", height: "1.1rem", transition: "all 0.2s" }}
              />
              {totalSaved > 0 && (
                <span style={{ position: "absolute", top: "2px", right: "2px", width: "14px", height: "14px", background: "#B91C1C", borderRadius: "50%", border: "2px solid #F9F6F1", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SS, fontSize: "0.5rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                  {totalSaved > 9 ? "9+" : totalSaved}
                </span>
              )}
            </button>

            {/* Hamburger — animated icon swap */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 rounded-full hover:bg-black/5 transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              data-testid="button-mobile-menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.div
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X style={{ color: "#333", width: "1.2rem", height: "1.2rem" }} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="burger"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu style={{ color: "#333", width: "1.2rem", height: "1.2rem" }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* ── Mobile nav drawer — animated, sectioned ─────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="mobile-nav"
              key="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden", background: "#fff", borderTop: "1px solid #EAE5DC", boxShadow: "0 14px 44px rgba(0,0,0,0.1)" }}
            >
              <nav aria-label="Mobile navigation" style={{ padding: "0 1.5rem 2rem", maxHeight: "82vh", overflowY: "auto" }}>

                {MOBILE_SECTIONS.map((section, si) => (
                  <div key={section.heading}>
                    {/* Section heading */}
                    <p style={{ fontFamily: SS, fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#bbb", padding: "1rem 0 0.3rem", margin: 0 }}>
                      {section.heading}
                    </p>

                    {/* Links */}
                    {section.links.map((link, li) => {
                      const isActive = location === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.8rem 0",
                            borderBottom: li < section.links.length - 1 ? "1px solid #f5f2ee" : "none",
                            fontFamily: SS,
                            fontSize: "0.92rem",
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? "#111" : "#2a2a2a",
                            textDecoration: "none",
                            minHeight: "52px",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                            <span style={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0 }} aria-hidden="true">
                              {link.emoji}
                            </span>
                            {link.label}
                          </span>
                          <ArrowRight style={{ width: "0.78rem", height: "0.78rem", color: isActive ? "#B91C1C" : "#ddd", flexShrink: 0 }} />
                        </Link>
                      );
                    })}

                    {/* Section divider */}
                    {si < MOBILE_SECTIONS.length - 1 && (
                      <div style={{ height: "1px", background: "#EAE5DC", margin: "0.3rem 0" }} />
                    )}
                  </div>
                ))}

                {/* CTA buttons */}
                <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
                  <Link
                    href="/newsletter"
                    onClick={() => setMobileOpen(false)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", background: "#CC2222", color: "#fff", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.85rem 1rem", borderRadius: "8px", textDecoration: "none", minHeight: "50px", boxShadow: "0 4px 14px rgba(180,30,30,0.28)" }}
                  >
                    🔥 Subscribe Free
                  </Link>
                  <Link
                    href="/follow"
                    onClick={() => setMobileOpen(false)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1.5px solid #ddd", color: "#444", fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, padding: "0.85rem 1rem", borderRadius: "8px", textDecoration: "none", minHeight: "50px" }}
                  >
                    Follow Joe
                  </Link>
                </div>

                {/* Quick-access pill chips */}
                <div style={{ marginTop: "1rem", display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                  {QUICK_PILLS.map(ql => (
                    <Link
                      key={ql.label}
                      href={ql.href}
                      onClick={() => setMobileOpen(false)}
                      style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 600, color: "#555", background: "#f5f2ee", border: "1px solid #EAE5DC", borderRadius: "999px", padding: "0.3rem 0.72rem", textDecoration: "none", whiteSpace: "nowrap" }}
                    >
                      {ql.label}
                    </Link>
                  ))}
                </div>

              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CollectionsDrawer open={collectionsOpen} onClose={() => setCollectionsOpen(false)} />
    </>
  );
}
