import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCheckInfoGain } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Search, Loader2, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters."),
  niche: z.string().min(2, "Niche must be at least 2 characters."),
  outline: z.string().min(10, "Please provide a detailed outline."),
});

type FormValues = z.infer<typeof formSchema>;

export default function InfoGain() {
  const { toast } = useToast();
  const infoGainMutation = useCheckInfoGain();
  
  const [result, setResult] = useState<any | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      niche: "",
      outline: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    infoGainMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          setResult(data);
          toast({ title: "Analysis Complete", description: "Information gain evaluated successfully." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to evaluate information gain.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="text-primary" /> Information Gain Check
        </h1>
        <p className="text-muted-foreground mt-1">Ensure your content brings new, unique value compared to existing search results.</p>
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
                      <FormLabel>Target Keyword / Topic</FormLabel>
                      <FormControl>
                        <Input data-testid="input-topic" placeholder="e.g. Best Running Shoes" {...field} />
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
                        <Input data-testid="input-niche" placeholder="e.g. Fitness & Outdoors" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="outline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Outline or Draft</FormLabel>
                    <FormControl>
                      <Textarea 
                        data-testid="textarea-outline" 
                        placeholder="Paste your outline or draft here to evaluate its information gain..." 
                        className="h-40 text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                data-testid="btn-evaluate"
                disabled={infoGainMutation.isPending}
              >
                {infoGainMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Evaluate Info Gain
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
            <Card className="overflow-hidden">
              <div className="bg-primary/5 p-6 border-b flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full">
                  <h3 className="font-semibold text-lg mb-2">Information Gain Score</h3>
                  <Progress value={result.gainScore} className="h-3 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {result.gainScore >= 80 ? "Excellent. Your content provides highly unique value." :
                     result.gainScore >= 50 ? "Good. Consider addressing some competitor gaps." :
                     "Low. Your content is mostly summarizing what's already out there."}
                  </p>
                </div>
                <div className="h-24 w-24 rounded-full border-4 border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-3xl font-bold text-primary">{result.gainScore}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b">
                <div className="p-6">
                  <h4 className="font-medium flex items-center gap-2 mb-4 text-green-600">
                    <CheckCircle2 size={18} /> Covered Points
                  </h4>
                  <ul className="space-y-2">
                    {result.coveredPoints.map((point: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6">
                  <h4 className="font-medium flex items-center gap-2 mb-4 text-red-500">
                    <XCircle size={18} /> Missing Points
                  </h4>
                  <ul className="space-y-2">
                    {result.missingPoints.map((point: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 bg-muted/20">
                <div className="mb-6">
                  <h4 className="font-medium flex items-center gap-2 mb-3 text-primary">
                    <Lightbulb size={18} /> Recommended Unique Angle
                  </h4>
                  <p className="text-sm bg-background p-4 rounded-md border shadow-sm">
                    {result.uniqueAngle}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Competitor Gaps to Exploit</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.competitorGaps.map((gap: string, i: number) => (
                      <span key={i} className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full">
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
