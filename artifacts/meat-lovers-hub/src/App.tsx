import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Link } from "wouter";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { CollectionsProvider } from "@/contexts/CollectionsContext";
import { WebMCPLayer } from "@/components/WebMCPLayer";
import { WebMCPBridge } from "@/components/WebMCPBridge";
import { CookieBanner } from "@/components/CookieBanner";

/* ── Lazy page imports ─────────────────────────────────────────────────── */
const HomePage              = lazy(() => import("@/pages/HomePage").then(m => ({ default: m.HomePage })));
const RecipePage            = lazy(() => import("@/pages/RecipePage").then(m => ({ default: m.RecipePage })));
const RecipesPage           = lazy(() => import("@/pages/RecipesPage").then(m => ({ default: m.RecipesPage })));
const CategoryPage          = lazy(() => import("@/pages/CategoryPage").then(m => ({ default: m.CategoryPage })));
const AboutPage             = lazy(() => import("@/pages/AboutPage").then(m => ({ default: m.AboutPage })));
const ContactPage           = lazy(() => import("@/pages/ContactPage").then(m => ({ default: m.ContactPage })));
const NewsletterPage        = lazy(() => import("@/pages/NewsletterPage").then(m => ({ default: m.NewsletterPage })));
const FollowPage            = lazy(() => import("@/pages/FollowPage").then(m => ({ default: m.FollowPage })));
const PrivacyPolicyPage     = lazy(() => import("@/pages/PrivacyPolicyPage").then(m => ({ default: m.PrivacyPolicyPage })));
const TermsPage             = lazy(() => import("@/pages/TermsPage").then(m => ({ default: m.TermsPage })));
const AuthorPage            = lazy(() => import("@/pages/AuthorPage").then(m => ({ default: m.AuthorPage })));
const EditorialPolicyPage   = lazy(() => import("@/pages/EditorialPolicyPage").then(m => ({ default: m.EditorialPolicyPage })));
const MeatTemperatureGuidePage = lazy(() => import("@/pages/MeatTemperatureGuidePage").then(m => ({ default: m.MeatTemperatureGuidePage })));
const ButcheryKnifeSkillsGuidePage = lazy(() => import("@/pages/ButcheryKnifeSkillsGuidePage").then(m => ({ default: m.ButcheryKnifeSkillsGuidePage })));
const BBQWoodFlavorGuidePage = lazy(() => import("@/pages/BBQWoodFlavorGuidePage").then(m => ({ default: m.BBQWoodFlavorGuidePage })));
const ResourcesPage         = lazy(() => import("@/pages/ResourcesPage").then(m => ({ default: m.ResourcesPage })));
const GuidesPage            = lazy(() => import("@/pages/GuidesPage").then(m => ({ default: m.GuidesPage })));
const CarnivoreMealPlanPage = lazy(() => import("@/pages/CarnivoreMealPlanPage").then(m => ({ default: m.CarnivoreMealPlanPage })));
const BlogPage              = lazy(() => import("@/pages/BlogPage").then(m => ({ default: m.BlogPage })));
const BlogPostPage          = lazy(() => import("@/pages/BlogPostPage").then(m => ({ default: m.BlogPostPage })));

/* ── Router ──────────────────────────────────────────────────────────────── */
function Router() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#F9F6F1" }} />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/recipes" component={RecipesPage} />
        <Route path="/recipes/category/:slug" component={CategoryPage} />
        <Route path="/recipes/:id" component={RecipePage} />
        <Route path="/recipe/:id" component={RecipePage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/newsletter" component={NewsletterPage} />
        <Route path="/follow" component={FollowPage} />
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/author/juicy-joe" component={AuthorPage} />
        <Route path="/editorial-policy" component={EditorialPolicyPage} />
        <Route path="/guides" component={GuidesPage} />
        <Route path="/guides/meat-temperatures" component={MeatTemperatureGuidePage} />
        <Route path="/guides/butchery-knife-skills-frenching" component={ButcheryKnifeSkillsGuidePage} />
        <Route path="/butchery-skills-frenching-lamb" component={ButcheryKnifeSkillsGuidePage} />
        <Route path="/bbq-wood-flavor-guide" component={BBQWoodFlavorGuidePage} />
        <Route path="/resources" component={ResourcesPage} />
        <Route path="/carnivore-meal-plan" component={CarnivoreMealPlanPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route>
          <div className="min-h-screen flex items-center justify-center" style={{ background: "#F9F6F1" }}>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", color: "#111", marginBottom: "1rem" }}>
                Page not found
              </h1>
              <Link href="/" style={{ color: "#B91C1C", fontFamily: "'Outfit', sans-serif", fontWeight: 600, textDecoration: "none" }}>
                ← Back to all recipes
              </Link>
            </div>
          </div>
        </Route>
      </Switch>
    </Suspense>
  );
}

/* ── App ─────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <CollectionsProvider>
      <SiteJsonLd />
      <WebMCPLayer />
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <CookieBanner />
      <WebMCPBridge />
    </CollectionsProvider>
  );
}
