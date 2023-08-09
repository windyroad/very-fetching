# @windyroad/decorate-fetch-response

## 3.0.1

### Patch Changes

- 599b478: Our build was producing invalid JS, as relative imports were missing file extensions.
  See [Compiled JavaScript import is missing file extension #40878](https://github.com/microsoft/TypeScript/issues/40878)
  and ["module": "node16" should support extension rewriting #49083](https://github.com/microsoft/TypeScript/issues/49083#issuecomment-1435399267)
  for details about this issue.

  The xo-config for the Windy Road code style has been updated to check for extensions. This
  will occasionally lead to false positives for imports like
  `import {setupServer} from 'msw/node'`. These false positives can be disabled with an inline
  eslint rule. e.g. `// eslint-disable-next-line n/file-extension-in-import`

- Updated dependencies [599b478]
  - @windyroad/wrap-fetch@3.0.1

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

## 2.1.0

### Minor Changes

- 5580a09: Added `decorateFetchResponseUsingInputs` which allows you to decorate the fetch response
  based on the fetch inputs. For instance `@windyroad/fetch-fragment` uses the hash in the
  requested URL to return a response with a body which is just the matching fragment.

## 2.0.0

### Major Changes

- 80163cb: `decorateFetchResponse` has been updated to use the new `wrapFetch` function, which now
  defaults to wrapping `globalThis.fetch`. Additionally, the input arguments have been reordered
  so that `fetchImpl` is now an optional parameter. This change simplifies the function signature
  and makes it easier to use `decorateFetchResponse` with the default `fetch` implementation.

### Patch Changes

- Updated dependencies [65efee3]
  - @windyroad/wrap-fetch@2.0.0
