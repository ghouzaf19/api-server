import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  GenerateBlogPostBody,
  GetTopicalAuthorityBody,
  CheckInfoGainBody,
  EnhanceEEATBody,
  QualityCheckBody,
  GenerateAltTextBody,
  MineRedditKeywordsBody,
  AnalyzeDocumentBody,
  GenerateDocBlogBody,
  AlchemizePromptBody,
  RefreshContentBody,
  RunGoogleAuditBody,
  ExecuteRoadmapBody,
} from "@workspace/api-zod";

const router = Router();

const MODEL = "gpt-4o";
const MAX_TOKENS = 8192;

function parseJSON<T>(text: string): T {
  const match = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
  const raw = match ? (match[1] ?? match[0]) : text;
  return JSON.parse(raw.trim()) as T;
}

/**
 * The model occasionally returns `content` (or `outline`) as a structured
 * object with section keys instead of a plain markdown string.
 * This normaliser converts any such object to readable markdown so the
 * frontend never receives a non-string in a field it renders as text.
 */
function objectToMarkdown(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value
      .map((item, i) =>
        typeof item === "string"
          ? `${i + 1}. ${item}`
          : objectToMarkdown(item)
      )
      .join("\n\n");
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => {
        const heading = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (s) => s.toUpperCase())
          .trim();
        const body =
          typeof val === "string"
            ? val
            : Array.isArray(val)
            ? (val as unknown[]).map((v) => `- ${String(v)}`).join("\n")
            : objectToMarkdown(val);
        return `## ${heading}\n\n${body}`;
      })
      .join("\n\n");
  }
  return String(value);
}

function normalizeStringFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  for (const field of fields) {
    if (typeof obj[field] !== "string") {
      (obj as Record<string, unknown>)[field as string] = objectToMarkdown(obj[field]);
    }
  }
  return obj;
}

router.post("/generate", async (req, res) => {
  const parsed = GenerateBlogPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { topic, niche } = parsed.data;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "system",
          content: `You are an expert SEO content strategist and writer. Generate deeply researched, high-quality blog posts optimized for search engines and human readers alike. Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: `Generate a comprehensive, SEO-optimized blog post for the topic: "${topic}" in the niche: "${niche}".

Respond with a JSON object with these exact fields:
{
  "title": "SEO-optimized title (50-60 chars)",
  "outline": "Full H2/H3 outline as markdown",
  "content": "Full article in markdown (minimum 1500 words, include intro, body sections, conclusion)",
  "seoScore": <number 0-100>,
  "wordCount": <number>,
  "readabilityTips": ["tip1", "tip2", "tip3"]
}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    const result = parseJSON<{
      title: string;
      outline: string;
      content: string;
      seoScore: number;
      wordCount: number;
      readabilityTips: string[];
    }>(text);
    normalizeStringFields(result, ["title", "outline", "content"]);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to generate blog post");
    res.status(500).json({ error: "Failed to generate blog post" });
  }
});

// ── Shared image-prompt helper ────────────────────────────────────────────────

const IMAGE_PROMPT_SYSTEM = `You are a world-class AI image prompt engineer and editorial photographer. You write extremely detailed, production-ready prompts for Midjourney, DALL·E 3, Flux, Ideogram, and Stable Diffusion. Always respond with valid JSON.`;

function buildImagePromptUserMsg(topic: string, niche: string, title: string, sections: string[]): string {
  const sectionList = sections.length > 0 ? sections.join(" | ") : "Introduction, Main Process, Final Result";
  return `Generate production-ready AI image prompts for this article.

Title: "${title}"
Topic: "${topic}"
Niche: "${niche}"
Article sections: ${sectionList}

Generate 7–8 image prompts covering: hero image, ingredient/setup shot, one per major section/process step, final plated/presented result, and a Pinterest vertical pin.

Every prompt MUST explicitly specify all of:
- Camera angle (eye-level close-up, bird's eye overhead, 45° three-quarter, extreme macro)
- Lens (85mm portrait, 100mm macro, 50mm standard, 24mm wide angle)
- Lighting (golden hour natural light streaming through window, studio twin softbox, dramatic single side light, moody candlelight atmosphere)
- Depth of field (f/1.8 razor-thin bokeh, f/8 fully tack-sharp, f/2.8 shallow mid-focus)
- Color palette (warm amber and honey tones, cool dark moody charcoal, vibrant saturated jewel tones, muted earthy terracotta)
- Texture details (glistening caramelised glaze, crispy char edges, juicy marbled interior, velvety smooth sauce)
- Background / environment (rustic reclaimed oak table, dark polished slate, white Carrara marble countertop, aged linen cloth)
- Styling props and garnish specifics
- Steam / smoke / condensation effects where relevant
- Composition technique (rule of thirds, centered hero shot, negative space on right, leading lines)
- Professional editorial magazine style

Respond with JSON:
{
  "imagePrompts": [
    {
      "id": "hero",
      "title": "Hero Image",
      "placement": "Above the introduction / article featured image",
      "aspectRatio": "16:9",
      "style": "Ultra-realistic professional editorial photography",
      "altText": "SEO-optimised alt text 100–125 chars",
      "aiPrompt": "Full production-ready prompt string with all technical specifications listed above",
      "pinterestPin": "2:3 vertical pin composition description for Pinterest"
    }
  ]
}`;
}

