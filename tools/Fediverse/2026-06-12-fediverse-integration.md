# Fediverse Integration via Bridgy Fed — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make stoa60.net followable on the Fediverse (Mastodon, Akkoma, etc.) by adding an RSS feed, microformat markup, and a Bridgy Fed follow widget — with zero new infrastructure required.

**Architecture:** The site is a static Astro v6 site. Weekly newsletter updates will become a new Astro content collection (`newsletters`). Astro's first-party `@astrojs/rss` package generates `feed.xml` from that collection. Bridgy Fed reads the feed and bridges the site to ActivityPub. h-card microformat on the homepage declares the site's Fediverse identity; h-entry microformat on each newsletter page marks it as a post to syndicate.

**Tech Stack:** Astro v6, `@astrojs/rss`, microformats2 (h-card, h-entry), Bridgy Fed (fed.brid.gy), curl (for weekly webmention ping)

---

## Assumptions — Verify Before Starting

Before touching any code, confirm these with the repo:

1. `astro.config.mjs` does NOT yet have a `site` field set — this is required for RSS and must be added.
2. Weekly newsletter HTML is currently NOT stored as files in the repo — it is only sent by email. This plan creates a new `src/content/newsletters/` collection to hold it going forward.
3. The site is deployed via a static host (Netlify, Vercel, GitHub Pages, etc.) with no server-side routing — confirm there is no server middleware that would conflict.
4. There is no existing `src/pages/feed.xml.ts` or `src/pages/rss.xml.ts` file.
5. The homepage lives at `src/pages/index.astro` (or equivalent).
6. Greek language content is fine in RSS — the feed will declare `<language>el</language>`.

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `astro.config.mjs` | Add `site: 'https://stoa60.net'` |
| Create | `src/content/newsletters/` | Directory for weekly update `.md` files |
| Create | `src/content/config.ts` (or modify if exists) | Define `newsletters` collection schema with rssSchema |
| Create | `src/pages/feed.xml.ts` | RSS endpoint — reads newsletters collection |
| Create | `src/pages/newsletters/[slug].astro` | Individual newsletter page with h-entry markup |
| Modify | `src/pages/index.astro` | Add h-card block + `rel="me"` link to Bridgy Fed + Follow form |
| Create | `src/content/newsletters/YYYY-MM-DD-example.md` | One real newsletter entry to validate the whole pipeline |
| Create | `scripts/ping-bridgy.sh` | One-liner curl script to ping Bridgy Fed after each publish |

---

## Task 1: Install RSS Package and Configure Site URL

**Files:**
- Modify: `astro.config.mjs`
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install `@astrojs/rss`**

```bash
npm install @astrojs/rss
```

Expected output: package added to `node_modules` and `package.json` dependencies.

- [ ] **Step 2: Verify `astro.config.mjs` has a `site` field**

Open `astro.config.mjs`. If the `site` field is missing or wrong, add it:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://stoa60.net',
  // ...existing config unchanged
});
```

The `site` field is required — without it, RSS items will have relative URLs that RSS readers and Bridgy Fed cannot follow.

- [ ] **Step 3: Build the site locally to confirm no breakage**

```bash
npm run build
```

Expected: build completes with no errors. The `site` field alone changes nothing visible.

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs package.json package-lock.json
git commit -m "feat: install @astrojs/rss and set site URL"
```

---

## Task 2: Create the Newsletters Content Collection

**Files:**
- Create or modify: `src/content/config.ts`
- Create: `src/content/newsletters/` (directory)

- [ ] **Step 1: Check if `src/content/config.ts` already exists**

```bash
ls src/content/
```

If `config.ts` exists, open it. If not, it will be created in the next step.

- [ ] **Step 2: Add the `newsletters` collection definition**

If `config.ts` already has content, append the newsletters collection. If it doesn't exist, create it:

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { rssSchema } from '@astrojs/rss';

const newsletters = defineCollection({
  type: 'content',
  schema: rssSchema.extend({
    // rssSchema already covers: title, pubDate, description, link, categories, customData
    // Add any extra fields specific to stoa60 here if needed, e.g.:
    issue: z.number().optional(), // issue number e.g. 42
  }),
});

// Merge with any existing collections already defined in this file:
export const collections = {
  newsletters,
  // ...any existing collections here
};
```

- [ ] **Step 3: Create the newsletters directory**

```bash
mkdir -p src/content/newsletters
```

- [ ] **Step 4: Create a sample newsletter entry to validate the schema**

```bash
touch src/content/newsletters/2026-06-12-week-1.md
```

Paste this content into the file:

```md
---
title: "Stoa60 — Εβδομαδιαία Ενημέρωση #1"
pubDate: 2026-06-12
description: "Πρώτο newsletter από το Stoa60. Επερχόμενα gigs, νέα από τον χώρο."
issue: 1
---

