import type { Question } from '../lib/types';

/**
 * Interview question bank, ~135 cards across 15 categories.
 * Difficulty: junior (foundations) | mid (target audience) | senior (stretch).
 */
export const questions: Question[] = [
  // ─────────────────────────────────────────────────────────────────
  // JS Fundamentals (10)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 1,
    category: 'fundamentals',
    title: 'What is the difference between var, let, and const?',
    difficulty: 'junior',
    answer: `Three variable declarations with very different scoping and rebinding rules.

**var** — function-scoped, hoisted (initialized as \`undefined\`), can be redeclared.
**let** — block-scoped, hoisted but not initialized (the *temporal dead zone*), cannot be redeclared in the same scope.
**const** — block-scoped, must be initialized at declaration, cannot be reassigned. Note: \`const\` doesn't make objects immutable — only the binding is frozen.

\`\`\`js
const arr = [1, 2];
arr.push(3);    // ✅ allowed — mutating contents
arr = [4, 5];   // ❌ TypeError — reassigning the binding
\`\`\`

**Modern rule of thumb:** \`const\` by default, \`let\` when you need to reassign, never \`var\`.`,
    hint: 'Scope, hoisting, reassignment',
  },
  {
    id: 2,
    category: 'fundamentals',
    title: 'Explain closures with a practical example',
    difficulty: 'mid',
    answer: `A closure is a function bundled with references to its surrounding lexical scope. The function "remembers" variables from where it was *defined*, not where it's called.

**Practical example — a \`once\` utility:**

\`\`\`js
function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

const initDb = once(() => ({ connection: 'open' }));
initDb(); // creates connection
initDb(); // returns cached
\`\`\`

The returned function closes over \`called\` and \`result\` — they survive after \`once\` returns and persist across calls.

**Common pitfall:** Using \`var\` in a loop with async callbacks. All callbacks share the same closed-over variable.

\`\`\`js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 3, 3, 3
}
// Fix: use \`let\` (block-scoped, fresh binding each iteration)
\`\`\``,
    hint: 'Function + lexical environment',
  },
  {
    id: 3,
    category: 'fundamentals',
    title: 'How does the `this` keyword work?',
    difficulty: 'mid',
    answer: `\`this\` is determined by **how a function is called**, not where it's defined. Priority order:

1. **\`new\` keyword** → \`this\` is the new instance.
2. **Explicit binding** — \`.call(ctx)\`, \`.apply(ctx)\`, \`.bind(ctx)\`.
3. **Implicit binding** — \`obj.method()\` → \`this === obj\`.
4. **Default** — \`undefined\` in strict mode, \`globalThis\` otherwise.

**Arrow functions are the exception** — they ignore all of the above and inherit \`this\` lexically (from the enclosing scope at definition time).

\`\`\`js
const obj = {
  name: 'Ada',
  greet() { return \`Hi, \${this.name}\`; },
  greetArrow: () => \`Hi, \${this.name}\` // 'this' is NOT obj here
};

obj.greet();         // "Hi, Ada"
const g = obj.greet;
g();                 // "Hi, undefined" — implicit binding lost
g.call(obj);         // "Hi, Ada" — explicit binding restored
\`\`\``,
    hint: '4 binding rules + arrow exception',
  },
  {
    id: 4,
    category: 'fundamentals',
    title: 'What is the temporal dead zone (TDZ)?',
    difficulty: 'mid',
    answer: `The window between when a \`let\`/\`const\` variable is *hoisted* and when it's actually *initialized*. Accessing it during this window throws a \`ReferenceError\`.

\`\`\`js
console.log(x); // ReferenceError: Cannot access 'x' before initialization
let x = 5;
\`\`\`

Compare to \`var\`, which is initialized as \`undefined\` at hoist time:

\`\`\`js
console.log(y); // undefined (no error)
var y = 5;
\`\`\`

**Why it matters:** TDZ is a feature, not a bug. It catches bugs where you'd accidentally use a variable before its intended initialization. Always declare variables before using them.`,
    hint: 'Hoisted but not initialized',
  },
  {
    id: 5,
    category: 'fundamentals',
    title: 'Difference between == and ===?',
    difficulty: 'junior',
    answer: `**\`===\` (strict equality)** — compares value AND type. No coercion.
**\`==\` (loose equality)** — performs type coercion before comparing.

\`\`\`js
0 == '0';     // true (string coerced to number)
0 == false;   // true (both coerced to 0)
null == undefined; // true (special case)
NaN == NaN;   // false (NaN is never equal to anything)

0 === '0';    // false
null === undefined; // false
\`\`\`

**Rule:** Always use \`===\` unless you specifically want to catch both \`null\` and \`undefined\` with \`x == null\`. The MDN coercion table is unreadable for a reason — don't rely on it in code reviews.`,
    hint: 'Strict vs coerced equality',
  },
  {
    id: 6,
    category: 'fundamentals',
    title: 'Explain hoisting',
    difficulty: 'junior',
    answer: `Hoisting is JavaScript's behavior of moving declarations to the top of their scope before code execution. Only declarations are hoisted, not initializations.

**Function declarations** — fully hoisted (callable before declaration):
\`\`\`js
greet(); // works
function greet() { console.log('hi'); }
\`\`\`

**\`var\`** — hoisted, initialized as \`undefined\`:
\`\`\`js
console.log(x); // undefined
var x = 5;
\`\`\`

**\`let\`/\`const\`** — hoisted but not initialized (TDZ):
\`\`\`js
console.log(y); // ReferenceError
let y = 5;
\`\`\`

**Function expressions** — only the variable is hoisted, not the function:
\`\`\`js
greet(); // TypeError: greet is not a function
var greet = function () {};
\`\`\``,
    hint: 'Declarations move up, not values',
  },
  {
    id: 7,
    category: 'fundamentals',
    title: 'What are the falsy values in JavaScript?',
    difficulty: 'junior',
    answer: `There are exactly **8 falsy values** — everything else is truthy.

\`\`\`js
false
0
-0
0n          // BigInt zero
""          // empty string (also '' or \`\`)
null
undefined
NaN
\`\`\`

**Common gotchas:**
- \`'0'\` (string zero) is **truthy** — it's a non-empty string.
- \`[]\` (empty array) is **truthy** — objects are always truthy.
- \`{}\` (empty object) is **truthy**.
- \`'false'\` (the string) is **truthy**.

**Practical use:** \`if (value)\` filters all 8 falsy values. To check specifically for null/undefined, use \`value == null\` (loose equality is the idiomatic exception here).`,
    hint: 'Exactly 8 of them',
  },
  {
    id: 8,
    category: 'fundamentals',
    title: 'Explain destructuring with defaults and renaming',
    difficulty: 'junior',
    answer: `Destructuring extracts values from arrays or objects into individual variables.

**Object destructuring** — rename and provide defaults:
\`\`\`js
const user = { name: 'Ada', age: 30 };
const { name: userName, role = 'guest' } = user;
// userName === 'Ada', role === 'guest'
\`\`\`

**Array destructuring** — position-based, can skip:
\`\`\`js
const [first, , third] = [1, 2, 3]; // skip middle
const [a, b, ...rest] = [1, 2, 3, 4]; // rest = [3, 4]
\`\`\`

**Function parameters** — common pattern:
\`\`\`js
function fetchUser({ id, includeProfile = false } = {}) {
  // id is required (will be undefined if missing)
  // includeProfile defaults to false
  // The \`= {}\` lets you call fetchUser() with no args
}
\`\`\`

**Pitfall:** Defaults only apply when the value is exactly \`undefined\`. \`null\` does NOT trigger the default.

\`\`\`js
const { x = 5 } = { x: null }; // x === null, not 5
\`\`\``,
    hint: 'Extract, rename, default',
  },
  {
    id: 9,
    category: 'fundamentals',
    title: 'When should you use arrow functions vs regular functions?',
    difficulty: 'mid',
    answer: `**Use arrow functions when:**
- You want lexical \`this\` (most common: callbacks inside class methods).
- The function is short and one-shot (\`map\`, \`filter\`, \`reduce\` callbacks).

**Use regular functions when:**
- You need dynamic \`this\` (object methods).
- You need \`arguments\` (though rest \`...args\` is cleaner anyway).
- You need to use it as a constructor with \`new\`.
- You need hoisting (function declarations).

**Three things arrow functions don't have:**
1. Their own \`this\` — they inherit from enclosing scope.
2. Their own \`arguments\` object.
3. The ability to be \`new\`'d.

\`\`\`js
class Timer {
  constructor() {
    this.seconds = 0;
    // Arrow keeps \`this\` bound to the instance:
    setInterval(() => this.seconds++, 1000);
    // Regular function would have \`this === undefined\` here.
  }
}
\`\`\``,
    hint: 'Lexical this, no arguments, no new',
  },
  {
    id: 10,
    category: 'fundamentals',
    title: 'Implement a debounce function',
    difficulty: 'mid',
    answer: `Debounce delays a function until N milliseconds have passed without it being called again. Useful for search inputs, resize handlers, autosave.

\`\`\`js
function debounce(fn, ms) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

// Usage
const search = debounce((q) => api.search(q), 300);
input.addEventListener('input', (e) => search(e.target.value));
\`\`\`

**Walkthrough:**
1. Closure preserves \`timeoutId\` across calls.
2. Each call clears the previous timeout — only the *last* call within the window fires.
3. \`fn.apply(this, args)\` preserves the calling context.

**Throttle is the cousin** — guarantees execution at most once per N ms (good for scroll handlers).

**Pitfall:** Don't recreate the debounced function on every render in React — wrap with \`useMemo\` or use a custom hook.`,
    hint: 'Closure + setTimeout',
  },

  // ─────────────────────────────────────────────────────────────────
  // Event Loop & Async (10)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 11,
    category: 'event-loop',
    title: 'Predict the output: setTimeout vs Promise',
    difficulty: 'mid',
    answer: `\`\`\`js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
\`\`\`

**Output:** \`1, 4, 3, 2\`

**Why:**
1. \`'1'\` — synchronous, runs immediately.
2. \`setTimeout\` schedules a **macrotask**.
3. \`Promise.then\` schedules a **microtask**.
4. \`'4'\` — synchronous.
5. Stack is empty → drain ALL microtasks → \`'3'\`.
6. Pull next macrotask → \`'2'\`.

**The rule:** After each macrotask, the engine drains the *entire* microtask queue before rendering or running the next macrotask. Microtasks always win against macrotasks.`,
    hint: 'Microtasks beat macrotasks',
  },
  {
    id: 12,
    category: 'event-loop',
    title: 'What is the difference between microtasks and macrotasks?',
    difficulty: 'mid',
    answer: `**Macrotasks** — \`setTimeout\`, \`setInterval\`, I/O, UI events, MessageChannel.
**Microtasks** — Promise callbacks (\`.then\`, \`await\` continuations), \`queueMicrotask\`, \`MutationObserver\`.

**The lifecycle of a tick:**
1. Pull one task from the macrotask queue. Run it to completion.
2. Drain the *entire* microtask queue (any microtasks scheduled during step 2 also run before moving on).
3. Render (if needed — browsers may skip if frame budget is tight).
4. Loop back to step 1.

**Implication:** If your microtask schedules another microtask, it runs in the *same* tick. An infinite loop of microtasks blocks the main thread completely — neither rendering nor other tasks happen.

\`\`\`js
function evil() {
  Promise.resolve().then(evil); // never yields
}
evil(); // browser frozen
\`\`\``,
    hint: 'Different queues, different priority',
  },
  {
    id: 13,
    category: 'event-loop',
    title: 'Promise.all vs allSettled vs race vs any',
    difficulty: 'mid',
    answer: `Four combinators with very different semantics:

**\`Promise.all([p1, p2, p3])\`**
- Resolves when **all** fulfill (with array of values).
- Rejects on the **first** rejection (fail-fast).
- Use when you need every result and any failure aborts.

**\`Promise.allSettled([p1, p2, p3])\`**
- Never rejects.
- Returns array of \`{status: 'fulfilled', value}\` or \`{status: 'rejected', reason}\`.
- Use when you want all results regardless of individual failures.

**\`Promise.race([p1, p2, p3])\`**
- Settles with the **first** to settle (fulfill OR reject).
- Use for timeouts: \`Promise.race([fetch(url), timeout(5000)])\`.

**\`Promise.any([p1, p2, p3])\`**
- Resolves with first **fulfillment**.
- Rejects only if **all** reject (with \`AggregateError\`).
- Use for redundant requests where any success counts.

\`\`\`js
// Timeout pattern
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ]);
\`\`\``,
    hint: 'all/allSettled/race/any',
  },
  {
    id: 14,
    category: 'event-loop',
    title: 'Why is await in a loop a perf problem?',
    difficulty: 'mid',
    answer: `Each \`await\` yields to the microtask queue, **serializing** what could be parallel work.

\`\`\`js
// ❌ Serial — total time = sum of all latencies
for (const id of userIds) {
  const user = await fetchUser(id);
  process(user);
}

// ✅ Parallel — total time = max latency
const users = await Promise.all(userIds.map(fetchUser));
users.forEach(process);
\`\`\`

**When serial IS correct:**
- Each iteration depends on the previous result.
- You're rate-limiting external APIs.
- Memory budget — you can't hold all results in flight.

**Middle ground for batching** (e.g., 10 at a time):
\`\`\`js
for (let i = 0; i < ids.length; i += 10) {
  const batch = ids.slice(i, i + 10);
  await Promise.all(batch.map(fetchUser));
}
\`\`\`

**Don't \`Promise.all\` blindly** — if one rejects, the others still run but their results are thrown away. Use \`allSettled\` if that matters.`,
    hint: 'Serial vs parallel execution',
  },
  {
    id: 15,
    category: 'event-loop',
    title: 'Why does this try/catch not catch the error?',
    difficulty: 'mid',
    answer: `\`\`\`js
try {
  setTimeout(() => { throw new Error('boom'); }, 0);
} catch (e) {
  console.error(e); // never runs
}
\`\`\`

**Why:** \`try/catch\` only catches synchronous errors in the **current call stack**. When the timeout's callback fires later, the \`try\` block is long gone — the call stack is empty. The error becomes an uncaught exception.

**Fixes:**

\`\`\`js
// Async/await — try/catch works because await is "synchronous" in flow
async function safe() {
  try {
    await new Promise((_, rej) => setTimeout(() => rej(new Error('boom')), 0));
  } catch (e) {
    console.error(e); // ✅ caught
  }
}

// Promise chain — .catch handles it
Promise.reject(new Error('boom')).catch(console.error);

// Event listener for truly uncaught errors
window.addEventListener('unhandledrejection', e => {
  console.error('Unhandled:', e.reason);
});
\`\`\``,
    hint: 'Async errors escape sync try/catch',
  },
  {
    id: 16,
    category: 'event-loop',
    title: 'What does async/await actually do?',
    difficulty: 'mid',
    answer: `\`async/await\` is syntactic sugar over Promises. Two rules:

1. An \`async\` function always returns a Promise (auto-wrapping return values).
2. \`await\` pauses the function and queues the rest as a microtask continuation when the awaited Promise settles.

**Equivalence:**

\`\`\`js
// Async/await
async function getUser(id) {
  const res = await fetch(\`/api/users/\${id}\`);
  const data = await res.json();
  return data;
}

// Pure Promise equivalent
function getUser(id) {
  return fetch(\`/api/users/\${id}\`)
    .then(res => res.json())
    .then(data => data);
}
\`\`\`

**Key insight:** \`await\` is a microtask checkpoint. Code after \`await\` doesn't run until the next microtask drain.

\`\`\`js
async function run() {
  console.log('A');
  await Promise.resolve();
  console.log('B');
}
run();
console.log('C');
// Output: A, C, B
\`\`\``,
    hint: 'Sugar over Promises + microtasks',
  },
  {
    id: 17,
    category: 'event-loop',
    title: 'Implement a retry with exponential backoff',
    difficulty: 'mid',
    answer: `\`\`\`js
async function retry(fn, { tries = 3, base = 200, factor = 2 } = {}) {
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === tries - 1) throw err;
      const delay = base * factor ** attempt;
      // Optional: add jitter to avoid thundering herd
      const jitter = Math.random() * 100;
      await new Promise(r => setTimeout(r, delay + jitter));
    }
  }
}

// Usage
const data = await retry(() => fetch('/api').then(r => r.json()), {
  tries: 5,
  base: 500,
});
\`\`\`

**Walkthrough:**
1. Loop attempts up to \`tries\` times.
2. On success → return immediately.
3. On the **last** failure → re-throw (don't swallow).
4. Otherwise → wait \`base * factor^attempt\` ms before retrying. Backoff grows: 500ms, 1s, 2s, 4s...
5. **Jitter** adds randomness to prevent every client retrying at the same instant after an outage.

**Don't retry on 4xx client errors** — they won't fix themselves. Only retry on network errors and 5xx.`,
    hint: 'Exponential delay + jitter',
  },
  {
    id: 18,
    category: 'event-loop',
    title: 'Cancel a fetch with AbortController',
    difficulty: 'mid',
    answer: `\`AbortController\` is the standard way to cancel async operations.

\`\`\`js
const controller = new AbortController();

fetch('/slow-endpoint', { signal: controller.signal })
  .then(res => res.json())
  .then(console.log)
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('Cancelled');
    } else {
      throw err;
    }
  });

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);
\`\`\`

**In React** — cancel on unmount or dependency change:

\`\`\`jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(\`/api/users/\${id}\`, { signal: controller.signal })
    .then(res => res.json())
    .then(setUser)
    .catch(err => {
      if (err.name !== 'AbortError') console.error(err);
    });
  return () => controller.abort();
}, [id]);
\`\`\`

**Bonus:** \`AbortSignal.timeout(ms)\` (modern browsers) creates a pre-configured timeout signal — no manual setTimeout.`,
    hint: 'AbortController + signal',
  },
  {
    id: 19,
    category: 'event-loop',
    title: 'What is the difference between Node.js and browser event loops?',
    difficulty: 'senior',
    answer: `Both run an event loop, but Node.js has additional **phases** the browser doesn't.

**Browser:** macrotasks → drain microtasks → render → repeat.

**Node.js phases (each tick):**
1. **Timers** — \`setTimeout\`, \`setInterval\`.
2. **Pending callbacks** — deferred I/O.
3. **Idle/prepare** — internal.
4. **Poll** — retrieve I/O events.
5. **Check** — \`setImmediate\` callbacks.
6. **Close callbacks** — \`socket.on('close')\`.

**Microtasks drain between phases**, like the browser.

**Node-specific extras:**
- \`process.nextTick\` — runs *before* microtasks (higher priority than promises). Easy to abuse and starve the event loop.
- \`setImmediate(fn)\` — fires in the **check** phase, which is a different queue from \`setTimeout(fn, 0)\` (timers phase).

**Practical:** When asked about ordering in interviews, **specify the runtime**. Node 11+ aligned microtask behavior with browsers, but \`nextTick\` and \`setImmediate\` remain Node-only.`,
    hint: 'Phases + nextTick + setImmediate',
  },
  {
    id: 20,
    category: 'event-loop',
    title: 'How does React 18 batch state updates?',
    difficulty: 'senior',
    answer: `**Pre-React 18:** Batching only happened inside React event handlers. Updates in promises, timeouts, or native handlers triggered immediate re-renders.

**React 18 — Automatic Batching:** ALL state updates are batched, regardless of where they happen.

\`\`\`jsx
// React 17: 3 renders
// React 18: 1 render
function handleClick() {
  fetch('/api').then(() => {
    setLoading(false);
    setUser(data);
    setError(null);
  });
}
\`\`\`

**Opt-out with \`flushSync\`:**

\`\`\`jsx
import { flushSync } from 'react-dom';

flushSync(() => setCount(c => c + 1));
// At this point, the DOM is updated synchronously
const height = elementRef.current.offsetHeight;
\`\`\`

**Use case:** When you need the DOM updated before measuring (animations, third-party integrations). Don't reach for \`flushSync\` casually — it bypasses concurrent rendering optimizations.

**Concurrent features built on this:** \`useTransition\`, \`useDeferredValue\` work because batching is granular and interruptible.`,
    hint: 'Auto-batching in 18+, flushSync to opt out',
  },

  // ─────────────────────────────────────────────────────────────────
  // Prototypes & Classes (8)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 21,
    category: 'prototypes',
    title: 'How does prototypal inheritance work?',
    difficulty: 'mid',
    answer: `Every JS object has an internal \`[[Prototype]]\` (accessible via \`Object.getPrototypeOf\`). Property lookup walks the chain: own → prototype → prototype's prototype → ... → \`null\`.

\`\`\`js
const animal = { eats: true };
const rabbit = Object.create(animal);
rabbit.jumps = true;

rabbit.jumps;  // true (own)
rabbit.eats;   // true (from animal via prototype)
rabbit.flies;  // undefined (chain ended)
\`\`\`

**The chain in detail:**
- \`obj.__proto__\` (legacy) === \`Object.getPrototypeOf(obj)\` (modern).
- Functions have a \`prototype\` property — the object that becomes \`[[Prototype]]\` of instances created with \`new\`.
- Don't confuse \`fn.prototype\` (used by \`new\`) with \`obj.__proto__\` (the actual chain link).

**Why it matters:** Methods on \`Array.prototype\` are how \`[].map(...)\` works. Adding to \`Object.prototype\` is forbidden — it pollutes every object in the program.`,
    hint: 'Lookup walks the chain',
  },
  {
    id: 22,
    category: 'prototypes',
    title: 'class vs function constructor — what are the differences?',
    difficulty: 'mid',
    answer: `\`class\` is mostly syntactic sugar over function constructors + prototypes, but adds real semantics.

**Same under the hood:**
\`\`\`js
class Animal {
  constructor(name) { this.name = name; }
  speak() { return \`\${this.name} speaks\`; }
}
// Equivalent to:
function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return \`\${this.name} speaks\`; };
\`\`\`

**Real differences:**
- **Must use \`new\`** — calling \`Animal()\` directly throws TypeError.
- **Methods are non-enumerable** — won't show in \`for...in\`.
- **Methods run in strict mode** automatically.
- **\`extends\` and \`super\`** — clean syntax, plus subclass constructor must call \`super()\` before \`this\`.
- **Static methods** — \`static foo() {}\` lives on the constructor, not the prototype.
- **Hoisting** — class declarations are NOT hoisted (TDZ); function declarations are.

**Modern \`class\` features:** private fields (\`#field\`), public fields, static blocks. Use them — they're more expressive than the function-constructor equivalents.`,
    hint: 'Sugar + stricter semantics',
  },
  {
    id: 23,
    category: 'prototypes',
    title: 'What does Object.create(null) do, and why use it?',
    difficulty: 'senior',
    answer: `Returns an object with **no prototype** — it doesn't inherit from \`Object.prototype\`.

\`\`\`js
const dict = Object.create(null);
dict.toString;   // undefined (not 'function toString()')
dict.hasOwnProperty; // undefined
\`\`\`

**Why use it:**

1. **Pure dictionaries.** When using an object as a map of arbitrary keys, you don't want collisions with built-in methods. \`map['toString']\` would otherwise return a function.

2. **Prototype pollution defense.** Prototype pollution attacks set \`Object.prototype.<malicious>\`, which then leaks into every object. \`Object.create(null)\` is immune.

3. **Slight perf win** in V8 for objects used purely as data containers.

**Trade-off:** Lose access to \`obj.hasOwnProperty(...)\`, \`obj.toString()\`, etc. Use the modern alternatives:

\`\`\`js
Object.hasOwn(dict, 'key');     // safe replacement
\`\${dict}\`;                     // throws — no toString
String(dict);                    // also throws

// In practice — just use Map for dictionaries:
const dict = new Map();
\`\`\`

**Pragmatic answer:** Reach for \`Map\` instead. \`Object.create(null)\` is mostly a "I know my fundamentals" answer.`,
    hint: 'Prototype-less dictionary',
  },
  {
    id: 24,
    category: 'prototypes',
    title: 'Implement a minimal EventEmitter class',
    difficulty: 'mid',
    answer: `\`\`\`js
class EventEmitter {
  #listeners = new Map(); // private field

  on(event, handler) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set());
    }
    this.#listeners.get(event).add(handler);
    return this; // chainable
  }

  off(event, handler) {
    this.#listeners.get(event)?.delete(handler);
    return this;
  }

  emit(event, ...args) {
    const handlers = this.#listeners.get(event);
    if (!handlers) return false;
    // Copy before iterating so handlers can call off() safely
    [...handlers].forEach(h => h(...args));
    return true;
  }

  once(event, handler) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      handler(...args);
    };
    return this.on(event, wrapper);
  }
}
\`\`\`

**Design choices:**
- **Private field \`#listeners\`** — true encapsulation (post-2022).
- **\`Set\` instead of array** — auto-dedupes, O(1) removal.
- **Copy-before-iterate** — a handler that calls \`.off()\` mid-emission would mutate the set during iteration.
- **\`once\`** wraps so we can \`.off()\` the wrapper, not the original.

**Pitfall:** \`addEventListener('click', fn.bind(el))\` then trying to \`removeEventListener\` with another \`bind\` — \`bind\` returns a new function each call. Store the bound reference.`,
    hint: 'Map + Set + private fields',
  },
  {
    id: 25,
    category: 'prototypes',
    title: 'What does `instanceof` actually check?',
    difficulty: 'mid',
    answer: `\`a instanceof B\` walks \`a\`'s prototype chain looking for \`B.prototype\`. Returns \`true\` if found, \`false\` otherwise.

\`\`\`js
class Animal {}
class Dog extends Animal {}
const d = new Dog();

d instanceof Dog;     // true
d instanceof Animal;  // true (chain walk finds Animal.prototype)
d instanceof Object;  // true (everything inherits from Object)
\`\`\`

**Pitfalls:**

**1. Cross-realm objects** (iframes, vm contexts) have *different* constructors:
\`\`\`js
const iframeArr = iframeWindow.Array;
const arr = new iframeArr();
arr instanceof Array; // false — different Array.prototype
Array.isArray(arr);   // true — works across realms
\`\`\`

**2. \`Symbol.hasInstance\`** can be customized:
\`\`\`js
class Even {
  static [Symbol.hasInstance](n) { return n % 2 === 0; }
}
4 instanceof Even; // true
\`\`\`

**3. Primitives** are never \`instanceof\` anything:
\`\`\`js
'hello' instanceof String; // false
new String('hello') instanceof String; // true
\`\`\`

**Better alternatives** for type checks: \`typeof\`, \`Array.isArray\`, structural duck-typing.`,
    hint: 'Walks the prototype chain',
  },
  {
    id: 26,
    category: 'prototypes',
    title: 'Public, private, and static class fields',
    difficulty: 'mid',
    answer: `Modern class field syntax (ES2022+):

\`\`\`js
class Counter {
  // Public field — visible, mutable
  count = 0;

  // Private field — only accessible inside the class body
  #internalState = {};

  // Static field — on the class itself, not instances
  static instances = 0;

  // Private static
  static #secret = 'hidden';

  constructor() {
    Counter.instances++;
  }

  increment() {
    this.count++;
    this.#internalState.lastAt = Date.now();
  }

  // Static method
  static reset() {
    Counter.instances = 0;
  }
}

const c = new Counter();
c.count;          // 0 (public)
c.#internalState; // SyntaxError outside class body
Counter.instances; // 1
\`\`\`

**Private vs convention \`_underscore\`:**
- \`_field\` — convention only; nothing prevents access.
- \`#field\` — actually inaccessible outside the class. Hard privacy.

**\`static\` blocks** (newest) — for complex static initialization:
\`\`\`js
class Cache {
  static #data;
  static {
    Cache.#data = loadFromDisk();
  }
}
\`\`\``,
    hint: '#private, public =, static',
  },
  {
    id: 27,
    category: 'prototypes',
    title: 'What is the difference between Object.freeze and a deep freeze?',
    difficulty: 'mid',
    answer: `\`Object.freeze(obj)\` is **shallow** — top-level properties become read-only, but nested objects remain mutable.

\`\`\`js
const config = Object.freeze({
  name: 'app',
  settings: { timeout: 5000 }
});

config.name = 'changed';        // ❌ silently fails (or throws in strict mode)
config.settings.timeout = 9999; // ✅ works — nested object isn't frozen
\`\`\`

**Deep freeze** — recursively freeze all nested objects:

\`\`\`js
function deepFreeze(obj) {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }
  return Object.freeze(obj);
}
\`\`\`

**Caveats:**
- \`Object.freeze\` doesn't freeze \`Map\`/\`Set\` contents (\`map.set\` still works).
- Has a small performance cost in V8.
- Fails silently in non-strict mode — use \`'use strict'\` to surface errors.
- For most cases, **TypeScript's \`readonly\`** gives compile-time guarantees without runtime cost.`,
    hint: 'Shallow vs recursive',
  },
  {
    id: 28,
    category: 'prototypes',
    title: 'Why does typeof null return "object"?',
    difficulty: 'junior',
    answer: `It's a **bug from JavaScript's original 1995 implementation** that became part of the spec — and TC39 has decided not to fix it because it would break too much existing code.

\`\`\`js
typeof null;       // 'object' (the famous bug)
typeof undefined;  // 'undefined'
typeof {};         // 'object' (correct)
typeof [];         // 'object' (also "wrong" — arrays aren't distinguished)
\`\`\`

**Robust null checks:**

\`\`\`js
// Strict equality (clearest)
value === null;

// Catches both null and undefined (loose equality is the idiomatic exception)
value == null;

// Common combo
if (value != null) { /* not null AND not undefined */ }
\`\`\`

**Distinguishing arrays from plain objects:**

\`\`\`js
Array.isArray(value);       // ✅ canonical
value instanceof Array;     // ❌ fails across realms
Object.prototype.toString.call(value); // '[object Array]' — old trick
\`\`\``,
    hint: 'Famous historical bug',
  },
];