router.post("/image-prompts", async (req, res) => {
  const { topic, niche, title, sections } = req.body as {
    topic?: string; niche?: string; title?: string; sections?: string[];
  };
  if (!topic || !niche) {
    res.status(400).json({ error: "topic and niche are required" });
    return;
  }
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        { role: "system", content: IMAGE_PROMPT_SYSTEM },
        { role: "user", content: buildImagePromptUserMsg(topic, niche, title ?? topic, sections ?? []) },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    const result = parseJSON<{ imagePrompts: unknown[] }>(text);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to generate image prompts");
    res.status(500).json({ error: "Failed to generate image prompts" });
  }
});

router.post("/topical-authority", async (req, res) => {
  const parsed = GetTopicalAuthorityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { topic, niche, existingPosts } = parsed.data;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are an SEO topical authority expert. Analyze content clusters and recommend internal linking strategies. Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: `Analyze topical authority for topic: "${topic}" in niche: "${niche}".
Existing posts: ${existingPosts.length > 0 ? existingPosts.join(", ") : "none yet"}

Respond with JSON:
{
  "pillarTopic": "the main pillar topic",
  "clusterTopics": ["subtopic1", "subtopic2", ...],
  "internalLinks": [
    { "anchorText": "text", "targetPost": "title", "reason": "why link here" }
  ],
  "missingClusterTopics": ["missing1", "missing2", ...]
}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    res.json(parseJSON(text));
  } catch (err) {
    req.log.error({ err }, "Failed to analyze topical authority");
    res.status(500).json({ error: "Failed to analyze topical authority" });
  }
});

router.post("/info-gain", async (req, res) => {
  const parsed = CheckInfoGainBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { topic, niche, outline } = parsed.data;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are an information gain SEO analyst. Compare content against typical competitor content and identify what's unique, what's missing, and what opportunities exist. Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: `Analyze information gain for topic: "${topic}" in niche: "${niche}".
Content outline: ${outline}

Respond with JSON:
{
  "coveredPoints": ["point1", "point2", ...],
  "missingPoints": ["point1", "point2", ...],
  "uniqueAngle": "what makes this unique vs competitors",
  "competitorGaps": ["gap1", "gap2", ...],
  "gainScore": <number 0-100>
}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    res.json(parseJSON(text));
  } catch (err) {
    req.log.error({ err }, "Failed to check information gain");
    res.status(500).json({ error: "Failed to check information gain" });
  }
});

router.post("/eeat-enhance", async (req, res) => {
  const parsed = EnhanceEEATBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { content, niche, authorPersona } = parsed.data;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "system",
          content: `You are an E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) SEO specialist. Rewrite content to demonstrate higher E-E-A-T signals for Google. Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: `Enhance this content for E-E-A-T in the "${niche}" niche.
Author persona: ${authorPersona}

Content to enhance:
${content}

Respond with JSON:
{
  "enhancedContent": "the rewritten content with E-E-A-T improvements",
  "changesApplied": ["change1", "change2", ...],
  "eeатScore": <number 0-100>
}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    res.json(parseJSON(text));
  } catch (err) {
    req.log.error({ err }, "Failed to enhance E-E-A-T");
    res.status(500).json({ error: "Failed to enhance E-E-A-T" });
  }
});

