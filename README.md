# personal-site

A personal site built with [Astro](https://astro.build): research, photographs, writing, and recommendations.

## Run it locally

```bash
npm run dev
```

Then open http://localhost:4321.

## Where things live

| To change… | Edit |
|---|---|
| Name, bio, links, publications | `src/site.config.ts` |
| Blog posts | `src/content/writing/*.md` (one file per post) |
| Research page (and homepage Research column) | `src/research.md` |
| Photo albums | `src/content/albums/<album>.md` plus a `<album>/` folder of images |
| Recommendations (music, playlists, books…) | `src/recommendations.md` |
| About | `src/pages/about.md` |
| Colours, fonts, spacing | `src/styles/global.css` (tokens at the top) |

### New essay, thought or poem

Create `src/content/writing/my-post.md`:

```md
---
title: My post
kind: essays  # essays, thoughts or poems
date: 2026-09-20
description: One sentence for the list and RSS feed.
tags: [photography]
---

Write here. Math works: $\mathcal{N}(\rho)$.
```

### New photo album

1. Put the photos in a subfolder of `~/Desktop/Website Photos/`. The folder name becomes the album title.
2. Run the importer:

   ```bash
   node scripts/import-photos.mjs ~/Desktop/"Website Photos"
   ```

For each photo, the importer:

- Reads the date, camera, lens, focal length, aperture, shutter and ISO into the album file, `src/content/albums/<album>.md`.
- Sorts the frames by the time they were taken.
- Saves a copy resized to 2400px with all metadata removed, including GPS.

Albums that already exist are skipped. Edit the album's `.md` file to add a `description`, or a `caption`/`alt` for each photo. The album page groups frames into shoots wherever two frames are more than two days apart.

## Placeholders to remove

- `src/content/writing/sample-post.md`

## Deploying

`.github/workflows/deploy.yml` publishes to GitHub Pages on every push to `main`. Before the first push:

1. Set `site` in `astro.config.mjs` to your real address.
2. In the GitHub repo, go to Settings → Pages and set Source to "GitHub Actions".

If the repo isn't named `<username>.github.io`, the site is served from a subpath and needs `base` set in `astro.config.mjs`. Using a custom domain avoids that.
