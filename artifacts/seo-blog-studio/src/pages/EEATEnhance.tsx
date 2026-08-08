import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEnhanceEEAT } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Wand2, Loader2, UserCircle, Target, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  niche: z.string().min(2, "Niche must be at least 2 characters."),
  authorPersona: z.string().min(5, "Author persona is required to establish expertise."),
  content: z.string().min(20, "Please provide the content to enhance."),
});

type FormValues = z.infer<typeof formSchema>;

export default function EEATEnhance() {
  const { toast } = useToast();
  const eeatMutation = useEnhanceEEAT();
  
  const [result, setResult] = useState<any | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      niche: "",
      authorPersona: "",
      content: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    eeatMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          setResult(data);
          toast({ title: "Enhancement Complete", description: "Content updated with stronger E-E-A-T signals." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to enhance content.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Award className="text-primary" /> E-E-A-T Enhancer
        </h1>
        <p className="text-muted-foreground mt-1">Inject Experience, Expertise, Authoritativeness, and Trustworthiness into your writing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Input Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="niche"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic / Niche</FormLabel>
                        <FormControl>
                          <Input data-testid="input-niche" placeholder="e.g. Medical Nutrition" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="authorPersona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <UserCircle size={16} /> Author Credentials
                        </FormLabel>
                        <FormControl>
                          <Input data-testid="input-author" placeholder="e.g. Registered Dietitian with 10 years clinical experience" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            data-testid="textarea-content" 
                            placeholder="Paste a section of your content to enhance..." 
                            className="h-48 resize-none font-serif text-sm leading-relaxed"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    data-testid="btn-enhance"
                    disabled={eeatMutation.isPending}
                  >
                    {eeatMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Apply E-E-A-T Signals
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-12 text-center text-muted-foreground min-h-[400px]"
              >
                <Target size={48} className="mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium text-foreground mb-2">Awaiting Content</h3>
                <p className="max-w-sm text-sm">Provide your content and author credentials on the left to see how it can be rewritten for higher trust and authority.</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="border-primary/20 shadow-md">
                  <CardHeader className="bg-primary/5 border-b pb-4 flex flex-row items-center justify-between">
                    <div>
                      <Badge variant="outline" className="mb-1 bg-background">Enhanced Output</Badge>
                      <CardTitle className="text-lg">Stronger Authority Signals</CardTitle>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">E-E-A-T Score</div>
                      <div className="text-2xl font-bold text-primary">{result.eeатScore}/100</div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="prose dark:prose-invert max-w-none text-sm font-serif leading-loose whitespace-pre-wrap">
                      {result.enhancedContent}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3 border-b bg-muted/20">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wand2 size={16} className="text-primary" /> Changes Applied
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-3">
                      {result.changesApplied.map((change: string, i: number) => (
                        <li key={i} className="flex gap-3 text-sm text-muted-foreground bg-background">
                          <ArrowRight size={16} className="text-primary shrink-0 mt-0.5" />
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