router.post("/quality-check", async (req, res) => {
  const parsed = QualityCheckBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { content } = parsed.data;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are a content quality checker. Extract verifiable facts, flag weak claims, and score readability. Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: `Perform a quality check on this content:

${content}

Respond with JSON:
{
  "facts": [
    { "fact": "factual claim", "verifiable": true/false, "category": "statistic|quote|claim|date" }
  ],
  "flaggedClaims": [
    { "claim": "weak claim", "reason": "why flagged", "severity": "low|medium|high" }
  ],
  "overallRisk": "low|medium|high",
  "readabilityScore": <number 0-100>
}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    res.json(parseJSON(text));
  } catch (err) {
    req.log.error({ err }, "Failed to quality check");
    res.status(500).json({ error: "Failed to quality check" });
  }
});

router.post("/alt-text", async (req, res) => {
  const parsed = GenerateAltTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { imageDescription, context, count = 3 } = parsed.data;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: `You are an image SEO specialist. Generate descriptive, keyword-rich alt text for images that improves accessibility and search rankings. Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: `Generate ${count} alt text options for an image.
Image description: ${imageDescription}
Context/surrounding content: ${context}

Respond with JSON:
{
  "suggestions": [
    { "altText": "alt text here", "characterCount": <number>, "seoNotes": "why this works" }
  ]
}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    res.json(parseJSON(text));
  } catch (err) {
    req.log.error({ err }, "Failed to generate alt text");
    res.status(500).json({ error: "Failed to generate alt text" });
  }
});

router.post("/reddit-mine", async (req, res) => {
  const parsed = MineRedditKeywordsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { input, niche } = parsed.data;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are a Reddit SEO keyword mining expert. You analyze Reddit thread content, comments, and discussions to extract high-value SEO keyword opportunities for bloggers. You understand search intent deeply — explicit, implicit, comparison, and problem-solving queries. Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: `Analyze the following Reddit content for the "${niche}" niche and extract SEO keyword opportunities.

Reddit content to analyze:
"""
${input}
"""

Extract real patterns from this content. Look for:
- Questions people are asking
- Problems and pain points they mention
- Comparisons they make (X vs Y)
- Things they wish existed or want to know
- Implicit needs behind their words

Respond with JSON:
{
  "keywords": [
    {
      "keyword": "exact keyword phrase (2-5 words)",
      "intent": "explicit | implicit | comparison | problem",
      "volume": "high | medium | low",
      "difficulty": "easy | medium | hard",
      "blogTitle": "Ready-to-use SEO-optimized blog title for this keyword"
    }
  ],
  "contentIdeas": [
    {
      "title": "Complete blog post title",
      "type": "blog-post | faq | vs-comparison | how-to | listicle",
      "angle": "What unique angle makes this stand out from generic content",
      "redditSignal": "The specific Reddit insight (quote or pattern) that inspired this"
    }
  ],
  "userPains": ["Real pain point 1", "Real pain point 2", ...],
  "vsKeywords": ["X vs Y keyword 1", "X vs Y keyword 2", ...],
  "faqQuestions": ["Question suitable for FAQ or People Also Ask 1", ...],
  "summary": "2-3 sentence summary of the SEO opportunity in this content"
}

Generate at least 6 keywords, 4 content ideas, 4 user pains, 3 vs keywords, and 5 FAQ questions.`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    res.json(parseJSON(text));
  } catch (err) {
    req.log.error({ err }, "Failed to mine Reddit keywords");
    res.status(500).json({ error: "Failed to mine Reddit keywords" });
  }
});

router.post("/roadmap-execute", async (req, res) => {
  const parsed = ExecuteRoadmapBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { roadmapJson, roadmap2Json, postTitle, postContent, niche, blogUrl } = parsed.data;

  type RoadmapTask = { id: number; category?: string; priority?: string; en?: { title?: string; desc?: string; steps?: string[] }; title?: string; description?: string; steps?: string[] };
  type Roadmap = { tasks?: RoadmapTask[] };

  let roadmap: Roadmap = {};
  try { roadmap = JSON.parse(roadmapJson) as Roadmap; } catch {
    res.status(400).json({ error: "Invalid SEO roadmap JSON" });
    return;
  }

  const taskSummary = (roadmap.tasks ?? [])
    .map((t) => `Task ${t.id} [${t.category ?? ""}/${t.priority ?? ""}]: "${t.en?.title ?? t.title ?? ""}" — ${t.en?.desc ?? t.description ?? ""} | Steps: ${(t.en?.steps ?? t.steps ?? []).join(", ")}`)
    .join("\n");

  const seoPromise = openai.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: "system",
        content: `You are a world-class SEO implementation expert. You IMPLEMENT strategies directly on real blog content — producing specific before/after transformations, real rewrites, and actionable steps. Always respond with valid JSON.`,
      },
      {
        role: "user",
        content: `Execute this SEO roadmap on the following blog post. For EACH task: analyze current content, identify the gap, produce a REAL before/after transformation with the strategy fully applied.

NICHE: ${niche}
${blogUrl ? `BLOG URL: ${blogUrl}` : ""}
BLOG POST TITLE: "${postTitle}"
BLOG POST CONTENT:
"""
${postContent.slice(0, 7000)}
"""

ROADMAP TASKS:
${taskSummary}

For EACH task produce:
- gapAnalysis: What is specifically weak in THIS content (2-3 sentences referencing the actual text)
- before: An actual excerpt from the content showing the current state
- after: The REWRITTEN improved version with strategy fully applied (real text, minimum 100 words)
- implementations: 5 specific numbered steps to apply across the whole blog
- impactScore: 0-100 estimated traffic/ranking impact

Then produce these blog-wide outputs:
1. optimizedPost: Full restructure applying ALL strategies:
   - title: Discover-ready, curiosity-driven, 60 chars max
   - metaDescription: 155 char meta with primary keyword
   - intro: 3-sentence emotional opening hook with keyword
   - sections: 6 H2 sections, each with heading + 180-220 word semantically chunked content block including unique insight, personal note, or original data point

2. homepageStructure: 10 homepage sections with purpose descriptions

3. keywords: 15 SEO keywords for "${niche}" — 5 head terms, 5 long-tail, 5 carnivore/BBQ question-based

4. pinterestStrategy: 6 Pinterest pins — title, hook copy, image idea, board suggestion

5. backlinkTargets: 6 niche-relevant sites — website, link type, specific outreach approach

6. overallPriorityOrder: Tasks ranked by traffic impact (highest first)

Respond with JSON matching this exact shape:
{
  "taskResults": [{ "taskId": 1, "title": "...", "category": "...", "priority": "...", "gapAnalysis": "...", "before": "...", "after": "...", "implementations": ["..."], "impactScore": 85 }],
  "optimizedPost": { "title": "...", "metaDescription": "...", "intro": "...", "sections": [{ "heading": "...", "content": "..." }] },
  "homepageStructure": ["Section: description"],
  "keywords": ["keyword"],
  "pinterestStrategy": [{ "title": "...", "hook": "...", "imageIdea": "...", "boardSuggestion": "..." }],
  "backlinkTargets": [{ "website": "...", "type": "guest-post", "approach": "..." }],
  "overallPriorityOrder": ["Task name"]
}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  // Run WebMCP roadmap in parallel if provided
  let webmcpData: Record<string, unknown> | null = null;
  if (roadmap2Json) {
    let roadmap2: { tasks?: RoadmapTask[] } | RoadmapTask[] = [];
    try { roadmap2 = JSON.parse(roadmap2Json) as typeof roadmap2; } catch { roadmap2 = []; }

    const tasks2: RoadmapTask[] = Array.isArray(roadmap2)
      ? (roadmap2 as RoadmapTask[])
      : ((roadmap2 as { tasks?: RoadmapTask[] }).tasks ?? []);

    const task2Summary = tasks2
      .map((t) => `Task ${t.id} [${t.category ?? ""}/${t.priority ?? ""}]: "${t.title ?? t.en?.title ?? ""}" — ${t.description ?? t.en?.desc ?? ""} | Steps: ${(t.steps ?? t.en?.steps ?? []).join(", ")}`)
      .join("\n");

    const webmcpPromise = openai.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "system",
          content: `You are an expert in WebMCP (Web Model Context Protocol) and AI agent integration. You build REAL, copy-paste-ready code: complete HTML tool definitions with toolname/tooldescription attributes, and full JavaScript implementations using navigator.modelContext.registerTool(). You tailor everything to the specific niche provided. Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: `Implement the WebMCP / AI Agent roadmap below for a "${niche}" blog called "${postTitle ? `with an example post: "${postTitle}"` : "Meat Lovers Hub"}".
${blogUrl ? `Blog URL: ${blogUrl}` : ""}

WEBMCP ROADMAP TASKS:
${task2Summary}

BUILD and IMPLEMENT the following — produce REAL working code, not pseudocode:

1. setupSteps: 6 step-by-step setup instructions for configuring WebMCP on this blog (Replit/WordPress compatible, specific commands)

2. declarativeTools: 3 HTML declarative tools using toolname + tooldescription attributes, tailored to "${niche}":
   - Recipe Finder (search by cut of meat, cooking method)
   - Weekly Meal Planner (carnivore diet)
   - Nutrition / Protein Calculator
   For each produce COMPLETE html with real form fields, toolname, tooldescription, aria labels

3. imperativeTools: 3 JavaScript tools using navigator.modelContext.registerTool():
   - "generateCarnivoreMealPlan" — takes days + preferences, returns full meal plan
   - "calculateProteinIntake" — takes weight + goal, returns daily protein targets
   - "findBestCutForMethod" — takes cooking method, returns best meat cuts with tips
   For each produce FULL working JS implementation with JSON Schema, async logic, and realistic return data

4. actiondataSeo: AI search engine optimization plan:
   - manifest: JSON-LD WebMCP manifest for the blog (real structured data)
   - recommendations: 6 specific recommendations for making this "${niche}" blog AI-discoverable

5. taskResults: For each WebMCP task, produce:
   - taskId, title, category, priority
   - gapAnalysis: what's missing in the current blog setup
   - before: current state (no AI tools, standard HTML)
   - after: the implemented state with code
   - implementations: 4 specific steps
   - impactScore: 0-100

Respond with JSON:
{
  "setupSteps": ["Step 1: ...", "Step 2: ..."],
  "declarativeTools": [
    { "name": "Recipe Finder", "description": "...", "code": "<complete html>", "usage": "Agent calls this by..." }
  ],
  "imperativeTools": [
    { "name": "generateCarnivoreMealPlan", "description": "...", "code": "// complete JS implementation", "usage": "Agent calls: navigator.modelContext.callTool('generateCarnivoreMealPlan', {...})" }
  ],
  "actiondataSeo": {
    "manifest": { "complete json-ld object": true },
    "recommendations": ["recommendation 1", "recommendation 2"]
  },
  "taskResults": [{ "taskId": 1, "title": "...", "category": "...", "priority": "...", "gapAnalysis": "...", "before": "...", "after": "...", "implementations": ["..."], "impactScore": 80 }]
}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    try {
      const webmcpCompletion = await webmcpPromise;
      const webmcpText = webmcpCompletion.choices[0]?.message?.content ?? "{}";
      webmcpData = parseJSON(webmcpText) as Record<string, unknown>;
    } catch (err) {
      req.log.warn({ err }, "WebMCP roadmap execution failed — continuing with SEO results");
    }
  }

  try {
    const seoCompletion = await seoPromise;
    const seoText = seoCompletion.choices[0]?.message?.content ?? "{}";
    const seoResult = parseJSON(seoText) as Record<string, unknown>;
    if (webmcpData) seoResult.webmcp = webmcpData;
    res.json(seoResult);
  } catch (err) {
    req.log.error({ err }, "Failed to execute SEO roadmap");
    res.status(500).json({ error: "Failed to execute roadmap" });
  }
});

