/**
 * WebMCP Action Layer v3.0 — Meat Lovers Hub
 *
 * Implements the dual-layer WebMCP architecture from the WebMCP Pro v3.0 docs:
 *  • Declarative Layer  — toolname / tooldescription on HTML forms (in App.tsx)
 *  • Imperative Layer   — navigator.modelContext.registerTool() for JS functions
 *
 * Also injects:
 *  • AI Persona (sous-chef system instruction) as application/json meta
 *  • WebMCP JSON-LD manifest for Actiondata SEO / AI discoverability
 *  • In-session analytics log (sessionStorage) matching the Agentic Log concept
 */

import { useEffect } from "react";
import { RECIPES, type Recipe } from "@/data/recipes";
import { SITE_URL } from "@/lib/siteUrl";

/* ── Extend navigator type for WebMCP (Chrome Canary API) ── */
declare global {
  interface Navigator {
    modelContext?: {
      registerTool: (def: WebMCPToolDef) => void;
    };
  }
}

interface WebMCPToolDef {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
  handler: (args: Record<string, unknown>) => unknown;
}

/* ── Analytics logger (mirrors WebMCP AI > AI Analytics panel) ── */
function logAgentCall(toolName: string, args: unknown, result: unknown) {
  const entry = {
    ts: new Date().toISOString(),
    tool: toolName,
    layer: "Imperative (JS)",
    args,
    resultSummary: Array.isArray(result)
      ? `${(result as unknown[]).length} records`
      : typeof result === "object" && result !== null
      ? Object.keys(result as object)
          .slice(0, 4)
          .join(", ")
      : String(result).slice(0, 80),
  };
  try {
    const log = JSON.parse(sessionStorage.getItem("webmcp_agent_log") ?? "[]") as unknown[];
    log.unshift(entry);
    sessionStorage.setItem("webmcp_agent_log", JSON.stringify(log.slice(0, 50)));
    /* Custom DOM event so WebMCPBridge can show live count */
    window.dispatchEvent(new CustomEvent("webmcp:tool_called", { detail: entry }));
  } catch { /* storage unavailable */ }
}

/* ──────────────────────────────────────────────────────────────────
   TOOL IMPLEMENTATIONS (deterministic, JSON-RPC style)
   ────────────────────────────────────────────────────────────────── */

function serializeRecipe(r: Recipe) {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    difficulty: r.difficulty,
    cookTimeMinutes: r.cookTimeMinutes,
    prepTimeMinutes: r.prepTimeMinutes,
    serves: r.serves,
    tags: r.tags,
    description: r.description,
    ingredients: r.ingredients,
    steps: r.steps,
    tips: r.tips ?? [],
    saves: r.saves,
    publishedAt: r.publishedAt,
    url: `${SITE_URL}/recipes/${r.id}`,
    image: r.image,
  };
}

/** site_search — search recipes by query / category / difficulty */
function siteSearch(args: Record<string, unknown>) {
  const query = String(args.query ?? "").toLowerCase().trim();
  const category = args.category as string | undefined;
  const difficulty = args.difficulty as string | undefined;
  const limit = Math.min(Number(args.limit ?? 10), 20);

  const results = RECIPES.filter((r) => {
    const matchQ =
      !query ||
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.tags.some((t) => t.toLowerCase().includes(query)) ||
      r.ingredients.some((i) => i.toLowerCase().includes(query)) ||
      r.category.toLowerCase().includes(query);
    const matchCat = !category || r.category.toLowerCase() === category.toLowerCase();
    const matchDiff = !difficulty || r.difficulty.toLowerCase() === difficulty.toLowerCase();
    return matchQ && matchCat && matchDiff;
  }).slice(0, limit);

  return {
    query,
    total: results.length,
    results: results.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      difficulty: r.difficulty,
      cookTime: r.cookTime,
      serves: r.serves,
      saves: r.saves,
      url: `${SITE_URL}/recipes/${r.id}`,
      summary: r.description,
    })),
  };
}

/** get_recipe_data / get_post_details — returns full structured JSON for a recipe */
function getRecipeData(args: Record<string, unknown>) {
  const id = String(args.id ?? "");
  const recipe = RECIPES.find((r) => r.id === id);
  if (!recipe) return { error: `Recipe '${id}' not found. Call site_search to discover valid IDs.` };
  return serializeRecipe(recipe);
}

