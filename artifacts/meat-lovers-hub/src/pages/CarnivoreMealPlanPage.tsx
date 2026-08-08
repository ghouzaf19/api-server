import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Unlock, Download, Save, CheckCircle } from "lucide-react";
import { SeoMeta } from "@/components/SeoMeta";
import { RECIPES } from "@/data/recipes";
import { SITE_URL } from "@/lib/siteUrl";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

type MealDay = {
  day: number;
  breakfast: { recipe: string; note: string };
  lunch: { recipe: string; note: string };
  dinner: { recipe: string; note: string };
};

type MealPlanResult = {
  days: number;
  preference: string;
  totalProteinFocus: string;
  plan: MealDay[];
  tip: string;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const FEATURES = [
  { icon: "🥩", title: "7 days, 3 meals each", desc: "Full breakfast, lunch and dinner — all carnivore, all delicious." },
  { icon: "⚡", title: "Instant generation", desc: "No sign-up required to get your first 2 days. Unlock the full plan free." },
  { icon: "📄", title: "Printable PDF", desc: "Download and print your plan to stick on the fridge. Zero carbs, all protein." },
  { icon: "💾", title: "Save to browser", desc: "Your plan is saved locally so it's always there when you need it." },
  { icon: "🔄", title: "Regenerate anytime", desc: "Not happy? Hit regenerate for a fresh randomised plan in seconds." },
  { icon: "🍖", title: "Real recipes only", desc: "Every meal links to a full step-by-step recipe with tips, temps, and macros." },
];

const FAQ = [
  {
    q: "What is the carnivore diet?",
    a: "The carnivore diet is an elimination diet consisting exclusively of animal products — primarily meat, fish, eggs, and some dairy. It eliminates all plant foods. Proponents report benefits including reduced inflammation, improved body composition, better mental clarity, and simplified eating. It is the strictest form of a zero-carbohydrate diet.",
  },
  {
    q: "How do I meal plan on the carnivore diet?",
    a: "Effective carnivore meal planning centres on three principles: protein variety (rotate between beef, pork, poultry, and eggs to cover your amino acid and micronutrient bases), batch cooking (cook large cuts like brisket or pulled pork on Sundays to fuel the whole week), and fat sourcing (tallow, lard, and butter are your primary energy sources — don't restrict them). A 7-day plan removes daily decision fatigue entirely.",
  },
  {
    q: "How much protein should I eat per day on carnivore?",
    a: "Most carnivore practitioners target 1–1.5g of protein per pound of lean body mass. For a 180lb person with 15% body fat, that's roughly 153–230g of protein per day. In practical terms: two ribeye steaks (roughly 500g total) provide approximately 140g of protein. Add eggs and you're comfortably at target without tracking.",
  },
  {
    q: "What does a typical carnivore meal plan look like?",
    a: "A well-structured carnivore day looks like this: Breakfast — 3 eggs cooked in beef tallow or butter, optionally with bacon or leftover steak. Lunch — cold sliced brisket or reheated pulled pork, or a quick lamb chop. Dinner — the primary cook of the day, typically a steak, ribs, or a slow-cooked cut for the week. This plan generator builds exactly this structure for 7 days.",
  },
  {
    q: "Is the carnivore diet safe long-term?",
    a: "Short-term carnivore diets (30–90 days) are well-tolerated by most healthy adults and have been studied informally in large self-reported datasets showing improvements in weight, blood sugar, and inflammation markers. Long-term data is limited. Anyone with kidney disease, gout, or cardiovascular concerns should consult a physician before starting. This content is for informational purposes only and does not constitute medical advice.",
  },
];

function generatePlan(days = 7): MealPlanResult {
  const tools = (window as unknown as Record<string, unknown>)["__webmcp_tools__"] as Record<string, { handler: (a: Record<string, unknown>) => unknown }> | undefined;
  if (tools?.get_carnivore_meal_plan) {
    return tools.get_carnivore_meal_plan.handler({ days, preference: "mixed" }) as MealPlanResult;
  }
  const pick = () => RECIPES[Math.floor(Math.random() * RECIPES.length)].title;
  return {
    days,
    preference: "mixed",
    totalProteinFocus: "High — all meals are carnivore/meat-forward",
    plan: Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      breakfast: { recipe: pick(), note: "Can prep the night before for maximum freshness." },
      lunch: { recipe: pick(), note: "Excellent reheated — portion from dinner leftovers." },
      dinner: { recipe: pick(), note: "Primary cook. Scales well for meal prep." },
    })),
    tip: "Batch cook on Sundays for the week. Ribeye and pulled pork reheat exceptionally well.",
  };
}