router.post("/google-audit", async (req, res) => {
  const parsed = RunGoogleAuditBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { postTitle, postContent, niche, blogUrl } = parsed.data;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "system",
          content: `You are a world-class SEO auditor specialising in Google's Helpful Content System and Quality Updates (2024–2025). You analyse blog content against all 8 audit pillars with precision, honesty, and actionable specificity. You understand what Google's algorithms reward: genuine expertise, real human experience, original insight, fast pages, semantic structure, and strong E-E-A-T signals. Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: `Run a full Google December 2025 Helpful Content & Quality Update audit on this blog post.

Blog Niche: "${niche}"
Post Title: "${postTitle}"
${blogUrl ? `Blog URL: ${blogUrl}` : ""}
Post Content:
"""
${postContent.slice(0, 10000)}
"""

Audit the content across ALL 8 pillars below. For each pillar give specific, content-based findings — not generic advice. Reference exact issues from the content provided.

PILLAR 1 — Performance Gap Analysis (Search vs Discover)
- Does the intro hook emotionally within the first 2 sentences?
- Are the headlines scroll-stopping and curiosity-driven?
- Is there a clear visual and storytelling appeal for Google Discover?

PILLAR 2 — Authenticity & Information Gain
- Is the content original with unique insights or personal commentary?
- Does it avoid generic AI-sounding phrases and clichés?
- Does it add value beyond what a basic search result would show?

PILLAR 3 — Semantic Chunking Optimization
- Are sections clearly broken with H2/H3 headings?
- Are paragraphs short and scannable?
- Are bullet points and structured layout used appropriately?

PILLAR 4 — Core Web Vitals / INP Optimization
- Based on content structure, are there likely image optimization issues?
- Is there evidence of heavy scripts, layout shifts, or unoptimized embeds?
- Is mobile UX considered in the content structure?

PILLAR 5 — Citation Economy (E-E-A-T)
- Are there credible references or outbound links mentioned?
- Is author expertise demonstrated in the content?
- Are trust signals (stats, sources, experience) present?

PILLAR 6 — Content Perfection (AI + Human Style)
- Does the writing feel natural, conversational, and human?
- Is the tone consistent and appropriate for the niche?
- Are there awkward, robotic, or overly formal phrases?

PILLAR 7 — Engagement Boost
- Are interactive elements present? (FAQs, tips boxes, CTAs, Did-you-know)
- Does the content encourage reader action or comments?
- Is there a strong conclusion or call-to-action?

PILLAR 8 — Security & Manual Actions
- Based on content signals, are there any spammy practices visible?
- Is the content policy-compliant and free from manipulative patterns?
- Are there broken link indicators or thin content sections?

Also provide:
- Top 3 priorities (most impactful fixes)
- Google Discover readiness assessment (1-2 sentences)
- 10-15 high-opportunity SEO keywords for the "${niche}" niche (mix of head terms and long-tail)
- A fully rewritten intro paragraph (3-5 sentences) that is human, engaging, hooks the reader emotionally, and naturally includes the primary keyword
- 5 quick wins (under 15 minutes each, high-impact changes)

Score each pillar 0-100. Status: "good" (75+), "needs-work" (50-74), "critical" (<50).
Overall status: "passing" (avg 75+), "at-risk" (avg 50-74), "failing" (avg <50).

Respond with JSON:
{
  "overallScore": <weighted average 0-100>,
  "overallStatus": "passing | at-risk | failing",
  "pillars": [
    {
      "pillar": "Performance Gap Analysis",
      "score": <0-100>,
      "status": "good | needs-work | critical",
      "findings": ["specific finding from the content", "..."],
      "recommendations": ["specific fix", "..."]
    },
    { "pillar": "Authenticity & Information Gain", ... },
    { "pillar": "Semantic Chunking Optimization", ... },
    { "pillar": "Core Web Vitals / INP", ... },
    { "pillar": "Citation Economy (E-E-A-T)", ... },
    { "pillar": "Content Perfection", ... },
    { "pillar": "Engagement Boost", ... },
    { "pillar": "Security & Manual Actions", ... }
  ],
  "topPriorities": ["priority 1", "priority 2", "priority 3"],
  "discoverReadiness": "...",
  "suggestedKeywords": ["keyword1", "keyword2", ...],
  "rewrittenIntro": "...",
  "quickWins": ["win1", "win2", "win3", "win4", "win5"]
}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    res.json(parseJSON(text));
  } catch (err) {
    req.log.error({ err }, "Failed to run Google audit");
    res.status(500).json({ error: "Failed to run Google audit" });
  }
});

