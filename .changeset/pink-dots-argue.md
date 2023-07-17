---
"@windyroad/adapt-fetch-inputs": major
---

`adaptFetchInputs` has been updated to use the new `wrapFetch` function, which now
defaults to wrapping `globalThis.fetch`. Additionally, the input arguments have been reordered
so that `fetchImpl` is now an optional parameter. This change simplifies the function signature
and makes it easier to use `adaptFetchInputs` with the default `fetch` implementation.
