import type { Question } from '../lib/types';

export const questions: Question[] = [
  // ─────────────────────────────────────────────────────────────────
  // React Core (12)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 55,
    category: 'react-core',
    title: 'What is the Virtual DOM and how does reconciliation work?',
    difficulty: 'mid',
    answer: `**Virtual DOM** — an in-memory tree of plain JS objects describing what the UI should look like. Cheap to create and compare.

**Reconciliation** — React's algorithm that compares the previous virtual tree with the new one and figures out the minimum DOM mutations needed.

**Two render phases:**
1. **Render phase** — Pure, can be paused/restarted. React calls your components and builds the new VDOM tree.
2. **Commit phase** — Synchronous, can't be interrupted. Apply the diff to the actual DOM, run effects.

**Diff heuristics (the optimizations that make it fast):**

1. **Different element types → unmount + remount.** Changing \`<div>\` to \`<span>\` throws away the entire subtree (state lost!).
2. **Same type → update props in place.**
3. **Lists need keys** — without stable keys, React diffs by position, leading to wasted work or wrong state preservation.

\`\`\`jsx
// Same key, different position — React moves the existing component (and its state)
<TodoItem key={todo.id} ... />

// Index keys when items reorder — bug magnet
<TodoItem key={i} ... /> // ❌ state attaches to wrong item after reorder
\`\`\`

**Why it's O(n), not O(n³):** A naive tree diff is cubic. React makes assumptions (no cross-tree movement, keys for lists) that bring it to linear. The trade-off: stable component identity is your responsibility via keys.`,
    hint: 'In-memory tree + diff heuristics',
  },
  {
    id: 56,
    category: 'react-core',
    title: 'Why use keys in lists?',
    difficulty: 'mid',
    answer: `Keys give React stable identity for list items across renders. Without them, React falls back to position-based diffing, which causes:
- Wasted DOM mutations.
- **State attached to the wrong item** after reorder/insert/delete.
- Form input values jumping around.

\`\`\`jsx
// Bug: index key + filter
const [items, setItems] = useState([
  { id: 1, name: 'apple' },
  { id: 2, name: 'banana' },
  { id: 3, name: 'cherry' },
]);

return items.filter(...).map((item, i) => (
  <ItemEditor key={i} item={item} /> // 🚩
));
\`\`\`

When an item is filtered out, indices shift. The \`<ItemEditor>\` instance previously bound to "banana" now sees "cherry" props — but its internal state (an unsaved edit) stays.

**Rules:**
- **Stable** across renders (use \`item.id\`, not \`Math.random()\`).
- **Unique** among siblings (not globally — key only matters within the same parent).
- **Index keys are OK** when the list is static — never reordered, no inserts mid-list.

**Common bugs:**
- \`key={Math.random()}\` — forces remount every render, destroying state and perf.
- \`key={i}\` on a sortable list — state attaches to wrong items after sort.
- Missing key entirely — works but logs a warning; React internally falls back to position.`,
    hint: 'Stable identity for diff',
  },
  {
    id: 57,
    category: 'react-core',
    title: 'When does a component re-render?',
    difficulty: 'mid',
    answer: `**A component re-renders when:**

1. Its **state changes** — \`setState\` called with a new value (compared via \`Object.is\`).
2. Its **parent re-renders** — and it's not memoized.
3. A **subscribed Context value changes**.
4. A **hook returns a new value** — \`useReducer\`, \`useSyncExternalStore\`.

**It does NOT re-render when:**
- Props change but the parent didn't render (impossible — props come from parent's render).
- Refs change (\`useRef\` mutations don't trigger renders by design).
- A different component renders.

**Key insight:** "Props changed" is **never** the reason a re-render starts — it's a *consequence* of the parent re-rendering. The parent always renders first.

**Bail-out behavior:**

\`\`\`jsx
const [count, setCount] = useState(0);
setCount(0); // setCount with same value via Object.is → React MAY skip
\`\`\`

React still calls the component once, but bails before commit if the result is identical. So \`Object.is\` matters at TWO points: the state setter and the commit.

**Practical:** Open React DevTools Profiler → record an interaction → each render lists *why* it happened. Use that, not guesswork.`,
    hint: 'State, parent, context, hooks',
  },
  {
    id: 58,
    category: 'react-core',
    title: 'Why does this counter only increment by 1?',
    difficulty: 'mid',
    answer: `\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };
  // Click → count goes 0 → 1, not 0 → 3
}
\`\`\`

**Why:** All three calls reference the **same stale \`count\`** captured at render time. Each schedules \`setCount(0 + 1)\`. React batches them; the final value is 1.

**Fix — updater form:**

\`\`\`jsx
const handleClick = () => {
  setCount(c => c + 1);
  setCount(c => c + 1);
  setCount(c => c + 1);
};
// Now: 0 → 3
\`\`\`

The updater receives the latest pending state from React's queue, not the closure's captured value.

**Rule of thumb:** When the next state depends on the current state, use the updater form. Especially in:
- Event handlers that fire multiple updates.
- Async callbacks (you don't know what state will be when they run).
- Effects that run after delays.

**Same trap with objects:**
\`\`\`jsx
// ❌ Stale
setUser({ ...user, name: 'new' });

// ✅ Latest
setUser(prev => ({ ...prev, name: 'new' }));
\`\`\``,
    hint: 'Stale closure on state',
  },
  {
    id: 59,
    category: 'react-core',
    title: 'What does Strict Mode do, and why does it double-invoke?',
    difficulty: 'mid',
    answer: `\`<StrictMode>\` enables development-only checks to surface bugs. In React 18+, it intentionally **double-invokes**:

- Function component bodies (and \`useState\`/\`useReducer\` initializers).
- \`useEffect\` setup → cleanup → setup (in development, mount cycles run twice).

**Why:** To surface side effects in render bodies and missing cleanup in effects.

**This catches:**
- Mutations during render — they happen twice, problems get visible.
- Effects that don't clean up properly — second mount triggers the bug.
- Non-idempotent setup logic — like double API calls.

\`\`\`jsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  // ❌ Missing cleanup → in StrictMode, two intervals run
  // ✅ Add: return () => clearInterval(id);
}, []);
\`\`\`

**Production behavior:** Single invocation. None of this happens in builds.

**Common confusion — "my fetch fires twice in dev":**
- That's StrictMode working as designed.
- If your fetch isn't idempotent, the design is the issue, not StrictMode.
- AbortController in the cleanup handles it cleanly.

\`\`\`jsx
useEffect(() => {
  const ctrl = new AbortController();
  fetch(url, { signal: ctrl.signal }).then(/* ... */);
  return () => ctrl.abort();
}, [url]);
\`\`\``,
    hint: 'Surface side-effect bugs early',
  },
  {
    id: 60,
    category: 'react-core',
    title: 'Controlled vs uncontrolled components',
    difficulty: 'junior',
    answer: `**Controlled** — React owns the state. Form value is driven by props from React state.

\`\`\`jsx
const [name, setName] = useState('');
<input value={name} onChange={e => setName(e.target.value)} />
\`\`\`

**Uncontrolled** — DOM owns the state. Read it via \`ref\` when you need it.

\`\`\`jsx
const inputRef = useRef();
<input defaultValue="initial" ref={inputRef} />
// Later: inputRef.current.value
\`\`\`

**When to use which:**

| Controlled | Uncontrolled |
|---|---|
| Real-time validation | One-shot form submit |
| Disable submit until valid | File inputs (always uncontrolled) |
| Conditional UI from form values | Integration with non-React libs |
| Dependent fields | Performance-critical large forms |

**Common mistake:** Switching between controlled and uncontrolled mid-life — React warns and the input behaves erratically.

\`\`\`jsx
<input value={user.name} ... />
// If user.name becomes undefined → switches to uncontrolled → warning
// Fix: <input value={user.name ?? ''} ... />
\`\`\`

**Modern frameworks** (React Hook Form, Formik) often use uncontrolled inputs internally for performance, exposing a controlled-feeling API.`,
    hint: 'React owns state vs DOM owns state',
  },
  {
    id: 61,
    category: 'react-core',
    title: 'What is React Fiber?',
    difficulty: 'senior',
    answer: `Fiber is React's reconciliation algorithm rewrite (since React 16) that enables **interruptible rendering**.

**Pre-Fiber (stack reconciler):** Render was a recursive walk that couldn't be paused. Long renders blocked the main thread, causing jank.

**Fiber:** Each component gets a **Fiber node** — a unit of work that can be:
- **Paused** — yield to higher-priority work (user input).
- **Resumed** — pick up where it left off.
- **Aborted** — throw away in-progress work if it's stale.
- **Reused** — for memoized branches.

**Why this enables Concurrent React:**
- \`useTransition\` — mark updates as low-priority, pausable.
- \`useDeferredValue\` — render older value while computing new one.
- \`Suspense\` — pause rendering until data is ready.
- Time slicing — break big renders into 5ms chunks, yield in between.

**You don't see Fiber directly.** It's implementation detail. But it's why these features can exist:

\`\`\`jsx
const [isPending, startTransition] = useTransition();

startTransition(() => {
  setSearchQuery(value); // marked low-priority
});
// Typing stays responsive even if filtering 10,000 items
\`\`\`

**Reading list:** Andrew Clark's original Fiber architecture doc (linked from React's GitHub) is the canonical deep-dive.`,
    hint: 'Interruptible reconciliation',
  },
  {
    id: 62,
    category: 'react-core',
    title: 'What are Server Components?',
    difficulty: 'senior',
    answer: `**React Server Components (RSC)** run on the server, never ship JS to the client. Stable in React 19, used by Next.js App Router.

**Differences from SSR:**
- **SSR** — runs your component on the server, sends HTML, then **hydrates** with the same JS on the client. Full bundle still ships.
- **RSC** — runs on the server, sends a serialized React tree (not HTML, not JS). Zero JS for that component.

**Server Components can:**
- Access databases directly (no API layer).
- Read files, env vars, secrets.
- Be async (\`async function MyComponent()\`).

**Server Components cannot:**
- Use state or effects (\`useState\`, \`useEffect\`).
- Use browser-only APIs.
- Use event handlers (\`onClick\`).
- Be imported by Client Components if they need to be interactive.

**Client Components** opt in with \`'use client'\` at the top of the file.

\`\`\`jsx
// app/page.tsx — Server Component by default
import db from '@/lib/db';

export default async function Page() {
  const posts = await db.posts.findMany(); // direct DB access
  return <PostList posts={posts} />;
}

// app/like-button.tsx
'use client';
export function LikeButton() {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>...</button>;
}
\`\`\`

**Mental model:** Default to server. Add \`'use client'\` only when you need state, effects, or event handlers.`,
    hint: 'Zero-JS components, async, no hooks',
  },
  {
    id: 63,
    category: 'react-core',
    title: 'Higher-Order Components vs render props vs hooks',
    difficulty: 'mid',
    answer: `Three patterns for sharing logic across components. Hooks won.

**HOC (Higher-Order Component):** Function that takes a component, returns a new component.

\`\`\`jsx
const withAuth = (Component) => (props) => {
  const user = useAuth();
  if (!user) return <Login />;
  return <Component {...props} user={user} />;
};
\`\`\`

Problems: prop collision, "wrapper hell" in DevTools, static composition (can't use conditionally).

**Render props:** Component takes a function-as-child.

\`\`\`jsx
<DataFetcher url="/api/users">
  {({ data, loading }) => loading ? <Spinner /> : <List data={data} />}
</DataFetcher>
\`\`\`

Problems: deeply nested JSX (the "render prop pyramid").

**Hooks:** Logic-only function, no JSX wrapper.

\`\`\`jsx
function useAuth() { /* ... */ }

function Profile() {
  const user = useAuth();
  if (!user) return <Login />;
  return <UserCard user={user} />;
}
\`\`\`

**Why hooks won:**
- Composable without nesting.
- No prop collisions.
- Easier to type.
- Can be called conditionally... well, no, but the components calling them can be.

**You'll still see HOCs in:** Redux \`connect\`, React Router (\`withRouter\` legacy), some animation libraries, error boundaries (no hook equivalent yet).`,
    hint: 'Hooks replaced HOCs and render props',
  },
  {
    id: 64,
    category: 'react-core',
    title: 'What is an Error Boundary?',
    difficulty: 'mid',
    answer: `Components that **catch JavaScript errors** in their child component tree, log them, and render fallback UI.

\`\`\`jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
\`\`\`

**Currently MUST be a class.** No hook equivalent exists (use \`react-error-boundary\` library for a hook-friendly API).

**What error boundaries DON'T catch:**
- Errors in event handlers (use try/catch).
- Errors in async code (promise rejections).
- Errors during SSR.
- Errors in the boundary itself.

**Practical placement:**
- One at the app root for "white screen of death" prevention.
- Around route components — one bad page doesn't kill the whole app.
- Around third-party widgets that might crash.

\`\`\`jsx
// react-error-boundary library — recommended
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onReset={() => queryClient.resetQueries()}
>
  <App />
</ErrorBoundary>
\`\`\``,
    hint: 'Class component, catches render errors',
  },
  {
    id: 65,
    category: 'react-core',
    title: 'Portals — when and why?',
    difficulty: 'mid',
    answer: `\`createPortal(children, container)\` renders children into a different DOM node — outside the parent's DOM hierarchy — but **keeps the React tree relationship** (state, context, events).

\`\`\`jsx
import { createPortal } from 'react-dom';

function Modal({ children }) {
  return createPortal(
    <div className="modal">{children}</div>,
    document.getElementById('modal-root') // outside main app div
  );
}
\`\`\`

**When to use:**
- **Modals/dialogs** — escape \`overflow: hidden\` clipping.
- **Tooltips** — escape \`z-index\` stacking context.
- **Toasts** — render at body level, no matter where triggered.
- **Dropdowns** that need to overflow their parent container.

**Crucial behavior:** Events bubble through the **React tree**, not the DOM tree.

\`\`\`jsx
<div onClick={handleClickInParent}>
  <Modal>
    <button onClick={() => alert('clicked')} />
    {/* Click bubbles up React tree to handleClickInParent
        even though DOM-wise the button is in #modal-root */}
  </Modal>
</div>
\`\`\`

**Modern alternative:** \`<dialog>\` element with \`showModal()\` is now well-supported and gives you free top-layer rendering, focus trapping, and ESC handling. Worth considering before reaching for a portal.`,
    hint: 'Render outside parent, keep React tree',
  },
  {
    id: 66,
    category: 'react-core',
    title: 'Suspense — what does it actually do?',
    difficulty: 'senior',
    answer: `\`<Suspense>\` declaratively shows a fallback UI while a child is "waiting" — without you wiring up loading states.

**The mechanism:** A child throws a Promise. React catches it, suspends rendering, and shows the nearest \`<Suspense fallback>\`. When the Promise resolves, React tries the render again.

**Originally** — only worked for code splitting:
\`\`\`jsx
const HeavyChart = lazy(() => import('./HeavyChart'));

<Suspense fallback={<Spinner />}>
  <HeavyChart />
</Suspense>
\`\`\`

**With React 19 + frameworks (Next.js, Remix):** Now works for data fetching via the \`use()\` hook and Server Components.

\`\`\`jsx
function Posts() {
  const posts = use(fetchPosts()); // suspends until resolved
  return posts.map(p => <Post key={p.id} {...p} />);
}

<Suspense fallback={<PostsSkeleton />}>
  <Posts />
</Suspense>
\`\`\`

**Streaming SSR:** Server can flush HTML for ready parts, leave \`<Suspense>\` boundaries with their fallbacks, and stream the resolved content as it arrives. No more all-or-nothing SSR.

**Mental model upgrade:**
- Old: \`{loading ? <Spinner /> : <Content />}\` — explicit conditional.
- Suspense: declare boundaries, write components that just request data, React handles the orchestration.

**Limitations:** Vanilla \`fetch\` in \`useEffect\` doesn't suspend. You need a Suspense-aware data layer (React Query 5+, Relay, Next.js, custom \`use()\`).`,
    hint: 'Declarative loading states',
  },
  {
    id: 185,
    category: 'react-core',
    title: 'What does JSX actually compile to?',
    difficulty: 'junior',
    answer: `JSX is **not** a template language and the browser does not understand it. A compiler (Babel, SWC, esbuild, tsc) rewrites every JSX expression into a plain function call that produces a React element — a small JS object describing what to render.

**Before (JSX):**

\`\`\`jsx
function Greeting({ name }) {
  return (
    <div className="hello">
      <h1>Hello, {name}!</h1>
      <button onClick={() => alert('hi')}>Wave</button>
    </div>
  );
}
\`\`\`

**After (React 17+ automatic runtime — what the bundler emits):**

\`\`\`js
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';

function Greeting({ name }) {
  return _jsxs('div', {
    className: 'hello',
    children: [
      _jsx('h1', { children: ['Hello, ', name, '!'] }),
      _jsx('button', { onClick: () => alert('hi'), children: 'Wave' }),
    ],
  });
}
\`\`\`

The return value at runtime is just a tree of objects, roughly:

\`\`\`js
{ type: 'div', props: { className: 'hello', children: [...] } }
\`\`\`

**Implications that drop out of this:**

- **Lowercase = HTML tag, Capitalized = component.** \`<button>\` becomes the string \`'button'\`; \`<Button>\` becomes the variable \`Button\` (so it must be in scope).
- **\`className\` instead of \`class\`** — the prop becomes an object key, and \`class\` is a reserved word in JS.
- **Every child needs a key in a list** — siblings collapse into a plain JS array, and React has no other way to tell them apart.
- **JSX is an expression** — it evaluates to an object, so you can store it in a variable, return it, or pass it as a prop. There is no "JSX statement."
- **Fragments** (\`<>...</>\`) compile to \`React.Fragment\` so you can return siblings without a wrapper DOM node.

**Visual aid suggestion:** A two-column diagram with the JSX source on the left and the compiled \`_jsx(...)\` call tree on the right, arrows showing each tag mapping to a node, and the runtime element tree (plain JS objects) on the far right — making it obvious that JSX → function call → object tree → DOM.`,
    hint: 'Syntactic sugar over React.createElement / _jsx',
  },
  {
    id: 186,
    category: 'react-core',
    title: 'React.memo — when does it actually help (and when does it not)?',
    difficulty: 'senior',
    answer: `\`React.memo(Component)\` wraps a component so it **skips re-rendering when its props are shallow-equal to the previous props**. It's a render-phase bailout, nothing more.

\`\`\`jsx
import { memo, useState, useCallback } from 'react';

const Row = memo(function Row({ item, onToggle }) {
  console.log('render', item.id);
  return (
    <li onClick={() => onToggle(item.id)}>
      {item.done ? '✅' : '⬜️'} {item.text}
    </li>
  );
});

function List({ items }) {
  const [, force] = useState(0);

  // ❌ New function reference every render — breaks memo
  // const onToggle = (id) => console.log(id);

  // ✅ Stable reference — memo can actually bail out
  const onToggle = useCallback((id) => console.log(id), []);

  return (
    <>
      <button onClick={() => force((n) => n + 1)}>Force parent render</button>
      <ul>
        {items.map((item) => (
          <Row key={item.id} item={item} onToggle={onToggle} />
        ))}
      </ul>
    </>
  );
}
\`\`\`

Click "Force parent render" with the \`useCallback\` version and the console stays quiet. Remove it and every \`Row\` logs on every parent render — that's \`memo\` getting defeated by a fresh function prop.

**\`memo\` helps when ALL of these are true:**

1. The component renders **often** as a child of a re-rendering parent.
2. Its **props are referentially stable** across those renders (primitives, or memoized objects/functions/arrays).
3. Its **render is non-trivial** — large list rows, heavy chart, deep tree. Skipping it actually saves work.

**\`memo\` does NOT help — and adds overhead — when:**

- Props are inline objects/arrays/functions (\`style={{...}}\`, \`onClick={() => ...}\`) — shallow compare fails every render.
- The component re-renders because of its own state or a context it subscribes to (props were never the trigger).
- Its children are passed via \`children\` and the parent re-creates that JSX each render (\`children\` is a fresh element tree, so shallow compare fails).
- The render is cheap enough that the comparison overhead exceeds the savings.

**Custom comparator** — for the rare case where shallow equality lies:

\`\`\`jsx
const Chart = memo(InnerChart, (prev, next) => prev.data.version === next.data.version);
\`\`\`

**Looking ahead:** The React 19 Compiler auto-memoizes components and values; manual \`memo\` / \`useMemo\` / \`useCallback\` are expected to fade in compiled codebases. Until then: **profile first** (React DevTools Profiler → "Why did this render?"), then memoize the specific component that's actually hot.

**Visual aid suggestion:** A flowchart that starts at "Parent re-renders" and branches: *Is child wrapped in memo?* → *Are props shallow-equal?* → render is skipped. Annotate the failure paths with the common props that break equality (inline object, inline function, fresh JSX children).`,
    hint: 'Shallow prop-equality bailout — easy to defeat',
  },
  {
    id: 187,
    category: 'react-core',
    title: 'Lifting state up — when, how, and what to avoid',
    difficulty: 'mid',
    answer: `When two sibling components need to **stay in sync** about the same value, that value can't live in either of them — it needs to live in their **closest common ancestor**. The ancestor owns the state and passes \`value\` + \`onChange\` down. This is "lifting state up."

**Two inputs that need to mirror each other (Celsius ↔ Fahrenheit):**

\`\`\`jsx
import { useState } from 'react';

function TemperatureInput({ scale, value, onChange }) {
  return (
    <label>
      Enter temperature in {scale === 'c' ? 'Celsius' : 'Fahrenheit'}:
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Calculator() {
  // 🔼 State lifted to the common parent
  const [temperature, setTemperature] = useState('');
  const [scale, setScale] = useState('c');

  const celsius = scale === 'f' ? toCelsius(temperature) : temperature;
  const fahrenheit = scale === 'c' ? toFahrenheit(temperature) : temperature;

  return (
    <>
      <TemperatureInput
        scale="c"
        value={celsius}
        onChange={(v) => { setScale('c'); setTemperature(v); }}
      />
      <TemperatureInput
        scale="f"
        value={fahrenheit}
        onChange={(v) => { setScale('f'); setTemperature(v); }}
      />
      <p>{Number(celsius) >= 100 ? 'Water boils 🔥' : 'Not yet'}</p>
    </>
  );
}

const toCelsius = (f) => f === '' ? '' : ((Number(f) - 32) * 5) / 9;
const toFahrenheit = (c) => c === '' ? '' : (Number(c) * 9) / 5 + 32;
\`\`\`

Both inputs are now **fully controlled** by \`Calculator\`. Typing in either updates the shared source of truth; both inputs re-render from it.

**When to lift:**

- Two siblings need to read or react to the same value.
- A parent needs to observe or persist a child's state.
- You're tempted to "sync" state with \`useEffect\` between siblings — almost always a sign you should have lifted instead.

**What to avoid:**

- **Lifting too high.** Don't push form state into a global store or page-level component if only two siblings care. The parent that needs the value is the right home — no further.
- **Duplicating state** with \`useEffect(() => setLocal(prop), [prop])\` to "mirror" a parent's value into local state. That's two sources of truth that drift. Either use the prop directly or lift further.
- **Derived state stored separately.** \`fahrenheit\` above is computed from \`temperature\` + \`scale\` in render — not a third \`useState\`. Storing derived values means keeping them in sync manually.
- **Prop drilling 5+ levels.** That's the cue to reach for context or a state library, not deeper drilling.

**Inverse move — "colocate state":** If a piece of state is only used in one leaf, push it down. Keeping unused state high causes unnecessary re-renders of unrelated siblings.

**Visual aid suggestion:** A tree diagram of the component hierarchy with the shared state shown as a glowing node at the common ancestor, downward arrows labelled \`value\` to the children, and upward arrows labelled \`onChange\` from the children — making the "data down, events up" loop visually obvious.`,
    hint: 'Move shared state to the closest common ancestor',
  },
  {
    id: 188,
    category: 'react-core',
    title: 'Hydration in SSR — what is it and what can go wrong?',
    difficulty: 'senior',
    answer: `**Hydration** is the process React goes through after server-rendered HTML lands in the browser: it walks the existing DOM, attaches event listeners, and reconciles its internal tree with what's already on screen — *without* throwing the markup away and re-creating it.

**The pipeline:**

1. Server renders the component tree to an HTML string (\`renderToString\` / \`renderToPipeableStream\`).
2. Browser shows that HTML immediately — fast First Contentful Paint, but **nothing is interactive**.
3. JS bundle loads. React calls \`hydrateRoot(container, <App />)\`.
4. React walks the DOM in lock-step with a fresh render, attaching listeners and wiring up state. After this, the page is interactive.

**Minimal example:**

\`\`\`jsx
// server.js
import { renderToString } from 'react-dom/server';
import App from './App.jsx';

app.get('/', (_req, res) => {
  const html = renderToString(<App />);
  res.send(\`
    <!doctype html>
    <html><body>
      <div id="root">\${html}</div>
      <script type="module" src="/client.js"></script>
    </body></html>
  \`);
});

// client.js
import { hydrateRoot } from 'react-dom/client';
import App from './App.jsx';

hydrateRoot(document.getElementById('root'), <App />);
\`\`\`

**The core constraint: the first client render must match the server HTML byte-for-byte** (well, node-for-node). If it doesn't, you get a hydration mismatch — historically React would throw away the server HTML and re-render from scratch (visual flicker, lost LCP); React 18+ recovers more gracefully but still warns loudly.

**Classic mismatch causes:**

- \`new Date()\`, \`Math.random()\`, \`crypto.randomUUID()\` in render — different on server vs client.
- Reading \`window\`, \`localStorage\`, \`navigator\`, \`matchMedia\` during render — undefined on server.
- Locale-/timezone-dependent formatting (\`toLocaleString\`) — server in UTC, browser in user TZ.
- Browser extensions injecting nodes (Grammarly, password managers) — DOM no longer matches.
- Invalid HTML nesting (\`<p><div></div></p>\`, \`<table>\` without \`<tbody>\`) — the browser silently fixes it on parse, so the live DOM no longer matches what the server emitted.

**Fixes:**

\`\`\`jsx
// 1. Defer client-only values until after hydration
function Now() {
  const [now, setNow] = useState(null);
  useEffect(() => setNow(new Date().toLocaleTimeString()), []);
  return <span>{now ?? '…'}</span>; // identical on server & first client render
}

// 2. Explicitly mark intentional mismatches (React 18+)
<time suppressHydrationWarning>{new Date().toISOString()}</time>

// 3. Skip server-rendering a subtree entirely
'use client'; // Next.js App Router — runs only on the client
\`\`\`

**Partial / Selective / Streaming hydration** (React 18+):

- \`<Suspense>\` boundaries can hydrate independently — a slow widget no longer blocks the rest of the page from becoming interactive.
- The server can stream HTML for each boundary as it resolves; the client hydrates each chunk as its JS arrives.
- React prioritizes hydrating the part of the tree the user is interacting with — click a button in an un-hydrated section and React hydrates that subtree first.

**React Server Components change the math:** components marked as server-only are never hydrated at all — they ship as a serialized render result, not as JS. Only \`'use client'\` boundaries pay the hydration cost. This is the main reason SSR + RSC bundles can be dramatically smaller than classic SSR.

**Visual aid suggestion:** A timeline diagram with three lanes — *Network*, *Browser paint*, *Interactivity* — showing: HTML arrives → FCP (pixels on screen, page is "dead") → JS bundle arrives → hydration runs → page becomes interactive. Mark FCP, LCP, and TTI on the same timeline so it's clear hydration is what closes the gap between "visible" and "usable."`,
    hint: 'Attach React to server-rendered HTML — must match exactly',
  },

  // ─────────────────────────────────────────────────────────────────
  // React Hooks (12)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 67,
    category: 'react-hooks',
    title: 'What are the Rules of Hooks and why?',
    difficulty: 'mid',
    answer: `**Two rules:**

1. **Call hooks at the top level.** Never inside conditions, loops, or nested functions.
2. **Call hooks only from React functions.** Components or custom hooks (functions starting with \`use\`).

**Why:** React identifies hooks by **call order**, not by name. Internally it's roughly:

\`\`\`js
let hookIndex = 0;
const hookStates = [];

function useState(initial) {
  const i = hookIndex++;
  if (hookStates[i] === undefined) hookStates[i] = initial;
  return [hookStates[i], (v) => { hookStates[i] = v; render(); }];
}
\`\`\`

If your hooks call order changes between renders, indices misalign and state goes to the wrong hook.

**The forbidden pattern:**
\`\`\`jsx
function Component({ user }) {
  if (!user) return null;
  const [name, setName] = useState(''); // 🚩 conditional
}
\`\`\`

When \`user\` is null on first render but set on second, \`useState\` is suddenly called for the first time on render 2 — but React thinks it's been there all along.

**Correct version:**
\`\`\`jsx
function Component({ user }) {
  const [name, setName] = useState(''); // always called
  if (!user) return null;
  // ...
}
\`\`\`

**ESLint plugin** (\`eslint-plugin-react-hooks\`) catches these — keep it strict.`,
    hint: 'Call order matters; never conditional',
  },
  {
    id: 68,
    category: 'react-hooks',
    title: 'useState — initializer function vs value',
    difficulty: 'mid',
    answer: `Two ways to set initial state:

\`\`\`jsx
useState(expensiveCompute());      // runs every render!
useState(() => expensiveCompute()); // runs only on mount
\`\`\`

**The lazy initializer form** is for **expensive initial computations**. The function runs once at mount; the result is the initial state. Subsequent renders skip it entirely.

\`\`\`jsx
// ❌ This runs JSON.parse on every render
const [data, setData] = useState(JSON.parse(localStorage.getItem('data') ?? '{}'));

// ✅ Lazy — runs once
const [data, setData] = useState(() =>
  JSON.parse(localStorage.getItem('data') ?? '{}')
);
\`\`\`

**Setter also accepts a function — for state-derived updates:**

\`\`\`jsx
setCount(c => c + 1); // updater form, see Q58
\`\`\`

These two are different mechanisms — initializer runs at mount, updater runs on every set.

**Useful pattern — derive state from props ONCE, then own it:**

\`\`\`jsx
function Form({ initialValues }) {
  const [values, setValues] = useState(() => ({ ...initialValues }));
  // values is now component-owned; later changes to initialValues are ignored
}
\`\`\`

If you actually want \`values\` to track \`initialValues\`, you usually want a \`key\` prop on the component instead — a fresh mount resets state cleanly.`,
    hint: 'Function = lazy = runs once',
  },
  {
    id: 69,
    category: 'react-hooks',
    title: 'useEffect dependency arrays — common mistakes',
    difficulty: 'mid',
    answer: `**1. Missing dependency → stale closure:**
\`\`\`jsx
useEffect(() => {
  setTimeout(() => console.log(count), 1000);
}, []); // 🚩 count missing — always logs initial value
\`\`\`

**2. Object/array literal in deps → effect runs every render:**
\`\`\`jsx
useEffect(() => {
  fetch(url, { headers: { auth: token } });
}, [{ headers: { auth: token } }]); // 🚩 new object every render
\`\`\`
Fix: depend on primitives or memoize the object.

**3. Function in deps that's recreated every render:**
\`\`\`jsx
function Parent() {
  const fetcher = () => fetch(url); // new function each render
  return <Child fetcher={fetcher} />;
}

function Child({ fetcher }) {
  useEffect(() => {
    fetcher();
  }, [fetcher]); // 🚩 fires on every parent render
}
\`\`\`
Fix: \`useCallback\` in parent OR move the function inside the effect.

**4. Missing cleanup:**
\`\`\`jsx
useEffect(() => {
  window.addEventListener('resize', onResize);
  // 🚩 leaks listener on every re-run AND unmount
}, []);
\`\`\`
Fix: \`return () => window.removeEventListener('resize', onResize);\`

**5. Empty deps as a "componentDidMount" hack** when the effect actually uses props/state. Unless ESLint is muted, you'll get a warning. Resist disabling it — almost always indicates a real bug.

**Use the \`react-hooks/exhaustive-deps\` ESLint rule.** Don't disable it line-by-line without a comment explaining why.`,
    hint: 'Stale closures, unstable deps, missing cleanup',
  },
  {
    id: 70,
    category: 'react-hooks',
    title: 'When to use useReducer over useState',
    difficulty: 'mid',
    answer: `Reach for \`useReducer\` when:

1. **State has multiple sub-values that change together.**
\`\`\`jsx
// 4 setStates — easy to forget one
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [retryCount, setRetryCount] = useState(0);

// vs. one dispatch
dispatch({ type: 'fetch_start' });
dispatch({ type: 'fetch_success', payload });
\`\`\`

2. **Next state depends on multiple previous fields.**

3. **You want centralized state transitions** — reducer is testable as a pure function with no React.

4. **You want to dispatch from many places without prop drilling** — \`dispatch\` is referentially stable, safe to put in context.

**Example reducer:**

\`\`\`jsx
function reducer(state, action) {
  switch (action.type) {
    case 'fetch_start':
      return { ...state, loading: true, error: null };
    case 'fetch_success':
      return { loading: false, data: action.payload, error: null, retryCount: 0 };
    case 'fetch_error':
      return { ...state, loading: false, error: action.error, retryCount: state.retryCount + 1 };
    default:
      throw new Error(\`Unknown action: \${action.type}\`);
  }
}

const [state, dispatch] = useReducer(reducer, { loading: false, data: null, error: null, retryCount: 0 });
\`\`\`

**Bonus benefit — \`dispatch\` is stable:** No need to memoize callbacks that only call dispatch.

**Don't reach for it when:** simple boolean toggles, single string state, isolated counter. \`useState\` is fine — the indirection of reducer adds noise.`,
    hint: 'Multi-field state with related transitions',
  },
  {
    id: 71,
    category: 'react-hooks',
    title: 'useMemo vs useCallback',
    difficulty: 'mid',
    answer: `**\`useMemo(fn, deps)\`** — caches the **return value** of \`fn\`.
**\`useCallback(fn, deps)\`** — caches the **function itself**.

\`\`\`jsx
const expensive = useMemo(() => compute(data), [data]);
const handler = useCallback(() => doSomething(id), [id]);

// They're equivalent in this sense:
const handler = useMemo(() => () => doSomething(id), [id]);
\`\`\`

**When to actually use them:**

1. **Expensive computation in render** — \`useMemo\` skips it on irrelevant re-renders.

\`\`\`jsx
const sorted = useMemo(() => bigArray.toSorted(byDate), [bigArray]);
\`\`\`

2. **Stable reference for memoized child** — passing object/function/array props to \`React.memo\`'d children.

\`\`\`jsx
const config = useMemo(() => ({ limit: 10 }), []);
return <ExpensiveChart config={config} />; // memo'd
\`\`\`

3. **Stable reference for effect deps** — preventing infinite effect re-runs.

\`\`\`jsx
const options = useMemo(() => ({ retry: 3 }), []);
useEffect(() => fetcher(options), [options]); // doesn't re-fire each render
\`\`\`

**When NOT to use them — most of the time:**
- Cheap computations (\`useMemo\` overhead > savings).
- Functions passed to non-memoized children (no benefit, the child re-renders anyway).
- Inline event handlers (\`onClick={() => ...}\` is fine on a regular element).

**The React 19 Compiler** (currently rolling out) auto-memoizes — these hooks become rare in new code. Until then, profile before scattering them.`,
    hint: 'Cache value vs cache function',
  },
  {
    id: 72,
    category: 'react-hooks',
    title: 'useRef — three legitimate uses',
    difficulty: 'mid',
    answer: `\`useRef\` returns a mutable container whose \`.current\` survives re-renders. **Mutations don't trigger renders.**

**1. DOM access:**
\`\`\`jsx
const inputRef = useRef(null);
useEffect(() => inputRef.current?.focus(), []);
return <input ref={inputRef} />;
\`\`\`

**2. Mutable values that shouldn't trigger renders** — timers, mutation flags, "previous value" tracking.

\`\`\`jsx
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
\`\`\`

The ref pattern lets us always call the latest callback without re-creating the interval.

**3. Storing instance values** that aren't really React state — third-party library handles, request IDs, scroll position to restore.

\`\`\`jsx
const requestIdRef = useRef(0);
const fetchData = async () => {
  const id = ++requestIdRef.current;
  const result = await api();
  if (id === requestIdRef.current) setData(result); // ignore stale
};
\`\`\`

**Anti-pattern — using ref to "fix" stale closure when state would do:**
\`\`\`jsx
// ❌ Reaches for ref to avoid the lint warning
const dataRef = useRef(data);
dataRef.current = data;
\`\`\`

If the value should appear in UI, it's state. If it's truly internal, ref is fine.`,
    hint: 'DOM, mutable non-state, instance values',
  },
  {
    id: 73,
    category: 'react-hooks',
    title: 'Custom hooks — when and how to write them',
    difficulty: 'mid',
    answer: `Custom hooks are functions that **start with \`use\`** and call other hooks. They're for sharing **logic**, not UI.

**When to extract:**
- Same useEffect/useState combination appears in 2+ components.
- Component file is dominated by side-effect code rather than rendering.
- Logic is testable in isolation.

**Example — useDebouncedValue:**

\`\`\`jsx
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// Usage
function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  useEffect(() => {
    if (debouncedQuery) search(debouncedQuery);
  }, [debouncedQuery]);
  // ...
}
\`\`\`

**Patterns:**
- Return an array (\`[value, setValue]\`) for state-like hooks.
- Return an object (\`{ data, loading, error }\`) for hooks with multiple values.
- Accept a deps-like config to keep them flexible.

**Anti-patterns:**
- Naming \`getUser\` instead of \`useUser\` when calling hooks inside — breaks ESLint detection.
- Custom hooks that don't actually call hooks — those are just functions.
- Over-extraction — every component shouldn't be 5 custom hooks deep.

**Test custom hooks in isolation** with \`renderHook\` from \`@testing-library/react\`.`,
    hint: 'Share logic, not UI',
  },
  {
    id: 74,
    category: 'react-hooks',
    title: 'useLayoutEffect vs useEffect',
    difficulty: 'mid',
    answer: `Both run after render. **The difference is timing.**

| | \`useEffect\` | \`useLayoutEffect\` |
|---|---|---|
| Runs | After paint | After DOM mutation, before paint |
| Blocks browser paint? | No | Yes |
| Default choice? | Yes | Only when needed |

**Use \`useLayoutEffect\` when** you need to read DOM measurements and mutate before the user sees the result.

\`\`\`jsx
function Tooltip({ targetRef }) {
  const tooltipRef = useRef();
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    const target = targetRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    setPosition({
      top: target.top - tooltip.height - 8,
      left: target.left,
    });
  }, []);

  return <div ref={tooltipRef} style={position}>...</div>;
}
\`\`\`

If you used \`useEffect\` here, the user would see the tooltip flicker at \`(0,0)\` for one frame before snapping to position.

**Trade-off:** \`useLayoutEffect\` blocks the browser from painting until it's done. Slow code here directly causes jank.

**SSR caveat:** \`useLayoutEffect\` doesn't run during SSR — React warns. If you only need it client-side, that's fine. Otherwise, \`useEffect\` or a custom hook that picks based on environment.

**Default rule:** Start with \`useEffect\`. Switch only when you see flicker or you're measuring layout.`,
    hint: 'Layout = synchronous + before paint',
  },
  {
    id: 75,
    category: 'react-hooks',
    title: 'useContext — when to split contexts',
    difficulty: 'mid',
    answer: `**Problem:** A single big context causes every consumer to re-render when *any* value changes.

\`\`\`jsx
// ❌ Single context — anything reading it re-renders on every change
<AppContext.Provider value={{ user, theme, notifications, cart }}>
\`\`\`

**Fix:** Split by **change frequency** and **consumer overlap**.

\`\`\`jsx
<UserContext.Provider value={user}>     {/* changes rarely */}
<ThemeContext.Provider value={theme}>   {/* changes rarely */}
<CartContext.Provider value={cart}>     {/* changes often */}
  {children}
</CartContext.Provider>
</ThemeContext.Provider>
</UserContext.Provider>
\`\`\`

**Two-context pattern — separate state and dispatch:**

\`\`\`jsx
const StateCtx = createContext();
const DispatchCtx = createContext();

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <DispatchCtx.Provider value={dispatch}>
      <StateCtx.Provider value={state}>
        {children}
      </StateCtx.Provider>
    </DispatchCtx.Provider>
  );
}
\`\`\`

Components that only dispatch don't re-render on state changes. \`dispatch\` is referentially stable.

**Memoize the value object** (or split into atoms):
\`\`\`jsx
const value = useMemo(() => ({ user, login, logout }), [user]);
\`\`\`

Without memoization, the \`{}\` literal is new every render → all consumers re-render.

**When Context is wrong:** High-frequency updates (mouse position, animations). Reach for Zustand/Jotai or a selector-based store.`,
    hint: 'Split by frequency, memoize value',
  },
  {
    id: 76,
    category: 'react-hooks',
    title: 'useTransition vs useDeferredValue',
    difficulty: 'senior',
    answer: `Both let you mark updates as **low-priority** so React can keep urgent work (typing, hovering) responsive.

**\`useTransition\`** — wrap an update **at the source** of the change.

\`\`\`jsx
const [isPending, startTransition] = useTransition();
const [query, setQuery] = useState('');

function onChange(e) {
  setQuery(e.target.value); // urgent — input stays responsive
  startTransition(() => {
    setFilteredResults(filter(allItems, e.target.value)); // low-priority
  });
}
\`\`\`

**\`useDeferredValue\`** — defer a **value at the consumer** — useful when you don't control the update.

\`\`\`jsx
const [query, setQuery] = useState('');
const deferredQuery = useDeferredValue(query);
const results = useMemo(() => filter(allItems, deferredQuery), [deferredQuery]);
\`\`\`

**When to use which:**
- **You control the setState call** → \`useTransition\`. Cleaner.
- **You receive the value as a prop / external state** → \`useDeferredValue\`.
- **You want a "loading" indicator during the transition** → \`useTransition\` gives you \`isPending\`.

**What "low priority" actually means:**
- React can interrupt and discard a transition render if a new urgent update arrives.
- The user keeps seeing the previous UI state until the new one is ready.
- Doesn't change the result, just the scheduling.

**Real-world example:** Typing in a search box updating a 5,000-row table. Without these, every keystroke blocks the input for 100ms+. With them, typing stays at 60fps and results render when there's idle time.`,
    hint: 'Transition = at source, Deferred = at consumer',
  },
  {
    id: 77,
    category: 'react-hooks',
    title: 'useImperativeHandle — when do you need it?',
    difficulty: 'senior',
    answer: `\`useImperativeHandle\` lets a component expose a custom imperative API to its parent's ref — instead of the default DOM node.

**The problem it solves:** You need to expose specific methods (focus, scroll, validate) without leaking the entire DOM node.

\`\`\`jsx
const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ''; },
    // No direct DOM access exposed
  }), []);

  return <input ref={inputRef} {...props} />;
});

// Parent
const fancyRef = useRef();
fancyRef.current.focus(); // ✅
fancyRef.current.clear(); // ✅
fancyRef.current.style.color = 'red'; // undefined — DOM not exposed
\`\`\`

**When to use:**
- Form components where parent needs to imperatively focus, validate, or reset.
- Wrappers around third-party libraries — expose their API selectively.
- Animation primitives — \`pause()\`, \`resume()\`, \`reset()\`.

**When NOT to use:**
- 99% of React code. Declarative props/state should drive behavior.
- If your first instinct is "I need the parent to call a method on the child", check if the parent can pass a prop instead.

**React 19 simplification:** \`forwardRef\` is no longer required — refs are just regular props. \`useImperativeHandle\` still has its place but the boilerplate shrinks.

**Mental model:** Imperative escape hatch for the small set of cases where declarative APIs are awkward (focus, scroll, animations).`,
    hint: 'Expose custom API, not DOM',
  },
  {
    id: 78,
    category: 'react-hooks',
    title: 'useSyncExternalStore — what is it for?',
    difficulty: 'senior',
    answer: `Hook for safely subscribing to **external (non-React) stores** — Redux, Zustand, browser APIs, custom event emitters.

\`\`\`jsx
const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
\`\`\`

- \`subscribe(callback)\` — register the callback, return an unsubscribe function.
- \`getSnapshot()\` — read the current value (must be referentially stable for unchanged data).
- \`getServerSnapshot()\` — for SSR.

**Why it exists:** Pre-18, subscribing in \`useEffect\` had a tearing problem with concurrent rendering — different parts of the UI could see different snapshots during a single render pass.

**Example — subscribe to window.location:**

\`\`\`jsx
function useLocation() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('popstate', callback);
      return () => window.removeEventListener('popstate', callback);
    },
    () => window.location.pathname
  );
}
\`\`\`

**Example — online/offline status:**

\`\`\`jsx
function useOnlineStatus() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('online', cb);
      window.addEventListener('offline', cb);
      return () => {
        window.removeEventListener('online', cb);
        window.removeEventListener('offline', cb);
      };
    },
    () => navigator.onLine,
    () => true // assume online during SSR
  );
}
\`\`\`

**Most app code won't call this directly** — Zustand, Redux, etc. use it internally. But if you build a custom store, this is the primitive.

**Pitfall:** \`getSnapshot\` returning a new object every call → infinite render loop. Cache the snapshot or compare to last value.`,
    hint: 'Subscribe to non-React state safely',
  },

  // ─────────────────────────────────────────────────────────────────
  // State Management (8)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 79,
    category: 'state-management',
    title: 'How would you decide where state lives?',
    difficulty: 'mid',
    answer: `**The decision tree:**

\`\`\`
Is the state...
├── Local to one component?            → useState / useReducer
├── Shared between siblings?           → Lift to common parent
├── App-wide, low-frequency
│   (theme, auth, locale)?             → React Context
├── Server data with caching needs?    → React Query / SWR / RTK Query
├── Complex client state with derived
│   values, undo, async?               → Zustand / Jotai / Redux Toolkit
└── URL-related (filters, tabs, page)? → URL search params (router)
\`\`\`

**Categorize by lifecycle and audience, not by tool.** A real app has multiple kinds at once:

| State | Lives in | Why |
|---|---|---|
| Page, filters, sort | URL | Shareable, refresh-safe |
| Fetched data | React Query | Caching, dedup, refetch |
| Form values (in flight) | Local component | Ephemeral |
| User preferences | localStorage + context | Persistent, app-wide |
| In-flight selection | Local | Doesn't need persistence |

**Common mistakes:**
- Reflexively reaching for Redux on small apps.
- Putting server data in Redux — you'll reimplement React Query badly.
- Hoisting state to the root "in case we need it" — YAGNI; lift when shared.
- Treating context as a state manager for high-frequency updates — causes rerender storms.`,
    hint: 'Match tool to lifecycle + scope',
  },
  {
    id: 80,
    category: 'state-management',
    title: 'When should you reach for Redux?',
    difficulty: 'mid',
    answer: `**Reach for Redux (Toolkit specifically) when:**

- Many parts of the app need to **read and write** the same complex state.
- You need a **single audit trail** of state changes (DevTools time travel, replay).
- State logic involves complex **derived values** or **side effects** orchestration.
- The team is large and benefits from rigid conventions.
- You need **middleware** patterns: optimistic updates, conflict resolution, sagas.

**Don't reach for Redux when:**
- The app is small or new — start with \`useState\` + Context.
- Server data dominates state — use React Query/SWR.
- You only need theme/auth/locale — Context is fine.
- "I might need it later" — YAGNI.

**RTK (Redux Toolkit) is the modern Redux:**

\`\`\`jsx
// Slice — actions + reducer + types in one
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addItem(state, action) {
      state.items.push(action.payload); // Immer — looks mutable, isn't
    },
    removeItem(state, action) {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
  },
});

// Component
const items = useSelector(state => state.cart.items);
const dispatch = useDispatch();
dispatch(cartSlice.actions.addItem(newItem));
\`\`\`

**Modern alternatives** that fit different niches:
- **Zustand** — Redux-feel without boilerplate. Most common Redux replacement.
- **Jotai/Recoil** — atomic state, good for derived values.
- **MobX** — observable, mutation-based.

**Be honest in interviews:** "I'd default to React Query for server state and Zustand for client state. I'd reach for Redux Toolkit only if the team or app demands it."`,
    hint: 'Complex shared state with audit trail',
  },
  {
    id: 81,
    category: 'state-management',
    title: 'React Query vs SWR vs writing your own',
    difficulty: 'mid',
    answer: `Both **React Query (TanStack Query)** and **SWR** solve the same problem: server state caching, deduplication, background refetching, retries, optimistic updates.

**What they give you:**
- Automatic caching keyed by query key.
- Deduplication — N components requesting the same data → 1 network call.
- Stale-while-revalidate — show cached data, refetch in background.
- Window focus refetch — fresh data when user comes back.
- Retry logic for failed requests.
- Mutation helpers with cache invalidation.

**React Query example:**

\`\`\`jsx
const { data, isLoading, error } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => fetch(\`/api/users/\${userId}\`).then(r => r.json()),
  staleTime: 60_000, // fresh for 60s
});
\`\`\`

**Why not just \`useEffect\` + \`fetch\`?** That gets you the basic case. The list of edge cases you'd otherwise rebuild:
- Cache across components & routes.
- Cancel stale requests on dependency change.
- Deduplicate concurrent calls.
- Handle online/offline.
- Coordinate optimistic updates with rollback.
- Error boundaries.
- Infinite scroll / pagination state.

**When DIY is fine:**
- Tiny app with 1–2 endpoints.
- Highly custom protocol (WebSocket-only, GraphQL subscriptions).
- Specific architecture (server-driven UI).

**Differences (RQ vs SWR):**
- React Query has more features (mutations, infinite queries, devtools).
- SWR is smaller, simpler API.
- Both are excellent. Pick one and be consistent.

**Senior signal:** "I'd put server data in React Query. Reasons: caching across components, dedup, refetch policy, no need to rebuild loading/error state in every hook."`,
    hint: 'Server state needs cache + dedup + refetch',
  },
  {
    id: 82,
    category: 'state-management',
    title: 'When should state live in the URL?',
    difficulty: 'mid',
    answer: `URL state is the right answer when state needs to:

1. **Survive a refresh.** The user's filters, sort, page should still be there.
2. **Be shareable.** A teammate copying the link sees the same view.
3. **Work with the back button.** Navigation should restore previous filters.
4. **Be linkable from elsewhere** — deep links, emails, support tickets.

**Common URL state:**
- Pagination (\`?page=3\`)
- Filters (\`?status=open&tag=urgent\`)
- Sort (\`?sort=created_desc\`)
- Search query (\`?q=react\`)
- Open modal/tab (\`?modal=settings\`)
- Selected item in a master-detail view (\`/items/123\`)

**NOT URL state:**
- Hover state, drag in progress.
- Validation errors mid-edit.
- Form values (until submit — except for filters that are themselves the navigation).
- Highly transient UI.

**Implementation patterns:**

\`\`\`jsx
// Next.js
import { useSearchParams, useRouter } from 'next/navigation';

const searchParams = useSearchParams();
const status = searchParams.get('status') ?? 'all';

const router = useRouter();
const setStatus = (newStatus) => {
  const params = new URLSearchParams(searchParams);
  params.set('status', newStatus);
  router.push(\`?\${params.toString()}\`);
};
\`\`\`

**Library: \`nuqs\`** — typed search-param hooks for Next.js. Reads/writes feel like \`useState\`.

**Pitfall:** Don't bidirectionally sync URL with deep state without throttling — you'll stuff history with hundreds of entries per drag.`,
    hint: 'Refresh-safe, shareable, back-button',
  },
  {
    id: 83,
    category: 'state-management',
    title: 'Optimistic updates — how to implement them',
    difficulty: 'mid',
    answer: `**Optimistic update:** Update the UI as if the server call succeeded, before it actually does. On error, roll back.

**Why:** The UI feels instant — no spinner, no waiting. Acceptable when failure is rare and reversible.

**Manually with React state:**

\`\`\`jsx
async function toggleLike(postId) {
  const prevLiked = post.liked;

  // Optimistic update
  setPost(p => ({ ...p, liked: !p.liked, likeCount: p.likeCount + (p.liked ? -1 : 1) }));

  try {
    await api.toggleLike(postId);
  } catch (err) {
    // Rollback
    setPost(p => ({ ...p, liked: prevLiked, likeCount: p.likeCount + (prevLiked ? 1 : -1) }));
    showError('Could not update');
  }
}
\`\`\`

**With React Query \`useMutation\`:**

\`\`\`jsx
const mutation = useMutation({
  mutationFn: toggleLike,
  onMutate: async (postId) => {
    await queryClient.cancelQueries(['post', postId]);
    const previous = queryClient.getQueryData(['post', postId]);
    queryClient.setQueryData(['post', postId], old => ({ ...old, liked: !old.liked }));
    return { previous };
  },
  onError: (err, postId, context) => {
    queryClient.setQueryData(['post', postId], context.previous); // rollback
  },
  onSettled: (data, err, postId) => {
    queryClient.invalidateQueries(['post', postId]); // sync with server truth
  },
});
\`\`\`

**Things to handle:**
- **Concurrent mutations** — second update before first resolves. Cancel or queue.
- **Long failures** — user might continue interacting. Make sure rollback doesn't clobber newer edits.
- **Multi-step rollback** — if you optimistically updated 3 places, all 3 need to revert.
- **Network slow vs network down** — separate UX for "still trying" vs "definitely failed".`,
    hint: 'Update now, rollback on error',
  },
  {
    id: 84,
    category: 'state-management',
    title: 'Designing state for a paginated, filterable, sortable table',
    difficulty: 'senior',
    answer: `Walk-through of how to **categorize** state — this is what interviewers want to hear.

| State | Where | Why |
|---|---|---|
| Page, filters, sort | URL search params | Shareable, refresh-safe, back-button |
| Fetched data | React Query (cached by query key) | Auto-cache, dedup, background refetch |
| Selected row IDs | Local component state | Ephemeral — doesn't outlive the page |
| Bulk action in flight | React Query mutation | Optimistic + rollback |
| Page size preference | localStorage + context | Persists per user |
| Open detail panel | URL (\`?detail=123\`) | Linkable |

**Reasoning out loud:**

> "Page, filters, and sort go in the URL because users expect bookmarks and back-button to work. The data they produce goes in React Query — keyed by those URL params, so navigation between filtered states reuses cached data. Selection is local state because it's ephemeral and doesn't need to survive a refresh. For bulk actions, I'd use a React Query mutation with optimistic update — the user clicks 'Delete 50' and rows disappear immediately, with a rollback if the server rejects."

**Why this answer wins:**
- Demonstrates state lifecycle thinking, not "Redux for everything."
- Each piece has a justified home.
- Acknowledges trade-offs (e.g., URL state has serialization limits).

**Bonus signals:**
- Mention **debouncing** filter changes before pushing to URL.
- Mention **pagination** strategy (cursor vs offset; cursor wins at depth).
- Mention **virtualization** if the table is huge.
- Mention **scroll restoration** on back navigation.`,
    hint: 'Categorize by lifecycle',
  },
  {
    id: 85,
    category: 'state-management',
    title: 'What is "lifting state up" and when not to do it',
    difficulty: 'junior',
    answer: `**Lifting state up:** Moving state from a child to a common parent so multiple children can share it.

\`\`\`jsx
// Before — sister components can't communicate
<Form>
  <NameInput />     // owns its own value
  <SubmitButton />  // can't read NameInput's value
</Form>

// After — parent owns state
<Form>
  <NameInput value={name} onChange={setName} />
  <SubmitButton disabled={!name} />
</Form>
\`\`\`

**The rule of "lift to common ancestor":** The closest parent that uses or coordinates the state.

**When NOT to lift:**

1. **State only one component cares about.** Keep it local. Lifting causes parent re-renders for changes the parent doesn't care about.

2. **State that should be shared across distant components.** Lifting all the way to the root is "prop drilling hell." Use Context, a state library, or co-locate the logic differently.

3. **Server state.** Don't lift fetched data into state — let React Query/SWR cache it.

**Symptoms of over-lifting:**
- A leaf input change triggers re-renders of the entire app.
- A parent has 15 props it just passes through.
- Components have lots of props they don't use, just forward.

**Symptoms of under-lifting (state should be lifted):**
- Two siblings have copies of the same state and they desync.
- A child has a callback that updates "shared" state via a global.
- "Why isn't this updating when the other one changes?"

**Pre-lifting check:** Can the parent actually use this state, or am I just relocating it for the sake of relocation?`,
    hint: 'Lift to closest common ancestor',
  },
  {
    id: 86,
    category: 'state-management',
    title: 'What problem does Zustand solve?',
    difficulty: 'mid',
    answer: `**Zustand** is a tiny (~1KB) state library that gives you Redux-like centralization with hook-like ergonomics — no boilerplate, no provider, no actions/reducers ceremony.

\`\`\`jsx
import { create } from 'zustand';

const useCart = create((set, get) => ({
  items: [],
  addItem: (item) => set(state => ({ items: [...state.items, item] })),
  removeItem: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) })),
  total: () => get().items.reduce((sum, i) => sum + i.price, 0),
}));

// Use it
function Cart() {
  const items = useCart(state => state.items); // selector subscription
  const removeItem = useCart(state => state.removeItem);
  return <List items={items} onRemove={removeItem} />;
}

// From outside React
useCart.getState().addItem(...);
useCart.subscribe(state => console.log(state));
\`\`\`

**Why people pick it over Redux:**
- No provider — state lives at module level.
- No actions/reducers — just a function that returns state and methods.
- Selector-based subscriptions — components only re-render when their selected slice changes.
- Plays well with TypeScript without ceremony.
- Built-in middleware for persist, devtools, immer.

**Why people pick it over Context:**
- No re-render storms — selectors filter what each component subscribes to.
- Can be read/updated from outside React (useful for utility functions, callbacks, tests).

**Trade-offs:**
- Less ecosystem than Redux (fewer middleware, less documentation).
- Module-level state can feel awkward for SSR — needs care with hydration.
- For very complex state machines, Redux's strict structure helps; Zustand can become spaghetti.

**Mid-level signal:** Knowing what tool to pick when. Zustand is the modern default for client state in apps that aren't tiny.`,
    hint: 'Lightweight global store with selectors',
  },
];
