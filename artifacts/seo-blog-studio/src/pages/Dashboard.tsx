import React from "react";
import { useListPosts, useDeletePost, getListPostsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { PenTool, Trash2, FileText, BarChart, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: posts, isLoading } = useListPosts();
  const deletePost = useDeletePost();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    deletePost.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
          toast({ title: "Post deleted", description: "The blog post was removed successfully." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to delete the post.", variant: "destructive" });
        }
      }
    );
  };

  // Safe posts array conversion
  const postsArray = Array.isArray(posts) ? posts : [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-8 w-48 bg-muted rounded mb-2"></div>
          <div className="h-4 w-64 bg-muted rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your generated SEO content</p>
        </div>
        <Link href="/generate">
          <Button data-testid="btn-new-post" className="gap-2">
            <PenTool size={16} />
            New Post
          </Button>
        </Link>
      </div>

      {postsArray.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="text-primary" size={32} />
          </div>
          <CardTitle className="mb-2">No posts found</CardTitle>
          <CardDescription className="mb-6 max-w-md">
            You haven't generated any blog posts yet. Start by generating an SEO-optimized post using our AI tools.
          </CardDescription>
          <Link href="/generate">
            <Button data-testid="btn-empty-generate">Go to Blog Generator</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {postsArray.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {post.niche}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(post.id)}
                      data-testid={`btn-delete-post-${post.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {post.topic}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm mt-auto">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <BarChart size={14} className={post.seoScore >= 80 ? "text-green-500" : "text-amber-500"} />
                      <span className="font-medium text-foreground">{post.seoScore}</span> SEO
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <FileText size={14} />
                      <span className="font-medium text-foreground">{post.wordCount}</span> words
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 pt-4 pb-4 flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}