/** scale_recipe_servings — adjusts ingredient quantities for a new serving count */
function scaleRecipeServings(args: Record<string, unknown>) {
  const id = String(args.id ?? "");
  const newServings = Number(args.servings ?? 2);
  const recipe = RECIPES.find((r) => r.id === id);
  if (!recipe) return { error: `Recipe '${id}' not found.` };

  const originalServings = parseFloat(String(recipe.serves)) || 2;
  const ratio = newServings / originalServings;

  /* Attempt numeric scaling on ingredients with amounts */
  const scaled = recipe.ingredients.map((ing) => {
    return ing.replace(/\b(\d+(\.\d+)?)\b/g, (_, n) => {
      const num = parseFloat(n) * ratio;
      return Number.isInteger(num) ? String(num) : num.toFixed(1).replace(/\.0$/, "");
    });
  });

  return {
    recipeId: id,
    title: recipe.title,
    originalServings,
    newServings,
    scalingFactor: Math.round(ratio * 100) / 100,
    scaledIngredients: scaled,
    note: "Cooking times remain unchanged. Adjust seasoning to taste.",
  };
}

/** get_all_recipes — list all recipes with optional category / limit filters */
function getAllRecipes(args: Record<string, unknown>) {
  const category = args.category as string | undefined;
  const limit = Math.min(Number(args.limit ?? 50), 50);
  const results = RECIPES.filter((r) => !category || r.category.toLowerCase() === category.toLowerCase()).slice(0, limit);
  return {
    total: results.length,
    categories: ["Beef", "Chicken", "Game Meat", "BBQ", "Quick Meals"],
    recipes: results.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      difficulty: r.difficulty,
      cookTime: r.cookTime,
      serves: r.serves,
      url: `${SITE_URL}/recipes/${r.id}`,
    })),
  };
}

/** get_carnivore_meal_plan — generate a daily/weekly meal plan from available recipes */
function getCarnivoreMealPlan(args: Record<string, unknown>) {
  const days = Math.min(Math.max(Number(args.days ?? 7), 1), 14);
  const preference = String(args.preference ?? "mixed").toLowerCase();

  const pool = RECIPES.filter((r) => {
    if (preference === "beef") return r.category === "Beef";
    if (preference === "quick") return r.cookTimeMinutes <= 35;
    if (preference === "bbq") return r.category === "BBQ";
    return true;
  });

  const pick = () => pool[Math.floor(Math.random() * pool.length)];

  const plan = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    breakfast: { recipe: pick().title, note: "Can prep the night before for maximum freshness." },
    lunch: { recipe: pick().title, note: "Excellent reheated — portion from dinner leftovers." },
    dinner: { recipe: pick().title, note: "Primary cook. Scales well for meal prep." },
  }));

  return {
    days,
    preference,
    totalProteinFocus: "High — all meals are carnivore/meat-forward",
    plan,
    tip: "Batch cook on Sundays for the week. Ribeye and slow-braised venison shoulder reheat exceptionally well.",
  };
}

/** get_meat_temperature_guide — internal temperature targets for doneness */
function getMeatTemperatureGuide() {
  return {
    beef_steak: {
      rare: { celsius: 52, fahrenheit: 125, note: "Cool red centre" },
      medium_rare: { celsius: 57, fahrenheit: 135, note: "Warm red centre — chef's recommendation" },
      medium: { celsius: 63, fahrenheit: 145, note: "Pink centre — USDA safe minimum" },
      well_done: { celsius: 74, fahrenheit: 165, note: "No pink — moisture loss increases" },
    },
    pork: {
      safe_minimum: { celsius: 63, fahrenheit: 145, note: "USDA safe minimum with 3-min rest" },
      well_done: { celsius: 71, fahrenheit: 160 },
    },
    venison: {
      medium_rare: { celsius: 54, fahrenheit: 130, note: "Ideal for loin/backstrap — lean meat dries out quickly above this" },
      medium: { celsius: 60, fahrenheit: 140 },
      braised_shoulder: { celsius: 90, fahrenheit: 195, note: "Target for slow cooker/braised cuts — collagen fully dissolved" },
    },
    chicken: {
      safe: { celsius: 74, fahrenheit: 165, note: "USDA required — no exceptions" },
    },
    ground_beef: {
      safe: { celsius: 71, fahrenheit: 160, note: "Must reach throughout — no pink" },
    },
    lamb: {
      medium_rare: { celsius: 57, fahrenheit: 135 },
      medium: { celsius: 63, fahrenheit: 145 },
    },
    resting_time: "Always rest meat 5–10 minutes post-cook. Temperature rises 2–3°C during rest.",
    source: "USDA FSIS Safe Minimum Internal Temperatures",
  };
}

