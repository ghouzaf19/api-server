import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGenerateBlogPost, useCreatePost, getListPostsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, CheckCircle, AlertCircle, BarChart, FileText, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters."),
  niche: z.string().min(2, "Niche must be at least 2 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export default function BlogGenerator() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const generateMutation = useGenerateBlogPost();
  const createMutation = useCreatePost();
  
  const [generatedPost, setGeneratedPost] = useState<any | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      niche: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    generateMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          setGeneratedPost({ ...data, ...values });
          toast({ title: "Content Generated", description: "Your SEO blog post is ready." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to generate content.", variant: "destructive" });
        }
      }
    );
  };

  const handleSave = () => {
    if (!generatedPost) return;
    
    createMutation.mutate(
      {
        data: {
          topic: generatedPost.topic,
          niche: generatedPost.niche,
          title: generatedPost.title,
          outline: generatedPost.outline,
          content: generatedPost.content,
          seoScore: generatedPost.seoScore,
          wordCount: generatedPost.wordCount,
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
          toast({ title: "Post Saved", description: "Successfully saved to your dashboard." });
          setLocation("/");
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to save the post.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <PenTool className="text-primary" /> Blog Generator
        </h1>
        <p className="text-muted-foreground mt-1">Generate a comprehensive, SEO-optimized blog post with outline and full content.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Brief</CardTitle>
          <CardDescription>Provide details about what you want to write.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Topic or Keyword</FormLabel>
                      <FormControl>
                        <Input data-testid="input-topic" placeholder="e.g. Benefits of Mediterranean Diet" {...field} />
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
                        <Input data-testid="input-niche" placeholder="e.g. Health & Wellness" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button 
                type="submit" 
                data-testid="btn-generate"
                disabled={generateMutation.isPending}
                className="w-full md:w-auto"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <PenTool className="mr-2 h-4 w-4" />
                    Generate Blog Post
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {generatedPost && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-primary/20 overflow-hidden shadow-lg">
              <CardHeader className="bg-primary/5 pb-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="bg-background">Generated Result</Badge>
                  <div className="flex gap-4 text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                      <BarChart size={16} className={generatedPost.seoScore >= 80 ? "text-green-500" : "text-amber-500"} />
                      <span>{generatedPost.seoScore} SEO Score</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText size={16} className="text-blue-500" />
                      <span>{generatedPost.wordCount} Words</span>
                    </div>
                  </div>
                </div>
                <CardTitle className="text-2xl">{generatedPost.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Outline</h3>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                    {generatedPost.outline}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Full Content</h3>
                  <div className="prose max-w-none dark:prose-invert whitespace-pre-wrap font-serif leading-relaxed">
                    {generatedPost.content}
                  </div>
                </div>

                {generatedPost.readabilityTips && generatedPost.readabilityTips.length > 0 && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-green-500" /> Readability Tips
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {generatedPost.readabilityTips.map((tip: string, i: number) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/30 border-t p-6 flex justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={createMutation.isPending}
                  data-testid="btn-save-post"
                  size="lg"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save to Dashboard
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
