import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  PenTool,
  Network,
  TrendingUp,
  Award,
  ShieldCheck,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  Flame,
  RefreshCw,
  ScanSearch,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Blog Generator", icon: PenTool },
  { href: "/topical-authority", label: "Topical Authority", icon: Network },
  { href: "/info-gain", label: "Information Gain", icon: TrendingUp },
  { href: "/eeat-enhance", label: "E-E-A-T Enhance", icon: Award },
  { href: "/quality-check", label: "Quality Check", icon: ShieldCheck },
  { href: "/alt-text", label: "Image SEO Helper", icon: ImageIcon },
  { href: "/reddit-miner", label: "Reddit Miner", icon: MessageSquare },
  { href: "/doc-to-blog", label: "Doc → Blog", icon: FileText },
  { href: "/prompt-alchemist", label: "Prompt Alchemist", icon: Flame },
  { href: "/content-refresh", label: "Content Refresh", icon: RefreshCw },
  { href: "/google-audit", label: "Google Audit", icon: ScanSearch },
  { href: "/roadmap-executor", label: "Roadmap Executor", icon: Map },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col fixed h-full z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
            <PenTool size={18} />
          </div>
          <span className="font-semibold text-lg tracking-tight">SEO Studio</span>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon size={18} className={isActive ? "text-primary" : "text-muted-foreground"} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">© 2024 SEO Studio Pro</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