export function CarnivoreMealPlanPage() {
  const [mealPlan, setMealPlan] = useState<MealPlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailUnlocked, setEmailUnlocked] = useState(() => !!localStorage.getItem("mlh:meal-plan-unlocked"));
  const [emailInput, setEmailInput] = useState("");
  const [planSaved, setPlanSaved] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  function handleGenerate() {
    setLoading(true);
    setMealPlan(null);
    setPlanSaved(false);
    setTimeout(() => {
      try {
        const result = generatePlan(7);
        console.log("[WebMCP] get_carnivore_meal_plan result →", result);
        window.dispatchEvent(new CustomEvent("webmcp:tool_called", {
          detail: { ts: new Date().toISOString(), tool: "get_carnivore_meal_plan", layer: "Imperative (JS)", args: { days: 7 }, resultSummary: "7-day plan generated on landing page" }
        }));
        setMealPlan(result);
      } finally {
        setLoading(false);
      }
    }, 650);
  }

  function handleUnlockEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim()) return;
    localStorage.setItem("mlh:meal-plan-unlocked", emailInput.trim());
    localStorage.setItem("mlh:meal-plan-email", emailInput.trim());
    setEmailUnlocked(true);
  }

  function handleSave() {
    if (!mealPlan) return;
    localStorage.setItem("mlh:saved-meal-plan", JSON.stringify(mealPlan));
    setPlanSaved(true);
    setTimeout(() => setPlanSaved(false), 3500);
  }

  const LOCKED_FROM = 2;

  return (
    <>
      <SeoMeta
        title="Carnivore Diet Meal Plan Generator — Free 7-Day Plan | Meat Lovers Hub"
        description="Generate your free personalised 7-day carnivore diet meal plan instantly. Breakfast, lunch and dinner — all carnivore, all high protein, zero carbs. Print or save your plan."
        image="https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1200&h=630&fit=crop&q=85"
        imageAlt="Carnivore meal plan — steak and eggs breakfast"
        type="website"
      />

      {/* JSON-LD: WebApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Carnivore Diet Meal Plan Generator",
          "url": `${SITE_URL}/carnivore-meal-plan`,
          "description": "Free AI-powered 7-day carnivore diet meal plan generator. Get personalised breakfast, lunch and dinner recipes instantly.",
          "applicationCategory": "HealthApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "author": { "@type": "Person", "name": "Juicy Joe", "url": `${SITE_URL}/author/juicy-joe` },
        })}}
      />

      <div style={{ background: "#F9F6F1", minHeight: "100vh", fontFamily: SS }}>
        <SiteHeader />

        {/* ── Hero ── */}
        <section style={{
          background: "linear-gradient(135deg, #0a1a0a 0%, #0d2010 40%, #0f2d12 100%)",
          padding: "5rem 1.5rem 4rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 50%, rgba(74,222,128,0.07) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(22,163,74,0.05) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "680px", margin: "0 auto", position: "relative" }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "999px", padding: "0.3rem 0.9rem", marginBottom: "1.5rem" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                <span style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#4ade80" }}>Free Tool — No Sign-Up Required</span>
              </div>
              <h1 style={{ fontFamily: SF, fontSize: "clamp(2.4rem, 6vw, 4rem)", fontWeight: 600, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 1rem" }}>
                Carnivore Diet<br /><em style={{ fontWeight: 300, color: "#4ade80" }}>Meal Plan Generator</em>
              </h1>
              <p style={{ fontFamily: SS, fontSize: "1rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: "0 0 2rem", maxWidth: "520px", marginLeft: "auto", marginRight: "auto" }}>
                Generate your free personalised 7-day carnivore meal plan in seconds. Breakfast, lunch, and dinner — all meat-forward, zero carbs, ready to print or save.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  data-testid="button-generate-plan-hero"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.6rem",
                    background: loading ? "#166534" : "linear-gradient(135deg, #16a34a, #15803d)",
                    color: "#fff", fontFamily: SS, fontSize: "0.9rem", fontWeight: 700,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    padding: "1rem 2.25rem", borderRadius: "12px", border: "none",
                    cursor: loading ? "default" : "pointer", opacity: loading ? 0.8 : 1,
                    boxShadow: "0 6px 24px rgba(22,163,74,0.45)", transition: "opacity 0.2s",
                  }}
                >
                  {loading ? "⏳ Generating…" : mealPlan ? "🔄 Regenerate Plan" : "🥩 Generate My 7-Day Plan"}
                </button>
                {mealPlan && (
                  <button
                    onClick={() => { document.body.classList.add("printing-meal-plan"); window.print(); document.body.classList.remove("printing-meal-plan"); }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.5rem",
                      background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)",
                      color: "#fff", fontFamily: SS, fontSize: "0.82rem", fontWeight: 600,
                      padding: "1rem 1.5rem", borderRadius: "12px", cursor: "pointer",
                    }}
                  >
                    <Download style={{ width: "0.9rem", height: "0.9rem" }} />
                    Download PDF
                  </button>
                )}
              </div>
              {/* Social proof */}
              <p style={{ fontFamily: SS, fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginTop: "1.25rem", letterSpacing: "0.04em" }}>
                Trusted by 76k+ food lovers · Free forever · No spam
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Features ── */}
        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "4rem 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p style={{ fontFamily: SS, fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#aaa", marginBottom: "0.4rem" }}>Why use this tool</p>
            <h2 style={{ fontFamily: SF, fontSize: "2.2rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em", margin: 0 }}>
              Everything you need to start carnivore
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ background: "#fff", border: "1px solid #EAE5DC", borderRadius: "1rem", padding: "1.5rem" }}>
                <span style={{ fontSize: "1.75rem", display: "block", marginBottom: "0.75rem" }}>{f.icon}</span>
                <p style={{ fontFamily: SF, fontSize: "1.1rem", fontWeight: 600, color: "#111", margin: "0 0 0.4rem" }}>{f.title}</p>
                <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#777", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Generator ── */}
        <section id="generator" style={{ maxWidth: "860px", margin: "0 auto 4rem", padding: "0 1.5rem" }}>
          <AnimatePresence>
            {mealPlan && (
              <motion.div
                key="plan"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4 }}
              >
                {/* Plan header */}
                <div style={{ background: "linear-gradient(135deg, #0d1f0d, #0a1a0a)", borderRadius: "1.25rem 1.25rem 0 0", padding: "1.5rem 2rem", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                  <div>
                    <p style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#4ade80", margin: "0 0 0.3rem" }}>Your Plan</p>
                    <h2 style={{ fontFamily: SF, fontSize: "1.6rem", fontWeight: 700, color: "#fff", margin: "0 0 0.25rem" }}>
                      7-Day Carnivore Meal Plan
                    </h2>
                    <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>{mealPlan.tip}</p>
                  </div>
                  <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                    <button
                      onClick={handleSave}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "0.4rem",
                        background: planSaved ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.1)",
                        border: `1px solid ${planSaved ? "rgba(74,222,128,0.5)" : "rgba(255,255,255,0.2)"}`,
                        color: planSaved ? "#4ade80" : "#fff",
                        fontFamily: SS, fontSize: "0.72rem", fontWeight: 600,
                        padding: "0.6rem 1.1rem", borderRadius: "8px", cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {planSaved ? <CheckCircle style={{ width: "0.8rem", height: "0.8rem" }} /> : <Save style={{ width: "0.8rem", height: "0.8rem" }} />}
                      {planSaved ? "Saved!" : "Save Plan"}
                    </button>
                    <button
                      onClick={() => { document.body.classList.add("printing-meal-plan"); window.print(); document.body.classList.remove("printing-meal-plan"); }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "0.4rem",
                        background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                        color: "#fff", fontFamily: SS, fontSize: "0.72rem", fontWeight: 600,
                        padding: "0.6rem 1.1rem", borderRadius: "8px", cursor: "pointer",
                      }}
                    >
                      <Download style={{ width: "0.8rem", height: "0.8rem" }} />
                      Download PDF
                    </button>
                  </div>
                </div>

                {/* Summary pills */}
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderLeft: "none", borderRight: "none", padding: "0.6rem 2rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                  {[
                    { label: "Days", value: "7" },
                    { label: "Total Meals", value: "21" },
                    { label: "Carbs", value: "Zero" },
                    { label: "Protein Focus", value: mealPlan.totalProteinFocus },
                  ].map((s) => (
                    <span key={s.label} style={{ fontFamily: SS, fontSize: "0.7rem", color: "#166534" }}>
                      <strong>{s.label}:</strong> {s.value}
                    </span>
                  ))}
                </div>

                {/* Day cards */}
                <div id="meal-plan-print-area" style={{ border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 1.25rem 1.25rem", overflow: "hidden" }}>
                  {mealPlan.plan.map((day, idx) => {
                    const isLocked = !emailUnlocked && idx >= LOCKED_FROM;
                    return (
                      <div key={day.day} style={{ position: "relative", borderTop: idx > 0 ? "1px solid #f3f4f6" : "none" }}>
                        {/* Day header */}
                        <div style={{ background: isLocked ? "#1a1a1a" : "linear-gradient(90deg, #14532d, #166534)", padding: "0.6rem 1.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          {isLocked
                            ? <Lock style={{ width: "0.85rem", height: "0.85rem", color: "#666" }} />
                            : <span style={{ fontSize: "0.75rem" }}>✅</span>
                          }
                          <span style={{ fontFamily: SF, fontSize: "0.95rem", fontWeight: 700, color: isLocked ? "#555" : "#fff" }}>
                            Day {day.day}
                          </span>
                          <span style={{ fontFamily: SS, fontSize: "0.6rem", color: isLocked ? "#444" : "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            — {WEEKDAYS[(day.day - 1) % 7]}
                          </span>
                          {isLocked && (
                            <span style={{ marginLeft: "auto", fontFamily: SS, fontSize: "0.6rem", fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                              🔒 LOCKED
                            </span>
                          )}
                        </div>

                        {/* Meal cells */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", filter: isLocked ? "blur(6px)" : "none", userSelect: isLocked ? "none" : "auto", background: "#fff" }}>
                          {(["breakfast", "lunch", "dinner"] as const).map((meal, mi) => {
                            const icons = ["🍳", "🥗", "🥩"];
                            const labels = ["Breakfast", "Lunch", "Dinner"];
                            const bg = ["#f0fdf4", "#f9fafb", "#fff8f5"];
                            const accent = ["#16a34a", "#6b7280", "#ea580c"];
                            const isHighProtein = meal === "dinner";
                            const m = day[meal];
                            return (
                              <div key={meal} style={{ padding: "1rem 1.1rem", borderLeft: mi > 0 ? "1px solid #f3f4f6" : "none", background: bg[mi] }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                    <span style={{ fontSize: "0.9rem" }}>{icons[mi]}</span>
                                    <span style={{ fontFamily: SS, fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: accent[mi] }}>{labels[mi]}</span>
                                  </div>
                                  {isHighProtein && (
                                    <span style={{ fontFamily: SS, fontSize: "0.52rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", background: "#fef3c7", color: "#92400e", padding: "0.12rem 0.45rem", borderRadius: "999px", border: "1px solid #fde68a" }}>
                                      HIGH PROTEIN
                                    </span>
                                  )}
                                </div>
                                <p style={{ fontFamily: SF, fontSize: "0.9rem", fontWeight: 600, color: "#111", lineHeight: 1.3, margin: "0 0 0.25rem" }}>{m.recipe}</p>
                                <p style={{ fontFamily: SS, fontSize: "0.66rem", color: "#9ca3af", lineHeight: 1.5, margin: 0 }}>{m.note}</p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Lock overlay */}
                        {isLocked && idx === LOCKED_FROM && (
                          <div style={{
                            position: "absolute", inset: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(249,246,241,0.92)", backdropFilter: "blur(2px)",
                            padding: "1.5rem",
                          }}>
                            <div style={{ textAlign: "center", maxWidth: "400px" }}>
                              <Unlock style={{ width: "2rem", height: "2rem", color: "#16a34a", margin: "0 auto 0.75rem" }} />
                              <p style={{ fontFamily: SF, fontSize: "1.25rem", fontWeight: 700, color: "#111", margin: "0 0 0.35rem" }}>
                                Unlock Days 3–7 Free
                              </p>
                              <p style={{ fontFamily: SS, fontSize: "0.78rem", color: "#777", margin: "0 0 1rem", lineHeight: 1.5 }}>
                                Enter your email to unlock the full 7-day plan — plus get Juicy Joe's best carnivore tips weekly.
                              </p>
                              <form onSubmit={handleUnlockEmail} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                                <input
                                  type="email" required
                                  placeholder="your@email.com"
                                  value={emailInput}
                                  onChange={(e) => setEmailInput(e.target.value)}
                                  style={{
                                    flex: 1, minWidth: "200px", padding: "0.7rem 1rem",
                                    fontFamily: SS, fontSize: "0.82rem",
                                    border: "1.5px solid #d1d5db", borderRadius: "8px",
                                    background: "#fff", outline: "none",
                                  }}
                                />
                                <button type="submit" style={{
                                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                                  color: "#fff", fontFamily: SS, fontSize: "0.78rem", fontWeight: 700,
                                  letterSpacing: "0.06em", textTransform: "uppercase",
                                  padding: "0.7rem 1.35rem", borderRadius: "8px", border: "none", cursor: "pointer",
                                  boxShadow: "0 4px 14px rgba(22,163,74,0.35)",
                                }}>
                                  <Unlock style={{ width: "0.7rem", height: "0.7rem" }} />
                                  Unlock Free
                                </button>
                              </form>
                              <p style={{ fontFamily: SS, fontSize: "0.62rem", color: "#bbb", marginTop: "0.6rem" }}>
                                No spam. Unsubscribe anytime. Stored in your browser only.
                              </p>
                            </div>
                          </div>
                        )}
                        {isLocked && idx > LOCKED_FROM && (
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(249,246,241,0.7)" }}>
                            <Lock style={{ width: "1.5rem", height: "1.5rem", color: "#ccc" }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Unlock banner (shown if locked) */}
                {!emailUnlocked && (
                  <div style={{ marginTop: "1rem", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1px solid #bbf7d0", borderRadius: "0.85rem", padding: "1rem 1.5rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", justifyContent: "space-between" }}>
                    <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#166534", margin: 0 }}>
                      <strong>Days 3–7 are locked.</strong> Enter your email above to unlock them free.
                    </p>
                    <span style={{ fontFamily: SS, fontSize: "0.72rem", color: "#16a34a" }}>↑ Scroll up to unlock</span>
                  </div>
                )}

                {/* Joe's tip */}
                {emailUnlocked && (
                  <div style={{ marginTop: "1rem", padding: "1rem 1.25rem", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderRadius: "0.85rem", border: "1px solid #bbf7d0", display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
                    <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "0.05rem" }}>💡</span>
                    <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "#166534", lineHeight: 1.6, margin: 0 }}>
                      <strong>Joe's batch cook tip:</strong> {mealPlan.tip}
                    </p>
                  </div>
                )}

                {/* Action row */}
                <div style={{ marginTop: "1.25rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                  <button
                    onClick={handleGenerate}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.4rem",
                      background: "linear-gradient(135deg, #16a34a, #15803d)",
                      color: "#fff", fontFamily: SS, fontSize: "0.75rem", fontWeight: 700,
                      letterSpacing: "0.06em", textTransform: "uppercase",
                      padding: "0.75rem 1.4rem", borderRadius: "9px", border: "none", cursor: "pointer",
                      boxShadow: "0 4px 16px rgba(22,163,74,0.35)",
                    }}
                  >
                    🔄 Regenerate
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.4rem",
                      background: planSaved ? "#f0fdf4" : "#fff",
                      border: `1.5px solid ${planSaved ? "#bbf7d0" : "#d1d5db"}`,
                      color: planSaved ? "#16a34a" : "#333",
                      fontFamily: SS, fontSize: "0.75rem", fontWeight: 600,
                      padding: "0.75rem 1.4rem", borderRadius: "9px", cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {planSaved ? <CheckCircle style={{ width: "0.8rem", height: "0.8rem" }} /> : <Save style={{ width: "0.8rem", height: "0.8rem" }} />}
                    {planSaved ? "Saved to browser!" : "Save Plan"}
                  </button>
                  <button
                    onClick={() => { document.body.classList.add("printing-meal-plan"); window.print(); document.body.classList.remove("printing-meal-plan"); }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.4rem",
                      background: "#fff", border: "1.5px solid #d1d5db",
                      color: "#333", fontFamily: SS, fontSize: "0.75rem", fontWeight: 600,
                      padding: "0.75rem 1.4rem", borderRadius: "9px", cursor: "pointer",
                    }}
                  >
                    <Download style={{ width: "0.8rem", height: "0.8rem" }} />
                    Download PDF
                  </button>
                  <Link
                    href="/recipes/category/beef"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.4rem",
                      background: "#fff", border: "1.5px solid #d1d5db",
                      color: "#333", fontFamily: SS, fontSize: "0.75rem", fontWeight: 600,
                      padding: "0.75rem 1.4rem", borderRadius: "9px", textDecoration: "none",
                    }}
                  >
                    🥩 Browse Recipes
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pre-generate state */}
          {!mealPlan && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div style={{ background: "#fff", border: "2px dashed #d1d5db", borderRadius: "1.25rem", padding: "3rem 2rem" }}>
                <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>🥩</span>
                <p style={{ fontFamily: SF, fontSize: "1.5rem", fontWeight: 600, color: "#111", margin: "0 0 0.5rem" }}>
                  Your plan will appear here
                </p>
                <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#888", margin: "0 0 1.5rem", lineHeight: 1.6 }}>
                  Click the button above to generate your free personalised 7-day carnivore meal plan.
                </p>
                <button
                  onClick={handleGenerate}
                  data-testid="button-generate-plan-inline"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.6rem",
                    background: "linear-gradient(135deg, #16a34a, #15803d)",
                    color: "#fff", fontFamily: SS, fontSize: "0.88rem", fontWeight: 700,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    padding: "0.95rem 2.25rem", borderRadius: "12px", border: "none",
                    cursor: "pointer", boxShadow: "0 6px 24px rgba(22,163,74,0.4)",
                  }}
                >
                  🥩 Generate My Free Plan
                </button>
              </div>
            </motion.div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "4rem", background: "#fff", borderRadius: "1.25rem", border: "1px solid #EAE5DC" }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} style={{ display: "inline-block", fontSize: "2rem", marginBottom: "1rem" }}>⏳</motion.div>
              <p style={{ fontFamily: SF, fontSize: "1.2rem", color: "#333" }}>Building your plan…</p>
            </div>
          )}
        </section>

        {/* ── FAQ ── */}
        <section style={{ background: "#fff", borderTop: "1px solid #EAE5DC", padding: "5rem 1.5rem" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <p style={{ fontFamily: SS, fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#aaa", marginBottom: "0.4rem" }}>FAQ</p>
              <h2 style={{ fontFamily: SF, fontSize: "2.2rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em", margin: 0 }}>
                Carnivore diet — your questions answered
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {FAQ.map((item, i) => (
                <div key={i} style={{ background: "#F9F6F1", borderRadius: "0.85rem", border: "1px solid #EAE5DC", overflow: "hidden" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: "100%", textAlign: "left", background: "none", border: "none",
                      padding: "1rem 1.25rem", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
                    }}
                  >
                    <span style={{ fontFamily: SS, fontSize: "0.92rem", fontWeight: 600, color: "#222", lineHeight: 1.4 }}>{item.q}</span>
                    <span style={{ flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%", background: "rgba(22,163,74,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", fontSize: "1rem", fontWeight: 700 }}>
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ overflow: "hidden" }}
                      >
                        <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "#555", lineHeight: 1.7, padding: "0 1.25rem 1rem", margin: 0, borderTop: "1px solid #EAE5DC" }}>
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Strip ── */}
        <section style={{ background: "linear-gradient(135deg, #0d1f0d, #0a1a0a)", padding: "4rem 1.5rem", textAlign: "center" }}>
          <h2 style={{ fontFamily: SF, fontSize: "2.2rem", fontWeight: 600, color: "#fff", margin: "0 0 0.6rem" }}>
            Ready to go carnivore?
          </h2>
          <p style={{ fontFamily: SS, fontSize: "0.9rem", color: "rgba(255,255,255,0.4)", margin: "0 0 2rem" }}>
            Generate your plan above, or browse all our carnivore recipes.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleGenerate}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                color: "#fff", fontFamily: SS, fontSize: "0.85rem", fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase",
                padding: "1rem 2rem", borderRadius: "10px", border: "none", cursor: "pointer",
                boxShadow: "0 6px 22px rgba(22,163,74,0.4)",
              }}
            >
              🥩 Generate My Plan
            </button>
            <Link href="/recipes/category/beef" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.18)",
              color: "#fff", fontFamily: SS, fontSize: "0.85rem", fontWeight: 600,
              padding: "1rem 2rem", borderRadius: "10px", textDecoration: "none",
            }}>
              Browse Beef Recipes
            </Link>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}
