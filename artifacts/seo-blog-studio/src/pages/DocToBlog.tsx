import { useState } from "react";
import { useAnalyzeDocument, useGenerateDocBlog } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Wand2, Loader2, ChevronRight, ChevronDown,
  CheckCircle2, AlertCircle, Copy, RotateCcw, Sparkles,
  Target, BookOpen, Search, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

type Phase = "input" | "analysis" | "generate" | "result";

type AnalysisResult = {
  documentType: string;
  detectedLanguage: string;
  mainTopic: string;
  coreMessage: string;
  targetAudience: string;
  keyPoints: { point: string; importance: "high" | "medium" | "low" }[];
  technicalTerms: string[];
  originalTone: string;
  whatIsMissing: string;
  recommendedBlogAudience: string;
  recommendedHook: string;
  recommendedTone: string;
  suggestedTitle: string;
  suggestedSections: string[];
  seoKeywords: string[];
};

type BlogResult = {
  title: string;
  metaDescription: string;
  content: string;
  wordCount: number;
  seoScore: number;
  humanScore: number;
  keyTakeaways: string[];
  readabilityTips: string[];
};

const IMPORTANCE_COLOR: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  low: "bg-green-50 text-green-700 border-green-200",
};

function ScorePill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}/100</div>
      <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
      {copied ? "Copied!" : "Copy HTML"}
    </Button>
  );
}