Γεια σας από το Stoa60.

Αυτό είναι το πρώτο εβδομαδιαίο update. Θα βρείτε εδώ νέα για gigs, 
αναγγελίες και ό,τι άλλο συμβαίνει στον χώρο.

## Επόμενο gig

...περιεχόμενο εδώ...
```

- [ ] **Step 5: Build to confirm the collection schema is valid**

```bash
npm run build
```

Expected: build succeeds. If there's a schema mismatch error, Astro will tell you exactly which field is wrong.

- [ ] **Step 6: Commit**

```bash
git add src/content/config.ts src/content/newsletters/
git commit -m "feat: add newsletters content collection with rssSchema"
```

---

## Task 3: Create the RSS Feed Endpoint

**Files:**
- Create: `src/pages/feed.xml.ts`

- [ ] **Step 1: Create the RSS endpoint file**

```bash
touch src/pages/feed.xml.ts
```

- [ ] **Step 2: Write the RSS endpoint**

```ts
// src/pages/feed.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const newsletters = await getCollection('newsletters');

  const sorted = newsletters.sort(
    (a, b) => new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
  );

  return rss({
    title: 'STOA60 — Εβδομαδιαίο Newsletter',
    description: 'Εβδομαδιαίες ενημερώσεις από τον υπόγειο συναυλιακό χώρο του Ηρακλείου.',
    site: context.site!.toString(),
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
    },
    customData: [
      `<language>el</language>`,
      `<atom:link href="${context.site}feed.xml" rel="self" type="application/rss+xml"/>`,
    ].join(''),
    items: sorted.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.pubDate,
      description: entry.data.description,
      link: `/newsletters/${entry.id}/`,
    })),
  });
}
```

- [ ] **Step 3: Build and verify the feed is generated**

```bash
npm run build
cat dist/feed.xml
```

Expected: `dist/feed.xml` exists and contains valid XML with at least one `<item>` for the sample newsletter created in Task 2.

- [ ] **Step 4: Check the feed validates**

Open https://validator.w3.org/feed/ in a browser and paste the contents of `dist/feed.xml`. It should pass with no errors.

Alternatively, run a local preview and check:
```bash
npm run dev
# then open http://localhost:4321/feed.xml in browser
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/feed.xml.ts
git commit -m "feat: add /feed.xml RSS endpoint for newsletters collection"
```

---

## Task 4: Create Individual Newsletter Pages with h-entry Markup

**Files:**
- Create: `src/pages/newsletters/[slug].astro`

Each newsletter needs a permanent URL so Bridgy Fed can link to it. The page must carry `h-entry` microformat classes so Bridgy Fed recognises it as a post.

- [ ] **Step 1: Create the newsletters pages directory**

```bash
mkdir -p src/pages/newsletters
```

- [ ] **Step 2: Create the dynamic route file**

```bash
touch src/pages/newsletters/[slug].astro
```

- [ ] **Step 3: Write the newsletter page template**

```astro
---
// src/pages/newsletters/[slug].astro
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const newsletters = await getCollection('newsletters');
  return newsletters.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);

