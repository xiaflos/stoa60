// Which events get a shareable page at /gigs/<slug>/, and what that slug is.
// Shared by src/pages/gigs/[slug].astro (builds the pages) and the home-page
// calendar (links rows to them), so the two can never disagree.
import type { Event } from "./events.ts";

const FIRST_DATE = "2026";   // gigs from 2026 on

export function hasGigPage(ev: Event): boolean {
    return ev.date >= FIRST_DATE && !!ev.bandDescriptions && !!ev.poster;
}

// Slug = the poster's file name without extension (same as the newsletter file).
export function gigSlug(ev: Event): string {
    return ev.poster.split("/").pop()!.replace(/\.[^.]+$/, "");
}

export function gigPageHref(ev: Event): string | undefined {
    return hasGigPage(ev) ? `/gigs/${gigSlug(ev)}/` : undefined;
}
