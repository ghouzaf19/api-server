import { useState } from "react";
import { useExecuteRoadmap } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map, Loader2, ChevronDown, ChevronUp, Copy, Check,
  ArrowRight, ArrowLeft, Sparkles, TrendingUp, Link2,
  Image as ImageIcon, Zap, FileText, RefreshCw, Star,
  CheckCircle2, AlertCircle, Globe, Code2, Terminal,
  Cpu, Settings, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ─── types ─── */
type TaskResult = {
  taskId: number; title: string; category: string; priority: string;
  gapAnalysis: string; before: string; after: string;
  implementations: string[]; impactScore: number;
};
type PinterestPin = { title: string; hook: string; imageIdea: string; boardSuggestion: string };
type BacklinkTarget = { website: string; type: string; approach: string };
type PostSection = { heading: string; content: string };
type OptimizedPost = { title?: string; intro?: string; sections?: PostSection[]; metaDescription?: string };
type WebMCPTool = { name: string; description: string; code: string; usage: string };
type WebMCPResult = {
  setupSteps: string[];
  declarativeTools: WebMCPTool[];
  imperativeTools: WebMCPTool[];
  actiondataSeo: { manifest?: unknown; recommendations?: string[] };
  taskResults: TaskResult[];
};
type ExecResult = {
  taskResults: TaskResult[];
  optimizedPost: OptimizedPost;
  homepageStructure: string[];
  keywords: string[];
  pinterestStrategy: PinterestPin[];
  backlinkTargets: BacklinkTarget[];
  overallPriorityOrder: string[];
  webmcp?: WebMCPResult;
};

/* ─── default JSONs ─── */
const DEFAULT_SEO_ROADMAP = `{
  "app": "SEO Multi Roadmap 2025",
  "tasks": [
    { "id": 1, "category": "Content", "priority": "Critical", "en": { "title": "Information Gain Implementation", "desc": "Integrate unique data points not present in existing results.", "steps": ["Run original tests", "Include verified credentials", "Avoid generic summaries"] } },
    { "id": 2, "category": "Off-Site", "priority": "Critical", "en": { "title": "Backlink Growth Parallelism", "desc": "Match publishing velocity with domain acquisition.", "steps": ["Link acquisition first", "Niche-relevant targets", "Daily profile monitoring"] } },
    { "id": 3, "category": "AI Search", "priority": "High", "en": { "title": "Semantic Chunking (300-500 Tokens)", "desc": "Structure content for LLM synthesis.", "steps": ["H2/H3 logic", "Self-contained 300-word blocks", "Remove semantic fluff"] } },
    { "id": 4, "category": "AI Search", "priority": "High", "en": { "title": "Google Discover Feed Strategy", "desc": "Optimize for passive recommendation feeds.", "steps": ["1200px+ High-res images", "Curiosity headlines", "Recency focus"] } },
    { "id": 5, "category": "Technical", "priority": "Medium", "en": { "title": "INP Performance (<200ms)", "desc": "Interaction to Next Paint is the critical 2025 metric.", "steps": ["Reduce main-thread blocking", "Optimize JS interaction", "Feedback loop checks"] } }
  ]
}`;

const DEFAULT_WEBMCP_ROADMAP = `[
  { "id": 1, "category": "setup", "priority": "Critical", "title": "Initialize WebMCP Environment", "description": "Configure the browser and local bridge to enable the Actionable Layer.", "steps": ["Download Chrome Canary (v134+).", "Enable '#enable-webmcp' in chrome://flags.", "Install the Localhost Bridge via npx: 'npx @google/webmcp-bridge'."] },
  { "id": 2, "category": "api", "priority": "High", "title": "Implement Declarative Tool API", "description": "Map existing HTML forms to AI-callable tools using specialized attributes.", "steps": ["Add 'toolname' to form tags.", "Add 'tooldescription' to explain intent.", "Validate schema generation."] },
  { "id": 3, "category": "api", "priority": "Critical", "title": "Register Imperative JS Tools", "description": "Expose complex logic via navigator.modelContext.registerTool().", "steps": ["Define async functions.", "Create JSON Schema.", "Register with modelContext."] },
  { "id": 4, "category": "enterprise", "priority": "High", "title": "Secure Data with Model Armor", "description": "Implement real-time screening for prompt injection and PII leakage.", "steps": ["Setup GCP Project.", "Define security templates.", "Configure injection filters."] },
  { "id": 8, "category": "analysis", "priority": "Low", "title": "Actiondata SEO", "description": "Prepare site for Actionable Discoverability in AI search engines.", "steps": ["Manifest check.", "Contract optimization.", "Tool discoverability audit."] }
]`;

