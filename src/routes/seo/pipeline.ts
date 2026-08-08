import { Router, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db, pipelineRunsTable, blogPostsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import type { StepState, StepStatus, PipelineContext, PipelineRun } from "@workspace/db";

const router = Router();
const MODEL = "gpt-4o";
const MAX_TOKENS = 8192;

// ── Helpers ──────────────────────────────────────────────────────────────────

function now() {
  return new Date().toISOString();
}

function logLine(msg: string) {
  return `[${new Date().toLocaleTimeString("en-US", { hour12: false })}] ${msg}`;
}

function objectToMarkdown(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value) return "";
  if (Array.isArray(value)) return (value as unknown[]).map((v, i) => `${i + 1}. ${String(v)}`).join("\n");
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => {
        const h = k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()).trim();
        const body = typeof v === "string" ? v : Array.isArray(v) ? (v as unknown[]).map(x => `- ${String(x)}`).join("\n") : objectToMarkdown(v);
        return `## ${h}\n\n${body}`;
      })
      .join("\n\n");
  }
  return String(value);
}

function parseJSON<T>(text: string): T {
  const match = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
  const raw = match ? (match[1] ?? match[0]) : text;
  return JSON.parse(raw.trim()) as T;
}

async function aiCall(messages: { role: "system" | "user"; content: string }[], maxTokens = 4096): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages,
    response_format: { type: "json_object" },
  });
  return completion.choices[0]?.message?.content ?? "{}";
}

// ── DB helpers ────────────────────────────────────────────────────────────────

async function getRunOrThrow(id: string): Promise<PipelineRun> {
  const [run] = await db.select().from(pipelineRunsTable).where(eq(pipelineRunsTable.id, id));
  if (!run) throw new Error(`Pipeline run ${id} not found`);
  return run;
}

async function updateRun(id: string, patch: Partial<typeof pipelineRunsTable.$inferInsert>) {
  await db.update(pipelineRunsTable).set({ ...patch, updatedAt: new Date() }).where(eq(pipelineRunsTable.id, id));
}

async function appendLog(id: string, msg: string, currentLogs: string[]) {
  const newLogs = [...currentLogs, logLine(msg)].slice(-200);
  await updateRun(id, { logs: newLogs });
  return newLogs;
}

async function setStepStatus(
  id: string,
  stepId: string,
  status: StepStatus,
  steps: StepState[],
  extra: Partial<StepState> = {}
): Promise<StepState[]> {
  const updated = steps.map(s =>
    s.id === stepId ? { ...s, status, ...extra } : s
  );
  await updateRun(id, { steps: updated });
  return updated;
}

// ── Pipeline step definitions ─────────────────────────────────────────────────

const STEP_LABELS: Record<string, string> = {
  "topical-authority": "Topical Authority",
  "reddit-miner": "Reddit Miner",
  "info-gain": "Information Gain",
  "blog-generate": "Blog Generator",
  "eeat-enhance": "E-E-A-T Enhancement",
  "image-seo": "Image SEO Helper",
  "quality-check": "Quality Check",
  "google-audit": "Google Audit",
};

// Phases: each inner array runs in parallel; phases run sequentially
const PHASE_ORDER: string[][] = [
  ["topical-authority", "reddit-miner"],
  ["info-gain", "blog-generate"],
  ["eeat-enhance"],
  ["image-seo", "quality-check", "google-audit"],
];

export const PRESETS: Record<string, string[]> = {
  "fast":       ["topical-authority", "blog-generate", "quality-check"],
  "full-seo":   ["topical-authority", "reddit-miner", "info-gain", "blog-generate", "eeat-enhance", "image-seo", "quality-check", "google-audit"],
  "pinterest":  ["reddit-miner", "blog-generate", "image-seo"],
  "authority":  ["topical-authority", "info-gain", "blog-generate", "eeat-enhance", "google-audit"],
};

// ── AI step functions ─────────────────────────────────────────────────────────