router.post("/content-refresh", async (req, res) => {
  const parsed = RefreshContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { postTitle, postContent, keywords, niche } = parsed.data;
  try {
    const kwList = keywords
      .map((k) => `- "${k.keyword}" → Position ${k.position}${k.clicks !== undefined ? `, ${k.clicks} clicks` : ""}${k.impressions !== undefined ? `, ${k.impressions} impressions` : ""}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are an expert SEO strategist specialising in content refresh and organic traffic growth. You apply the "low-hanging fruit" method with precision: identifying keywords in positions 5–15 that are closest to page 1, then injecting the best one naturally into the Title Tag, H1, and First Sentence (the "Three Kings"). Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: `Apply the low-hanging fruit content refresh technique to this blog post.

Blog Niche: "${niche}"
Current Post Title / H1: "${postTitle}"
${postContent ? `Current Opening Paragraph:\n"${postContent}"\n` : ""}
Keyword Rankings from Google Search Console:
${kwList}

TASK:
1. Identify all keywords in positions 5–15 (low-hanging fruit — one small push can reach page 1)
2. Rank them by opportunity score (0-100) considering: position closeness to top 5, impression volume, click potential, and relevance to the post title
3. Recommend the single best target keyword
4. Rewrite the Title Tag, H1, and First Sentence with the recommended keyword injected naturally — keep them human-sounding and compelling, not keyword-stuffed
5. Provide 4-5 additional refresh suggestions (meta description, internal links, image alt text, content freshness, schema, etc.)
6. Estimate the realistic traffic lift if these changes are implemented

For the refreshedFirstSentence: if a current opening paragraph was provided, rewrite it as a single powerful opening sentence. If not, create one that hooks the reader and includes the keyword.
For the refreshedH1: make it slightly different from the Title Tag (avoid duplicate tags).

Respond with JSON:
{
  "lowHangingFruit": [
    {
      "keyword": "...",
      "position": <number>,
      "clicks": <number or null>,
      "impressions": <number or null>,
      "opportunityScore": <0-100>,
      "reasoning": "Why this keyword has refresh potential (2 sentences)"
    }
  ],
  "recommendedKeyword": "...",
  "recommendedKeywordReason": "...",
  "refreshedTitle": "...",
  "refreshedH1": "...",
  "refreshedFirstSentence": "...",
  "additionalSuggestions": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "estimatedTrafficLift": "e.g. 25–40% increase in organic clicks within 4–8 weeks"
}

Only include keywords actually in positions 5–15 in lowHangingFruit. Sort by opportunityScore descending.`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    res.json(parseJSON(text));
  } catch (err) {
    req.log.error({ err }, "Failed to run content refresh");
    res.status(500).json({ error: "Failed to run content refresh" });
  }
});

router.post("/prompt-alchemist", async (req, res) => {
  const parsed = AlchemizePromptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { topic, niche, category, technique, inspireMode } = parsed.data;

  const ALL_CATEGORIES = [
    { category: "Contrarian & Disruptive", techniques: ["The Myth Buster", "The Hot Take", "The Plot Twist"] },
    { category: "Storytelling & Personal", techniques: ["The Origin Story", "The Failure Lesson", "The Transformation"] },
    { category: "Efficiency & Shortcuts", techniques: ["The Lazy Cook's Way", "The 30-Minute Hack", "The Cheat Code"] },
    { category: "Expert Authority", techniques: ["The Pitmaster's Verdict", "The Science Behind", "The Head-to-Head Test"] },
    { category: "Problem & Solution", techniques: ["The Fix", "The Rescue Guide", "The Beginner's Unlock"] },
    { category: "Seasonal & Occasion", techniques: ["The Holiday Special", "The Crowd-Pleaser", "The Weekend Project"] },
  ];

  let resolvedCategory = category;
  let resolvedTechnique = technique;

  if (inspireMode || !resolvedCategory || !resolvedTechnique) {
    const randCat = ALL_CATEGORIES[Math.floor(Math.random() * ALL_CATEGORIES.length)];
    resolvedCategory = randCat.category;
    resolvedTechnique = randCat.techniques[Math.floor(Math.random() * randCat.techniques.length)];
  }

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are a world-class content strategist and copywriter specialising in the ${niche} niche. You craft blog prompts that feel genuinely human — full of personality, storytelling instinct, and culinary expertise. Every prompt you produce is specific, vivid, and immediately actionable. Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: `Transform the following topic into 3 distinct, high-impact blog post prompts for the "${niche}" blog.

Topic / Keyword / Pain Point: "${topic}"
Strategic Category: "${resolvedCategory}"
Content Technique: "${resolvedTechnique}"

Technique definitions:
- The Myth Buster: Debunk a widely-held belief with evidence and personal experience
- The Hot Take: A bold, polarizing opinion that invites passionate debate
- The Plot Twist: Reveal a surprising truth hiding behind a classic technique
- The Origin Story: How you discovered, mastered, or completely changed your approach
- The Failure Lesson: A disaster, what went wrong, and the insight gained
- The Transformation: How one method or ingredient changed everything
- The Lazy Cook's Way: Restaurant-quality results with fewer steps and less fuss
- The 30-Minute Hack: Speed techniques that don't sacrifice quality
- The Cheat Code: Pro secrets adapted for the home cook
- The Pitmaster's Verdict: Insider knowledge presented as definitive guidance
- The Science Behind: Data-driven breakdown of why a technique works
- The Head-to-Head Test: Rigorous comparison of methods so readers don't have to
- The Fix: Solve a specific named failure point with a clear solution
- The Rescue Guide: How to save a cooking disaster mid-cook
- The Beginner's Unlock: Transform novices from intimidated to confident
- The Holiday Special: A cut or recipe engineered for a specific celebration
- The Crowd-Pleaser: Scaled feasts without chaos
- The Weekend Project: Immersive long cooks with dramatic payoff

REQUIREMENTS for each prompt:
1. Title must be specific, click-worthy, and SEO-friendly (include the main keyword naturally)
2. Angle must name the exact unique spin that makes this different from every other post on this topic
3. Hook must be 2-3 sentences — vivid, conversational, and immediately gripping (use "you", contractions, sensory detail)
4. Outline must have 5 section headings (H2 level) that tell a complete, logical story
5. whyItWorks must explain the psychological or content strategy reason this resonates with readers
6. Each of the 3 prompts must use a distinctly different angle on the same topic — no overlap

Also provide:
- topicInsight: a single sharp observation about what makes this topic powerful for blog content

Respond with JSON:
{
  "prompts": [
    {
      "title": "...",
      "angle": "...",
      "hook": "...",
      "outline": ["Section 1", "Section 2", "Section 3", "Section 4", "Section 5"],
      "whyItWorks": "..."
    }
  ],
  "techniqueUsed": "${resolvedTechnique}",
  "categoryUsed": "${resolvedCategory}",
  "topicInsight": "..."
}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    res.json(parseJSON(text));
  } catch (err) {
    req.log.error({ err }, "Failed to alchemize prompt");
    res.status(500).json({ error: "Failed to alchemize prompt" });
  }
});

router.post("/doc-to-blog/analyze", async (req, res) => {
  const parsed = AnalyzeDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { documentText, niche, targetAudience, tone } = parsed.data;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are an expert content strategist who transforms source documents into high-performing blog posts. Your analysis is thorough, practical, and focused on what will genuinely engage blog readers. Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: `Analyze the following document and produce a blog transformation strategy.

Document:
"""
${documentText.slice(0, 12000)}
"""

Niche/Blog Topic Area: "${niche}"
${targetAudience ? `Requested Target Audience: "${targetAudience}"` : ""}
${tone ? `Requested Tone: "${tone}"` : ""}

Respond with JSON matching this exact structure:
{
  "documentType": "e.g. research paper, news article, technical guide, how-to guide, opinion piece",
  "detectedLanguage": "e.g. English, Arabic, French",
  "mainTopic": "one clear sentence describing the main topic",
  "coreMessage": "the essential message or argument of the document in 2-3 sentences",
  "targetAudience": "who the original document seems written for",
  "keyPoints": [
    { "point": "key point description", "importance": "high | medium | low" }
  ],
  "technicalTerms": ["term1", "term2"],
  "originalTone": "e.g. academic, journalistic, technical, casual",
  "whatIsMissing": "what would make this more engaging for blog readers (2-3 sentences)",
  "recommendedBlogAudience": "specific, detailed description of the ideal blog reader",
  "recommendedHook": "a compelling opening hook, scenario, or angle to grab readers",
  "recommendedTone": "e.g. conversational and expert, storytelling, educational",
  "suggestedTitle": "an SEO-friendly, human-sounding blog post title",
  "suggestedSections": ["H2 section title 1", "H2 section title 2", "H2 section title 3", "H2 section title 4", "H2 section title 5"],
  "seoKeywords": ["primary keyword", "secondary keyword 1", "secondary keyword 2", "long-tail keyword"]
}

Extract at least 4 key points. Be specific and actionable in your recommendations.`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    res.json(parseJSON(text));
  } catch (err) {
    req.log.error({ err }, "Failed to analyze document");
    res.status(500).json({ error: "Failed to analyze document" });
  }
});

