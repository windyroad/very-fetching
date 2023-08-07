# @windyroad/adapt-fetch-inputs

## 3.0.0

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

### Patch Changes

- Updated dependencies [d85098a]
  - @windyroad/wrap-fetch@3.0.0

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
