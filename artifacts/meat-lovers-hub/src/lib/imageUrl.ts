/**
 * Image URL utilities for Unsplash CDN
 *
 * Unsplash supports responsive images via URL params:
 *   fm=webp       → force WebP (25–35 % smaller than JPEG)
 *   auto=compress → Unsplash-side compression
 *   w / h         → resize
 *   fit=crop      → smart crop
 *   q             → quality (0–100); 72 is visually identical to 80 at ~15% smaller
 *
 * All helpers strip existing query params and rebuild cleanly so stale
 * params from DB values don't leak through.
 */

function stripQuery(url: string): string {
  return url.split("?")[0] ?? url;
}

function buildParams(overrides: Record<string, string | number>): string {
  return new URLSearchParams(
    Object.entries(overrides).map(([k, v]) => [k, String(v)])
  ).toString();
}

/** Single optimised WebP URL at a given size */
export function toWebP(url: string, w: number, h: number, q = 72): string {
  const base = stripQuery(url);
  return `${base}?${buildParams({ w, h, fit: "crop", q, fm: "webp", auto: "compress" })}`;
}

/**
 * srcSet for wide hero images (full-viewport-width banners).
 * Aspect ratio 7:3 (e.g. 1400×600).
 * Breakpoints: 480, 800, 1200, 1600 px.
 */
export function heroSrcSet(url: string): string {
  const base = stripQuery(url);
  const ratio = 3 / 7;
  return ([480, 800, 1200, 1600] as const)
    .map((w) => {
      const h = Math.round(w * ratio);
      return `${base}?${buildParams({ w, h, fit: "crop", q: 72, fm: "webp", auto: "compress" })} ${w}w`;
    })
    .join(", ");
}

/**
 * srcSet for 16/9 card thumbnails.
 * Breakpoints: 320, 640, 960 px.
 */
export function cardSrcSet(url: string): string {
  const base = stripQuery(url);
  return ([320, 640, 960] as const)
    .map((w) => {
      const h = Math.round(w * (9 / 16));
      return `${base}?${buildParams({ w, h, fit: "crop", q: 72, fm: "webp", auto: "compress" })} ${w}w`;
    })
    .join(", ");
}

/**
 * sizes attribute for hero images that span the full viewport.
 */
export const HERO_SIZES = "100vw";

/**
 * sizes attribute for cards in a responsive multi-column grid.
 * 1 col on mobile, 2 on tablet, 3 on desktop.
 */
export const CARD_SIZES =
  "(max-width: 640px) calc(100vw - 3rem), (max-width: 1024px) calc(50vw - 2rem), calc(33vw - 2rem)";

/**
 * Default WebP hero URL (1200 × 514) — used as the plain src / og:image fallback.
 */
export function heroSrc(url: string): string {
  return toWebP(url, 1200, 514);
}

/**
 * Default WebP card URL (800 × 450) — used as the plain src fallback.
 */
export function cardSrc(url: string): string {
  return toWebP(url, 800, 450);
}
