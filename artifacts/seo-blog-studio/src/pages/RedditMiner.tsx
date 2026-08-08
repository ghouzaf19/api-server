import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMineRedditKeywords } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Loader2,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  GitCompare,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  input: z.string().min(20, "Please paste at least 20 characters of Reddit content."),
  niche: z.string().min(2, "Niche must be at least 2 characters."),
});

type FormValues = z.infer<typeof formSchema>;

const intentColors: Record<string, string> = {
  explicit: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  implicit: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  comparison: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  problem: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const typeColors: Record<string, string> = {
  "blog-post": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "faq": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  "vs-comparison": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  "how-to": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  "listicle": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-auto flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  );
}

const EXAMPLE_INPUT = `I've been trying to make smash burgers at home but they never come out right. 
The crust isn't forming properly and the inside is dry. 
I use 80/20 beef but not sure if I need a different fat ratio.

Anyone else struggle with getting that crispy crust? 
Tried charcoal vs gas grill — charcoal gives way better flavor but gas is more consistent.

Also what's the best internal temp for medium rare? 
My thermometer says 135 but some recipes say 130.

Thinking about getting a cast iron griddle instead of my regular grill grate. 
Worth it?`;

export default function RedditMiner() {
  const { toast } = useToast();
  const mineMutation = useMineRedditKeywords();
  const [result, setResult] = useState<any | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { input: "", niche: "" },
  });

  const onSubmit = (values: FormValues) => {
    mineMutation.mutate(
      { data: { input: values.input, niche: values.niche } },
      {
        onSuccess: (data) => {
          setResult(data);
          toast({ title: "Mining Complete", description: "Keywords and content ideas extracted successfully." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to mine Reddit content.", variant: "destructive" });
        },
      }
    );
  };

  const loadExample = () => {
    form.setValue("input", EXAMPLE_INPUT);
    form.setValue("niche", "BBQ & Grilling");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="text-primary" /> Reddit Keyword Miner
        </h1>
        <p className="text-muted-foreground mt-1">
          Paste Reddit thread text or comments — AI extracts real keyword opportunities, content ideas, and user pain points for your blog.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="niche"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Blog Niche</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-niche"
                        placeholder="e.g. BBQ & Grilling, Personal Finance, Home Fitness"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="input"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Reddit Content</FormLabel>
                      <button
                        type="button"
                        onClick={loadExample}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Load example
                      </button>
                    </div>
                    <FormControl>
                      <Textarea
                        data-testid="textarea-input"
                        placeholder="Paste Reddit thread text, comments, or a mix of posts from a subreddit. The more content, the better the results."
                        className="h-52 font-mono text-sm resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Copy text from Reddit threads, r/subreddit posts, or comment sections. Works best with 200–2000 words of real community discussion.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                data-testid="btn-mine"
                disabled={mineMutation.isPending}
                size="lg"
              >
                {mineMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mining Reddit...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Mine Keywords & Ideas
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Summary banner */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-5 pb-5">
                <p className="text-sm font-medium text-foreground leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>

            <Tabs defaultValue="keywords">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="keywords" data-testid="tab-keywords">
                  <TrendingUp size={14} className="mr-1.5" /> Keywords
                  <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">{result.keywords?.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="ideas" data-testid="tab-ideas">
                  <Lightbulb size={14} className="mr-1.5" /> Ideas
                  <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">{result.contentIdeas?.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="pains" data-testid="tab-pains">
                  <AlertCircle size={14} className="mr-1.5" /> Pains
                  <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">{result.userPains?.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="vs" data-testid="tab-vs">
                  <GitCompare size={14} className="mr-1.5" /> VS
                  <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">{result.vsKeywords?.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="faq" data-testid="tab-faq">
                  <HelpCircle size={14} className="mr-1.5" /> FAQ
                  <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">{result.faqQuestions?.length}</Badge>
                </TabsTrigger>
              </TabsList>

              {/* Keywords Tab */}
              <TabsContent value="keywords" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Extracted Keywords</CardTitle>
                    <CardDescription>Each keyword comes with a ready-to-use blog title. Click the copy icon to grab a title.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.keywords?.map((kw: any, i: number) => (
                        <div key={i} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-start gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{kw.keyword}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${intentColors[kw.intent] ?? "bg-muted text-muted-foreground"}`}>
                              {kw.intent}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[kw.difficulty] ?? "bg-muted text-muted-foreground"}`}>
                              {kw.difficulty} difficulty
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                              {kw.volume} volume
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
                            <span className="text-xs text-muted-foreground flex-shrink-0">Title:</span>
                            <span className="text-sm font-medium flex-1">{kw.blogTitle}</span>
                            <CopyButton text={kw.blogTitle} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Ideas Tab */}
              <TabsContent value="ideas" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Content Ideas</CardTitle>
                    <CardDescription>Blog post concepts derived directly from Reddit signals.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.contentIdeas?.map((idea: any, i: number) => (
                        <div key={i} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${typeColors[idea.type] ?? "bg-muted text-muted-foreground"}`}>
                              {idea.type}
                            </span>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="font-semibold text-sm leading-snug">{idea.title}</span>
                              <CopyButton text={idea.title} />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-muted/40 rounded-md p-3">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Unique Angle</p>
                              <p className="text-xs text-foreground leading-relaxed">{idea.angle}</p>
                            </div>
                            <div className="bg-primary/5 border border-primary/10 rounded-md p-3">
                              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">Reddit Signal</p>
                              <p className="text-xs text-foreground leading-relaxed italic">"{idea.redditSignal}"</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* User Pains Tab */}
              <TabsContent value="pains" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">User Pain Points</CardTitle>
                    <CardDescription>Real problems your audience is struggling with — address these in your content.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.userPains?.map((pain: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-md bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20">
                          <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{pain}</span>
                          <CopyButton text={pain} />
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* VS Keywords Tab */}
              <TabsContent value="vs" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Comparison Keywords</CardTitle>
                    <CardDescription>"X vs Y" comparison content performs exceptionally well in 2026 AI search results.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.vsKeywords?.map((kw: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-3 rounded-md border bg-amber-50/40 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/20">
                          <GitCompare size={14} className="text-amber-600 flex-shrink-0" />
                          <span className="text-sm font-medium flex-1">{kw}</span>
                          <CopyButton text={kw} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* FAQ Tab */}
              <TabsContent value="faq" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">FAQ Questions</CardTitle>
                    <CardDescription>Add these to your blog posts as FAQ sections to target "People Also Ask" boxes in Google.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.faqQuestions?.map((q: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-md border bg-muted/30">
                          <HelpCircle size={15} className="text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm flex-1">{q}</span>
                          <CopyButton text={q} />
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
