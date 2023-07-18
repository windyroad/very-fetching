# @windyroad/decorate-fetch-response

## 2.0.0

### Major Changes

- 80163cb: `decorateFetchResponse` has been updated to use the new `wrapFetch` function, which now
  defaults to wrapping `globalThis.fetch`. Additionally, the input arguments have been reordered
  so that `fetchImpl` is now an optional parameter. This change simplifies the function signature
  and makes it easier to use `decorateFetchResponse` with the default `fetch` implementation.

### Patch Changes

- Updated dependencies [65efee3]
  - @windyroad/wrap-fetch@2.0.0
