import { useState } from "react";
import { useRefreshContent } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, Loader2, Plus, Trash2, TrendingUp,
  Target, Crown, CheckCircle2, Copy, Check,
  ChevronRight, Lightbulb, BarChart2, Sparkles,
  ArrowUp, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ─── types ─── */
type KeywordRow = { keyword: string; position: string; clicks: string; impressions: string };

type LowHangingKeyword = {
  keyword: string;
  position: number;
  clicks?: number;
  impressions?: number;
  opportunityScore: number;
  reasoning: string;
};

type RefreshResult = {
  lowHangingFruit: LowHangingKeyword[];
  recommendedKeyword: string;
  recommendedKeywordReason: string;
  refreshedTitle: string;
  refreshedH1: string;
  refreshedFirstSentence: string;
  additionalSuggestions: string[];
  estimatedTrafficLift: string;
};

/* ─── helpers ─── */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.6, ease: "easeOut" }} className={cn("h-full rounded-full", color)} />
      </div>
      <span className="text-xs font-semibold tabular-nums w-7 text-right">{score}</span>
    </div>
  );
}

const POSITION_RANGES = [
  { label: "5–15 (prime)", min: 5, max: 15, color: "text-green-600 bg-green-50 border-green-200" },
  { label: "16–30", min: 16, max: 30, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { label: "1–4 (already winning)", min: 1, max: 4, color: "text-sky-600 bg-sky-50 border-sky-200" },
];

const EMPTY_ROW: KeywordRow = { keyword: "", position: "", clicks: "", impressions: "" };

/* ─── example data ─── */
const EXAMPLE_DATA = {
  postTitle: "Best BBQ Rubs for Brisket",
  postContent: "If you want a great brisket, the rub is everything. In this post we cover the best rubs to use.",
  niche: "BBQ & Grilling",
  keywords: [
    { keyword: "brisket rub recipe", position: "7", clicks: "42", impressions: "980" },
    { keyword: "best bbq rub for brisket", position: "11", clicks: "28", impressions: "760" },
    { keyword: "homemade brisket seasoning", position: "14", clicks: "15", impressions: "540" },
    { keyword: "smoked brisket rub", position: "6", clicks: "38", impressions: "1100" },
  ],
};

/* ─── main component ─── */
export default function ContentRefresh() {
  const { toast } = useToast();
  const mutation = useRefreshContent();

  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [niche, setNiche] = useState("");
  const [keywords, setKeywords] = useState<KeywordRow[]>([{ ...EMPTY_ROW }, { ...EMPTY_ROW }, { ...EMPTY_ROW }]);
  const [result, setResult] = useState<RefreshResult | null>(null);

  const addRow = () => setKeywords((k) => [...k, { ...EMPTY_ROW }]);
  const removeRow = (i: number) => setKeywords((k) => k.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof KeywordRow, val: string) =>
    setKeywords((k) => k.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  const loadExample = () => {
    setPostTitle(EXAMPLE_DATA.postTitle);
    setPostContent(EXAMPLE_DATA.postContent);
    setNiche(EXAMPLE_DATA.niche);
    setKeywords(EXAMPLE_DATA.keywords);
  };

  const handleRun = () => {
    const validKeywords = keywords.filter((r) => r.keyword.trim() && r.position.trim());
    if (!postTitle.trim()) {
      toast({ title: "Post title required", description: "Enter your current blog post title.", variant: "destructive" });
      return;
    }
    if (validKeywords.length === 0) {
      toast({ title: "Add at least one keyword", description: "Enter a keyword and its current Google ranking position.", variant: "destructive" });
      return;
    }
    if (!niche.trim()) {
      toast({ title: "Blog niche required", variant: "destructive" });
      return;
    }

    mutation.mutate(
      {
        data: {
          postTitle,
          postContent: postContent || undefined,
          niche,
          keywords: validKeywords.map((r) => ({
            keyword: r.keyword.trim(),
            position: Number(r.position),
            clicks: r.clicks ? Number(r.clicks) : undefined,
            impressions: r.impressions ? Number(r.impressions) : undefined,
          })),
        },
      },
      {
        onSuccess: (data) => {
          setResult(data as RefreshResult);
          toast({ title: "Refresh plan ready!", description: "Your Three Kings have been updated." });
        },
        onError: () => {
          toast({ title: "Analysis failed", description: "Something went wrong. Please try again.", variant: "destructive" });
        },
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
            <RefreshCw className="text-primary" /> Content Refresh
          </h1>
          <p className="text-muted-foreground mt-1">
            Boost organic traffic using the <span className="font-medium text-foreground">low-hanging fruit</span> technique — identify positions 5–15 and inject the right keyword into the Three Kings.
          </p>
        </div>
        {result && (
          <Button variant="outline" size="sm" onClick={reset}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> New Refresh
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">

            {/* How it works banner */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">The 3-Step Low-Hanging Fruit Method</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">1</span> Find keywords ranking positions 5–15</span>
                      <ChevronRight size={12} className="text-muted-foreground/40 hidden sm:block" />
                      <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">2</span> Pick the best target keyword</span>
                      <ChevronRight size={12} className="text-muted-foreground/40 hidden sm:block" />
                      <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">3</span> Inject into Title, H1 &amp; First Sentence</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Post details */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base">Blog Post Details</CardTitle>
                <CardDescription>Enter your current post's title and optionally the opening paragraph.</CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="post-title">Current Post Title / H1 <span className="text-destructive">*</span></Label>
                    <Input id="post-title" data-testid="input-post-title" placeholder="e.g. Best BBQ Rubs for Brisket" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="niche">Blog Niche <span className="text-destructive">*</span></Label>
                    <Input id="niche" data-testid="input-niche" placeholder="e.g. BBQ & Grilling" value={niche} onChange={(e) => setNiche(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="post-content">Current Opening Paragraph <span className="text-muted-foreground text-xs">(optional — improves accuracy)</span></Label>
                  <Textarea id="post-content" data-testid="textarea-content" placeholder="Paste your current intro paragraph so the AI can rewrite it with the refreshed keyword…" className="min-h-[80px] resize-none text-sm" value={postContent} onChange={(e) => setPostContent(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Keyword table */}
            <Card>
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><BarChart2 size={16} className="text-primary" /> Keyword Rankings</CardTitle>
                  <CardDescription className="mt-0.5">Paste from Google Search Console — positions 5–15 are prime candidates.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={loadExample}>
                  <Sparkles size={13} className="mr-1" /> Load Example
                </Button>
              </CardHeader>
              <CardContent className="pt-5 space-y-3">

                {/* Position legend */}
                <div className="flex flex-wrap gap-2 mb-1">
                  {POSITION_RANGES.map((r) => (
                    <span key={r.label} className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", r.color)}>Pos {r.label}</span>
                  ))}
                </div>

                {/* Header row */}
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-1">
                  <div className="col-span-5">Keyword</div>
                  <div className="col-span-2 text-center">Position</div>
                  <div className="col-span-2 text-center">Clicks</div>
                  <div className="col-span-2 text-center">Impressions</div>
                  <div className="col-span-1" />
                </div>

                <AnimatePresence initial={false}>
                  {keywords.map((row, i) => {
                    const pos = Number(row.position);
                    const posColor = pos >= 5 && pos <= 15
                      ? "border-green-300 bg-green-50 text-green-700"
                      : pos >= 16 && pos <= 30
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : pos > 0
                      ? "border-sky-300 bg-sky-50 text-sky-700"
                      : "border-border";
                    return (
                      <motion.div key={i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <Input
                            data-testid={`kw-keyword-${i}`}
                            placeholder="e.g. smoked brisket rub"
                            value={row.keyword}
                            onChange={(e) => updateRow(i, "keyword", e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            data-testid={`kw-position-${i}`}
                            type="number"
                            min="1"
                            max="100"
                            placeholder="9"
                            value={row.position}
                            onChange={(e) => updateRow(i, "position", e.target.value)}
                            className={cn("h-9 text-sm text-center font-mono border-2", row.position ? posColor : "border-border")}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input data-testid={`kw-clicks-${i}`} type="number" min="0" placeholder="—" value={row.clicks} onChange={(e) => updateRow(i, "clicks", e.target.value)} className="h-9 text-sm text-center font-mono" />
                        </div>
                        <div className="col-span-2">
                          <Input data-testid={`kw-impressions-${i}`} type="number" min="0" placeholder="—" value={row.impressions} onChange={(e) => updateRow(i, "impressions", e.target.value)} className="h-9 text-sm text-center font-mono" />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button onClick={() => removeRow(i)} className="text-muted-foreground/50 hover:text-destructive transition-colors p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <Button variant="outline" size="sm" onClick={addRow} className="mt-1 gap-1.5 text-xs">
                  <Plus size={13} /> Add Keyword Row
                </Button>
              </CardContent>
            </Card>

            <Button data-testid="btn-run" className="w-full h-12 text-base gap-2" onClick={handleRun} disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing &amp; Refreshing…</>
              ) : (
                <><TrendingUp className="h-4 w-4" /> Run Content Refresh</>
              )}
            </Button>
          </motion.div>
        ) : (

          /* ─── Results ─── */
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Traffic lift banner */}
            <Card className="border-green-200 bg-green-50/60">
              <CardContent className="pt-4 pb-4 flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 border border-green-200 shrink-0">
                  <ArrowUp size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">Estimated Traffic Lift</p>
                  <p className="text-lg font-bold text-green-700">{result.estimatedTrafficLift}</p>
                </div>
              </CardContent>
            </Card>

            {/* Step 1: Low-hanging fruit */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                  Low-Hanging Fruit Keywords
                </CardTitle>
                <CardDescription>Keywords in positions 5–15 ranked by opportunity score.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {result.lowHangingFruit.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No keywords in the 5–15 range found. Try adding more keywords from Search Console.</p>
                ) : (
                  result.lowHangingFruit.map((kw, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className={cn("rounded-xl border-2 p-4 space-y-2", kw.keyword === result.recommendedKeyword ? "border-primary/30 bg-primary/5" : "border-border bg-card")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {kw.keyword === result.recommendedKeyword && <Crown size={14} className="text-primary shrink-0" />}
                          <span className="font-semibold text-sm">{kw.keyword}</span>
                          {kw.keyword === result.recommendedKeyword && <Badge className="text-[10px] h-4">Recommended</Badge>}
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Pos {kw.position}</span>
                          {kw.clicks !== undefined && <span>{kw.clicks} clicks</span>}
                          {kw.impressions !== undefined && <span>{kw.impressions.toLocaleString()} imp</span>}
                        </div>
                      </div>
                      <ScoreBar score={kw.opportunityScore} />
                      <p className="text-xs text-muted-foreground leading-relaxed">{kw.reasoning}</p>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Step 2: Recommended keyword */}
            <Card className="border-primary/25 bg-primary/5">
              <CardContent className="pt-5 pb-4 flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold shrink-0 mt-0.5">2</span>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Keyword</p>
                  <p className="text-lg font-bold text-foreground">"{result.recommendedKeyword}"</p>
                  <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-1.5">
                    <Lightbulb size={13} className="text-amber-500 shrink-0 mt-0.5" />
                    {result.recommendedKeywordReason}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Three Kings */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                  The Three Kings — Updated
                </CardTitle>
                <CardDescription>Inject <span className="font-medium text-foreground">"{result.recommendedKeyword}"</span> into these three critical areas.</CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                {[
                  { icon: Crown, label: "Title Tag", value: result.refreshedTitle, hint: "Shown in Google search results — make every word count." },
                  { icon: Target, label: "H1 Heading", value: result.refreshedH1, hint: "The main heading readers see on your page." },
                  { icon: CheckCircle2, label: "First Sentence", value: result.refreshedFirstSentence, hint: "Google reads this immediately after the H1 — reinforce the keyword signal." },
                ].map(({ icon: Icon, label, value, hint }) => (
                  <div key={label} className="rounded-xl border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Icon size={12} className="text-primary" /> {label}
                      </p>
                      <CopyBtn text={value} />
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground italic">{hint}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Additional suggestions */}
            {result.additionalSuggestions.length > 0 && (
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex items-center gap-2"><Sparkles size={15} className="text-primary" /> Additional Refresh Tips</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {result.additionalSuggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <ChevronRight size={14} className="text-primary shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={reset}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh Another Post
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleRun} disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                Re-analyze
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
