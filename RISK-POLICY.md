# Risk Policy

Risk management follows the approach documented in the companion addressr repository. Risk scoring is enforced via Claude Code hooks.

## Risk Appetite

- **Release risk appetite**: 5/25 (Low)
- **Commit risk appetite**: 5/25 (Low)

## Key Risks

1. **Breaking changes in published packages** — 8 packages with external consumers. Mitigated by changesets, semver, and CI tests.
2. **RFC 8288 compliance regression** — Link header parsing must remain spec-compliant. Mitigated by test suite.
3. **Monorepo dependency drift** — internal packages referencing stale versions of each other. Mitigated by changesets `updateInternalDependencies: patch`.