router.post("/doc-to-blog/generate", async (req, res) => {
  const parsed = GenerateDocBlogBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { documentText, analysis, niche, targetAudience, tone, specialFocus } = parsed.data;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "system",
          content: `You are a world-class human blogger and content writer. You write with genuine personality, warmth, and expertise. Your writing sounds 100% human — varied sentence lengths, natural transitions, personal observations, conversational asides, and relatable examples. You never write like an AI. Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: `Transform the following source document into a compelling, human-written blog post.

SOURCE DOCUMENT:
"""
${documentText.slice(0, 10000)}
"""

ANALYSIS & STRATEGY:
- Document type: ${JSON.stringify((analysis as Record<string, unknown>).documentType)}
- Main topic: ${JSON.stringify((analysis as Record<string, unknown>).mainTopic)}
- Core message: ${JSON.stringify((analysis as Record<string, unknown>).coreMessage)}
- Target audience: ${targetAudience || JSON.stringify((analysis as Record<string, unknown>).recommendedBlogAudience)}
- Recommended hook: ${JSON.stringify((analysis as Record<string, unknown>).recommendedHook)}
- Recommended tone: ${tone || JSON.stringify((analysis as Record<string, unknown>).recommendedTone)}
- Suggested title: ${JSON.stringify((analysis as Record<string, unknown>).suggestedTitle)}
- Suggested sections: ${JSON.stringify((analysis as Record<string, unknown>).suggestedSections)}
- SEO keywords to include naturally: ${JSON.stringify((analysis as Record<string, unknown>).seoKeywords)}
- Niche: "${niche}"
${specialFocus ? `- Special focus: "${specialFocus}"` : ""}

WRITING REQUIREMENTS — this is critical:
1. Open with the recommended hook — a story, surprising fact, or relatable scenario
2. Write in the detected language of the source document
3. Use personal pronouns (I, we, you) throughout
4. Include conversational phrases: "Here's the thing...", "Now, you might be wondering...", "Let's be honest..."
5. Vary sentence length dramatically — mix very short punchy sentences with longer flowing ones
6. Include rhetorical questions to engage readers
7. Add personal insights and observations between factual points
8. Use contractions naturally (don't, it's, you'll, we've)
9. Include a 3-5 point Key Takeaways summary near the top
10. Structure with proper HTML: <h1>, <h2>, <p>, <ul>/<li>, <strong>
11. Minimum 1000 words, ideally 1200-1500
12. End with a genuine call-to-action that encourages reader engagement
13. Preserve ALL factual information from the source document

Respond with JSON:
{
  "title": "Final SEO-optimized blog post title",
  "metaDescription": "150-160 character meta description (compelling, includes primary keyword)",
  "content": "Full blog post as HTML string (h1, h2, p, ul, li, strong tags — no markdown)",
  "wordCount": <number>,
  "seoScore": <number 0-100>,
  "humanScore": <number 0-100, how human the writing sounds>,
  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
  "readabilityTips": ["tip1", "tip2", "tip3"]
}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    res.json(parseJSON(text));
  } catch (err) {
    req.log.error({ err }, "Failed to generate blog post from document");
    res.status(500).json({ error: "Failed to generate blog post from document" });
  }
});

export default router;
