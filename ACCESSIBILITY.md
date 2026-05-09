# Accessibility & Responsiveness Notes

This document covers the a11y and responsive-design choices baked into the scaffold, plus what to verify before each release.

---

## Accessibility

### Semantic structure

- **Landmarks**: `<nav>`, `<main id="main-content">`, `<article>` are used so screen-reader users can jump between regions. Each `<nav>` has an `aria-label` describing its purpose ("Chapter navigation", "Chapter pagination").
- **Heading hierarchy**: One `<h1>` per page; chapter content uses `<h2>` as its top level (the page title is the `<h1>`, supplied by the layout). Nesting is strict — never skip levels.
- **Skip link**: The first focusable element on every page is a "Skip to main content" link, visually hidden until focused. This is the single highest-impact a11y fix for keyboard users.

### Keyboard navigation

- Every interactive element must be reachable with `Tab` and operable with `Enter`/`Space`. The scaffold uses `<a>` and `<button>` everywhere — no `<div onClick>`.
- **Focus indicators**: `:focus-visible` is styled in `globals.css` with a 2px blue outline plus 2px offset. **Never** set `outline: none` without an alternative visible indicator.
- The `<details>`/`<summary>` collapsibles used for quiz answers are keyboard-operable by default (Enter/Space toggle).

### Screen readers

- `aria-current="page"` marks the active chapter in the sidebar so screen readers announce it.
- Decorative icons (e.g., the ▸ arrow in summaries) are CSS pseudo-elements — invisible to screen readers, which is correct.
- Code blocks render inside `<pre><code>` with the appropriate language class. Screen readers handle these well; we don't need extra ARIA.

### Color and contrast

- The default light theme uses `text-gray-900` on `bg-white` (~16:1 contrast) — well above WCAG AA's 4.5:1 minimum.
- Dark mode uses `text-gray-100` on `bg-gray-950` (~17:1).
- Code highlighting colors were chosen to maintain ≥4.5:1 against their background in both themes. Verify with axe DevTools or Lighthouse if you change them.
- **Never communicate state with color alone** — the active sidebar item uses both color *and* font weight *and* `aria-current`.

### Motion

- `@media (prefers-reduced-motion: reduce)` short-circuits all animations and transitions to ~0ms. Users with vestibular disorders rely on this.

### Forms (when added)

- Every `<input>` should have an associated `<label>` (either wrapping or via `htmlFor`).
- Error messages use `role="alert"` (or `aria-live="polite"` for less-urgent updates) so screen readers announce them.
- `aria-invalid="true"` on inputs in error state.

### Verification checklist (before release)

- [ ] **Keyboard-only walkthrough**: Tab through every page; can you reach and operate everything? Is focus order logical?
- [ ] **Skip link**: Tab once on page load — does the skip link appear? Does activating it move focus to `<main>`?
- [ ] **Lighthouse a11y score**: Run in Chrome DevTools — aim for ≥95.
- [ ] **axe DevTools**: Run the browser extension on each chapter — zero critical/serious issues.
- [ ] **Screen reader spot-check**: VoiceOver (macOS) or NVDA (Windows). Navigate by headings, by links, by landmarks. Does it make sense?
- [ ] **200% zoom**: Browser zoom to 200%. Does any content get cut off or require horizontal scroll on a 1280px viewport?
- [ ] **Reduced motion**: macOS System Settings → Accessibility → Display → Reduce motion. Reload the page — confirm no animations.

---

## Responsiveness

### Breakpoints

The scaffold uses Tailwind's defaults, with one explicit layout switch:

| Width | Layout |
|---|---|
| `<768px` (mobile) | Sidebar stacks above main content, full-width |
| `≥768px` (tablet+) | Sidebar fixed on left, main content scrolls beside it |

The breakpoint is `md:` in Tailwind. We avoid finer breakpoints — content reflow with `max-width: 72ch` does most of the responsive work.

### Mobile-first defaults

- All base styles assume mobile. `md:` (and above) modifiers add desktop layout.
- The sidebar is `border-b` on mobile (visual divider after stacking) and `border-r` on desktop (vertical divider).
- Tap targets follow the 44×44px minimum (Apple HIG / WCAG 2.5.5). Sidebar links use `py-2` plus `px-3`, giving enough vertical room when paired with the line-height.

### Content width

- Prose body is capped at `72ch` (~720px). Long lines hurt readability; this is the standard typography rule.
- Code blocks may overflow horizontally on narrow viewports — they get a horizontal scroll bar, *never* wrap. Wrapping breaks code readability worse than scrolling does.

### Images

- The scaffold doesn't use bitmap images, but if you add them: always specify `width` and `height` (or use `aspect-ratio`) to prevent layout shift.
- For static export on GitHub Pages, `next/image` is set to `unoptimized: true` — provide pre-sized assets in `public/`.

### Testing matrix

- [ ] **Mobile portrait (375×812)**: iPhone SE viewport. Content readable, no horizontal scroll on body.
- [ ] **Mobile landscape (812×375)**: Sidebar still accessible.
- [ ] **Tablet (768×1024)**: Layout switches to two-column.
- [ ] **Desktop (1280×800)**: Default development viewport.
- [ ] **Wide (1920×1080)**: Content centered, doesn't stretch absurdly.
- [ ] **Devtools rotate**: Use Chrome DevTools device toolbar — Galaxy S20, iPad, iPhone 14 Pro Max. Each should look intentional.

---

## Performance budget

Even for a docs site, set numbers and check them:

| Metric | Target |
|---|---|
| Initial bundle (gzip) | <100 KB |
| LCP | <2.5s on 3G Fast |
| CLS | <0.1 |
| Lighthouse Performance | ≥95 |

Run `npm run build` and inspect the output bundle size. The Markdown is shipped as static HTML — there's no client-side hydration cost for content.

---

## Internationalization (future)

If you ever add i18n:

- Set `<html lang="...">` per-route, not just to `"en"`.
- Use the `dir` attribute for RTL languages.
- Don't concatenate translated strings — use full sentences with placeholders so translators can reorder.
- Tailwind has `rtl:` modifiers for layout flips.
