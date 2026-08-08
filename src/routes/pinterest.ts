import { Router } from "express";

const router = Router();

const SITE =
  process.env.VITE_SITE_URL || "https://www.meatlovershub.com";

function pinImage(photo: string): string {
  return `https://images.unsplash.com/${photo}?w=1000&h=1500&fit=crop&q=85`;
}

function pinDesc(meta: string): string {
  const cta = " High-protein, easy recipe — save this pin! → meatlovershub.com";
  const full = meta + cta;
  return full.length <= 500 ? full : full.slice(0, 497) + "...";
}

interface PinRecipe {
  id: string;
  title: string;
  meta: string;
  photo: string;
}

const RECIPES: PinRecipe[] = [
  {
    id: "carnivore-meal-plan",
    title: "Full Week Carnivore Diet Meal Plan — Zero Carbs, Maximum Protein 🥩📋",
    meta: "Carnivore diet meal plan for a full week — breakfast, lunch, and dinner every day. Zero carbs, high protein, with shopping list and prep tips. Start your carnivore diet here.",
    photo: "photo-1529692236671-f1f6cf9683ba",
  },
  {
    id: "tomahawk-steak",
    title: "Tomahawk Steak at Home — The Most Impressive Thing You'll Ever Cook 🪓🥩🔥",
    meta: "Tomahawk steak recipe — how to cook the ultimate bone-in ribeye to perfect medium-rare. Reverse sear method, step by step. The most impressive steak you can serve.",
    photo: "photo-1615937722923-67f6deaf2cc9",
  },
  {
    id: "beef-tallow",
    title: "Render Beef Tallow at Home — The Cooking Fat That Changes Everything 🥩🍳",
    meta: "How to render beef tallow at home — step-by-step guide. The ultimate cooking fat for carnivore diets, high-heat searing, and the best fries you've ever tasted.",
    photo: "photo-1547592180-85f173990554",
  },
  {
    id: "reverse-sear-ribeye",
    title: "Reverse Sear Ribeye = Perfect Steak Every Time 🥩🔥 — The Method That Changed Everything",
    meta: "Reverse sear ribeye recipe — the foolproof method for edge-to-edge perfect medium-rare. Low oven first, screaming-hot sear last. The best way to cook a thick steak.",
    photo: "photo-1600891964092-4316c288032e",
  },
  {
    id: "smoked-beef-brisket",
    title: "Texas Smoked Brisket at Home — Bark So Good It'll Break Your Brain 🔥🥩",
    meta: "Texas-style smoked beef brisket recipe — just salt, pepper, and smoke. Master the bark, the stall, and the wrap. The most satisfying BBQ you'll ever cook.",
    photo: "photo-1558030006-450675393462",
  },
  {
    id: "carnivore-steak-and-eggs",
    title: "The ULTIMATE Carnivore Steak and Eggs Breakfast 🥩🍳 — Ready in 20 Minutes",
    meta: "Carnivore steak and eggs breakfast — seared sirloin steak and perfectly fried eggs cooked in beef fat. High protein, zero carbs, ready in 20 minutes. The ultimate carnivore diet breakfast.",
    photo: "photo-1525351484163-7529414344d8",
  },
  {
    id: "carnivore-scotch-eggs-beef",
    title: "Carnivore Scotch Eggs with Ground Beef — No Breadcrumbs, All Protein 🥚🥩",
    meta: "Carnivore Scotch eggs with ground beef and no breadcrumbs — just beef and eggs, seasoned perfectly. High protein, zero carb, meal-prep friendly. Best carnivore snack recipe.",
    photo: "photo-1482049016688-2d3e1b311543",
  },
  {
    id: "bbq-bacon-cheeseburger",
    title: "The Ultimate BBQ Bacon Cheeseburger — Skip the Drive-Through 🍔🔥",
    meta: "Skip the drive-through — this homemade BBQ bacon cheeseburger beats any fast food. Smoky, juicy, loaded with flavour, ready in 25 minutes.",
    photo: "photo-1550547660-d9450f859349",
  },
  {
    id: "pan-seared-lamb-chops",
    title: "Fancy-Looking Lamb Chops That Take 20 Minutes — Rosemary Garlic Butter 🧄",
    meta: "Restaurant-quality pan-seared lamb chops with rosemary garlic butter — ready in 20 minutes, minimal effort, guaranteed to impress every time.",
    photo: "photo-1432139555190-58524dae6a55",
  },
  {
    id: "korean-beef-bulgogi",
    title: "Bulgogi That Beats Any Takeout — Sweet, Smoky Korean Beef in 30 Minutes 🔥",
    meta: "Tender, sweet, and smoky Korean beef bulgogi made at home in 30 minutes. Just like your favourite Korean BBQ — but fresher, cheaper, and better.",
    photo: "photo-1529692236671-f1f6cf9683ba",
  },
  {
    id: "honey-garlic-chicken-thighs",
    title: "Sticky Honey Garlic Chicken Thighs — One Pan, 30 Minutes, Obsessed 🍯",
    meta: "These sticky honey garlic chicken thighs are ready in 30 minutes, made in one pan, and go on weekly rotation immediately. Only 6 ingredients!",
    photo: "photo-1567620832903-9fc6debc209f",
  },
  {
    id: "slow-cooker-pulled-pork",
    title: "Set-It-and-Forget-It Pulled Pork — So Tender It Falls Apart 🔥",
    meta: "Make the most tender slow cooker pulled pork with this 6-ingredient recipe. 8 hours, feeds a crowd, perfect for sandwiches and BBQ nights.",
    photo: "photo-1529193591184-b1d58069ecdd",
  },
  {
    id: "smash-burger",
    title: "Better Than Five Guys — The SMASH BURGER You'll Make Every Week 🍔",
    meta: "Make the crispiest smash burgers at home — crispy edges, melted cheese, and a secret special sauce on a toasted brioche bun.",
    photo: "photo-1568901346375-23c9450c58cd",
  },
  {
    id: "bbq-ribs",
    title: "These BBQ Ribs FALL OFF THE BONE — 3-2-1 Method at Home 🔥",
    meta: "Master fall-off-the-bone BBQ baby back ribs using the 3-2-1 method. Smoky dry rub, perfectly tender meat, and a sticky BBQ glaze that slaps.",
    photo: "photo-1544025162-d76694265947",
  },
  {
    id: "juicy-steak",
    title: "This Ribeye is INSANELY Good — Garlic Butter Steak in 30 Minutes 🔥",
    meta: "Learn how to cook a perfect juicy ribeye steak with garlic butter and fresh herbs. Ready in 30 minutes — restaurant quality at home!",
    photo: "photo-1546964124-0cce460f38ef",
  },
  {
    id: "grilled-chicken",
    title: "This Grilled Chicken is INSANELY Juicy 🔥 — 5-Ingredient Marinade!",
    meta: "The juiciest grilled chicken recipe with a simple lemon-herb marinade. 5 ingredients, perfect char marks every time.",
    photo: "photo-1532550907401-a500c9a57435",
  },
];

router.get("/pinterest-feed", (_req, res) => {
  const feed = RECIPES.map((r) => ({
    title: r.title,
    description: pinDesc(r.meta),
    image: pinImage(r.photo),
    url: `${SITE}/recipes/${r.id}`,
  }));

  res
    .setHeader("Content-Type", "application/json; charset=utf-8")
    .setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400")
    .setHeader("Access-Control-Allow-Origin", "*")
    .json(feed);
});

export default router;
