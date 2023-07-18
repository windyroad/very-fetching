---
"@windyroad/fetch-link": major
---

`glowUpFetchWithLinks` has been updated to use the new underlying `wrapFetch` function, which
now defaults to wrapping `globalThis.fetch`, and `fetchImpl` is now an optional parameter.
This change simplifies the function signature and makes it easier to use `glowUpFetchWithLinks`
with the default `fetch` implementation.

`fetchLinks` has been updated to use the new `glowUpFetchWithLinks`, allowing `fetchLinks` to
work with libraries that manipulate `globalThis.fetch`, such as [`msw`](https://mswjs.io/).
