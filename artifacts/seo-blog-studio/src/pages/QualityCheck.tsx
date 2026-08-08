import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQualityCheck } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Search, Loader2, AlertCircle, Info, BookOpen, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  content: z.string().min(50, "Please provide enough content to analyze (min 50 chars)."),
});

type FormValues = z.infer<typeof formSchema>;

export default function QualityCheck() {
  const { toast } = useToast();
  const qualityMutation = useQualityCheck();
  
  const [result, setResult] = useState<any | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    qualityMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          setResult(data);
          toast({ title: "Check Complete", description: "Content quality analysis finished." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to perform quality check.", variant: "destructive" });
        }
      }
    );
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="text-primary" /> Content Quality & Fact Check
        </h1>
        <p className="text-muted-foreground mt-1">Automatically extract claims, check verifiability, and assess readability.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content to analyze</FormLabel>
                    <FormControl>
                      <Textarea 
                        data-testid="textarea-content" 
                        placeholder="Paste your drafted article here..." 
                        className="h-48 resize-y text-sm font-serif leading-relaxed"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  data-testid="btn-check"
                  disabled={qualityMutation.isPending}
                >
                  {qualityMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Run Quality Check
                    </>
                  )}
                </Button>
              </div>
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Overall Risk</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex justify-center">
                  <Badge variant="outline" className={`px-6 py-2 text-lg font-bold ${getRiskColor(result.overallRisk)}`}>
                    {result.overallRisk} RISK
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <BookOpen size={16} /> Readability
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-foreground mb-1">{result.readabilityScore}</div>
                  <div className="text-xs text-muted-foreground">
                    Flesch-Kincaid Equivalent
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-6">
              {result.flaggedClaims && result.flaggedClaims.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader className="bg-red-50/50 dark:bg-red-950/20 pb-3 border-b border-red-100 dark:border-red-900/50">
                    <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2 text-lg">
                      <AlertTriangle size={18} /> Flagged Claims ({result.flaggedClaims.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 p-0">
                    <ul className="divide-y divide-border">
                      {result.flaggedClaims.map((flag: any, i: number) => (
                        <li key={i} className="p-4 bg-background">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium mb-1">"{flag.claim}"</p>
                              <p className="text-sm text-muted-foreground">{flag.reason}</p>
                            </div>
                            <Badge variant="outline" className={
                              flag.severity === 'high' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30' : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30'
                            }>
                              {flag.severity}
                            </Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info size={18} className="text-primary" /> Extracted Facts
                  </CardTitle>
                  <CardDescription>Statements identified as factual claims</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 p-0">
                  <ul className="divide-y divide-border">
                    {result.facts.map((fact: any, i: number) => (
                      <li key={i} className="p-4 flex items-start gap-3">
                        {fact.verifiable ? (
                          <ShieldCheck size={18} className="text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{fact.fact}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs bg-muted/50">{fact.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {fact.verifiable ? "Likely verifiable" : "Hard to verify"}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                    {result.facts.length === 0 && (
                      <li className="p-6 text-center text-muted-foreground text-sm">No factual claims extracted.</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
