# Password Strength Checker

Password Strength Checker is a privacy-first cybersecurity laboratory for understanding password quality without uploading the password anywhere. Analysis happens entirely in the browser, in component memory, and the page does not provide a backend, account system, analytics integration, database, or network analysis endpoint.

## Features

- Live 0–100 password scoring mapped to Weak, Fair, Good, Strong, and Very strong.
- Pattern-aware analysis for length, character variety, estimated entropy, common structures, keyboard walks, sequences, repeats, years, and predictable substitutions.
- Requirement checklist with live feedback and practical improvement suggestions.
- Security metric cards, abstract password anatomy, and approximate guessing-resistance education.
- Secure password generator using the browser Web Crypto API rather than `Math.random()`.
- Passphrase generator using a bundled local word list and cryptographically secure random selection.
- Privacy modal explaining the local-only architecture.
- Caps Lock indicator, show/hide control, clear control, copy feedback, keyboard navigation, responsive layouts, reduced-motion support, and dark/light theme toggle.
- No password history, generated-password persistence, localStorage, sessionStorage, IndexedDB, cookies, URL parameters, logging, API routes, or analytics.

## Privacy model

The password input exists only in the React component state for the current page session. The analyzer is composed of pure functions in `client/src/lib/password/`, and it receives the password directly from the input without calling `fetch`, Axios, server actions, or an API route. Refreshing or closing the page clears the password. Generated passwords and passphrases are also held only in memory and are never persisted.

The bundled common-password checks and passphrase word list are local files shipped with the application. Password generation uses `crypto.getRandomValues`, with rejection sampling to avoid modulo bias. These mechanisms allow the application to work offline after the static assets are loaded.

> The score and guessing categories are educational approximations. They are not a guarantee that a password is secure or unbreakable. Real-world resistance depends on the password's uniqueness, leaks, attacker knowledge, hashing algorithm, hardware, and server configuration.

## Technology stack

- React 19 and TypeScript with strict mode.
- Vite and Tailwind CSS 4 for the frontend toolchain.
- Lucide React for interface icons.
- CSS transitions and reduced-motion media queries for restrained micro-interactions.
- Static WebDev scaffold with no application backend required.

## Installation

```bash
npm install
npm run dev
```

The development server opens the local application with Vite. No environment variables or external services are required.

## Development commands

```bash
npm run dev       # start the Vite development server
npm run check     # run strict TypeScript validation
npm run build     # create the production frontend and static server bundle
npm run preview   # preview the Vite production output
```

## Project structure

```text
client/
  index.html                 Document metadata; intentionally no analytics script
  src/
    App.tsx                  Application shell
    index.css                Theme, layout, responsive UI, and motion styles
    pages/Home.tsx           Checker, generator, education, and privacy UI
    lib/password/
      analyze.ts             Pure local analysis and score calculation
      generators.ts          Web Crypto password and passphrase generation
      types.ts               Shared analysis and generator types
      wordlist.ts            Bundled local passphrase vocabulary
server/
  index.ts                   Static production serving compatibility layer
```

## How local password analysis works

Each input update is passed to `analyzePassword`. The function counts character families, estimates an entropy range from the active character pool, measures length and uniqueness, and detects weak signals such as common words, predictable years, keyboard patterns, sequential characters, repeated substrings, and repeated characters. These signals are combined into a normalized 0–100 score. The score is intentionally not based on a simplistic “one uppercase plus one symbol” rule, and the interface always explains the contributing signals.

## Security notes

This project is designed to be auditable. There are no password uploads, server-side analysis endpoints, external password APIs, analytics calls, password logs, password history, or browser storage. Copying a password is an explicit user action through the browser clipboard API. Users should still avoid entering real passwords into unfamiliar websites and should prefer a reputable password manager for creating and storing unique credentials.