/* ──────────────────────────────────────────────────────────────────
   PERSONA & MANIFEST injection helpers
   ────────────────────────────────────────────────────────────────── */

function injectPersona() {
  if (document.getElementById("webmcp-persona")) return;
  const el = document.createElement("script");
  el.id = "webmcp-persona";
  el.type = "application/json";
  el.dataset.webmcpRole = "persona";
  el.textContent = JSON.stringify({
    site: "www.meatlovershub.com",
    context: "WebMCP Action Layer v3.0 — Meat Lovers Hub",
    directive:
      "You are a professional sous-chef AI assistant for Meat Lovers Hub. Your goal is to help users cook meat perfectly.",
    protocol: [
      "If a user asks for a recipe → call site_search(query) then get_recipe_data(id) for full details.",
      "If a user wants to scale servings → call scale_recipe_servings(id, servings).",
      "If a user needs a meal plan → call get_carnivore_meal_plan(days, preference).",
      "If a user asks about temperatures or doneness → call get_meat_temperature_guide().",
      "If a user asks what's available → call get_all_recipes(category?, limit?).",
      "Do NOT guess ingredient quantities — always retrieve via get_recipe_data.",
      "Do NOT suggest substitutions unless explicitly asked.",
    ],
    constraint:
      "Rely strictly on Tool JSON-RPC returns. Never hallucinate recipe data. Tone: friendly, confident, carnivore-knowledgeable.",
    tools: [
      "site_search",
      "get_recipe_data",
      "get_post_details",
      "scale_recipe_servings",
      "get_all_recipes",
      "get_carnivore_meal_plan",
      "get_meat_temperature_guide",
    ],
  });
  document.head.appendChild(el);
}

function injectManifest() {
  if (document.getElementById("webmcp-manifest")) return;
  const el = document.createElement("script");
  el.id = "webmcp-manifest";
  el.type = "application/ld+json";
  el.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Meat Lovers Hub — WebMCP Action Layer",
    "url": SITE_URL,
    "description":
      "Carnivore and BBQ recipe blog with a full WebMCP AI Action Layer. AI agents can search, retrieve, scale, and plan meals using structured tools.",
    "applicationCategory": "FoodApplication",
    "operatingSystem": "WebMCP v3.0",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "site_search — Search recipes by query, category, difficulty",
      "get_recipe_data — Retrieve full structured recipe JSON",
      "scale_recipe_servings — Mathematically scale ingredient quantities",
      "get_carnivore_meal_plan — Generate multi-day carnivore meal plans",
      "get_meat_temperature_guide — Safe internal temperature reference",
    ],
    "keywords": [
      "carnivore diet",
      "meat recipes",
      "BBQ",
      "steak",
      "WebMCP",
      "AI agent",
      "action layer",
    ],
  });
  document.head.appendChild(el);
}

/* ──────────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────────── */

