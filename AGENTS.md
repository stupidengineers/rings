# AGENTS.md

## Brand & Design

All visual decisions follow [docs/BRAND_GUIDELINES.md](docs/BRAND_GUIDELINES.md).

Design philosophy: warm editorial aesthetic, serif-first typography
(Roboto Serif Variable), stone/olive color palette. No generic SaaS
or AI-slop patterns.

## Architecture

- **Local-only.** No cloud services, no telemetry, no accounts.
  All data stays on the user's machine.
- **AI via Ollama.** LLM features run through a local Ollama instance.
  Never call external AI APIs.
- **Storage via SQLite.** All persistent data uses better-sqlite3.
  No remote databases.

## Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Shell     | Electron 42                        |
| Renderer  | React 19, Tailwind CSS 4           |
| Animation | Motion (framer-motion successor)   |
| Database  | better-sqlite3                     |
| AI        | Ollama (local)                     |
| Icons     | HugeIcons (`@hugeicons/react`)     |
| Font      | Roboto Serif Variable              |
| Bundler   | electron-vite                      |

## Conventions

- Components live in `src/renderer/src/components/`.
- Pages live in `src/renderer/src/pages/`.
- Shared utilities live in `src/renderer/src/lib/`.
- Main process code lives in `src/main/`.
- Use Tailwind utility classes; avoid inline styles.
- Respect the 8 px spacing grid defined in brand guidelines.
