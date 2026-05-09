import type { Question } from '../lib/types';

export const questions: Question[] = [
  // ─────────────────────────────────────────────────────────────────
  // Performance (10)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 87,
    category: 'performance',
    title: 'How do you profile a slow React app?',
    difficulty: 'mid',
    answer: `**Step 1 — Measure, don't guess.**

**React DevTools Profiler:**
- Install React DevTools extension.
- Open Profiler tab → click record → interact with app → stop.
- Each render is logged with: which component rendered, how long, *why* (props/state/hooks/parent).

**Chrome Performance tab:**
- For non-React work (long JS tasks, layout thrashing, paint).
- Record interaction → look for long yellow scripting bars or red layout warnings.

**Lighthouse:**
- For overall page metrics (LCP, CLS, TBT).
- Run on a deployed build, not dev (dev mode is artificially slow).

**Step 2 — Identify the bottleneck.**

Common categories:
- **Render time** — components re-rendering unnecessarily.
- **JS execution** — expensive computations on the main thread.
- **Bundle size** — too much JS to download/parse before paint.
- **Network** — waterfalls, no caching.
- **Layout / paint** — animation jank, large repaints.

**Step 3 — Fix the right layer.** Don't optimize a 1ms render when your bundle is 3MB.

**Step 4 — Verify the fix.** Profile again. Numbers > intuition.

**Senior signal:** Talk about *which metric* you'd improve. "I noticed LCP was 4.2s on 3G — most of it was JS parse. So I shifted to..."`,
    hint: 'Profiler → Performance tab → Lighthouse',
  },
  {
    id: 88,
    category: 'performance',
    title: 'React.memo — when does it actually help?',
    difficulty: 'mid',
    answer: `\`React.memo\` skips re-rendering a component if its props haven't changed (shallow compare).

\`\`\`jsx
const Row = React.memo(({ data, onClick }) => {
  return <div onClick={onClick}>{data.name}</div>;
});
\`\`\`

**It helps when:**
- Component is expensive to render (large subtree, complex computation).
- Parent re-renders frequently for unrelated reasons.
- Props are stable — primitives, or memoized objects/functions.

**It doesn't help (and may hurt):**
- Props are inline objects/functions — they're new references every render, memo always misses.

\`\`\`jsx
// ❌ Memo useless — config is new every render
<MemoChart config={{ height: 400 }} />

// ✅ Stabilize first
const config = useMemo(() => ({ height: 400 }), []);
<MemoChart config={config} />
\`\`\`

**Custom comparator** (rarely needed):

\`\`\`jsx
const Row = React.memo(
  ({ data }) => <div>{data.name}</div>,
  (prev, next) => prev.data.id === next.data.id // skip if id unchanged
);
\`\`\`

If you're writing custom comparators, reconsider — usually means props are wrongly shaped.

**The real cost of memo:** Every render still computes shallow comparison of all props. For tiny components, comparison cost > render cost. Don't memo \`<button>\`.

**React 19 Compiler** auto-memoizes — if your codebase uses it, manual \`React.memo\` becomes rare.`,
    hint: 'Memo + stable props or skip it',
  },
  {
    id: 89,
    category: 'performance',
    title: 'Code splitting in React',
    difficulty: 'mid',
    answer: `Code splitting breaks your bundle into chunks loaded on demand instead of upfront. Reduces initial bundle size, improves LCP.

**Route-level splitting (biggest win):**

\`\`\`jsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

Each route becomes a separate chunk; users only download Settings code if they visit /settings.

**Component-level splitting:**

\`\`\`jsx
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);
  return (
    <div>
      <button onClick={() => setShowChart(true)}>Show analytics</button>
      {showChart && (
        <Suspense fallback={<Spinner />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
}
\`\`\`

**Frameworks do this for you:**
- Next.js / Remix / TanStack Start — auto-split per route.
- Vite, Webpack — \`import()\` syntax becomes a chunk.

**Pitfalls:**
- **Splitting too small** — many tiny chunks = many network requests. Bundlers chunk-split heuristically; usually fine.
- **Loading state bouncing** — if your suspense fallback differs from the loaded UI, the layout shifts. Match dimensions or use skeleton.
- **Preload** — for predictable navigation, preload chunks: \`Dashboard.preload()\` (custom) or \`<link rel="modulepreload">\`.`,
    hint: 'lazy + Suspense per route',
  },
  {
    id: 90,
    category: 'performance',
    title: 'Virtualizing long lists',
    difficulty: 'mid',
    answer: `Rendering 10,000 rows is slow. Virtualization renders only visible items, plus a small buffer.

**Libraries:** \`react-window\` (lightweight), \`react-virtuoso\` (more features), \`@tanstack/react-virtual\` (headless).

**\`react-window\` example:**

\`\`\`jsx
import { FixedSizeList } from 'react-window';

const Row = ({ index, style }) => (
  <div style={style}>Row {index}</div>
);

<FixedSizeList
  height={600}
  itemCount={10000}
  itemSize={50}
  width="100%"
>
  {Row}
</FixedSizeList>
\`\`\`

**Why \`style\` is required:** The library positions items absolutely. Your row must apply that style.

**When to virtualize:**
- 100+ items where each is non-trivial (DOM cost).
- 1000+ items, full stop.
- Tables with many columns AND rows — virtualize both axes.

**When NOT to:**
- Few dozen items — virtualization adds complexity for nothing.
- Dynamic heights (use \`VariableSizeList\` or Virtuoso, but harder).
- SEO-critical content — virtualized items aren't in the DOM, may hurt indexing.

**Pitfalls:**
- **Lost \`Tab\` order** — only rendered items receive focus. For accessibility, ensure keyboard navigation works (libraries handle it; verify).
- **Layout measurement** — fixed sizes work best. Variable sizes need cached measurements; mistakes cause flicker.
- **\`Ctrl-F\`** — browser's find won't see hidden items. Trade-off you accept.

**Mid-level signal:** Recognizing the cost. "If we're rendering 5,000 rows, that's 5,000 DOM nodes — even cheap rows add up. Virtualize."`,
    hint: 'react-window: only render visible',
  },
  {
    id: 91,
    category: 'performance',
    title: 'Largest Contentful Paint (LCP) — what affects it?',
    difficulty: 'senior',
    answer: `LCP measures when the **largest visible content element** finishes rendering. Google's threshold for "good" is under 2.5s.

**Common LCP elements:**
- Hero image
- Largest text block (h1)
- Background image of a large element
- Video poster

**What hurts LCP:**

1. **Render-blocking resources** — synchronous \`<script>\` and \`<link rel="stylesheet">\` in head delay HTML rendering.
2. **Slow server response** (TTFB) — every ms of server lag pushes LCP further out.
3. **Large JS bundles** — parse + execute time before React can render.
4. **Unoptimized images** — uncompressed, wrong format, no responsive sizing.
5. **Lazy-loaded LCP element** — ironic; if your hero image has \`loading="lazy"\`, LCP suffers.
6. **Web fonts** — FOIT (flash of invisible text) blocks paint.

**Fixes:**

\`\`\`html
<!-- Preload critical resources -->
<link rel="preload" as="image" href="/hero.webp" />
<link rel="preconnect" href="https://api.example.com" />

<!-- Don't lazy-load LCP image -->
<img src="/hero.webp" loading="eager" fetchpriority="high" />

<!-- font-display: swap — show fallback while loading -->
<style>
  @font-face {
    font-family: 'MyFont';
    src: url(...) format('woff2');
    font-display: swap;
  }
</style>
\`\`\`

**For React apps:**
- SSR / SSG so HTML arrives with content (CSR sends empty shell — terrible LCP).
- Code split routes — main bundle stays small.
- Inline critical CSS in the HTML head.

**Measure with:** Chrome DevTools → Lighthouse → mobile + slow 4G simulation. Real-world: Search Console → Core Web Vitals.`,
    hint: 'TTFB + render-blocking + image optimization',
  },
  {
    id: 92,
    category: 'performance',
    title: 'Cumulative Layout Shift (CLS) — how to avoid it',
    difficulty: 'mid',
    answer: `CLS measures **unexpected layout shifts** during page load. Threshold for "good": under 0.1.

**Worst CLS offenders:**

1. **Images without dimensions** — page reflows when they load.
\`\`\`html
<!-- ❌ No dimensions — content jumps when loaded -->
<img src="/photo.jpg" />

<!-- ✅ Reserve space -->
<img src="/photo.jpg" width="800" height="600" />
<!-- Or with CSS aspect-ratio -->
<img src="/photo.jpg" style="aspect-ratio: 4/3" />
\`\`\`

2. **Web fonts swapping** (FOUT) — different font metrics shift surrounding text.
   - Use \`size-adjust\`, \`ascent-override\` on \`@font-face\` to match fallback metrics.
   - Or use system fonts.

3. **Late-loading content** above existing content — banners, cookie notices that push content down.
   - Reserve space with \`min-height\`.
   - Render above the fold or below existing content.

4. **Async content** filling a space without a placeholder.
   - Use skeleton loaders that match final dimensions.

5. **Animations** of layout properties (\`top\`, \`left\`, \`width\`).
   - Use \`transform\` and \`opacity\` instead — they don't trigger layout.

**Debugging CLS:**
- Chrome DevTools → Performance → Experience track shows CLS events.
- Each shift highlights the moved element.

**React-specific:**
- Don't conditionally render components that change layout; use \`visibility: hidden\` or skeletons.
- Keep loading and loaded states the same dimensions.

**Real impact:** CLS makes users tap the wrong button — they're aiming at "Continue" and the layout shifts to put "Pay" under their finger. It's not just a metric; it's a usability bug.`,
    hint: 'Reserve space; use transform not layout props',
  },
  {
    id: 93,
    category: 'performance',
    title: 'Bundle size — what to measure and reduce',
    difficulty: 'mid',
    answer: `**Step 1 — Measure.**

\`\`\`bash
# Webpack
npx webpack-bundle-analyzer dist/stats.json

# Vite
npx vite-bundle-visualizer

# Next.js
ANALYZE=true npm run build  # with @next/bundle-analyzer
\`\`\`

You'll see a treemap. Look for:
- Big libraries you barely use.
- Duplicates (same lib at multiple versions).
- Unminified content.
- Large polyfills for features you don't use.

**Common wins:**

1. **Replace big libs with smaller ones.**
   - \`moment\` (300KB) → \`date-fns\` or \`dayjs\` (~10KB).
   - \`lodash\` → \`lodash-es\` (tree-shakeable) or per-method: \`import debounce from 'lodash/debounce'\`.

2. **Tree-shake-friendly imports.**
\`\`\`js
// ❌ Imports the whole library
import _ from 'lodash';

// ✅ Only what you use
import debounce from 'lodash/debounce';

// ✅ Modern alternative
import { debounce } from 'lodash-es';
\`\`\`

3. **Code split per route** (see Q89).

4. **Dynamic import for big features** — charts, editors, admin panels.
\`\`\`js
const Chart = await import('./Chart');
\`\`\`

5. **Remove dev-only code in prod** with environment guards.

6. **Avoid duplicate dependencies** — \`npm ls react\` to find multiple versions.

7. **Polyfills only for browsers you support** — \`browserslist\` config controls Babel/SWC output.

**Targets to know:**
- < 100KB gzip = green.
- 100–300KB = audit.
- 300KB+ = red flag, especially on mobile.

**Senior insight:** "Bundle size is one input to Time to Interactive. Parse + execute time often dominates over download time, especially on low-end mobile."`,
    hint: 'Analyze, replace, split, tree-shake',
  },
  {
    id: 94,
    category: 'performance',
    title: 'Why is my search input laggy?',
    difficulty: 'mid',
    answer: `**Diagnosis:** Each keystroke triggers expensive work — filter, sort, re-render of large list.

**Step 1 — Profile.** Confirm the input itself is fast (it usually is). The lag is downstream.

**Step 2 — Decouple the input from the expensive work.**

**Option A — Debounce:**
\`\`\`jsx
const [query, setQuery] = useState('');
const debouncedQuery = useDebouncedValue(query, 300);

const filtered = useMemo(
  () => filter(items, debouncedQuery),
  [items, debouncedQuery]
);
\`\`\`

The input updates immediately; filtering waits 300ms after typing stops.

**Option B — useDeferredValue:**
\`\`\`jsx
const [query, setQuery] = useState('');
const deferredQuery = useDeferredValue(query);

const filtered = useMemo(
  () => filter(items, deferredQuery),
  [items, deferredQuery]
);
\`\`\`

React keeps the input render high-priority, defers the filtering.

**Step 3 — Reduce the work itself.**

- **Memoize the filter** so unchanged queries don't re-filter.
- **Pre-index** the data: instead of \`items.filter(i => i.name.includes(q))\`, build a trie or inverted index.
- **Lower the count** — paginate, virtualize, or only show top N matches.

**Step 4 — Memoize the list children.**

\`\`\`jsx
const Row = React.memo(({ item }) => <li>{item.name}</li>);
\`\`\`

Otherwise, every parent render re-renders every row.

**Step 5 — Virtualize** if 1000+ rows (Q90).

**Pitfall:** Wrapping the input itself in \`React.memo\` doesn't help — the input's parent is what's slow.`,
    hint: 'Debounce + memo filter + virtualize',
  },
  {
    id: 95,
    category: 'performance',
    title: 'Web Workers — when and how?',
    difficulty: 'senior',
    answer: `Web Workers run JS on a **separate thread**. The main thread stays free for UI, even during heavy computation.

**Use cases:**
- Image/video processing.
- Parsing large CSV/JSON files.
- Cryptography, hashing.
- Fuzzy search across large datasets.
- Compilers, formatters running in-browser (TS, Prettier).

**Setup:**

\`\`\`js
// worker.js
self.onmessage = (e) => {
  const result = expensiveCompute(e.data);
  self.postMessage(result);
};

// main.js
const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
worker.postMessage(input);
worker.onmessage = (e) => setResult(e.data);
\`\`\`

**Higher-level — \`comlink\`** lets you call worker methods like local async functions:

\`\`\`js
// worker.js
import * as Comlink from 'comlink';
Comlink.expose({ compute: (input) => ... });

// main.js
import * as Comlink from 'comlink';
const api = Comlink.wrap(new Worker(...));
const result = await api.compute(input); // looks like a normal async call
\`\`\`

**Trade-offs:**
- **Communication overhead** — \`postMessage\` clones data (structured clone). Big payloads = slow transfer. Use \`Transferable\` for buffers (\`ArrayBuffer\`, \`MessagePort\`) — zero-copy.
- **No DOM access** — workers can't touch the DOM. They're pure compute.
- **Bundling** — your build tool needs to handle workers (Vite does; Webpack 5+ does).

**Modern alternative:** \`useTransition\` / \`useDeferredValue\` for *responsive UI* under load. Workers for *true offload* of heavy compute.

**Don't reach for workers** when the work fits in a useTransition. Reach for them when the computation would block the main thread for 100ms+ even with scheduling tricks.`,
    hint: 'Separate thread for heavy compute',
  },
  {
    id: 96,
    category: 'performance',
    title: 'Image optimization checklist',
    difficulty: 'mid',
    answer: `Images are usually the largest payload on a page. The wins are big.

**1. Modern formats:** WebP saves ~30% over JPEG; AVIF saves ~50%. Provide both with fallbacks.

\`\`\`html
<picture>
  <source srcSet="hero.avif" type="image/avif" />
  <source srcSet="hero.webp" type="image/webp" />
  <img src="hero.jpg" alt="..." />
</picture>
\`\`\`

**2. Responsive sizing.** Don't ship a 4000px hero to a 375px phone.

\`\`\`html
<img
  src="hero-800.jpg"
  srcSet="hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1600px"
  alt="..."
/>
\`\`\`

**3. Lazy loading.** Below-the-fold images load on scroll.

\`\`\`html
<img src="..." loading="lazy" alt="..." />
\`\`\`

**Don't lazy-load LCP image** — defeats the purpose. Use \`loading="eager"\` and \`fetchpriority="high"\`.

**4. Specify dimensions** to prevent CLS.

\`\`\`html
<img src="..." width="800" height="600" alt="..." />
\`\`\`

**5. Compression.** \`squoosh.app\` for one-off optimization, or build-time tools (\`sharp\`, \`imagemin\`).

**6. CDN with on-the-fly resizing** — Cloudinary, ImageKit, Vercel Image Optimization. URL parameters request the right size; CDN caches.

**7. SVG for icons and simple graphics.** Tiny, scalable, no quality loss.

**8. Avoid:**
- Background images for above-the-fold critical content (no preload, no LCP candidate).
- Embedded base64 images > 4KB (kill caching, bloat HTML).

**In React frameworks:** Next.js \`<Image>\`, Astro \`<Image>\` handle most of this automatically — use them.`,
    hint: 'Format + size + lazy + dimensions',
  },

  // ─────────────────────────────────────────────────────────────────
  // Testing (8)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 97,
    category: 'testing',
    title: 'The testing pyramid — what to test where',
    difficulty: 'mid',
    answer: `Modern frontend testing pyramid:

\`\`\`
       ┌─────────────┐
       │     E2E     │   Playwright / Cypress (~5%)
       │             │   Real browser, real network
       ├─────────────┤
       │ Integration │   React Testing Library (~25%)
       │             │   Components + logic, mocked APIs
       ├─────────────┤
       │    Unit     │   Vitest / Jest (~70%)
       │             │   Pure functions, hooks, utilities
       └─────────────┘
\`\`\`

**Unit tests** — fast, isolated, lots of them.
- Pure functions (sorting, formatting, calculations).
- Custom hooks (with \`renderHook\`).
- Utility modules.
- Examples: \`debounce()\`, \`formatCurrency()\`, \`useDebouncedValue()\`.

**Integration tests** — components + their dependencies (mocked at the network layer).
- Form submits with validation.
- Conditional rendering based on state.
- User interactions across multiple components.

**E2E tests** — slow, expensive, but irreplaceable for critical flows.
- Login flow end-to-end.
- Checkout / payment.
- Multi-step wizards.
- Anything where browser quirks or third-party services matter.

**Senior signal — modernized take:**
- Less obsession with the pyramid shape, more with confidence-per-cost.
- "Trophy" model (Kent Dodds): heavy on integration, light on both ends.
- Frontend bugs cluster around integration — that's where the test budget pays off.

**What NOT to test:**
- Implementation details (which hook fires, internal state names).
- Third-party libraries (trust them).
- Trivial code (\`const add = (a, b) => a + b\` doesn't need a test).`,
    hint: 'Pyramid: 70/25/5 unit/integration/E2E',
  },
  {
    id: 98,
    category: 'testing',
    title: 'Test a controlled form with React Testing Library',
    difficulty: 'mid',
    answer: `\`\`\`jsx
function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return setError('Invalid email');
    onSubmit(email);
  };

  return (
    <form onSubmit={submit}>
      <label>Email <input value={email} onChange={e => setEmail(e.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Log in</button>
    </form>
  );
}
\`\`\`

**Test:**

\`\`\`jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

describe('LoginForm', () => {
  it('shows error for invalid email', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'invalid');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/invalid email/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid email', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(onSubmit).toHaveBeenCalledWith('ada@example.com');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
\`\`\`

**Why this is good:**
- **Query by role/label** — same as a screen reader. Decouples test from styling.
- **\`userEvent\`** — simulates real interactions (focus, keyboard).
- **No reaching into state** — tests user-visible behavior, not implementation.
- **\`queryBy*\` for absence** — \`getBy*\` throws on miss; query returns null.

**Pitfall:** Forgetting \`await\` on \`userEvent\` calls in v14+ — silent timing bugs.`,
    hint: 'Query by role + userEvent',
  },
  {
    id: 99,
    category: 'testing',
    title: 'How to mock fetch / network in tests?',
    difficulty: 'mid',
    answer: `**The wrong way — stubbing global fetch:**
\`\`\`jsx
global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({...}) }));
\`\`\`
Works for trivial cases, breaks the moment you switch to axios, GraphQL, or have multiple endpoints.

**The right way — MSW (Mock Service Worker):**

MSW intercepts at the network layer. Same handlers work for unit tests, integration tests, even Storybook and dev mode.

**Setup:**

\`\`\`js
// src/mocks/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([{ id: 1, name: 'Ada' }]);
  }),
  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 2, ...body }, { status: 201 });
  }),
];

// src/mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);

// vitest.setup.js
import { server } from './src/mocks/server';
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
\`\`\`

**In a test, override per-test:**

\`\`\`js
it('handles network error', async () => {
  server.use(
    http.get('/api/users', () => HttpResponse.error())
  );
  // ... assertions for error UI
});
\`\`\`

**Why MSW wins:**
- Works with any client (fetch, axios, urql, Apollo).
- Same mocks in tests AND dev mode (great for offline development).
- Tests stay close to real network behavior.
- No coupling to fetch internals.

**Alternative for E2E:** Playwright has \`page.route()\` for network mocking in real browsers.`,
    hint: 'MSW intercepts at network layer',
  },
  {
    id: 100,
    category: 'testing',
    title: 'Test a custom hook',
    difficulty: 'mid',
    answer: `Use \`renderHook\` from \`@testing-library/react\`. It wraps your hook in a host component and gives you \`result.current\` to inspect.

\`\`\`jsx
import { renderHook, act } from '@testing-library/react';

function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  return { count, increment, decrement };
}

describe('useCounter', () => {
  it('starts at initial value', () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it('increments', () => {
    const { result } = renderHook(() => useCounter());
    act(() => result.current.increment());
    expect(result.current.count).toBe(1);
  });

  it('reacts to prop changes', () => {
    const { result, rerender } = renderHook(
      ({ start }) => useCounter(start),
      { initialProps: { start: 0 } }
    );
    rerender({ start: 100 });
    // useCounter only uses initial on mount — count stays 0
    expect(result.current.count).toBe(0);
  });
});
\`\`\`

**\`act()\` is required** when triggering updates from outside React. It flushes pending state updates before assertions.

**For hooks that depend on context or other providers:**

\`\`\`jsx
const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

const { result } = renderHook(() => useMyHook(), { wrapper });
\`\`\`

**For async hooks:**

\`\`\`jsx
import { waitFor } from '@testing-library/react';

const { result } = renderHook(() => useAsyncData());
await waitFor(() => expect(result.current.data).toBeDefined());
\`\`\`

**Don't test implementation:** Test what the hook returns and how it changes — not which other hooks it calls internally.`,
    hint: 'renderHook + act',
  },
  {
    id: 101,
    category: 'testing',
    title: 'When to use snapshot tests?',
    difficulty: 'mid',
    answer: `Snapshot tests serialize a component's output and compare against a saved file. They're **controversial** — useful in narrow cases, harmful when overused.

**When they help:**
- Highly visual / structural output that's hard to assert manually (markdown→HTML transformer, AST output).
- Catching unexpected regressions in stable components.
- Generated data (configuration, API responses).

**When they hurt:**
- Whole-component snapshots — every styling tweak breaks them.
- Snapshots become noise; team starts blindly running \`-u\` to update them.
- Tests pass but don't actually verify *intent* — just that nothing changed.

**Better alternative — explicit assertions:**

\`\`\`jsx
// ❌ Snapshot — fragile, intent unclear
expect(container).toMatchSnapshot();

// ✅ Explicit — captures intent
expect(screen.getByRole('heading')).toHaveTextContent('Welcome');
expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled();
\`\`\`

**If you do use snapshots:**
- Keep them small and focused (\`toMatchInlineSnapshot\` keeps them in the test file).
- Snapshot specific values, not entire trees.
- Always read diffs carefully when they fail. "Update snapshot" should be a deliberate decision, not a reflex.

**Visual regression** is different — Percy, Chromatic, Playwright screenshots compare actual rendered images. More valuable than DOM snapshots for catching visual regressions.

**Senior signal:** "I avoid full-component snapshots. They tend to test 'this output' instead of 'this behavior' — which means trivial changes break them and meaningful regressions slip through."`,
    hint: 'Use sparingly; explicit assertions usually win',
  },
  {
    id: 102,
    category: 'testing',
    title: 'E2E with Playwright — basics',
    difficulty: 'mid',
    answer: `Playwright runs real browsers and tests user flows end-to-end.

\`\`\`js
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
});
\`\`\`

**Key features:**
- **Auto-wait** — \`click\` waits for element to be ready. No \`sleep(500)\` calls.
- **Multiple browsers** — runs against Chromium, Firefox, WebKit (and mobile emulation).
- **Trace viewer** — every test step recorded; replay failed runs with screenshots.
- **Codegen** — \`playwright codegen <url>\` records your interactions and generates test code.

**Network mocking:**
\`\`\`js
await page.route('**/api/users', route => {
  route.fulfill({ status: 200, body: JSON.stringify([...]) });
});
\`\`\`

**Best practices:**
- **Use semantic locators**: \`getByRole\`, \`getByLabel\`, \`getByText\`. Avoid CSS selectors when possible.
- **Don't stub the entire backend** — E2E should hit a real test environment to catch integration issues.
- **Set up test data** through API calls, not UI — fast, reliable.
- **Run in parallel** — Playwright defaults to it. Make tests independent.
- **CI:** Run headless on a stable agent. Save traces on failure.

**E2E budget rule:** A few high-value flows (login, checkout, signup), not coverage by E2E. Each E2E test costs ~10× a unit test in flakiness, run time, and maintenance.`,
    hint: 'Real browser, semantic locators, auto-wait',
  },
  {
    id: 103,
    category: 'testing',
    title: 'Why does my test pass locally but fail in CI?',
    difficulty: 'mid',
    answer: `Classic frustrations and their causes:

**1. Timing / race conditions.**
- Local machine is fast; CI agent is slow → \`waitFor\` timeouts.
- Fix: increase timeouts for CI; eliminate \`setTimeout\` in tests; prefer \`findBy*\` (auto-retries) over \`getBy*\` + manual wait.

**2. Test isolation.**
- Tests share state (DB, localStorage, module cache).
- One test polluted state; subsequent tests fail in unexpected order.
- Fix: \`beforeEach\` cleanup; reset MSW handlers; clear localStorage; use independent test data.

**3. Time / timezone.**
- Local: PST. CI: UTC. Test that compares formatted dates fails.
- Fix: \`vi.useFakeTimers()\` with a fixed instant; use UTC-aware formatters.

\`\`\`js
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
});
\`\`\`

**4. Random data.**
- \`Math.random()\`, \`crypto.randomUUID()\` produce different output each run.
- Fix: stub them, or use deterministic seeds.

**5. Snapshot mismatches across OS/Node versions.**
- Different line endings, JSON formatting, error stacks.
- Fix: pin Node version with \`.nvmrc\`; check git config for line endings (\`core.autocrlf\`).

**6. Parallelism / concurrency.**
- Local runs serial; CI runs parallel. Tests using same DB/file collide.
- Fix: per-worker isolation; unique resource keys.

**7. Missing env vars / secrets.**
- Local has \`.env\`; CI doesn't.
- Fix: configure CI secrets; have tests provide their own values.

**Debugging:**
- Run CI command locally exactly: \`CI=true npm test\`.
- \`act\` runs CI locally for GitHub Actions.
- Save trace files on failure (Playwright does this).

**Senior signal:** Recognizing the pattern fast. "Failing only on CI — let me check timing first, then env, then isolation."`,
    hint: 'Timing, isolation, time, env',
  },
  {
    id: 104,
    category: 'testing',
    title: 'What should you actually NOT test?',
    difficulty: 'mid',
    answer: `**Don't test:**

**1. Implementation details.**
\`\`\`jsx
// ❌ Testing internal state name
expect(component.state.isOpen).toBe(true);

// ✅ Testing user-visible behavior
expect(screen.getByRole('dialog')).toBeVisible();
\`\`\`

If a refactor changes the implementation but not the behavior, the test should still pass. Otherwise the test is locking you into a specific implementation.

**2. Third-party libraries.**
\`\`\`jsx
// ❌ Re-testing react-router
expect(useNavigate).toHaveBeenCalledWith('/home');

// ✅ Test your wrapper logic, trust the library
expect(window.location.pathname).toBe('/home'); // or check page change
\`\`\`

**3. Trivial code.**
\`\`\`js
// ❌ No bugs hide here
const add = (a, b) => a + b;
test('add', () => expect(add(1, 2)).toBe(3));
\`\`\`

If a function is so simple a bug couldn't hide, the test is overhead.

**4. Type signatures.**
- TypeScript catches these.
- Don't write runtime tests that just check argument shapes.

**5. Internal helper functions.**
- Test the public API of a module.
- If a helper deserves its own test, refactor it into its own module with a public API.

**6. Specific text content** in heavily edited copy.
- Marketing changes wording → tests break for no real reason.
- Use stable selectors (\`data-testid\` for text-volatile elements, role-based for stable ones).

**7. Animations and timings exactly.**
- "Waits 300ms" tests are flaky and brittle.
- Test the *outcome* (the modal opened), not the *transition*.

**The principle:** Tests should give you confidence that the system works. They should not become a tax on every refactor.`,
    hint: 'Behavior over implementation; skip trivial',
  },

  // ─────────────────────────────────────────────────────────────────
  // Debugging (8)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 105,
    category: 'debugging',
    title: 'How would you debug a memory leak in a React app?',
    difficulty: 'senior',
    answer: `**Symptoms:** Memory grows over time, app slows, eventually crashes.

**Step 1 — Reproduce reliably.** Find the action that grows memory (e.g., open/close a modal 50 times, navigate routes back and forth).

**Step 2 — Heap snapshots.**
- Chrome DevTools → Memory → Take heap snapshot.
- Perform the leaky action.
- Take another snapshot.
- Compare → look at retained size growth.

**Step 3 — Find the orphans.**
- Filter snapshot by \`Detached HTMLDivElement\` or \`Detached <component>\` — should be near zero. If you see thousands, you've got DOM/component instances kept alive by something.
- Click an instance → see "Retainers" panel → trace what's holding the reference.

**Common culprits in React:**

1. **Missing useEffect cleanup:**
\`\`\`jsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  // ❌ no cleanup → leaks every re-render and unmount
});
\`\`\`

2. **Event listeners on window/document not removed:**
\`\`\`jsx
useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
\`\`\`

3. **Subscriptions (WebSocket, EventSource, observables):**
\`\`\`jsx
useEffect(() => {
  const ws = new WebSocket(url);
  return () => ws.close();
}, [url]);
\`\`\`

4. **Closures capturing large objects** — a \`useCallback\` that closes over the entire dataset, then gets attached to a global event.

5. **Context value never garbage collected** — keeping references to old props/components.

**Tools:**
- React DevTools → "Highlight updates" — find rerender storms.
- Chrome Performance Monitor (DevTools → \`...\` → Performance Monitor) — live JS heap size graph.

**Validation:** After fix, repeat the leaky action 100x; heap should level off, not grow.`,
    hint: 'Heap snapshots + missing cleanup',
  },
  {
    id: 106,
    category: 'debugging',
    title: 'Race condition in async useEffect',
    difficulty: 'mid',
    answer: `**The bug:** A second fetch resolves before the first; the first overwrites the second's data.

\`\`\`jsx
useEffect(() => {
  fetchUser(id).then(setUser); // 🚩 race condition
}, [id]);
\`\`\`

If \`id\` changes from 1 to 2 quickly, both requests fire. If request 1 resolves *after* request 2, you display user 1's data while \`id === 2\`.

**Fix 1 — cancellation flag:**

\`\`\`jsx
useEffect(() => {
  let cancelled = false;
  fetchUser(id).then(data => {
    if (!cancelled) setUser(data);
  });
  return () => { cancelled = true; };
}, [id]);
\`\`\`

**Fix 2 — AbortController** (preferred):

\`\`\`jsx
useEffect(() => {
  const ctrl = new AbortController();
  fetchUser(id, { signal: ctrl.signal })
    .then(setUser)
    .catch(err => {
      if (err.name !== 'AbortError') throw err;
    });
  return () => ctrl.abort();
}, [id]);
\`\`\`

This actually cancels the in-flight request, saving bandwidth too.

**Fix 3 — request ID:**

\`\`\`jsx
const requestId = useRef(0);

useEffect(() => {
  const myId = ++requestId.current;
  fetchUser(id).then(data => {
    if (myId === requestId.current) setUser(data);
  });
}, [id]);
\`\`\`

**Fix 4 — use React Query or SWR.** They handle cancellation and request ordering for you.

**The general lesson:** Any async work in an effect needs to know "is this still the latest request?" — via cleanup, AbortController, or library.`,
    hint: 'Cancel old requests on dep change',
  },
  {
    id: 107,
    category: 'debugging',
    title: 'Infinite render loop — diagnose and fix',
    difficulty: 'mid',
    answer: `**Symptom:** "Maximum update depth exceeded" warning. Component renders thousands of times.

**Causes:**

**1. setState in render body:**
\`\`\`jsx
function Bad() {
  const [n, setN] = useState(0);
  setN(n + 1); // 🚩 each render schedules another
  return <div>{n}</div>;
}
\`\`\`
Fix: setState belongs in event handlers or effects, not directly in render.

**2. Effect updates state used in its own deps:**
\`\`\`jsx
useEffect(() => {
  setItems([...items, fetched]);
}, [items]); // 🚩 setItems → items changes → effect runs → setItems
\`\`\`
Fix: use the updater form and remove from deps:
\`\`\`jsx
useEffect(() => {
  setItems(prev => [...prev, fetched]);
}, [fetched]);
\`\`\`

**3. New object/function in deps every render:**
\`\`\`jsx
const config = { retry: 3 };
useEffect(() => fetch(url, config), [url, config]); // 🚩 config new each render
\`\`\`
Fix: \`useMemo\` or destructure:
\`\`\`jsx
const config = useMemo(() => ({ retry: 3 }), []);
\`\`\`

**4. Unstable child component triggering parent state:**
\`\`\`jsx
function Parent() {
  const [n, setN] = useState(0);
  return <Child onMount={() => setN(n + 1)} />;
}

function Child({ onMount }) {
  useEffect(() => onMount(), []); // 🚩 every parent render = new onMount
}
\`\`\`
Fix: \`useCallback\`, lift state, or rethink whether onMount-triggers-setState is even right.

**Debugging:**
- Look at the React error stack — the topmost component is usually the culprit.
- React DevTools Profiler → record. The component will appear hundreds of times in the flame graph.
- Add \`console.log('render', componentName)\` and watch the console flood.

**Mental model:** Rendering should be a *consequence* of input changes, not a *cause* of them.`,
    hint: 'setState in render OR unstable deps',
  },
  {
    id: 108,
    category: 'debugging',
    title: 'Stale closure — what is it and how to fix?',
    difficulty: 'mid',
    answer: `**A function captures a variable from an outer scope at definition time. The variable later changes, but the function still references the old value.**

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // 🚩 always 0
    }, 1000);
    return () => clearInterval(id);
  }, []); // empty deps — effect never re-runs, count stays 0 in closure

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\`

The interval callback was created when \`count === 0\`. It captures that 0 forever. Even though \`count\` updates and the component re-renders, the interval keeps logging 0.

**Fix 1 — re-create the effect on dep change:**

\`\`\`jsx
useEffect(() => {
  const id = setInterval(() => console.log(count), 1000);
  return () => clearInterval(id);
}, [count]); // re-runs, captures new count — but tears down + rebuilds interval
\`\`\`

**Fix 2 — updater form (when you only need to derive new state):**

\`\`\`jsx
useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + 1); // c is always latest
  }, 1000);
  return () => clearInterval(id);
}, []);
\`\`\`

**Fix 3 — ref for "always read latest":**

\`\`\`jsx
const countRef = useRef(count);
useEffect(() => { countRef.current = count; });

useEffect(() => {
  const id = setInterval(() => console.log(countRef.current), 1000);
  return () => clearInterval(id);
}, []);
\`\`\`

**Common places stale closures bite:**
- Event listeners attached once.
- \`setInterval\` / \`setTimeout\` callbacks.
- WebSocket message handlers.
- Effect cleanup functions running with old values (intentional — be aware).`,
    hint: 'Captured variable doesn\'t update',
  },
  {
    id: 109,
    category: 'debugging',
    title: 'Component renders 5 times when it should render once',
    difficulty: 'mid',
    answer: `**Step 1 — Confirm with the React DevTools Profiler.** Record an interaction; each render shows the *reason*:
- "Hooks changed"
- "Props changed"
- "Parent re-rendered"
- "Context changed"

**Each reason has a different fix:**

**1. "Hooks changed" — internal state firing extra:**
- A \`useEffect\` triggers \`setState\`, which triggers another effect, etc.
- Trace the chain. Combine state into one or guard the update.

**2. "Props changed" — but they shouldn't:**
- Inline object/function from parent: \`<Child config={{ x: 1 }} />\`
- Fix: stabilize with \`useMemo\` / \`useCallback\` or move construction up.

**3. "Parent re-rendered":**
- Parent re-rendering for any reason re-renders this child unless memoized.
- Fix 1: \`React.memo\` on the child (only helps if props are stable — see #2).
- Fix 2: lift state down — keep volatile state in a smaller component.
- Fix 3: split the parent — pass children as a prop (children don't re-render when parent state changes).

**4. "Context changed":**
- Any subscriber re-renders when context value changes.
- Fix: split contexts by frequency; memoize value; switch to Zustand for granular subscriptions.

**Common surprise — StrictMode in dev:**
Renders are doubled in development. Profile a production build to see real counts.

**The "split components" trick:**

\`\`\`jsx
// ❌ Header re-renders every keystroke
function App() {
  const [search, setSearch] = useState('');
  return (
    <>
      <Header />
      <Input value={search} onChange={setSearch} />
      <List query={search} />
    </>
  );
}

// ✅ Move state down — Header is stable
function App() {
  return (
    <>
      <Header />
      <SearchAndList />
    </>
  );
}
\`\`\``,
    hint: 'Profiler tells you why; fix per cause',
  },
  {
    id: 110,
    category: 'debugging',
    title: 'How to debug "Cannot update a component while rendering a different component"',
    difficulty: 'mid',
    answer: `**The error means:** Component A is rendering, and during its render, it triggers a state update on component B. React forbids this — it'd cause cascading renders mid-render.

**Common cause — derived state synced via setState in render:**

\`\`\`jsx
function Bad({ value }) {
  const [doubled, setDoubled] = useState(0);
  setDoubled(value * 2); // 🚩 in render
  return <div>{doubled}</div>;
}
\`\`\`

**Fix 1 — derive in render, no state:**
\`\`\`jsx
function Good({ value }) {
  const doubled = value * 2; // just compute it
  return <div>{doubled}</div>;
}
\`\`\`

**Fix 2 — useEffect if you really need state:**
\`\`\`jsx
useEffect(() => {
  setDoubled(value * 2);
}, [value]);
\`\`\`
But this causes an extra render. If you can derive, derive.

**Other common triggers:**

**Calling a parent's setter inside a child's render:**
\`\`\`jsx
function Child({ onMount }) {
  onMount(); // 🚩 if onMount calls parent's setState
}
\`\`\`
Fix: move into useEffect.

**Reading a context that updates as a side effect of reading:**
\`\`\`jsx
const value = useMyHook(); // hook calls setState somewhere
\`\`\`
Fix: hook should defer the setState into useEffect.

**Mental model:** Render must be **pure** — no observable side effects. Anything that mutates state, refs, or external stores belongs in event handlers or effects.

**Stack trace tip:** The error tells you both components — A (currently rendering) and B (being updated). Look at A's render code; the line calling B's setter is the bug.`,
    hint: 'setState in render → effects or derive',
  },
  {
    id: 111,
    category: 'debugging',
    title: 'Why does my CSS have specificity wars?',
    difficulty: 'mid',
    answer: `**CSS specificity** ranks selectors. When two rules target the same element, the more specific one wins.

**Specificity score (left to right):**
1. Inline style (\`style="..."\`) — 1000
2. ID selectors (\`#id\`) — 100 each
3. Classes / attributes / pseudo-classes (\`.cls\`, \`[type=text]\`, \`:hover\`) — 10 each
4. Element / pseudo-element (\`div\`, \`::before\`) — 1 each

\`\`\`css
.btn { color: blue; }                 /* 10 */
.btn.primary { color: red; }          /* 20 */
#submit.btn { color: green; }         /* 110 */
button#submit.btn:hover { color: ... } /* 121 */
\`\`\`

**The "specificity war" pattern:**
- Component declares \`.btn { color: blue }\`.
- Override needed → \`.parent .btn { color: red }\` (20 > 10, wins).
- Another override → \`#wrapper .parent .btn { color: green }\` (120, wins).
- Eventually you have \`!important\` everywhere and nothing makes sense.

**Fixes:**

**1. Use low-specificity selectors consistently.**
- One class per component, period.
- BEM (\`.btn--primary\`) keeps everything at 10–20.
- CSS Modules / scoped styles eliminate cross-file specificity issues.

**2. Use \`@layer\` (modern CSS):**
\`\`\`css
@layer base, components, utilities;

@layer components {
  .btn { color: blue; }
}
@layer utilities {
  .text-red { color: red; } /* always wins over components, regardless of specificity */
}
\`\`\`
Layer order > specificity. Solves the war structurally.

**3. Tailwind / atomic CSS** sidesteps it — single utility class per property.

**4. \`:where()\` for zero-specificity selectors:**
\`\`\`css
:where(.btn) { color: blue; } /* specificity 0, easy to override */
\`\`\`

**Debug:** DevTools → element → Computed tab shows which rules apply and which won. Strikethrough = overridden.`,
    hint: 'Specificity scores; @layer or single class',
  },
  {
    id: 112,
    category: 'debugging',
    title: 'Source maps in production — should you ship them?',
    difficulty: 'mid',
    answer: `**Source maps** translate minified production code back to original sources for debugging.

\`\`\`js
// minified.js
var t=function(e){return e+1};
//# sourceMappingURL=minified.js.map
\`\`\`

**Should you ship them?** Trade-offs:

**Pro — ship them publicly:**
- Real errors in production are debuggable. Stack traces from Sentry/etc. point to your real source.
- Browser DevTools "Pause on exceptions" works.

**Con — security:**
- Anyone can read your unminified source.
- Comments, business logic, internal API patterns are visible.
- For sensitive enterprise code, this matters.

**Compromise — separate source maps from public deploy:**
- Build emits source maps.
- Upload to error monitoring service (Sentry, Datadog, Rollbar) at deploy time.
- Don't deploy \`.map\` files to public CDN.
- Errors get symbolicated server-side; users can't access the maps.

\`\`\`bash
# Sentry CLI example
sentry-cli sourcemaps upload --release=v1.2.3 ./dist
\`\`\`

**Webpack / Vite config:**

\`\`\`js
// vite.config.js
export default {
  build: {
    sourcemap: true, // 'hidden' to generate but not link
  },
};
\`\`\`

\`hidden\` mode generates the maps without the \`//# sourceMappingURL\` comment, so they exist for upload but browsers don't fetch them.

**Don't:**
- Strip stack traces or obfuscate beyond minification — kills your debugging entirely.
- Ship \`source-map\` instead of \`source-map-cheap\` in dev — slower for no benefit.

**Senior signal:** "We ship source maps to Sentry but not the public bundle. Engineers can debug real production errors; the source itself isn't browsable."`,
    hint: 'Yes for monitoring, hidden for security',
  },

  // ─────────────────────────────────────────────────────────────────
  // Networking & HTTP (8)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 113,
    category: 'networking',
    title: 'HTTP status codes — the ones you must know',
    difficulty: 'junior',
    answer: `**2xx — Success:**
- **200 OK** — generic success.
- **201 Created** — POST that created a resource. Should include \`Location\` header.
- **204 No Content** — success with nothing to return (DELETE, some PATCH).

**3xx — Redirection:**
- **301 Moved Permanently** — old URL is dead, search engines update.
- **302 Found** — temporary redirect, less specific.
- **304 Not Modified** — cached version is current; conditional request response.
- **307 / 308** — like 302/301 but preserve method (don't downgrade POST to GET).

**4xx — Client error:**
- **400 Bad Request** — malformed request; client sent invalid data.
- **401 Unauthorized** — "I don't know who you are" (no/bad credentials). Despite the name, it's about authentication.
- **403 Forbidden** — "I know who you are; you can't do this." Authorization failure.
- **404 Not Found** — resource doesn't exist.
- **409 Conflict** — state conflict (duplicate resource, version mismatch).
- **422 Unprocessable Entity** — semantically invalid (validation failure).
- **429 Too Many Requests** — rate limited.

**5xx — Server error:**
- **500 Internal Server Error** — generic server failure.
- **502 Bad Gateway** — upstream service unreachable.
- **503 Service Unavailable** — server overloaded or down for maintenance.
- **504 Gateway Timeout** — upstream timed out.

**The 401 vs 403 trap:** Confusing them in interviews signals junior.
- 401 = authentication problem (re-login).
- 403 = authorization problem (you're logged in, just not allowed).`,
    hint: 'Memorize 401 vs 403',
  },
  {
    id: 114,
    category: 'networking',
    title: 'CORS — explain it and how to fix common errors',
    difficulty: 'mid',
    answer: `**Same-Origin Policy:** Browsers block cross-origin requests by default. CORS is the mechanism for servers to **opt in** to allowing them.

**Origin = scheme + host + port** (\`https://example.com:443\`). Different on any of those = cross-origin.

**Simple requests** (GET, HEAD, POST with simple Content-Type) — browser sends with \`Origin\` header; server replies with \`Access-Control-Allow-Origin\`. Browser accepts the response if the header matches.

**Preflight (OPTIONS) requests** — for "non-simple" requests (custom headers, methods like PUT/DELETE, JSON Content-Type), browser sends OPTIONS first to ask permission. Server replies with allowed origins, methods, headers. Only then does the real request go.

**Common errors:**

**"No 'Access-Control-Allow-Origin' header is present"**
- Server didn't send the CORS header. Fix: server config must add it.
- For \`fetch\` with \`credentials: 'include'\`, the header **cannot be \`*\`** — must be specific origin.

**"Method PATCH is not allowed by Access-Control-Allow-Methods"**
- Preflight rejected the method. Server needs to add it to allowed methods.

**"Request header field x-custom-header is not allowed by Access-Control-Allow-Headers"**
- Custom header rejected by preflight.

**"Credentials flag is true but the 'Access-Control-Allow-Credentials' header is empty"**
- For credentialed requests, server must send \`Access-Control-Allow-Credentials: true\`.

**The wrong fixes:**
- ❌ Disabling CORS in browser flags — only "works" locally; production users still hit it.
- ❌ Adding random headers client-side — won't bypass it.
- ❌ Using a proxy in production "to avoid CORS" — sometimes legitimate (your own backend forwards), but often masking bad architecture.

**The right fix:** Configure the server (or API gateway, or CDN) to allow the origin. CORS is enforced by the **browser**, set by the **server**.`,
    hint: 'Browser blocks; server opts in',
  },
  {
    id: 115,
    category: 'networking',
    title: 'Cookies vs localStorage for auth tokens',
    difficulty: 'mid',
    answer: `**Cookies (with proper flags) — best for auth tokens.**

\`\`\`
Set-Cookie: token=abc123;
            HttpOnly;        # JS can't read it (XSS-resistant)
            Secure;          # Only sent over HTTPS
            SameSite=Strict; # Not sent on cross-site requests (CSRF protection)
            Path=/;
            Max-Age=3600;
\`\`\`

**Pros:**
- **HttpOnly** — JS can't read it. XSS attacks can't steal it.
- Automatically sent with every request to the origin (no client code needed).
- **SameSite** flag prevents CSRF (mostly).

**Cons:**
- Sent on every request (slightly bigger requests).
- Cross-origin requires CORS \`credentials\` setup.
- Can't be read or modified by JS — also a feature, but means client can't introspect.

**localStorage / sessionStorage:**

**Pros:**
- Simple to use from JS.
- Survives across tabs (localStorage) or per-tab (sessionStorage).

**Cons:**
- **Readable by any JS on the origin.** XSS = full token compromise.
- Not sent automatically — your fetch must add \`Authorization\` header.
- No automatic expiry mechanism.

**Modern best practice:**
- **Refresh token** in HttpOnly cookie (long-lived, never touched by JS).
- **Access token** in memory (short-lived, sent in \`Authorization\` header).
- On expiry, exchange refresh token for new access token via cookie-authenticated endpoint.

**Why in-memory for access tokens?** XSS can read JS variables, but only briefly — the user closes the tab, the token is gone. Refresh token (the long-lived one) stays safe in HttpOnly cookie.

**Don't:**
- Store tokens in URL params (logged everywhere).
- Use \`localStorage\` for any sensitive data on apps with third-party scripts.`,
    hint: 'HttpOnly cookies > localStorage',
  },
  {
    id: 116,
    category: 'networking',
    title: 'Cache-Control headers explained',
    difficulty: 'mid',
    answer: `Controls how browsers and CDNs cache responses.

**\`Cache-Control: public, max-age=3600\`**
- Cacheable by anyone (browser + CDN).
- Considered fresh for 3600 seconds.
- Within max-age, cache serves directly without contacting origin.

**\`Cache-Control: private, max-age=60\`**
- Only browser caches it (not shared CDNs). For per-user content.

**\`Cache-Control: no-cache\`**
- **NOT** "don't cache." Means "always revalidate before using."
- Cache stores it; on next request, sends \`If-None-Match\`/\`If-Modified-Since\`. Server returns 304 if still good.

**\`Cache-Control: no-store\`**
- Truly "don't cache anywhere." For sensitive data (banking, health).

**\`Cache-Control: immutable\`**
- "Never check; this URL never changes." For hashed assets (\`app.a3f9c.js\`).
- Skips even revalidation. Best for static assets with content-hash filenames.

**\`Cache-Control: stale-while-revalidate=60\`**
- Serve stale up to 60s while fetching fresh in background.
- Best UX for mostly-static content with occasional updates.

**\`s-maxage\`** — overrides max-age for shared caches (CDNs only):
\`\`\`
Cache-Control: max-age=60, s-maxage=3600
\`\`\`
Browser caches 1 minute; CDN caches 1 hour.

**ETag / If-None-Match:**

\`\`\`
# Response
ETag: "abc123"

# Next request
If-None-Match: "abc123"

# Server response
304 Not Modified  (no body — saves bandwidth)
\`\`\`

**Practical patterns:**

| Asset type | Strategy |
|---|---|
| Hashed JS/CSS (\`app.a3f9c.js\`) | \`max-age=31536000, immutable\` |
| HTML | \`no-cache\` (always revalidate; can update without renaming) |
| API JSON | Depends — \`max-age=60\` for slow-moving, \`no-store\` for personal |
| Images | \`max-age=2592000\` (30 days) |`,
    hint: 'no-cache = revalidate; no-store = never cache',
  },
  {
    id: 117,
    category: 'networking',
    title: 'REST vs GraphQL — when to choose which',
    difficulty: 'mid',
    answer: `**REST:**
- Resources at URLs, HTTP verbs (\`GET /users/1\`).
- One endpoint per resource type.
- Pros: HTTP-native (caching with Cache-Control just works), simple, ubiquitous tooling.
- Cons: Over-fetching (server returns fields you don't need), under-fetching (multiple round trips for related data).

**GraphQL:**
- Single endpoint (\`POST /graphql\`).
- Client specifies exactly what fields to return.
- One query can fetch nested related data in a single request.
- Pros: No over/under-fetching; type-safe; introspectable schema.
- Cons: Caching is harder (POST requests); error handling per field; query complexity attacks.

**When to pick each:**

**REST shines:**
- Public APIs (broadest consumer compatibility).
- Resource-centric models (CRUD-heavy).
- Need HTTP caching at edges (CDN-cacheable GETs).
- Small team, simple needs.

**GraphQL shines:**
- Mobile clients with bandwidth constraints (precise queries).
- Many UI variants needing different field subsets.
- Aggregating from multiple data sources behind one façade.
- Frontend teams shipping fast without backend round-trips per UI change.

**Modern hybrids:**
- **tRPC** — type-safe RPC, feels like calling functions. JS-only.
- **REST + sparse fieldsets** (\`?fields=id,name\`) — REST with GraphQL-like field selection.
- **JSON:API spec** — standardized REST with relationships.

**Honest interview answer:** "I've used both. GraphQL is great when the frontend has diverse needs and we own the backend. For simple CRUD or public APIs, REST's caching story and simpler tooling usually win."

**Don't:** Pick GraphQL because it's "modern" — the operational complexity (auth per resolver, N+1 query risks, caching) is real.`,
    hint: 'REST = simple + cached; GraphQL = flexible queries',
  },
  {
    id: 118,
    category: 'networking',
    title: 'WebSocket vs Server-Sent Events vs long polling',
    difficulty: 'mid',
    answer: `Three ways to push server updates to a client.

**WebSocket (WS):**
- **Bidirectional**, full-duplex over a single TCP connection.
- Use when client AND server send messages frequently (chat, multiplayer games, collaborative editing).
- Most flexibility, most complexity (heartbeats, reconnection, scaling).

\`\`\`js
const ws = new WebSocket('wss://example.com');
ws.onmessage = (e) => console.log(e.data);
ws.send(JSON.stringify({ type: 'subscribe', channel: 'updates' }));
\`\`\`

**Server-Sent Events (SSE):**
- **One-way** server-to-client over HTTP.
- Auto-reconnects, simple text format.
- Use when only the server pushes (notifications, dashboards, live feeds).
- Simpler than WS; no special protocol — just a long-lived HTTP response.

\`\`\`js
const sse = new EventSource('/api/events');
sse.onmessage = (e) => console.log(e.data);
\`\`\`

**Long polling:**
- Client sends request; server holds it open until new data; client immediately re-requests.
- Fallback for environments where WS/SSE are blocked (corporate proxies).
- Higher latency, more overhead than the alternatives.

**When to pick each:**

| Need | Use |
|---|---|
| Chat, collab editing | WebSocket |
| Server-only notifications, dashboards | SSE |
| Compatibility with strict proxies | Long polling |
| Rare updates | Polling on a timer |

**Operational gotchas:**
- **WS at scale** — sticky sessions or pub/sub backbone (Redis, NATS); reconnect logic; heartbeats to detect zombie connections.
- **SSE through nginx** — disable buffering (\`X-Accel-Buffering: no\`).
- **HTTP/2 + SSE** — connection limit per origin lifted (HTTP/1 had 6).

**Modern abstraction layers:** Pusher, Ably, Supabase Realtime — handle the operational pain. Worth the cost for most apps.`,
    hint: 'WS = bidirectional; SSE = one-way push',
  },
  {
    id: 119,
    category: 'networking',
    title: 'CSRF — what is it and how do you prevent it?',
    difficulty: 'mid',
    answer: `**CSRF (Cross-Site Request Forgery):** Attacker tricks a user's browser into making a state-changing request to a site where they're authenticated.

**Classic attack:**
1. User logs into bank.com (browser stores auth cookie).
2. User visits attacker's site (still in same browser).
3. Attacker's page submits a form to \`bank.com/transfer\` — browser auto-attaches bank's cookie.
4. Bank server sees authenticated request from user → executes transfer.

**Prevention strategies:**

**1. SameSite cookie attribute** (modern default):
\`\`\`
Set-Cookie: session=abc; SameSite=Lax
\`\`\`
- \`Strict\` — never sent on cross-site requests. Most secure; breaks following links from other sites.
- \`Lax\` — sent on top-level navigations (GET), not on cross-site POSTs. Sensible default.
- \`None\` — sent always (requires Secure flag). Needed for legitimate cross-site auth (embeds, SaaS).

Browsers default to \`Lax\` if unspecified — significant CSRF protection out of the box.

**2. CSRF tokens:**
- Server includes a random token in forms / response headers.
- Client must echo it back on state-changing requests.
- Attacker's site can't read the token (Same-Origin Policy).

**3. Custom request headers:**
- \`X-Requested-With: XMLHttpRequest\` — simple requests don't include custom headers without preflight.
- An attacker's HTML form can't send arbitrary headers; \`fetch\` from a different origin triggers CORS.

**4. Origin / Referer header check:**
- Server validates the \`Origin\` header matches expected.
- Less robust (browsers may strip Referer), but layered defense.

**Don't:**
- Rely on the request method alone — GET endpoints that modify state are vulnerable.
- Use only "secret in URL" — leaks via Referer, browser history, server logs.

**Modern stack:**
- HttpOnly + SameSite=Lax cookies + CSRF tokens for sensitive state changes.
- For SPAs using \`Authorization: Bearer\` headers (not cookies), CSRF is largely moot — the token must be explicitly attached, attacker's site can't forge that.`,
    hint: 'SameSite cookies + CSRF tokens',
  },
  {
    id: 120,
    category: 'networking',
    title: '"Failed to fetch" — diagnostic ladder',
    difficulty: 'mid',
    answer: `Generic \`Failed to fetch\` in DevTools. Walk through systematically:

**1. Network tab — does the request appear?**
- **Not visible** → blocked before sending:
  - CORS preflight failure.
  - Mixed content (HTTPS page → HTTP API blocked).
  - Browser extension blocking.
  - Service worker intercepting and failing.
- **Visible with status 0 / red** → network-level failure → next step.

**2. Console — is there a CORS error?**
- "blocked by CORS policy" → server config issue.
- Common: \`Access-Control-Allow-Origin\` mismatch, missing \`credentials\` allow, OPTIONS preflight rejected.
- See Q114 for fixes.

**3. Mixed content?**
- HTTPS page calling HTTP API → silently blocked in modern browsers.
- Fix: serve API over HTTPS, or proxy through your own backend.

**4. DNS / network failure?**
- Try the URL in a new browser tab. If that fails too, the API is down or unreachable.
- Could be your VPN, corporate proxy, ISP, or the actual server.

**5. Aborted by your code?**
- AbortController triggered.
- React: cleanup ran (unmount, dependency change).
- Check \`err.name === 'AbortError'\` and handle gracefully.

**6. Service worker hijacking the request?**
- Look at "Initiator" column in Network tab. If it's a SW, check the SW logic.
- DevTools → Application → Service Workers → unregister to test.

**7. Request actually sent but server unreachable?**
- DevTools "Timing" tab on a failed request — does it show DNS resolution? Connection?
- \`curl\` the same URL from terminal — does it reach the server?

**8. Request reaches server, server returns nothing?**
- Server logs are the next stop.
- Could be middleware crash, OOM, deadlock.

**Don't say:** "I'd disable CORS in the browser." Only works locally; signals junior in production context.`,
    hint: 'Network tab → CORS → mixed content → DNS',
  },

  // ─────────────────────────────────────────────────────────────────
  // System Design (8)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 121,
    category: 'system-design',
    title: 'Frontend system design — the framework',
    difficulty: 'mid',
    answer: `A 45-minute frontend system design follows this shape:

**1. Clarify (5 min)**
- Scope: which features? Which not?
- Users: scale, devices, network conditions.
- Constraints: latency, accessibility, browser support, SEO.
- Must-have vs nice-to-have.

> "Are we building the read-only feed or also publishing? Mobile or desktop primary? How many users?"

**2. High-level architecture (10 min)**
- Component tree.
- Data flow (state, fetching, caching).
- API shape (REST/GraphQL/RPC, response shapes).

> "I'd have a route layout, a feed list, an item card, and a composer modal..."

**3. Deep dive on 1–2 areas (20 min)**
- Whatever's most interesting / risky in the design.
- Common: real-time sync, infinite scroll, image loading, offline support, search.

**4. Trade-offs and what's next (10 min)**
- What did you defer (and why)?
- What would you measure post-launch?
- Where's the technical risk?

**Common mistakes:**
- Jumping to "I'd use Redux" before clarifying.
- Hand-waving with technology names instead of explaining behavior.
- Naming a library is not a design — explain *what state goes there and why*.
- Over-designing for unstated scale.

**What interviewers want to hear:**
- State **categorized by lifecycle** (URL / server cache / local / persistent).
- Specific component boundaries.
- **Loading and error states** mentioned proactively.
- Discussion of **trade-offs** (CDN vs same-origin; SSR vs CSR; optimistic vs pessimistic).
- Concrete metrics ("LCP under 2s on 3G mid-range").

**Senior signal:** asking what they'd measure to know it's working. "If we shipped this, I'd watch P95 latency on the search endpoint and the fall-off rate at each step of the flow."`,
    hint: 'Clarify → architecture → deep dive → trade-offs',
  },
  {
    id: 122,
    category: 'system-design',
    title: 'Design infinite scroll for a feed of 1M items',
    difficulty: 'mid',
    answer: `**Step 1 — Pagination strategy.**

- **Offset pagination** (\`?page=N&limit=20\`) — easy but breaks at depth (slow queries) and with inserts (duplicate or skipped items if list grows).
- **Cursor pagination** (\`?after=lastItemId\`) — stable, fast, scalable. Use this.

**Step 2 — Fetch on scroll.**

- Use Intersection Observer on a sentinel element near the bottom.
- Or use a library: \`react-intersection-observer\`, React Query's \`useInfiniteQuery\`.

\`\`\`jsx
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['feed'],
  queryFn: ({ pageParam }) => fetchFeed({ cursor: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
\`\`\`

**Step 3 — Virtualize the rendered list.**

- 10,000 visible DOM nodes will tank scroll performance.
- \`react-window\` or \`react-virtuoso\` — only render the ~20 visible items + small buffer.
- Trade-off: \`Ctrl+F\` browser search won't find off-screen items.

**Step 4 — Scroll restoration.**

- User clicks an item, comes back via browser back — they expect to be at the same scroll position with same items loaded.
- React Query's cache restores data; scroll position needs explicit handling (router-managed or sessionStorage).

**Step 5 — Loading and error states.**

- Show skeleton loaders below the visible items, not a full-screen spinner.
- Network error: inline retry button at the bottom, don't crash the loaded items.

**Step 6 — Edge cases.**
- **New items at top** while user is mid-scroll — show "5 new items" pill, don't auto-prepend (jarring).
- **Optimistic post** (user just published) — inject locally, mark as pending until server confirms.
- **Deleted items** — handle gracefully; cursor still works.

**Performance budgets:**
- First page: under 500ms.
- Subsequent pages: under 200ms.
- Scroll: 60fps consistently with virtualization.`,
    hint: 'Cursor pagination + virtualization + scroll restore',
  },
  {
    id: 123,
    category: 'system-design',
    title: 'Design real-time collaboration (Google Docs lite)',
    difficulty: 'senior',
    answer: `**Clarifying questions:**
- Single doc or many concurrent? Number of users per doc?
- Plain text, rich text, or structured data?
- Offline support?
- Conflict resolution: server-side or distributed?

**Core decisions:**

**1. Conflict resolution algorithm.**
- **CRDT (Conflict-free Replicated Data Type)** — operations commute by construction. Yjs is the JS standard. Bundle ~50KB.
- **OT (Operational Transformation)** — older approach. Server is authoritative. Requires per-app conflict logic.
- For a fresh build, CRDT is simpler. Yjs has React/text/rich-text bindings.

**2. Transport.**
- WebSocket — bidirectional, low latency.
- Reconnection logic: exponential backoff, replay queued ops on reconnect.
- Optionally use WebRTC for peer-to-peer (no server in the data path; harder to scope-control).

**3. Component architecture.**

\`\`\`
<DocPage>
  <Toolbar />        ← formatting commands
  <Editor>           ← contenteditable or library (Slate, Lexical)
    <CursorOverlay/> ← collaborator cursors as DOM overlays
  </Editor>
  <PresenceList />   ← who's online
</DocPage>
\`\`\`

**4. Local-first state.**
- Local edits applied immediately to the CRDT/local state.
- Operations broadcast to server, then to other clients.
- Receive others' ops → apply to local state.
- React renders from the local state — never blocking on network.

**5. Cursor presence.**
- Each user broadcasts \`{userId, position, selection}\` on a separate "awareness" channel.
- Throttle to 50ms.
- Render cursors as positioned overlays over the editor.
- Clean up on disconnect.

**6. Offline support.**
- Queue ops in IndexedDB.
- On reconnect, replay against latest server state. CRDTs handle this gracefully.

**7. Persistence.**
- Server periodically snapshots the CRDT state to DB.
- On load, fetch latest snapshot + recent ops.

**Trade-offs to mention:**
- CRDT bundle size vs custom OT (more code, less dep).
- Per-keystroke broadcast vs batched (latency vs bandwidth).
- Real-time vs eventual consistency tolerance.
- Operational cost: server scaling, storage, message volume.

**What you'd measure post-launch:**
- P95 sync latency between users.
- Conflict rate (CRDT merges that affected user-visible state).
- Reconnection success rate.`,
    hint: 'CRDT + WebSocket + local-first',
  },
  {
    id: 124,
    category: 'system-design',
    title: 'Design a search with filters, autocomplete, and history',
    difficulty: 'mid',
    answer: `**Clarify:**
- What's being searched? Catalog of how many items?
- Server-side or client-side filtering?
- Autocomplete: prefix-match or fuzzy? Personalized?
- "History" — user's recent searches or popular searches?

**Component breakdown:**

\`\`\`
<SearchPage>
  <SearchInput debounced />
  <FilterSidebar facets={...} />
  <SuggestionsDropdown visible={focused && !submitted} />
  <ResultsList virtualized />
  <Pagination cursor />
</SearchPage>
\`\`\`

**State categorization:**

| State | Where |
|---|---|
| Query string, active filters, page | URL search params |
| Search results | React Query (cache key = query + filters + page) |
| Autocomplete suggestions | React Query (separate, faster cache TTL) |
| User's search history | localStorage |
| Currently selected suggestion | Local component state |

**Search input:**
- Debounce ~250ms before firing autocomplete.
- Submit (Enter) skips debounce, fires search immediately, persists to URL.
- Update URL as a cosmetic effect (\`router.replace\`) to avoid stuffing history.

**Autocomplete:**
- Hit \`/api/suggest?q=...\` on every (debounced) keystroke.
- Show results in a portal-rendered dropdown.
- Keyboard navigation: arrow keys, Enter to select, ESC to close.
- Cache aggressively — same query within 30s should reuse cached suggestions.

**Filters:**
- Faceted: each filter is a query param (\`?category=X&priceMin=10\`).
- Apply on change (no "Apply" button — instant feedback).
- Show counts per filter value (server returns facet counts alongside results).

**Result rendering:**
- Skeleton loader for the first page to avoid layout shift.
- Virtualize if results exceed ~50.
- Highlight matched terms.

**Performance:**
- Server: full-text search engine (Elasticsearch / Algolia / Meilisearch). Don't \`LIKE %query%\` against a primary DB.
- Client: cache by query+filter combo; invalidate on user explicit refresh.
- Edge: CDN-cache popular queries with short TTL.

**Edge cases:**
- Empty results — show "no results, here are popular searches" instead of dead end.
- Network error — keep showing previous results, surface error inline.
- Very fast typing — cancel in-flight requests on new input.`,
    hint: 'URL state + React Query + debounce + virtualize',
  },
  {
    id: 125,
    category: 'system-design',
    title: 'Where do feature flags belong in a frontend architecture?',
    difficulty: 'senior',
    answer: `**Feature flags = runtime control over features.** Used for gradual rollouts, A/B tests, kill switches, beta access.

**Where to evaluate them — three options:**

**1. Client-side only:**
- All flags shipped to client; client decides.
- ❌ Leaks every flag's existence (security risk for unreleased features).
- ❌ Flash of "wrong" content if flag changes UI.
- ✅ Simple.
- Use only for non-sensitive, non-visual flags (e.g., debug logs).

**2. Server-side only (resolved at SSR/SSG):**
- Server resolves flags at request time; HTML reflects flag state.
- ✅ No flag leakage to client.
- ✅ No flash of wrong content.
- ❌ Static caching becomes per-flag-state (cache fragmentation).

**3. Hybrid (recommended):**
- Server resolves on first paint, sends resolved values to client.
- Client receives "canonical" set of resolved flags as serialized JSON.
- Subsequent flag changes (mid-session) come via separate channel — WebSocket push or polling.

\`\`\`jsx
// Server-side (Next.js)
export async function getServerSideProps({ req }) {
  const flags = await flagService.evaluate(req.user.id);
  return { props: { flags } };
}

// Client provider
<FlagsProvider flags={flags}>
  <App />
</FlagsProvider>

// Component
const showNewCheckout = useFlag('new-checkout');
\`\`\`

**Operational concerns:**

- **Flag service availability** — what if it's down? Fail-safe defaults (default everyone to "control" branch).
- **Caching** — cache resolved flags per session/user. Short TTL or push invalidation when flags change.
- **Targeting** — by user ID, region, plan tier. Hash-based bucketing for stable A/B assignments.
- **Cleanup** — flags go stale. Track creation date; alert on flags older than N months.

**Tools:** LaunchDarkly, Unleash, Statsig, ConfigCat, or DIY (Postgres + a UI).

**Don't:**
- Branch on flag in dozens of places — wrap features at integration points to keep cleanup easy.
- Ship flag tests as production code that lives forever — every flag is a TODO.

**Senior signal:** "Flags are a debt that pays interest. Cleanup is a feature."`,
    hint: 'Server-resolve + client-hydrate; cleanup discipline',
  },
  {
    id: 126,
    category: 'system-design',
    title: 'SSR vs SSG vs CSR vs ISR — when to use which',
    difficulty: 'senior',
    answer: `Four rendering strategies. The right choice depends on **how dynamic the content is** and **how time-sensitive the user request is**.

**CSR (Client-Side Rendering):**
- Empty HTML shell ships; JS fetches and renders content.
- ✅ Cheap to host (static HTML); low server load.
- ❌ Bad LCP (user sees blank); bad SEO without workaround.
- Use for: dashboards, internal tools, post-login pages where SEO doesn't matter.

**SSR (Server-Side Rendering):**
- Server renders HTML on every request, sends it ready-to-display.
- ✅ Fast LCP, good SEO, personalized content.
- ❌ Higher server cost; latency added by render time.
- Use for: per-user dashboards with SEO needs, e-commerce product pages with dynamic stock.

**SSG (Static Site Generation):**
- HTML pre-rendered at build time. Served as static files.
- ✅ Fastest possible response (CDN-served HTML); cheap; great SEO.
- ❌ Stale until next build; doesn't fit per-user content.
- Use for: marketing pages, blogs, documentation, anything that changes ~daily.

**ISR (Incremental Static Regeneration):**
- SSG + revalidation. Page is static until a TTL expires; first request after TTL triggers a rebuild for that page.
- ✅ Static performance with eventual freshness.
- ❌ Some users still see stale (the one that triggers rebuild waits).
- Use for: e-commerce category pages, news sites with infrequent updates.

**Modern hybrid (Next.js App Router):**
- **Route segments choose their own strategy.** Marketing pages SSG, dashboards SSR, blog ISR, settings page CSR after auth.
- **Server Components** ship zero JS; **Client Components** opt-in for interactivity.

**Decision questions:**
- Does it need to be different per user? → SSR/CSR.
- Does SEO matter? → SSR/SSG/ISR (not CSR alone).
- How often does content change? → Daily: SSG. Hourly: ISR. Per-request: SSR.
- Is the page personalized? → SSR or CSR after auth.

**Don't:** SSR everything reflexively. The simpler option (SSG) usually wins where it fits.`,
    hint: 'Match strategy to content dynamism + SEO needs',
  },
  {
    id: 127,
    category: 'system-design',
    title: 'Designing for accessibility — what to mention',
    difficulty: 'mid',
    answer: `Accessibility is a system design topic, not just an audit checklist. Bake it in from architecture.

**Architectural commitments:**

**1. Semantic HTML by default.**
- Use \`<button>\`, \`<a>\`, \`<form>\`, \`<nav>\` — they're keyboard- and screen-reader-friendly automatically.
- \`<div onClick>\` is a code smell. Switch to \`<button>\` (or \`role="button"\` + keyboard handlers if absolutely necessary).

**2. Keyboard navigation as a first-class concern.**
- Tab order should match visual order.
- Focus must always be visible (\`:focus-visible\` outline).
- ESC closes modals. Enter activates. Arrow keys for menus, lists.
- Test by unplugging your mouse for a session.

**3. Skip links.**
- First focusable element on every page: "Skip to main content."
- Lets keyboard users bypass repetitive navigation.

**4. ARIA live regions for dynamic content.**
- Toasts and alerts: \`role="status"\` (polite) or \`role="alert"\` (assertive).
- Loading state announcements.

**5. Forms.**
- Every input has a \`<label>\` (or \`aria-labelledby\`).
- Errors associated with inputs via \`aria-describedby\`.
- \`aria-invalid="true"\` on error fields.

**6. Color contrast.**
- WCAG AA: 4.5:1 for body text, 3:1 for large text.
- Never communicate state with color alone (success/error needs an icon or text).

**7. Motion.**
- Respect \`prefers-reduced-motion\`.
- Auto-playing video/animations can trigger vestibular disorders.

**Design system level:**
- Build accessibility into base components (button, input, dialog) — every consumer gets it for free.
- Storybook with axe addon for per-component checks.
- Component API hides ARIA complexity (\`<Dialog isOpen>\` handles focus trap, ESC, role internally).

**Testing:**
- Lighthouse in CI for catch-all regressions.
- axe-core in unit tests for component-level rules.
- **Manual screen-reader testing** for complex flows — automation only catches ~30% of issues.

**Senior signal:** "Accessibility isn't a phase at the end. It's a constraint we apply at component design time."`,
    hint: 'Semantic HTML + keyboard + ARIA + design system',
  },
  {
    id: 128,
    category: 'system-design',
    title: 'Designing offline-first: what to consider',
    difficulty: 'senior',
    answer: `Offline-first means the app works **without network**, syncing when reconnected.

**Architecture pillars:**

**1. Local data store as source of truth.**
- IndexedDB for structured data (libraries: Dexie, idb-keyval).
- Cache API for HTTP responses (used by Service Workers).
- React queries from local first, then fetches to refresh.

**2. Service Worker for the network layer.**
- Intercepts fetch requests.
- Strategies: cache-first (assets), network-first with cache fallback (API), stale-while-revalidate.
- Handles offline UI (custom offline page).

**3. Mutation queue.**
- User actions (POST, PATCH, DELETE) when offline → enqueued in IndexedDB.
- On reconnect, replay against server.
- Show sync status: "Pending changes — 3 items waiting to sync."

**4. Conflict resolution.**
- What if the server data changed while user was offline?
- Last-write-wins (simple, dangerous).
- Server-side merge with client diff.
- CRDT for collaborative documents (auto-merge by construction).

**5. Sync indicators.**
- "Online / offline" status in UI (driven by \`navigator.onLine\` + heartbeat to your API).
- Per-item sync status (saved / pending / failed).
- "Last synced 2 minutes ago."

**6. Storage limits.**
- Browsers cap origin storage (varies, often ~50% of free disk).
- LRU eviction when hit.
- Plan for graceful degradation when full.

**Trade-offs:**
- Engineering complexity is high — skip if your app is genuinely useless without network (e.g., live chat).
- Storage and conflict resolution are real challenges, not afterthoughts.
- Test offline scenarios rigorously — DevTools "Offline" toggle, real device airplane mode.

**When to skip:**
- App requires real-time multi-user (chat, collab).
- Most actions are inherently networked (payments).
- Users are always online (internal tools on company network).

**When it's worth it:**
- Field workers, remote areas (mining, logistics).
- Mobile-first consumer apps with patchy connectivity.
- Productivity apps where offline = "never lose my work."

**Frameworks helping with this:** Replicache, RxDB, PowerSync, Dexie Cloud — handle the sync layer.`,
    hint: 'Local-first + service worker + mutation queue + conflicts',
  },

  // ─────────────────────────────────────────────────────────────────
  // Behavioral (7)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 129,
    category: 'behavioral',
    title: 'Tell me about a time you disagreed with a teammate',
    difficulty: 'mid',
    answer: `**Use STAR + Reflection.** The reflection is what flips this from "competent" to "senior potential."

**Weak version:**
> "We disagreed about Redux vs Context. I thought Redux was overkill. We talked and went with Context. It worked out."

Vague, no specifics, no reflection.

**Strong version:**
> **Situation:** "Mid-project, our shared cart state was tangling — context updates were triggering re-renders in unrelated parts of the tree.
>
> **Task:** I needed to propose a fix. A teammate wanted to migrate everything to Redux Toolkit; I felt that was overkill for the actual problem.
>
> **Action:** Instead of arguing in abstract, I built a small benchmark — measured re-render counts on the existing context, then prototyped a Zustand store for just the cart. I shared a doc comparing bundle size, migration effort, learning curve for the team, and the actual perf numbers. We discussed it in a 30-minute meeting.
>
> **Result:** We landed on Zustand for the cart specifically — kept Context for theme and auth. Re-renders dropped from ~12 to 2 per cart update. Whole migration took two days.
>
> **Reflection:** What I'd do differently — I made the decision feel binary at first by pushing back hard on Redux. Next time I'd lead with the prototype and numbers; let the data drive the conversation rather than my opinion."

**What makes this work:**
- Specific, measurable outcome.
- Owns the action ("I built", "I shared") — not "we did."
- Acknowledges the teammate's concern was valid (they wanted predictable state).
- Reflection shows growth without self-flagellation.

**Don'ts:**
- Don't pick a story where you "won." Pick one where you collaborated.
- Don't bash the teammate or org.
- Don't lead with the technical debate — lead with what was at stake.`,
    hint: 'STAR + Reflection; specific numbers',
  },
  {
    id: 130,
    category: 'behavioral',
    title: 'Tell me about a production incident you owned',
    difficulty: 'mid',
    answer: `Interviewers want to see: **calm under pressure, structured triage, communication, post-incident learning.**

**Strong template:**

> "We had a P1 outage on \`<feature>\` — symptoms were \`<specific user-visible behavior>\`. I was on-call.
>
> **Triage:**
> - I checked dashboards first to confirm scope (X% of users, started at Y time).
> - Went to the deploy log — a release had gone out 20 minutes prior.
> - Posted in #incidents with a brief summary and ETA. Designated myself incident commander.
>
> **Mitigation:**
> - Rolled back the deploy (4 minutes from detection). Restored service for 95% of users.
> - The remaining 5% had cached state we needed to invalidate; pushed a config change to flush it.
>
> **Root cause:**
> - The release introduced a regression in \`<specific code path>\`. A null check was removed during a refactor. Caught only in a code path our tests didn't cover.
>
> **Postmortem:**
> - Wrote and led the postmortem the next day.
> - Action items: added the missing test case; added a feature flag wrapper for similar refactors so they can be rolled back without a deploy; tightened the on-call playbook.
> - Followed up two weeks later to confirm action items were closed.
>
> **What I'd do differently:** I should have communicated more frequently during the incident — I had a 12-minute gap between updates. People assumed it was worse than it was."

**What this signals:**
- **Decision-making under pressure** — rolled back without arguing about root cause first.
- **Communication** — proactive #incidents updates, role designation.
- **Ownership** — led the postmortem, drove action items to close.
- **Self-awareness** — communication gap reflection.

**Don'ts:**
- Don't blame the team or the system without owning your part.
- Don't claim to have personally fixed bugs that took a team.
- Don't omit the postmortem — that's where seniors and mids diverge.`,
    hint: 'Triage → mitigate → root cause → postmortem',
  },
  {
    id: 131,
    category: 'behavioral',
    title: 'Tell me about a project that failed',
    difficulty: 'mid',
    answer: `Interviewers ask this to see if you can:
- **Acknowledge failure** without deflecting.
- **Extract lessons** without dwelling.
- **Take ownership** of your contribution to the failure.

**Strong example:**

> "We spent a quarter building a \`<feature>\` based on early user requests. We launched it to limited beta. Engagement was flat — users tried it once and didn't come back.
>
> **My role:** I was tech lead. I shipped on time, with quality. The code was fine. The product was wrong.
>
> **What went wrong:**
> - We took the requests at face value rather than interviewing for the underlying need.
> - We didn't build a v0.1 — we built a polished v1, which delayed feedback by 2 months.
> - I didn't push back on scope when I saw red flags. I rationalized 'they're the PM, they know.'
>
> **What we did:**
> - Killed the feature instead of iterating on a flawed premise.
> - Wrote a retrospective shared with leadership.
> - Switched to a feature-flag-gated release-early approach for the next initiative.
>
> **What I'd do differently:**
> - When my instinct says 'this isn't landing,' surface it early — even if it's uncomfortable.
> - Build the smallest testable thing first, even if it ships ugly.
> - Engineering can flag product risks. That's part of the job at senior level."

**What this signals:**
- Distinguishes "shipped on time" from "the right thing shipped."
- Owns systemic failure (didn't push back), not just the proximate cause.
- Specifies behavioral changes — not just "I'd communicate more."

**Don'ts:**
- Don't pick a "failure" that's actually a humblebrag ("I worked too hard").
- Don't blame product/design/leadership for the entire outcome.
- Don't tell a story with no learning — the lesson is the point.`,
    hint: 'Own the failure, extract behavioral lessons',
  },
  {
    id: 132,
    category: 'behavioral',
    title: 'How do you handle being given an ambiguous task?',
    difficulty: 'mid',
    answer: `Mid-level signal: you're past "tell me what to do" but not yet "set the strategy."

**The framework:**

**1. Clarify the goal.** The "what" might be vague; the "why" rarely is.
> "When the PM said 'improve onboarding,' I asked what success looked like. Was it activation rate? Time to first value? Reduction in support tickets? Different signals lead to different solutions."

**2. Bound the scope.**
> "I asked: should this take a sprint, a month, or a quarter? That tells me whether I'm tweaking copy or rebuilding the flow."

**3. Spike before committing.**
> "I built a tiny prototype — actually clickable — for two of the three approaches. Showed it to the PM and a couple users. The 'right' answer was obvious in 30 minutes that we'd otherwise have argued about for a week."

**4. Surface decisions explicitly.**
> "I wrote up a one-pager: here are the options, here's what each costs, here's what I recommend and why. Asked for stakeholder feedback. This converts ambiguity into traceable decisions."

**5. Communicate progress and friction.**
> "I sent weekly updates with what shipped, what's next, what's blocked. When the database team's API was the blocker, I said so explicitly — didn't let it stall me."

**Specific story to tell:**

> "PM said 'make checkout faster.' I started by clarifying: faster *for the user* (perceived) or *for the system* (actual time)? Turned out the issue was perceived — users were dropping off at the address step. I prototyped two flows: skipping address until needed, vs. autofilling from past purchases. A/B tested. Autofill won by 12% conversion. Total: 3 weeks from ambiguous brief to shipped feature."

**Don'ts:**
- Don't say "I just figured it out and got to work." That's junior energy.
- Don't claim you'd ask for clarification once and then proceed — real projects need ongoing alignment.`,
    hint: 'Clarify goal → bound scope → spike → decide → ship',
  },
  {
    id: 133,
    category: 'behavioral',
    title: 'How do you mentor or share knowledge?',
    difficulty: 'mid',
    answer: `Mid-level engineers are expected to **uplift those around them**, not just ship features. This question filters for that.

**Concrete examples to have ready:**

**1. Onboarding a junior:**
> "Last hire on my team came in straight from bootcamp. I paired with them for the first two weeks — not on solving for them, but on demonstrating my problem-solving process. By week three, they were shipping independently. I documented the patterns we hit so the next hire could move faster."

**2. Tech docs / RFCs:**
> "I wrote an ADR (Architecture Decision Record) for our state management choice. Took two hours; saved future engineers weeks of 'why did we pick X?' confusion."

**3. Code reviews as teaching moments:**
> "I leave context in reviews — not 'change this' but 'change this because [reason] and here's a link to [pattern].' Slower than rubber-stamping but the next PR from the same person is usually cleaner."

**4. Internal tech talks:**
> "I gave a brown-bag on React Server Components when we evaluated upgrading. Forced me to learn it deeply, gave the team a shared starting point for the discussion."

**5. Pair programming on hard problems:**
> "When a teammate was stuck on a race condition for two days, we paired for an hour. They saw my debugging process; I saw theirs. We both learned."

**The senior signal — sharing creates leverage:**

> "I view docs and mentoring as compounding investments. An hour writing a README saves the next 10 people an hour each. The team gets faster; my own reviews get easier because everyone starts from a shared baseline."

**Don'ts:**
- Don't claim to "always be available" — sounds like a martyrdom narrative.
- Don't only mention juniors — mentoring peers and even seniors counts.
- Don't say you only do this when asked — proactive knowledge-sharing is the whole point.`,
    hint: 'Onboarding, ADRs, reviews, talks — pick concrete examples',
  },
  {
    id: 134,
    category: 'behavioral',
    title: 'Why are you leaving your current job?',
    difficulty: 'junior',
    answer: `**The trap:** Negative answers about your current employer hurt your candidacy, even if the negativity is justified.

**The pattern that works:**
1. Acknowledge what's good about your current role.
2. Name a specific growth dimension where it's plateaued.
3. Connect that gap to what this new role offers.

**Strong template:**

> "My current role has been great for [specific positives — the team, what I've learned, what I shipped]. The reason I'm exploring is [specific growth area]: [name a concrete thing this new role offers that yours doesn't]. I want to keep growing in [direction], and this role would let me do that."

**Concrete examples:**

> "I've shipped a lot of frontend at my current company, but the architecture is mostly settled — I'm not driving design decisions for new systems. The role here would put me on a team building a new platform, and that's the next thing I want to grow into."

> "Great team, learned a lot, but the company is small and I've taken on the breadth I can there. I want to work somewhere with more specialized peers I can learn from in depth — your team's track record on [specific thing] is what got me to apply."

> "I'm proud of what we shipped, but the company has pivoted away from technical depth toward shipping speed at all costs. I want to work somewhere that values both."

**Honest red lines:**
- Compensation — fine to mention briefly, not the lead reason.
- Toxic management — true but avoid in interviews; comes across as venting. Frame as "looking for a more collaborative environment."
- Burnout / pace — risky; could read as low capacity. Frame as "looking for a more sustainable model."

**Don'ts:**
- Don't badmouth specific people or projects.
- Don't claim "no reason" — sounds evasive.
- Don't lie. The industry is small; current employer often comes up in references.`,
    hint: 'Frame as growth pull, not push',
  },
  {
    id: 135,
    category: 'behavioral',
    title: 'Do you have any questions for us?',
    difficulty: 'junior',
    answer: `**Always say yes.** Saying "no, I think you've covered it" reads as low engagement.

**Strong questions ask the interviewer to share something specific.**

**About the role:**
- "What would success look like in this role at the 6-month mark?"
- "What's the biggest gap on the team right now that this hire would fill?"
- "Walk me through what someone in this role did last quarter."

**About the team:**
- "How does the team make technical decisions — RFC docs, meetings, individual ownership?"
- "What's a recent disagreement on the team and how did it resolve?"
- "How do code reviews work? Who reviews whom?"

**About the company:**
- "What's something that's changed about engineering culture in the last year?"
- "Where do you see the team in two years — bigger, smaller, more specialized?"
- "What's one thing you'd change if you could?"

**About the interviewer personally:**
- "What made you pick this team / company?"
- "What do you wish you'd known before joining?"

**For senior interviewers / hiring managers:**
- "How do you measure team health?"
- "What's the path to staff/principal here?"

**Avoid:**
- ❌ "What does the company do?" — Google-able, signals you didn't prepare.
- ❌ "What's the salary?" — appropriate later in the process; awkward in early rounds (recruiter handles it).
- ❌ "How much vacation do I get?" — fine to ask later; mid-interview reads as transactional.
- ❌ Aggressive "gotcha" questions — "Why are reviews on Glassdoor negative?"

**Listen to the answer, don't just check the box.** Their answers tell you whether to take the offer if it comes.

**Senior signal:** Asking questions that show you're already thinking about *how to be effective* in the role. "How does a new engineer typically ramp here?" demonstrates concrete planning.`,
    hint: 'Always have 3+; ask specific, listen genuinely',
  },
];
