import type { Question } from '../lib/types';

export const questions: Question[] = [
  // ─────────────────────────────────────────────────────────────────
  // Closure deep dives (4)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 136,
    category: 'fundamentals',
    title: 'Closure with var in a for-loop — why all callbacks log the final value',
    difficulty: 'mid',
    answer: `Classic interview question that catches people off guard:

\`\`\`js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 3, 3, 3
\`\`\`

**Why?** \`var\` is **function-scoped**, not block-scoped. There's exactly **one** \`i\` shared by all three callbacks. By the time the timers fire (100ms later), the loop finished and \`i === 3\`. All three closures point to the same variable.

**Fix 1 — \`let\` (block-scoped):**

\`\`\`js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 0, 1, 2
\`\`\`

\`let\` creates a **fresh binding per iteration**. Each callback closes over its own \`i\`.

**Fix 2 — IIFE (the pre-ES6 trick):**

\`\`\`js
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
\`\`\`

Each iteration calls a function that creates a new scope with its own \`j\`.

**Fix 3 — \`bind\`:**

\`\`\`js
for (var i = 0; i < 3; i++) {
  setTimeout(console.log.bind(null, i), 100);
}
\`\`\`

\`bind\` snapshots the value at bind time.

**The deeper insight — what \`let\` actually does in for-loops:**

The spec mandates a "per-iteration binding." It's almost as if \`let\` rewrites your loop into:

\`\`\`js
{
  let i = 0;
  if (i < 3) {
    setTimeout(...);
    {
      let i_next = i + 1;
      // i_next becomes the next iteration's i
    }
  }
}
\`\`\`

Each iteration gets a brand-new variable, so each closure captures a different one.

**Senior signal:** "Closures don't capture values — they capture *bindings*. \`var\`'s function-level binding is shared; \`let\`'s block-level binding is fresh per iteration."`,
    hint: 'var = one binding for all; let = fresh per iteration',
  },
  {
    id: 137,
    category: 'fundamentals',
    title: 'Closures and memory — when do they leak?',
    difficulty: 'senior',
    answer: `A closure keeps its enclosing scope alive as long as the closure itself is reachable. That's normally fine, but it becomes a leak when:

**1. The closure outlives its usefulness but is still referenced.**

\`\`\`js
function attachHandler(button) {
  const heavyData = new Array(1_000_000).fill('...');

  button.addEventListener('click', () => {
    // Even if we never USE heavyData here,
    // the closure captures the whole scope
    console.log('clicked');
  });
}
\`\`\`

\`heavyData\` stays alive as long as the listener is attached, even though we never read it. **Engines are getting smarter** — V8 will sometimes optimize and only retain variables actually referenced — but you can't rely on it across all code paths and engines.

**Fix — narrow the scope:**

\`\`\`js
function attachHandler(button) {
  const heavyData = new Array(1_000_000).fill('...');
  // ... use heavyData here, then drop it ...

  button.addEventListener('click', makeHandler());
}

function makeHandler() {
  return () => console.log('clicked'); // no enclosing heavy scope
}
\`\`\`

**2. A long-lived object holds references to short-lived ones.**

\`\`\`js
let cache = {};
function processUser(user) {
  cache[user.id] = () => console.log(user.name); // closure retains user
}
\`\`\`

Every \`user\` ever passed in is retained — even after they've logged out, navigated away, etc.

**Fix:** Don't capture more than you need:

\`\`\`js
cache[user.id] = ((name) => () => console.log(name))(user.name);
\`\`\`

Or use \`WeakMap\` keyed on the user, which lets the entry be GC'd when the user is no longer referenced elsewhere.

**3. Detached DOM nodes referenced via closures.**

\`\`\`js
function setup() {
  const node = document.getElementById('big');
  return () => node.outerHTML; // closure pins the DOM node
}
\`\`\`

If \`node\` later gets removed from the DOM but this returned function is kept around, the detached node stays in memory.

**How to investigate:** Chrome DevTools → Memory → heap snapshot. Filter by "Detached" to find DOM leaks; sort by retained size to find unexpected closures keeping things alive.

**Senior insight:** "Closures aren't *the* memory leak — they're the *vehicle* for one. A closure leak is really a long-lived reference holding a scope you forgot it was holding."`,
    hint: 'Closures retain their full scope; narrow what you capture',
  },
  {
    id: 138,
    category: 'fundamentals',
    title: 'Build a private counter using closures — and then the modern alternatives',
    difficulty: 'mid',
    answer: `**Classic closure pattern:**

\`\`\`js
function createCounter() {
  let count = 0; // private — only the returned methods can access
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
  };
}

const c = createCounter();
c.increment(); c.increment();
c.value(); // 2
c.count;   // undefined — truly inaccessible
\`\`\`

\`count\` is genuinely private: there is no syntactic way to reach it from outside the closure. This was the canonical "private state" pattern for decades.

**ES2022 — class private fields (\`#\`):**

\`\`\`js
class Counter {
  #count = 0;
  increment() { return ++this.#count; }
  decrement() { return --this.#count; }
  get value() { return this.#count; }
}

const c = new Counter();
c.increment();
c.value;   // 1
c.#count;  // SyntaxError, even from a derived class
\`\`\`

Truly private — enforced at parse time, not by convention. Trying to reach \`#count\` from outside is a syntax error.

**WeakMap pattern (pre-ES2022 but still useful for non-class code):**

\`\`\`js
const _count = new WeakMap();
class Counter {
  constructor() { _count.set(this, 0); }
  increment() { _count.set(this, _count.get(this) + 1); }
  get value() { return _count.get(this); }
}
\`\`\`

\`_count\` is module-scoped; consumers can't reach it. WeakMap means each \`Counter\` instance's data is GC'd along with the instance.

**Symbol convention (NOT private):**

\`\`\`js
const COUNT = Symbol('count');
class Counter {
  constructor() { this[COUNT] = 0; }
}
const c = new Counter();
Object.getOwnPropertySymbols(c); // [Symbol(count)] — visible
\`\`\`

Symbols are *unenumerable by default* but discoverable. They prevent accidents, not attackers.

**When to use which:**
- **Closure factory** — when you don't need \`instanceof\` or class semantics; clean for small state machines.
- **Class \`#field\`** — modern default for object-oriented code. Use this in new code.
- **WeakMap** — when you need privacy across module boundaries without classes, or for adding private state to objects you don't own.

**Common interview trap:** Saying TypeScript's \`private\` is "private." It's not — it's a compile-time check only. At runtime, \`obj.privateField\` works fine. Use \`#\` for actual privacy.`,
    hint: 'Closure → #fields → WeakMap; Symbol & TS private are conventions',
  },
  {
    id: 139,
    category: 'fundamentals',
    title: 'Currying with closures — partial application explained',
    difficulty: 'mid',
    answer: `**Currying** transforms \`f(a, b, c)\` into \`f(a)(b)(c)\` — each call returns a new function awaiting the next argument.

\`\`\`js
const add = (a) => (b) => (c) => a + b + c;
add(1)(2)(3); // 6

// Reusable partial:
const add1 = add(1);
const add1and2 = add1(2);
add1and2(3); // 6
add1and2(7); // 8
\`\`\`

Each level captures its arg via closure.

**Generic curry helper:**

\`\`\`js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}

const sum3 = curry((a, b, c) => a + b + c);
sum3(1)(2)(3);  // 6
sum3(1, 2)(3);  // 6
sum3(1)(2, 3);  // 6
\`\`\`

**Why \`fn.length\`?** It's the number of parameters declared. The curry knows when enough args have arrived.

**Real-world value:**

**1. Configurable callbacks:**

\`\`\`js
const filterBy = (key) => (value) => (item) => item[key] === value;
const isAdmin = filterBy('role')('admin');
users.filter(isAdmin);
\`\`\`

**2. Logging with bound context:**

\`\`\`js
const log = (level) => (message) => console.log(\`[\${level}] \${message}\`);
const error = log('ERROR');
error('Database connection failed');
\`\`\`

**3. Composing pipelines (with libraries like Ramda):**

\`\`\`js
const transform = R.pipe(
  R.filter(R.propEq('active', true)),
  R.map(R.prop('email')),
  R.uniq,
);
\`\`\`

**Currying vs partial application:**
- **Curry:** \`f(a)(b)(c)\` — one arg per call.
- **Partial:** \`f.bind(null, a, b)\` — fixes some args, leaves others variadic.

Both rely on closures to remember the bound arguments.

**Pitfalls:**
- **Performance** — currying creates many small functions. Hot paths shouldn't curry per-call.
- **\`this\` and arrow functions** — curried arrow chains lose dynamic \`this\`. Usually fine for utilities; an issue for methods.
- **Variadic functions** — \`fn.length\` doesn't account for default parameters or rest args.`,
    hint: 'Each level captures one arg via closure',
  },

  // ─────────────────────────────────────────────────────────────────
  // Execution context & runtime model (3)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 140,
    category: 'fundamentals',
    title: 'What is the execution context? Walk through the call stack',
    difficulty: 'senior',
    answer: `An **execution context** is the environment a piece of JS runs in. It tracks:

1. **Variable Environment** — the local \`var\`-declared variables and function declarations.
2. **Lexical Environment** — \`let\`, \`const\`, and references to outer scopes.
3. **\`this\` binding** — what \`this\` resolves to.
4. **Realm** — the global object, intrinsics (\`Array.prototype\`, etc.), and the lexical environment of the module/script.

**Three kinds:**
- **Global** — created once when the script loads.
- **Function** — created on each function call.
- **Eval** — created by \`eval()\` (rarely used, often forbidden in modern code).

**The call stack tracks active contexts:**

\`\`\`js
function outer() {
  inner();
}
function inner() {
  console.log('hi');
}
outer();
\`\`\`

Stack progression:
\`\`\`
[push] global              → script starts
[push] outer()             → call to outer
[push] inner()             → outer calls inner
[push] console.log(...)    → inner calls log
[pop]  console.log(...)    → log returns
[pop]  inner()             → inner returns
[pop]  outer()             → outer returns
[pop]  global              → script ends
\`\`\`

The stack is what you see in DevTools when paused on a breakpoint. Each frame *is* an execution context.

**Two phases per context — Creation and Execution:**

**Creation phase** (happens before any code runs):
- Hoist function declarations (entire function bodies).
- Hoist \`var\` declarations (set to \`undefined\`).
- Set up \`this\`, scope chain, outer environment reference.
- \`let\` and \`const\` are recorded but uninitialized — accessing them now throws (Temporal Dead Zone).

**Execution phase:**
- Run statements top-to-bottom.
- Assignments happen here.

**Why this matters:**

\`\`\`js
console.log(x); // undefined (var was hoisted; not yet assigned)
console.log(y); // ReferenceError: TDZ
console.log(foo); // [Function: foo] (whole function hoisted)
console.log(bar); // ReferenceError: TDZ

var x = 1;
let y = 2;
function foo() {}
const bar = function() {};
\`\`\`

**Stack overflow:**

\`\`\`js
function recurse() { return recurse(); }
recurse(); // RangeError: Maximum call stack size exceeded
\`\`\`

Each call pushes a frame; without a base case, the stack runs out (typically ~10–15k frames).

**The deeper picture:** The call stack is one of two queues the engine processes — alongside microtasks, macrotasks, and the event loop. Synchronous code completes its full stack before the next async task fires.`,
    hint: 'Variable env + lexical env + this + realm; stack tracks frames',
  },
  {
    id: 141,
    category: 'fundamentals',
    title: 'Hoisting — what actually moves, and what doesn\'t',
    difficulty: 'mid',
    answer: `**Hoisting** is a side effect of the creation phase, not a literal "moving" of code. Different declaration types hoist differently.

**\`var\` — hoisted, initialized to \`undefined\`:**

\`\`\`js
console.log(x); // undefined
var x = 5;

// Engine treats it as:
// var x;            ← creation phase (hoisted)
// console.log(x);   ← undefined
// x = 5;            ← assignment stays in place
\`\`\`

**\`let\` and \`const\` — hoisted, but uninitialized:**

\`\`\`js
console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 5;
\`\`\`

The variable exists from the start of the block, but it's in the **Temporal Dead Zone** (TDZ) until the \`let\` line. Reading it during TDZ throws.

**Function declarations — fully hoisted:**

\`\`\`js
hello(); // works
function hello() { console.log('hi'); }
\`\`\`

The whole function (name + body) is available from the start of the scope.

**Function expressions — only the variable is hoisted (per its keyword):**

\`\`\`js
hi(); // TypeError: hi is not a function
var hi = function() {};

// Treated as:
// var hi;       ← undefined
// hi();         ← undefined() → TypeError
// hi = function() {};
\`\`\`

**Class declarations — hoisted but TDZ:**

\`\`\`js
new Foo(); // ReferenceError: Cannot access 'Foo' before initialization
class Foo {}
\`\`\`

**Practical takeaways:**

1. **Don't rely on hoisting.** Always declare before use. Hoisting is a *language quirk* to understand, not a *style* to use.

2. **Function declarations vs expressions:**
\`\`\`js
// Declarations — fully usable anywhere in scope
function add(a, b) { return a + b; }

// Expressions — same rules as the variable they're assigned to
const add = (a, b) => a + b;
\`\`\`

3. **TDZ is your friend.** \`let\`/\`const\` failing loudly is better than \`var\`'s silent \`undefined\`. Always prefer \`const\` (then \`let\`).

4. **The "two-phase" mental model:**
\`\`\`
Phase 1 (creation): scan declarations, set up scope
Phase 2 (execution): run statements top to bottom
\`\`\`

**Trick question:**
\`\`\`js
function foo() {
  return bar;
  var bar = 1;
}
foo(); // undefined — bar is hoisted, return runs before assignment
\`\`\``,
    hint: 'var → undefined; let/const → TDZ; function decl → full body',
  },
  {
    id: 142,
    category: 'fundamentals',
    title: 'Strict mode — what changes and why it matters',
    difficulty: 'mid',
    answer: `\`'use strict'\` opts into stricter parsing and runtime behavior. Modules and class bodies are strict by default.

**What changes:**

**1. Implicit globals throw:**

\`\`\`js
function loose() { x = 10; }      // sloppy: creates global x
function strict() { 'use strict'; x = 10; } // ReferenceError
\`\`\`

**2. Silent failures become errors:**

\`\`\`js
'use strict';
const obj = Object.freeze({ a: 1 });
obj.a = 2;       // TypeError (silently ignored without strict)
delete obj.a;    // TypeError
\`\`\`

**3. \`this\` in standalone function calls is \`undefined\`:**

\`\`\`js
function f() { return this; }
f();                     // sloppy: window/global
('use strict', f)();     // strict: undefined
\`\`\`

This makes accidental method un-binding loud:

\`\`\`js
const handler = obj.method;
handler(); // strict: this === undefined → fails fast
           // sloppy: this === window → may corrupt globals silently
\`\`\`

**4. Reserved words are reserved:**

\`\`\`js
'use strict';
let public = 1; // SyntaxError — public, private, etc. are reserved
\`\`\`

**5. Duplicate parameter names throw:**

\`\`\`js
function bad(a, a) {} // strict: SyntaxError
\`\`\`

**6. Octal literals (\`0\` prefix) banned:**

\`\`\`js
'use strict';
const n = 0o755; // OK (explicit octal)
const m = 0755;  // SyntaxError
\`\`\`

**7. \`with\` is forbidden** — banned in strict mode entirely.

**8. \`eval\` and \`arguments\` are tightened:**
- Can't be assigned or used as variable names.
- \`eval\` doesn't introduce vars into the surrounding scope.
- \`arguments\` doesn't track parameter reassignment.

**Why it matters:**

- **Catches bugs at parse time** — typos like \`varriable = 5\` would silently make a global.
- **Required for ES modules** and classes — they're always strict.
- **Better optimizer output** — engines can make assumptions that sloppy mode breaks.

**Modern context:** If you write modules (\`import\`/\`export\`) or classes, you're in strict mode automatically. The \`'use strict'\` pragma matters mainly for legacy script files (no module system).

**Don't:**
- Mix strict and sloppy code in the same file (top-of-file directive is the cleanest).
- Rely on sloppy-mode behavior as a feature.`,
    hint: 'Strict catches silent bugs; modules + classes are strict by default',
  },

  // ─────────────────────────────────────────────────────────────────
  // Event loop deep dives (3)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 143,
    category: 'event-loop',
    title: 'Microtasks vs macrotasks — predict the output',
    difficulty: 'senior',
    answer: `Walk through this without running it:

\`\`\`js
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => {
  console.log('3');
  return Promise.resolve();
}).then(() => console.log('4'));

queueMicrotask(() => console.log('5'));

console.log('6');
\`\`\`

**Output:** \`1, 6, 3, 5, 4, 2\`

**Why:**

1. **Synchronous frame** runs first: \`1\`, then \`6\`. Sync code drains entirely before any async work.

2. **Microtask queue drains next** (before any macrotask, before rendering). It contains: \`Promise.resolve().then(...)\` and \`queueMicrotask(...)\`. They run in registration order:
   - \`3\` logs.
   - That \`then\`'s callback returns \`Promise.resolve()\`, which **adds a hop** — \`'4'\`'s \`then\` won't fire until *that* inner promise is resolved (and resolution requires another microtask trip).
   - \`5\` logs (next microtask in the queue).
   - The next microtask cycle: \`4\` logs.

3. **Macrotask queue** finally: \`setTimeout\` callback fires. \`2\` logs.

**Key rules:**

- **The microtask queue drains completely** between each macrotask. If a microtask schedules another microtask, *that* runs before any macrotask.
- **Macrotasks** include: \`setTimeout\`, \`setInterval\`, I/O callbacks, \`MessageChannel\`, UI events.
- **Microtasks** include: promise reactions, \`queueMicrotask\`, \`MutationObserver\` callbacks, \`process.nextTick\` (Node-only — even higher priority than other microtasks).

**The "promise-returning-a-promise hop":**

\`\`\`js
Promise.resolve()
  .then(() => Promise.resolve('a'))
  .then(v => console.log(v));
\`\`\`

This takes **two extra microtask cycles** beyond a simple \`Promise.resolve('a').then(...)\`. The runtime has to:
1. Receive the inner promise.
2. Schedule a job to follow it.
3. When it resolves, schedule a job to call the outer \`then\`.

**Why this matters in practice:**

- **Tight loops of microtasks can starve the event loop.** A microtask that synchronously schedules another microtask will block macrotasks (and rendering) indefinitely.

\`\`\`js
function evil() {
  Promise.resolve().then(evil); // browser tab freezes
}
evil();
\`\`\`

- **\`setTimeout(fn, 0)\` is NOT immediate.** It waits for the current microtask queue to drain, plus a minimum 4ms throttle in browsers (1ms in Node).

- **For "do this after the current call stack but ASAP," use \`queueMicrotask(fn)\`,** not \`setTimeout(fn, 0)\`. It runs sooner and without the throttle.

**Browser specifics:** Rendering happens between macrotasks (after microtasks drain). That's why DOM updates inside long microtask chains never paint.`,
    hint: 'Sync → all microtasks → one macrotask → repeat',
  },
  {
    id: 144,
    category: 'event-loop',
    title: 'How does the browser schedule rendering relative to JS?',
    difficulty: 'senior',
    answer: `The "frame" is the unit of browser work. At ~60fps, that's ~16.7ms per frame. Within each frame, the browser does this rough sequence:

\`\`\`
[ Run scheduled tasks ]
   - One macrotask (e.g. setTimeout callback, event handler)
   - Drain ALL microtasks
[ requestAnimationFrame callbacks ]
[ Style recalculation ]
[ Layout (reflow) ]
[ Paint ]
[ Composite ]
[ Idle time ] → requestIdleCallback runs here, if any
\`\`\`

**Crucial implications:**

**1. Microtasks block painting.**

\`\`\`js
button.onclick = () => {
  let i = 0;
  function loop() {
    if (i++ < 1_000_000) {
      Promise.resolve().then(loop);
    }
  }
  loop();
};
\`\`\`

This freezes the UI. Microtasks must drain before the frame can render. The browser never gets to layout/paint.

**2. \`requestAnimationFrame\` is the right hook for visual updates.**

\`\`\`js
function animate() {
  element.style.transform = \`translateX(\${x}px)\`;
  x += 1;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
\`\`\`

rAF callbacks fire just before the browser paints. Reading layout *after* rAF will reflect the latest changes; writing layout in rAF gets composed into this frame.

**3. \`requestIdleCallback\` for non-urgent work.**

\`\`\`js
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length) {
    doTask(tasks.shift());
  }
});
\`\`\`

Runs only if the browser has spare time after the current frame's work. Good for analytics, prefetching, lazy index building.

**4. Long tasks block input.**

If JS runs for >50ms in one synchronous chunk, browsers flag it as a "Long Task" and input may queue up. The user clicks → nothing happens for 200ms → click event fires.

**Avoid via:**
- Yielding back to the event loop with \`await new Promise(r => setTimeout(r, 0))\` between chunks.
- Using \`scheduler.yield()\` (newer API).
- Web Workers for true offload.
- \`isInputPending()\` (newer API) to bail out of work when input is waiting.

**5. Microtask vs rAF — picking the right one:**

| Goal | Use |
|---|---|
| "Run after this stack" | \`queueMicrotask\` |
| "Run before next paint" | \`requestAnimationFrame\` |
| "Run when idle" | \`requestIdleCallback\` |
| "Run after at least N ms" | \`setTimeout\` |

**6. React's scheduler.** React 18+ has its own scheduler that yields to the browser between rendering work units. It uses \`MessageChannel\` (a macrotask) to break up renders, allowing input/paint to happen between.

**Senior insight:** "JS execution and rendering compete for the main thread. If you can't move work off-thread (Worker), at least break it into chunks that yield to the event loop. The browser would rather paint stale-but-quick than wait for perfect-but-slow."`,
    hint: 'Macrotask → microtasks → rAF → render → idle',
  },
  {
    id: 145,
    category: 'event-loop',
    title: 'What does Promise.all vs allSettled vs any vs race actually do?',
    difficulty: 'mid',
    answer: `Four combinators with importantly different failure semantics:

**\`Promise.all\` — all-or-nothing:**

\`\`\`js
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
\`\`\`

- **Resolves** when all input promises resolve, with an array of values (in input order).
- **Rejects immediately** on the *first* rejection. Other promises keep running but their outcomes are ignored.
- **Use when:** you need every result and any failure makes the whole batch worthless.

**\`Promise.allSettled\` — wait for everything:**

\`\`\`js
const results = await Promise.allSettled([req1(), req2(), req3()]);
results.forEach(r => {
  if (r.status === 'fulfilled') console.log(r.value);
  else console.error(r.reason);
});
\`\`\`

- **Always resolves** when all inputs settle.
- **Returns** an array of \`{ status, value }\` or \`{ status, reason }\`.
- **Use when:** partial success is acceptable; e.g. fan-out to multiple optional services.

**\`Promise.race\` — first to settle wins:**

\`\`\`js
const winner = await Promise.race([
  fetch('/api'),
  new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
]);
\`\`\`

- **Settles** with whichever input settles first (resolve OR reject).
- **Classic use:** racing a request against a timeout.
- **Pitfall:** non-winners keep running. If they have side effects (writing to disk, mutating state), they execute regardless.

**\`Promise.any\` — first success wins:**

\`\`\`js
const fastest = await Promise.any([
  fetch('https://api1.example.com'),
  fetch('https://api2.example.com'),
  fetch('https://api3.example.com'),
]);
\`\`\`

- **Resolves** on the first fulfillment.
- **Rejects** with an \`AggregateError\` only if *all* inputs reject.
- **Use when:** you have multiple sources for the same data; first responder wins.

**Comparison table:**

| | Resolves when | Rejects when |
|---|---|---|
| \`all\` | All resolve | Any rejects (first one) |
| \`allSettled\` | All settle | Never |
| \`race\` | First settles (resolve OR reject) | First settles with rejection |
| \`any\` | First resolves | All reject (AggregateError) |

**Key gotchas:**

**1. Inputs run concurrently regardless of which combinator you use.** You're not "starting" them with \`Promise.all\` — they were already running when you created them.

**2. Race conditions with mutable state:**

\`\`\`js
let lastResponse;
Promise.race([
  fetch('/a').then(r => { lastResponse = 'a'; }),
  fetch('/b').then(r => { lastResponse = 'b'; }),
]);
// lastResponse may be either, depending on timing
\`\`\`

**3. Aborting losers** — combinators don't cancel the runners-up. Use \`AbortController\` if needed.

\`\`\`js
const ctrl = new AbortController();
const winner = await Promise.race([
  fetch('/api1', { signal: ctrl.signal }),
  fetch('/api2', { signal: ctrl.signal }),
]);
ctrl.abort(); // cancel the other request
\`\`\``,
    hint: 'all = all or first reject; allSettled = wait all; any = first success; race = first either',
  },

  // ─────────────────────────────────────────────────────────────────
  // Promise execution & async patterns (3)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 146,
    category: 'event-loop',
    title: 'Promise lifecycle — pending, fulfilled, rejected, and chaining',
    difficulty: 'mid',
    answer: `A promise has three states:

- **Pending** — not yet settled.
- **Fulfilled** — settled with a value.
- **Rejected** — settled with a reason.

Once settled, a promise is **immutable** — you can't change its state. \`resolve()\` or \`reject()\` on an already-settled promise is a no-op.

**Constructing a promise:**

\`\`\`js
const p = new Promise((resolve, reject) => {
  fetch('/data')
    .then(r => resolve(r))
    .catch(e => reject(e));
});
\`\`\`

But this is the **promise-creation antipattern** if your async work is *already* a promise. Just return the existing one:

\`\`\`js
function getData() {
  return fetch('/data'); // no need to wrap
}
\`\`\`

**Chaining — every \`.then\` returns a NEW promise:**

\`\`\`js
const p1 = Promise.resolve(1);
const p2 = p1.then(v => v + 1);   // p2 is a new promise; p1 is unchanged
const p3 = p2.then(v => v * 2);

await p1; // 1
await p2; // 2
await p3; // 4
\`\`\`

**The four return-value rules in \`then\`:**

1. **Return a value** → the next \`then\` receives that value.
2. **Return a promise** → the next \`then\` waits for it (the chain "adopts" the inner promise).
3. **Throw** → the chain rejects; the next \`catch\` handles it.
4. **Return nothing** → the next \`then\` receives \`undefined\`.

\`\`\`js
fetch('/a')
  .then(r => r.json())                         // returns a promise — chain waits
  .then(data => data.items)                    // returns value
  .then(items => { if (!items) throw new Error(); }) // throws → reject
  .then(items => render(items))
  .catch(e => console.error(e))                // catches any earlier reject
  .finally(() => hideSpinner());               // runs always
\`\`\`

**\`.catch\` is just \`.then(undefined, fn)\`:**

\`\`\`js
p.catch(handler) === p.then(undefined, handler);
\`\`\`

Place \`catch\` at the END of a chain to handle any rejection along the way. A mid-chain catch can recover and continue:

\`\`\`js
fetchPrimary()
  .catch(() => fetchBackup())  // recover with backup
  .then(useResult);
\`\`\`

**Common mistakes:**

**1. Forgetting to return:**

\`\`\`js
fetch('/a')
  .then(r => {
    r.json();              // ❌ promise dropped
  })
  .then(data => ...);      // data is undefined

fetch('/a')
  .then(r => r.json())     // ✅
  .then(data => ...);
\`\`\`

**2. Nested \`.then\` instead of chaining:**

\`\`\`js
// ❌ "promise pyramid" — same problem as callback hell
fetch('/a').then(a => {
  fetch('/b').then(b => {
    fetch('/c').then(c => {});
  });
});

// ✅ flat chain
fetch('/a')
  .then(a => fetch('/b'))
  .then(b => fetch('/c'))
  .then(c => ...);
\`\`\`

**3. Unhandled rejections:**

\`\`\`js
asyncFn(); // returns a promise — if it rejects with no .catch, "Unhandled rejection"
\`\`\`

Either await it, return it (so the caller handles), or attach a \`.catch\`.`,
    hint: 'Pending → fulfilled/rejected (immutable); each then returns a NEW promise',
  },
  {
    id: 147,
    category: 'event-loop',
    title: 'async/await — what it desugars to and where it bites',
    difficulty: 'mid',
    answer: `\`async/await\` is syntax over promises. Every \`async\` function:

1. Returns a promise (always — even if you \`return 42\`, it returns \`Promise.resolve(42)\`).
2. \`await\` pauses execution until the awaited value resolves.
3. \`throw\` inside an async function rejects the returned promise.

\`\`\`js
// async/await form
async function getUser(id) {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

// Roughly desugars to:
function getUser(id) {
  return fetch(\`/api/users/\${id}\`)
    .then(res => {
      if (!res.ok) throw new Error('Not found');
      return res.json();
    });
}
\`\`\`

**Common mistakes:**

**1. Sequential when you meant parallel:**

\`\`\`js
// ❌ Slow — fetches one at a time
async function loadAll() {
  const a = await fetch('/a');
  const b = await fetch('/b');
  const c = await fetch('/c');
  return [a, b, c];
}

// ✅ Parallel — start all, then await
async function loadAll() {
  const [a, b, c] = await Promise.all([
    fetch('/a'),
    fetch('/b'),
    fetch('/c'),
  ]);
  return [a, b, c];
}
\`\`\`

**2. Forgetting \`await\` (or returning a promise):**

\`\`\`js
async function bad() {
  asyncWork(); // ❌ fire and forget — caller can't know when it finishes
}

async function ok() {
  return asyncWork(); // ✅ promise propagates, caller can await
}

async function alsoOk() {
  await asyncWork(); // ✅ explicit wait
}
\`\`\`

**3. \`await\` in non-async context:**

\`\`\`js
function broken() {
  const data = await fetch('/'); // ❌ SyntaxError
}
\`\`\`

Top-level await works in modules but not in regular scripts.

**4. \`await\` in \`forEach\` does nothing useful:**

\`\`\`js
// ❌ Doesn't wait — forEach doesn't care about the returned promise
items.forEach(async (item) => {
  await process(item);
});
console.log('done'); // logs immediately, before any item finishes

// ✅ for...of waits sequentially
for (const item of items) {
  await process(item);
}

// ✅ Promise.all for parallel
await Promise.all(items.map(item => process(item)));
\`\`\`

**5. Try/catch granularity:**

\`\`\`js
// Either of these is fine — pick based on what you can recover from:

// Catch everything together
try {
  const a = await fetchA();
  const b = await fetchB(a);
  return process(b);
} catch (e) { ... }

// Or catch per-step if you want different recovery per failure
const a = await fetchA().catch(e => fallbackA);
const b = await fetchB(a).catch(e => fallbackB);
\`\`\`

**The async function color problem:**
Once a function is async, all its callers either need to be async or handle the promise. This "infects" the call graph upward — known as "function color." Plan for it; don't sprinkle async indiscriminately.

**Senior insight:** "\`async/await\` reads sequentially but I check whether the await is *intended* sequential or accidentally serial. The parallel-vs-serial distinction is where most async perf bugs live."`,
    hint: 'Sequential awaits = serial; Promise.all = parallel; await needs async',
  },
  {
    id: 148,
    category: 'event-loop',
    title: 'How to add a timeout to any promise',
    difficulty: 'mid',
    answer: `Common need: bail on a slow request without hanging forever.

**Basic timeout — \`Promise.race\`:**

\`\`\`js
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms),
  );
  return Promise.race([promise, timeout]);
}

const data = await withTimeout(fetch('/slow'), 3000);
\`\`\`

If \`fetch\` doesn't settle within 3 seconds, the timeout rejects and wins the race.

**The leak:** the slow promise keeps running. If it eventually resolves and was holding resources (open socket, big buffer), they aren't released. For \`fetch\`, you actually want to **abort**:

**Better — AbortController:**

\`\`\`js
function withAbortableTimeout(promiseFactory, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);

  return promiseFactory(ctrl.signal).finally(() => clearTimeout(t));
}

const data = await withAbortableTimeout(
  (signal) => fetch('/slow', { signal }),
  3000,
);
\`\`\`

The fetch is genuinely cancelled (network connection closed) instead of orphaned.

**Modern alternative — \`AbortSignal.timeout\`:**

\`\`\`js
const data = await fetch('/slow', { signal: AbortSignal.timeout(3000) });
\`\`\`

One-liner that does the right thing. Throws \`TimeoutError\` (a \`DOMException\`).

**Combining user cancel + timeout:**

\`\`\`js
const userCtrl = new AbortController();
cancelButton.onclick = () => userCtrl.abort();

const signal = AbortSignal.any([
  userCtrl.signal,
  AbortSignal.timeout(5000),
]);

const data = await fetch('/api', { signal });
\`\`\`

\`AbortSignal.any\` triggers if either source aborts.

**Library functions returning unrelated promises (no AbortController):**

When you can't push abort into the function (third-party SDK, etc.), the race version is what you have:

\`\`\`js
async function withTimeoutSafe(promise, ms, label = 'op') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(\`\${label} timed out\`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer); // don't keep the timer running if we won
  }
}
\`\`\`

The \`clearTimeout\` matters — without it, the timer holds a reference and Node won't exit until it fires.

**Don't:**
- Forget to clean up the timer (memory + Node hang).
- Use this on \`async\` operations that have side effects without abort — you'll get *eventual* execution after the user thinks it was cancelled.`,
    hint: 'Promise.race for any promise; AbortController for fetch',
  },

  // ─────────────────────────────────────────────────────────────────
  // Garbage collection & memory (2)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 149,
    category: 'fundamentals',
    title: 'How does JavaScript garbage collection work?',
    difficulty: 'senior',
    answer: `JS engines use **tracing garbage collectors** based on **reachability**:

> An object is garbage if no chain of references from a "root" can reach it.

**Roots include:**
- The global object (\`window\` / \`globalThis\`).
- Currently executing function's local variables and parameters.
- The call stack.
- All scopes captured by live closures.

**Mark-and-sweep — the basic algorithm:**

1. **Mark phase**: Start from roots, follow every reference. Mark every reachable object.
2. **Sweep phase**: Walk the heap. Free anything not marked.

V8 (Chrome, Node, Edge) uses a much more sophisticated **generational** collector:

**Young generation (Scavenger):**
- Most objects die young — that's the "weak generational hypothesis."
- The young space is small and split into halves. New objects allocate in one half.
- When it fills, V8 traces from roots, copies live objects to the other half, and discards the entire first half.
- This is fast (proportional to live objects, not total allocations).

**Old generation (Mark-Compact):**
- Objects that survive a few young-gen cycles get promoted.
- Old-gen GC is rarer but more expensive — full mark-and-sweep with compaction (defragments memory).
- Runs **incrementally** and **concurrently** to avoid pause times.

**What gets collected vs. retained:**

\`\`\`js
let user = { name: 'Ada' };
// user is a root → object reachable

user = null;
// user no longer references it → next GC will collect
\`\`\`

\`\`\`js
const cache = new Map();
function process(item) {
  cache.set(item.id, item);
}
// Every item ever passed to process() is retained forever.
// cache → item is a strong reference. Until cache is cleared,
// none of those items can be collected.
\`\`\`

**WeakMap and WeakSet** hold *weak* references to keys:

\`\`\`js
const cache = new WeakMap();
let user = { id: 1 };
cache.set(user, computeProfile(user));

user = null;
// The cache entry can be GC'd because the only strong ref to the key is gone.
\`\`\`

This is why WeakMap is the standard tool for "data attached to an object I don't own."

**FinalizationRegistry — observe collection:**

\`\`\`js
const registry = new FinalizationRegistry((heldValue) => {
  console.log(\`\${heldValue} was collected\`);
});

let obj = {};
registry.register(obj, 'my-object');
obj = null;
// At some unspecified later point: 'my-object was collected'
\`\`\`

**Don't rely on it for cleanup logic** — the spec gives engines wide latitude. It may run later, never, or in any order. Useful for diagnostics, not correctness.

**Common reachability traps:**

1. **Listeners on long-lived objects** keep their handlers alive.
2. **Closures capture entire scopes**, not just the variables they reference (engine-dependent).
3. **Detached DOM nodes** referenced by JS stay in memory.
4. **Circular references are NOT a problem** for tracing collectors — they're collected if neither side is reachable from a root.

**Senior signal:** "I think about 'who has a reference to this and when does that reference go away.' GC is just bookkeeping over reachability."`,
    hint: 'Reachability from roots; mark-sweep; generational; WeakMap for opt-in weakness',
  },
  {
    id: 150,
    category: 'fundamentals',
    title: 'WeakMap and WeakRef — when to use them',
    difficulty: 'senior',
    answer: `**WeakMap and WeakSet** hold weak references to their **keys**, allowing the runtime to GC the key (and its associated value) once nothing else references it.

\`\`\`js
const map = new Map();
const weakMap = new WeakMap();

let obj = {};
map.set(obj, 'data');
weakMap.set(obj, 'data');

obj = null;
// map still holds 'data' — obj is reachable via map
// weakMap can release its entry — obj wasn't kept alive by the weak ref
\`\`\`

**Constraints:**
- Keys must be objects (or registered Symbols in modern JS).
- **Not iterable.** No \`.size\`, no \`forEach\`, no \`keys()\`. Reason: GC can happen between any two operations, so iteration would be non-deterministic.
- Operations are limited to \`set\`, \`get\`, \`has\`, \`delete\`.

**Use cases:**

**1. Caching computations on objects:**

\`\`\`js
const cache = new WeakMap();
function expensiveOperation(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = compute(obj);
  cache.set(obj, result);
  return result;
}
// When obj is no longer referenced anywhere else,
// the cached entry GC's automatically.
\`\`\`

**2. Private state for objects you don't own:**

\`\`\`js
const metadata = new WeakMap();
function tag(node, info) {
  metadata.set(node, info);
}
// node can be a DOM element from someone else's code.
// When the element is removed and GC'd, metadata is freed.
\`\`\`

**3. Tracking processed items without retaining them:**

\`\`\`js
const seen = new WeakSet();
function processOnce(obj) {
  if (seen.has(obj)) return;
  seen.add(obj);
  doWork(obj);
}
\`\`\`

**WeakRef — observing without preventing collection:**

\`\`\`js
let obj = createBigThing();
const ref = new WeakRef(obj);
obj = null;

// Later:
const stillThere = ref.deref();
if (stillThere) {
  // GC hasn't run yet, or something else still references it
} else {
  // It's gone
}
\`\`\`

**Use sparingly.** The TC39 proposal explicitly warns: *"correct use of WeakRef takes careful thought, and it's best avoided if possible."* Engines have wide GC latitude — \`deref()\` may return the value, may not, and may not match across calls in surprising ways.

**Legitimate use cases:**
- **Caching with size pressure** — let the GC be your eviction policy.
- **DOM observer-like patterns** — watch an object without keeping it alive.

**FinalizationRegistry — get notified when something is collected:**

\`\`\`js
const cleanup = new FinalizationRegistry((connection) => {
  connection.close();
});

class Resource {
  constructor() {
    this.connection = openConnection();
    cleanup.register(this, this.connection);
  }
}
\`\`\`

Use cases: closing native handles, releasing WASM memory, removing entries from external caches.

**Same caveat:** finalizers may run late, or never (e.g., on tab close). Treat them as **best-effort hints**, not guaranteed cleanup. The proposal says: *"Avoid using these features when possible."*

**Senior insight:** "Reach for WeakMap when you're sure. WeakRef and FinalizationRegistry are escape hatches — if you're using them in app code, there's usually a more deterministic design that's better."`,
    hint: 'WeakMap = opt-in weak keys for caches/metadata; WeakRef = observe without retain (use rarely)',
  },

  // ─────────────────────────────────────────────────────────────────
  // Modules (2)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 151,
    category: 'fundamentals',
    title: 'ESM vs CommonJS — semantic differences',
    difficulty: 'senior',
    answer: `Two module systems coexist in the JS ecosystem. They're **not equivalent**.

**CommonJS (CJS) — Node\'s historical default:**

\`\`\`js
// math.js
module.exports = { add: (a, b) => a + b };

// app.js
const { add } = require('./math');
\`\`\`

- **Synchronous** — \`require\` blocks until the file is loaded and executed.
- **Dynamic** — you can \`require()\` anywhere, conditionally.
- **Sloppy mode** by default.
- \`module.exports\` is a plain object you assign to.

**ESM (ECMAScript Modules) — the standard:**

\`\`\`js
// math.js
export const add = (a, b) => a + b;

// app.js
import { add } from './math.js';
\`\`\`

- **Asynchronous** — module graph parsed and resolved before execution.
- **Static** — \`import\` declarations must be top-level, names known at parse time.
- **Strict mode** automatically.
- **Live bindings** (the big difference, see below).

**Live bindings — ESM exports are not snapshots:**

\`\`\`js
// counter.js
export let count = 0;
export function increment() { count++; }
\`\`\`

\`\`\`js
// app.js (ESM)
import { count, increment } from './counter.js';
console.log(count); // 0
increment();
console.log(count); // 1 ← actually updated
\`\`\`

In CJS, the equivalent gives you a **value snapshot**:

\`\`\`js
// counter.js (CJS)
let count = 0;
module.exports.count = count;
module.exports.increment = () => count++;

// app.js (CJS)
const { count, increment } = require('./counter');
console.log(count); // 0
increment();
console.log(count); // 0 ← still 0; we destructured a snapshot
\`\`\`

**Static imports enable:**
- **Tree-shaking** — bundlers can statically determine what's used.
- **Better error messages** at load time, not runtime.
- **Top-level await** — only works in modules.

**Dynamic import — \`import()\` returns a promise:**

\`\`\`js
const { default: Heavy } = await import('./heavy.js');
\`\`\`

Available in both ESM and (with bundler help) CJS. Used for code splitting.

**Interop in Node:**

- **\`.mjs\`** = ESM, **\`.cjs\`** = CJS, **\`.js\`** depends on \`"type"\` in \`package.json\`.
- **CJS can\'t directly \`require()\` an ESM module** (it\'s async). Must use \`await import()\`.
- **ESM can \`import\` CJS** — Node provides a default export equivalent to \`module.exports\`.

\`\`\`js
// In an ESM file:
import lodash from 'lodash'; // default = the lodash CJS module.exports
\`\`\`

**Common pitfalls:**

**1. \`__dirname\` and \`__filename\` don\'t exist in ESM:**

\`\`\`js
// CJS
console.log(__dirname);

// ESM
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
\`\`\`

**2. JSON imports require attributes (recent):**

\`\`\`js
import data from './data.json' with { type: 'json' };
\`\`\`

**3. Mixing ESM and CJS in one project** — can be done, but every boundary requires care. New projects should choose one and stick with it.

**Senior signal:** "I prefer ESM in new code. Live bindings, top-level await, and tree-shaking are real wins. CJS interop matters for Node tooling, but the gravity is toward ESM."`,
    hint: 'CJS = sync, dynamic, snapshots; ESM = async, static, live bindings',
  },
  {
    id: 152,
    category: 'fundamentals',
    title: 'Dynamic import and circular dependencies',
    difficulty: 'mid',
    answer: `**Dynamic import — \`import()\` as an expression:**

\`\`\`js
const { default: Component } = await import('./Component.js');
\`\`\`

Returns a promise. Used for:

- **Code splitting** — defer loading until needed.
- **Conditional imports** — load polyfills only on browsers that need them.
- **Top-level avoidance** — when you can\'t use static \`import\`.

\`\`\`js
async function maybeLoadAdmin() {
  if (user.isAdmin) {
    const { AdminPanel } = await import('./AdminPanel.js');
    return new AdminPanel();
  }
}
\`\`\`

**Bundlers turn dynamic imports into separate chunks** automatically. Webpack, Vite, esbuild all do this — each \`import()\` becomes a separate file the user downloads on demand.

**Circular dependencies — what happens:**

\`\`\`js
// a.js
import { b } from './b.js';
export const a = 'A';
console.log('a sees:', b);

// b.js
import { a } from './a.js';
export const b = 'B';
console.log('b sees:', a);
\`\`\`

When you \`import a.js\`:
1. Engine starts evaluating \`a.js\`.
2. Sees \`import { b } from './b.js'\`. Pauses \`a\`, starts evaluating \`b\`.
3. \`b\` imports \`a\` — already in progress. Engine **doesn\'t restart \`a\`**; it gives \`b\` a reference to the (still-incomplete) \`a\` module.
4. \`b.js\` runs. \`a\` hasn\'t exported anything yet, so the binding is in TDZ. If \`b\` tries to use \`a\` at the top level: ReferenceError.
5. \`b\` finishes; control returns to \`a\`; \`a\` finishes.

**The "live bindings" rule saves you** if usage is deferred:

\`\`\`js
// a.js
import { b } from './b.js';
export const a = 'A';
export function getA() { return a; }

// b.js
import { getA } from './a.js'; // import a function, not a value
export const b = 'B';
export function showA() { return getA(); } // safe — called later
\`\`\`

By the time \`showA()\` runs, both modules are fully evaluated and \`a\` exists.

**CJS handles cycles differently** — it returns the **partially populated \`module.exports\`** at the moment of the cycle. Whatever was assigned before the circular \`require\` is visible; the rest is \`undefined\`.

\`\`\`js
// a.js (CJS)
console.log('a sees b:', require('./b').b); // undefined
module.exports.a = 'A';

// b.js
console.log('b sees a:', require('./a').a); // undefined
module.exports.b = 'B';
\`\`\`

This silent \`undefined\` is a frequent source of bugs.

**Detecting cycles:**

- \`madge\` — visualize import graphs, lists cycles.
- ESLint rule \`import/no-cycle\` — flag circular imports.
- Bundler warnings (Webpack and Rollup both surface them).

**How to break cycles:**

1. **Extract shared deps** to a third module both can import.
2. **Use deferred access** (functions, not values) at the top level.
3. **Restructure** so the dependency graph is a DAG.

**The "barrel file" trap:**

\`\`\`js
// index.js
export * from './a.js';
export * from './b.js';
\`\`\`

If \`a.js\` and \`b.js\` import from \`index.js\` (instead of from each other directly), every internal import goes through the barrel — likely creating a cycle. Common in large React monorepos. Prefer explicit imports over barrel files for internal use.`,
    hint: 'import() = lazy chunk; ESM cycles work via live bindings; CJS gives partial exports',
  },

  // ─────────────────────────────────────────────────────────────────
  // Generators & Iterators (2)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 153,
    category: 'fundamentals',
    title: 'Iterators and the iteration protocol',
    difficulty: 'mid',
    answer: `An **iterator** is any object with a \`next()\` method that returns \`{ value, done }\`.

\`\`\`js
const iter = {
  i: 0,
  next() {
    if (this.i < 3) return { value: this.i++, done: false };
    return { value: undefined, done: true };
  },
};

iter.next(); // { value: 0, done: false }
iter.next(); // { value: 1, done: false }
iter.next(); // { value: 2, done: false }
iter.next(); // { value: undefined, done: true }
\`\`\`

An **iterable** is an object with a \`[Symbol.iterator]\` method that returns an iterator:

\`\`\`js
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        if (current <= last) return { value: current++, done: false };
        return { value: undefined, done: true };
      },
    };
  },
};

for (const n of range) console.log(n); // 1, 2, 3, 4, 5
[...range]; // [1, 2, 3, 4, 5]
\`\`\`

**Built-in iterables:** Array, String, Map, Set, NodeList, generator results, and more. Plain objects are NOT iterable by default.

**\`for...of\` works on any iterable** (uses the iteration protocol). \`for...in\` is different — enumerates property keys, not values.

**Spread and destructuring also use the iteration protocol:**

\`\`\`js
const [a, b, ...rest] = someIterable;
const arr = [...someIterable];
\`\`\`

**Async iterators — same idea, with promises:**

An async iterator's \`next()\` returns \`Promise<{ value, done }>\`. Created with \`Symbol.asyncIterator\`.

\`\`\`js
async function* paginate(url) {
  let next = url;
  while (next) {
    const res = await fetch(next);
    const page = await res.json();
    for (const item of page.items) yield item;
    next = page.nextUrl;
  }
}

for await (const item of paginate('/api/users')) {
  console.log(item);
}
\`\`\`

\`for await...of\` consumes async iterables — perfect for streaming, paginated APIs, file streams.

**Why this protocol matters:**

- **Decoupling** — code that consumes data doesn\'t care if it\'s an array, generator, custom collection, or stream.
- **Lazy evaluation** — iterators produce values on demand. You can iterate an "infinite" sequence safely as long as you stop.
- **Composability** — pipelines of \`map\`/\`filter\`/\`take\` work on any iterable.

**Pitfall:** Iterators are **stateful**. Once consumed, they\'re done:

\`\`\`js
const arr = [1, 2, 3];
const it = arr[Symbol.iterator]();
[...it]; // [1, 2, 3]
[...it]; // []  ← exhausted
\`\`\`

But the *iterable* (the array) is reusable; you get a fresh iterator each time you iterate.`,
    hint: 'Iterator: { next: () => { value, done } }; Iterable: [Symbol.iterator]() returns iterator',
  },
  {
    id: 154,
    category: 'fundamentals',
    title: 'Generators — lazy sequences and bidirectional communication',
    difficulty: 'senior',
    answer: `A **generator function** (\`function*\`) returns a generator object that\'s both an **iterator** and an **iterable**. Each \`yield\` pauses execution; \`next()\` resumes.

\`\`\`js
function* counter() {
  yield 1;
  yield 2;
  yield 3;
}

const g = counter();
g.next(); // { value: 1, done: false }
g.next(); // { value: 2, done: false }
g.next(); // { value: 3, done: false }
g.next(); // { value: undefined, done: true }
\`\`\`

**Lazy infinite sequences:**

\`\`\`js
function* naturals() {
  let i = 0;
  while (true) yield i++;
}

const evens = (function* () {
  for (const n of naturals()) {
    if (n % 2 === 0) yield n;
  }
})();

evens.next().value; // 0
evens.next().value; // 2
\`\`\`

The \`while (true)\` doesn't hang because nothing executes until \`next()\` is called.

**\`yield*\` — delegate to another iterable:**

\`\`\`js
function* alpha() {
  yield 'a';
  yield 'b';
}
function* combined() {
  yield 1;
  yield* alpha(); // delegates
  yield 2;
}
[...combined()]; // [1, 'a', 'b', 2]
\`\`\`

**Bidirectional communication — values flow IN via \`next(value)\`:**

\`\`\`js
function* dialog() {
  const name = yield 'What\\'s your name?';
  const age = yield \`Hi \${name}, how old are you?\`;
  return \`\${name} is \${age}\`;
}

const g = dialog();
g.next();           // { value: "What's your name?", done: false }
g.next('Ada');      // { value: 'Hi Ada, how old are you?', done: false }
g.next(36);         // { value: 'Ada is 36', done: true }
\`\`\`

\`yield expr\` evaluates and pauses; the value passed to the next \`next(v)\` becomes the *return value* of the \`yield\` expression.

**\`return()\` and \`throw()\` for early termination / error injection:**

\`\`\`js
const g = generator();
g.return('cancelled'); // forces { value: 'cancelled', done: true }
g.throw(new Error()); // throws inside the generator at the yield point
\`\`\`

\`for...of\` calls \`return()\` automatically when you \`break\` out, allowing cleanup:

\`\`\`js
function* withCleanup() {
  try {
    yield 1;
    yield 2;
  } finally {
    console.log('cleanup');
  }
}

for (const v of withCleanup()) {
  if (v === 1) break; // logs 'cleanup'
}
\`\`\`

**Use cases:**

**1. Lazy data pipelines:**

\`\`\`js
function* take(iter, n) {
  let i = 0;
  for (const v of iter) {
    if (i++ >= n) return;
    yield v;
  }
}

[...take(naturals(), 5)]; // [0, 1, 2, 3, 4]
\`\`\`

**2. State machines:**

\`\`\`js
function* trafficLight() {
  while (true) {
    yield 'red';
    yield 'green';
    yield 'yellow';
  }
}
\`\`\`

**3. Async sequencing (pre-async/await pattern):**

\`co\`-style libraries used generators to flatten promise chains before \`async/await\` existed. Conceptually, \`async/await\` is generators with a built-in promise runner.

**4. Async generators — \`async function*\`:**

\`\`\`js
async function* paginate(url) {
  let next = url;
  while (next) {
    const page = await fetch(next).then(r => r.json());
    yield* page.items;
    next = page.nextUrl;
  }
}

for await (const item of paginate('/api')) {
  process(item);
}
\`\`\`

Combines generators with promises — perfect for streaming.

**Performance:** Each \`yield\` has overhead vs. a tight loop. Generators win when the *consumer* benefits from laziness (don\'t compute all values up front). For tight numeric loops, prefer plain functions.

**Senior insight:** "Generators are pause-able functions. The killer features are laziness for huge/infinite sequences and bidirectional flow for protocols. Async generators replace a lot of ad-hoc streaming code."`,
    hint: 'function* yields lazy sequence; next(v) sends in; async function* + for await for streams',
  },

  // ─────────────────────────────────────────────────────────────────
  // `this` keyword (3)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 155,
    category: 'fundamentals',
    title: '`this` — six rules to determine its value',
    difficulty: 'mid',
    answer: `The value of \`this\` depends on **how a function is called**, not where it\'s defined.

**Rule 1 — Method call: \`this\` is the object before the dot.**

\`\`\`js
const obj = {
  name: 'Ada',
  greet() { return this.name; },
};
obj.greet(); // 'Ada'  →  this === obj
\`\`\`

**Rule 2 — Standalone call: \`this\` is undefined (strict) or the global object (sloppy).**

\`\`\`js
function f() { return this; }
f(); // undefined in strict mode; window in sloppy

const g = obj.greet;
g(); // undefined — lost the binding
\`\`\`

This is the most common interview trap. Storing a method in a variable detaches \`this\`.

**Rule 3 — \`new\` call: \`this\` is the freshly created object.**

\`\`\`js
function User(name) { this.name = name; }
const u = new User('Ada'); // this === u
u.name; // 'Ada'
\`\`\`

**Rule 4 — Explicit binding: \`call\`, \`apply\`, \`bind\`.**

\`\`\`js
function greet(greeting) { return \`\${greeting}, \${this.name}\`; }
const obj = { name: 'Ada' };

greet.call(obj, 'Hi');       // 'Hi, Ada'
greet.apply(obj, ['Hello']); // 'Hello, Ada' — args as array
const bound = greet.bind(obj);
bound('Hey');                // 'Hey, Ada' — permanent binding
\`\`\`

\`bind\` creates a new function with \`this\` permanently set; further \`call/apply/bind\` can\'t override it.

**Rule 5 — Arrow functions: \`this\` is inherited lexically (no own binding).**

\`\`\`js
const obj = {
  name: 'Ada',
  arrow: () => this,            // this from where obj was defined
  method() { return () => this; }, // arrow captures method's this
};

obj.arrow();           // window/undefined — arrow doesn't get a 'this'
obj.method()();        // obj — arrow captures method's this
\`\`\`

**Arrow functions ignore \`call/apply/bind\` for \`this\`.** They take it from the enclosing lexical scope, period.

**Rule 6 — Class methods: \`this\` is the instance, but it can detach.**

\`\`\`js
class Counter {
  count = 0;
  increment() { this.count++; }
}

const c = new Counter();
c.increment();           // works
const inc = c.increment;
inc();                   // TypeError: Cannot read 'count' of undefined
\`\`\`

Classes are strict mode, so a detached method has \`this === undefined\`. Bind in the constructor or use class-field arrow functions:

\`\`\`js
class Counter {
  count = 0;
  increment = () => { this.count++; }; // arrow field — this is locked to instance
}
\`\`\`

**Common interview puzzle — predict the output:**

\`\`\`js
const obj = {
  name: 'A',
  fn: function () {
    return [
      this.name,
      (() => this.name)(),
      function () { return this?.name; }(),
      function () { return this?.name; }.call(this),
    ];
  },
};
obj.fn();
\`\`\`

Result: \`['A', 'A', undefined, 'A']\`
- \`this.name\` — method call, this = obj.
- arrow IIFE — captures obj.
- function IIFE — standalone, this = undefined.
- \`.call(this)\` — explicit bind, this = obj.

**Senior signal:** "I read function calls right-to-left from the dot. \`obj.method()\` has \`this = obj\`; \`(0, obj.method)()\` is a standalone call (the comma operator detaches it)."`,
    hint: 'this depends on call site: method/standalone/new/bind/arrow/class',
  },
  {
    id: 156,
    category: 'fundamentals',
    title: 'Arrow vs regular functions — when does it matter?',
    difficulty: 'mid',
    answer: `Arrow functions are **not just shorter syntax**. They differ semantically in important ways.

**1. \`this\` binding:**

\`\`\`js
class Timer {
  constructor() { this.count = 0; }
  start() {
    setInterval(function () { this.count++; }, 1000); // ❌ this = undefined or window
    setInterval(() => { this.count++; }, 1000);        // ✅ this = instance
  }
}
\`\`\`

Arrows inherit \`this\` lexically — no own \`this\`.

**2. \`arguments\`:**

\`\`\`js
function regular() {
  console.log(arguments); // Arguments(3) [1, 2, 3]
}
const arrow = () => {
  console.log(arguments); // ReferenceError (or outer arguments)
};
\`\`\`

Arrows don\'t have their own \`arguments\`. Use rest parameters:

\`\`\`js
const arrow = (...args) => console.log(args);
\`\`\`

**3. \`new\` — arrows can\'t be constructors:**

\`\`\`js
const Foo = () => {};
new Foo(); // TypeError: Foo is not a constructor
\`\`\`

Arrow functions have no \`[[Construct]]\` slot. They can\'t be called with \`new\`.

**4. \`prototype\`:**

\`\`\`js
function regular() {}
regular.prototype; // {} — has a prototype property

const arrow = () => {};
arrow.prototype;   // undefined
\`\`\`

**5. \`super\`:**

Arrows inherit the lexical \`super\` (so a class method's arrow can call \`super.method()\`):

\`\`\`js
class B extends A {
  greet() {
    return () => super.greet(); // arrow captures B's super
  }
}
\`\`\`

A regular function expression in the same place would lose \`super\`.

**6. Hoisting:**

\`function foo() {}\` declarations hoist fully. Arrow assignments (\`const foo = () => ...\`) hoist as bindings only — calling before the line throws TDZ.

**When to choose which:**

**Use arrow when:**
- Callback that needs to inherit \`this\` (event handlers in classes, array methods).
- Inline / one-liner.
- Functional style — \`.map\`, \`.filter\`, \`.reduce\`.

**Use regular function when:**
- Method on an object literal that uses \`this\`:
\`\`\`js
const obj = {
  count: 0,
  inc() { this.count++; },        // ✅ shorthand method
  inc2: () => { this.count++; },  // ❌ this from outer scope
};
\`\`\`
- Constructor.
- Need \`arguments\`.
- Generator (\`function*\` — no arrow generators).
- Recursive function expression (\`const f = function fac(n) {...}\` — \`fac\` is locally referenceable).

**Class field arrows — for binding without bind():**

\`\`\`js
class Component {
  state = 0;

  // Field arrow: bound to the instance, no need for bind in constructor
  handleClick = () => { this.state++; };

  // Method (NOT bound): equivalent to defining on prototype
  handleHover() { this.state++; }
}
\`\`\`

Trade-off: class field arrows create one function *per instance* (slight memory cost). Regular methods live on the prototype (shared). For React class components, field arrows are common because event handlers naturally detach.

**The "lost \`this\`" trap in callbacks:**

\`\`\`js
class Logger {
  prefix = '[LOG]';
  log(msg) { console.log(this.prefix, msg); }
}

const l = new Logger();
['a', 'b'].forEach(l.log);          // ❌ this lost
['a', 'b'].forEach(l.log.bind(l));  // ✅
['a', 'b'].forEach(msg => l.log(msg)); // ✅ closure preserves l
\`\`\``,
    hint: 'Arrow: no own this/arguments/new/prototype; regular for methods, ctors, generators',
  },
  {
    id: 157,
    category: 'fundamentals',
    title: 'Implement Function.prototype.bind from scratch',
    difficulty: 'senior',
    answer: `\`bind\` returns a new function with \`this\` and optionally pre-supplied args fixed. It supports partial application and works correctly with \`new\`.

**Naive version (handles regular calls):**

\`\`\`js
Function.prototype.myBind = function (context, ...preArgs) {
  const fn = this;
  return function (...laterArgs) {
    return fn.apply(context, [...preArgs, ...laterArgs]);
  };
};

function greet(greeting, name) {
  return \`\${greeting}, \${name}, this is \${this.title}\`;
}

const bound = greet.myBind({ title: 'Dr.' }, 'Hello');
bound('Ada'); // "Hello, Ada, this is Dr."
\`\`\`

**Full version handling \`new\`:**

When you \`new boundFn()\`, the spec says \`this\` should be the freshly-created object (the bound \`this\` is ignored). Pre-bound args still apply.

\`\`\`js
Function.prototype.myBind = function (context, ...preArgs) {
  const fn = this;
  if (typeof fn !== 'function') {
    throw new TypeError('Bind must be called on a function');
  }

  function bound(...laterArgs) {
    // 'new bound()' makes 'this' the new object; otherwise use bound context
    const isNew = this instanceof bound;
    return fn.apply(isNew ? this : context, [...preArgs, ...laterArgs]);
  }

  // Preserve prototype chain for instanceof checks
  if (fn.prototype) {
    bound.prototype = Object.create(fn.prototype);
  }
  return bound;
};

function User(name) { this.name = name; }
const BoundUser = User.myBind(null, 'Ada');
const u = new BoundUser();
u.name;            // 'Ada'
u instanceof User; // true
\`\`\`

**Key things this gets right:**

1. **Partial application** — pre-supplied args concatenate with later args.
2. **\`new\` correctness** — using \`this instanceof bound\` detects construction calls.
3. **Prototype chain** — \`Object.create(fn.prototype)\` keeps \`instanceof\` working.
4. **Length and name** — the spec also requires the bound function to expose a sensible \`.name\` (\`'bound originalName'\`) and \`.length\` (original length minus pre-args). Production-grade implementations handle these.

**\`call\` and \`apply\` — usually trivial:**

\`\`\`js
Function.prototype.myCall = function (context, ...args) {
  context = context ?? globalThis;
  const key = Symbol();
  context[key] = this;
  try {
    return context[key](...args);
  } finally {
    delete context[key];
  }
};

Function.prototype.myApply = function (context, args) {
  return this.myCall(context, ...(args ?? []));
};
\`\`\`

The \`Symbol\` trick: temporarily attach the function to \`context\` so that calling \`context[key]()\` makes \`this === context\`, then clean up.

**Why interview-worthy:**
- Tests understanding of \`this\`, \`new\`, prototypes, partial application.
- Real engines have this in C++; understanding the JS semantics shows you know the model.
- Common follow-up: "What does \`fn.bind(obj1).bind(obj2)\` do?" Answer: \`this\` is locked to \`obj1\` — once bound, can't be re-bound.`,
    hint: 'Closure for context + preArgs; check this instanceof bound for new; preserve prototype',
  },

  // ─────────────────────────────────────────────────────────────────
  // Map / Set deep dive (1)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 158,
    category: 'arrays-objects',
    title: 'Map vs Object, Set vs Array — when to use each',
    difficulty: 'mid',
    answer: `**Map vs Object:**

| | Map | Object |
|---|---|---|
| Keys | Any value (objects, primitives) | Strings or Symbols |
| Order | Insertion order, guaranteed | Insertion order (modern), but with quirks |
| Size | \`.size\` | \`Object.keys(obj).length\` |
| Iteration | \`for (const [k, v] of map)\` | \`for (const k in obj)\` (incl. inherited) |
| Prototype | None to worry about | Has \`Object.prototype\` chain |
| JSON | Must convert manually | Native |
| Performance | Optimized for frequent add/remove | Optimized for shape stability |

**Use Map when:**
- Keys are non-string (objects as keys).
- Heavy add/remove churn (engines optimize Maps for this).
- You need reliable size/iteration.
- Avoiding prototype pollution risk.

**Use Object (or class) when:**
- Keys are known strings (records).
- You serialize to JSON.
- Small, stable shape (V8 hidden classes optimize this heavily).
- Pattern-matching on shape (TypeScript types are easier).

**Object.create(null) — a "true dictionary":**

\`\`\`js
const dict = Object.create(null); // no prototype
dict.toString = 'safe';           // doesn\'t collide with Object.prototype.toString

const danger = {};
danger['__proto__'] = { admin: true };
console.log(danger.admin);  // could be problematic depending on engine
\`\`\`

For untrusted-key scenarios (parsing JSON into a lookup), \`Object.create(null)\` or \`Map\` avoids prototype pollution attacks.

**Set vs Array:**

| | Set | Array |
|---|---|---|
| Duplicates | Removed | Allowed |
| Order | Insertion | Index-based |
| Lookup | O(1) \`has\` | O(n) \`includes\` |
| Iteration | for...of, forEach | Many ways |

**Use Set when:**
- Membership testing in a hot path.
- Dedup is the primary need.
- You don\'t need indexed access.

**Use Array when:**
- Order and index matter.
- You need slice / map / filter / reduce.
- You serialize to JSON.

**Common patterns:**

**Dedup an array via Set:**

\`\`\`js
const unique = [...new Set(arr)];
\`\`\`

**Convert between forms:**

\`\`\`js
const obj = Object.fromEntries(map);
const map = new Map(Object.entries(obj));
const set = new Set(arr);
const arr = [...set];
\`\`\`

**Map equality is reference-based for object keys:**

\`\`\`js
const m = new Map();
m.set({ id: 1 }, 'a');
m.get({ id: 1 }); // undefined — different object
\`\`\`

If you want value equality, you\'d need a custom keying scheme (serialize to a string, or use a library).

**Map performance:**
- V8 stores Maps in a hash-table-like structure. Keys/values can change without affecting hidden classes.
- Object hidden classes deoptimize when you add/remove properties freely. Lookup is faster on stable shapes; mutation is slower.
- For 10–100 keys with frequent updates: Map is faster.
- For 5–10 string keys, stable shape: Object is faster.

**WeakMap / WeakSet:** Already covered (Q150). Weak references on keys; not iterable; useful for "data attached to an object I don\'t own."`,
    hint: 'Map: any keys + churn; Object: string keys + JSON; Set: dedup + O(1) lookup',
  },

  // ─────────────────────────────────────────────────────────────────
  // Object.freeze and immutability (1)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 159,
    category: 'arrays-objects',
    title: 'Object.freeze, seal, preventExtensions — and their depth',
    difficulty: 'mid',
    answer: `Three levels of immutability, ordered from weakest to strongest:

**\`Object.preventExtensions(obj)\`:**
- ❌ Can\'t add new properties.
- ✅ Existing properties writable and configurable.
- ✅ Can delete properties.

**\`Object.seal(obj)\`:**
- ❌ Can\'t add or delete properties.
- ❌ Properties become non-configurable (can\'t change descriptors).
- ✅ Existing properties still writable (values can change).

**\`Object.freeze(obj)\`:**
- ❌ Can\'t add, delete, or modify properties.
- ❌ Non-configurable, non-writable.
- ✅ Frozen object is fully immutable.

\`\`\`js
const obj = { a: 1, nested: { b: 2 } };
Object.freeze(obj);

obj.a = 99;        // silently ignored (sloppy) or TypeError (strict)
delete obj.a;      // ignored
obj.c = 3;         // ignored
obj.nested.b = 99; // ✅ WORKS — freeze is shallow!

Object.isFrozen(obj);        // true
Object.isFrozen(obj.nested); // false
\`\`\`

**Deep freeze — recurse manually:**

\`\`\`js
function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object' || Object.isFrozen(obj)) {
    return obj;
  }
  Object.values(obj).forEach(deepFreeze);
  return Object.freeze(obj);
}
\`\`\`

The \`isFrozen\` check prevents infinite loops on circular references.

**Performance — Object.freeze can hurt:**

V8 historically had a slow path for frozen objects (every property access has extra checks). Modern V8 has improved this, but you should still:
- ✅ Freeze configuration objects, constants.
- ❌ Don\'t freeze hot-path objects iterated millions of times.
- ❌ Don\'t freeze objects you mutate mid-loop (you\'ll silently fail or throw).

**\`as const\` (TypeScript) — compile-time freeze:**

\`\`\`ts
const config = { mode: 'prod' } as const;
config.mode = 'dev'; // TypeScript error at compile time
// At runtime, no protection — just type narrowing
\`\`\`

If you need both compile-time and runtime safety, combine: \`Object.freeze({...} as const)\`.

**Immutability libraries — when freeze isn\'t enough:**

For state in a Redux/React app, \`immer\` is the standard:

\`\`\`js
const next = produce(state, draft => {
  draft.user.name = 'Ada'; // looks mutating; immer creates a new object
});
\`\`\`

**Immutable.js** (older) provides persistent data structures with structural sharing — efficient even for huge nested updates, but invasive (requires custom \`Map\`/\`List\` types throughout).

**Common gotchas:**

**1. Freezing arrays:**

\`\`\`js
const arr = Object.freeze([1, 2, 3]);
arr.push(4); // TypeError in strict mode
arr[0] = 99; // ignored
\`\`\`

**2. Freezing class instances** — methods on prototype are still callable, but they can\'t mutate \`this\`:

\`\`\`js
class Counter {
  count = 0;
  inc() { this.count++; }
}
const c = Object.freeze(new Counter());
c.inc(); // throws in strict mode
\`\`\`

**3. \`Object.freeze\` doesn\'t freeze methods\' references** — but it does prevent reassigning them:

\`\`\`js
const obj = Object.freeze({ method: () => 1 });
obj.method = () => 2; // ignored
obj.method.foo = 1;   // ✅ allowed; the function itself isn\'t frozen
\`\`\`

**Senior signal:** "\`Object.freeze\` is shallow and runtime-only. For shared config or constants, it's a guardrail. For state management, prefer libraries that produce new objects rather than freezing existing ones."`,
    hint: 'preventExtensions < seal < freeze; all shallow; deep freeze recursively',
  },

  // ─────────────────────────────────────────────────────────────────
  // Proxies & Reflect (2)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 160,
    category: 'fundamentals',
    title: 'Proxy and Reflect — what can you intercept?',
    difficulty: 'senior',
    answer: `A **Proxy** wraps an object with custom behavior for fundamental operations. **Reflect** mirrors the same operations as functions — useful inside traps to forward defaults.

\`\`\`js
const target = { name: 'Ada' };
const handler = {
  get(obj, prop, receiver) {
    console.log(\`Reading \${prop}\`);
    return Reflect.get(obj, prop, receiver);
  },
  set(obj, prop, value, receiver) {
    console.log(\`Setting \${prop} = \${value}\`);
    return Reflect.set(obj, prop, value, receiver);
  },
};

const observed = new Proxy(target, handler);
observed.name;          // logs "Reading name", returns 'Ada'
observed.name = 'Eve';  // logs "Setting name = Eve"
\`\`\`

**Common traps:**

| Trap | Triggered by |
|---|---|
| \`get\` | \`obj.prop\`, \`obj[prop]\` |
| \`set\` | \`obj.prop = v\` |
| \`has\` | \`prop in obj\` |
| \`deleteProperty\` | \`delete obj.prop\` |
| \`ownKeys\` | \`Object.keys\`, \`Reflect.ownKeys\` |
| \`getPrototypeOf\` | \`Object.getPrototypeOf\` |
| \`apply\` | function call (when target is callable) |
| \`construct\` | \`new Proxy(...)\` (when target is constructible) |
| \`defineProperty\` | \`Object.defineProperty\` |

**Practical use cases:**

**1. Reactive systems (Vue 3 / MobX 6):**

\`\`\`js
function reactive(obj) {
  return new Proxy(obj, {
    get(t, k, r) {
      track(t, k); // record dependency
      return Reflect.get(t, k, r);
    },
    set(t, k, v, r) {
      const ok = Reflect.set(t, k, v, r);
      trigger(t, k); // notify subscribers
      return ok;
    },
  });
}
\`\`\`

This is approximately how Vue 3\'s reactivity works.

**2. Default values:**

\`\`\`js
function withDefaults(target, defaults) {
  return new Proxy(target, {
    get(t, k, r) {
      return Reflect.has(t, k) ? Reflect.get(t, k, r) : defaults[k];
    },
  });
}

const user = withDefaults({ name: 'Ada' }, { age: 0, role: 'user' });
user.role; // 'user' — comes from defaults
\`\`\`

**3. Validation:**

\`\`\`js
const validated = new Proxy({}, {
  set(t, k, v) {
    if (typeof v !== 'string') throw new TypeError(\`\${k} must be string\`);
    t[k] = v;
    return true;
  },
});
validated.name = 'Ada';   // OK
validated.age = 36;       // TypeError
\`\`\`

**4. Logging / tracing:**

\`\`\`js
function trace(target, name) {
  return new Proxy(target, {
    get(t, k, r) {
      console.log(\`\${name}.\${String(k)}\`);
      return Reflect.get(t, k, r);
    },
  });
}
\`\`\`

**5. Negative array indices (Python-style):**

\`\`\`js
const arr = new Proxy([10, 20, 30], {
  get(t, k, r) {
    const i = Number(k);
    if (Number.isInteger(i) && i < 0) return t[t.length + i];
    return Reflect.get(t, k, r);
  },
});
arr[-1]; // 30
\`\`\`

**Why use \`Reflect.get\` instead of \`target[prop]\`?**

\`Reflect\` methods accept a \`receiver\` argument that\'s the *original proxy*. This matters for getters that use \`this\`:

\`\`\`js
const obj = {
  _name: 'Ada',
  get name() { return this._name; },
};
const p = new Proxy(obj, {
  get(t, k, r) {
    return Reflect.get(t, k, r); // 'this' inside getter = proxy, so further traps fire
  },
});
\`\`\`

Without \`receiver\`, getters would see the original object, bypassing the proxy.

**Performance:** Proxies have per-access overhead. Don\'t wrap hot-path data structures unless you need the interception.

**Pitfalls:**

- **\`Object.is\` and \`===\`** distinguish proxy from target: \`proxy === target\` is \`false\`. WeakMaps keyed on the target won\'t match the proxy.
- **Some operations bypass proxies** in privileged contexts (private class fields use [[GetSlot]], not get).
- **\`Proxy\` can\'t be frozen / extended in many ways** — check if your use case needs feature parity with the target.`,
    hint: 'Proxy = trap fundamental ops; Reflect = forward defaults with correct receiver',
  },
  {
    id: 161,
    category: 'fundamentals',
    title: 'When does a Proxy NOT work as expected?',
    difficulty: 'senior',
    answer: `Proxies are powerful but have several gotchas worth knowing.

**1. Proxy ≠ target identity.**

\`\`\`js
const target = {};
const p = new Proxy(target, {});

p === target;   // false
[p].includes(target); // false
\`\`\`

If your code assumes the wrapped object is the original (e.g., comparing references in a Set), wrapping breaks it.

**2. \`this\` inside methods is the proxy, not the target — usually fine, sometimes not:**

\`\`\`js
class Logger {
  #count = 0;        // private field
  log() { this.#count++; }
}

const p = new Proxy(new Logger(), {});
p.log(); // TypeError: Cannot read private member from an object whose class did not declare it
\`\`\`

Private fields use a slot system that's strictly tied to the original object identity, not its proxy.

**Workaround — bind methods to the target:**

\`\`\`js
const p = new Proxy(new Logger(), {
  get(t, k, r) {
    const v = Reflect.get(t, k, r);
    return typeof v === 'function' ? v.bind(t) : v;
  },
});
\`\`\`

But now \`this\` inside methods is the target, so method calls bypass other proxy traps. Trade-offs.

**3. Internal slots are bypassed.**

Built-ins like \`Date\`, \`Map\`, \`Set\` rely on internal slots not exposed through normal property access. Methods called on a proxy of these may fail:

\`\`\`js
const p = new Proxy(new Map(), {});
p.set('a', 1);
p.get('a'); // TypeError: get method called on incompatible receiver
\`\`\`

The \`Map\` method's internal logic checks for the [[MapData]] slot, which only exists on the actual Map. Workaround: bind methods (as above).

**4. \`Object.keys\` / \`for...in\` use \`ownKeys\` + \`getOwnPropertyDescriptor\`.**

If you implement \`has\` for membership but skip \`ownKeys\`/\`getOwnPropertyDescriptor\`, \`Object.keys\` won\'t see your "synthetic" keys.

\`\`\`js
const p = new Proxy({}, {
  has(_, k) { return true; },
});
'foo' in p;        // true
Object.keys(p);    // [] — has trap doesn\'t affect ownKeys
\`\`\`

For full coverage, implement \`ownKeys\` and \`getOwnPropertyDescriptor\` together.

**5. Invariants the engine enforces.**

The spec mandates that proxy traps respect certain invariants of the target. If you violate them, the proxy throws.

\`\`\`js
const t = Object.freeze({ a: 1 });
const p = new Proxy(t, {
  get(_, k) { return 99; },
});
p.a; // TypeError — target has non-configurable, non-writable a=1; cannot return 99
\`\`\`

If the target says "this property is permanent and equals 1," the proxy can\'t lie.

**6. Performance.**

Every property access on a proxy goes through trap dispatch. Multi-megabyte data structures wrapped in proxies will be noticeably slower than the originals. Profile if you\'re wrapping hot data.

**7. Debugging is harder.**

DevTools may show the proxy and not the underlying target. Stack traces from inside traps can be confusing. Console-logging a proxy invokes \`get\` traps, which can have side effects (e.g., trigger your reactive system).

**8. \`JSON.stringify\` calls \`toJSON\` if present — and proxies trigger \`get\`:**

\`\`\`js
const p = new Proxy({ a: 1 }, {
  get(t, k) { console.log('get', k); return Reflect.get(t, k); },
});
JSON.stringify(p);
// logs: get toJSON, get a
\`\`\`

If your proxy logs or has side effects, serialization triggers them.

**9. \`Promise\` resolution unwraps thenables.**

\`\`\`js
const p = new Proxy({ then(resolve) { resolve(42); } }, {});
await p; // 42 — Promise sees the then method and treats p as a thenable
\`\`\`

Wrapping arbitrary objects in proxies that happen to expose \`then\` can confuse async code.

**Senior signal:** "Proxies are great when you need transparent interception, but I keep them away from class instances with internal state, performance-critical paths, and APIs that pass the wrapped object out where identity matters."`,
    hint: 'Identity, private fields, internal slots, invariants, perf — all gotchas',
  },

  // ─────────────────────────────────────────────────────────────────
  // Array manipulation (3)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 162,
    category: 'arrays-objects',
    title: 'Mutating vs non-mutating array methods (and the new copy methods)',
    difficulty: 'mid',
    answer: `Knowing which methods mutate is critical for predictable code, especially in React.

**Mutating methods (modify in place, return reference or void):**

| Method | Behavior |
|---|---|
| \`push\`, \`pop\` | Add/remove from end |
| \`shift\`, \`unshift\` | Add/remove from start |
| \`splice\` | Insert/delete at index |
| \`sort\` | Sort in place |
| \`reverse\` | Reverse in place |
| \`fill\` | Set all elements |
| \`copyWithin\` | Copy portion within array |

\`\`\`js
const arr = [3, 1, 2];
const sorted = arr.sort();
sorted === arr;  // true — same array, mutated
arr;             // [1, 2, 3]
\`\`\`

**Non-mutating (return a new array):**

| Method | Behavior |
|---|---|
| \`slice\` | Subarray |
| \`concat\` | Combine arrays |
| \`map\`, \`filter\` | Transform / select |
| \`flat\`, \`flatMap\` | Flatten |
| \`reduce\`, \`reduceRight\` | Fold (returns any value) |

**ES2023 — copying counterparts to mutators:**

| Mutating | Non-mutating equivalent |
|---|---|
| \`sort\` | \`toSorted\` |
| \`reverse\` | \`toReversed\` |
| \`splice\` | \`toSpliced\` |
| \`arr[i] = v\` | \`with(i, v)\` |

\`\`\`js
const arr = [3, 1, 2];
const sorted = arr.toSorted(); // new array [1, 2, 3]
arr;                            // [3, 1, 2] — unchanged

const arr2 = [1, 2, 3, 4];
const updated = arr2.with(1, 99); // [1, 99, 3, 4]
arr2;                              // [1, 2, 3, 4] — unchanged
\`\`\`

**Why this matters in React:**

\`\`\`jsx
// ❌ Mutates state — React doesn\'t see a change, no re-render
function badAdd(item) {
  setItems(items => {
    items.push(item);
    return items; // same reference!
  });
}

// ✅ New array reference
function goodAdd(item) {
  setItems(items => [...items, item]);
}

// ✅ Modern equivalent for inserts
function goodInsert(item, at) {
  setItems(items => items.toSpliced(at, 0, item));
}
\`\`\`

**Sort gotchas:**

\`\`\`js
[10, 2, 1].sort(); // [1, 10, 2] — sorts as STRINGS by default!

// Numeric sort:
[10, 2, 1].sort((a, b) => a - b); // [1, 2, 10]
\`\`\`

\`Array.prototype.sort\` was unstable until ES2019; now it\'s stable across modern engines.

**Common pattern — immutable update with index:**

\`\`\`js
// Old way:
const next = [...arr.slice(0, i), newValue, ...arr.slice(i + 1)];

// New way:
const next = arr.with(i, newValue);
\`\`\`

**Common pattern — toggle in array:**

\`\`\`js
function toggle(arr, item) {
  return arr.includes(item)
    ? arr.filter(x => x !== item)
    : [...arr, item];
}
\`\`\`

**\`Array.from\` and \`Array.of\` — construction:**

\`\`\`js
Array.from('abc');                 // ['a', 'b', 'c']
Array.from({ length: 3 }, (_, i) => i * 2); // [0, 2, 4]
Array.from(new Set([1, 2, 3]));    // [1, 2, 3]
Array.of(7);                        // [7]  (vs new Array(7) which is length 7)
\`\`\``,
    hint: 'sort/reverse/splice mutate; toSorted/toReversed/toSpliced/with for immutability',
  },
  {
    id: 163,
    category: 'arrays-objects',
    title: 'reduce — patterns and pitfalls',
    difficulty: 'mid',
    answer: `\`reduce\` folds an iterable into a single value. The most flexible and most misused array method.

\`\`\`js
arr.reduce((accumulator, currentValue, index, array) => newAccumulator, initialValue);
\`\`\`

**Always provide \`initialValue\`** — without it, the first element is the accumulator and \`reduce\` skips it. Edge cases:
- Empty array + no initial → throws \`TypeError\`.
- Single-element array + no initial → returns that element without calling the reducer.

\`\`\`js
[].reduce((a, b) => a + b);     // TypeError
[5].reduce((a, b) => a + b);    // 5 (reducer never runs)
[].reduce((a, b) => a + b, 0);  // 0 ✅
\`\`\`

**Common patterns:**

**Sum / product:**

\`\`\`js
arr.reduce((a, b) => a + b, 0);
arr.reduce((a, b) => a * b, 1);
\`\`\`

**Group by:**

\`\`\`js
const byRole = users.reduce((acc, u) => {
  (acc[u.role] ||= []).push(u);
  return acc;
}, {});
\`\`\`

ES2024+ has \`Object.groupBy\` and \`Map.groupBy\` — use those when available:

\`\`\`js
const byRole = Object.groupBy(users, u => u.role);
const byRoleMap = Map.groupBy(users, u => u.role);
\`\`\`

**Index by id:**

\`\`\`js
const byId = users.reduce((acc, u) => {
  acc[u.id] = u;
  return acc;
}, {});
// Or:
const byId = Object.fromEntries(users.map(u => [u.id, u]));
\`\`\`

**Compose functions:**

\`\`\`js
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);
const transform = pipe(trim, lowercase, slugify);
\`\`\`

**Find max with predicate:**

\`\`\`js
const newest = posts.reduce((a, b) => a.date > b.date ? a : b);
\`\`\`

**Anti-patterns:**

**1. Using reduce when filter/map would be clearer:**

\`\`\`js
// ❌ Hard to read
const adults = users.reduce((acc, u) => {
  if (u.age >= 18) acc.push(u);
  return acc;
}, []);

// ✅ Just filter
const adults = users.filter(u => u.age >= 18);
\`\`\`

**2. Building objects/arrays then spreading on every step:**

\`\`\`js
// ❌ O(n²) — spreads acc every iteration
const merged = items.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});

// ✅ Mutate the accumulator (it\'s yours; reduce owns it)
const merged = items.reduce((acc, item) => {
  acc[item.key] = item.value;
  return acc;
}, {});

// ✅ Or use Object.fromEntries
const merged = Object.fromEntries(items.map(i => [i.key, i.value]));
\`\`\`

**3. Using reduce for everything:**

\`\`\`js
// ❌ Could just be filter+map
const result = arr.reduce((acc, x) => x > 0 ? [...acc, x * 2] : acc, []);

// ✅
const result = arr.filter(x => x > 0).map(x => x * 2);
\`\`\`

The two-pass version is fine for most data sizes. If you really need single-pass for huge arrays, an explicit \`for\` loop is clearer than \`reduce\` gymnastics.

**\`reduceRight\`** — same, but right-to-left. Useful for function composition where order matters:

\`\`\`js
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);
\`\`\`

**Senior insight:** "I reach for \`reduce\` when I'm genuinely folding to one value (sum, group, max). For transformations, \`map\`/\`filter\` are clearer. For mutation, an explicit loop is often most readable."`,
    hint: 'Always pass initialValue; mutate the acc; prefer map/filter for clarity',
  },
  {
    id: 164,
    category: 'arrays-objects',
    title: 'Array-like objects and the iterable protocol',
    difficulty: 'mid',
    answer: `Many JS values look like arrays but aren\'t — they have \`.length\` and indexed access but lack array methods.

**Common array-likes:**
- \`arguments\` (in regular functions).
- \`NodeList\` from \`document.querySelectorAll\`.
- \`HTMLCollection\` from \`getElementsByTagName\`.
- Strings (have \`length\`, indexed access).
- \`{ length: 3, 0: 'a', 1: 'b', 2: 'c' }\` — synthetic.

\`\`\`js
function f() {
  arguments.map; // undefined — arguments is array-like, not an Array
}
\`\`\`

**Three ways to convert:**

**1. \`Array.from\` — most explicit:**

\`\`\`js
const arr = Array.from(arguments);
const upperNames = Array.from(nodeList, n => n.textContent.toUpperCase());
\`\`\`

\`Array.from\` accepts a mapping function as the second arg (single-pass).

**2. Spread (only works on iterables, NOT plain array-likes):**

\`\`\`js
const arr = [...nodeList]; // ✅ NodeList is iterable
const arr2 = [...{ length: 3, 0: 'a' }]; // TypeError — not iterable
\`\`\`

**3. \`Array.prototype.slice.call\` — the old way:**

\`\`\`js
const arr = Array.prototype.slice.call(arguments);
\`\`\`

Pre-ES6 standard. Still works on plain array-likes that aren\'t iterable.

**Iterable vs array-like — the distinction:**

| | Iterable | Array-like |
|---|---|---|
| Has \`Symbol.iterator\` | ✅ | ❌ (not necessarily) |
| Works with \`for...of\` | ✅ | ❌ |
| Works with \`...spread\` | ✅ | ❌ |
| Works with \`Array.from\` | ✅ | ✅ |
| Has \`.length\` | maybe | ✅ |

Some objects are both (Array, String). Some are only iterable (\`Map\`, \`Set\`, generators). Some are only array-like (\`{length: 3}\`, \`arguments\` in older code).

**Making your own object iterable:**

\`\`\`js
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let n = this.from;
    return {
      next: () => n <= this.to ? { value: n++, done: false } : { value: undefined, done: true },
    };
  },
};

for (const n of range) console.log(n);
[...range];           // [1, 2, 3, 4, 5]
Array.from(range);    // [1, 2, 3, 4, 5]
\`\`\`

**Generators are the easy way:**

\`\`\`js
const range = {
  from: 1,
  to: 5,
  *[Symbol.iterator]() {
    for (let n = this.from; n <= this.to; n++) yield n;
  },
};
\`\`\`

**Array methods on array-likes via call/apply (legacy pattern):**

\`\`\`js
Array.prototype.forEach.call(nodeList, n => n.click());
\`\`\`

These days, prefer \`Array.from(nodeList).forEach(...)\` for clarity.

**\`arguments\` modernization:**

\`\`\`js
// Old way
function legacy() {
  const args = Array.prototype.slice.call(arguments);
}

// Modern
function modern(...args) {
  // args is already a real array
}
\`\`\`

Rest params give you a real array directly. Always prefer them over \`arguments\` in new code.

**\`Symbol.asyncIterator\` for streams:**

\`\`\`js
const stream = {
  async *[Symbol.asyncIterator]() {
    while (more) yield await fetchChunk();
  },
};
for await (const chunk of stream) processChunk(chunk);
\`\`\``,
    hint: 'Array.from = always works; spread = iterables only; iterable protocol via Symbol.iterator',
  },
];
