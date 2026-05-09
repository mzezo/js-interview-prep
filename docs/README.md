# JavaScript Interview Prep — Mid-Level Engineer Edition

> A practical, problem-driven study guide for mid-level JavaScript engineers preparing for frontend, full-stack, and React-focused interviews.

[![Pages](https://img.shields.io/badge/docs-github--pages-blue)](#)
[![CI](https://img.shields.io/badge/ci-lint%20%7C%20test-green)](#)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#)

---

## Table of Contents

1. [Introduction & Learning Objectives](#1-introduction--learning-objectives)
2. [How to Use This Guide](#2-how-to-use-this-guide)
3. **Core Topics**
   1. [JavaScript Fundamentals: Scope, Closures & `this`](#chapter-1--javascript-fundamentals-scope-closures--this)
   2. [The Event Loop, Microtasks & Async Patterns](#chapter-2--the-event-loop-microtasks--async-patterns)
   3. [Prototypes, Classes & Inheritance](#chapter-3--prototypes-classes--inheritance)
   4. [Arrays, Objects & Immutability](#chapter-4--arrays-objects--immutability)
   5. [Data Structures You'll Actually Be Asked About](#chapter-5--data-structures-youll-actually-be-asked-about)
   6. [Algorithms: Patterns, Not Memorization](#chapter-6--algorithms-patterns-not-memorization)
   7. [React Core: Rendering, Reconciliation & Keys](#chapter-7--react-core-rendering-reconciliation--keys)
   8. [React Hooks Deep Dive](#chapter-8--react-hooks-deep-dive)
   9. [State Management Patterns](#chapter-9--state-management-patterns)
   10. [Performance: Profiling, Memoization & Bundle Size](#chapter-10--performance-profiling-memoization--bundle-size)
   11. [Testing: Unit, Integration & E2E](#chapter-11--testing-unit-integration--e2e)
   12. [Debugging: Memory Leaks, Race Conditions & Render Loops](#chapter-12--debugging-memory-leaks-race-conditions--render-loops)
   13. [Browser Networking, HTTP & Caching](#chapter-13--browser-networking-http--caching)
   14. [System Design for Frontend Engineers](#chapter-14--system-design-for-frontend-engineers)
   15. [Behavioral & Communication](#chapter-15--behavioral--communication)
4. [Quick-Reference Snippets](#4-quick-reference-snippets)
5. [Further Reading](#5-further-reading)

---

## 1. Introduction & Learning Objectives

This guide is built for **mid-level engineers** (roughly 3–7 years of experience) targeting roles where JavaScript or TypeScript is the primary language. It assumes you can write code, build features, and ship to production — but want to sharpen the *why* behind the *what* before stepping into a high-stakes interview loop.

### What you'll be able to do after this guide

By the end you should be able to:

- **Explain** JavaScript runtime mechanics (event loop, closures, prototype chain) without hand-waving.
- **Solve** common algorithm prompts using a small set of recurring patterns (two pointers, sliding window, hashmap, BFS/DFS).
- **Reason about React** rendering behavior and predict re-renders before running the code.
- **Diagnose** real-world production issues: memory leaks, stale closures, race conditions, infinite render loops.
- **Design** a frontend system whiteboard-style: component boundaries, data flow, caching, error/loading states.
- **Tell stories** in behavioral rounds using STAR, with technical depth that matches the role level.

### What this guide is *not*

- ❌ A LeetCode replacement. Use it alongside ~50–80 problems on a platform of your choice.
- ❌ A framework tutorial. We assume working React knowledge.
- ❌ Comprehensive. It's a study scaffold — go deeper on weak spots.

---

## 2. How to Use This Guide

Each chapter follows the same shape so you can scan and dive:

| Section | Purpose |
|---|---|
| **Why it matters** | The interviewer's reason for asking |
| **Core concepts** | The minimum you must be able to explain |
| **Worked example** | Prompt → solution → walkthrough |
| **Common pitfalls** | What separates a 3 from a 4 in the rubric |
| **Self-check quiz** | 3–5 questions, answers collapsible |

> **💡 Study strategy:** Read a chapter, do the quiz cold, then attempt 2–3 related problems from your problem set. Don't move on until you can teach the concept aloud.

---

# Chapter 1 — JavaScript Fundamentals: Scope, Closures & `this`

## Why it matters

Every senior interviewer has a few "gotcha" questions in this space. They're not testing trivia — they're testing whether you understand the runtime well enough to debug production code where a `this` binding silently broke after a refactor.

## Core concepts

- **Lexical scope**: A function's scope is determined by *where it's written*, not where it's called.
- **Closure**: A function plus its surrounding lexical environment. Created every time a function is created.
- **`this` binding rules** (in priority order):
  1. `new` keyword → new instance
  2. Explicit binding: `.call()`, `.apply()`, `.bind()`
  3. Implicit binding: `obj.method()` → `this === obj`
  4. Default: `undefined` in strict mode, `globalThis` otherwise
  5. **Arrow functions ignore all of the above** and inherit `this` lexically.

## Worked example

### Prompt

> Implement a `once(fn)` utility that returns a function which can only invoke `fn` a single time. Subsequent calls should return the cached result.

### Step-by-step solution

```js
function once(fn) {
  let called = false;
  let result;

  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);  // preserve `this` from caller
    }
    return result;
  };
}

// Usage
const initDb = once(() => {
  console.log('Connecting...');
  return { connection: 'established' };
});

initDb(); // logs "Connecting...", returns object
initDb(); // returns same object, no log
```

**Walkthrough:**

1. The outer `once` runs once and creates a closure containing `called` and `result`.
2. The returned function *closes over* those two variables — they survive after `once` returns.
3. We use a regular function (not arrow) so the caller's `this` is forwarded via `.apply(this, args)`. This matters when the result is attached as a method.
4. `args` uses rest syntax so we forward arbitrary arguments cleanly.

### Common pitfalls

- ❌ Using an arrow function for the returned function — `this` would point at `once`'s lexical scope, not the caller's.
- ❌ Forgetting to cache `result` — calling repeatedly returns `undefined` after the first call.
- ❌ Using a global flag instead of a closure variable — breaks if `once` is called twice to create two independent wrapped functions.

## Self-check quiz

<details>
<summary><strong>Q1.</strong> What does this log, and why?</summary>

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

**Answer:** Logs `3, 3, 3`. `var` is function-scoped, so all three callbacks close over the *same* `i`, which equals `3` by the time the timeouts fire. Replace with `let` to get `0, 1, 2` (block-scoped, fresh binding per iteration).
</details>

<details>
<summary><strong>Q2.</strong> What is <code>obj.greet()</code> vs. <code>const g = obj.greet; g()</code>?</summary>

```js
const obj = {
  name: 'Ada',
  greet() { return `Hi, ${this.name}`; }
};
```

**Answer:** `obj.greet()` returns `"Hi, Ada"` (implicit binding). `g()` returns `"Hi, undefined"` in strict mode (or throws if accessing a property on `undefined`) — the function reference loses its binding when extracted. Fix: `const g = obj.greet.bind(obj)`.
</details>

<details>
<summary><strong>Q3.</strong> Are arrow functions ever the wrong choice?</summary>

**Answer:** Yes, in three cases:
1. Object methods that need `this` to refer to the object.
2. Constructor functions — arrows can't be `new`'d.
3. Functions where you need `arguments` (use rest params instead) or want dynamic `this` binding via `.call`/`.apply`/`.bind`.
</details>

---

# Chapter 2 — The Event Loop, Microtasks & Async Patterns

## Why it matters

Async bugs are the most expensive bugs in production. If you can't explain when a Promise resolves vs. when a `setTimeout(fn, 0)` runs, you can't debug them.

## Core concepts

- **Call stack**: Synchronous execution.
- **Task queue (macrotasks)**: `setTimeout`, `setInterval`, I/O, UI events.
- **Microtask queue**: Promise callbacks (`.then`, `await` continuations), `queueMicrotask`, `MutationObserver`.
- **Rule**: After each macrotask, the engine drains the **entire** microtask queue before rendering or running the next macrotask.

```
┌─────────────┐     ┌───────────────┐     ┌──────────┐     ┌──────────────┐
│ Call Stack  │ ──> │ Microtasks    │ ──> │ Render   │ ──> │ Next Macrotask│
└─────────────┘     │ (drained all) │     │ (maybe)  │     └──────────────┘
                    └───────────────┘
```

## Worked example

### Prompt

> Predict the output:

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
```

### Step-by-step solution

**Output:** `1, 4, 3, 2`

**Walkthrough:**
1. `'1'` — synchronous, logs immediately.
2. `setTimeout` schedules a **macrotask**.
3. `Promise.resolve().then(...)` schedules a **microtask**.
4. `'4'` — synchronous, logs immediately.
5. Stack is empty → drain microtask queue → `'3'`.
6. Pull next macrotask → `'2'`.

### A trickier variant

```js
async function run() {
  console.log('A');
  await Promise.resolve();
  console.log('B');
}
run();
console.log('C');
// Output: A, C, B
```

`await` pauses `run()` and queues the continuation as a microtask. `'C'` runs before the continuation resumes.

### Common pitfalls

- ❌ Saying `setTimeout(fn, 0)` runs "immediately" — it doesn't; it runs after the current task and microtasks complete.
- ❌ Confusing Node.js (which has additional phases like `process.nextTick` with higher priority than promises) with the browser model. Specify which runtime in your answer.
- ❌ Forgetting that an unhandled rejection in a microtask still triggers `unhandledrejection` events.

## Self-check quiz

<details>
<summary><strong>Q1.</strong> Why might <code>await</code> in a tight loop be a performance problem?</summary>

**Answer:** Each `await` yields to the microtask queue, serializing what could be parallel work. If the awaited operations are independent, use `Promise.all([...])` to run them concurrently.

```js
// ❌ Serial — N * latency
for (const id of ids) {
  await fetchUser(id);
}

// ✅ Parallel — max(latency)
await Promise.all(ids.map(fetchUser));
```
</details>

<details>
<summary><strong>Q2.</strong> What's the difference between <code>Promise.all</code>, <code>Promise.allSettled</code>, and <code>Promise.race</code>?</summary>

**Answer:**
- `Promise.all` — resolves when *all* fulfill, rejects on the *first* rejection.
- `Promise.allSettled` — never rejects; returns an array of `{status, value/reason}` objects.
- `Promise.race` — settles with the *first* settled promise (fulfillment or rejection).
- `Promise.any` (often forgotten) — resolves with the first fulfillment, rejects only if *all* reject (`AggregateError`).
</details>

<details>
<summary><strong>Q3.</strong> What's wrong with this error handling?</summary>

```js
try {
  setTimeout(() => { throw new Error('boom'); }, 0);
} catch (e) {
  console.error(e);
}
```

**Answer:** The `try/catch` only catches synchronous errors in the current call stack. By the time the `setTimeout` callback runs, this `try` block is long gone. The error becomes an uncaught exception. To handle async errors, use `try/catch` with `async/await`, or `.catch()` on the promise, or attach an `error` event listener.
</details>

---

# Chapter 3 — Prototypes, Classes & Inheritance

## Why it matters

Even if you write only modern `class` syntax, the prototype chain is what JavaScript actually uses under the hood. Understanding it explains why `instanceof` works, why mixing `Object.create(null)` matters for security, and why `Array.prototype.push.call(arrayLike, ...)` is a real pattern.

## Core concepts

- Every object has an internal `[[Prototype]]` (accessible via `Object.getPrototypeOf` or the legacy `__proto__`).
- Property lookup walks the chain: own → prototype → prototype's prototype → ... → `null`.
- `class` is **syntactic sugar** over constructor functions and prototypes — but it adds real semantics: `extends`, `super`, hoisting differences, and stricter rules around `new`.

## Worked example

### Prompt

> Implement a minimal `EventEmitter` (Node-style) using a `class`. Methods: `on`, `off`, `emit`. Bonus: `once`.

### Step-by-step solution

```js
class EventEmitter {
  #listeners = new Map(); // private field, no external access

  on(event, handler) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    this.#listeners.get(event).add(handler);
    return this; // chaining
  }

  off(event, handler) {
    this.#listeners.get(event)?.delete(handler);
    return this;
  }

  emit(event, ...args) {
    const handlers = this.#listeners.get(event);
    if (!handlers) return false;
    // copy to allow handlers to mutate during iteration
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
```

**Walkthrough:**
1. **Private field `#listeners`** — true encapsulation; can't be touched from outside. Pre-2022 you'd see `_listeners` (convention) or `WeakMap` (true privacy).
2. **`Set` instead of `Array`** — automatically dedupes and gives O(1) removal.
3. **Copy before iterating** — a handler that calls `off` during emission would otherwise mutate the set we're iterating.
4. **`once` wraps the original** — same handler reference can be used for `off` because we close over `wrapper`.

### Common pitfalls

- ❌ Storing handlers in an array and using `splice` — O(n) removal and identity bugs if the same handler is added twice.
- ❌ Forgetting to copy handlers before iterating — modifying-during-iteration leads to skipped or double-fired callbacks.
- ❌ Using `===` to compare bound functions: `el.addEventListener('x', fn.bind(el))` — `bind` returns a *new* function each call, so `removeEventListener` with another `bind` won't match.

## Self-check quiz

<details>
<summary><strong>Q1.</strong> What does <code>Object.create(null)</code> return and why use it?</summary>

**Answer:** An object with **no prototype** — it doesn't inherit from `Object.prototype`. Useful for dictionaries/maps where you don't want collisions with `toString`, `hasOwnProperty`, or prototype-pollution attack surfaces. Trade-off: you lose the prototype methods, so `obj.hasOwnProperty(...)` won't work — use `Object.hasOwn(obj, key)` instead.
</details>

<details>
<summary><strong>Q2.</strong> What's the difference between <code>class A extends B</code> and manually wiring prototypes?</summary>

**Answer:** `extends` does three things you'd otherwise wire by hand: sets `A.prototype.__proto__ = B.prototype` (instance inheritance), sets `A.__proto__ = B` (static inheritance — often forgotten in manual wiring), and enables `super()` calls in the constructor and methods. It also enforces that you call `super()` before using `this` in the subclass constructor.
</details>

<details>
<summary><strong>Q3.</strong> Why does <code>typeof null === 'object'</code>?</summary>

**Answer:** A historical bug from the original JavaScript implementation that became part of the spec. Use `value === null` for explicit null checks; use `value == null` for the loose check that catches both `null` and `undefined`.
</details>

---

# Chapter 4 — Arrays, Objects & Immutability

## Why it matters

State management, React rendering, and Redux-style reducers all assume immutability. A single accidental mutation creates the most frustrating class of bug in modern frontend: "the state changed but the UI didn't update."

## Core concepts

- **Reference equality**: Objects and arrays are compared by reference. `[] === []` is `false`.
- **Shallow vs deep copy**: `{...obj}` and `[...arr]` are *shallow*. Nested objects are still shared references.
- **Mutating vs non-mutating array methods**:

| Mutating | Non-mutating |
|---|---|
| `push`, `pop`, `shift`, `unshift` | `concat`, `slice` |
| `splice`, `sort`, `reverse` | `toSpliced`, `toSorted`, `toReversed` (ES2023) |
| `fill`, `copyWithin` | `map`, `filter`, `reduce`, `flat` |

## Worked example

### Prompt

> Write a `deepClone` function that handles nested objects, arrays, `Date`, and circular references. (Bonus points for mentioning the modern built-in.)

### Step-by-step solution

```js
function deepClone(value, seen = new WeakMap()) {
  // Primitives and functions: return as-is
  if (value === null || typeof value !== 'object') return value;

  // Circular reference guard
  if (seen.has(value)) return seen.get(value);

  // Special object types
  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);
  if (value instanceof Map) {
    const result = new Map();
    seen.set(value, result);
    value.forEach((v, k) => result.set(deepClone(k, seen), deepClone(v, seen)));
    return result;
  }
  if (value instanceof Set) {
    const result = new Set();
    seen.set(value, result);
    value.forEach(v => result.add(deepClone(v, seen)));
    return result;
  }

  // Arrays and plain objects
  const result = Array.isArray(value) ? [] : {};
  seen.set(value, result);
  for (const key of Reflect.ownKeys(value)) {
    result[key] = deepClone(value[key], seen);
  }
  return result;
}
```

**The modern way:** `structuredClone(value)` (built into all modern browsers and Node 17+). It handles cycles, `Date`, `Map`, `Set`, typed arrays, and more — but it does *not* clone functions, DOM nodes, or class instances (they become plain objects).

### Common pitfalls

- ❌ `JSON.parse(JSON.stringify(obj))` — loses `Date` (becomes string), `undefined`, functions, `Map`/`Set`, and throws on cycles.
- ❌ Using `WeakMap` for the `seen` cache is correct (allows GC); a regular `Map` would prevent garbage collection of the originals.
- ❌ Forgetting `Reflect.ownKeys` — only iterates string keys with `Object.keys`, missing Symbols.

## Self-check quiz

<details>
<summary><strong>Q1.</strong> Why does this React component not re-render?</summary>

```jsx
const [user, setUser] = useState({ name: 'Ada', tags: ['admin'] });

const addTag = (tag) => {
  user.tags.push(tag);   // mutation!
  setUser(user);          // same reference
};
```

**Answer:** `setUser(user)` passes the *same reference*. React's bail-out optimization compares with `Object.is` and skips the re-render. Fix: `setUser({ ...user, tags: [...user.tags, tag] })`.
</details>

<details>
<summary><strong>Q2.</strong> What's the difference between <code>Object.freeze</code> and a deep freeze?</summary>

**Answer:** `Object.freeze` is shallow — top-level properties can't be added/removed/changed, but nested objects remain mutable. A deep freeze recurses through all properties calling `freeze` on each nested object. Note that `freeze` only enforces immutability in strict mode (silent failure otherwise) and has a small perf cost in V8.
</details>

<details>
<summary><strong>Q3.</strong> When would you reach for <code>Map</code> over a plain object?</summary>

**Answer:** When (1) keys aren't strings/symbols, (2) you need preserved insertion order with the `Map` API, (3) you need frequent additions/removals (Map is optimized for this), or (4) you want to avoid prototype pollution risk. Plain objects are fine when keys are known strings and the data is mostly static.
</details>

---

# Chapter 5 — Data Structures You'll Actually Be Asked About

## Why it matters

Frontend interviews don't ask about red-black trees. They ask about hashmaps, stacks, queues, and trees — because that's what real UI code uses (DOM is a tree, undo/redo is a stack, event queue is a queue, caches are hashmaps).

## The shortlist

| Structure | Built-in | Common interview use |
|---|---|---|
| Hashmap | `Map`, `Object` | Frequency counts, memoization, two-sum |
| Set | `Set` | Dedupe, "have we seen this" |
| Stack | `Array` (push/pop) | Undo, parentheses matching, DFS |
| Queue | `Array` (push/shift) — but O(n) shift! | BFS, scheduling. Use linked list for true O(1). |
| Linked list | None — implement | Reverse, detect cycle, merge sorted |
| Tree / N-ary tree | None — implement | DOM traversal, file systems |
| Graph | None — adjacency list | Dependencies, friend networks |
| Heap / PQ | None — implement | Top-K, Dijkstra |

> **⚠️ Performance note:** `array.shift()` is O(n) because it re-indexes. For real queues, either use a head/tail pointer pattern or a linked list. Mention this trade-off when asked.

## Worked example

### Prompt

> Given a string of parentheses (`()`, `[]`, `{}`), determine if it's balanced.

### Step-by-step solution

```js
function isBalanced(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];

  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else if (ch in pairs) {
      // Closing bracket: top of stack must match
      if (stack.pop() !== pairs[ch]) return false;
    }
    // Other characters: ignore (or reject, depending on prompt)
  }

  return stack.length === 0;
}
```

**Walkthrough:**
1. Push every opener onto a stack.
2. On a closer, pop and verify the match. If empty or mismatch, fail fast.
3. After the loop, an empty stack means everything closed.
4. **Time:** O(n). **Space:** O(n) worst case (all openers).

### Variation interviewers love

> Same problem, but you can replace at most one character.

Hint: For each potential replacement position, run the check, or use a smarter dynamic-programming approach. Discuss trade-offs aloud.

### Common pitfalls

- ❌ Comparing characters instead of using a lookup map — works, but verbose. The map is cleaner and easier to extend.
- ❌ Forgetting the final `stack.length === 0` check — `"((("` would otherwise return `true`.
- ❌ Calling `.pop()` on an empty stack returns `undefined`, which won't equal any opener — works *accidentally* here, but explain it deliberately.

## Self-check quiz

<details>
<summary><strong>Q1.</strong> How would you implement a queue with O(1) enqueue/dequeue using only arrays?</summary>

**Answer:** Use two stacks (`inStack`, `outStack`). Enqueue pushes to `inStack`. Dequeue: if `outStack` is empty, drain `inStack` into `outStack` (reverses order), then pop from `outStack`. Amortized O(1) per operation.
</details>

<details>
<summary><strong>Q2.</strong> What's the time complexity of <code>array.includes(x)</code> vs <code>set.has(x)</code>?</summary>

**Answer:** `includes` is O(n) (linear scan); `set.has` is amortized O(1) (hash lookup). For repeated membership checks, build the `Set` once and reuse — converting in a tight loop defeats the purpose.
</details>

<details>
<summary><strong>Q3.</strong> Detect a cycle in a singly-linked list — explain Floyd's algorithm.</summary>

**Answer:** Two pointers, slow (1 step) and fast (2 steps). If they ever meet, there's a cycle (the fast pointer "laps" the slow one). If fast reaches `null`, no cycle. O(n) time, O(1) space — better than the naive set-based approach which is O(n) space.
</details>

---

# Chapter 6 — Algorithms: Patterns, Not Memorization

## Why it matters

Mid-level candidates aren't expected to invent novel algorithms. They're expected to **recognize** which of ~6 patterns applies and execute it cleanly.

## The pattern shortlist

1. **Two pointers** — sorted arrays, palindromes, pair-sum.
2. **Sliding window** — longest substring, max sum subarray of size K.
3. **Hashmap counting** — anagram, two-sum, frequency.
4. **BFS / DFS** — trees, graphs, grid problems (islands, shortest path).
5. **Binary search** — sorted arrays, "find first/last" variants, search-on-answer.
6. **Dynamic programming** — overlapping subproblems (climb stairs, coin change, LIS).

> **🎯 Interview tip:** Before writing code, say the pattern out loud: *"This looks like a sliding window problem because we need a contiguous subarray with a constraint."* That signals seniority.

## Worked example

### Prompt

> Given a string, find the length of the longest substring without repeating characters.
> `"abcabcbb"` → `3` (`"abc"`)

### Step-by-step solution

```js
function lengthOfLongestSubstring(s) {
  const lastSeen = new Map(); // char -> most recent index
  let start = 0;              // window start
  let max = 0;

  for (let end = 0; end < s.length; end++) {
    const ch = s[end];

    // If we've seen the char inside the current window, shrink from left
    if (lastSeen.has(ch) && lastSeen.get(ch) >= start) {
      start = lastSeen.get(ch) + 1;
    }

    lastSeen.set(ch, end);
    max = Math.max(max, end - start + 1);
  }

  return max;
}
```

**Walkthrough:**
1. **Pattern recognition:** Variable-size sliding window with a "no duplicates" constraint.
2. We track `start` (left edge) and slide `end` (right edge).
3. When we hit a repeat *inside* the current window, jump `start` to one past the previous occurrence — never backwards.
4. The `>= start` check is crucial: a repeat *outside* the current window doesn't matter.
5. **Time:** O(n) — each character visited at most twice. **Space:** O(min(n, charset)).

### Common pitfalls

- ❌ Using a `Set` and shrinking one char at a time — O(n²) worst case (e.g., `"abcabcbcbc..."`).
- ❌ Forgetting the `>= start` guard — `start` jumps backwards on stale entries, giving wrong results.
- ❌ Returning `start - end + 1` instead of `end - start + 1` — off-by-sign error under interview pressure.

## Self-check quiz

<details>
<summary><strong>Q1.</strong> When does binary search apply beyond "sorted array, find value"?</summary>

**Answer:** Whenever the answer space is **monotonic**. Examples: "minimum capacity to ship within D days" — for any capacity, you can verify if it works in O(n); the verification is monotonic in capacity, so binary search the answer. Same for "smallest divisor" and "Koko eating bananas"-style problems.
</details>

<details>
<summary><strong>Q2.</strong> What's the difference between BFS and DFS for "find shortest path in unweighted graph"?</summary>

**Answer:** **BFS finds the shortest path** in unweighted graphs because it explores level by level. DFS does not — it could find a longer path first. Use a queue for BFS, a stack (or recursion) for DFS. For weighted graphs with non-negative weights, use Dijkstra (BFS + priority queue).
</details>

<details>
<summary><strong>Q3.</strong> What's the brute-force → optimized progression for "two-sum"?</summary>

**Answer:** Brute force: nested loop, O(n²). Optimized: single pass with a hashmap of `value → index`; for each `x`, look up `target - x`. O(n) time, O(n) space. The trade — extra memory for time — is the canonical interview talking point.
</details>

---

# Chapter 7 — React Core: Rendering, Reconciliation & Keys

## Why it matters

If you can't predict when a component re-renders, you can't optimize it, and you can't debug "why is this firing twice in dev?"

## Core concepts

- **Render** = React calls your function and gets a new tree.
- **Commit** = React applies DOM changes based on the diff between previous and new trees.
- **A component re-renders when**:
  1. Its state changes (`useState` setter with a new value).
  2. Its parent re-renders (and it's not memoized).
  3. A subscribed context value changes.
- **Reconciliation**: React diffs old and new virtual DOM by *type and position*. Different types → unmount + remount (state lost!). Same type → update props.
- **Keys**: Stable identity hints for list reconciliation. **Never use array index** for items that can reorder, insert at front, or be deleted.

## Worked example

### Prompt

> A list re-creates child component state on every parent re-render. Why?

```jsx
function Parent({ items }) {
  return (
    <ul>
      {items.map((item, i) => (
        <Item key={i} data={item} />   // 🚩 index key
      ))}
    </ul>
  );
}
```

### Step-by-step solution

**Diagnosis:** When `items` reorders (e.g., user sorts the list), key=`i` still maps to position. React thinks the *same component* now has different props. `Item`'s internal state stays in place — bound to the wrong data.

**Fix:**
```jsx
<Item key={item.id} data={item} />
```

Now the key follows the data. On reorder, React moves the existing component (and its state) along with its data — correct behavior.

**When index keys are OK:**
- The list is static (never reordered, no inserts/deletes mid-list).
- The component is stateless and pure (key only affects performance, not correctness).

### Common pitfalls

- ❌ Generating keys with `Math.random()` or `Date.now()` — every render gets a new key, every item unmounts and remounts every render. Catastrophic perf.
- ❌ Using array index when items can be filtered. Filtering shifts indices but data identity moved.
- ❌ Assuming `React.memo` prevents *all* re-renders — it doesn't bypass context changes or state changes inside the component.

## Self-check quiz

<details>
<summary><strong>Q1.</strong> What does this log on initial render in development, and why?</summary>

```jsx
function App() {
  console.log('render');
  return <h1>Hi</h1>;
}
```

**Answer:** Logs `'render'` **twice** in development with React 18+ Strict Mode enabled. React intentionally double-invokes function components to surface side-effects in render bodies. In production, it logs once. Don't put side effects in render — move them to `useEffect`.
</details>

<details>
<summary><strong>Q2.</strong> Why doesn't this work?</summary>

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };
  // count goes from 0 → 1, not 0 → 3
}
```

**Answer:** All three calls capture the same stale `count` value (closure). Each schedules `setCount(0 + 1)`. Fix with the updater form: `setCount(c => c + 1)` — React passes the latest value to your callback.
</details>

<details>
<summary><strong>Q3.</strong> When does React 18 batch state updates?</summary>

**Answer:** React 18 introduced **automatic batching** — state updates in promises, setTimeouts, and native event handlers are now batched (pre-18, only React event handlers were batched). To opt out, use `flushSync(() => setState(...))` when you need synchronous DOM measurement after the update.
</details>

---

# Chapter 8 — React Hooks Deep Dive

## Why it matters

Hooks are not "the new way to write components" — they're a system with rules. Most React bugs in production come from violating those rules subtly.

## The Rules of Hooks (and why)

1. **Call hooks at the top level** — never in conditions, loops, or nested functions.
2. **Call hooks from React functions** — components or custom hooks.

**Why:** React identifies hooks by *call order*, not by name. Conditional calls misalign the order on subsequent renders.

## Hook cheat sheet

| Hook | Use it for | Don't use it for |
|---|---|---|
| `useState` | Local UI state | Anything derivable from props/state |
| `useEffect` | Synchronizing with external systems (fetch, subscriptions, DOM) | Transformations of state — derive in render |
| `useLayoutEffect` | Reading layout *before* paint (rare) | Anything `useEffect` covers — it's slower |
| `useMemo` | Expensive computations, referential stability for deps | Cheap calculations — overhead exceeds savings |
| `useCallback` | Functions passed as deps to memoized children | Every callback ever |
| `useRef` | Mutable values that don't trigger re-render, DOM nodes | Values you want to render |
| `useReducer` | Complex state with multiple sub-values, derived transitions | Simple boolean/string state |
| `useContext` | Avoiding prop drilling for stable, low-frequency values | High-frequency state (causes broad re-renders) |

## Worked example

### Prompt

> Write a `useDebouncedValue(value, delay)` hook.

### Step-by-step solution

```jsx
import { useState, useEffect } from 'react';

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);   // cleanup on every change
  }, [value, delay]);

  return debounced;
}

// Usage
function SearchBar() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (debouncedQuery) fetchResults(debouncedQuery);
  }, [debouncedQuery]);

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

**Walkthrough:**
1. We start `debounced` equal to `value` so the first render is sync (no flash of empty state).
2. The effect resets the timer on every `value` change. Cleanup cancels the previous timeout — that's the whole debounce mechanism.
3. `delay` is in the dep array because if it changes mid-flight, we want to use the new value.

### Common pitfalls

- ❌ Storing the timeout ID in `useRef` and clearing in cleanup — works, but the closure pattern above is simpler.
- ❌ Forgetting to clear on unmount — the setTimeout fires on a dead component, triggering "can't update unmounted" warnings.
- ❌ Not including `delay` in deps — stale closure if the prop changes.

## Self-check quiz

<details>
<summary><strong>Q1.</strong> Why does this <code>useEffect</code> run on every render?</summary>

```jsx
useEffect(() => {
  fetchData(options);
}, [options]); // options is { limit: 10 }
```

**Answer:** If `options` is constructed inline in the parent (`<Child options={{limit: 10}} />`), it's a new object every render → reference inequality → effect re-fires. Fix: stabilize with `useMemo`, or destructure to primitives in deps: `[options.limit]`.
</details>

<details>
<summary><strong>Q2.</strong> When should you reach for <code>useReducer</code> over <code>useState</code>?</summary>

**Answer:** When (1) state shape has multiple fields that change together, (2) the next state depends on multiple previous fields, (3) you want to centralize state transitions for testing, or (4) you want to dispatch the same action from many places. Bonus: `dispatch` is referentially stable, so it can be safely passed via context without causing re-renders.
</details>

<details>
<summary><strong>Q3.</strong> What's wrong with this custom hook?</summary>

```jsx
function useUser(id) {
  if (!id) return null;
  const [user, setUser] = useState(null);
  // ...
}
```

**Answer:** Conditional hook call — violates the Rules of Hooks. The `useState` is sometimes called, sometimes not, breaking React's call-order tracking. Fix: always call hooks at the top, then handle the null case in the returned value.
</details>

---

# Chapter 9 — State Management Patterns

## Why it matters

"How would you manage state in this app?" is one of the most common system-design-lite questions. The wrong answer ("Redux for everything") signals you stopped learning in 2017.

## The decision tree

```
Is the state...
├── Local to one component?            → useState / useReducer
├── Shared between siblings?           → Lift to common parent
├── Used across many components,
│   updates infrequent (theme, auth)?  → React Context
├── Server data with caching needs?    → React Query / SWR / RTK Query
├── Complex client state with derived
│   values, async, undo/redo?          → Zustand / Jotai / Redux Toolkit
└── URL-related (filters, tabs)?        → URL search params (router state)
```

## Worked example

### Prompt

> Walk me through how you'd manage state for a paginated, filterable, sortable data table that also has row selection and bulk actions.

### Step-by-step solution

**Categorize the state:**

| State | Where it lives | Why |
|---|---|---|
| Page, filters, sort | URL search params | Shareable, back-button, refresh-safe |
| Fetched data | React Query | Caching, background refetch, stale time |
| Selected row IDs | Local component state (`useState`) | Ephemeral, doesn't outlive page |
| Bulk action in flight | React Query mutation | Optimistic updates, rollback on error |
| User preferences (page size) | localStorage + context | Persistent, app-wide |

**Talk through:**
> "I'd put pagination and filters in the URL because they need to be bookmarkable. Fetched data goes in React Query — it gives me caching, dedup, and background refetch for free, which I'd otherwise have to build. Selection is local; it doesn't need to survive a page refresh, and lifting it would just complicate the API."

This is the answer interviewers want: state categorized by *lifecycle* and *ownership*, not by tool.

### Common pitfalls

- ❌ Reflexively reaching for Redux when the app has 3 contexts and 50 components.
- ❌ Putting server data in Redux — you end up reimplementing React Query badly. Pick one strategy.
- ❌ Hoisting selection state to the top "in case we need it later" — YAGNI; lift when shared.

## Self-check quiz

<details>
<summary><strong>Q1.</strong> What's the downside of putting everything in React Context?</summary>

**Answer:** Any consumer re-renders when any value in the context changes. Splitting context by concern (`UserContext`, `ThemeContext`) reduces blast radius. For high-frequency updates, Context is the wrong tool — reach for Zustand/Jotai or selector-based stores.
</details>

<details>
<summary><strong>Q2.</strong> When should you put state in the URL?</summary>

**Answer:** When the state should survive (a) refresh, (b) sharing the link, (c) back/forward navigation. Common cases: filters, pagination, sorts, modals that should be linkable, tabs. Not for: ephemeral UI like hover, drag in progress, validation errors.
</details>

<details>
<summary><strong>Q3.</strong> What problem does React Query / SWR solve that <code>useEffect + fetch</code> doesn't?</summary>

**Answer:** Caching across components, automatic deduplication, background refetching, stale-while-revalidate, request cancellation, optimistic updates, and retry logic. The list of edge cases you'd otherwise rebuild is long enough to justify the dependency on any non-trivial app.
</details>

---

# Chapter 10 — Performance: Profiling, Memoization & Bundle Size

## Why it matters

"It's slow" is not actionable. "The Profiler shows `<Table />` re-rendering 200ms per keystroke because the columns array is reconstructed every parent render" is a fix in 5 minutes.

## The performance toolkit

1. **Measure first**: React DevTools Profiler, Chrome Performance tab, Lighthouse.
2. **Identify the bottleneck**: Render time? JS execution? Network? Memory?
3. **Fix the right layer**: Don't memoize away a 1ms render when the bundle is 3MB.

## Common React perf wins (ranked by impact)

| Fix | Typical impact |
|---|---|
| Code splitting / lazy load routes | 100s of KB off initial bundle |
| Virtualize long lists (`react-window`) | 60 FPS on 10k-row tables |
| Memoize expensive child trees with `React.memo` + stable props | Eliminates wasted renders |
| `useMemo` / `useCallback` for stable references | Only meaningful with memoized children |
| Move state down (colocation) | Limits re-render blast radius |
| Defer expensive work with `useDeferredValue` / `startTransition` | Smooths input responsiveness |

> **⚠️ Don't premature-optimize.** `useMemo` and `useCallback` have their own cost. Profile first.

## Worked example

### Prompt

> A search input lags as the user types because each keystroke re-renders a 5,000-row table. Walk me through fixing it.

### Step-by-step solution

**1. Measure.** Open Profiler, record a typing session. Confirm the table is the slow component.

**2. Decouple the input from the table render.** Two options:

   - **`useDeferredValue`** — keeps the input snappy, lets React deprioritize the table.
   ```jsx
   const [query, setQuery] = useState('');
   const deferredQuery = useDeferredValue(query);
   const filtered = useMemo(() => filter(rows, deferredQuery), [rows, deferredQuery]);
   ```
   - **Debounce** — explicit delay (covered in Chapter 8).

**3. Virtualize.** Even after debouncing, rendering 5,000 DOM nodes is expensive. Use `react-window` to render only the ~20 visible rows.

**4. Memoize the row component.**
```jsx
const Row = React.memo(({ data }) => <tr>...</tr>);
```
Now if the row props are stable, React skips its render.

**5. Stabilize props.** Wrap callbacks in `useCallback`, derived data in `useMemo`. Inline objects/arrays in JSX are a memoization killer.

### Common pitfalls

- ❌ Skipping step 1 — guessing where the bottleneck is. Always profile.
- ❌ Wrapping everything in `useMemo` defensively — memoization has a cost (memory + comparison).
- ❌ Putting `useCallback` on a callback passed to a non-memoized child — no benefit, since the child re-renders anyway.

## Self-check quiz

<details>
<summary><strong>Q1.</strong> What's the difference between <code>useMemo</code> and <code>useCallback</code>?</summary>

**Answer:** `useMemo(fn, deps)` caches the *return value* of `fn`. `useCallback(fn, deps)` caches the *function itself*. `useCallback(fn, deps)` is sugar for `useMemo(() => fn, deps)`.
</details>

<details>
<summary><strong>Q2.</strong> What does <code>React.memo</code> do, and what's its limitation?</summary>

**Answer:** Wraps a component so it only re-renders when its props change (shallow comparison by default). Limitation: shallow compare on inline objects/functions/arrays from a parent will always be different — props need to be referentially stable for memo to help. You can pass a custom comparator as the second arg, but at that point reconsider the design.
</details>

<details>
<summary><strong>Q3.</strong> What is "code splitting" and how do you do it in React?</summary>

**Answer:** Splitting your bundle into chunks loaded on demand instead of upfront. In React: `const Page = React.lazy(() => import('./Page'))` plus a `<Suspense fallback={...}>`. Bundlers (Webpack, Vite, Next.js) emit each dynamic import as a separate chunk.
</details>

---

# Chapter 11 — Testing: Unit, Integration & E2E

## Why it matters

The senior signal in testing is knowing *what* to test, not how to use Jest. Mid-level candidates often over-mock and under-cover behavior; staying close to user behavior is the calibration target.

## The testing pyramid (modernized)

```
       ┌─────────────┐
       │     E2E     │   ← Playwright / Cypress
       │   (~5%)     │      Real browser, real network
       ├─────────────┤
       │ Integration │   ← React Testing Library
       │   (~25%)    │      Components + logic, mocked APIs
       ├─────────────┤
       │    Unit     │   ← Vitest / Jest
       │   (~70%)    │      Pure functions, hooks, utilities
       └─────────────┘
```

## Worked example

### Prompt

> Write tests for this component:

```jsx
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
```

### Step-by-step solution

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

describe('LoginForm', () => {
  it('shows an error when email is invalid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/invalid email/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with the email when valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(onSubmit).toHaveBeenCalledWith('ada@example.com');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
```

**Walkthrough:**
1. **Query by role/label, not class names** — the same query a screen reader uses. Decouples test from styling.
2. **`userEvent` over `fireEvent`** — simulates real user interactions (focus, keyboard, etc.).
3. **Test behavior, not implementation** — we don't reach into state. We type, click, assert what the user would see.
4. **`queryByRole` for absence** — `getByRole` throws on miss; `queryBy*` returns null.

### Common pitfalls

- ❌ `getByTestId` everywhere — testing implementation, not user-visible behavior. Reach for `*ByRole` first.
- ❌ Not awaiting `userEvent` calls in v14+ — silent timing bugs.
- ❌ Mocking `useState` or `useEffect` — you're testing React, not your component.
- ❌ Testing private functions — refactor them out into a utility module if they need testing.

## Self-check quiz

<details>
<summary><strong>Q1.</strong> When should you write an E2E test instead of an integration test?</summary>

**Answer:** When the test value comes from real network, real browser quirks, or cross-page navigation — login flows, payment flows, anything that touches third-party services. E2E tests are slow and flaky compared to RTL — use sparingly for high-value happy paths.
</details>

<details>
<summary><strong>Q2.</strong> What's the right way to mock <code>fetch</code> in tests?</summary>

**Answer:** Use **MSW (Mock Service Worker)** to intercept at the network layer. You write request handlers (like a fake server) and they apply uniformly across unit/integration tests. Stubbing `global.fetch` directly works but couples tests to implementation details (URLs, fetch options).
</details>

<details>
<summary><strong>Q3.</strong> How do you test a custom hook in isolation?</summary>

**Answer:** `renderHook` from `@testing-library/react`. It wraps your hook in a host component and gives you `result.current` to inspect, plus `act` for triggering updates.

```js
const { result } = renderHook(() => useCounter());
act(() => result.current.increment());
expect(result.current.count).toBe(1);
```
</details>

---

# Chapter 12 — Debugging: Memory Leaks, Race Conditions & Render Loops

## Why it matters

The interview question "Tell me about a hard bug you debugged" is universal. Having a vocabulary for the *category* of bug ("classic stale closure", "missed cleanup leak", "race between two fetches") demonstrates pattern recognition.

## The three classics

### 1. Memory leaks

**Cause:** Subscriptions, timers, or DOM references that outlive the component without cleanup.

```jsx
useEffect(() => {
  const id = setInterval(poll, 1000);
  return () => clearInterval(id); // ✅ cleanup
}, []);
```

**Detection:**
- Chrome DevTools → Memory → Heap snapshot before/after navigating to/from the page.
- Look for retained components or detached DOM nodes that shouldn't exist.

### 2. Race conditions in async effects

**Cause:** A second fetch resolves before the first; the first overwrites the second's data.

```jsx
useEffect(() => {
  let cancelled = false;
  fetchUser(id).then(data => {
    if (!cancelled) setUser(data);  // ✅ ignore stale results
  });
  return () => { cancelled = true; };
}, [id]);
```

Modern alternative: pass an `AbortSignal` to fetch and abort in cleanup.

### 3. Infinite render loops

**Cause:** An effect updates state, which re-runs the effect.

```jsx
// 🚩 Loop
useEffect(() => {
  setItems([...items, fetched]);
}, [items]);

// ✅ Use the updater form, drop items from deps if not needed
useEffect(() => {
  setItems(prev => [...prev, fetched]);
}, [fetched]);
```

## Worked example

### Prompt

> A user reports the dashboard becomes sluggish after about 10 minutes. CPU goes up, memory grows. Walk me through how you'd investigate.

### Step-by-step solution

**1. Reproduce.** Reliably trigger the slowdown — e.g., leave it open with auto-refresh on for 15 minutes.

**2. Memory profile.**
   - DevTools → Memory → Take heap snapshot at minute 0.
   - Take another at minute 15.
   - Compare retained size growth. Filter by "Detached HTMLDivElement" — if you see thousands, you have orphaned DOM.

**3. Look for usual suspects:**
   - `setInterval` / `setTimeout` without cleanup.
   - Event listeners on `window`/`document` not removed in cleanup.
   - WebSocket / EventSource subscriptions.
   - Closures capturing large objects (e.g., `useCallback` whose deps include the entire data set).

**4. Check the auto-refresh path** — likely culprit given the symptom timing. Inspect the effect:
   ```jsx
   useEffect(() => {
     const ws = new WebSocket(url);
     ws.onmessage = handler;
     // 🚩 missing cleanup → every re-run leaks a socket
   }, [url]);
   ```

**5. Fix and verify** with a fresh heap snapshot session.

### Common pitfalls

- ❌ Using `console.log` in production code — captured strings can keep large objects alive in DevTools.
- ❌ Adding `useEffect` cleanup but mutating closed-over state inside — cleanup runs with stale values; that's correct, just be aware.
- ❌ Not abort-controlling fetches — the response arrives, your `then` runs on an unmounted component, React warns.

## Self-check quiz

<details>
<summary><strong>Q1.</strong> What's a "stale closure" and how do you fix it?</summary>

**Answer:** A function captures a variable from an outer scope at definition time; the variable later changes, but the function still references the old value. Common in `useEffect` callbacks and event handlers attached once. Fixes: include the value in the deps array (re-create the function), use a `ref` for the latest value, or use the updater form of `setState`.
</details>

<details>
<summary><strong>Q2.</strong> How would you debug "this component renders 5 times when it should render once"?</summary>

**Answer:** React DevTools → Profiler → record an interaction. Each render is logged with the reason ("Hooks changed", "Props changed", "Parent re-rendered"). If "Props changed" — inspect which prop and stabilize it. If "Hooks changed" — find which `useState`/`useReducer` is firing extra. If "Parent re-rendered" — wrap in `React.memo` (after stabilizing props).
</details>

<details>
<summary><strong>Q3.</strong> A test passes locally but fails in CI. What do you check first?</summary>

**Answer:** (1) Timezone differences — date tests are notorious. (2) Test isolation — leaking state from a previous test, especially if running parallel. (3) Race conditions in async assertions — replace `setTimeout` waits with `findBy*` queries. (4) Snapshots — different OS/Node version produces different output. (5) `Math.random` / `Date.now` not stubbed — fix with `vi.useFakeTimers()` or fixed seeds.
</details>

---

# Chapter 13 — Browser Networking, HTTP & Caching

## Why it matters

You can't reason about performance, security, or auth bugs without understanding the network. The interviewer's filter: "Can this person debug a 401 vs a CORS error vs a stale cache?"

## The fundamentals

### HTTP status codes worth memorizing

| Range | Meaning | Common examples |
|---|---|---|
| 2xx | Success | 200 OK, 201 Created, 204 No Content |
| 3xx | Redirect | 301 (permanent), 302 (temp), 304 (not modified) |
| 4xx | Client error | 400, **401 (unauthenticated)**, **403 (unauthorized)**, 404, 409, 422, 429 |
| 5xx | Server error | 500, 502, 503, 504 |

> **Common confusion:** 401 means "I don't know who you are" (no/bad credentials). 403 means "I know who you are; you can't do this." Confusing them in an answer signals junior.

### CORS in one paragraph

The browser blocks cross-origin requests by default. The server opts in via `Access-Control-Allow-Origin`. For non-simple requests (custom headers, methods other than GET/POST/HEAD, certain content types), the browser sends a **preflight `OPTIONS`** request first to confirm the server allows it. If you see "blocked by CORS", the fix is on the server, not in the client — never "disable CORS" in production.

### Caching layers

```
Browser memory cache → Browser disk cache → Service Worker → CDN → Origin
```

Headers that matter:
- `Cache-Control: max-age=...` / `s-maxage=...` (CDN-specific)
- `ETag` / `If-None-Match` — conditional requests, returns 304 if unchanged
- `Vary: Accept-Encoding, Accept-Language` — cache key dimensions

## Worked example

### Prompt

> Your API call fails with `Failed to fetch` in the browser, no status code in DevTools. What do you check?

### Step-by-step solution

**Diagnostic ladder:**

1. **Network tab — does the request appear?**
   - No → it's blocked before sending: CORS preflight failure, mixed content (HTTP from HTTPS page), or extension blocking.
   - Yes, with status 0 / red → next step.

2. **Console — is there a CORS error message?**
   - "blocked by CORS policy" → server-side config: `Access-Control-Allow-Origin`, allowed methods/headers.
   - Common gotcha: credentialed requests (`credentials: 'include'`) require `Access-Control-Allow-Credentials: true` and `Access-Control-Allow-Origin` cannot be `*`.

3. **Mixed content?** HTTPS page calling HTTP API → browser blocks silently in modern versions.

4. **DNS / network failure?** Try the URL directly in the browser. If it fails too, infrastructure issue.

5. **Aborted request?** `AbortController` triggered — your code, not the network.

### Common pitfalls

- ❌ "I'll just disable CORS in the browser" — only works for local dev (`--disable-web-security`); never a production fix.
- ❌ Confusing CORS with auth — CORS is a browser-enforced policy *on top of* whatever auth your API has.
- ❌ Forgetting that `OPTIONS` preflight failures also show up as CORS errors. Inspect both requests in the Network tab.

## Self-check quiz

<details>
<summary><strong>Q1.</strong> What's the difference between cookies, localStorage, and sessionStorage for auth tokens?</summary>

**Answer:** Cookies (with `HttpOnly; Secure; SameSite=Strict`) are the most secure for auth — JS can't read them, immune to XSS token theft. localStorage is readable by any JS on the origin → XSS = full compromise. sessionStorage is the same but cleared on tab close. Modern best practice: HttpOnly cookies for refresh tokens, in-memory short-lived access tokens.
</details>

<details>
<summary><strong>Q2.</strong> What does <code>Cache-Control: no-cache</code> mean?</summary>

**Answer:** Counterintuitively, **not** "don't cache." It means "cache, but always revalidate with the server before serving" (sends `If-None-Match`, can get 304). The "don't cache at all" header is `no-store`. Mixing these up is a classic interview trip-up.
</details>

<details>
<summary><strong>Q3.</strong> When would you use <code>fetch</code> with <code>{ credentials: 'include' }</code>?</summary>

**Answer:** When you need cookies sent on cross-origin requests. By default, fetch sends cookies for same-origin only. `'include'` requires the server to set `Access-Control-Allow-Credentials: true` and a specific origin (not `*`).
</details>

---

# Chapter 14 — System Design for Frontend Engineers

## Why it matters

At mid-level, "design a Twitter feed" is a real interview prompt. They're not testing whether you can build Twitter — they're testing whether you can break a problem into components, identify constraints, and articulate trade-offs.

## The framework

A 45-minute frontend system design typically follows:

1. **Clarify (5 min)** — Scope, users, devices, scale, must-have vs nice-to-have.
2. **High-level architecture (10 min)** — Pages, components, data flow, API shape.
3. **Deep dive on 1–2 areas (20 min)** — Real-time updates, infinite scroll, image loading, offline support.
4. **Trade-offs and what's next (10 min)** — What did you defer, what would you measure, where's the risk.

## Worked example

### Prompt

> Design the frontend for a real-time collaborative document editor (think Google Docs).

### Step-by-step solution

**1. Clarify**
   - Single doc or multiple? **Single for this scope.**
   - Concurrency? **2–10 users editing simultaneously.**
   - Offline support? **Stretch goal.**
   - Plain text or rich? **Rich text (bold, headings).**

**2. Component tree**

```
<App>
  <Toolbar />          ← formatting actions
  <Editor>             ← contenteditable or library (Slate, Lexical, ProseMirror)
    <CursorOverlay />  ← collaborator cursors
  </Editor>
  <PresenceList />     ← who's currently editing
</App>
```

**3. Data flow**

- **Local edits** → immediately update local state (optimistic).
- **Send op** to server via WebSocket as a CRDT or OT operation.
- **Receive ops** from server → merge into local state.
- **Conflict resolution**: CRDT (e.g., Yjs) — preferred; commutative by construction. OT (Operational Transformation) — older approach, requires a server-side authority.

**4. Deep dive: cursor presence**
   - Each user broadcasts `{userId, cursorPos, selectionEnd, color}` on the WebSocket.
   - Throttle to 50ms (don't flood).
   - Render cursors as overlays positioned via `getBoundingClientRect` of the text node.
   - Clean up on `disconnect` or user-leave events.

**5. Deep dive: offline + reconnect**
   - Queue ops in IndexedDB while offline.
   - On reconnect, replay queue against latest server state — CRDTs handle this gracefully.
   - Show "offline" indicator; disable real-time features but keep editing.

**6. Trade-offs**
   - CRDT bundle size (~50KB for Yjs) vs custom OT (more code, fewer deps).
   - WebSocket vs SSE vs long polling — WS for bi-directional; SSE if mostly server→client.
   - Optimistic local rendering creates perceived latency wins, but conflict on bad networks.

### Common pitfalls

- ❌ Jumping into code or naming exact libraries before clarifying scope.
- ❌ Hand-waving "I'd use Redux" without specifying *what state* lives there.
- ❌ Not articulating what you'd measure post-launch (editor latency P95, sync conflict rate, bundle size budget).

## Self-check quiz

<details>
<summary><strong>Q1.</strong> What questions should you always ask in the first 5 minutes?</summary>

**Answer:** Scale (users / data volume), devices (mobile? desktop?), must-have features vs deferrable, latency expectations, accessibility/i18n requirements, browser support matrix, and whether SSR/SEO matters. Picking 3–4 of these signals you've thought about scope before architecture.
</details>

<details>
<summary><strong>Q2.</strong> How would you handle infinite scroll for a feed of 1M items?</summary>

**Answer:** Cursor-based pagination (not offset — slow at depth and breaks with inserts). Virtualize the rendered list (`react-window` / `Virtuoso`) so DOM size stays bounded regardless of scroll depth. Cache pages in React Query / SWR keyed by cursor. Implement "scroll restoration" so back-button returns to position.
</details>

<details>
<summary><strong>Q3.</strong> Where would you place feature flags in the architecture?</summary>

**Answer:** A flag service called server-side at SSR/page-load time, with the resolved flag values hydrated to the client. Client-side flag evaluation alone leaks "all flags exist" to attackers and creates a flash of wrong content. Cache resolved flags per session; invalidate on important changes via WS or polling.
</details>

---

# Chapter 15 — Behavioral & Communication

## Why it matters

The technical bar is necessary but not sufficient. The behavioral round is where mid-level candidates either land "senior potential" or stay at the offered band. Stories matter.

## The STAR format (and why interviewers want it)

- **S**ituation — context
- **T**ask — your responsibility
- **A**ction — what *you* did (not the team)
- **R**esult — measurable outcome

> **🎯 The mid-level upgrade**: Add **Reflection** — what you'd do differently. Signals self-awareness.

## Stories you should have ready

Prepare 2–3 sentences for each, expandable to 3–5 minutes:

1. A **technical decision** you made and why (with the trade-offs you considered).
2. A **production incident** you owned end-to-end.
3. A **disagreement with a teammate** and how you resolved it.
4. A **project that failed** — what you learned.
5. A **mentoring or knowledge-sharing** moment — even at mid-level, this matters.
6. A **proudest accomplishment** — make it specific and measurable.

## Worked example

### Prompt

> Tell me about a time you disagreed with a teammate on a technical decision.

### Bad answer (vague, no resolution)

> "We disagreed about whether to use Redux or Context. I thought Redux was overkill, they thought we needed it. We ended up using Context and it was fine."

### Strong answer (STAR + R)

> **Situation:** "Mid-project, our shared cart state was getting tangled — we had context updates triggering unrelated re-renders.
>
> **Task:** I needed to propose a fix. A teammate wanted to migrate the whole project to Redux Toolkit; I felt that was overkill for the actual problem.
>
> **Action:** I built a small benchmark — measured the re-render counts on the existing context, then prototyped a Zustand store for just the cart. I shared a doc comparing bundle size, migration effort, learning curve for the team, and the actual perf numbers. We discussed it in a 30-minute meeting.
>
> **Result:** We landed on Zustand for the cart specifically — kept Context for theme and auth. Re-renders dropped from ~12 to 2 per cart update. Whole migration took two days.
>
> **Reflection:** What I'd do differently: I made the decision feel binary at first by pushing back hard on Redux. Next time, I'd lead with the prototype + numbers — let the data drive the conversation rather than my opinion."

The reflection at the end is what flips this from "competent" to "senior potential."

## Quick self-check

<details>
<summary><strong>What signals "senior potential" in behavioral rounds?</strong></summary>

- Talking about **trade-offs** explicitly, not just decisions.
- Owning **failure** without blaming the team / company / framework.
- Articulating what you'd **measure** to know if your fix worked.
- Showing **influence** beyond your immediate ticket — docs, mentoring, process improvements.
- Asking **questions back** about the role and team — shows you're evaluating the fit, not begging.
</details>

---

## 4. Quick-Reference Snippets

> Copy-paste-ready code for last-minute review the morning of an interview.

### Debounce

```js
function debounce(fn, ms) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}
```

### Throttle (leading edge)

```js
function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}
```

### Curry

```js
function curry(fn) {
  return function curried(...args) {
    return args.length >= fn.length
      ? fn(...args)
      : (...rest) => curried(...args, ...rest);
  };
}
```

### Flatten array (any depth)

```js
const flatten = arr => arr.flat(Infinity);
// Or manual:
const flat = arr => arr.reduce((a, v) => a.concat(Array.isArray(v) ? flat(v) : v), []);
```

### Group by

```js
const groupBy = (arr, fn) =>
  arr.reduce((acc, item) => {
    const k = fn(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {});

// ES2024: Object.groupBy(arr, fn)
```

### Memoize

```js
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
}
```

### Promise with timeout

```js
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), ms))
  ]);
```

### Retry with exponential backoff

```js
async function retry(fn, { tries = 3, base = 200 } = {}) {
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === tries - 1) throw err;
      await new Promise(r => setTimeout(r, base * 2 ** i));
    }
  }
}
```

### Deep equal (simple)

```js
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null || typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  const keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(k => deepEqual(a[k], b[k]));
}
```

### Two-sum (hashmap)

```js
function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
```

### Reverse a linked list

```js
function reverse(head) {
  let prev = null;
  while (head) {
    [head.next, prev, head] = [prev, head, head.next];
  }
  return prev;
}
```

### Tree BFS / DFS

```js
function bfs(root) {
  const queue = [root];
  const out = [];
  while (queue.length) {
    const node = queue.shift();      // O(n) shift — fine for interviews, mention trade-off
    out.push(node.val);
    queue.push(...(node.children || []));
  }
  return out;
}

function dfs(node, out = []) {
  if (!node) return out;
  out.push(node.val);
  (node.children || []).forEach(c => dfs(c, out));
  return out;
}
```

### `useDebouncedValue` (React hook)

```jsx
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
```

### `usePrevious` (React hook)

```jsx
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}
```

---

## 5. Further Reading

- **JavaScript:** [You Don't Know JS Yet](https://github.com/getify/You-Dont-Know-JS), MDN Web Docs
- **React:** [react.dev](https://react.dev), Dan Abramov's [Overreacted](https://overreacted.io)
- **Algorithms:** [NeetCode](https://neetcode.io), [Sean Prashad's LeetCode patterns](https://seanprashad.com/leetcode-patterns/)
- **System design:** [Frontend System Design](https://www.greatfrontend.com/system-design), Alex Xu's *System Design Interview* (vol. 2 has frontend chapters)
- **Testing:** Kent C. Dodds' [Testing JavaScript](https://testingjavascript.com)

---

## License

MIT — use freely, contributions welcome via PRs.

> *Built with care for engineers preparing for the next step. Good luck out there.*
