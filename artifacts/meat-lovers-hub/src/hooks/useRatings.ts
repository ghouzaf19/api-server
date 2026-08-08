import { useState, useCallback } from "react";

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

const SEED_REVIEWS: Record<string, Review[]> = {
  "juicy-steak": [
    { id: "s1", name: "Jake M.", rating: 5, comment: "Made this last weekend and my wife said it was better than any steakhouse we've been to. The butter basting trick is a game changer!", date: "2026-04-18" },
    { id: "s2", name: "Rihanna T.", rating: 5, comment: "Perfect crust, perfect inside. Followed every step and it came out incredible.", date: "2026-04-22" },
    { id: "s3", name: "Carlos D.", rating: 4, comment: "Really good! I slightly overcooked mine but the flavour was still amazing. Will try again.", date: "2026-04-29" },
  ],
  "grilled-chicken": [
    { id: "g1", name: "Sophie L.", rating: 5, comment: "This marinade is absolutely delicious. Made it for a dinner party and everyone asked for the recipe!", date: "2026-04-15" },
    { id: "g2", name: "Marcus W.", rating: 4, comment: "Juicy and flavourful. I let it marinate overnight for even better results.", date: "2026-04-25" },
  ],
  "bbq-ribs": [
    { id: "r1", name: "Dave K.", rating: 5, comment: "Fall-off-the-bone doesn't even begin to describe it. My whole family went crazy for these.", date: "2026-04-10" },
    { id: "r2", name: "Priya N.", rating: 5, comment: "Took the full 3 hours but SO worth it. Best ribs I've ever made at home.", date: "2026-04-20" },
    { id: "r3", name: "Tom R.", rating: 4, comment: "Fantastic dry rub. I added a pinch of cayenne for extra heat — loved it.", date: "2026-04-27" },
  ],
  "smash-burger": [
    { id: "b1", name: "Aisha F.", rating: 5, comment: "The crispy edges are everything! My kids demolished these in minutes.", date: "2026-04-12" },
    { id: "b2", name: "Luke S.", rating: 5, comment: "Better than any fast food burger, hands down. The special sauce makes it.", date: "2026-04-19" },
    { id: "b3", name: "Chen W.", rating: 5, comment: "Quick and absolutely delicious. Now making these every Friday night!", date: "2026-05-01" },
  ],
};

function getKey(recipeId: string) { return `mlh_reviews_${recipeId}`; }

function loadReviews(recipeId: string): Review[] {
  try {
    const raw = localStorage.getItem(getKey(recipeId));
    const stored: Review[] = raw ? JSON.parse(raw) : [];
    const seeds = SEED_REVIEWS[recipeId] ?? [];
    const seedIds = new Set(seeds.map(s => s.id));
    const userReviews = stored.filter(r => !seedIds.has(r.id));
    return [...seeds, ...userReviews];
  } catch {
    return SEED_REVIEWS[recipeId] ?? [];
  }
}

function saveUserReview(recipeId: string, review: Review) {
  try {
    const raw = localStorage.getItem(getKey(recipeId));
    const stored: Review[] = raw ? JSON.parse(raw) : [];
    const updated = [...stored, review];
    localStorage.setItem(getKey(recipeId), JSON.stringify(updated));
  } catch {
    /* ignore */
  }
}

export function calcAverage(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function useRatings(recipeId: string) {
  const [reviews, setReviews] = useState<Review[]>(() => loadReviews(recipeId));

  const addReview = useCallback((name: string, rating: number, comment: string) => {
    const review: Review = {
      id: `user_${Date.now()}`,
      name: name.trim() || "Anonymous",
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().slice(0, 10),
    };
    saveUserReview(recipeId, review);
    setReviews(prev => [...prev, review]);
    return review;
  }, [recipeId]);

  const average = calcAverage(reviews);
  const count = reviews.length;

  return { reviews, addReview, average, count };
}
