Markdown

# Nihil.js

[![NPM Version](https://img.shields.io/npm/v/nihil-js.svg?style=flat-square)](https://www.npmjs.com/package/nihil-js)
[![Build Status](https://img.shields.io/github/actions/workflow/status/MateuszSzczukiewicz/Nihil.js/ci.yml?style=flat-square)](https://github.com/MateuszSzczukiewicz/Nihil.js/actions)
[![Status](https://img.shields.io/badge/status-in_development-red.svg?style=flat-square)](https://github.com/MateuszSzczukiewicz/Nihil.js)
[![License](https://img.shields.io/npm/l/nihil-js.svg?style=flat-square)](LICENSE)

*Nihil* is Latin for "nothing." This project is an experiment in radical simplicity, answering the question: "What is the *absolute minimum* amount of code needed to build modern, reactive, and efficient web applications?"

Nihil.js is being built for developers who find client-side frameworks (like React or Vue) too heavy, and full HTML-over-the-wire approaches too network-intensive. It aims to be a third way.

## The Philosophy: "Nothing" in Between

Nihil.js is the "anti-framework." Instead of a Virtual DOM, component islands, or transferring HTML fragments, Nihil.js provides a **minimal runtime (target: < 1.5kb)** that bridges declarative HTML attributes directly to server-side state.

**How will it work?**

1.  You render static HTML from any backend.
2.  In your HTML, you use special `data-nihil-*` attributes to bind DOM elements to state (e.g., `data-nihil-text="user.name"`).
3.  A user performs an action (e.g., `data-nihil-click="saveUser"`).
4.  The tiny Nihil.js runtime sends a request to the server (via WebSocket or Fetch).
5.  The server executes its logic and sends back **only the changed state** (a small JSON diff, e.g., `{"user.name": "New Name"}`), **not** HTML.
6.  The Nihil.js runtime receives this JSON and performs fine-grained, surgical updates *only* to the DOM nodes that were bound to `user.name`.

This approach combines the fine-grained reactivity of libraries like Svelte with the server-centric logic of HTML-over-the-wire, all while having a minimal client and network footprint.

## Key Goals

* **Minimal Runtime:** The target client-side library size is **< 1.5kb** (gzipped).
* **Peak Performance:** No VDOM. Direct, fine-grained DOM updates.
* **Simplicity:** A declarative HTML-based API. No complex hydration.
* **Agnostic:** The runtime is a simple JS file. Use it with any backend (Express, Go, PHP, etc.). It is philosophically aligned with high-performance, minimal backends like **[Omnia.js](https://github.com/MateuszSzczukiewicz/Omnia.js)**.
* **Zero Dependencies:** Written from scratch in pure TypeScript.

## Aspirational API (The Vision)

This is how a Nihil.js application is imagined to work, paired with its philosophical counterpart on the backend, **Omnia.js**.

**Backend (e.g., Omnia.js):**
```typescript
// server.ts
import { Omnia } from 'omnia-js'; // (The aspirational Omnia.js API)
import { nihil, NihilStore } from 'nihil-js/server'; // (A planned server-side helper)

// Create a state store for the user session
const userStore = new NihilStore({
  count: 0,
  user: { name: 'Guest' }
});

const app = new Omnia()
  .use(nihil(userStore)) // Plug in Nihil middleware (e.g., for WebSocket)
  .get('/', () => Bun.file('index.html'))
  .post('/increment', (ctx) => {
    // Server logic updates the state...
    userStore.update(ctx, (state) => ({
      count: state.count + 1
    }));
    // ...and Nihil.js automatically pushes the state diff (e.g., `{"count": 1}`) to the client.
  });

app.listen(3000, () => {
  console.log('Nihil.js (frontend) + Omnia.js (backend) running on http://localhost:3000');
});

Frontend (index.html):
HTML

<html>
<head>
  <script src="/nihil.js" defer></script> 
</head>
<body>
  <h1>Hello, <span data-nihil-text="user.name"></span>!</h1>
  
  <h2>Counter: <span data-nihil-text="count"></span></h2>
  
  <button data-nihil-post="/increment">
    +
  </button>
</body>
</html>

Roadmap (Early Phase)

Nihil.js is in the very early stages of development. The plan is to:

    [ ] Core Runtime: Create the base client module for updating the DOM from data-nihil-* attributes.

    [ ] State Binding: Implement the logic for listening to state changes.

    [ ] Transport: Create a basic communication layer (WebSocket / Server-Sent Events).

    [ ] Actions: Implement data-nihil-click, data-nihil-post, etc.

    [ ] Integrations (Backend): Create a base helper for Node/Bun.

    [ ] Docs & Examples: Document the API.

Contributing

This project is currently a manifesto and a collection of ideas. If you believe in the "nothing" philosophy and want to help build a truly minimal, high-performance web experience, please join the discussions, open issues, or submit a PR.

License

MIT