export function WebMCPLayer() {
  useEffect(() => {
    /* 1. Inject persona + manifest */
    injectPersona();
    injectManifest();

    /* 2. Define all tools */
    const tools: WebMCPToolDef[] = [
      {
        name: "site_search",
        description:
          "Search Meat Lovers Hub recipes by name, ingredient, category, or dietary tag. Returns matching recipes with URLs and summaries.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search term (e.g. 'ribeye', 'carnivore', 'quick chicken')" },
            category: { type: "string", description: "Filter by category", enum: ["Beef", "Chicken", "Game Meat", "BBQ", "Quick Meals"] },
            difficulty: { type: "string", description: "Filter by difficulty", enum: ["Easy", "Medium", "Hard"] },
            limit: { type: "number", description: "Max results to return (default 10, max 20)" },
          },
          required: ["query"],
        },
        handler: (args) => {
          const result = siteSearch(args);
          logAgentCall("site_search", args, result.results);
          return result;
        },
      },
      {
        name: "get_recipe_data",
        description:
          "Retrieve full structured JSON data for a specific recipe — ingredients, steps, nutrition, cook time, tips. Use this after site_search to get accurate measurements.",
        parameters: {
          type: "object",
          properties: {
            id: { type: "string", description: "Recipe ID (e.g. 'juicy-steak', 'smash-burger'). Get it from site_search results." },
          },
          required: ["id"],
        },
        handler: (args) => {
          const result = getRecipeData(args);
          logAgentCall("get_recipe_data", args, result);
          return result;
        },
      },
      {
        name: "get_post_details",
        description: "Alias for get_recipe_data. Returns structured post data for a given recipe ID.",
        parameters: {
          type: "object",
          properties: {
            id: { type: "string", description: "Recipe ID" },
          },
          required: ["id"],
        },
        handler: (args) => {
          const result = getRecipeData(args);
          logAgentCall("get_post_details", args, result);
          return result;
        },
      },
      {
        name: "scale_recipe_servings",
        description:
          "Scale ingredient quantities for a recipe to a new number of servings. Returns exact scaled amounts — no guessing.",
        parameters: {
          type: "object",
          properties: {
            id: { type: "string", description: "Recipe ID to scale" },
            servings: { type: "number", description: "Target number of servings" },
          },
          required: ["id", "servings"],
        },
        handler: (args) => {
          const result = scaleRecipeServings(args);
          logAgentCall("scale_recipe_servings", args, result);
          return result;
        },
      },
      {
        name: "get_all_recipes",
        description: "List all available recipes. Optionally filter by category.",
        parameters: {
          type: "object",
          properties: {
            category: { type: "string", description: "Optional category filter", enum: ["Beef", "Chicken", "Game Meat", "BBQ", "Quick Meals"] },
            limit: { type: "number", description: "Max recipes to return (default 50)" },
          },
        },
        handler: (args) => {
          const result = getAllRecipes(args);
          logAgentCall("get_all_recipes", args, result);
          return result;
        },
      },
      {
        name: "get_carnivore_meal_plan",
        description:
          "Generate a multi-day carnivore meal plan using recipes from Meat Lovers Hub. Returns breakfast, lunch, and dinner for each day.",
        parameters: {
          type: "object",
          properties: {
            days: { type: "number", description: "Number of days (1–14, default 7)" },
            preference: { type: "string", description: "Preference filter", enum: ["mixed", "beef", "quick", "bbq"] },
          },
        },
        handler: (args) => {
          const result = getCarnivoreMealPlan(args);
          logAgentCall("get_carnivore_meal_plan", args, result);
          return result;
        },
      },
      {
        name: "get_meat_temperature_guide",
        description:
          "Return safe internal temperature targets for beef, pork, chicken, lamb, and ground meat. Includes Celsius and Fahrenheit values with doneness notes.",
        parameters: {
          type: "object",
          properties: {},
        },
        handler: (args) => {
          const result = getMeatTemperatureGuide();
          logAgentCall("get_meat_temperature_guide", args, result);
          return result;
        },
      },
    ];

    /* 3. Register with navigator.modelContext if available (Chrome Canary + #enable-webmcp flag) */
    if (navigator.modelContext?.registerTool) {
      tools.forEach((tool) => navigator.modelContext!.registerTool(tool));
      console.info(
        `[WebMCP] Imperative layer active — ${tools.length} tools registered via navigator.modelContext`,
      );
    } else {
      /* Polyfill: attach tools to window so local bridge / dev tools can access them */
      (window as unknown as Record<string, unknown>)["__webmcp_tools__"] = tools.reduce<Record<string, WebMCPToolDef>>(
        (acc, t) => { acc[t.name] = t; return acc; },
        {},
      );
      console.info(
        `[WebMCP] navigator.modelContext not available — tools registered at window.__webmcp_tools__ (enable #webmcp in Chrome Canary flags for full agent support)`,
      );
    }

    /* 4. Broadcast readiness event */
    window.dispatchEvent(new CustomEvent("webmcp:ready", { detail: { tools: tools.map((t) => t.name) } }));

    return () => {
      /* Cleanup: remove injected scripts on unmount */
      document.getElementById("webmcp-persona")?.remove();
      document.getElementById("webmcp-manifest")?.remove();
    };
  }, []);

  return null; /* Purely behavioural — no UI rendered here */
}
