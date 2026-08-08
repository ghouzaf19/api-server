import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGenerateAltText } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Search, Loader2, Type, Hash, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  imageDescription: z.string().min(5, "Please describe the image."),
  context: z.string().min(5, "Please provide the article context."),
});

type FormValues = z.infer<typeof formSchema>;

export default function AltText() {
  const { toast } = useToast();
  const altTextMutation = useGenerateAltText();
  
  const [result, setResult] = useState<any | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageDescription: "",
      context: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    altTextMutation.mutate(
      { data: { ...values, count: 3 } },
      {
        onSuccess: (data) => {
          setResult(data);
          toast({ title: "Generated", description: "Alt text suggestions ready." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to generate alt text.", variant: "destructive" });
        }
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Alt text copied to clipboard." });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ImageIcon className="text-primary" /> Image SEO Helper
        </h1>
        <p className="text-muted-foreground mt-1">Generate perfectly optimized alt text for accessibility and image search.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="imageDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image Description</FormLabel>
                    <FormDescription>What does the image literally show?</FormDescription>
                    <FormControl>
                      <Input data-testid="input-description" placeholder="e.g. A golden retriever running in a sunny park with a red frisbee" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Article Context & Keywords</FormLabel>
                    <FormDescription>Why is this image in the article? What are the target keywords?</FormDescription>
                    <FormControl>
                      <Textarea 
                        data-testid="textarea-context" 
                        placeholder="e.g. Article about best outdoor toys for energetic dog breeds. Target keyword: 'best dog frisbees'" 
                        className="h-24 resize-none text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                data-testid="btn-generate"
                disabled={altTextMutation.isPending}
                className="w-full md:w-auto"
              >
                {altTextMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Options...
                  </>
                ) : (
                  <>
                    <Type className="mr-2 h-4 w-4" />
                    Generate Alt Text
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
            className="space-y-4"
          >
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Badge variant="secondary">{result.suggestions.length}</Badge> Suggestions
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {result.suggestions.map((suggestion: any, i: number) => (
                <Card key={i} className="overflow-hidden hover:border-primary/50 transition-colors">
                  <div className="bg-muted/30 px-5 py-3 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      <span>Option {i + 1}</span>
                      <span className="px-1.5 py-0.5 rounded-sm bg-background border flex items-center gap-1">
                        <Hash size={10} /> {suggestion.characterCount} chars
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1.5 text-xs text-primary hover:bg-primary/10"
                      onClick={() => copyToClipboard(suggestion.altText)}
                    >
                      <Copy size={14} /> Copy
                    </Button>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-foreground font-medium text-base mb-4 leading-relaxed">
                      {suggestion.altText}
                    </p>
                    <div className="bg-primary/5 border border-primary/10 rounded-md p-3 text-sm text-muted-foreground">
                      <span className="font-medium text-primary text-xs uppercase mr-2">SEO Note:</span>
                      {suggestion.seoNotes}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
