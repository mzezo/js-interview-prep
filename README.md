# JS Interview Prep — flashcard study guide

Interactive flashcard-style study guide for JavaScript and frontend interviews. **135 questions across 15 categories**, each with a worked answer, code examples, common pitfalls, and senior-level insights.

Categories: JS fundamentals · Event loop · Prototypes · Arrays / immutability · Data structures · Algorithms · React core · Hooks · State management · Performance · Testing · Debugging · Networking · System design · Behavioral.

Features:

- **Status tracking** — mark each question as Not Started / Studied / Needs Review / Mastered. Persists across sessions in `localStorage`.
- **Bookmarks** — save tricky ones for later.
- **Search** — full-text across titles, hints, and answers. Press `/` to focus.
- **Filters** — by status, by category, or both.
- **Quiz mode** — randomly shuffled questions with reveal-then-rate flow.
- **Stats dashboard** — overall progress, mastery, breakdown by status and category.
- **Light / dark theme**, keyboard shortcuts, screen-reader friendly.

## Local development

Requires Node.js 20.

```bash
cd app
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run dev         # dev server
npm run build       # static export to app/out/
npm run typecheck   # TypeScript check
npm run lint        # ESLint
npm run test        # Vitest in watch mode
npm run test:ci     # Vitest run-once
npm run ci          # all of the above (use before push)
```

## Project structure

```
app/
├── src/
│   ├── app/
│   │   ├── globals.css    # design tokens (CSS vars)
│   │   ├── layout.tsx     # root layout + metadata
│   │   └── page.tsx       # main page (filters + cards + modals)
│   ├── components/        # TopBar, Sidebar, QuestionCard, QuizMode, Stats…
│   ├── hooks/             # useProgress, useTheme
│   ├── data/              # questions-1..4.ts (135 Q&A) + categories
│   └── lib/types.ts       # Question, Status, Category types
├── public/
└── out/                   # build output (gitignored)
```

## Deployment — GitHub Pages

The repo includes a GitHub Actions workflow that builds and deploys on every push to `main`.

### One-time setup

1. Push this repo to GitHub.
2. Go to **Settings → Pages** in the repo.
3. Under **Source**, select **GitHub Actions**.
4. Generate the lockfile and commit it (CI relies on `npm ci`):
   ```bash
   cd app
   npm install
   git add app/package-lock.json
   git commit -m "Add lockfile"
   git push
   ```

That's it. The workflow at `.github/workflows/deploy.yml` will run, build to `app/out/`, and publish to Pages.

The site will be live at `https://YOUR-USERNAME.github.io/js-interview-prep/`.

### Custom domain

In **Settings → Pages → Custom domain**, add your domain. Then create a `CNAME` record at your DNS provider pointing to `YOUR-USERNAME.github.io`.

If you use a custom domain, edit `.github/workflows/deploy.yml` and remove the `NEXT_PUBLIC_BASE_PATH=/js-interview-prep` env var (custom domains serve from root).

### Different repo name

If you don't name the repo `js-interview-prep`, edit two places:

- `.github/workflows/deploy.yml` line ~32 — change `NEXT_PUBLIC_BASE_PATH: /js-interview-prep` to `/your-repo-name`.

## Adding or editing questions

Each question lives in one of `app/src/data/questions-1.ts`, `questions-2.ts`, `questions-3.ts`, `questions-4.ts`. The shape:

```ts
{
  id: 42,
  category: 'react-core',           // must match an id in categories.ts
  title: 'What is reconciliation?',
  difficulty: 'mid',                // 'junior' | 'mid' | 'senior'
  hint: 'Reconciliation is...',     // optional
  answer: `Markdown body…`,
}
```

Answers support GitHub-flavored Markdown — including code fences (with syntax highlighting), tables, and `> blockquotes` rendered as **senior insight callouts** with an amber border.

After editing, run `npm run test:ci` — the data integrity test verifies unique IDs, valid categories, and sequential numbering.

## Accessibility

- Keyboard navigation across all interactive elements.
- `:focus-visible` outlines on every focusable element.
- ARIA labels on all icon-only buttons.
- Skip-to-content link as the first focusable element.
- Color contrast meets WCAG AA in both themes.
- Respects `prefers-reduced-motion`.

## License

MIT
