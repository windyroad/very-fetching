# Agentic Risk Register

| ID | Risk | Impact | Likelihood | Controls |
|----|------|--------|------------|----------|
| AR-001 | Breaking change published without semver major bump | High | Unlikely | Changesets enforce version bumps, CI tests |
| AR-002 | Internal dependency version mismatch across packages | Moderate | Unlikely | changesets updateInternalDependencies: patch |
| AR-003 | RFC 8288 compliance regression | High | Rare | Test suite with spec-based test cases |
