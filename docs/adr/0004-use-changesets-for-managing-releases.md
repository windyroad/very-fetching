---
# Based on https://raw.githubusercontent.com/adr/madr/3.0.0/docs/decisions/adr-template.md
title: 4. Use changesets for managing releases
status: proposed # { proposed | rejected | accepted | deprecated | …
              #   | superseded by [ADR-0005](0005-example.md) }
date: 2023-07-11
deciders: # {list of people who made the decision}
    - tom@windyroad.com.au
# consulted: { list everyone whose opinions are sought (typically subject-matter experts); and with
#              whom there is a two-way communication}
# informed: { list everyone who is kept up-to-date on progress; and with whom there is a one-way
#             communication}
---
# 4. Use changesets for managing releases

## Context and Problem Statement

In this monorepo, how do we manage releases

<!-- This is an optional element. Feel free to remove it. -->
## Decision Drivers

* The release process should be automated and support Continuous Delivery pipelines

## Considered Options

* [semantic-release-monorepo](https://www.npmjs.com/package/semantic-release-monorepo)
* [Changesets](https://github.com/changesets/changesets)

## Decision Outcome

Chosen option: "Changesets", because

* semantic-release-monorepo doesn't correctly detecting need to release new package
* semantic-release forces the release process (commit messages, format, etc contributors
