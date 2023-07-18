# @windyroad/adapt-fetch-inputs

## 2.0.0

### Major Changes

- 6dadf99: `adaptFetchInputs` has been updated to use the new `wrapFetch` function, which now
  defaults to wrapping `globalThis.fetch`. Additionally, the input arguments have been reordered
  so that `fetchImpl` is now an optional parameter. This change simplifies the function signature
  and makes it easier to use `adaptFetchInputs` with the default `fetch` implementation.

### Patch Changes

- Updated dependencies [65efee3]
  - @windyroad/wrap-fetch@2.0.0

## 1.0.0

### Major Changes

- 854fa81: Initial @windyroad/adapt-fetch-inputs release

## 1.0.1

### Patch Changes

- Initial release of adapt-fetch-inputs
