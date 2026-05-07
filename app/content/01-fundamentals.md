---
title: 'Fundamentals: Scope, Closures & this'
order: 1
---

# JavaScript Fundamentals: Scope, Closures & `this`

## Why it matters

Every senior interviewer has a few "gotcha" questions in this space. They're not testing trivia — they're testing whether you understand the runtime well enough to debug production code where a `this` binding silently broke after a refactor.

## Core concepts

- **Lexical scope**: A function's scope is determined by *where it's written*, not where it's called.
- **Closure**: A function plus its surrounding lexical environment.
- **`this` binding rules** (priority order): `new` → `.call`/`.apply`/`.bind` → `obj.method()` → default. Arrow functions ignore all of these and inherit `this` lexically.

## Worked example

Implement a `once(fn)` utility that returns a function which can only invoke `fn` a single time.

```js
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
```

The closure preserves `called` and `result` across calls. Using a regular function (not arrow) lets the caller's `this` flow through `.apply`.

## Self-check

<details>
<summary>What does this log?</summary>

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

Logs `3, 3, 3` — `var` is function-scoped. Use `let` for `0, 1, 2`.
</details>

> See the [full guide](https://github.com/your-handle/js-interview-prep/blob/main/docs/README.md) for all chapters.
