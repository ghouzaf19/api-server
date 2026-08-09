import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, BookOpen, Rss } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SeoMeta } from "@/components/SeoMeta";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { SITE_URL } from "@/lib/siteUrl";
import { cardSrc, cardSrcSet, CARD_SIZES } from "@/lib/imageUrl";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

interface BlogPost {
  id: string;
  topic: string;
  niche: string;
  title: string;
  slug: string | null;
  featuredImage: string | null;
  pinterestImage: string | null;
  outline: string;
  content: string;
  seoScore: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .trim();
}

function getExcerpt(content: string, wordLimit = 30): string {
  const plain = stripMarkdown(content);
  const words = plain.split(/\s+/).filter(Boolean);
  return words.slice(0, wordLimit).join(" ") + (words.length > wordLimit ? "…" : "");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function readTime(wordCount: number): string {
  const mins = Math.max(1, Math.round(wordCount / 200));
  return `${mins} min read`;
}

function nicheColor(niche: string): string {
  const n = niche.toLowerCase();
  if (n.includes("beef") || n.includes("steak")) return "#B91C1C";
  if (n.includes("chicken") || n.includes("poultry")) return "#B45309";
  if (n.includes("bbq") || n.includes("grill")) return "#b85000";
  if (n.includes("pork") || n.includes("rib")) return "#7C3AED";
  return "#166534";
}

/** Returns bare Unsplash base URL (no query params) — consumers add optimised params */
function nicheImage(niche: string, topic: string): string {
  const t = (niche + " " + topic).toLowerCase();
  if (t.includes("beef") || t.includes("steak") || t.includes("ribeye"))
    return "https://images.unsplash.com/photo-1558030006-450675393462";
  if (t.includes("chicken") || t.includes("poultry"))
    return "https://images.unsplash.com/photo-1532550907401-a500c9a57435";
  if (t.includes("bbq") || t.includes("grill") || t.includes("smoke"))
    return "https://images.unsplash.com/photo-1544025162-d76694265947";
  if (t.includes("burger") || t.includes("smash"))
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd";
  if (t.includes("pork") || t.includes("rib") || t.includes("bacon"))
    return "https://images.unsplash.com/photo-1544025162-d76694265947";
  if (t.includes("lamb") || t.includes("game") || t.includes("venison"))
    return "https://images.unsplash.com/photo-1555939594-58d7cb561ad1";
  return "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd";
}

const RSS_URL = "/api/seo/rss.xml";

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel='alternate'][type='application/rss+xml']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "alternate";
      link.type = "application/rss+xml";
      link.title = "Meat Lovers Hub Blog";
      document.head.appendChild(link);
    }
    link.href = RSS_URL;
    return () => { link?.remove(); };
  }, []);

  useEffect(() => {
    fetch("/api/seo/posts")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch articles");
        return r.json();
      })
      .then((data: BlogPost[]) => {
        setPosts(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const pageUrl = `${SITE_URL}/blog`;

  return (
    <>
      <SeoMeta
        title="Meat & BBQ Blog — Tips, Guides & Expert Techniques"
        description="In-depth guides, grilling tips, and expert techniques for cooking perfect steak, BBQ, chicken and more from Juicy Joe."
        image="https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1200&h=630&fit=crop&q=85"
        url={pageUrl}
        type="website"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: "Blog", url: pageUrl },
        ]}
      />

      <div style={{ background: "#F9F6F1", minHeight: "100vh", fontFamily: SS, display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>
        <SiteHeader activeNav="/blog" />

        {/* ── Hero ── */}
        <div style={{ background: "linear-gradient(135deg, #1a0a0a 0%, #2d1010 60%, #111 100%)", padding: "4rem 1.5rem 3.5rem" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <BookOpen style={{ width: "1rem", height: "1rem", color: "#ff8080" }} />
              <span style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff8080" }}>
                The Blog
              </span>
            </div>
            <h1 style={{ fontFamily: SF, fontSize: "clamp(2.4rem, 6vw, 4rem)", fontWeight: 600, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "1rem" }}>
              Meat Guides &amp; <em>Expert Techniques</em>
            </h1>
            <p style={{ fontFamily: SS, fontSize: "0.95rem", color: "rgba(255,255,255,0.55)", maxWidth: "520px", lineHeight: 1.7 }}>
              Deep-dives on everything from choosing the right cut to mastering the perfect crust. Real knowledge, no fluff.
            </p>
            <a
              href={RSS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to RSS feed"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginTop: "1.25rem", padding: "0.45rem 1rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "999px", fontFamily: SS, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "#ff8080", textDecoration: "none", transition: "background 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            >
              <Rss style={{ width: "0.8rem", height: "0.8rem" }} />
              RSS Feed
            </a>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "3rem 1.5rem", boxSizing: "border-box" }}>

          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ borderRadius: "16px", background: "#fff", border: "1px solid #EAE5DC", overflow: "hidden" }}>
                  <div style={{ height: "200px", background: "linear-gradient(90deg, #f0ebe3 25%, #e8e2d9 50%, #f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                  <div style={{ padding: "1.25rem" }}>
                    <div style={{ height: "12px", background: "#f0ebe3", borderRadius: "4px", marginBottom: "0.75rem", width: "40%" }} />
                    <div style={{ height: "20px", background: "#f0ebe3", borderRadius: "4px", marginBottom: "0.5rem" }} />
                    <div style={{ height: "20px", background: "#f0ebe3", borderRadius: "4px", marginBottom: "1rem", width: "75%" }} />
                    <div style={{ height: "12px", background: "#f0ebe3", borderRadius: "4px", width: "90%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "5rem 0" }}>
              <p style={{ fontFamily: SF, fontSize: "1.6rem", color: "#B91C1C", marginBottom: "0.5rem" }}>Could not load articles</p>
              <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#888" }}>{error}</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div style={{ textAlign: "center", padding: "6rem 0" }}>
              <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</p>
              <p style={{ fontFamily: SF, fontSize: "2rem", color: "#111", marginBottom: "0.5rem", fontStyle: "italic" }}>No articles yet</p>
              <p style={{ fontFamily: SS, fontSize: "0.9rem", color: "#888" }}>
                Generate and save articles in the SEO Blog Studio — they'll appear here automatically.
              </p>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <>
              <p style={{ fontFamily: SS, fontSize: "0.78rem", color: "#aaa", marginBottom: "2rem" }}>
                <strong style={{ color: "#555" }}>{posts.length}</strong> article{posts.length !== 1 ? "s" : ""} published
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {posts.map((post, i) => {
                  const color = nicheColor(post.niche);
                  const img = post.featuredImage ?? nicheImage(post.niche, post.topic);
                  const excerpt = getExcerpt(post.content, 28);
                  const href = `/blog/${post.slug ?? post.id}`;
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                    >
                      <Link href={href} style={{ display: "block", textDecoration: "none" }}>
                        <motion.div
                          whileHover={{ y: -5, boxShadow: "0 12px 36px rgba(0,0,0,0.12)" }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          style={{ borderRadius: "16px", overflow: "hidden", background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #EAE5DC", height: "100%", display: "flex", flexDirection: "column" }}
                        >
                          {/* Image */}
                          <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", flexShrink: 0 }}>
                            <motion.img
                              src={cardSrc(img.split("?")[0] ?? img)}
                              srcSet={cardSrcSet(img.split("?")[0] ?? img)}
                              sizes={CARD_SIZES}
                              alt={`${post.title} — Meat Lovers Hub`}
                              loading={i === 0 ? "eager" : "lazy"}
                              decoding="async"
                              width={800}
                              height={450}
                              whileHover={{ scale: 1.06 }}
                              transition={{ duration: 0.4 }}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%)" }} />
                            <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", background: `${color}dd`, borderRadius: "5px", padding: "0.2rem 0.6rem", fontFamily: SS, fontSize: "0.6rem", fontWeight: 800, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                              {post.niche}
                            </div>
                          </div>

                          {/* Content */}
                          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.6rem" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontFamily: SS, fontSize: "0.68rem", color: "#bbb" }}>
                                <Calendar style={{ width: "0.7rem", height: "0.7rem" }} />
                                {formatDate(post.createdAt)}
                              </span>
                            </div>

                            <h2 style={{ fontFamily: SF, fontSize: "1.25rem", fontWeight: 700, color: "#111", lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: "0.6rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                              {post.title}
                            </h2>

                            <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "#888", lineHeight: 1.6, marginBottom: "1rem", flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                              {excerpt}
                            </p>

                            <div style={{ display: "flex", alignItems: "center" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700, color: color }}>
                                Read Article <ArrowRight style={{ width: "0.7rem", height: "0.7rem" }} />
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <SiteFooter />
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </>
  );
}
