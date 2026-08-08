import { motion } from "framer-motion";
import { Link } from "wouter";
import { Clock, ChefHat, ArrowRight, Flame } from "lucide-react";
import {
  RECIPES,
  RecipeCategory,
  getCategorySlug,
  CATEGORY_COLORS,
  formatPublishedDate,
} from "@/data/recipes";
import { SaveButton } from "@/components/SaveButton";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

const DIFF_COLOR: Record<string, string> = {
  Easy: "#16a34a",
  Medium: "#d97706",
  Hard: "#dc2626",
};

function parseSaves(s: string): number {
  return parseFloat(s.replace("k", "")) * (s.includes("k") ? 1000 : 1);
}

interface Props {
  currentId: string;
  category: RecipeCategory;
}

export function RelatedRecipes({ currentId, category }: Props) {
  const color = CATEGORY_COLORS[category] ?? "#ff4d4d";
  const slug = getCategorySlug(category);

  // All same-category recipes excluding current, sorted by saves descending
  const sameCategory = RECIPES
    .filter((r) => r.category === category && r.id !== currentId)
    .sort((a, b) => parseSaves(b.saves) - parseSaves(a.saves));

  // Top 3 different-category recipes (most saved, for discovery strip)
  const crossCategory = RECIPES
    .filter((r) => r.category !== category)
    .sort((a, b) => parseSaves(b.saves) - parseSaves(a.saves))
    .slice(0, 3);

  const mostPopularId = sameCategory[0]?.id;

  if (sameCategory.length === 0) return null;

  return (
    <>
      {/* ── Same-Category Internal Links ── */}
      <section
        aria-labelledby="related-category-heading"
        style={{ padding: "5rem 0", background: "#F0EBE2" }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>

          {/* Eyebrow + heading */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <Link
              href={`/recipes/category/${slug}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontFamily: SS,
                fontSize: "0.65rem",
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: color,
                textDecoration: "none",
                background: `${color}15`,
                padding: "0.28rem 0.85rem",
                borderRadius: "5px",
                marginBottom: "0.75rem",
              }}
            >
              {category} Recipes →
            </Link>
            <p style={{
              fontFamily: SS,
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#aaa",
              marginBottom: "0.4rem",
            }}>
              You Might Also Like
            </p>
            <h2
              id="related-category-heading"
              style={{
                fontFamily: SF,
                fontSize: "clamp(2rem, 5vw, 2.8rem)",
                fontWeight: 300,
                color: "#111",
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
              }}
            >
              More <em style={{ fontStyle: "italic", color: color }}>{category}</em> Recipes
            </h2>
          </div>

          {/* Recipe grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2.5rem",
          }}>
            {sameCategory.slice(0, 6).map((r, i) => {
              const isMostPopular = r.id === mostPopularId;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,0,0,0.13)" }}
                  style={{
                    borderRadius: "18px",
                    overflow: "hidden",
                    background: "#fff",
                    boxShadow: isMostPopular
                      ? `0 0 0 2.5px ${color}, 0 4px 24px rgba(0,0,0,0.1)`
                      : "0 2px 18px rgba(0,0,0,0.08)",
                    border: isMostPopular ? `2px solid ${color}` : "1px solid #E8E3D9",
                    transition: "box-shadow 0.25s ease",
                  }}
                >
                  <Link
                    href={`/recipes/${r.id}`}
                    style={{ display: "block", textDecoration: "none" }}
                    aria-label={`Read recipe: ${r.title}`}
                  >
                    {/* Image */}
                    <div style={{ position: "relative", aspectRatio: "3/2", overflow: "hidden" }}>
                      <motion.img
                        src={r.image}
                        alt={r.imageAlt}
                        loading="lazy"
                        decoding="async"
                        whileHover={{ scale: 1.06 }}
                        transition={{ duration: 0.45 }}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
                      }} />

                      {/* Most popular badge */}
                      {isMostPopular && (
                        <div style={{
                          position: "absolute",
                          top: "0.75rem",
                          left: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          background: color,
                          borderRadius: "6px",
                          padding: "0.28rem 0.65rem",
                          fontFamily: SS,
                          fontSize: "0.58rem",
                          fontWeight: 800,
                          color: "#fff",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}>
                          <Flame style={{ width: "0.7rem", height: "0.7rem" }} />
                          Most Popular
                        </div>
                      )}

                      {/* Saves badge */}
                      <div style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(4px)",
                        borderRadius: "999px",
                        padding: "0.22rem 0.6rem",
                        fontFamily: SS,
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        color: "#E60023",
                      }}>
                        📌 {r.saves}
                      </div>

                      {/* Bottom overlay: time + difficulty */}
                      <div style={{
                        position: "absolute",
                        bottom: "0.75rem",
                        left: "0.75rem",
                        right: "0.75rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                      }}>
                        <span style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontFamily: SS,
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.9)",
                          background: "rgba(0,0,0,0.4)",
                          backdropFilter: "blur(4px)",
                          padding: "0.22rem 0.55rem",
                          borderRadius: "999px",
                        }}>
                          <Clock style={{ width: "0.65rem", height: "0.65rem" }} />
                          {r.cookTime}
                        </span>
                        <span style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontFamily: SS,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          color: DIFF_COLOR[r.difficulty],
                          background: "rgba(0,0,0,0.4)",
                          backdropFilter: "blur(4px)",
                          padding: "0.22rem 0.55rem",
                          borderRadius: "999px",
                        }}>
                          <ChefHat style={{ width: "0.65rem", height: "0.65rem" }} />
                          {r.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Card content */}
                    <div style={{ padding: "1.2rem 1.35rem 1.1rem" }}>
                      <div style={{
                        fontFamily: SS,
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        color: "#bbb",
                        marginBottom: "0.4rem",
                      }}>
                        {formatPublishedDate(r.publishedAt)}
                      </div>

                      <h3 style={{
                        fontFamily: SF,
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "#111",
                        lineHeight: 1.2,
                        letterSpacing: "-0.01em",
                        marginBottom: "0.5rem",
                      }}>
                        {r.title}
                      </h3>

                      <p style={{
                        fontFamily: SS,
                        fontSize: "0.8rem",
                        color: "#888",
                        lineHeight: 1.6,
                        marginBottom: "1rem",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}>
                        {r.description}
                      </p>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontFamily: SS,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: color,
                        }}>
                          Read {r.title.split(" ").slice(0, 3).join(" ")} Recipe
                          <ArrowRight style={{ width: "0.75rem", height: "0.75rem" }} />
                        </span>
                        <SaveButton recipeId={r.id} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Category CTA */}
          <div style={{ textAlign: "center" }}>
            <Link
              href={`/recipes/category/${slug}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.85rem 2.25rem",
                background: color,
                color: "#fff",
                borderRadius: "999px",
                textDecoration: "none",
                fontFamily: SS,
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                boxShadow: `0 4px 18px ${color}55`,
              }}
            >
              View All {category} Recipes
              <ArrowRight style={{ width: "0.85rem", height: "0.85rem" }} />
            </Link>
            <p style={{
              fontFamily: SS,
              fontSize: "0.72rem",
              color: "#aaa",
              marginTop: "0.65rem",
            }}>
              {sameCategory.length} recipes in this category
            </p>
          </div>
        </div>
      </section>

      {/* ── Cross-Category Discovery Strip ── */}
      {crossCategory.length > 0 && (
        <section
          aria-labelledby="discover-more-heading"
          style={{ padding: "4rem 0", background: "#fff", borderTop: "1px solid #EAE5DC" }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <p style={{
                  fontFamily: SS,
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#ccc",
                  marginBottom: "0.3rem",
                }}>
                  Explore More
                </p>
                <h2
                  id="discover-more-heading"
                  style={{
                    fontFamily: SF,
                    fontSize: "1.9rem",
                    fontWeight: 300,
                    color: "#111",
                    letterSpacing: "-0.02em",
                  }}
                >
                  From the Rest of Our Menu
                </h2>
              </div>
              <Link
                href="/recipes"
                style={{
                  fontFamily: SS,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#888",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                All Recipes →
              </Link>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1.25rem",
            }}>
              {crossCategory.map((r, i) => {
                const rColor = CATEGORY_COLORS[r.category] ?? "#ff4d4d";
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.35, delay: i * 0.08 }}
                    whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      background: "#fff",
                      boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
                      border: "1px solid #EAE5DC",
                      transition: "box-shadow 0.2s ease",
                    }}
                  >
                    <Link
                      href={`/recipes/${r.id}`}
                      style={{ display: "block", textDecoration: "none" }}
                      aria-label={`Read recipe: ${r.title}`}
                    >
                      <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden" }}>
                        <motion.img
                          src={r.image}
                          alt={r.imageAlt}
                          loading="lazy"
                          decoding="async"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.4 }}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)",
                        }} />
                        <div style={{
                          position: "absolute",
                          top: "0.7rem",
                          left: "0.7rem",
                          background: `${rColor}dd`,
                          borderRadius: "4px",
                          padding: "0.2rem 0.55rem",
                          fontFamily: SS,
                          fontSize: "0.56rem",
                          fontWeight: 800,
                          color: "#fff",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}>
                          {r.category}
                        </div>
                        <div style={{
                          position: "absolute",
                          bottom: "0.7rem",
                          left: "0.7rem",
                          fontFamily: SS,
                          fontSize: "0.62rem",
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.85)",
                          background: "rgba(0,0,0,0.35)",
                          backdropFilter: "blur(4px)",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "999px",
                        }}>
                          {r.cookTime}
                        </div>
                      </div>
                      <div style={{ padding: "1rem 1.2rem" }}>
                        <h3 style={{
                          fontFamily: SF,
                          fontSize: "1.15rem",
                          fontWeight: 700,
                          color: "#111",
                          lineHeight: 1.25,
                          letterSpacing: "-0.01em",
                          marginBottom: "0.4rem",
                        }}>
                          {r.title}
                        </h3>
                        <p style={{
                          fontFamily: SS,
                          fontSize: "0.76rem",
                          color: "#999",
                          lineHeight: 1.55,
                          marginBottom: "0.75rem",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}>
                          {r.description}
                        </p>
                        <span style={{
                          fontFamily: SS,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: rColor,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}>
                          {r.title.split(" ").slice(0, 2).join(" ")} Recipe
                          <ArrowRight style={{ width: "0.7rem", height: "0.7rem" }} />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
