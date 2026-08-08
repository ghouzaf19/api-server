import { motion } from "framer-motion";
import { Clock, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Recipe } from "@/data/recipes";
import { PinterestButton } from "@/components/PinterestButton";
import { StarDisplay } from "@/components/StarRating";
import { useRatings } from "@/hooks/useRatings";
import { SaveButton } from "@/components/SaveButton";

interface RecipeCardProps {
  recipe: Recipe;
  tall?: boolean;
}

export function RecipeCard({ recipe, tall = false }: RecipeCardProps) {
  const pageUrl = `${import.meta.env.VITE_SITE_URL || "https://www.meatlovershub.com"}/recipes/${recipe.id}`;
  const { average, count } = useRatings(recipe.id);

  return (
    <div className="masonry-item">
      <Link href={`/recipes/${recipe.id}`} style={{ textDecoration: "none", display: "block" }} data-testid={`card-recipe-${recipe.id}`}>
        <motion.div
          whileHover="hover"
          initial="rest"
          animate="rest"
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "1rem",
            aspectRatio: "4/5",
            display: "block",
            cursor: "pointer",
            boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
            background: "#1a1008",
            width: "100%",
          }}
        >
          {/* Photo */}
          <motion.img
            src={recipe.imageTall}
            alt={recipe.imageAlt}
            loading="lazy"
            decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            variants={{ rest: { scale: 1 }, hover: { scale: 1.07 } }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />

          {/* Strong bottom gradient — always present for legibility */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 38%, rgba(0,0,0,0.12) 62%, transparent 100%)",
            pointerEvents: "none",
          }} />

          {/* Hover brightening tint */}
          <motion.div
            style={{ position: "absolute", inset: 0, background: "rgba(255,100,50,0.08)", pointerEvents: "none" }}
            variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
            transition={{ duration: 0.25 }}
          />

          {/* ── TOP ROW ── viral badge + time */}
          <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", right: "0.75rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.4rem" }}>
            {/* Viral label */}
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.6rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#fff",
              background: recipe.viralLabel.includes("TRENDING") ? "rgba(220,38,38,0.92)"
                : recipe.viralLabel.includes("#1") ? "rgba(234,88,12,0.92)"
                : "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
              borderRadius: "4px",
              padding: "0.25rem 0.55rem",
            }}>
              {recipe.viralLabel}
            </span>

            {/* Cook time */}
            <span style={{
              display: "flex", alignItems: "center", gap: "0.2rem",
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
              borderRadius: "4px", padding: "0.25rem 0.55rem",
              color: "rgba(255,255,255,0.9)", fontSize: "0.6rem", fontWeight: 600,
              fontFamily: "'Outfit', sans-serif", letterSpacing: "0.04em",
            }}>
              <Clock style={{ width: "0.62rem", height: "0.62rem" }} />{recipe.cookTime}
            </span>
          </div>

          {/* ── PINTEREST HOVER SAVE ── */}
          <motion.div
            style={{ position: "absolute", top: "0.75rem", left: "50%", transform: "translateX(-50%)", zIndex: 2 }}
            variants={{ rest: { opacity: 0, y: -6 }, hover: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.preventDefault()}
          >
            <PinterestButton url={pageUrl} image={recipe.imageTall} description={recipe.pinTitle} variant="icon" />
          </motion.div>

          {/* ── BOTTOM TEXT — always visible ── */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1rem 1rem 1rem" }}>

            {/* Saves + stars row */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.55rem" }}>
              <span style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.62rem", fontWeight: 700,
                color: "#ff8f8f", letterSpacing: "0.04em",
              }}>
                📌 {recipe.saves} saves
              </span>
              {count > 0 && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "0.2rem",
                  background: "rgba(255,255,255,0.12)", borderRadius: "4px",
                  padding: "0.15rem 0.45rem",
                }}>
                  <StarDisplay value={average} size="sm" />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>({count})</span>
                </span>
              )}
            </div>

            {/* Main title — ALWAYS VISIBLE — big and punchy */}
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              marginBottom: "0.4rem",
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
            }}>
              {recipe.title}
            </h3>

            {/* Hook sub-headline — ALWAYS VISIBLE */}
            <p style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.72rem",
              fontWeight: 400,
              color: "rgba(255,255,255,0.72)",
              lineHeight: 1.45,
              marginBottom: "0.7rem",
              letterSpacing: "0.01em",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
            }}>
              {recipe.hook}
            </p>

            {/* CTA row — slides up on hover */}
            <motion.div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflow: "visible" }}
              variants={{ rest: { opacity: 0, height: 0, marginTop: 0 }, hover: { opacity: 1, height: "auto", marginTop: "0.25rem" } }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "0.3rem",
                background: "#ff4d4d", color: "#fff",
                fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
                padding: "0.45rem 1rem", borderRadius: "6px",
                fontFamily: "'Outfit', sans-serif",
              }}>
                Make This Recipe <ChevronRight style={{ width: "0.72rem", height: "0.72rem" }} />
              </span>
              <SaveButton recipeId={recipe.id} compact />
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
