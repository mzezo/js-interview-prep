# Interview Prep App

Next.js 14 app that renders the chapter Markdown files as a navigable, accessible interactive site.

## Local development

```bash
# from the /app directory
nvm use            # uses .nvmrc (Node 20)
npm install
npm run dev        # http://localhost:3000
```

## Producing the static export

```bash
npm run build      # outputs static HTML to ./out
npx serve out      # preview the production build locally
```

## Deploying to GitHub Pages

The `.github/workflows/deploy.yml` at the repo root handles this automatically on every push to `main`. Manually:

```bash
NEXT_PUBLIC_BASE_PATH=/js-interview-prep npm run build
# Push the contents of ./out to the gh-pages branch, or let the Action do it.
```

## Adding a new chapter

1. Create `content/NN-slug.md` with frontmatter:
   ```md
   ---
   title: 'Chapter Title'
   order: 16
   ---
   ```
2. Write Markdown body. GitHub-flavored Markdown supported, including `<details>` for collapsibles.
3. Run `npm run dev` — chapter appears in the sidebar automatically.

## Project structure

```
app/
├── content/                  # chapter Markdown files
├── src/
│   ├── app/
│   │   ├── layout.tsx        # root layout, skip link
│   │   ├── page.tsx          # home / chapter index
│   │   ├── chapters/[slug]/  # dynamic chapter page
│   │   └── globals.css       # Tailwind + a11y styles
│   ├── components/
│   │   ├── Sidebar.tsx       # navigation
│   │   └── MarkdownContent.tsx
│   └── lib/
│       ├── content.ts        # MD loader (build-time)
│       └── content.test.ts
├── next.config.mjs           # static export + basePath
└── package.json
```

## Tests

```bash
npm test            # watch mode
npm run test:ci     # one-shot, used in CI
```

## CI parity

```bash
npm run ci          # lint + typecheck + test + build
```

If `npm run ci` is green locally, your PR will be green.
