---
# Based on https://raw.githubusercontent.com/adr/madr/3.0.0/docs/decisions/adr-template.md
title: 5. use turbo-repo for pipelines
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
# 5. use turbo-repo for pipelines

## Context and Problem Statement

Pipelines need to be defined for CI/CD

<!-- This is an optional element. Feel free to remove it. -->
## Decision Drivers

* <acronym title="Don't Repeat Yourself">DRY</acronym>
* Ease of testing

## Considered Options

* [GitHub Actions](https://docs.github.com/en/actions)
* [turbo-repo pipelines](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)

## Decision Outcome

Chosen option: "turbo-repo pipelines", because

* easy to test locally
* turbo optimises the task execution order
  
### Consequences

* It doesn't allow scaling across multiple jobs. We may need to revisit this decision later.
