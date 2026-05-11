import type { Question } from '../lib/types';

/**
 * TypeScript interview questions — 20 cards across all levels.
 * Difficulty: junior | mid | senior | lead.
 */
export const questions: Question[] = [
    // ─────────────────────────────────────────────────────────────────
    // TypeScript (20)
    // ─────────────────────────────────────────────────────────────────

    // ── Junior (4) ──────────────────────────────────────────────────

    {
        id: 165,
        category: 'typescript',
        title: 'What is TypeScript and why use it over plain JavaScript?',
        difficulty: 'junior',
        answer: `TypeScript is a **superset of JavaScript** that adds static type checking. Every valid JS file is valid TS, but TS lets you annotate types and catch bugs at compile time.

**Why use it:**

1. **Catch bugs before runtime** — misspelled property names, wrong argument types, and null-reference errors are flagged by the compiler.
2. **Better IDE support** — autocompletion, inline docs, go-to-definition, and refactoring tools get dramatically better with types.
3. **Self-documenting code** — types describe data shapes without needing separate docs.
4. **Safer refactoring** — rename a field and the compiler tells you every file that broke.

\`\`\`ts
// JavaScript — no error until runtime
function greet(name) {
  return 'Hello, ' + name.toUppercase(); // typo: should be toUpperCase
}

// TypeScript — caught at compile time
function greet(name: string): string {
  return 'Hello, ' + name.toUppercase();
  //                       ~~~~~~~~~~~ Property 'toUppercase' does not exist
}
\`\`\`

**Common misconception:** TypeScript does NOT run in the browser. It compiles to plain JavaScript — all types are erased at build time. There is zero runtime overhead.

**When to skip TS:** quick scripts, prototypes where you're still exploring the data shape, or very small projects where the setup cost outweighs the benefit.`,
        hint: 'Static types, compile-time safety, better DX',
    },
    {
        id: 166,
        category: 'typescript',
        title: 'What is the difference between `interface` and `type`?',
        difficulty: 'junior',
        answer: `Both define the shape of data, but they have subtle differences.

**interface:**
\`\`\`ts
interface User {
  name: string;
  age: number;
}

// Declaration merging — interfaces with the same name merge:
interface User {
  email: string;
}
// User now has: name, age, email
\`\`\`

**type:**
\`\`\`ts
type User = {
  name: string;
  age: number;
};

// No merging — duplicate identifier error:
type User = { email: string }; // ❌ Error
\`\`\`

**Key differences:**

| Feature | \`interface\` | \`type\` |
|---|---|---|
| Object shapes | ✅ | ✅ |
| Extends/implements | ✅ \`extends\` | ✅ \`&\` intersection |
| Declaration merging | ✅ | ❌ |
| Unions | ❌ | ✅ \`A \\| B\` |
| Primitives/tuples | ❌ | ✅ \`type ID = string\` |
| Mapped types | ❌ | ✅ |
| Computed properties | ❌ | ✅ |

**Rule of thumb:**
- Use \`interface\` for public API contracts and class shapes (they're extendable).
- Use \`type\` when you need unions, intersections, mapped types, or utility compositions.
- Many teams pick one and stay consistent — both work fine for object shapes.`,
        hint: 'Merging, unions, flexibility',
    },
    {
        id: 167,
        category: 'typescript',
        title: 'What are the basic types in TypeScript?',
        difficulty: 'junior',
        answer: `TypeScript provides several primitive and structural types:

**Primitives:**
\`\`\`ts
let name: string = 'Ada';
let age: number = 30;
let active: boolean = true;
let id: bigint = 100n;
let sym: symbol = Symbol('id');
\`\`\`

**Special types:**
\`\`\`ts
let x: null = null;
let y: undefined = undefined;
let anything: any = 42;        // opts out of type checking
let unknown: unknown = 'hello'; // safer than any — must narrow before use
let nothing: void = undefined;  // for functions that don't return
let impossible: never;          // for functions that never return
\`\`\`

**Arrays:**
\`\`\`ts
let nums: number[] = [1, 2, 3];
let strs: Array<string> = ['a', 'b']; // generic syntax
\`\`\`

**Tuples:**
\`\`\`ts
let pair: [string, number] = ['age', 30];
\`\`\`

**Objects:**
\`\`\`ts
let user: { name: string; age?: number } = { name: 'Ada' };
// age is optional (?)
\`\`\`

**Enums:**
\`\`\`ts
enum Direction { Up, Down, Left, Right }
let d: Direction = Direction.Up; // 0

// Prefer const enums or union literals in modern code:
type Direction = 'up' | 'down' | 'left' | 'right';
\`\`\`

**\`any\` vs \`unknown\`:**
- \`any\` — disables all checking. Use as absolute last resort.
- \`unknown\` — you must narrow (type guard) before using. Always prefer over \`any\`.

\`\`\`ts
function process(input: unknown) {
  // input.toUpperCase(); // ❌ Error
  if (typeof input === 'string') {
    input.toUpperCase(); // ✅ narrowed
  }
}
\`\`\``,
        hint: 'Primitives, any vs unknown, tuples, enums',
    },
    {
        id: 168,
        category: 'typescript',
        title: 'What are type assertions and when should you use them?',
        difficulty: 'junior',
        answer: `Type assertions tell the compiler "I know better than you what this type is." They don't change the runtime value — they only affect the type checker.

**Syntax:**
\`\`\`ts
const input = document.getElementById('name') as HTMLInputElement;
input.value = 'Ada';

// Alternative (older) syntax — doesn't work in JSX:
const input2 = <HTMLInputElement>document.getElementById('name');
\`\`\`

**When to use:**
1. **DOM elements** — \`getElementById\` returns \`HTMLElement | null\`, but you know it's an input.
2. **API responses** — when you know the shape but TS sees \`unknown\` or \`any\`.
3. **Migration** — temporarily assert while adding types to JS code.

**When NOT to use:**
- Don't use assertions to silence errors you don't understand.
- Don't assert unrelated types: \`'hello' as number\` — TS rightly blocks this.

**The escape hatch — double assertion:**
\`\`\`ts
const x = 'hello' as unknown as number; // compiles but dangerous
\`\`\`

This bypasses safety entirely. It's almost always a code smell.

**Prefer type guards instead:**
\`\`\`ts
// ❌ Risky assertion
const user = data as User;

// ✅ Safe narrowing
function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'name' in data;
}
if (isUser(data)) {
  data.name; // safely narrowed
}
\`\`\`

**Non-null assertion (\`!\`):**
\`\`\`ts
const el = document.getElementById('app')!; // "I promise this isn't null"
\`\`\`

Use sparingly — it silences the compiler and will crash at runtime if you're wrong.`,
        hint: 'as keyword, non-null !, prefer type guards',
    },

    // ── Mid (6) ─────────────────────────────────────────────────────

    {
        id: 169,
        category: 'typescript',
        title: 'Explain generics with practical examples',
        difficulty: 'mid',
        answer: `Generics let you write reusable code that works with **any type** while preserving type safety. Think of them as "type parameters."

**Basic generic function:**
\`\`\`ts
function identity<T>(value: T): T {
  return value;
}

identity<string>('hello'); // T = string
identity(42);              // T inferred as number
\`\`\`

**Generic interfaces:**
\`\`\`ts
interface ApiResponse<T> {
  data: T;
  status: number;
  error?: string;
}

const userRes: ApiResponse<User> = {
  data: { name: 'Ada', age: 30 },
  status: 200,
};
\`\`\`

**Generic constraints:**
\`\`\`ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Ada', age: 30 };
getProperty(user, 'name');  // ✅ string
getProperty(user, 'email'); // ❌ 'email' is not in keyof User
\`\`\`

**Default type parameters:**
\`\`\`ts
interface Config<T = Record<string, unknown>> {
  data: T;
  debug?: boolean;
}

const c: Config = { data: { anything: true } }; // uses default
const c2: Config<{ port: number }> = { data: { port: 3000 } };
\`\`\`

**Real-world React example:**
\`\`\`tsx
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage — T inferred from initial value:
const [theme, setTheme] = useLocalStorage('theme', 'dark');
// theme: string, setTheme: (val: string) => void
\`\`\`

**Mental model:** Generics are like function parameters — but for types. Instead of passing a value, you pass a type.`,
        hint: 'Type parameters, constraints, keyof',
    },
    {
        id: 170,
        category: 'typescript',
        title: 'What are union and intersection types?',
        difficulty: 'mid',
        answer: `**Union (\`|\`)** — the value is **one of** several types:

\`\`\`ts
type Status = 'loading' | 'success' | 'error';
type ID = string | number;

function format(id: ID): string {
  if (typeof id === 'string') return id.toUpperCase();
  return id.toFixed(2);
}
\`\`\`

**Intersection (\`&\`)** — the value has **all** properties of multiple types:

\`\`\`ts
type HasName = { name: string };
type HasAge = { age: number };
type Person = HasName & HasAge;

const p: Person = { name: 'Ada', age: 30 }; // must have both
\`\`\`

**Key insight — unions narrow, intersections combine:**

\`\`\`ts
// Union: A | B means "has A's members OR B's members"
// Only shared members are safely accessible without narrowing
type Cat = { purr(): void; name: string };
type Dog = { bark(): void; name: string };
type Pet = Cat | Dog;

function greet(pet: Pet) {
  pet.name;   // ✅ shared
  pet.purr(); // ❌ might be a Dog
}

// Intersection: A & B means "has ALL members of A AND B"
type CatDog = Cat & Dog;
function superPet(cd: CatDog) {
  cd.purr(); // ✅
  cd.bark(); // ✅
  cd.name;   // ✅
}
\`\`\`

**Discriminated unions** — the most powerful pattern:

\`\`\`ts
type Result =
  | { status: 'success'; data: string }
  | { status: 'error'; message: string };

function handle(result: Result) {
  if (result.status === 'success') {
    result.data;    // ✅ narrowed
  } else {
    result.message; // ✅ narrowed
  }
}
\`\`\`

**\`interface extends\` vs \`type &\`:**
Both achieve composition, but \`&\` can create "impossible" types (e.g., \`string & number\` → \`never\`). Interfaces give better error messages for conflicting property types.`,
        hint: 'Union = OR, intersection = AND, discriminants narrow',
    },
    {
        id: 171,
        category: 'typescript',
        title: 'What are TypeScript utility types?',
        difficulty: 'mid',
        answer: `TypeScript ships with built-in types that transform other types. These are the most-used ones:

**\`Partial<T>\`** — all properties become optional:
\`\`\`ts
interface User { name: string; age: number; email: string }
type UpdatePayload = Partial<User>;
// { name?: string; age?: number; email?: string }
\`\`\`

**\`Required<T>\`** — all properties become required:
\`\`\`ts
type StrictUser = Required<Partial<User>>; // back to all required
\`\`\`

**\`Pick<T, K>\`** — select specific properties:
\`\`\`ts
type UserPreview = Pick<User, 'name' | 'email'>;
// { name: string; email: string }
\`\`\`

**\`Omit<T, K>\`** — exclude specific properties:
\`\`\`ts
type UserWithoutEmail = Omit<User, 'email'>;
// { name: string; age: number }
\`\`\`

**\`Record<K, V>\`** — object with keys K and values V:
\`\`\`ts
type StatusMap = Record<'loading' | 'success' | 'error', boolean>;
// { loading: boolean; success: boolean; error: boolean }
\`\`\`

**\`Readonly<T>\`** — all properties become readonly:
\`\`\`ts
type FrozenUser = Readonly<User>;
const u: FrozenUser = { name: 'Ada', age: 30, email: 'ada@example.com' };
u.name = 'Bob'; // ❌ Cannot assign to 'name' because it is a read-only property
\`\`\`

**\`ReturnType<T>\`** — infer return type of a function:
\`\`\`ts
function createUser() { return { name: 'Ada', age: 30 }; }
type CreatedUser = ReturnType<typeof createUser>;
// { name: string; age: number }
\`\`\`

**\`Parameters<T>\`** — get parameter types as a tuple:
\`\`\`ts
type Params = Parameters<typeof createUser>; // []
\`\`\`

**\`Extract<T, U>\`** and **\`Exclude<T, U>\`:**
\`\`\`ts
type Status = 'loading' | 'success' | 'error';
type SuccessStates = Extract<Status, 'success' | 'loading'>; // 'success' | 'loading'
type FailStates = Exclude<Status, 'success'>; // 'loading' | 'error'
\`\`\`

**Pro tip:** Compose them. \`Omit<User, 'id'> & { id: string }\` replaces the id type.`,
        hint: 'Partial, Pick, Omit, Record, ReturnType',
    },
    {
        id: 172,
        category: 'typescript',
        title: 'What are type guards and how do you write custom ones?',
        difficulty: 'mid',
        answer: `Type guards are expressions that **narrow** a union to a more specific type within a block.

**Built-in type guards:**

\`\`\`ts
function process(value: string | number) {
  if (typeof value === 'string') {
    value.toUpperCase(); // ✅ narrowed to string
  } else {
    value.toFixed(2);    // ✅ narrowed to number
  }
}
\`\`\`

\`\`\`ts
class Dog { bark() {} }
class Cat { purr() {} }

function handle(pet: Dog | Cat) {
  if (pet instanceof Dog) {
    pet.bark(); // ✅
  }
}
\`\`\`

\`\`\`ts
// "in" guard
function move(vehicle: Car | Boat) {
  if ('wheels' in vehicle) {
    vehicle.drive(); // ✅ narrowed to Car
  }
}
\`\`\`

**Custom type guard (type predicate):**

\`\`\`ts
interface Fish { swim(): void; name: string }
interface Bird { fly(): void; name: string }

function isFish(pet: Fish | Bird): pet is Fish {
  return 'swim' in pet;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim(); // ✅ narrowed to Fish
  } else {
    pet.fly();  // ✅ narrowed to Bird
  }
}
\`\`\`

**The \`pet is Fish\` return type is the magic.** Without it, the function returns \`boolean\` and TS can't narrow.

**Assertion function (throws on failure):**

\`\`\`ts
function assertIsString(val: unknown): asserts val is string {
  if (typeof val !== 'string') {
    throw new Error(\`Expected string, got \${typeof val}\`);
  }
}

function process(input: unknown) {
  assertIsString(input);
  input.toUpperCase(); // ✅ narrowed after assertion
}
\`\`\`

**Real-world API validation:**

\`\`\`ts
interface ApiError { code: number; message: string }
interface ApiSuccess<T> { data: T }
type ApiResult<T> = ApiError | ApiSuccess<T>;

function isApiError(result: ApiResult<unknown>): result is ApiError {
  return 'code' in result && 'message' in result;
}
\`\`\`

**Rule:** Prefer type guards over type assertions. Guards are checked at runtime; assertions are trust-the-developer.`,
        hint: 'typeof, instanceof, in, custom predicates',
    },
    {
        id: 173,
        category: 'typescript',
        title: 'How do enums work and when should you avoid them?',
        difficulty: 'mid',
        answer: `Enums define a set of named constants.

**Numeric enum (default):**
\`\`\`ts
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right, // 3
}
Direction.Up;   // 0
Direction[0];   // 'Up' (reverse mapping)
\`\`\`

**String enum:**
\`\`\`ts
enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}
Status.Active; // 'ACTIVE'
// No reverse mapping for string enums
\`\`\`

**Const enum — inlined at compile time:**
\`\`\`ts
const enum Color {
  Red = 'RED',
  Blue = 'BLUE',
}
const c = Color.Red; // compiles to: const c = "RED"
\`\`\`

**When to avoid enums:**

1. **Tree-shaking** — numeric enums generate an IIFE that bundlers can't tree-shake:
\`\`\`js
// Compiled output of enum Direction:
var Direction;
(function (Direction) {
  Direction[Direction["Up"] = 0] = "Up";
  // ...
})(Direction || (Direction = {}));
\`\`\`

2. **\`const enum\` pitfalls** — breaks with \`isolatedModules\` (required by Babel, SWC, esbuild) and \`--declaration\` emit.

3. **Type widening** — numeric enum values are just numbers, so \`Direction.Up === 0\` is \`true\`. This defeats the purpose of named constants.

**Modern alternative — union of string literals:**

\`\`\`ts
type Direction = 'up' | 'down' | 'left' | 'right';

// If you need a runtime object too:
const Direction = {
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right',
} as const;

type Direction = typeof Direction[keyof typeof Direction];
// 'up' | 'down' | 'left' | 'right'
\`\`\`

**Rule of thumb:** Use string literal unions in new code. Use string enums if your team prefers them. Avoid numeric enums — the reverse mapping and type widening cause subtle bugs.`,
        hint: 'Numeric vs string, const enum, prefer string unions',
    },
    {
        id: 174,
        category: 'typescript',
        title: 'Explain `keyof`, `typeof`, and indexed access types',
        difficulty: 'mid',
        answer: `Three operators that extract types from existing values and types.

**\`keyof\`** — gets the union of property names:
\`\`\`ts
interface User { name: string; age: number; email: string }
type UserKeys = keyof User; // 'name' | 'age' | 'email'
\`\`\`

**\`typeof\`** — gets the type of a runtime value:
\`\`\`ts
const config = { host: 'localhost', port: 3000 };
type Config = typeof config;
// { host: string; port: number }

// With as const for literal types:
const config2 = { host: 'localhost', port: 3000 } as const;
type Config2 = typeof config2;
// { readonly host: 'localhost'; readonly port: 3000 }
\`\`\`

**Indexed access types** — look up a property type:
\`\`\`ts
type UserName = User['name'];      // string
type NameOrAge = User['name' | 'age']; // string | number
\`\`\`

**Combining them — the power pattern:**

\`\`\`ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = { name: 'Ada', age: 30, email: 'ada@test.com' };
const name = getProperty(user, 'name'); // type: string
const age = getProperty(user, 'age');   // type: number
\`\`\`

**Array element type:**
\`\`\`ts
const roles = ['admin', 'user', 'guest'] as const;
type Role = typeof roles[number]; // 'admin' | 'user' | 'guest'
\`\`\`

**Nested access:**
\`\`\`ts
interface Config {
  db: { host: string; port: number };
  cache: { ttl: number };
}
type DbHost = Config['db']['host']; // string
\`\`\`

**Why this matters:** These operators let you derive types from existing code instead of duplicating them. When the source changes, dependent types update automatically — zero manual sync.`,
        hint: 'keyof = keys, typeof = value→type, T[K] = lookup',
    },

    // ── Senior (6) ──────────────────────────────────────────────────

    {
        id: 175,
        category: 'typescript',
        title: 'How do conditional types work?',
        difficulty: 'senior',
        answer: `Conditional types choose a type based on a condition, like a ternary for types:

\`\`\`ts
type IsString<T> = T extends string ? 'yes' : 'no';

type A = IsString<string>;  // 'yes'
type B = IsString<number>;  // 'no'
\`\`\`

**Distributive behavior over unions:**

\`\`\`ts
type ToArray<T> = T extends unknown ? T[] : never;

type Result = ToArray<string | number>;
// string[] | number[]  (NOT (string | number)[])
\`\`\`

When \`T\` is a union, the conditional distributes: each member is processed separately and the results are unioned.

**Prevent distribution with \`[T]\`:**
\`\`\`ts
type ToArray<T> = [T] extends [unknown] ? T[] : never;
type Result = ToArray<string | number>;
// (string | number)[]
\`\`\`

**\`infer\` — pattern-match and extract:**
\`\`\`ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type A = ReturnType<() => string>;        // string
type B = ReturnType<(x: number) => void>; // void
\`\`\`

**Real-world: unwrapping Promises:**
\`\`\`ts
type Unwrap<T> = T extends Promise<infer U> ? Unwrap<U> : T;

type A = Unwrap<Promise<Promise<string>>>; // string (recursive!)
\`\`\`

**Constraining \`infer\`:**
\`\`\`ts
type FirstString<T> = T extends [infer F extends string, ...any[]] ? F : never;

type A = FirstString<['hello', 42]>;  // 'hello'
type B = FirstString<[42, 'hello']>;  // never (42 is not string)
\`\`\`

**Practical filter pattern:**
\`\`\`ts
type FilterByType<T, U> = T extends U ? T : never;
type Strings = FilterByType<string | number | boolean, string>;
// string
\`\`\`

**Mental model:** Think of conditional types as pattern matching for the type system. \`extends\` asks "is T assignable to X?" and \`infer\` captures sub-parts.`,
        hint: 'extends ? : ternary, distributive unions, infer',
    },
    {
        id: 176,
        category: 'typescript',
        title: 'What are mapped types and how do you use them?',
        difficulty: 'senior',
        answer: `Mapped types iterate over keys to create new types — like \`Array.map\` but for type properties.

**Basic syntax:**
\`\`\`ts
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

type Optional<T> = {
  [K in keyof T]?: T[K];
};
\`\`\`

**How \`Partial<T>\` works under the hood:**
\`\`\`ts
type Partial<T> = {
  [K in keyof T]?: T[K];
};
// Iterates each key K in T, makes it optional, keeps the value type
\`\`\`

**Key remapping (TS 4.1+):**
\`\`\`ts
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

interface Person { name: string; age: number }
type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number }
\`\`\`

**Filtering keys:**
\`\`\`ts
type OnlyStrings<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface Mixed { name: string; age: number; email: string }
type StringProps = OnlyStrings<Mixed>;
// { name: string; email: string }
\`\`\`

**Modifiers — add/remove \`readonly\` and \`?\`:**
\`\`\`ts
type Mutable<T> = {
  -readonly [K in keyof T]: T[K]; // remove readonly
};

type Required<T> = {
  [K in keyof T]-?: T[K]; // remove optional
};
\`\`\`

**Real-world: form validation errors:**
\`\`\`ts
type FormErrors<T> = {
  [K in keyof T]?: string; // each field can have an error message
};

interface LoginForm { email: string; password: string }
type LoginErrors = FormErrors<LoginForm>;
// { email?: string; password?: string }
\`\`\`

**Mapped types power most utility types:** \`Partial\`, \`Required\`, \`Readonly\`, \`Pick\`, \`Record\` — they're all mapped types internally.`,
        hint: 'Iterate keys with [K in keyof T], remap with as',
    },
    {
        id: 177,
        category: 'typescript',
        title: 'What are discriminated unions and exhaustiveness checking?',
        difficulty: 'senior',
        answer: `A discriminated union is a union where each member has a **literal tag** (discriminant) that TS uses to narrow the type.

**The pattern:**
\`\`\`ts
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'rectangle'; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;    // narrowed to circle
    case 'square':
      return shape.side ** 2;                 // narrowed to square
    case 'rectangle':
      return shape.width * shape.height;      // narrowed to rectangle
  }
}
\`\`\`

**Exhaustiveness checking — the \`never\` trick:**

\`\`\`ts
function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
    // Forgot 'rectangle'!
    default:
      const _exhaustive: never = shape;
      //    ~~~~~~~~~~ Error: Type '{ kind: "rectangle"; ... }' is not assignable to 'never'
      return _exhaustive;
  }
}
\`\`\`

If you add a new variant to the union, the compiler forces you to handle it. This is **incredibly** valuable in large codebases.

**Real-world — Redux-style actions:**
\`\`\`ts
type Action =
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; id: number }
  | { type: 'DELETE_TODO'; id: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, action.payload] };
    case 'TOGGLE_TODO':
      return { /* toggle logic using action.id */ ...state };
    case 'DELETE_TODO':
      return { /* delete logic using action.id */ ...state };
    default:
      const _: never = action;
      return state;
  }
}
\`\`\`

**Rules for effective discriminated unions:**
1. Every variant must share a common literal property (the discriminant).
2. The discriminant values must be unique across variants.
3. Use \`switch\` + \`never\` default for exhaustive handling.
4. Prefer this over class hierarchies for data modeling in TS.`,
        hint: 'Common tag + switch + never for exhaustiveness',
    },
    {
        id: 178,
        category: 'typescript',
        title: 'Explain template literal types',
        difficulty: 'senior',
        answer: `Template literal types (TS 4.1+) build string types using template syntax — the same as JS template literals, but at the type level.

**Basic usage:**
\`\`\`ts
type Greeting = \`Hello, \${string}\`;
const a: Greeting = 'Hello, Ada';    // ✅
const b: Greeting = 'Goodbye, Ada';  // ❌
\`\`\`

**Combining with unions:**
\`\`\`ts
type Color = 'red' | 'blue' | 'green';
type Shade = 'light' | 'dark';
type Theme = \`\${Shade}-\${Color}\`;
// 'light-red' | 'light-blue' | 'light-green' | 'dark-red' | 'dark-blue' | 'dark-green'
\`\`\`

TS distributes across unions — 2 × 3 = 6 combinations.

**Event handler pattern:**
\`\`\`ts
type EventName = 'click' | 'focus' | 'blur';
type Handler = \`on\${Capitalize<EventName>}\`;
// 'onClick' | 'onFocus' | 'onBlur'
\`\`\`

**Built-in string manipulation types:**
\`\`\`ts
type A = Uppercase<'hello'>;    // 'HELLO'
type B = Lowercase<'HELLO'>;    // 'hello'
type C = Capitalize<'hello'>;   // 'Hello'
type D = Uncapitalize<'Hello'>; // 'hello'
\`\`\`

**Parsing strings with \`infer\`:**
\`\`\`ts
type ExtractId<T> = T extends \`user-\${infer Id}\` ? Id : never;
type A = ExtractId<'user-123'>; // '123'
type B = ExtractId<'post-456'>; // never

// Split a dot path:
type Split<S extends string> =
  S extends \`\${infer Head}.\${infer Tail}\`
    ? [Head, ...Split<Tail>]
    : [S];

type Path = Split<'a.b.c'>; // ['a', 'b', 'c']
\`\`\`

**Real-world — typed CSS properties:**
\`\`\`ts
type CSSProperty = \`\${'margin' | 'padding'}-\${'top' | 'right' | 'bottom' | 'left'}\`;
// 'margin-top' | 'margin-right' | ... | 'padding-left' (8 types)
\`\`\`

**Key insight:** Template literal types turn string manipulation into compile-time operations. Combined with mapped types and conditional types, they enable extremely precise API typing.`,
        hint: 'String-level type computation with template syntax',
    },
    {
        id: 179,
        category: 'typescript',
        title: 'How does declaration merging work?',
        difficulty: 'senior',
        answer: `Declaration merging is when TS combines multiple declarations with the same name into a single definition. It's unique to TS — JS doesn't have this.

**Interface merging (most common):**
\`\`\`ts
interface Window {
  myApp: { version: string };
}

// Now window.myApp is typed — the built-in Window interface is extended
declare global {
  interface Window {
    analytics: { track(event: string): void };
  }
}
\`\`\`

**Namespace merging:**
\`\`\`ts
namespace Validation {
  export function isEmail(s: string): boolean { return s.includes('@'); }
}

namespace Validation {
  export function isPhone(s: string): boolean { return /^\\d{10}$/.test(s); }
}

// Both functions available:
Validation.isEmail('test@test.com');
Validation.isPhone('1234567890');
\`\`\`

**Enum merging:**
\`\`\`ts
enum Color { Red = 1, Green = 2 }
enum Color { Blue = 3 }
// Color has Red, Green, and Blue
\`\`\`

**Function + namespace (adding properties to functions):**
\`\`\`ts
function greet(name: string) { return \`Hello, \${name}\`; }
namespace greet {
  export const defaultName = 'World';
}

greet('Ada');           // works as function
greet.defaultName;      // works as namespace
\`\`\`

**Module augmentation — extending third-party types:**
\`\`\`ts
// Extend Express's Request type
declare module 'express' {
  interface Request {
    user?: { id: string; role: string };
  }
}

// Now req.user is typed in all route handlers
\`\`\`

**What does NOT merge:**
- \`type\` aliases — duplicate identifier error
- \`class\` declarations — cannot merge (but can implement merged interfaces)

**When it's useful:**
1. Augmenting global types (\`Window\`, \`NodeJS.ProcessEnv\`)
2. Extending library types without forking
3. Polyfill declarations

**When it's dangerous:**
- Over-merging can make types hard to trace. If you're merging your own interfaces, consider using \`&\` intersection instead for clarity.`,
        hint: 'Same-name interfaces merge; module augmentation extends libs',
    },
    {
        id: 180,
        category: 'typescript',
        title: 'What is the difference between `unknown` and `any`? When do you use `never`?',
        difficulty: 'senior',
        answer: `Three special types that form the top and bottom of TS's type hierarchy.

**\`any\` — the escape hatch (top type):**
\`\`\`ts
let x: any = 42;
x.foo.bar.baz; // ✅ no error — TS stops checking
x();           // ✅ no error
\`\`\`

\`any\` **propagates** — if you pass \`any\` into a function, the return is often \`any\` too. It's contagious.

**\`unknown\` — the safe top type:**
\`\`\`ts
let x: unknown = 42;
x.foo;         // ❌ Error — must narrow first
x();           // ❌ Error

if (typeof x === 'number') {
  x.toFixed(2); // ✅ narrowed
}
\`\`\`

\`unknown\` accepts any value (like \`any\`) but forces you to check the type before using it. **Always prefer \`unknown\` over \`any\`.**

**\`never\` — the bottom type (nothing):**
\`\`\`ts
// Functions that never return:
function throwError(msg: string): never {
  throw new Error(msg);
}

function infiniteLoop(): never {
  while (true) {}
}

// Exhaustiveness checking:
function handle(x: 'a' | 'b') {
  switch (x) {
    case 'a': return 1;
    case 'b': return 2;
    default:
      const _: never = x; // ✅ all cases handled
  }
}
\`\`\`

**Type hierarchy:**

\`\`\`
unknown (top — every type is assignable TO unknown)
   ↑
 string, number, boolean, object, ...
   ↑
  never (bottom — assignable to EVERY type, but nothing is assignable TO never)
\`\`\`

**Practical rules:**
| Situation | Use |
|---|---|
| API response, user input | \`unknown\` + type guards |
| Migrating JS → TS quickly | \`any\` (temporarily!) |
| Functions that throw/loop | \`never\` |
| Exhaustiveness checks | \`never\` |
| 3rd-party lib with no types | \`any\` as last resort |

**The golden rule:** Code with \`any\` compiles but may crash. Code with \`unknown\` forces safety. \`never\` proves impossibility.`,
        hint: 'any = unsafe escape, unknown = safe check-first, never = impossible value',
    },

    // ── Lead (4) ────────────────────────────────────────────────────

    {
        id: 181,
        category: 'typescript',
        title: 'Design a fully type-safe event emitter using mapped and conditional types',
        difficulty: 'lead',
        answer: `A type-safe event emitter ensures that event names and their payload types are verified at compile time.

**Step 1 — Define an event map:**
\`\`\`ts
interface AppEvents {
  userLogin: { userId: string; timestamp: number };
  pageView: { path: string; referrer?: string };
  error: { code: number; message: string };
}
\`\`\`

**Step 2 — Build the typed emitter:**
\`\`\`ts
type EventHandler<T> = (payload: T) => void;

class TypedEmitter<Events extends Record<string, unknown>> {
  private handlers = new Map<keyof Events, Set<EventHandler<any>>>();

  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): this {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return this;
  }

  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): this {
    this.handlers.get(event)?.delete(handler);
    return this;
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): boolean {
    const set = this.handlers.get(event);
    if (!set?.size) return false;
    set.forEach(h => h(payload));
    return true;
  }
}
\`\`\`

**Step 3 — Usage is fully type-checked:**
\`\`\`ts
const bus = new TypedEmitter<AppEvents>();

bus.on('userLogin', (payload) => {
  console.log(payload.userId);     // ✅ string
  console.log(payload.timestamp);  // ✅ number
});

bus.emit('userLogin', { userId: '123', timestamp: Date.now() }); // ✅
bus.emit('userLogin', { userId: 123 });  // ❌ 'number' is not assignable to 'string'
bus.emit('unknownEvent', {});            // ❌ not in AppEvents
\`\`\`

**Step 4 — Add \`once\` with conditional return types:**
\`\`\`ts
once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): this {
  const wrapper: EventHandler<Events[K]> = (payload) => {
    this.off(event, wrapper);
    handler(payload);
  };
  return this.on(event, wrapper);
}
\`\`\`

**Advanced — wildcard listeners:**
\`\`\`ts
onAny(handler: <K extends keyof Events>(event: K, payload: Events[K]) => void): this;
\`\`\`

**Architecture decisions:**
- The event map is the single source of truth — add a new event, and all consumers get type-checked.
- \`keyof Events\` prevents typos in event names.
- The generic constraint \`Events extends Record<string, unknown>\` ensures only valid maps.
- This pattern scales to thousands of events across a micro-frontend architecture.

**Where this matters:** In large applications (Slack, VS Code, Figma), typed event buses prevent an entire class of integration bugs at the seams between teams.`,
        hint: 'Event map → generic class → keyof constraints → compile-time safety',
    },
    {
        id: 182,
        category: 'typescript',
        title: 'How do you build a type-safe deep path accessor?',
        difficulty: 'lead',
        answer: `Building a function like \`get(obj, 'a.b.c')\` that is fully type-safe — inferring both the path validity and the return type — uses advanced recursive types.

**Step 1 — Generate all valid paths:**
\`\`\`ts
type Paths<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: K extends string
        ? Prefix extends ''
          ? K | \`\${K}.\${Paths<T[K], K>}\`
          : K | \`\${K}.\${Paths<T[K], \`\${Prefix}.\${K}\`>}\`
        : never;
    }[keyof T & string]
  : never;
\`\`\`

**Step 2 — Resolve a path to its type:**
\`\`\`ts
type PathValue<T, P extends string> =
  P extends \`\${infer Head}.\${infer Tail}\`
    ? Head extends keyof T
      ? PathValue<T[Head], Tail>
      : never
    : P extends keyof T
      ? T[P]
      : never;
\`\`\`

**Step 3 — The typed \`get\` function:**
\`\`\`ts
function get<T, P extends Paths<T>>(obj: T, path: P): PathValue<T, P> {
  return path.split('.').reduce((acc: any, key) => acc?.[key], obj);
}
\`\`\`

**Usage:**
\`\`\`ts
interface Config {
  db: { host: string; port: number; credentials: { user: string; pass: string } };
  cache: { ttl: number };
}

const config: Config = {
  db: { host: 'localhost', port: 5432, credentials: { user: 'admin', pass: 'secret' } },
  cache: { ttl: 3600 },
};

const host = get(config, 'db.host');            // string
const port = get(config, 'db.port');            // number
const user = get(config, 'db.credentials.user');// string
const bad = get(config, 'db.nope');             // ❌ Error
\`\`\`

**Performance considerations:**
- Deep recursive types can slow down the compiler. Limit depth with a counter:
\`\`\`ts
type Paths<T, D extends number = 5> = [D] extends [0] ? never : /* ... */;
\`\`\`
- Consider using \`@ts-expect-error\` and runtime validation for very deep structures.

**Where this is used:** Form libraries (react-hook-form's \`Path<T>\`), ORMs (Prisma), i18n key resolution, and configuration management. Understanding this pattern proves mastery of TS's type-level programming model.`,
        hint: 'Recursive template literals + infer for path extraction',
    },
    {
        id: 183,
        category: 'typescript',
        title: 'How would you set up TypeScript in a large monorepo?',
        difficulty: 'lead',
        answer: `TypeScript monorepo setup involves **project references**, **shared configs**, and **build orchestration**.

**1. Shared base tsconfig:**
\`\`\`jsonc
// tsconfig.base.json (root)
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,          // required for project references
    "incremental": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true     // required by esbuild/SWC/Babel
  }
}
\`\`\`

**2. Package-level tsconfig with references:**
\`\`\`jsonc
// packages/ui/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "references": [
    { "path": "../shared-types" }  // depends on shared-types
  ]
}
\`\`\`

**3. Root solution-style tsconfig:**
\`\`\`jsonc
// tsconfig.json (root)
{
  "files": [],
  "references": [
    { "path": "./packages/shared-types" },
    { "path": "./packages/ui" },
    { "path": "./packages/api" },
    { "path": "./apps/web" }
  ]
}
\`\`\`

**4. Build with \`tsc --build\`:**
\`\`\`bash
tsc --build              # builds all in dependency order
tsc --build --watch      # incremental watch mode
tsc --build --clean      # clears incremental caches
\`\`\`

**5. Path aliases (via package.json \`exports\`):**
\`\`\`jsonc
// packages/ui/package.json
{
  "name": "@myorg/ui",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./Button": { "types": "./dist/Button.d.ts", "import": "./dist/Button.js" }
  }
}
\`\`\`

**Key decisions for a lead:**

| Decision | Recommendation |
|---|---|
| Build tool | \`tsc --build\` for types, bundler (Vite/esbuild) for runtime |
| Module system | ESM with \`"type": "module"\` everywhere |
| \`isolatedModules\` | Always on — ensures compat with non-tsc transpilers |
| \`composite + incremental\` | Required for project references + fast rebuilds |
| Type checking CI | Run \`tsc --noEmit\` in CI on the root solution config |
| Shared types package | Dedicate a \`packages/shared-types\` for cross-package types |

**Common pitfalls:**
- Forgetting \`composite: true\` → project references silently broken
- Circular references between packages → \`tsc --build\` will error
- \`skipLibCheck: true\` hides errors in \`.d.ts\` files — use it for speed but validate periodically
- Mixing \`moduleResolution: "node"\` and \`"bundler"\` across packages breaks imports

**Tools to consider:** Turborepo/Nx for build caching, \`syncpack\` for version alignment, \`publint\` to validate package exports.`,
        hint: 'Project references, composite, shared base config, tsc --build',
    },
    {
        id: 184,
        category: 'typescript',
        title: 'How do you migrate a large JavaScript codebase to TypeScript?',
        difficulty: 'lead',
        answer: `A successful JS → TS migration is **incremental**, not a big-bang rewrite. Here's the battle-tested playbook.

**Phase 1 — Setup (Day 1, no code changes):**

\`\`\`jsonc
// tsconfig.json
{
  "compilerOptions": {
    "allowJs": true,          // let .js and .ts coexist
    "checkJs": false,         // don't type-check JS yet
    "strict": false,          // start permissive
    "outDir": "./dist",
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "isolatedModules": true,
    "noEmit": true            // bundler handles emit
  },
  "include": ["src"]
}
\`\`\`

Rename entry point to \`.ts\`. Verify the app still builds and runs.

**Phase 2 — Low-hanging fruit (Weeks 1–2):**

1. Rename \`.js\` → \`.ts\` file by file, starting with leaf modules (utilities, helpers, constants).
2. Add types to function signatures — start with \`any\` and tighten later.
3. Install \`@types/*\` for all dependencies.
4. Create a \`types/\` directory for shared interfaces.

\`\`\`ts
// Before (JS):
export function formatPrice(amount, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

// After (TS — minimal effort):
export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
\`\`\`

**Phase 3 — Tighten gradually (Weeks 3–8):**

Enable strict flags one by one in this order:
\`\`\`jsonc
"noImplicitAny": true,              // forces explicit types
"strictNullChecks": true,           // biggest safety win
"strictFunctionTypes": true,        // catches callback bugs
"strictBindCallApply": true,        // validates bind/call/apply
"strictPropertyInitialization": true, // class fields
"noImplicitReturns": true,          // all paths must return
"noUncheckedIndexedAccess": true,   // array/object access may be undefined
"strict": true                      // umbrella — enable when all above pass
\`\`\`

**Phase 4 — Enforce in CI:**

\`\`\`bash
tsc --noEmit  # type-check only, no output
\`\`\`

Add to CI pipeline so no new \`any\` leaks in.

**Tracking progress:**
\`\`\`bash
# Count remaining .js files
find src -name '*.js' | wc -l

# Count explicit 'any' annotations
grep -r ': any' src --include='*.ts' | wc -l
\`\`\`

**Key principles:**
1. **Never block shipping.** The app must build and deploy at every step.
2. **Convert in dependency order** — leaves first, then their consumers.
3. **Use \`// @ts-expect-error\`** for known issues you'll fix later (not \`@ts-ignore\`).
4. **Don't type everything perfectly** — \`any\` with a TODO comment beats blocking the migration.
5. **Celebrate wins** — share the shrinking \`.js\` file count in standups.

**Anti-patterns:**
- Converting everything at once (merge conflicts, morale killer)
- Starting with \`strict: true\` (thousands of errors → team gives up)
- Ignoring third-party types (breaks at integration boundaries)

**Timeline for a ~50k LOC codebase:** 2–3 months with 2 engineers dedicating ~30% time. The first 80% goes fast; the last 20% (strict null checks, complex generics) takes as long as the first 80%.`,
        hint: 'allowJs → rename files → tighten strict flags → enforce in CI',
    },
];
