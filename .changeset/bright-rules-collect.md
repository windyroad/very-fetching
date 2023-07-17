---
"@windyroad/decorate-fetch-response": major
---

`decorateFetchResponse` has been updated to use the new `wrapFetch` function, which now
defaults to wrapping `globalThis.fetch`. Additionally, the input arguments have been reordered
so that `fetchImpl` is now an optional parameter. This change simplifies the function signature
and makes it easier to use `decorateFetchResponse` with the default `fetch` implementation.