/* ─── constants ─── */
const PRIORITY_COLOR: Record<string, string> = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-green-100 text-green-700 border-green-200",
};

/* ─── helpers ─── */
function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
      {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

function ImpactBar({ score }: { score: number }) {
  const color = score >= 75 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.7, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)} />
      </div>
      <span className="text-xs font-semibold tabular-nums w-7 text-right text-muted-foreground">{score}</span>
    </div>
  );
}

function CodeBlock({ code, lang = "html" }: { code: string; lang?: string }) {
  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyBtn text={code} label="Copy code" />
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-t-lg border-b border-zinc-700">
        <span className="text-xs text-zinc-400 font-mono">{lang}</span>
      </div>
      <pre className="bg-zinc-900 rounded-b-lg overflow-x-auto p-4 text-xs text-zinc-100 leading-relaxed font-mono whitespace-pre-wrap break-words">
        {code}
      </pre>
    </div>
  );
}

function TaskCard({ task, index }: { task: TaskResult; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className={cn("overflow-hidden border-2 transition-all", open ? "border-primary/25 shadow-sm" : "border-border hover:border-muted-foreground/20")}>
        <button className="w-full text-left" onClick={() => setOpen(!open)}>
          <div className="flex items-center gap-3 p-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">{task.taskId}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-sm truncate">{task.title}</span>
                <Badge variant="outline" className={cn("text-[10px] shrink-0", PRIORITY_COLOR[task.priority] ?? "")}>{task.priority}</Badge>
                <Badge variant="secondary" className="text-[10px] shrink-0">{task.category}</Badge>
              </div>
              <ImpactBar score={task.impactScore} />
            </div>
            {open ? <ChevronUp size={15} className="text-muted-foreground shrink-0" /> : <ChevronDown size={15} className="text-muted-foreground shrink-0" />}
          </div>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
              <div className="border-t px-4 pb-5 pt-4 space-y-4">
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                  <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700 mb-0.5">Gap Analysis</p>
                    <p className="text-xs text-amber-800 leading-relaxed">{task.gapAnalysis}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><ArrowLeft size={11} className="text-red-400" /> Before</p>
                      <CopyBtn text={task.before} />
                    </div>
                    <div className="rounded-lg border border-red-100 bg-red-50/40 px-3 py-2.5 text-xs text-muted-foreground leading-relaxed min-h-[80px]">{task.before}</div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><ArrowRight size={11} className="text-green-500" /> After</p>
                      <CopyBtn text={task.after} />
                    </div>
                    <div className="rounded-lg border border-green-200 bg-green-50/40 px-3 py-2.5 text-xs text-foreground leading-relaxed min-h-[80px] font-medium">{task.after}</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 size={11} className="text-primary" /> Implementation Steps</p>
                  <ul className="space-y-1.5">
                    {task.implementations.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function WebMCPToolCard({ tool, index, lang }: { tool: WebMCPTool; index: number; lang: "html" | "javascript" }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
      <Card className={cn("overflow-hidden border-2 transition-all", open ? "border-violet-300 shadow-sm" : "border-border")}>
        <button className="w-full text-left" onClick={() => setOpen(!open)}>
          <div className="flex items-center gap-3 p-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-700 shrink-0">
              {lang === "html" ? <Code2 size={14} /> : <Terminal size={14} />}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm font-mono">{tool.name}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{tool.description}</p>
            </div>
            <Badge variant="secondary" className={cn("text-[10px] shrink-0", lang === "html" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700")}>
              {lang.toUpperCase()}
            </Badge>
            {open ? <ChevronUp size={15} className="text-muted-foreground shrink-0" /> : <ChevronDown size={15} className="text-muted-foreground shrink-0" />}
          </div>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
              <div className="border-t space-y-4 p-4">
                <div className="bg-violet-50 border border-violet-200 rounded-lg px-3 py-2.5">
                  <p className="text-xs font-semibold text-violet-700 mb-0.5 flex items-center gap-1.5"><Cpu size={11} /> Agent Usage</p>
                  <p className="text-xs text-violet-800 font-mono leading-relaxed">{tool.usage}</p>
                </div>
                <CodeBlock code={tool.code} lang={lang} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

/* ─── main ─── */
export default function RoadmapExecutor() {
  const { toast } = useToast();
  const mutation = useExecuteRoadmap();

  const [roadmapJson, setRoadmapJson] = useState(DEFAULT_SEO_ROADMAP);
  const [roadmap2Json, setRoadmap2Json] = useState(DEFAULT_WEBMCP_ROADMAP);
  const [enableWebmcp, setEnableWebmcp] = useState(true);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [niche, setNiche] = useState("Meat recipes / Carnivore diet");
  const [blogUrl, setBlogUrl] = useState("");
  const [result, setResult] = useState<ExecResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>("tasks");

  const handleRun = () => {
    if (!postTitle.trim() || !postContent.trim()) {
      toast({ title: "Post title and content required", description: "Paste a blog post to use as the example for real implementations.", variant: "destructive" });
      return;
    }
    try { JSON.parse(roadmapJson); } catch {
      toast({ title: "Invalid SEO roadmap JSON", variant: "destructive" }); return;
    }
    if (enableWebmcp && roadmap2Json.trim()) {
      try { JSON.parse(roadmap2Json); } catch {
        toast({ title: "Invalid WebMCP roadmap JSON", variant: "destructive" }); return;
      }
    }

    mutation.mutate(
      { data: { roadmapJson, roadmap2Json: enableWebmcp && roadmap2Json.trim() ? roadmap2Json : undefined, postTitle, postContent, niche, blogUrl: blogUrl || undefined } },
      {
        onSuccess: (data) => {
          const r = data as ExecResult;
          setResult(r);
          setActiveTab("tasks");
          toast({ title: "Roadmap executed!", description: r.webmcp ? "SEO + WebMCP strategies applied with real code." : `${r.taskResults.length} SEO strategies applied.` });
        },
        onError: () => toast({ title: "Execution failed", description: "Something went wrong. Try again.", variant: "destructive" }),
      }
    );
  };

  const reset = () => { setResult(null); setActiveTab("tasks"); };

  const seoTabs = [
    { key: "tasks", label: "SEO Tasks", icon: Map },
    { key: "post", label: "Optimized Post", icon: FileText },
    { key: "homepage", label: "Homepage", icon: Globe },
    { key: "keywords", label: "Keywords", icon: TrendingUp },
    { key: "pinterest", label: "Pinterest", icon: ImageIcon },
    { key: "backlinks", label: "Backlinks", icon: Link2 },
  ];

  const webmcpTabs = result?.webmcp ? [
    { key: "wm-setup", label: "Setup", icon: Settings },
    { key: "wm-html", label: "HTML Tools", icon: Code2 },
    { key: "wm-js", label: "JS Tools", icon: Terminal },
    { key: "wm-tasks", label: "Agent Tasks", icon: Cpu },
    { key: "wm-seo", label: "Actiondata SEO", icon: Sparkles },
  ] : [];

  const allTabs = [...seoTabs, ...webmcpTabs];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Map className="text-primary" /> Dual Roadmap Executor
          </h1>
          <p className="text-muted-foreground mt-1">
            Execute your <span className="font-medium text-foreground">SEO roadmap</span> and <span className="font-medium text-foreground">WebMCP/AI Agent roadmap</span> together — real implementations, before/after rewrites, and working code.
          </p>
        </div>
        {result && (
          <Button variant="outline" size="sm" onClick={reset} className="shrink-0">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> New Execution
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">

            {/* Part 1 */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                  <CardTitle className="text-base">Part 1 — SEO Roadmap JSON</CardTitle>
                </div>
                <CardDescription>Information Gain, Backlink Growth, Semantic Chunking, Google Discover, INP Performance.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea className="font-mono text-xs min-h-[160px] resize-y leading-relaxed" value={roadmapJson}
                  onChange={(e) => setRoadmapJson(e.target.value)} />
              </CardContent>
            </Card>

            {/* Part 2 */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold">2</span>
                    <CardTitle className="text-base">Part 2 — WebMCP / AI Agent Roadmap JSON</CardTitle>
                  </div>
                  <button onClick={() => setEnableWebmcp(!enableWebmcp)}
                    className={cn("text-xs font-medium px-2.5 py-1 rounded-full border transition-colors", enableWebmcp ? "bg-violet-100 text-violet-700 border-violet-200" : "bg-muted text-muted-foreground border-border")}>
                    {enableWebmcp ? "Enabled" : "Disabled"}
                  </button>
                </div>
                <CardDescription>Declarative HTML tools, JavaScript navigator.modelContext tools, Actiondata SEO.</CardDescription>
              </CardHeader>
              {enableWebmcp && (
                <CardContent className="pt-4">
                  <Textarea className="font-mono text-xs min-h-[160px] resize-y leading-relaxed" value={roadmap2Json}
                    onChange={(e) => setRoadmap2Json(e.target.value)} />
                </CardContent>
              )}
            </Card>

            {/* Blog post */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2"><FileText size={15} className="text-primary" /> Your Blog Post (Example for Implementations)</CardTitle>
                <CardDescription>The AI analyzes this post and applies every strategy — showing real before/after changes and working code.</CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Post Title <span className="text-destructive">*</span></Label>
                    <Input placeholder="e.g. How to Cook the Perfect Ribeye Steak" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Blog Niche</Label>
                    <Input value={niche} onChange={(e) => setNiche(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Blog URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input type="url" placeholder="https://meatlovershub.com/posts/ribeye-steak" value={blogUrl} onChange={(e) => setBlogUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Post Content <span className="text-destructive">*</span></Label>
                  <Textarea placeholder="Paste your full blog post content here — the AI will find gaps and apply every roadmap strategy to it with real text rewrites…" className="min-h-[200px] resize-y text-sm leading-relaxed"
                    value={postContent} onChange={(e) => setPostContent(e.target.value)} />
                  <p className="text-xs text-muted-foreground">{postContent.length.toLocaleString()} chars · ~{Math.round(postContent.split(/\s+/).filter(Boolean).length)} words</p>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full h-12 text-base gap-2" onClick={handleRun} disabled={mutation.isPending}>
              {mutation.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Running both roadmaps in parallel — this takes ~30-60s…</>
                : <><Zap className="h-4 w-4" /> Execute Both Roadmaps &amp; Generate All Implementations</>}
            </Button>

            {mutation.isPending && (
              <div className="flex gap-3">
                <div className="flex-1 rounded-lg border bg-primary/5 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1.5"><Map size={12} /> SEO Roadmap</div>
                  <p className="text-xs text-muted-foreground">Analyzing content · Applying 5 strategies · Writing before/after</p>
                </div>
                <div className="flex-1 rounded-lg border bg-violet-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 mb-1.5"><Cpu size={12} /> WebMCP Roadmap</div>
                  <p className="text-xs text-muted-foreground">Generating HTML tools · Writing JS implementations · Building manifest</p>
                </div>
              </div>
            )}
          </motion.div>
        ) : (

          /* ─── Results ─── */
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Summary banner */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-3 pb-3">
                  <p className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1.5"><Map size={12} /> SEO Priority Order</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.overallPriorityOrder.map((item, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs">
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">{i + 1}</span>
                        <span className="text-foreground font-medium">{item}</span>
                        {i < result.overallPriorityOrder.length - 1 && <ArrowRight size={10} className="text-muted-foreground/40" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {result.webmcp && (
                <Card className="border-violet-200 bg-violet-50">
                  <CardContent className="pt-3 pb-3">
                    <p className="text-xs font-semibold text-violet-700 mb-1.5 flex items-center gap-1.5"><Cpu size={12} /> WebMCP Ready</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge className="text-[10px] bg-blue-100 text-blue-700 border-blue-200">{result.webmcp.declarativeTools.length} HTML Tools</Badge>
                      <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200">{result.webmcp.imperativeTools.length} JS Tools</Badge>
                      <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200">{result.webmcp.setupSteps.length} Setup Steps</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tabs */}
            <div>
              {/* SEO tabs row */}
              <div className="flex gap-0.5 flex-wrap border-b-0 mb-0">
                <div className="text-[10px] font-bold text-primary uppercase tracking-wider px-2 pt-2 self-end">SEO</div>
                {seoTabs.map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={cn("flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors -mb-px",
                      activeTab === key ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground")}>
                    <Icon size={13} />{label}
                  </button>
                ))}
              </div>
              {result.webmcp && (
                <div className="flex gap-0.5 flex-wrap border-b border-t border-t-transparent">
                  <div className="text-[10px] font-bold text-violet-600 uppercase tracking-wider px-2 pt-1 self-end">WebMCP</div>
                  {webmcpTabs.map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                      className={cn("flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors -mb-px",
                        activeTab === key ? "border-violet-500 text-violet-700 bg-violet-50" : "border-transparent text-muted-foreground hover:text-foreground")}>
                      <Icon size={13} />{label}
                    </button>
                  ))}
                </div>
              )}
              {!result.webmcp && <div className="border-b" />}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">

              {activeTab === "tasks" && (
                <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {result.taskResults.map((task, i) => <TaskCard key={task.taskId} task={task} index={i} />)}
                </motion.div>
              )}

              {activeTab === "post" && (
                <motion.div key="post" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card>
                    <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Fully Optimized Blog Post</CardTitle>
                        <CardDescription>All 5 strategies applied — semantic chunking, information gain, Discover title, E-E-A-T signals.</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-5">
                      {result.optimizedPost.title && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discover-Ready Title</p>
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-lg font-bold leading-snug">{result.optimizedPost.title}</p>
                            <CopyBtn text={result.optimizedPost.title} />
                          </div>
                        </div>
                      )}
                      {result.optimizedPost.metaDescription && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meta Description</p>
                          <div className="flex items-start gap-3 bg-muted/30 rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground italic flex-1">"{result.optimizedPost.metaDescription}"</p>
                            <CopyBtn text={result.optimizedPost.metaDescription} />
                          </div>
                        </div>
                      )}
                      {result.optimizedPost.intro && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Opening Hook</p>
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
                            <p className="text-sm leading-relaxed text-foreground flex-1">{result.optimizedPost.intro}</p>
                            <CopyBtn text={result.optimizedPost.intro} />
                          </div>
                        </div>
                      )}
                      {(result.optimizedPost.sections ?? []).map((sec, i) => (
                        <div key={i} className="space-y-1.5 border-l-2 border-primary/20 pl-4">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">H2</span>
                              {sec.heading}
                            </p>
                            <CopyBtn text={`## ${sec.heading}\n\n${sec.content}`} />
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{sec.content}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "homepage" && (
                <motion.div key="homepage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card>
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-base flex items-center gap-2"><Globe size={15} className="text-primary" /> Recommended Homepage Structure</CardTitle>
                      <CardDescription>10-section layout optimized for SEO, Google Discover, and conversion.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-2">
                      {result.homepageStructure.map((section, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-lg border bg-muted/20 px-4 py-3 text-sm">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                          <span className="text-foreground leading-relaxed flex-1">{section}</span>
                          <CopyBtn text={section} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "keywords" && (
                <motion.div key="keywords" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card>
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-base flex items-center gap-2"><TrendingUp size={15} className="text-primary" /> SEO Keywords — {niche}</CardTitle>
                      <CardDescription>Click any keyword to copy it.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {result.keywords.map((kw, i) => (
                          <button key={i} onClick={() => { void navigator.clipboard.writeText(kw); }}
                            className="flex items-center gap-2 text-left rounded-lg border bg-muted/20 hover:bg-muted/50 px-3 py-2.5 text-sm transition-colors group">
                            <span className="text-muted-foreground text-xs tabular-nums w-5 font-mono">{i + 1}.</span>
                            <span className="flex-1 font-medium text-foreground">{kw}</span>
                            <Copy size={11} className="text-muted-foreground/40 group-hover:text-muted-foreground shrink-0" />
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "pinterest" && (
                <motion.div key="pinterest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {result.pinterestStrategy.map((pin, i) => (
                    <Card key={i} className="border-rose-100">
                      <CardContent className="pt-4 pb-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-xs font-bold shrink-0">P{i + 1}</span>
                            <p className="font-semibold text-sm">{pin.title}</p>
                          </div>
                          <CopyBtn text={`Title: ${pin.title}\nHook: ${pin.hook}\nImage: ${pin.imageIdea}\nBoard: ${pin.boardSuggestion}`} label="Copy pin" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="space-y-1">
                            <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Hook Copy</p>
                            <p className="text-muted-foreground italic">"{pin.hook}"</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Image Idea</p>
                            <p className="text-muted-foreground">{pin.imageIdea}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Board</p>
                            <Badge variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-200">{pin.boardSuggestion}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )}

              {activeTab === "backlinks" && (
                <motion.div key="backlinks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {result.backlinkTargets.map((bl, i) => (
                    <Card key={i}>
                      <CardContent className="pt-4 pb-4 flex items-start gap-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0 mt-0.5">{i + 1}</span>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{bl.website}</p>
                            <Badge variant="secondary" className="text-[10px] capitalize">{bl.type.replace("-", " ")}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{bl.approach}</p>
                        </div>
                        <CopyBtn text={`${bl.website}: ${bl.approach}`} />
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )}

              {/* WebMCP tabs */}
              {activeTab === "wm-setup" && result.webmcp && (
                <motion.div key="wm-setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card className="border-violet-200">
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-base flex items-center gap-2"><Settings size={15} className="text-violet-600" /> WebMCP Environment Setup</CardTitle>
                      <CardDescription>Step-by-step setup for your blog niche. Compatible with Replit, WordPress, and static HTML.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-3">
                      {result.webmcp.setupSteps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-lg border border-violet-100 bg-violet-50/40 px-4 py-3">
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-violet-600 text-white text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                          <p className="text-sm text-foreground leading-relaxed flex-1">{step}</p>
                          <CopyBtn text={step} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "wm-html" && result.webmcp && (
                <motion.div key="wm-html" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                    <Code2 size={14} className="text-blue-600 shrink-0" />
                    <span>Declarative tools use <code className="font-mono text-xs bg-blue-100 px-1 rounded">toolname</code> and <code className="font-mono text-xs bg-blue-100 px-1 rounded">tooldescription</code> HTML attributes — AI agents can discover and call them with zero JavaScript.</span>
                  </div>
                  {result.webmcp.declarativeTools.map((tool, i) => (
                    <WebMCPToolCard key={i} tool={tool} index={i} lang="html" />
                  ))}
                </motion.div>
              )}

              {activeTab === "wm-js" && result.webmcp && (
                <motion.div key="wm-js" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <Terminal size={14} className="text-amber-600 shrink-0" />
                    <span>Imperative tools use <code className="font-mono text-xs bg-amber-100 px-1 rounded">navigator.modelContext.registerTool()</code> — paste into a <code className="font-mono text-xs bg-amber-100 px-1 rounded">&lt;script&gt;</code> tag in your blog's <code className="font-mono text-xs bg-amber-100 px-1 rounded">&lt;head&gt;</code>.</span>
                  </div>
                  {result.webmcp.imperativeTools.map((tool, i) => (
                    <WebMCPToolCard key={i} tool={tool} index={i} lang="javascript" />
                  ))}
                </motion.div>
              )}

              {activeTab === "wm-tasks" && result.webmcp && (
                <motion.div key="wm-tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {result.webmcp.taskResults.map((task, i) => <TaskCard key={task.taskId} task={task} index={i} />)}
                </motion.div>
              )}

              {activeTab === "wm-seo" && result.webmcp && (
                <motion.div key="wm-seo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  <Card className="border-violet-200">
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-base flex items-center gap-2"><Sparkles size={15} className="text-violet-600" /> Actiondata SEO Recommendations</CardTitle>
                      <CardDescription>Make your blog discoverable to AI search engines — beyond traditional SEO.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-3">
                      {(result.webmcp.actiondataSeo.recommendations ?? []).map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-lg border border-violet-100 bg-violet-50/40 px-4 py-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                          <p className="text-sm text-foreground leading-relaxed flex-1">{rec}</p>
                          <CopyBtn text={rec} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  {result.webmcp.actiondataSeo.manifest && (
                    <Card className="border-violet-200">
                      <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2"><ExternalLink size={14} className="text-violet-600" /> WebMCP JSON-LD Manifest</CardTitle>
                          <CardDescription>Add this inside a <code className="font-mono text-xs">&lt;script type="application/ld+json"&gt;</code> tag in your blog's &lt;head&gt;.</CardDescription>
                        </div>
                        <CopyBtn text={JSON.stringify(result.webmcp.actiondataSeo.manifest, null, 2)} label="Copy manifest" />
                      </CardHeader>
                      <CardContent className="pt-4">
                        <CodeBlock code={JSON.stringify(result.webmcp.actiondataSeo.manifest, null, 2)} lang="json" />
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

            </AnimatePresence>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={reset}>
                <RefreshCw className="h-4 w-4 mr-2" /> New Execution
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleRun} disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                Re-execute
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
