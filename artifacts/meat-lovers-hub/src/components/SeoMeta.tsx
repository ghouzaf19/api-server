import { useEffect } from "react";

import { SITE_URL as CANONICAL_BASE } from "@/lib/siteUrl";

interface SeoMetaProps {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  url?: string;
  type?: string;
  publishedAt?: string;
  modifiedAt?: string;
  authorName?: string;
  tags?: string[];
}

function setMeta(property: string, content: string, attr: "name" | "property" = "property") {
  let el = document.querySelector(`meta[${attr}="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(property: string, attr: "name" | "property" = "property") {
  const el = document.querySelector(`meta[${attr}="${property}"]`);
  if (el) el.remove();
}

export function SeoMeta({
  title,
  description,
  image,
  imageAlt = "",
  url,
  type = "article",
  publishedAt,
  modifiedAt,
  authorName,
  tags,
}: SeoMetaProps) {
  useEffect(() => {
    const fullTitle = `${title} | Meat Lovers Hub`;
    const pageUrl =
      url ||
      `${CANONICAL_BASE}${window.location.pathname}${window.location.search}`;

    document.title = fullTitle;

    // Canonical URL
    let canonical = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = pageUrl;

    // Standard meta
    setMeta("description", description, "name");
    setMeta("keywords", "meat recipe, easy dinner, " + title.toLowerCase(), "name");
    setMeta("author", authorName || "Juicy Joe", "name");

    // Open Graph
    setMeta("og:title", fullTitle);
    setMeta("og:description", description);
    setMeta("og:image", image);
    setMeta("og:image:alt", imageAlt || title);
    setMeta("og:image:width", "1200");
    setMeta("og:image:height", "630");
    setMeta("og:image:type", "image/jpeg");
    setMeta("og:url", pageUrl);
    setMeta("og:type", type);

    // Article-specific OG tags
    if (publishedAt) {
      setMeta("article:published_time", new Date(publishedAt).toISOString());
    }
    if (modifiedAt) {
      setMeta("article:modified_time", new Date(modifiedAt).toISOString());
    }
    if (authorName) {
      setMeta("article:author", authorName);
    }
    if (type === "article" || type === "recipe") {
      setMeta("article:section", "Food & Cooking");
    }

    // Article tags — help Google understand topic signals
    const existingTagMetas = document.querySelectorAll("meta[property='article:tag']");
    existingTagMetas.forEach((el) => el.remove());
    if (tags && tags.length > 0) {
      tags.slice(0, 6).forEach((tag) => {
        const el = document.createElement("meta");
        el.setAttribute("property", "article:tag");
        el.setAttribute("content", tag);
        document.head.appendChild(el);
      });
    }

    // Twitter
    setMeta("twitter:card", "summary_large_image", "name");
    setMeta("twitter:title", fullTitle, "name");
    setMeta("twitter:description", description, "name");
    setMeta("twitter:image", image, "name");
    setMeta("twitter:image:alt", imageAlt || title, "name");

    // Pinterest rich pin
    setMeta("pinterest-rich-pin", "true", "name");

    return () => {
      // Restore defaults on unmount
      document.title = "Meat Lovers Hub — Delicious & Easy Meat Recipes";
      setMeta("description", "Foolproof, restaurant-quality meat recipes you can master at home.", "name");
      setMeta("og:type", "website");
      removeMeta("article:published_time");
      removeMeta("article:modified_time");
      removeMeta("article:author");
      document.querySelectorAll("meta[property='article:tag']").forEach((el) => el.remove());
    };
  }, [title, description, image, imageAlt, url, type, publishedAt, modifiedAt, authorName, tags]);

  return null;
}
