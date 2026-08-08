import { useEffect } from "react";
import { SITE_URL } from "@/lib/siteUrl";

const SCRIPT_ID = "site-org-schema-jsonld";

/**
 * Injects global WebSite + Organization + Person JSON-LD schema into <head>.
 * Renders once at the app root — covers all pages.
 *
 * Enables:
 *  • Google Sitelinks Search Box (SearchAction)
 *  • Organization Knowledge Panel (logo, brand name)
 *  • Publisher reference for Recipe and Article schemas
 *  • Author Person entity for E-E-A-T signals
 */
export function SiteJsonLd() {
  useEffect(() => {
    const origin = SITE_URL;

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${origin}/#website`,
          "name": "Meat Lovers Hub",
          "alternateName": "Meat Lovers Hub — Recipes",
          "url": `${origin}/`,
          "description":
            "Foolproof, restaurant-quality meat recipes you can master at home — ribeye steak, BBQ ribs, smash burgers, grilled chicken and more.",
          "inLanguage": "en-US",
          "publisher": { "@id": `${origin}/#organization` },
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${origin}/recipes?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@type": "Organization",
          "@id": `${origin}/#organization`,
          "name": "Meat Lovers Hub",
          "url": `${origin}/`,
          "foundingDate": "2024",
          "description": "A home cooking blog dedicated to meat recipes — testing every dish in a real home kitchen for foolproof, restaurant-quality results.",
          "logo": {
            "@type": "ImageObject",
            "@id": `${origin}/#logo`,
            "url": `${origin}/favicon.svg`,
            "contentUrl": `${origin}/favicon.svg`,
            "width": 512,
            "height": 512,
            "caption": "Meat Lovers Hub",
          },
          "image": { "@id": `${origin}/#logo` },
          "sameAs": [
            "https://pinterest.com",
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "url": `${origin}/contact`,
          },
        },
        {
          "@type": "Person",
          "@id": `${origin}/#juicy-joe`,
          "name": "Juicy Joe",
          "url": `${origin}/author/juicy-joe`,
          "image": {
            "@type": "ImageObject",
            "url": "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop&q=85",
            "width": 400,
            "height": 400,
          },
          "description": "Home cook, food writer, and meat obsessive. Creator of Meat Lovers Hub — testing every recipe in a real home kitchen for over 7 years.",
          "jobTitle": "Recipe Developer & Food Writer",
          "worksFor": { "@id": `${origin}/#organization` },
          "knowsAbout": [
            "Steak cooking techniques",
            "BBQ and grilling",
            "Burger recipes",
            "Slow cooking",
            "Cast iron cooking",
            "Food safety and safe meat temperatures",
          ],
          "sameAs": [
            "https://pinterest.com",
          ],
        },
      ],
    };

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = SCRIPT_ID;
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.getElementById(SCRIPT_ID)?.remove();
    };
  }, []);

  return null;
}
