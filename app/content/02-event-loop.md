---
title: 'Event Loop & Async Patterns'
order: 2
---

# The Event Loop, Microtasks & Async Patterns

## Why it matters

Async bugs are the most expensive bugs in production. If you can't explain when a Promise resolves vs. when a `setTimeout(fn, 0)` runs, you can't debug them.

## Core concepts

- **Call stack**: Synchronous execution.
- **Macrotask queue**: `setTimeout`, `setInterval`, I/O.
- **Microtask queue**: Promises, `queueMicrotask`, `MutationObserver`.
- **Rule**: After each macrotask, drain the *entire* microtask queue before rendering or running the next macrotask.

## Worked example

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2
```

The microtask (`'3'`) drains before the next macrotask (`'2'`).

## Self-check

<details>
<summary>Why might <code>await</code> in a tight loop be a perf problem?</summary>

Each `await` serializes work that could be parallel. Use `Promise.all([...])` for independent operations.
</details>

> See the [full guide](https://github.com/your-handle/js-interview-prep/blob/main/docs/README.md) for all chapters.
