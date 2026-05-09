import type { Question } from '../lib/types';

export const questions: Question[] = [
  // ─────────────────────────────────────────────────────────────────
  // Arrays & Immutability (8)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 29,
    category: 'arrays-objects',
    title: 'Mutating vs non-mutating array methods',
    difficulty: 'junior',
    answer: `Knowing which methods mutate is critical for React state and Redux reducers.

**Mutating** (modify in place, return mutated array or undefined):
- \`push\`, \`pop\`, \`shift\`, \`unshift\`
- \`splice\`, \`sort\`, \`reverse\`
- \`fill\`, \`copyWithin\`

**Non-mutating** (return new array):
- \`concat\`, \`slice\`, \`map\`, \`filter\`, \`reduce\`, \`flat\`, \`flatMap\`
- \`toSpliced\`, \`toSorted\`, \`toReversed\` (ES2023 — non-mutating versions of the above)

**ES2023 toSorted is the cleanest fix for the classic React mistake:**

\`\`\`js
// ❌ Mutates state — React skips re-render
setItems(items.sort());

// ✅ Returns new array — React detects change
setItems(items.toSorted());
// or pre-ES2023:
setItems([...items].sort());
\`\`\`

**Memory tip:** Methods that return the same type of thing they operated on tend to be non-mutating. \`map\` returns array → non-mutating. \`push\` returns new length (a number) → mutating.`,
    hint: 'push/sort mutate; map/filter dont',
  },
  {
    id: 30,
    category: 'arrays-objects',
    title: 'Implement a deep clone function',
    difficulty: 'mid',
    answer: `\`\`\`js
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value); // cycle guard

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

  const result = Array.isArray(value) ? [] : {};
  seen.set(value, result);
  for (const key of Reflect.ownKeys(value)) {
    result[key] = deepClone(value[key], seen);
  }
  return result;
}
\`\`\`

**The modern way:** \`structuredClone(obj)\` — built-in, handles cycles, Dates, Maps, Sets, typed arrays.

**Don't use \`JSON.parse(JSON.stringify(obj))\`:**
- Loses \`Date\` (becomes string), \`undefined\`, functions.
- Throws on cycles.
- Can't handle \`Map\`/\`Set\`/\`BigInt\`.

**WeakMap for cycle tracking:**
- Allows GC of clones if originals are dropped.
- Faster lookup than Map for object keys.`,
    hint: 'Recursion + WeakMap for cycles',
  },
  {
    id: 31,
    category: 'arrays-objects',
    title: 'Why does this React state update not trigger a re-render?',
    difficulty: 'mid',
    answer: `\`\`\`jsx
const [user, setUser] = useState({ name: 'Ada', tags: ['admin'] });

const addTag = (tag) => {
  user.tags.push(tag); // 🚩 mutation
  setUser(user);        // same reference
};
\`\`\`

**Why it doesn't render:** React's bail-out optimization compares with \`Object.is\`. Same reference → no render scheduled.

**Fix — create new references all the way down:**

\`\`\`jsx
const addTag = (tag) => {
  setUser({
    ...user,
    tags: [...user.tags, tag]  // new array
  });
};
\`\`\`

**Functional update for safety:**
\`\`\`jsx
const addTag = (tag) => {
  setUser(prev => ({
    ...prev,
    tags: [...prev.tags, tag]
  }));
};
\`\`\`

**For deeply nested state, reach for Immer:**
\`\`\`jsx
import { produce } from 'immer';
setUser(produce(draft => {
  draft.profile.preferences.theme = 'dark';
}));
\`\`\`

Immer lets you write "mutating" code that returns an immutable result.`,
    hint: 'Object.is reference check',
  },
  {
    id: 32,
    category: 'arrays-objects',
    title: 'Map vs Object — when to use which',
    difficulty: 'mid',
    answer: `**Use \`Map\` when:**
- Keys aren't strings or symbols (objects, numbers).
- You need guaranteed insertion order (objects mostly do, but Map is spec-guaranteed).
- Frequent additions/removals — Map is optimized for this.
- You want a clean iteration story (\`map.entries()\`, \`map.size\`).
- Avoiding prototype pollution.

**Use plain objects when:**
- Keys are known string literals.
- Data is mostly static (config, fixed shapes).
- Working with JSON (serialization).
- Pattern-matching with destructuring.

\`\`\`js
// Map shines here:
const cache = new Map();
cache.set(userObject, 'cached value'); // object as key — impossible with {}
cache.size; // O(1)
cache.has(key); // O(1), no prototype check needed

// Object shines here:
const config = { timeout: 5000, retries: 3 };
const { timeout, retries } = config; // clean destructuring
JSON.stringify(config); // built-in
\`\`\`

**Performance:** For frequent set/get/delete operations, Map outperforms object across all engines. For static lookups, the difference is negligible.`,
    hint: 'Map for dynamic, Object for static',
  },
  {
    id: 33,
    category: 'arrays-objects',
    title: 'What is the difference between for...in and for...of?',
    difficulty: 'junior',
    answer: `**\`for...in\`** iterates **enumerable property keys** (including inherited ones).
**\`for...of\`** iterates **iterable values** (only iterables: arrays, strings, Maps, Sets, generators).

\`\`\`js
const arr = ['a', 'b', 'c'];
arr.custom = 'extra';

for (const key in arr) console.log(key);    // '0', '1', '2', 'custom'
for (const val of arr) console.log(val);    // 'a', 'b', 'c'
\`\`\`

**Rules of thumb:**
- **Arrays** → \`for...of\`, \`forEach\`, or \`for (let i = 0; ...)\`. Never \`for...in\` — picks up inherited properties.
- **Objects** → \`Object.keys/values/entries\` then \`for...of\`. \`for...in\` works but is rarely the right choice.
- **Maps/Sets** → \`for...of\`.

\`\`\`js
const obj = { a: 1, b: 2 };
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value);
}
\`\`\`

**Pitfall:** \`for...in\` iterates *strings* even on arrays — \`typeof key === 'string'\`, not number.`,
    hint: 'Keys vs values, iterables only',
  },
  {
    id: 34,
    category: 'arrays-objects',
    title: 'Spread vs Object.assign',
    difficulty: 'mid',
    answer: `Both create shallow copies and merge objects, but with subtle differences.

\`\`\`js
const a = { x: 1, y: 2 };
const b = { y: 99, z: 3 };

const merged1 = { ...a, ...b };           // spread
const merged2 = Object.assign({}, a, b);  // assign
// Both: { x: 1, y: 99, z: 3 }
\`\`\`

**Differences:**

| Feature | Spread | Object.assign |
|---|---|---|
| Mutates target | No | Yes (mutates first arg) |
| Setters on target | Bypassed | **Triggered** |
| Symbol keys | Copied | Copied |
| Prototype | Not copied | Not copied |
| Getters on source | Read | Read |

**The setter difference matters:**

\`\`\`js
class User {
  set name(val) { this._name = val.toUpperCase(); }
}
const u = new User();
Object.assign(u, { name: 'ada' });  // u._name === 'ADA' (setter ran)
({ ...u, name: 'ada' });             // setter NOT triggered on copy
\`\`\`

**Practical:** Use spread for new objects in immutable updates. Use \`Object.assign(target, ...)\` only when you specifically want to mutate \`target\`.`,
    hint: 'Spread = new, assign = mutates first arg',
  },
  {
    id: 35,
    category: 'arrays-objects',
    title: 'What does Array.from do, and when do you use it?',
    difficulty: 'junior',
    answer: `\`Array.from\` creates a new array from:
1. **Iterables** (Maps, Sets, strings, generators)
2. **Array-like objects** (\`{ 0: 'a', 1: 'b', length: 2 }\`)

\`\`\`js
Array.from('hello');           // ['h', 'e', 'l', 'l', 'o']
Array.from(new Set([1, 1, 2])); // [1, 2]
Array.from(document.querySelectorAll('div')); // real Array (NodeList → Array)
Array.from({ length: 3 });     // [undefined, undefined, undefined]
\`\`\`

**With map function (second arg)** — combines creation + mapping in one pass:

\`\`\`js
Array.from({ length: 5 }, (_, i) => i * 2);  // [0, 2, 4, 6, 8]
Array.from('abc', (c) => c.toUpperCase());    // ['A', 'B', 'C']
\`\`\`

**Common alternatives:**
- \`[...iterable]\` — equivalent for iterables only (doesn't work on plain array-likes).
- \`Array.of(1, 2, 3)\` — creates from arguments (avoids the \`new Array(3)\` pitfall).

**The \`new Array(3)\` trap:**
\`\`\`js
new Array(3);                              // [empty × 3] — sparse!
new Array(3).map((_, i) => i);             // [empty × 3] — map skips holes
Array.from({ length: 3 }, (_, i) => i);    // [0, 1, 2] ✅
\`\`\``,
    hint: 'Iterables + array-likes',
  },
  {
    id: 36,
    category: 'arrays-objects',
    title: 'Implement Object.groupBy / array groupBy',
    difficulty: 'mid',
    answer: `**Modern (ES2024):**

\`\`\`js
const inventory = [
  { name: 'apple', type: 'fruit' },
  { name: 'lettuce', type: 'veg' },
  { name: 'banana', type: 'fruit' },
];

Object.groupBy(inventory, item => item.type);
// { fruit: [apple, banana], veg: [lettuce] }

Map.groupBy(inventory, item => item.type); // Map version
\`\`\`

**Polyfill** (for older environments):

\`\`\`js
function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    (acc[key] ||= []).push(item);
    return acc;
  }, {});
}

groupBy(inventory, x => x.type);
\`\`\`

**Walkthrough:**
- \`(acc[key] ||= []).push(item)\` — logical assignment: if \`acc[key]\` is falsy, create empty array, then push.
- Returns plain object (not Map). For Map output, replace \`{}\` with \`new Map()\` and use \`.get/.set\`.

**Use cases:** sorting tasks by status, bucketing analytics events, grouping by date.`,
    hint: 'reduce into a keyed accumulator',
  },

  // ─────────────────────────────────────────────────────────────────
  // Data Structures (8)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 37,
    category: 'data-structures',
    title: 'When to use Map vs Set vs WeakMap vs WeakSet?',
    difficulty: 'mid',
    answer: `**\`Map\`** — key/value store. Any key type. Iterable. Has \`size\`.
**\`Set\`** — unique values. Iterable. Has \`size\`.

**\`WeakMap\`** — keys must be objects. Holds weak references — entries don't prevent GC. NOT iterable. No \`size\`.
**\`WeakSet\`** — same but for unique objects.

**Why "weak"?** Once the only reference to a key object is gone, the entry is automatically removed by the garbage collector. Useful for:
- Caches keyed on objects (clones, results) — won't leak memory.
- Marking objects without modifying them ("has this been seen?").
- Private data associated with class instances (pre-private-fields).

\`\`\`js
const seen = new WeakSet();
function processOnce(obj) {
  if (seen.has(obj)) return;
  seen.add(obj);
  // ...
  // No cleanup needed — when obj is GC'd, entry vanishes
}
\`\`\`

**Trade-off for "weak":** Can't iterate, can't get size — by design. If you could, that would create observable behavior tied to GC timing, which would be non-deterministic.`,
    hint: 'Weak = no GC retention',
  },
  {
    id: 38,
    category: 'data-structures',
    title: 'Implement a stack-based balanced parentheses checker',
    difficulty: 'mid',
    answer: `**Classic stack problem** — push openers, pop and match on closers.

\`\`\`js
function isBalanced(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];

  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    }
    // other chars ignored
  }

  return stack.length === 0;
}

isBalanced('({[]})');  // true
isBalanced('({[})');   // false (mismatch)
isBalanced('(((');     // false (unclosed)
\`\`\`

**Walkthrough:**
1. Map closer → matching opener for O(1) lookup.
2. Stack uses array's \`push\`/\`pop\` (O(1) at the end).
3. On closer, pop top: must match.
4. Final check — empty stack means everything closed.
5. **Time:** O(n). **Space:** O(n) worst case.

**Edge cases interviewers love:**
- Empty string → \`true\` (vacuously balanced).
- Pop on empty stack returns \`undefined\` — won't equal any opener, so \`return false\` works.

**Variant:** "Replace at most one character to balance" — try each position with the simple check first.`,
    hint: 'Push openers, pop on closers',
  },
  {
    id: 39,
    category: 'data-structures',
    title: 'Implement a queue with O(1) enqueue/dequeue',
    difficulty: 'senior',
    answer: `**Naive approach** with \`array.shift()\` is O(n) — re-indexes every element.

**Two-stack approach** — amortized O(1):

\`\`\`js
class Queue {
  #inStack = [];
  #outStack = [];

  enqueue(value) {
    this.#inStack.push(value);
  }

  dequeue() {
    if (this.#outStack.length === 0) {
      // Drain inStack into outStack (reverses order)
      while (this.#inStack.length) {
        this.#outStack.push(this.#inStack.pop());
      }
    }
    return this.#outStack.pop();
  }

  get size() {
    return this.#inStack.length + this.#outStack.length;
  }
}
\`\`\`

**Why amortized O(1):** Each element gets pushed and popped at most twice across both stacks. Over N operations, total work is O(N), so per-op is O(1) on average.

**Linked list alternative** — true O(1) per op, no amortization:

\`\`\`js
class Queue {
  #head = null;
  #tail = null;
  #size = 0;

  enqueue(v) {
    const node = { value: v, next: null };
    if (this.#tail) this.#tail.next = node;
    else this.#head = node;
    this.#tail = node;
    this.#size++;
  }

  dequeue() {
    if (!this.#head) return undefined;
    const value = this.#head.value;
    this.#head = this.#head.next;
    if (!this.#head) this.#tail = null;
    this.#size--;
    return value;
  }
}
\`\`\``,
    hint: 'Two stacks or linked list',
  },
  {
    id: 40,
    category: 'data-structures',
    title: 'Detect a cycle in a linked list (Floyd\'s algorithm)',
    difficulty: 'mid',
    answer: `**Floyd's tortoise and hare** — two pointers, one moves 1 step, the other 2 steps. If they meet, there's a cycle.

\`\`\`js
function hasCycle(head) {
  let slow = head, fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }

  return false;
}
\`\`\`

**Why it works:** If there's a cycle, the fast pointer will eventually "lap" the slow one because the gap closes by 1 every step. If there's no cycle, fast hits \`null\` first.

**Time:** O(n). **Space:** O(1) — beats the naive Set approach (O(n) space).

**Bonus — find the cycle's start node:**

\`\`\`js
function detectCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      // Reset slow to head, advance both at same pace until they meet
      slow = head;
      while (slow !== fast) {
        slow = slow.next;
        fast = fast.next;
      }
      return slow; // cycle start
    }
  }
  return null;
}
\`\`\`

The math: distance from head to cycle start equals distance from meeting point to cycle start (modulo the cycle length).`,
    hint: 'Slow + fast pointers',
  },
  {
    id: 41,
    category: 'data-structures',
    title: 'BFS vs DFS — when to use which?',
    difficulty: 'mid',
    answer: `**BFS (Breadth-First Search)** — explore level by level. Uses a **queue**.
**DFS (Depth-First Search)** — go deep first, backtrack. Uses a **stack** (or recursion).

**Use BFS when:**
- Finding **shortest path** in unweighted graphs.
- Searching for the closest node matching a condition.
- Level-order traversal of trees.

**Use DFS when:**
- Exhaustively exploring (all paths, all permutations).
- Topological sort.
- Cycle detection.
- Memory matters (DFS stack space = O(depth); BFS queue can hold a whole level).

\`\`\`js
// BFS — shortest path in grid
function bfs(start, isTarget, neighbors) {
  const queue = [[start, 0]]; // [node, distance]
  const visited = new Set([start]);

  while (queue.length) {
    const [node, dist] = queue.shift(); // O(n) shift — fine for now
    if (isTarget(node)) return dist;
    for (const next of neighbors(node)) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push([next, dist + 1]);
      }
    }
  }
  return -1;
}

// DFS — recursive
function dfs(node, visited = new Set()) {
  if (visited.has(node)) return;
  visited.add(node);
  for (const next of node.neighbors) {
    dfs(next, visited);
  }
}
\`\`\`

**Pitfall:** \`array.shift()\` is O(n) — for production BFS use a real queue.`,
    hint: 'BFS=shortest, DFS=exhaustive',
  },
  {
    id: 42,
    category: 'data-structures',
    title: 'Implement a binary search',
    difficulty: 'mid',
    answer: `**Iterative version** — preferred over recursive (no stack overflow risk):

\`\`\`js
function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;

  while (lo <= hi) {
    // Avoid overflow: (lo + hi) could overflow in other languages
    const mid = lo + ((hi - lo) >> 1);

    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }

  return -1;
}
\`\`\`

**Time:** O(log n). **Space:** O(1).

**Common variants:**

**Find leftmost occurrence:**
\`\`\`js
function lowerBound(arr, target) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
\`\`\`

**Search on the answer space** (huge interview signal):
> "Find the smallest capacity to ship within D days."

For each candidate capacity, you can verify feasibility in O(n). Feasibility is monotonic in capacity (bigger capacity → easier), so binary search the answer space — not the input.

**Pitfalls:**
- \`<= hi\` vs \`< hi\` — depends on whether \`hi\` is inclusive or exclusive.
- Off-by-one in \`mid + 1\` / \`mid - 1\` is the #1 bug.`,
    hint: 'lo/hi pointers, log n',
  },
  {
    id: 43,
    category: 'data-structures',
    title: 'Tree traversal — preorder, inorder, postorder',
    difficulty: 'mid',
    answer: `Three DFS traversals of a binary tree, defined by **when you visit the root** relative to its subtrees.

\`\`\`js
// Preorder: root → left → right
function preorder(node, out = []) {
  if (!node) return out;
  out.push(node.val);
  preorder(node.left, out);
  preorder(node.right, out);
  return out;
}

// Inorder: left → root → right
function inorder(node, out = []) {
  if (!node) return out;
  inorder(node.left, out);
  out.push(node.val);
  inorder(node.right, out);
  return out;
}

// Postorder: left → right → root
function postorder(node, out = []) {
  if (!node) return out;
  postorder(node.left, out);
  postorder(node.right, out);
  out.push(node.val);
  return out;
}
\`\`\`

**When each is useful:**
- **Preorder** — copy/serialize a tree, render UI nodes parents-first.
- **Inorder** — for binary search trees, gives **sorted** output.
- **Postorder** — delete a tree (children first), evaluate expression trees, propagate values up.

**Iterative preorder with a stack:**

\`\`\`js
function preorderIter(root) {
  if (!root) return [];
  const out = [], stack = [root];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.val);
    if (node.right) stack.push(node.right); // right pushed first
    if (node.left) stack.push(node.left);
  }
  return out;
}
\`\`\`

**Level-order (BFS)** — uses a queue, returns nodes by depth.`,
    hint: 'Preorder/inorder/postorder = root position',
  },
  {
    id: 44,
    category: 'data-structures',
    title: 'When would you use a heap / priority queue?',
    difficulty: 'senior',
    answer: `A heap is a tree where every parent ≤ (min-heap) or ≥ (max-heap) its children. Provides O(log n) insert and O(log n) extract-min/max.

**Use cases:**
- **Top-K problems** — "find the 5 most frequent words." Maintain a heap of size K, evict smallest as you go.
- **Dijkstra's algorithm** — extract closest unvisited node by distance.
- **Median maintenance** — two heaps (max-heap for smaller half, min-heap for larger).
- **Task scheduling** — soonest-deadline-first.
- **Merging K sorted lists.**

**JS doesn't have a built-in heap.** Common interview implementation:

\`\`\`js
class MinHeap {
  #heap = [];

  push(value) {
    this.#heap.push(value);
    this.#siftUp(this.#heap.length - 1);
  }

  pop() {
    if (this.#heap.length === 0) return undefined;
    const top = this.#heap[0];
    const last = this.#heap.pop();
    if (this.#heap.length) {
      this.#heap[0] = last;
      this.#siftDown(0);
    }
    return top;
  }

  #siftUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.#heap[parent] <= this.#heap[i]) break;
      [this.#heap[parent], this.#heap[i]] = [this.#heap[i], this.#heap[parent]];
      i = parent;
    }
  }

  #siftDown(i) {
    const n = this.#heap.length;
    while (true) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let smallest = i;
      if (l < n && this.#heap[l] < this.#heap[smallest]) smallest = l;
      if (r < n && this.#heap[r] < this.#heap[smallest]) smallest = r;
      if (smallest === i) break;
      [this.#heap[i], this.#heap[smallest]] = [this.#heap[smallest], this.#heap[i]];
      i = smallest;
    }
  }
}
\`\`\`

**Production:** Use \`@datastructures-js/priority-queue\` or write a simple class. Don't sort an array on every insert — that's O(n log n) per op.`,
    hint: 'Top-K, Dijkstra, scheduling',
  },

  // ─────────────────────────────────────────────────────────────────
  // Algorithm Patterns (10)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 45,
    category: 'algorithms',
    title: 'Two Sum — brute force to optimized',
    difficulty: 'junior',
    answer: `**Prompt:** Given an array of integers and a target, return indices of two numbers that add up to target.

**Brute force (O(n²))** — nested loop:

\`\`\`js
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}
\`\`\`

**Optimized (O(n))** — hashmap:

\`\`\`js
function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
\`\`\`

**The pattern (memorize this):**
> Trade O(n) extra space for O(n) time. As you iterate, store what you've seen. Check if the *complement* (what we need to hit target) is already in the map.

**Walkthrough for \`[2, 7, 11, 15]\`, target 9:**
- i=0, num=2: need=7. Not in map. Store {2:0}.
- i=1, num=7: need=2. **Found at index 0** → return [0, 1].

**Variant:** "Find all pairs" — careful about duplicates and ordering.`,
    hint: 'Hashmap of complements',
  },
  {
    id: 46,
    category: 'algorithms',
    title: 'Sliding window — longest substring without repeats',
    difficulty: 'mid',
    answer: `**Prompt:** Find the length of the longest substring without repeating characters.
\`"abcabcbb"\` → \`3\` (\`"abc"\`)

\`\`\`js
function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let start = 0, max = 0;

  for (let end = 0; end < s.length; end++) {
    const ch = s[end];
    if (lastSeen.has(ch) && lastSeen.get(ch) >= start) {
      start = lastSeen.get(ch) + 1;
    }
    lastSeen.set(ch, end);
    max = Math.max(max, end - start + 1);
  }

  return max;
}
\`\`\`

**Walkthrough:**
1. \`start\`/\`end\` define the current window.
2. For each new char, if it's a duplicate **inside the current window**, jump \`start\` past the previous occurrence.
3. The \`>= start\` guard is crucial — duplicates *outside* the window don't matter.
4. Update \`max\` with current window size.

**Time:** O(n) — each char visited at most twice.

**The pattern:** Variable-size sliding window with a constraint. Recognize from prompts like:
- "Longest/shortest contiguous subarray that satisfies X."
- "Smallest window containing all of Y."

**Vs. fixed-size sliding window:** When window size is given (e.g., "max sum of K consecutive elements"), pattern is simpler — slide and track running sum.`,
    hint: 'Variable window + duplicate guard',
  },
  {
    id: 47,
    category: 'algorithms',
    title: 'Two pointers — remove duplicates from sorted array in place',
    difficulty: 'mid',
    answer: `**Prompt:** Given a sorted array, remove duplicates **in place** so each element appears once. Return the new length.

\`\`\`js
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let write = 1; // position to write next unique value

  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[read - 1]) {
      nums[write] = nums[read];
      write++;
    }
  }

  return write; // first 'write' positions hold unique values
}
\`\`\`

**Walkthrough:** Two pointers — \`read\` scans the array, \`write\` only advances on unique elements.

For \`[1, 1, 2, 3, 3]\`:
- read=1, nums[1]=1, nums[0]=1 → skip
- read=2, nums[2]=2, nums[1]=1 → write nums[1]=2, write=2
- read=3, nums[3]=3, nums[2]=2 → write nums[2]=3, write=3
- read=4, nums[4]=3, nums[3]=3 → skip
- Return 3. Array is now [1, 2, 3, _, _].

**Time:** O(n). **Space:** O(1).

**Two-pointer pattern variants:**
- **Same direction** (read/write) — modify-in-place problems.
- **Opposite direction** (left/right) — palindrome check, sorted array pair-sum.`,
    hint: 'read + write pointers',
  },
  {
    id: 48,
    category: 'algorithms',
    title: 'Number of islands — grid DFS/BFS',
    difficulty: 'mid',
    answer: `**Prompt:** Count islands of 1s in a grid (connected horizontally/vertically).

\`\`\`js
function numIslands(grid) {
  if (!grid.length) return 0;
  const rows = grid.length, cols = grid[0].length;
  let count = 0;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0'; // mark visited (in-place)
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c); // sink the entire island
      }
    }
  }

  return count;
}
\`\`\`

**Walkthrough:**
1. Scan every cell.
2. On a fresh land cell, increment count and DFS to sink the whole island (mark every connected '1' as '0').
3. Bounds check + visited check at the top of DFS keeps it tidy.

**Time:** O(rows × cols). **Space:** O(rows × cols) for recursion stack worst case.

**Variants in interviews:**
- "Largest island" — return island areas, take max.
- "Closed islands" — don't count islands touching the border.
- "Use BFS instead" — replace recursive DFS with queue.

**Pitfall:** Stack overflow on huge grids. Switch to iterative BFS or use an explicit stack.`,
    hint: 'DFS + sink visited cells',
  },
  {
    id: 49,
    category: 'algorithms',
    title: 'When does dynamic programming apply?',
    difficulty: 'senior',
    answer: `Two conditions must hold:

1. **Overlapping subproblems** — same smaller problem solved multiple times.
2. **Optimal substructure** — optimal answer built from optimal answers to subproblems.

**Recognition cues:**
- "Find the maximum/minimum/longest/count of ways..."
- "How many distinct ways to..."
- Recursion that visits same inputs repeatedly.

**Two approaches:**
- **Top-down (memoization)** — write recursion, cache results.
- **Bottom-up (tabulation)** — fill an array iteratively from base case up.

**Classic — climb stairs:** Each step, climb 1 or 2. How many ways to reach step n?

\`\`\`js
// Bottom-up DP
function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    [a, b] = [b, a + b]; // Fibonacci, basically
  }
  return b;
}
\`\`\`

**Top-down with memo:**

\`\`\`js
function climbStairs(n, memo = {}) {
  if (n <= 2) return n;
  if (memo[n]) return memo[n];
  return memo[n] = climbStairs(n - 1, memo) + climbStairs(n - 2, memo);
}
\`\`\`

**Both are O(n) time.** Bottom-up is O(1) space here (only need last 2 values).

**Common DP problems:** coin change, longest increasing subsequence, edit distance, knapsack, longest common subsequence.

**Honest take:** DP is the hardest pattern to recognize quickly. For mid-level interviews, knowing 4-5 canonical problems by heart is enough.`,
    hint: 'Overlapping subproblems + optimal substructure',
  },
  {
    id: 50,
    category: 'algorithms',
    title: 'Implement memoize',
    difficulty: 'mid',
    answer: `\`\`\`js
function memoize(fn, keyFn = JSON.stringify) {
  const cache = new Map();
  return function (...args) {
    const key = keyFn(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Usage
const slowFib = (n) => n < 2 ? n : slowFib(n - 1) + slowFib(n - 2);
const fastFib = memoize(slowFib);
\`\`\`

**Watch out for the Fibonacci trap:** Memoizing only the outer call doesn't help — the recursive calls don't go through the cache. Either:

\`\`\`js
// Option 1: Memoize before recursion
const fib = memoize(function (n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2); // calls memoized version
});

// Option 2: Pass cache through (cleaner)
function fib(n, memo = new Map()) {
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n);
  const result = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, result);
  return result;
}
\`\`\`

**\`JSON.stringify\` for the cache key** has limits:
- Doesn't work for functions, undefined, or cyclic objects.
- Object key order can differ → cache misses.

For object args, use \`WeakMap\` keyed on the object itself.`,
    hint: 'Cache keyed on args',
  },
  {
    id: 51,
    category: 'algorithms',
    title: 'Reverse a linked list',
    difficulty: 'mid',
    answer: `**Iterative — three pointers:**

\`\`\`js
function reverse(head) {
  let prev = null;
  let current = head;
  while (current) {
    const next = current.next; // save next
    current.next = prev;        // reverse pointer
    prev = current;             // advance prev
    current = next;             // advance current
  }
  return prev; // new head
}
\`\`\`

**Compact form using destructuring:**

\`\`\`js
function reverse(head) {
  let prev = null;
  while (head) {
    [head.next, prev, head] = [prev, head, head.next];
  }
  return prev;
}
\`\`\`

**Recursive — elegant but O(n) stack space:**

\`\`\`js
function reverse(head) {
  if (!head || !head.next) return head;
  const newHead = reverse(head.next);
  head.next.next = head;
  head.next = null;
  return newHead;
}
\`\`\`

**Walkthrough for 1→2→3→null:**
- prev=null, head=1; save next=2; 1.next=null; prev=1, head=2.
- prev=1, head=2; save next=3; 2.next=1; prev=2, head=3.
- prev=2, head=3; save next=null; 3.next=2; prev=3, head=null.
- Return prev=3. Now: 3→2→1→null.

**Time:** O(n). **Space:** O(1) iterative, O(n) recursive.`,
    hint: '3 pointers: prev, current, next',
  },
  {
    id: 52,
    category: 'algorithms',
    title: 'Find the kth largest element',
    difficulty: 'mid',
    answer: `**Easy approach — sort:** O(n log n).
\`\`\`js
const kthLargest = (arr, k) => arr.toSorted((a, b) => b - a)[k - 1];
\`\`\`

**Better — min-heap of size k:** O(n log k).
\`\`\`js
function kthLargest(arr, k) {
  const heap = new MinHeap(); // see Data Structures Q44
  for (const num of arr) {
    heap.push(num);
    if (heap.size > k) heap.pop();
  }
  return heap.peek(); // top of heap = kth largest
}
\`\`\`

Why it works: keep only the k largest numbers seen so far. The smallest of those (heap top) IS the kth largest.

**Best — Quickselect:** O(n) average, O(n²) worst.

\`\`\`js
function quickselect(arr, k) {
  // Find (n - k)th smallest = kth largest
  const target = arr.length - k;
  let lo = 0, hi = arr.length - 1;

  while (lo <= hi) {
    const pivot = partition(arr, lo, hi);
    if (pivot === target) return arr[pivot];
    if (pivot < target) lo = pivot + 1;
    else hi = pivot - 1;
  }
}

function partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  return i;
}
\`\`\`

**In an interview:** Mention all three. Most expect heap as the "good" answer; quickselect signals senior.`,
    hint: 'Sort O(n log n) | Heap O(n log k) | Quickselect O(n)',
  },
  {
    id: 53,
    category: 'algorithms',
    title: 'Recursion vs iteration trade-offs',
    difficulty: 'mid',
    answer: `**Recursion is cleaner for:**
- Tree/graph traversal (mirrors the structure).
- Divide-and-conquer (merge sort, quick sort).
- Backtracking problems (permutations, N-queens).
- Problems with naturally recursive definitions (factorial, Fibonacci with memo).

**Iteration is better for:**
- Linear scans (every algorithm with a single loop).
- Memory-constrained code (no stack frames).
- JavaScript specifically — V8 doesn't reliably optimize tail calls. Deep recursion can blow the stack.

**Stack overflow in JS** typically hits around 10,000–30,000 frames depending on the engine. Anything that recurses on linked lists or deep trees needs an iterative version.

**Convert recursion to iteration with an explicit stack:**

\`\`\`js
// Recursive
function dfs(node) {
  if (!node) return;
  console.log(node.val);
  dfs(node.left);
  dfs(node.right);
}

// Iterative with stack
function dfs(root) {
  if (!root) return;
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    console.log(node.val);
    if (node.right) stack.push(node.right); // right first (LIFO)
    if (node.left) stack.push(node.left);
  }
}
\`\`\`

**Tail call optimization:** Spec says it should work, but Safari is the only major engine that implemented it. Don't rely on it.`,
    hint: 'Clarity vs stack safety',
  },
  {
    id: 54,
    category: 'algorithms',
    title: 'Generate all permutations of an array',
    difficulty: 'mid',
    answer: `**Backtracking** — pick each unused element, recurse, undo.

\`\`\`js
function permutations(nums) {
  const result = [];
  const used = new Array(nums.length).fill(false);
  const current = [];

  function backtrack() {
    if (current.length === nums.length) {
      result.push([...current]); // copy! current keeps mutating
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(nums[i]);
      backtrack();
      current.pop();        // undo
      used[i] = false;       // undo
    }
  }

  backtrack();
  return result;
}

permutations([1, 2, 3]);
// [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
\`\`\`

**Walkthrough:**
1. Build permutations one element at a time.
2. Mark element as used; recurse.
3. After recursion returns, **undo** — pop and unmark — so the parent loop can try other branches.
4. When current is full, snapshot it.

**Time:** O(n × n!) — n! permutations, each takes O(n) to copy.

**The backtracking template:**
\`\`\`
choose → recurse → unchoose
\`\`\`

**Same template solves:** N-queens, sudoku, generating subsets, combinations, word search in a grid.

**Important:** Always copy the current state when recording (\`[...current]\`). The reusing-and-mutating trick is what makes backtracking O(n) per snapshot instead of O(n × depth).`,
    hint: 'Backtracking: choose/recurse/unchoose',
  },
];
