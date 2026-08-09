import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";

import Dashboard from "@/pages/Dashboard";
import BlogGenerator from "@/pages/BlogGenerator";
import TopicalAuthority from "@/pages/TopicalAuthority";
import InfoGain from "@/pages/InfoGain";
import EEATEnhance from "@/pages/EEATEnhance";
import QualityCheck from "@/pages/QualityCheck";
import AltText from "@/pages/AltText";
import RedditMiner from "@/pages/RedditMiner";
import DocToBlog from "@/pages/DocToBlog";
import PromptAlchemist from "@/pages/PromptAlchemist";
import ContentRefresh from "@/pages/ContentRefresh";
import GoogleAudit from "@/pages/GoogleAudit";
import RoadmapExecutor from "@/pages/RoadmapExecutor";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/generate" component={BlogGenerator} />
        <Route path="/topical-authority" component={TopicalAuthority} />
        <Route path="/info-gain" component={InfoGain} />
        <Route path="/eeat-enhance" component={EEATEnhance} />
        <Route path="/quality-check" component={QualityCheck} />
        <Route path="/alt-text" component={AltText} />
        <Route path="/reddit-miner" component={RedditMiner} />
        <Route path="/doc-to-blog" component={DocToBlog} />
        <Route path="/prompt-alchemist" component={PromptAlchemist} />
        <Route path="/content-refresh" component={ContentRefresh} />
        <Route path="/google-audit" component={GoogleAudit} />
        <Route path="/roadmap-executor" component={RoadmapExecutor} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base="">
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
