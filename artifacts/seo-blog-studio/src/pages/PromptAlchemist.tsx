import { useState } from "react";
import { useAlchemizePrompt } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Sparkles, Shuffle, Loader2, Copy, Check,
  ChevronRight, BookOpen, Lightbulb, Target, Zap,
  Star, Clock, Trophy, Heart, Puzzle, Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ─────────────────────────── data ─────────────────────────── */

type Technique = {
  id: string;
  name: string;
  description: string;
  example: string;
};

type Category = {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  description: string;
  techniques: Technique[];
};

const CATEGORIES: Category[] = [
  {
    id: "contrarian",
    label: "Contrarian & Disruptive",
    icon: Flame,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    description: "Challenge what everyone thinks they know about BBQ",
    techniques: [
      { id: "myth-buster", name: "The Myth Buster", description: "Debunk a widely-held BBQ belief with evidence and personal experience", example: "e.g. 'Why You Should NEVER Soak Wood Chips'" },
      { id: "hot-take", name: "The Hot Take", description: "A bold, polarizing opinion that invites passionate debate", example: "e.g. 'Gas Grills Are Actually Better for Weeknights'" },
      { id: "plot-twist", name: "The Plot Twist", description: "Reveal a surprising truth hiding behind a classic technique", example: "e.g. 'The Secret Ingredient In Every Championship Brisket'" },
    ],
  },
  {
    id: "storytelling",
    label: "Storytelling & Personal",
    icon: Heart,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    description: "Connect with readers through vivid, relatable narratives",
    techniques: [
      { id: "origin-story", name: "The Origin Story", description: "How you discovered, mastered, or completely changed your approach to something", example: "e.g. 'The Rib Rack That Changed My Life'" },
      { id: "failure-lesson", name: "The Failure Lesson", description: "A grilling disaster, what went wrong, and the insight that came from it", example: "e.g. 'I Ruined a $60 Brisket So You Don't Have To'" },
      { id: "transformation", name: "The Transformation", description: "How one method, cut, or piece of gear changed everything", example: "e.g. 'From Charcoal Skeptic to True Believer'" },
    ],
  },
  {
    id: "efficiency",
    label: "Efficiency & Shortcuts",
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    description: "Maximum flavor with minimum effort and time",
    techniques: [
      { id: "lazy-cook", name: "The Lazy Cook's Way", description: "Get restaurant-quality results with fewer steps and less fuss", example: "e.g. 'The No-Fuss Pulled Pork That Runs Itself'" },
      { id: "30-min-hack", name: "The 30-Minute Hack", description: "Speed techniques that don't sacrifice quality or flavor", example: "e.g. 'Smoky Flavor in Half the Time'" },
      { id: "cheat-code", name: "The Cheat Code", description: "Pro secrets and shortcuts adapted for the home cook", example: "e.g. 'The Butter Bath Trick Pitmasters Use'" },
    ],
  },
  {
    id: "authority",
    label: "Expert Authority",
    icon: Trophy,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    description: "Build deep credibility and become the go-to BBQ voice",
    techniques: [
      { id: "pitmasters-verdict", name: "The Pitmaster's Verdict", description: "Insider knowledge from years of practice presented as definitive guidance", example: "e.g. 'What Real Competition Pitmasters Know About Smoke Rings'" },
      { id: "science-behind", name: "The Science Behind", description: "Data-driven breakdown of why a technique works at a molecular level", example: "e.g. 'The Maillard Reaction: Why Your Crust Is Everything'" },
      { id: "head-to-head", name: "The Head-to-Head Test", description: "Rigorous comparison of X methods so readers don't have to experiment themselves", example: "e.g. 'I Tried 5 Brisket Resting Methods — Here's the Winner'" },
    ],
  },
  {
    id: "problem-solution",
    label: "Problem & Solution",
    icon: Puzzle,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    description: "Speak directly to reader frustrations and fix them",
    techniques: [
      { id: "the-fix", name: "The Fix", description: "Solve a specific, named grilling failure point with a clear solution", example: "e.g. 'Why Your Ribs Are Always Tough (And How to Fix It)'" },
      { id: "rescue-guide", name: "The Rescue Guide", description: "How to save or salvage a cooking disaster mid-cook", example: "e.g. 'Stall Hit at Hour 6? Here's How to Save Your Brisket'" },
      { id: "beginners-unlock", name: "The Beginner's Unlock", description: "Transform total novices from intimidated to genuinely confident", example: "e.g. 'Your First Brisket: The Foolproof Method'" },
    ],
  },
  {
    id: "seasonal",
    label: "Seasonal & Occasion",
    icon: Sun,
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    description: "Timely, event-driven content readers are actively searching for",
    techniques: [
      { id: "holiday-special", name: "The Holiday Special", description: "A specific cut or recipe perfectly engineered for a celebration", example: "e.g. 'The Ultimate 4th of July Brisket Timeline'" },
      { id: "crowd-pleaser", name: "The Crowd-Pleaser", description: "Scaled-up feasts that feed a group without chaos or stress", example: "e.g. 'Feed 20 People With One Pork Shoulder'" },
      { id: "weekend-project", name: "The Weekend Project", description: "Immersive long cooks with a big dramatic payoff worth the wait", example: "e.g. '24-Hour Smoked Beef Cheeks: The Weekend Cook That Changes You'" },
    ],
  },
];

