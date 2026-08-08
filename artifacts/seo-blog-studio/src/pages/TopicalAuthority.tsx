import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetTopicalAuthority } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Search, Loader2, ArrowRight, Link as LinkIcon, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters."),
  niche: z.string().min(2, "Niche must be at least 2 characters."),
  existingPosts: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TopicalAuthority() {
  const { toast } = useToast();
  const authorityMutation = useGetTopicalAuthority();
  
  const [result, setResult] = useState<any | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      niche: "",
      existingPosts: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    const existingPostsArray = values.existingPosts 
      ? values.existingPosts.split('\n').map(p => p.trim()).filter(Boolean)
      : [];

    authorityMutation.mutate(
      { 
        data: {
          topic: values.topic,
          niche: values.niche,
          existingPosts: existingPostsArray
        }
      },
      {
        onSuccess: (data) => {
          setResult(data);
          toast({ title: "Analysis Complete", description: "Topical authority map generated successfully." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to generate topical map.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Network className="text-primary" /> Topical Authority Builder
        </h1>
        <p className="text-muted-foreground mt-1">Discover content clusters and internal linking strategies to build topical authority.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pillar Topic</FormLabel>
                      <FormControl>
                        <Input data-testid="input-topic" placeholder="e.g. Personal Finance" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="niche"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry / Niche</FormLabel>
                      <FormControl>
                        <Input data-testid="input-niche" placeholder="e.g. Finance for Millennials" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="existingPosts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Existing Post Titles (One per line) <span className="text-muted-foreground font-normal">- Optional</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        data-testid="textarea-posts" 
                        placeholder="How to budget on a low income&#10;Top 5 investing apps" 
                        className="h-32 font-mono text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                data-testid="btn-analyze"
                disabled={authorityMutation.isPending}
              >
                {authorityMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Generate Topical Map
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
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-primary/5 pb-4 border-b">
                  <Badge className="w-fit mb-2">Pillar Topic</Badge>
                  <CardTitle className="text-2xl">{result.pillarTopic}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-4">Recommended Cluster Topics</h4>
                  <ul className="space-y-3">
                    {result.clusterTopics.map((topic: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-md bg-muted/50 border border-border/50">
                        <div className="mt-0.5 text-primary"><Network size={16} /></div>
                        <span className="text-sm font-medium">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-500 text-lg">
                      <AlertTriangle size={18} /> Content Gaps
                    </CardTitle>
                    <CardDescription>Topics missing from your existing content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.missingClusterTopics.map((topic: string, i: number) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {topic}
                        </li>
                      ))}
                      {result.missingClusterTopics.length === 0 && (
                        <p className="text-sm text-muted-foreground">No obvious gaps identified based on the input.</p>
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <LinkIcon size={18} className="text-primary" /> Internal Linking Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.internalLinks.map((link: any, i: number) => (
                        <div key={i} className="text-sm border rounded-md p-3">
                          <div className="font-medium mb-1 line-clamp-1">{link.targetPost}</div>
                          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                            <span>Use anchor:</span>
                            <Badge variant="secondary" className="font-mono bg-primary/10 text-primary hover:bg-primary/20">"{link.anchorText}"</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground italic border-t pt-2 mt-2">{link.reason}</p>
                        </div>
                      ))}
                      {result.internalLinks.length === 0 && (
                        <p className="text-sm text-muted-foreground">Add existing posts to get linking suggestions.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