export default function DocToBlog() {
  const { toast } = useToast();
  const analyzeMutation = useAnalyzeDocument();
  const generateMutation = useGenerateDocBlog();

  const [phase, setPhase] = useState<Phase>("input");
  const [documentText, setDocumentText] = useState("");
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("");
  const [specialFocus, setSpecialFocus] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [blogResult, setBlogResult] = useState<BlogResult | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedAudience, setEditedAudience] = useState("");
  const [editedTone, setEditedTone] = useState("");
  const [showFullHtml, setShowFullHtml] = useState(false);

  const handleAnalyze = () => {
    if (!documentText.trim() || documentText.trim().length < 50) {
      toast({ title: "Document too short", description: "Paste at least 50 characters of content to analyze.", variant: "destructive" });
      return;
    }
    if (!niche.trim()) {
      toast({ title: "Niche required", description: "Enter your blog niche so we can tailor the strategy.", variant: "destructive" });
      return;
    }
    analyzeMutation.mutate(
      { data: { documentText, niche, targetAudience: targetAudience || undefined, tone: tone || undefined } },
      {
        onSuccess: (data) => {
          setAnalysis(data as AnalysisResult);
          setEditedTitle((data as AnalysisResult).suggestedTitle);
          setEditedAudience((data as AnalysisResult).recommendedBlogAudience);
          setEditedTone((data as AnalysisResult).recommendedTone);
          setPhase("analysis");
          toast({ title: "Analysis complete", description: "Review the strategy below, then generate your post." });
        },
        onError: () => {
          toast({ title: "Analysis failed", description: "Something went wrong. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const handleGenerate = () => {
    if (!analysis) return;
    const finalAnalysis = { ...analysis, suggestedTitle: editedTitle, recommendedBlogAudience: editedAudience, recommendedTone: editedTone };
    generateMutation.mutate(
      {
        data: {
          documentText,
          analysis: finalAnalysis as Record<string, unknown>,
          niche,
          targetAudience: editedAudience || undefined,
          tone: editedTone || undefined,
          specialFocus: specialFocus || undefined,
        },
      },
      {
        onSuccess: (data) => {
          setBlogResult(data as BlogResult);
          setPhase("result");
          toast({ title: "Blog post ready!", description: "Your human-style post has been generated." });
        },
        onError: () => {
          toast({ title: "Generation failed", description: "Something went wrong. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const handleReset = () => {
    setPhase("input");
    setAnalysis(null);
    setBlogResult(null);
    setDocumentText("");
    setNiche("");
    setTargetAudience("");
    setTone("");
    setSpecialFocus("");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="text-primary" /> Doc → Blog
          </h1>
          <p className="text-muted-foreground mt-1">
            Transform any document into a human-written, SEO-optimized blog post in two steps.
          </p>
        </div>
        {phase !== "input" && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Start Over
          </Button>
        )}
      </div>

      {/* Phase stepper */}
      <div className="flex items-center gap-2 text-sm">
        {(["input", "analysis", "result"] as const).map((p, i) => {
          const labels = ["1. Paste Document", "2. Review Strategy", "3. Blog Post"];
          const isActive = phase === p || (phase === "generate" && p === "analysis");
          const isDone = (p === "input" && phase !== "input") || (p === "analysis" && phase === "result");
          return (
            <div key={p} className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 font-medium transition-colors ${isActive ? "text-primary" : isDone ? "text-green-600" : "text-muted-foreground"}`}>
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs border ${isActive ? "border-primary bg-primary/10 text-primary" : "border-muted-foreground/30 text-muted-foreground"}`}>{i + 1}</span>}
                {labels[i]}
              </span>
              {i < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground/40" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ── PHASE 1: Input ── */}
        {phase === "input" && (
          <motion.div key="input" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen size={18} className="text-primary" /> Paste Your Document</CardTitle>
                <CardDescription>Copy and paste the full text of any document, article, PDF content, or research paper.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="doc-text">Document Text</Label>
                  <Textarea
                    id="doc-text"
                    data-testid="textarea-document"
                    placeholder="Paste your document content here — research paper, news article, technical guide, report, or any text you want to transform into a blog post..."
                    className="min-h-[260px] resize-y font-mono text-sm leading-relaxed"
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">{documentText.length.toLocaleString()} characters · ~{Math.round(documentText.split(/\s+/).filter(Boolean).length)} words</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="niche">Blog Niche <span className="text-destructive">*</span></Label>
                    <Input id="niche" data-testid="input-niche" placeholder="e.g. BBQ & Grilling" value={niche} onChange={(e) => setNiche(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input id="audience" data-testid="input-audience" placeholder="e.g. Home cooks aged 25-45" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tone">Preferred Tone <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input id="tone" data-testid="input-tone" placeholder="e.g. Conversational, expert" value={tone} onChange={(e) => setTone(e.target.value)} />
                  </div>
                </div>

                <Button
                  data-testid="btn-analyze"
                  className="w-full"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending}
                >
                  {analyzeMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Document...</>
                  ) : (
                    <><Search className="mr-2 h-4 w-4" /> Analyze Document & Build Strategy</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── PHASE 2: Analysis review ── */}
        {(phase === "analysis" || phase === "generate") && analysis && (
          <motion.div key="analysis" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">

            {/* Document snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: FileText, label: "Document Type", value: analysis.documentType },
                { icon: Search, label: "Language", value: analysis.detectedLanguage },
                { icon: Target, label: "Original Tone", value: analysis.originalTone },
              ].map(({ icon: Icon, label, value }) => (
                <Card key={label} className="bg-muted/30">
                  <CardContent className="pt-4 pb-3 flex items-start gap-3">
                    <Icon size={16} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">{label}</p>
                      <p className="text-sm font-medium mt-0.5 capitalize">{value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key points */}
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Key Points Extracted</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2">
                  {analysis.keyPoints.map((kp, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Badge variant="outline" className={`text-[10px] shrink-0 mt-0.5 ${IMPORTANCE_COLOR[kp.importance]}`}>{kp.importance}</Badge>
                      <p className="text-sm text-muted-foreground leading-relaxed">{kp.point}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* What's missing + SEO keywords */}
              <div className="space-y-4">
                <Card className="border-amber-200 bg-amber-50/30">
                  <CardContent className="pt-4 pb-3 flex gap-3">
                    <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">What's Missing</p>
                      <p className="text-sm text-amber-800">{analysis.whatIsMissing}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 border-b">
                    <CardTitle className="text-base flex items-center gap-2"><Search size={16} className="text-primary" /> SEO Keywords</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.seoKeywords.map((kw) => (
                        <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {analysis.technicalTerms.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2 border-b">
                      <CardTitle className="text-base text-sm">Terms to Simplify</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.technicalTerms.map((t) => (
                          <Badge key={t} variant="outline" className="text-xs font-mono">{t}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Editable generation settings */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3 border-b border-primary/10">
                <CardTitle className="text-base flex items-center gap-2"><Sparkles size={16} className="text-primary" /> Blog Strategy — Edit Before Generating</CardTitle>
                <CardDescription>Review and tweak the AI's recommendations. These shape the final output.</CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="space-y-2">
                  <Label>Blog Post Title</Label>
                  <Input data-testid="input-title" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="font-medium" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Input data-testid="input-edit-audience" value={editedAudience} onChange={(e) => setEditedAudience(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Writing Tone</Label>
                    <Input data-testid="input-edit-tone" value={editedTone} onChange={(e) => setEditedTone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Suggested Hook</Label>
                  <p className="text-sm text-muted-foreground bg-background rounded-md border p-3 leading-relaxed italic">"{analysis.recommendedHook}"</p>
                </div>
                <div className="space-y-2">
                  <Label>Suggested Sections</Label>
                  <div className="flex flex-wrap gap-2">
                    {analysis.suggestedSections.map((s, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-sm bg-background border rounded-md px-2.5 py-1">
                        <span className="text-muted-foreground text-xs font-mono">H2</span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Special Focus <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input data-testid="input-special-focus" placeholder="Any specific angle or element to emphasize in the blog post..." value={specialFocus} onChange={(e) => setSpecialFocus(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Button
              data-testid="btn-generate"
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing Human-Style Blog Post...</>
              ) : (
                <><Wand2 className="mr-2 h-4 w-4" /> Generate Blog Post <ArrowRight className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          </motion.div>
        )}

        {/* ── PHASE 3: Result ── */}
        {phase === "result" && blogResult && (
          <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Score bar */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-600 h-5 w-5" />
                    <div>
                      <p className="font-semibold text-sm">Blog Post Generated</p>
                      <p className="text-xs text-muted-foreground">{blogResult.wordCount.toLocaleString()} words · {blogResult.title}</p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <ScorePill label="SEO Score" value={blogResult.seoScore} color="text-primary" />
                    <ScorePill label="Human Score" value={blogResult.humanScore} color="text-green-600" />
                  </div>
                  <CopyButton text={blogResult.content} />
                </div>
              </CardContent>
            </Card>

            {/* Key takeaways */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2"><CheckCircle2 size={16} className="text-green-600" /> Key Takeaways</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {blogResult.keyTakeaways.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">{i + 1}</span>
                      <span className="text-muted-foreground leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Meta description */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2"><Search size={16} className="text-primary" /> Meta Description</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-md border p-3 leading-relaxed italic">"{blogResult.metaDescription}"</p>
                <p className="text-xs text-muted-foreground mt-2">{blogResult.metaDescription.length} / 160 characters</p>
              </CardContent>
            </Card>

            {/* Blog post preview */}
            <Card>
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><FileText size={16} className="text-primary" /> Blog Post Content</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowFullHtml(!showFullHtml)}>
                    {showFullHtml ? <><ChevronDown className="h-3.5 w-3.5 mr-1" /> Preview</> : <><BookOpen className="h-3.5 w-3.5 mr-1" /> View HTML</>}
                  </Button>
                  <CopyButton text={blogResult.content} />
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                {showFullHtml ? (
                  <pre className="text-xs font-mono bg-muted/40 rounded-lg p-4 overflow-auto max-h-[500px] whitespace-pre-wrap border text-muted-foreground">
                    {blogResult.content}
                  </pre>
                ) : (
                  <div
                    className="prose dark:prose-invert max-w-none text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: blogResult.content }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Readability tips */}
            {blogResult.readabilityTips.length > 0 && (
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex items-center gap-2"><Sparkles size={16} className="text-primary" /> Readability Tips</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {blogResult.readabilityTips.map((tip, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                        <ArrowRight size={15} className="text-primary shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