/* ─────────────────────────── types ─────────────────────────── */

type AlchemizedPromptItem = {
  title: string;
  angle: string;
  hook: string;
  outline: string[];
  whyItWorks: string;
};

type AlchemyResult = {
  prompts: AlchemizedPromptItem[];
  techniqueUsed: string;
  categoryUsed: string;
  topicInsight: string;
};

/* ─────────────────────────── helpers ─────────────────────────── */

function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
      {copied ? "Copied" : label}
    </button>
  );
}

/* ─────────────────────────── main component ─────────────────────────── */

export default function PromptAlchemist() {
  const { toast } = useToast();
  const mutation = useAlchemizePrompt();

  const [topic, setTopic] = useState("");
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [selectedTech, setSelectedTech] = useState<Technique | null>(null);
  const [result, setResult] = useState<AlchemyResult | null>(null);

  const NICHE = "BBQ & Grilling / Meat Lovers Hub";

  const handleGenerate = (inspire = false) => {
    if (!topic.trim()) {
      toast({ title: "Enter a topic", description: "Type a keyword, topic idea, or reader pain point.", variant: "destructive" });
      return;
    }
    if (!inspire && !selectedCat) {
      toast({ title: "Choose a category", description: "Select a strategic category first.", variant: "destructive" });
      return;
    }
    if (!inspire && !selectedTech) {
      toast({ title: "Choose a technique", description: "Pick a technique within your chosen category.", variant: "destructive" });
      return;
    }

    mutation.mutate(
      {
        data: {
          topic,
          niche: NICHE,
          category: inspire ? undefined : selectedCat?.label,
          technique: inspire ? undefined : selectedTech?.name,
          inspireMode: inspire,
        },
      },
      {
        onSuccess: (data) => {
          setResult(data as AlchemyResult);
          toast({ title: "Prompts ready!", description: `${(data as AlchemyResult).prompts.length} high-impact prompts generated.` });
        },
        onError: () => {
          toast({ title: "Generation failed", description: "Something went wrong. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const reset = () => { setResult(null); };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Flame className="text-primary" /> Prompt Alchemist
          </h1>
          <p className="text-muted-foreground mt-1">
            Transform a simple topic into high-impact blog prompts crafted for <span className="font-medium text-foreground">Meat Lovers Hub</span>.
          </p>
        </div>
        {result && (
          <Button variant="outline" size="sm" onClick={reset}>
            <Shuffle className="h-3.5 w-3.5 mr-1.5" /> New Alchemy
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="builder" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-8">

            {/* Step 1: Topic */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                <Label className="text-base font-semibold">Enter Your Topic</Label>
              </div>
              <div className="flex gap-3">
                <Input
                  data-testid="input-topic"
                  placeholder="e.g. brisket stall, cheap cuts for smoking, backyard BBQ for beginners…"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="flex-1 h-11"
                  onKeyDown={(e) => e.key === "Enter" && selectedTech && handleGenerate(false)}
                />
                <Button
                  data-testid="btn-inspire"
                  variant="outline"
                  className="h-11 shrink-0 gap-2"
                  onClick={() => handleGenerate(true)}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Shuffle size={15} />}
                  Inspire Me
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Type a keyword, topic idea, or a pain point your readers face. Or hit <span className="font-medium text-foreground">Inspire Me</span> to skip to random magic.</p>
            </div>

            {/* Step 2: Category */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                <Label className="text-base font-semibold">Choose a Category</Label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCat?.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      data-testid={`cat-${cat.id}`}
                      onClick={() => { setSelectedCat(cat); setSelectedTech(null); }}
                      className={cn(
                        "text-left rounded-xl border-2 p-4 transition-all duration-150 hover:shadow-sm",
                        isSelected ? `${cat.border} ${cat.bg} shadow-sm` : "border-border bg-card hover:border-muted-foreground/30"
                      )}
                    >
                      <div className={cn("flex items-center gap-2 font-semibold text-sm mb-1", isSelected ? cat.color : "text-foreground")}>
                        <Icon className={cn("h-4 w-4", isSelected ? cat.color : "text-muted-foreground")} />
                        {cat.label}
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">{cat.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Technique */}
            <AnimatePresence>
              {selectedCat && (
                <motion.div key={selectedCat.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                    <Label className="text-base font-semibold">Select a Technique</Label>
                    <Badge variant="outline" className={cn("text-xs", selectedCat.color, selectedCat.border, selectedCat.bg)}>
                      {selectedCat.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {selectedCat.techniques.map((tech) => {
                      const isSelected = selectedTech?.id === tech.id;
                      return (
                        <button
                          key={tech.id}
                          data-testid={`tech-${tech.id}`}
                          onClick={() => setSelectedTech(tech)}
                          className={cn(
                            "text-left rounded-xl border-2 p-4 transition-all duration-150 hover:shadow-sm",
                            isSelected ? `${selectedCat.border} ${selectedCat.bg} shadow-sm` : "border-border bg-card hover:border-muted-foreground/30"
                          )}
                        >
                          <p className={cn("font-semibold text-sm mb-1", isSelected ? selectedCat.color : "text-foreground")}>{tech.name}</p>
                          <p className="text-xs text-muted-foreground mb-2 leading-snug">{tech.description}</p>
                          <p className="text-xs italic text-muted-foreground/70">{tech.example}</p>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate button */}
            <AnimatePresence>
              {selectedTech && (
                <motion.div key="generate-btn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Button
                    data-testid="btn-generate"
                    className="w-full h-12 text-base gap-2"
                    onClick={() => handleGenerate(false)}
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Alchemizing Prompts…</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Generate Prompts <ChevronRight className="h-4 w-4 ml-1" /></>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    Using <span className="font-medium text-foreground">{selectedTech.name}</span> from <span className="font-medium text-foreground">{selectedCat?.label}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        ) : (

          /* ─── Results ─── */
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Meta header */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-5 pb-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs font-medium">{result.categoryUsed}</Badge>
                  <ChevronRight size={14} className="text-muted-foreground" />
                  <Badge variant="outline" className="text-xs font-medium">{result.techniqueUsed}</Badge>
                  <ChevronRight size={14} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">"{topic}"</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Lightbulb size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed italic">{result.topicInsight}</p>
                </div>
              </CardContent>
            </Card>

            {/* Prompt cards */}
            <div className="space-y-5">
              {result.prompts.map((prompt, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="group hover:shadow-md transition-shadow border-border hover:border-primary/30">
                    <CardHeader className="pb-3 border-b">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0 mt-0.5">{i + 1}</span>
                          <div>
                            <CardTitle className="text-base leading-snug">{prompt.title}</CardTitle>
                            <CardDescription className="mt-1 flex items-center gap-1.5">
                              <Target size={12} className="text-primary" />
                              {prompt.angle}
                            </CardDescription>
                          </div>
                        </div>
                        <CopyBtn text={`Title: ${prompt.title}\n\nAngle: ${prompt.angle}\n\nHook: ${prompt.hook}\n\nOutline:\n${prompt.outline.map((s, j) => `${j + 1}. ${s}`).join("\n")}`} label="Copy All" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">

                      {/* Hook */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen size={12} className="text-primary" /> Opening Hook
                          </p>
                          <CopyBtn text={prompt.hook} label="Copy hook" />
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground bg-muted/30 rounded-lg px-3 py-2.5 border italic">"{prompt.hook}"</p>
                      </div>

                      {/* Outline */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Clock size={12} className="text-primary" /> Post Outline
                        </p>
                        <div className="space-y-1.5">
                          {prompt.outline.map((section, j) => (
                            <div key={j} className="flex items-center gap-2.5 text-sm">
                              <span className="font-mono text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border shrink-0">H2</span>
                              <span className="text-muted-foreground">{section}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Why it works */}
                      <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                        <Star size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-emerald-700 mb-0.5">Why this works</p>
                          <p className="text-xs text-emerald-800 leading-relaxed">{prompt.whyItWorks}</p>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => handleGenerate(false)} disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Regenerate
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => handleGenerate(true)} disabled={mutation.isPending}>
                <Shuffle className="h-4 w-4 mr-2" /> Surprise Me
              </Button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
