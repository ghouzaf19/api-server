import { useState } from "react";
import { useRunGoogleAudit } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Loader2, CheckCircle2, AlertTriangle, XCircle,
  ChevronDown, ChevronUp, Copy, Check, Sparkles, Zap,
  TrendingUp, Star, Globe, Search, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ─── types ─── */
type AuditPillar = {
  pillar: string;
  score: number;
  status: "good" | "needs-work" | "critical";
  findings: string[];
  recommendations: string[];
};

type AuditResult = {
  overallScore: number;
  overallStatus: "passing" | "at-risk" | "failing";
  pillars: AuditPillar[];
  topPriorities: string[];
  discoverReadiness: string;
  suggestedKeywords: string[];
  rewrittenIntro: string;
  quickWins: string[];
};

/* ─── pillar metadata ─── */
const PILLAR_META: Record<string, { icon: string; color: string }> = {
  "Performance Gap Analysis": { icon: "📊", color: "sky" },
  "Authenticity & Information Gain": { icon: "✍️", color: "violet" },
  "Semantic Chunking Optimization": { icon: "🧱", color: "amber" },
  "Core Web Vitals / INP": { icon: "⚡", color: "orange" },
  "Citation Economy (E-E-A-T)": { icon: "🏆", color: "emerald" },
  "Content Perfection": { icon: "💎", color: "pink" },
  "Engagement Boost": { icon: "🔥", color: "red" },
  "Security & Manual Actions": { icon: "🔒", color: "slate" },
};

const STATUS_CONFIG = {
  good: { label: "Good", icon: CheckCircle2, cls: "text-green-600 bg-green-50 border-green-200" },
  "needs-work": { label: "Needs Work", icon: AlertTriangle, cls: "text-amber-600 bg-amber-50 border-amber-200" },
  critical: { label: "Critical", icon: XCircle, cls: "text-red-600 bg-red-50 border-red-200" },
};

const OVERALL_CONFIG = {
  passing: { label: "Passing", color: "text-green-600", bg: "bg-green-50 border-green-200", ring: "bg-green-500" },
  "at-risk": { label: "At Risk", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", ring: "bg-amber-500" },
  failing: { label: "Failing", color: "text-red-600", bg: "bg-red-50 border-red-200", ring: "bg-red-500" },
};

/* ─── helpers ─── */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ScoreRing({ score, status }: { score: number; status: string }) {
  const cfg = OVERALL_CONFIG[status as keyof typeof OVERALL_CONFIG] ?? OVERALL_CONFIG.failing;
  const r = 36, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-muted/20" />
        <motion.circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="7"
          strokeLinecap="round" strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={cfg.color} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-bold tabular-nums", cfg.color)}>{score}</span>
        <span className="text-[10px] text-muted-foreground font-medium">/ 100</span>
      </div>
    </div>
  );
}

