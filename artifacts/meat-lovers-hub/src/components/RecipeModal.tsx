import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Flame, ChevronRight } from "lucide-react";

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  ingredients: string[];
  steps: string[];
  cookTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

const DIFF_COLOR: Record<Recipe["difficulty"], string> = {
  Easy: "#22c55e",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

export function RecipeModal({ recipe, isOpen, onClose }: RecipeModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <DialogPortal forceMount>
            <DialogOverlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="fixed inset-0 z-50"
                style={{ background: "rgba(10,8,6,0.75)", backdropFilter: "blur(6px)" }}
              />
            </DialogOverlay>

            <DialogContent asChild>
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 px-4 md:px-0 focus:outline-none"
              >
                <DialogTitle className="sr-only">{recipe.title}</DialogTitle>
                <DialogDescription className="sr-only">{recipe.description}</DialogDescription>

                <div
                  className="overflow-hidden shadow-2xl"
                  style={{ borderRadius: "1.5rem", maxHeight: "88vh", display: "flex", flexDirection: "column", background: "#FDFAF7" }}
                >
                  {/* Hero image */}
                  <div className="relative shrink-0" style={{ height: "280px" }}>
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)" }}
                    />

                    {/* Close */}
                    <button
                      onClick={onClose}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer" }}
                      data-testid="button-close-modal"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>

                    {/* Title & meta on image */}
                    <div className="absolute bottom-5 left-6 right-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="flex items-center gap-1 rounded-full px-2.5 py-1"
                          style={{ fontSize: "0.7rem", fontWeight: 600, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", color: "#fff", fontFamily: "'Outfit',sans-serif" }}
                        >
                          <Clock className="w-3 h-3" /> {recipe.cookTime}
                        </span>
                        <span
                          className="rounded-full px-2.5 py-1"
                          style={{ fontSize: "0.7rem", fontWeight: 700, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", color: DIFF_COLOR[recipe.difficulty], fontFamily: "'Outfit',sans-serif" }}
                        >
                          {recipe.difficulty}
                        </span>
                      </div>
                      <h2
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "2.1rem",
                          fontWeight: 600,
                          color: "#fff",
                          lineHeight: 1.15,
                          letterSpacing: "-0.02em",
                          textShadow: "0 2px 8px rgba(0,0,0,0.35)",
                        }}
                      >
                        {recipe.title}
                      </h2>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="overflow-y-auto flex-1" style={{ padding: "2rem 2.5rem" }}>
                    <p
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "0.95rem",
                        color: "#777",
                        lineHeight: 1.7,
                        marginBottom: "2rem",
                        fontStyle: "italic",
                      }}
                    >
                      {recipe.description}
                    </p>

                    <div style={{ display: "grid", gap: "2.5rem", gridTemplateColumns: "1fr 1.6fr" }}>
                      {/* Ingredients */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div style={{ background: "rgba(255,77,77,0.1)", borderRadius: "0.5rem", padding: "0.4rem" }}>
                            <Flame className="w-4 h-4" style={{ color: "#ff4d4d" }} />
                          </div>
                          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 700, color: "#1C1C1C" }}>
                            Ingredients
                          </h3>
                        </div>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                          {recipe.ingredients.map((ing, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span
                                className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                                style={{ background: "#ff4d4d" }}
                              />
                              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.875rem", color: "#444", lineHeight: 1.45 }}>
                                {ing}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Instructions */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div style={{ background: "rgba(255,77,77,0.1)", borderRadius: "0.5rem", padding: "0.4rem" }}>
                            <Clock className="w-4 h-4" style={{ color: "#ff4d4d" }} />
                          </div>
                          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 700, color: "#1C1C1C" }}>
                            Instructions
                          </h3>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                          {recipe.steps.map((step, i) => (
                            <div key={i} className="flex gap-3">
                              <span
                                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                                style={{
                                  background: "#ff4d4d",
                                  color: "#fff",
                                  fontSize: "0.8rem",
                                  fontWeight: 700,
                                  fontFamily: "'Outfit', sans-serif",
                                }}
                              >
                                {i + 1}
                              </span>
                              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.875rem", color: "#444", lineHeight: 1.6, paddingTop: "0.2rem" }}>
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </DialogPortal>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
