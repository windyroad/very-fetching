# @windyroad/fetch-link

## 2.0.0

### Major Changes

- d85098a: BREAKING CHANGE: We have had to modify the the template parameters for `wrapFetch`,
  `decorateFetchResponse`, `adaptFetchInputs`, `addFragmentSupportToFetch`, `fetchFragment`
  and `fetchLink`, replacing the `FetchImpl` parameter with and `Arguments` and `ResponseType`
  parameter. Originally the intention was to try and leverage Typescript's
  type inference and have it figure out the types based on the passed in fetch implementation,
  but we couldn't figure out how to make it work properly and we were getting lots of type
  errors. Replacing the `FetchImpl` parameter with the `Arguments` and `ResponseType` parameters solve those errors.

  `fetchLink` will now check if the link has a `fragment` and use that to return a fragment
  response instead of fetching the resource and getting the fragment from it. For iterating
  over items in a collection, this is orders of magnitude faster.

### Minor Changes

- 6169097: `FragmentResponse` now includes a reference to the related response, in an optional
  `parent` property, which can be used to access other fragments in the response

### Patch Changes

- Updated dependencies [d85098a]
  - @windyroad/decorate-fetch-response@3.0.0
  - @windyroad/wrap-fetch@3.0.0

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