const formattedDate = entry.data.pubDate.toLocaleDateString('el-GR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---

<!doctype html>
<html lang="el">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{entry.data.title} — STOA60</title>
    <meta name="description" content={entry.data.description} />
    <!-- RSS autodiscovery so Bridgy Fed and feed readers find the feed -->
    <link rel="alternate" type="application/rss+xml" title="STOA60 Newsletter" href="/feed.xml" />
  </head>
  <body>

    <!-- h-entry: tells Bridgy Fed this is a post to syndicate -->
    <article class="h-entry">

      <header>
        <a href="/" rel="author" class="p-author h-card">STOA60</a>
        <h1 class="p-name">{entry.data.title}</h1>
        <time class="dt-published" datetime={entry.data.pubDate.toISOString()}>
          {formattedDate}
        </time>
        <!-- Canonical permalink — required by Bridgy Fed -->
        <a class="u-url" href={`/newsletters/${entry.id}/`} hidden>permalink</a>
      </header>

      <!-- e-content: the full post body -->
      <div class="e-content">
        <Content />
      </div>

    </article>

    <footer>
      <a href="/">← stoa60.net</a>
    </footer>

  </body>
</html>
```

- [ ] **Step 4: Build and verify the sample newsletter page renders**

```bash
npm run build
# Check that the page exists
ls dist/newsletters/
```

Expected: a directory `dist/newsletters/2026-06-12-week-1/index.html` (or similar) exists.

- [ ] **Step 5: Preview and visually check the page**

```bash
npm run dev
# Open http://localhost:4321/newsletters/2026-06-12-week-1/
```

Expected: the newsletter renders with a title, date, and content. Right-click → View Source and confirm `class="h-entry"`, `class="dt-published"`, `class="e-content"` are present in the HTML.

- [ ] **Step 6: Commit**

```bash
git add src/pages/newsletters/
git commit -m "feat: add newsletter page route with h-entry microformat markup"
```

---

## Task 5: Add h-card and Bridgy Fed Markup to Homepage

**Files:**
- Modify: `src/pages/index.astro`

This is what makes stoa60.net a Fediverse actor. The h-card tells Bridgy Fed who the site is. The `rel="me"` link proves ownership. The follow form lets visitors follow directly from the site.

- [ ] **Step 1: Open the homepage**

```bash
cat src/pages/index.astro
```

Read through it to understand where the `<head>` and footer sections are before editing.

- [ ] **Step 2: Add RSS autodiscovery to `<head>`**

Inside the `<head>` tag of `src/pages/index.astro`, add:

```html
<link rel="alternate" type="application/rss+xml" title="STOA60 Newsletter" href="/feed.xml" />
```

- [ ] **Step 3: Add the h-card block**

The h-card can be invisible — it just needs to exist in the DOM. Add this somewhere in the page body (the footer is a good place to avoid disrupting existing layout):

```html
<!-- h-card: Fediverse identity for Bridgy Fed -->
<!-- This block is intentionally hidden — it describes the site's identity -->
<div class="h-card" style="display:none">
  <a class="u-url u-uid" href="https://stoa60.net">stoa60.net</a>
  <span class="p-name">STOA60</span>
  <span class="p-note">Υπόγειος συναυλιακός χώρος στο Ηράκλειο. Support your local DIY scene.</span>
</div>
```

If you want the h-card to be visible and styled (e.g. a small "about" blurb in the footer), remove the `style="display:none"` and style it with CSS instead.

- [ ] **Step 4: Add the `rel="me"` verification link to Bridgy Fed**

This proves to Bridgy Fed that you own the site. Add it in the footer area, either visibly or hidden:

```html
<!-- Bridgy Fed ownership verification -->
<a href="https://fed.brid.gy/" rel="me" style="display:none">Fediverse</a>
```

- [ ] **Step 5: Add the Follow form**

This lets Fediverse users follow stoa60.net directly from the site without knowing the handle. Place it near the existing newsletter subscribe form or in the footer:

```html
<!-- Fediverse Follow Form — powered by Bridgy Fed -->
<form method="post" action="https://fed.brid.gy/remote-follow">
  <label for="fediverse-follow">
    Ακολούθησε μας στο Fediverse (Mastodon κ.λπ.):
  </label>
  <input
    id="fediverse-follow"
    name="address"
    type="text"
    placeholder="@εσύ@mastodon.social"
    required
  />
  <input name="domain" type="hidden" value="stoa60.net" />
  <input name="protocol" type="hidden" value="web" />
  <button type="submit">Follow</button>
</form>
```

Style this form to match the existing site aesthetic (it's a plain HTML form — apply whatever CSS classes the rest of the site uses).

- [ ] **Step 6: Build and verify**

```bash
npm run build
npm run dev
```

Open `http://localhost:4321/`. Right-click → View Source and confirm:
- `class="h-card"` block is present
- `rel="me"` link pointing to `https://fed.brid.gy/` is present
- Follow form with `action="https://fed.brid.gy/remote-follow"` is present
- `<link rel="alternate" type="application/rss+xml"...>` is in `<head>`

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add h-card, rel=me, and Bridgy Fed follow form to homepage"
```

---

## Task 6: Register the Site with Bridgy Fed

This task happens **after deploying** the changes from Tasks 1–5. It cannot be done locally.

- [ ] **Step 1: Deploy the site**

Deploy via your normal deploy process (Netlify, Vercel, git push, etc.).

Verify these URLs are live before proceeding:
- `https://stoa60.net/feed.xml` — should return XML
- `https://stoa60.net/newsletters/2026-06-12-week-1/` — should return the sample newsletter page

- [ ] **Step 2: Register on Bridgy Fed**

Go to `https://fed.brid.gy/` in a browser.

Enter `stoa60.net` in the input field and submit.

Bridgy Fed will crawl your homepage and confirm it finds:
- The h-card
- The rel="me" link back to Bridgy Fed
- The RSS feed (via the `<link rel="alternate">` tag in `<head>`)

If it complains about anything, it will tell you exactly what's missing.

- [ ] **Step 3: Confirm your Fediverse handle**

After registration, Bridgy Fed will show your profile page at:
```
https://fed.brid.gy/stoa60.net
```

Your Fediverse handle is now:
```
@stoa60.net@web.brid.gy
```

Test this by opening a Mastodon account and searching for `@stoa60.net@web.brid.gy`. The profile should appear.

- [ ] **Step 4: Test the follow flow**

From any Mastodon account, follow `@stoa60.net@web.brid.gy`. The follow should succeed within a few seconds.

---

## Task 7: Create the Weekly Ping Script

**Files:**
- Create: `scripts/ping-bridgy.sh`

After each deploy, you ping Bridgy Fed with the URL of the new newsletter page. This tells it to come and fetch the new content immediately rather than waiting for its polling cycle.

- [ ] **Step 1: Create the scripts directory**

```bash
mkdir -p scripts
```

- [ ] **Step 2: Create the ping script**

```bash
touch scripts/ping-bridgy.sh
chmod +x scripts/ping-bridgy.sh
```

Write this content into the file:

```bash
#!/usr/bin/env bash
# ping-bridgy.sh
# Usage: ./scripts/ping-bridgy.sh https://stoa60.net/newsletters/2026-06-12-week-1/
# Run this after deploying a new newsletter to notify Bridgy Fed immediately.

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <newsletter-url>"
  echo "Example: $0 https://stoa60.net/newsletters/2026-06-19-week-2/"
  exit 1
fi

SOURCE_URL="$1"
echo "Pinging Bridgy Fed for: $SOURCE_URL"

curl -s -o /dev/null -w "HTTP %{http_code}" \
  --data-urlencode "source=${SOURCE_URL}" \
  --data-urlencode "target=https://fed.brid.gy/" \
  "https://fed.brid.gy/webmention"

echo ""
echo "Done. Check https://fed.brid.gy/stoa60.net for activity."
```

- [ ] **Step 3: Test the script with the sample newsletter (after Task 6 is complete)**

```bash
./scripts/ping-bridgy.sh https://stoa60.net/newsletters/2026-06-12-week-1/
```

Expected output:
```
Pinging Bridgy Fed for: https://stoa60.net/newsletters/2026-06-12-week-1/
HTTP 200
Done. Check https://fed.brid.gy/stoa60.net for activity.
```

- [ ] **Step 4: Commit**

```bash
git add scripts/ping-bridgy.sh
git commit -m "feat: add Bridgy Fed ping script for post-deploy notification"
```

---

## Weekly Workflow (Going Forward)

After setup, each week:

1. Write the newsletter as a new `.md` file in `src/content/newsletters/`:
   ```
   src/content/newsletters/2026-06-19-week-2.md
   ```
   with frontmatter: `title`, `pubDate`, `description`

2. Build and deploy as usual.

3. Run the ping script:
   ```bash
   ./scripts/ping-bridgy.sh https://stoa60.net/newsletters/2026-06-19-week-2/
   ```

4. Send the email newsletter as usual.

Fediverse followers receive the update within minutes of the ping.

---

## Success Criteria

- [ ] `https://stoa60.net/feed.xml` returns valid RSS XML with at least one item
- [ ] `https://stoa60.net/newsletters/<slug>/` renders a page with `h-entry` markup visible in source
- [ ] `https://stoa60.net/` contains h-card, rel="me" to Bridgy Fed, and follow form in source
- [ ] `https://fed.brid.gy/stoa60.net` shows a Bridgy Fed profile page for the site
- [ ] Searching `@stoa60.net@web.brid.gy` in Mastodon returns a followable account
- [ ] Following that account from a Mastodon account succeeds
- [ ] Running `ping-bridgy.sh` with a newsletter URL returns HTTP 200
- [ ] After ping, a new post appears in the Bridgy Fed activity log at `https://fed.brid.gy/stoa60.net`

---

## Notes for Claude Code

- The site uses **Astro v6.1.2** (confirmed from meta tag). Use Astro v6 API conventions — `render()` from `astro:content`, not `entry.render()` (deprecated in v5+).
- The site has **Greek content** — keep `<language>el</language>` in the RSS feed.
- Do **not** restructure any existing pages or components. All changes are additive.
- The newsletter pages intentionally have minimal styling — they exist for content and microformat correctness, not as primary UI. Style them to match the existing site but do not over-engineer.
- `@astrojs/rss` `rssSchema` covers: `title` (string), `pubDate` (Date), `description` (string), `categories` (string[]), `customData` (string). The `link` field in items is inferred from the collection entry's route, not a schema field.