async function runTopicalAuthority(ctx: PipelineContext): Promise<Record<string, unknown>> {
  const text = await aiCall([
    { role: "system", content: "You are an SEO topical authority expert. Always respond with valid JSON." },
    { role: "user", content: `Analyze topical authority for: "${ctx.keyword}" in niche: "${ctx.niche}". Respond with JSON: {"pillarTopic":"...","clusterTopics":["..."],"outline":"Full H2/H3 markdown outline for the pillar article","internalLinks":[{"anchorText":"...","targetPost":"...","reason":"..."}],"missingClusterTopics":["..."]}` },
  ]);
  return parseJSON(text);
}

async function runRedditMiner(ctx: PipelineContext): Promise<Record<string, unknown>> {
  const syntheticInput = `Questions and discussions about "${ctx.keyword}" in the ${ctx.niche} niche: What is the best approach? Common mistakes people make. Beginner vs advanced techniques. Product/method comparisons. Pain points and frustrations. Success stories and tips.`;
  const text = await aiCall([
    { role: "system", content: "You are a Reddit SEO keyword mining expert. Always respond with valid JSON." },
    { role: "user", content: `Mine keyword opportunities for "${ctx.keyword}" in "${ctx.niche}" niche from this synthetic Reddit content:\n\n${syntheticInput}\n\nRespond with JSON: {"keywords":[{"keyword":"...","intent":"explicit|implicit|comparison|problem","volume":"high|medium|low","difficulty":"easy|medium|hard","blogTitle":"..."}],"contentIdeas":[{"title":"...","type":"blog-post|faq|vs-comparison|how-to|listicle","angle":"...","redditSignal":"..."}],"userPains":["..."],"vsKeywords":["..."],"faqQuestions":["..."],"summary":"..."}` },
  ]);
  return parseJSON(text);
}

async function runInfoGain(ctx: PipelineContext): Promise<Record<string, unknown>> {
  const outline = (ctx.topicalAuthority?.outline as string | undefined) ?? `Article about ${ctx.keyword}`;
  const text = await aiCall([
    { role: "system", content: "You are an information gain SEO analyst. Always respond with valid JSON." },
    { role: "user", content: `Analyze information gain for: "${ctx.keyword}" in "${ctx.niche}". Outline:\n${outline}\n\nRespond with JSON: {"coveredPoints":["..."],"missingPoints":["..."],"uniqueAngle":"...","competitorGaps":["..."],"gainScore":<0-100>}` },
  ]);
  return parseJSON(text);
}

