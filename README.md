# Nihil.js

[![NPM Version](https://img.shields.io/npm/v/nihil-js.svg?style=flat-square)](https://www.npmjs.com/package/nihil-js)
[![Build Status](https://img.shields.io/github/actions/workflow/status/MateuszSzczukiewicz/Nihil.js/ci.yml?style=flat-square)](https://github.com/MateuszSzczukiewicz/Nihil.js/actions)
[![Status](https://img.shields.io/badge/status-in_development-red.svg?style=flat-square)](https://github.com/MateuszSzczukiewicz/Nihil.js)
[![License](https://img.shields.io/npm/l/nihil-js.svg?style=flat-square)](LICENSE)

Nihil (Latin for "nothing") is an experiment in radical simplicity: the goal is to discover the absolute minimum amount of code needed to build a modern, reactive, and efficient client runtime.

Nihil.js is designed for developers who find client-side frameworks (like React or Vue) too heavy, and full HTML-over-the-wire approaches too network-intensive. It aims to be a third way.

## Philosophy: "Nothing" in Between

Nihil.js is an "anti-framework." Instead of a Virtual DOM, component islands, or transferring HTML fragments, Nihil.js provides a minimal runtime (target: < 1.5 KB gzipped) that bridges declarative HTML and fine-grained client-side updates.

How it works (high level):

1. You render static HTML from any backend.
2. In your HTML, you use special `data-nihil-*` attributes to bind DOM elements to state (for example: `data-nihil-text="user.name"`).
3. A user performs an action (for example: `data-nihil-click="saveUser"`).
4. The tiny Nihil.js runtime sends a request to the server (via WebSocket or Fetch).
5. The server executes logic and sends back only the changed state — a small JSON diff (for example: `{"user.name": "New Name"}`), not HTML.
6. The Nihil.js runtime receives the JSON and performs fine-grained, surgical updates only to the DOM nodes that are bound to the changed state.

This approach combines the fine-grained reactivity of libraries like Svelte with server-centric logic, while keeping the client and network footprint minimal.

## Key Goals

- Minimal runtime: target client-side library size is < 1.5 KB (gzipped).
- Peak performance: no VDOM, direct fine-grained DOM updates.
- Simplicity: declarative HTML-based API, no complex hydration.
- Agnostic: a single, simple JS runtime that works with any backend (Express, Bun, Go, PHP, etc.).
- Zero dependencies: written in pure TypeScript from scratch.

## Aspirational API (Vision)

This is an example of how a Nihil.js application might look, paired with a server-side helper (an aspirational backend integration).

Backend (example, aspirational):
```typescript
// server.ts (illustrative)
import { Omnia } from 'omnia-js'; // aspirational backend API
import { nihil, NihilStore } from 'nihil-js/server'; // planned server helper

// Create a state store for the user session
const userStore = new NihilStore({
  count: 0,
  user: { name: 'Guest' }
});

const app = new Omnia()
  .use(nihil(userStore)) // plug in Nihil middleware (e.g., WebSocket integration)
  .get('/', () => Bun.file('index.html'))
  .post('/increment', (ctx) => {
    // Server updates the state...
    userStore.update(ctx, (state) => ({
      count: state.count + 1
    }));
    // ...and Nihil middleware pushes only the JSON diff (e.g., {"count": 1}) to the client.
  });

app.listen(3000, () => {
  console.log('Nihil.js (frontend) + Omnia.js (backend) running on http://localhost:3000');
});
```

Frontend (index.html):
```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <script src="/nihil.js" defer></script>
    <title>Nihil.js demo</title>
  </head>
  <body>
    <h1>Hello, <span data-nihil-text="user.name"></span>!</h1>

    <h2>Counter: <span data-nihil-text="count"></span></h2>

    <button data-nihil-post="/increment">+</button>
  </body>
</html>
```

## Roadmap (Early Phase)

Nihil.js is in the early stages. Initial plan:

- [ ] Core Runtime: implement the base client module that updates the DOM from `data-nihil-*` attributes.
- [ ] State Binding: implement logic for binding DOM nodes to state keys and listening to changes.
- [ ] Transport: provide a basic communication layer (WebSocket and/or Fetch fallback).
- [ ] Actions: implement attribute handlers such as `data-nihil-click`, `data-nihil-post`, etc.
- [ ] Integrations: provide server-side helpers for Node/Bun (aspirational Omnia integration).
- [ ] Docs & Examples: document the API and add practical examples.

## Contributing

This repository currently contains a manifesto and ideas. If you believe in the "nothing" philosophy and want to help build a truly minimal, high-performance web experience, contributions are welcome. Please open issues or pull requests with concrete proposals, patches, or experiments.

Guidelines:
- Keep runtime size and simplicity as top priorities.
- Provide tests and benchmarks for performance-sensitive changes.
- Prefer small, incremental pull requests.

## License

MIT
