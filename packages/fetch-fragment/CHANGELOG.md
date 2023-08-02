# @windyroad/fetch-link

## 1.1.0

### Minor Changes

- 72a9b65: Switched underlying JSON Pointer implementation from json-pointer to json-ptr due to it's better performance benchmarks

## 2.0.0

### Major Changes

- cae9a6a: `glowUpFetchWithLinks` has been updated to use the new underlying `wrapFetch` function, which
  now defaults to wrapping `globalThis.fetch`, and `fetchImpl` is now an optional parameter.
  This change simplifies the function signature and makes it easier to use `glowUpFetchWithLinks`
  with the default `fetch` implementation.

  `fetchLinks` has been updated to use the new `glowUpFetchWithLinks`, allowing `fetchLinks` to
  work with libraries that manipulate `globalThis.fetch`, such as [`msw`](https://mswjs.io/).

### Patch Changes

- Updated dependencies [80163cb]
- Updated dependencies [65efee3]
- Updated dependencies [6dadf99]
  - @windyroad/decorate-fetch-response@2.0.0
  - @windyroad/wrap-fetch@2.0.0
  - @windyroad/adapt-fetch-inputs@2.0.0

## 1.0.0

### Major Changes

- c4fadec: Initial release