async function generateImagePromptsForBlog(keyword: string, niche: string, title: string, outline: string): Promise<unknown[]> {
  const sections = outline
    .split("\n")
    .filter(l => l.startsWith("## ") || l.startsWith("### "))
    .map(l => l.replace(/^#{2,3}\s+/, "").trim())
    .slice(0, 8);
  const sectionList = sections.length > 0 ? sections.join(" | ") : "Introduction, Main Process, Final Result";
  try {
    const text = await aiCall([
      { role: "system", content: "You are a professional AI image prompt engineer specialising in editorial food and lifestyle photography. Always respond with valid JSON." },
      { role: "user", content: `Generate 6-7 production-ready AI image prompts for Midjourney, DALL·E, Flux, Ideogram, and Stable Diffusion.\n\nTitle: "${title}"\nTopic: "${keyword}"\nNiche: "${niche}"\nSections: ${sectionList}\n\nCover: hero, ingredient setup, process steps, final result, Pinterest pin.\nEach prompt must include camera angle, lens, lighting, depth of field, color palette, texture, background, composition, steam/smoke if relevant.\n\nRespond with JSON: {"imagePrompts":[{"id":"hero","title":"Hero Image","placement":"Above the introduction / featured image","aspectRatio":"16:9","style":"Ultra-realistic professional editorial photography","altText":"SEO alt text 100-125 chars","aiPrompt":"Full cinematic production-ready prompt with all technical specifications...","pinterestPin":"2:3 vertical Pinterest pin composition..."}]}` },
    ], 4096);
    const result = parseJSON<{ imagePrompts: unknown[] }>(text);
    return Array.isArray(result.imagePrompts) ? result.imagePrompts : [];
  } catch {
    return [];
  }
}

async function runBlogGenerate(ctx: PipelineContext): Promise<Record<string, unknown>> {
  const outline = (ctx.topicalAuthority?.outline as string | undefined) ?? "";
  const userPains = Array.isArray(ctx.redditMiner?.userPains) ? (ctx.redditMiner.userPains as string[]).slice(0, 3).join(", ") : "";
  const text = await aiCall([
    { role: "system", content: "You are an expert SEO content strategist and writer. Always respond with valid JSON." },
    { role: "user", content: `Generate a comprehensive SEO-optimized blog post.\nTopic: "${ctx.keyword}"\nNiche: "${ctx.niche}"${outline ? `\nUse this outline:\n${outline}` : ""}${userPains ? `\nAddress these reader pains: ${userPains}` : ""}\n\nRespond with JSON: {"title":"SEO title 50-60 chars","outline":"Full H2/H3 outline in markdown","content":"Full article in markdown (minimum 1500 words, include intro, body sections, conclusion)","seoScore":<0-100>,"wordCount":<number>,"readabilityTips":["..."]}` },
  ], MAX_TOKENS);
  const result = parseJSON<Record<string, unknown>>(text);
  if (typeof result.content !== "string") result.content = objectToMarkdown(result.content);
  if (typeof result.outline !== "string") result.outline = objectToMarkdown(result.outline);
  // Generate AI image prompts and store them in the pipeline context
  result.imagePrompts = await generateImagePromptsForBlog(
    ctx.keyword, ctx.niche,
    String(result.title ?? ctx.keyword),
    String(result.outline ?? "")
  );
  return result;
}

async function runEEATEnhance(ctx: PipelineContext): Promise<Record<string, unknown>> {
  const content = (ctx.blogPost?.content as string | undefined) ?? "";
  const text = await aiCall([
    { role: "system", content: "You are an E-E-A-T SEO specialist. Always respond with valid JSON." },
    { role: "user", content: `Enhance for E-E-A-T in "${ctx.niche}" niche. Author: "Expert practitioner with hands-on experience".\n\nContent:\n${content.slice(0, 6000)}\n\nRespond with JSON: {"enhancedContent":"Full rewritten content with E-E-A-T improvements","changesApplied":["..."],"eeatScore":<0-100>}` },
  ], MAX_TOKENS);
  const result = parseJSON<Record<string, unknown>>(text);
  if (typeof result.enhancedContent !== "string") result.enhancedContent = objectToMarkdown(result.enhancedContent);
  return result;
}

async function runImageSeo(ctx: PipelineContext): Promise<Record<string, unknown>> {
  const content = (ctx.eeatEnhanced?.enhancedContent ?? ctx.blogPost?.content ?? "") as string;
  const title = (ctx.blogPost?.title as string | undefined) ?? ctx.keyword;
  const text = await aiCall([
    { role: "system", content: "You are an image SEO specialist. Always respond with valid JSON." },
    { role: "user", content: `Generate alt text options for the featured image of this article.\nTitle: "${title}"\nNiche: "${ctx.niche}"\nContent excerpt: ${content.slice(0, 500)}\n\nRespond with JSON: {"suggestions":[{"altText":"...","characterCount":<number>,"seoNotes":"..."}],"featuredImageConcept":"Description of ideal featured image"}` },
  ]);
  return parseJSON(text);
}

async function runQualityCheck(ctx: PipelineContext): Promise<Record<string, unknown>> {
  const content = (ctx.eeatEnhanced?.enhancedContent ?? ctx.blogPost?.content ?? "") as string;
  const text = await aiCall([
    { role: "system", content: "You are a content quality checker. Always respond with valid JSON." },
    { role: "user", content: `Quality check this content:\n\n${content.slice(0, 6000)}\n\nRespond with JSON: {"facts":[{"fact":"...","verifiable":true,"category":"statistic|quote|claim|date"}],"flaggedClaims":[{"claim":"...","reason":"...","severity":"low|medium|high"}],"overallRisk":"low|medium|high","readabilityScore":<0-100>}` },
  ]);
  return parseJSON(text);
}

async function runGoogleAudit(ctx: PipelineContext): Promise<Record<string, unknown>> {
  const content = (ctx.eeatEnhanced?.enhancedContent ?? ctx.blogPost?.content ?? "") as string;
  const title = (ctx.blogPost?.title as string | undefined) ?? ctx.keyword;
  const text = await aiCall([
    { role: "system", content: "You are a Google Helpful Content auditor. Always respond with valid JSON." },
    { role: "user", content: `Run a Google Helpful Content audit.\nNiche: "${ctx.niche}"\nTitle: "${title}"\nContent:\n${content.slice(0, 6000)}\n\nRespond with JSON: {"overallScore":<0-100>,"pillars":[{"name":"...","score":<0-100>,"findings":["..."],"improvements":["..."]}],"priorityActions":["..."],"estimatedTrafficImpact":"low|medium|high"}` },
  ]);
  return parseJSON(text);
}

const STEP_FNS: Record<string, (ctx: PipelineContext) => Promise<Record<string, unknown>>> = {
  "topical-authority": runTopicalAuthority,
  "reddit-miner": runRedditMiner,
  "info-gain": runInfoGain,
  "blog-generate": runBlogGenerate,
  "eeat-enhance": runEEATEnhance,
  "image-seo": runImageSeo,
  "quality-check": runQualityCheck,
  "google-audit": runGoogleAudit,
};

function applyOutputToContext(stepId: string, output: Record<string, unknown>, ctx: PipelineContext): PipelineContext {
  const updated = { ...ctx };
  if (stepId === "topical-authority") updated.topicalAuthority = output;
  else if (stepId === "reddit-miner") updated.redditMiner = output;
  else if (stepId === "info-gain") updated.infoGain = output;
  else if (stepId === "blog-generate") updated.blogPost = output;
  else if (stepId === "eeat-enhance") updated.eeatEnhanced = output;
  else if (stepId === "image-seo") updated.imageSeo = output;
  else if (stepId === "quality-check") updated.qualityCheck = output;
  else if (stepId === "google-audit") updated.googleAudit = output;
  return updated;
}

// ── Pipeline executor ─────────────────────────────────────────────────────────

async function executePipeline(runId: string, fromStep?: string): Promise<void> {
  let run = await getRunOrThrow(runId);
  let steps = run.steps as StepState[];
  let ctx = run.context as PipelineContext;
  let logs = run.logs;

  await updateRun(runId, { status: "running" });
  logs = await appendLog(runId, `Pipeline started: ${ctx.keyword} / ${ctx.niche}`, logs);

  const enabledSteps = run.enabledSteps;
  let resumeFrom = fromStep ?? null;
  let hitResume = resumeFrom === null;

  for (const phase of PHASE_ORDER) {
    const phaseSteps = phase.filter(sid => enabledSteps.includes(sid));
    if (phaseSteps.length === 0) continue;

    if (!hitResume && fromStep) {
      if (phaseSteps.includes(fromStep)) {
        hitResume = true;
        // Reset this step and later ones to pending
        steps = steps.map(s =>
          phaseSteps.includes(s.id) || PHASE_ORDER.flat().indexOf(s.id) > PHASE_ORDER.flat().indexOf(fromStep)
            ? { ...s, status: "pending" as StepStatus }
            : s
        );
        await updateRun(runId, { steps });
      } else {
        continue;
      }
    }

    // Check for pause before each phase
    const freshRun = await getRunOrThrow(runId);
    if (freshRun.status === "paused") {
      logs = await appendLog(runId, "Pipeline paused.", logs);
      return;
    }
    if (freshRun.status === "failed") return;

    logs = await appendLog(runId, `Phase: [${phaseSteps.map(s => STEP_LABELS[s]).join(", ")}]`, logs);

    // Run phase steps in parallel
    const phaseResults = await Promise.allSettled(
      phaseSteps.map(async (stepId) => {
        const startedAt = now();
        steps = await setStepStatus(runId, stepId, "running", steps, { startedAt });
        logs = await appendLog(runId, `▶ ${STEP_LABELS[stepId]}...`, logs);

        try {
          const fn = STEP_FNS[stepId];
          if (!fn) throw new Error(`No handler for step: ${stepId}`);
          const output = await fn(ctx);
          const finishedAt = now();
          const durationMs = Date.parse(finishedAt) - Date.parse(startedAt);
          steps = await setStepStatus(runId, stepId, "done", steps, { output, finishedAt, durationMs });
          logs = await appendLog(runId, `✓ ${STEP_LABELS[stepId]} done (${(durationMs / 1000).toFixed(1)}s)`, logs);
          return { stepId, output };
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          const finishedAt = now();
          const durationMs = Date.parse(finishedAt) - Date.parse(startedAt);
          steps = await setStepStatus(runId, stepId, "failed", steps, { error: errorMsg, finishedAt, durationMs });
          logs = await appendLog(runId, `✗ ${STEP_LABELS[stepId]} failed: ${errorMsg}`, logs);
          throw err;
        }
      })
    );

    // Apply all successful outputs to context
    let phaseFailed = false;
    for (const result of phaseResults) {
      if (result.status === "fulfilled") {
        ctx = applyOutputToContext(result.value.stepId, result.value.output, ctx);
      } else {
        phaseFailed = true;
      }
    }
    await updateRun(runId, { context: ctx });

    if (phaseFailed) {
      logs = await appendLog(runId, "Pipeline halted due to step failure.", logs);
      await updateRun(runId, { status: "failed" });
      return;
    }
  }

  // Mark skipped steps
  const finalSteps = steps.map(s =>
    s.status === "pending" ? { ...s, status: "skipped" as StepStatus } : s
  );
  await updateRun(runId, { steps: finalSteps, status: "done" });
  logs = await appendLog(runId, "Pipeline complete!", logs);
}

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/seo/pipeline — create and start a run
router.post("/pipeline", async (req: Request, res: Response) => {
  const { keyword, niche, preset = "full-seo", enabledSteps: customSteps } = req.body as {
    keyword: string;
    niche: string;
    preset?: string;
    enabledSteps?: string[];
  };

  if (!keyword?.trim() || !niche?.trim()) {
    res.status(400).json({ error: "keyword and niche are required" });
    return;
  }

  const presetSteps = PRESETS[preset] ?? PRESETS["full-seo"]!;
  const enabledSteps: string[] = customSteps ?? presetSteps;

  // Build initial steps array in execution order
  const orderedStepIds = PHASE_ORDER.flat().filter(sid => enabledSteps.includes(sid));
  const steps: StepState[] = orderedStepIds.map(id => ({
    id,
    label: STEP_LABELS[id] ?? id,
    status: "pending",
  }));

  const context: PipelineContext = { keyword: keyword.trim(), niche: niche.trim() };

  try {
    const [run] = await db
      .insert(pipelineRunsTable)
      .values({ keyword: keyword.trim(), niche: niche.trim(), preset, enabledSteps, steps, context })
      .returning();

    res.status(201).json({ id: run!.id });

    // Fire-and-forget execution
    void executePipeline(run!.id).catch((err: unknown) => {
      console.error("Pipeline execution error:", err);
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create pipeline run");
    res.status(500).json({ error: "Failed to start pipeline" });
  }
});

// GET /api/seo/pipeline — list recent runs
router.get("/pipeline", async (req: Request, res: Response) => {
  try {
    const runs = await db
      .select({
        id: pipelineRunsTable.id,
        keyword: pipelineRunsTable.keyword,
        niche: pipelineRunsTable.niche,
        preset: pipelineRunsTable.preset,
        status: pipelineRunsTable.status,
        enabledSteps: pipelineRunsTable.enabledSteps,
        stepsCount: pipelineRunsTable.steps,
        createdAt: pipelineRunsTable.createdAt,
        updatedAt: pipelineRunsTable.updatedAt,
      })
      .from(pipelineRunsTable)
      .orderBy(desc(pipelineRunsTable.createdAt))
      .limit(20);
    res.json(runs);
  } catch (err) {
    req.log.error({ err }, "Failed to list pipelines");
    res.status(500).json({ error: "Failed to list pipelines" });
  }
});

// GET /api/seo/pipeline/:id — get full run state (for polling)
router.get("/pipeline/:id", async (req: Request, res: Response) => {
  try {
    const run = await getRunOrThrow(String(req.params["id"]));
    res.json(run);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

// POST /api/seo/pipeline/:id/pause
router.post("/pipeline/:id/pause", async (req: Request, res: Response) => {
  try {
    await updateRun(String(req.params["id"]), { status: "paused" });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

// POST /api/seo/pipeline/:id/resume
router.post("/pipeline/:id/resume", async (req: Request, res: Response) => {
  try {
    const run = await getRunOrThrow(String(req.params["id"]));
    if (run.status !== "paused") {
      res.status(400).json({ error: "Run is not paused" });
      return;
    }
    const firstPending = (run.steps as StepState[]).find(s => s.status === "pending");
    if (!firstPending) {
      res.status(400).json({ error: "No pending steps to resume" });
      return;
    }
    res.json({ ok: true });
    void executePipeline(run.id, firstPending.id).catch((err: unknown) => {
      console.error("Pipeline resume error:", err);
    });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

// POST /api/seo/pipeline/:id/retry — retry from first failed step
router.post("/pipeline/:id/retry", async (req: Request, res: Response) => {
  try {
    const run = await getRunOrThrow(String(req.params["id"]));
    const failedStep = (run.steps as StepState[]).find(s => s.status === "failed");
    if (!failedStep) {
      res.status(400).json({ error: "No failed step found" });
      return;
    }
    res.json({ ok: true, retryingFrom: failedStep.id });
    void executePipeline(run.id, failedStep.id).catch((err: unknown) => {
      console.error("Pipeline retry error:", err);
    });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

// POST /api/seo/pipeline/:id/save — save finished blog post to posts table
router.post("/pipeline/:id/save", async (req: Request, res: Response) => {
  try {
    const run = await getRunOrThrow(String(req.params["id"]));
    const ctx = run.context as PipelineContext;
    const blogPost = ctx.blogPost as Record<string, unknown> | undefined;
    const enhanced = ctx.eeatEnhanced as Record<string, unknown> | undefined;

    if (!blogPost) {
      res.status(400).json({ error: "No blog post generated yet" });
      return;
    }

    const content = (enhanced?.enhancedContent ?? blogPost.content ?? "") as string;
    const title = (blogPost.title ?? run.keyword) as string;
    const outline = (blogPost.outline ?? "") as string;
    const seoScore = String(blogPost.seoScore ?? 80);
    const wordCount = Number(blogPost.wordCount ?? 0);

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 6)
      .join("-");

    const [post] = await db
      .insert(blogPostsTable)
      .values({ topic: run.keyword, niche: run.niche, title, slug, outline, content, seoScore, wordCount })
      .returning();

    await updateRun(run.id, { savedPostId: post!.id });
    res.status(201).json({ postId: post!.id, slug: post!.slug });
  } catch (err) {
    req.log.error({ err }, "Failed to save pipeline post");
    res.status(500).json({ error: "Failed to save" });
  }
});

// DELETE /api/seo/pipeline/:id
router.delete("/pipeline/:id", async (req: Request, res: Response) => {
  try {
    await db.delete(pipelineRunsTable).where(eq(pipelineRunsTable.id, String(req.params["id"])));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete pipeline run");
    res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
export { STEP_LABELS };
