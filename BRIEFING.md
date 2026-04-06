# Project Briefing

## What You Need to Know

- **npm workspaces monorepo** with 8 packages under `@windyroad` scope
- **Turbo** for task orchestration (build, test, lint)
- **Vitest** for testing across all packages
- **Default branch: `main`** (not master)
- **Changesets** for version management and npm publishing
- **Key consumer: addressr-react** uses `@windyroad/fetch-link` for HATEOAS navigation
- **CI uses devcontainers** for PR builds, direct Node for releases
