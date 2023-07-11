---
title: 2. Use markdown any decision records (MADR) 3.0.0 for decision records

date: 2023-07-11
status: accepted

deciders: 
  - tom@windyroad.com.au  
---
# 2. Use markdown any decision records (MADR) 3.0.0 for decision records

## Context and Problem Statement

We want to record the decisions made in this project.
Which format and structure should these records follow?

## Considered Options

- [MADR](https://adr.github.io/madr/) 3.0.0
- [MADR](https://adr.github.io/madr/) 2.1.2 with Log4brains patch
- [MADR](https://adr.github.io/madr/) 2.1.2 – The original Markdown Any Decision
  Records
- [Michael Nygard's template](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions) – The first incarnation of the term "ADR"
- [Sustainable Architectural Decisions](https://www.infoq.com/articles/sustainable-architectural-design-decisions) – The Y-Statements
- Other templates listed at <https://github.com/joelparkerhenderson/architecture_decision_record>
- Formless – No conventions for file format and structure

## Decision Outcome

Chosen option: "MADR 3.0.0", because

- Implicit assumptions should be made explicit.
  Design documentation is important for helping people to understand the
  decisions later on.
  See also [A rational design process: How and why to fake it](https://doi.org/10.1109/TSE.1986.6312940).
- The MADR format is lean and fits our development style.
- The MADR structure is comprehensible and facilitates usage & maintenance.
- The MADR project is vivid.
- Version 3.0.0 is the latest one available when starting to document ADRs.

## More Information

- [MADR 3.0.0 Template](https://github.com/adr/madr/blob/3.0.0/docs/decisions/adr-template.md)
