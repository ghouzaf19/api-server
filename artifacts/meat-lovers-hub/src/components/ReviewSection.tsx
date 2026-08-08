import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarRating, StarDisplay } from "@/components/StarRating";
import { useRatings } from "@/hooks/useRatings";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
      <span style={{ fontFamily: SS, fontSize: "0.75rem", color: "#888", width: "40px", textAlign: "right", flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: "6px", background: "#EAE5DC", borderRadius: "999px", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ height: "100%", background: "#F59E0B", borderRadius: "999px" }}
        />
      </div>
      <span style={{ fontFamily: SS, fontSize: "0.72rem", color: "#aaa", width: "18px", flexShrink: 0 }}>{count}</span>
    </div>
  );
}

export function ReviewSection({ recipeId }: { recipeId: string }) {
  const { reviews, addReview, average, count } = useRatings(recipeId);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const dist = [5, 4, 3, 2, 1].map(n => ({
    label: `${n}★`,
    count: reviews.filter(r => r.rating === n).length,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (comment.trim().length < 10) { setError("Please write at least 10 characters."); return; }
    setError("");
    addReview(name, rating, comment);
    setName("");
    setRating(0);
    setComment("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section aria-labelledby="reviews-heading" style={{ marginTop: "3rem" }}>
      <h2 id="reviews-heading" style={{ fontFamily: SF, fontSize: "2rem", fontWeight: 600, color: "#111", letterSpacing: "-0.02em", marginBottom: "1.75rem" }}>
        Ratings & Reviews
      </h2>

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", alignItems: "center", padding: "1.5rem", background: "#fff", borderRadius: "1.25rem", border: "1px solid #EAE5DC", marginBottom: "2rem" }}>
        {/* Big number */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: SF, fontSize: "4rem", fontWeight: 700, color: "#111", lineHeight: 1, marginBottom: "0.3rem" }}>
            {average > 0 ? average.toFixed(1) : "–"}
          </p>
          <StarDisplay value={average} size="sm" />
          <p style={{ fontFamily: SS, fontSize: "0.72rem", color: "#aaa", marginTop: "0.3rem" }}>{count} {count === 1 ? "review" : "reviews"}</p>
        </div>
        {/* Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
          {dist.map(d => <RatingBar key={d.label} label={d.label} count={d.count} total={count} />)}
        </div>
      </div>

      {/* Review list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
        <AnimatePresence>
          {reviews.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              style={{ padding: "1.25rem", background: "#fff", borderRadius: "1rem", border: "1px solid #EAE5DC" }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.4rem" }}>
                <div>
                  <span style={{ fontFamily: SS, fontSize: "0.88rem", fontWeight: 700, color: "#111" }}>{r.name}</span>
                  <span style={{ fontFamily: SS, fontSize: "0.72rem", color: "#bbb", marginLeft: "0.6rem" }}>{formatDate(r.date)}</span>
                </div>
                <StarDisplay value={r.rating} size="sm" />
              </div>
              {r.comment && (
                <p style={{ fontFamily: SS, fontSize: "0.86rem", color: "#555", lineHeight: 1.6, margin: 0 }}>{r.comment}</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Write a review form */}
      <div style={{ padding: "1.75rem", background: "linear-gradient(135deg, #fffdf9, #fff)", border: "1.5px solid #EAE5DC", borderRadius: "1.25rem" }}>
        <h3 style={{ fontFamily: SF, fontSize: "1.5rem", fontWeight: 600, color: "#111", marginBottom: "1.25rem" }}>
          Made This Recipe?
        </h3>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: "center", padding: "2rem 1rem" }}
            >
              <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎉</p>
              <p style={{ fontFamily: SF, fontSize: "1.4rem", fontWeight: 600, color: "#111", marginBottom: "0.4rem" }}>Thanks for your review!</p>
              <p style={{ fontFamily: SS, fontSize: "0.82rem", color: "#888" }}>Your rating helps other meat lovers find great recipes.</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {/* Star picker */}
              <div>
                <label style={{ fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, color: "#555", display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Your Rating *
                </label>
                <StarRating value={rating} onChange={setRating} size="lg" />
                {rating > 0 && (
                  <span style={{ fontFamily: SS, fontSize: "0.75rem", color: "#888", marginLeft: "0.5rem" }}>
                    {["", "Poor", "Fair", "Good", "Great", "Amazing!"][rating]}
                  </span>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="review-name" style={{ fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, color: "#555", display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Your Name
                </label>
                <input
                  id="review-name"
                  type="text"
                  placeholder="e.g. Jamie C."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={60}
                  style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: "0.65rem", border: "1.5px solid #DDD8CF", background: "#fff", fontFamily: SS, fontSize: "0.85rem", color: "#333", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="review-comment" style={{ fontFamily: SS, fontSize: "0.78rem", fontWeight: 600, color: "#555", display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Your Review *
                </label>
                <textarea
                  id="review-comment"
                  placeholder="What did you love about this recipe? Any tips for other cooks?"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={4}
                  maxLength={600}
                  style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: "0.65rem", border: "1.5px solid #DDD8CF", background: "#fff", fontFamily: SS, fontSize: "0.85rem", color: "#333", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                />
                <p style={{ fontFamily: SS, fontSize: "0.7rem", color: "#bbb", textAlign: "right", marginTop: "0.2rem" }}>{comment.length}/600</p>
              </div>

              {error && (
                <p style={{ fontFamily: SS, fontSize: "0.8rem", color: "#dc2626", background: "rgba(220,38,38,0.07)", padding: "0.6rem 0.85rem", borderRadius: "0.5rem" }}>{error}</p>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{ padding: "0.8rem 1.75rem", background: "#111", color: "#fff", border: "none", borderRadius: "0.75rem", fontFamily: SS, fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.04em", cursor: "pointer", alignSelf: "flex-start" }}
                data-testid="button-submit-review"
              >
                Submit Review
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
