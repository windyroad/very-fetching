---
# Based on https://raw.githubusercontent.com/adr/madr/3.0.0/docs/decisions/adr-template.md
title: 6. Use URI-templates for item links
status: accepted # { proposed | rejected | accepted | deprecated | …
              #   | superseded by [ADR-0005](0005-example.md) }
date: 2023-07-30
deciders: # {list of people who made the decision}
    - tom@windyroad.com.au
# consulted: { list everyone whose opinions are sought (typically subject-matter experts); and with
#              whom there is a two-way communication}
# informed: { list everyone who is kept up-to-date on progress; and with whom there is a one-way
#             communication}
---
# 6. Use URI-templates for item links

## Context and Problem Statement

If `item` links are like `/somehost.com/someresource/#/somejsonpath/*/foo/*/` and the items
have `self` links, then that could to be something like

```json
{
  "uri" :"/somehost.com/someresource/*/*/", 
  "anchor": "/somejsonpath/*/foo/*/"
}
```

and we won't be able to figure out with certainty what the URI is.

If instead we have `item` links like `/somehost.com/someresource/#/somejsonpath/{alpha}/foo/{bravo}`
and the items have `self` links like

```json
{ 
  "uri" :"/somehost.com/someresource/{bravo}/{alpha}/", 
  "anchor": "/somejsonpath/{alpha}/foo/{bravo}"
}
```

then we can perform template substitution to determine the correct URI

## Considered Options

* Use URI-templates
* Use JSON-pointer wildcards

## Decision Outcome

Chosen option: "Use URI-templates", because we can perform template substitution to
determine the correct URI for links anchored on the items.
