# Claude Code

Follow the instructions in [AGENTS.md](AGENTS.md).

Use the planning tool and AskQuestions too liberally.

Use test driven development. i.e. write the failing test first.

## Decision Management

Architectural and technical decisions must be documented per [DECISION-MANAGEMENT.md](DECISION-MANAGEMENT.md). Designs and implementations should align with the existing decision records in [docs/decisions/](docs/decisions/).

## Project Context

This is a monorepo of fetch-enhancing libraries for HATEOAS/hypermedia APIs, published under the `@windyroad` npm scope.

### Packages

| Package | Purpose |
|---------|---------|
| `fetch-link` | Core — adapts fetch for RFC 8288 Link headers, Link-Template expansion |
| `link-header` | Parses RFC 8288 Link headers |
| `wrap-fetch` | Generic fetch wrapper utility |
| `adapt-fetch-inputs` | Normalise fetch input arguments |
| `decorate-fetch-response` | Add methods to fetch Response objects |
| `fetch-fragment` | JSON Pointer fragment support for fetch |
| `ofetch-link` | ofetch adapter for fetch-link |
| `eslint-config` | Shared ESLint config for the monorepo |

### Build System

- **npm workspaces** for package management
- **Turbo** for monorepo task orchestration
- **Vite + Vitest** for building and testing
- **TypeScript** strict mode
- **Changesets** for versioning and publishing
- **Default branch: `main`**

### Key Consumers

- `@mountainpass/addressr-react` — React address autocomplete component (uses fetch-link for HATEOAS navigation)
- `addressr.io` — Gatsby website (uses fetch-link for API discovery)

## Non-Negotiable

- Never commit credentials or API keys
- All packages must maintain RFC 8288 compliance
- Tests must pass before publishing
- No web UI — accessibility requirements do not apply
