# @windyroad/wrap-fetch

## 2.0.0

### Major Changes

- 65efee3: `wrapFetch` has been updated to default to wrapping `globalThis.fetch`. Additionally, the input
  arguments have been swapped so that `fetchImpl` is now an optional parameter. This change makes
  it easier to use `wrapFetch` with the default `fetch` implementation, and simplifies the
  function signature by making `fetchImpl` optional.