function PillarCard({ pillar, index }: { pillar: AuditPillar; index: number }) {
  const [open, setOpen] = useState(false);
  const statusCfg = STATUS_CONFIG[pillar.status] ?? STATUS_CONFIG["needs-work"];
  const StatusIcon = statusCfg.icon;
  const barColor = pillar.score >= 75 ? "bg-green-500" : pillar.score >= 50 ? "bg-amber-500" : "bg-red-500";
  const meta = Object.entries(PILLAR_META).find(([k]) => pillar.pillar.includes(k.split(" ")[0]) || pillar.pillar === k)?.[1]
    ?? { icon: "📋", color: "slate" };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
      <Card className={cn("overflow-hidden border-2 transition-all", open ? "border-primary/25 shadow-sm" : "border-border hover:border-muted-foreground/20")}>
        <button className="w-full text-left" onClick={() => setOpen(!open)}>
          <div className="flex items-center gap-3 p-4">
            <span className="text-xl shrink-0">{meta.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm truncate">{pillar.pillar}</span>
                <Badge variant="outline" className={cn("text-[10px] shrink-0", statusCfg.cls)}>
                  <StatusIcon size={9} className="mr-1" />{statusCfg.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pillar.score}%` }}
                    transition={{ duration: 0.8, delay: index * 0.07, ease: "easeOut" }}
                    className={cn("h-full rounded-full", barColor)} />
                </div>
                <span className="text-xs font-mono font-semibold tabular-nums w-8 text-right">{pillar.score}</span>
              </div>
            </div>
            {open ? <ChevronUp size={15} className="text-muted-foreground shrink-0" /> : <ChevronDown size={15} className="text-muted-foreground shrink-0" />}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="border-t px-4 pb-4 pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={11} className="text-amber-500" /> Findings
                  </p>
                  <ul className="space-y-1.5">
                    {pillar.findings.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={11} className="text-green-500" /> Fixes
                  </p>
                  <ul className="space-y-1.5">
                    {pillar.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 size={11} className="text-green-500 mt-0.5 shrink-0" />{r}
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

const EXAMPLE = {
  postTitle: "The Best Smoked Brisket Recipe for Beginners",
  postContent: `Brisket is one of the most popular BBQ meats. It takes a long time to smoke but the result is worth it. You need to season the brisket and put it in the smoker. The temperature should be around 225°F. After many hours it will be done. Let it rest and then slice it.`,
  niche: "BBQ & Grilling / Meat Lovers Hub",
};

/* ─── main ─── */
export default function GoogleAudit() {
  const { toast } = useToast();
  const mutation = useRunGoogleAudit();

  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [niche, setNiche] = useState("BBQ & Grilling / Meat Lovers Hub");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [introCopied, setIntroCopied] = useState(false);

  const loadExample = () => { setPostTitle(EXAMPLE.postTitle); setPostContent(EXAMPLE.postContent); setNiche(EXAMPLE.niche); };

  const handleRun = () => {
    if (!postTitle.trim() || !postContent.trim()) {
      toast({ title: "Post title and content required", variant: "destructive" });
      return;
    }
    mutation.mutate(
      { data: { postTitle, postContent, niche, blogUrl: blogUrl || undefined } },
      {
        onSuccess: (data) => {
          setResult(data as AuditResult);
          toast({ title: "Audit complete!", description: `Overall score: ${(data as AuditResult).overallScore}/100` });
        },
        onError: () => toast({ title: "Audit failed", description: "Something went wrong. Try again.", variant: "destructive" }),
      }
    );
  };

  const reset = () => setResult(null);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-primary" /> Google Content Audit
          </h1>
          <p className="text-muted-foreground mt-1">
            Full 8-pillar audit based on the <span className="font-medium text-foreground">Google December 2025 Helpful Content & Quality Updates</span>.
          </p>
        </div>
        {result && (
          <Button variant="outline" size="sm" onClick={reset}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> New Audit
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">

            {/* 8 pillars preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(PILLAR_META).map(([name, { icon }]) => (
                <div key={name} className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  <span>{icon}</span><span className="leading-tight">{name}</span>
                </div>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Blog Post to Audit</CardTitle>
                  <CardDescription>Paste a blog post you want to diagnose and improve.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={loadExample}>
                  <Sparkles size={13} className="mr-1" /> Load Example
                </Button>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Post Title <span className="text-destructive">*</span></Label>
                    <Input data-testid="input-title" placeholder="e.g. The Best Smoked Brisket Recipe for Beginners" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Blog Niche</Label>
                    <Input data-testid="input-niche" placeholder="e.g. BBQ & Grilling" value={niche} onChange={(e) => setNiche(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Blog URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input data-testid="input-url" type="url" placeholder="https://meatlovershub.com/posts/smoked-brisket" value={blogUrl} onChange={(e) => setBlogUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Post Content <span className="text-destructive">*</span></Label>
                  <Textarea
                    data-testid="textarea-content"
                    placeholder="Paste the full blog post content here — the more complete, the more accurate the audit…"
                    className="min-h-[200px] resize-y text-sm font-mono leading-relaxed"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">{postContent.length.toLocaleString()} characters · ~{Math.round(postContent.split(/\s+/).filter(Boolean).length)} words</p>
                </div>
              </CardContent>
            </Card>

            <Button data-testid="btn-run-audit" className="w-full h-12 text-base gap-2" onClick={handleRun} disabled={mutation.isPending}>
              {mutation.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Running 8-Pillar Audit…</>
                : <><ShieldCheck className="h-4 w-4" /> Run Google Content Audit</>}
            </Button>
          </motion.div>
        ) : (

          /* ─── Results ─── */
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Overall score */}
            <Card className={cn("border-2", OVERALL_CONFIG[result.overallStatus]?.bg ?? "border-border")}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-6 flex-wrap">
                  <ScoreRing score={result.overallScore} status={result.overallStatus} />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold">Overall Audit Score</h2>
                      <Badge variant="outline" className={cn("capitalize text-xs", OVERALL_CONFIG[result.overallStatus]?.bg)}>
                        {result.overallStatus === "passing" ? "✅" : result.overallStatus === "at-risk" ? "⚠️" : "❌"} {OVERALL_CONFIG[result.overallStatus]?.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                      <Globe size={14} className="text-primary shrink-0 mt-0.5" />
                      <span><span className="font-medium text-foreground">Google Discover readiness:</span> {result.discoverReadiness}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {result.pillars.map((p) => {
                        const cfg = STATUS_CONFIG[p.status];
                        return (
                          <Badge key={p.pillar} variant="outline" className={cn("text-[10px]", cfg.cls)}>
                            {Object.entries(PILLAR_META).find(([k]) => p.pillar.includes(k.split(" ")[0]) || p.pillar === k)?.[1]?.icon ?? "📋"} {p.score}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top priorities */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3 border-b border-primary/10">
                <CardTitle className="text-base flex items-center gap-2"><Star size={15} className="text-primary" /> Top 3 Priority Fixes</CardTitle>
                <CardDescription>Do these first — highest impact on Google rankings.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {result.topPriorities.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-muted-foreground leading-relaxed">{p}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick wins */}
            <Card className="border-green-200 bg-green-50/40">
              <CardHeader className="pb-3 border-b border-green-200">
                <CardTitle className="text-base flex items-center gap-2"><Zap size={15} className="text-green-600" /> Quick Wins <span className="text-xs font-normal text-muted-foreground ml-1">under 15 minutes each</span></CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {result.quickWins.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 size={14} className="text-green-600 shrink-0 mt-0.5" />{w}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 8 Pillar cards */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={14} className="text-primary" /> 8-Pillar Breakdown — click any pillar to expand
              </h3>
              {result.pillars.map((pillar, i) => (
                <PillarCard key={i} pillar={pillar} index={i} />
              ))}
            </div>

            {/* Rewritten intro */}
            <Card>
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><TrendingUp size={15} className="text-primary" /> Rewritten Intro — Example Fix</CardTitle>
                  <CardDescription>Human-style, engaging, SEO-optimized opening paragraph.</CardDescription>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(result.rewrittenIntro); setIntroCopied(true); setTimeout(() => setIntroCopied(false), 2000); }}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {introCopied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  {introCopied ? "Copied" : "Copy"}
                </button>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm leading-relaxed text-muted-foreground bg-muted/30 rounded-lg border p-4 italic">"{result.rewrittenIntro}"</p>
              </CardContent>
            </Card>

            {/* SEO keywords */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2"><Search size={15} className="text-primary" /> Recommended SEO Keywords</CardTitle>
                <CardDescription>High-opportunity keywords for your niche.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2">
                  {result.suggestedKeywords.map((kw, i) => (
                    <Badge key={i} variant="secondary" className="text-xs cursor-pointer" onClick={() => navigator.clipboard.writeText(kw)}>{kw}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Click any keyword to copy it.</p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={reset}>
                <RefreshCw className="h-4 w-4 mr-2" /> Audit Another Post
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleRun} disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                Re-run Audit
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
