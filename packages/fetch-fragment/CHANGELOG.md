# @windyroad/fetch-link

## 2.2.0

### Minor Changes

- 5e95863: Added [RFC8288](https://datatracker.ietf.org/doc/html/rfc8288) Links support for the
  fantastic [ofetch](https://github.com/unjs/ofetch) library

### Patch Changes

- Updated dependencies [5e95863]
  - @windyroad/decorate-fetch-response@3.1.0
  - @windyroad/wrap-fetch@3.1.0

## 2.1.1

### Patch Changes

- 7faa107: build(deps-dev): bump eslint-plugin-jsdoc from 46.5.0 to 46.8.2
  build(deps-dev): bump vitest from 0.33.0 to 0.34.6
- Updated dependencies [7faa107]
  - @windyroad/decorate-fetch-response@3.0.2
  - @windyroad/link-header@1.0.1
  - @windyroad/wrap-fetch@3.0.2

## 2.1.0

### Minor Changes

- e7b3f4b: Additional `getUrlFragment` utility function is exported

## 2.0.4

### Patch Changes

- ce5a4e8: fixed issues handling relative urls when the response.url is undefined or not a valid URL.

## 2.0.3

### Patch Changes

- 8c9d160: Fixed error handling links with relative URLs

## 2.0.2

### Patch Changes

- 57fca4d: Created `@windyroad/link-header`, a browser compatible Typescript fork of [HTTP Link Header], to allow
  `@windyroad/fetch-link` and `@windyroad/fetch-fragment` to be used in browsers.

  A huge shout-out to the team behind the [HTTP Link Header]. The comprehensive implementation and set
  of tests, made porting it to Typescript a breeze.

  [HTTP Link Header]: https://github.com/jhermsmeier/node-http-link-header

- Updated dependencies [57fca4d]
  - @windyroad/link-header@1.0.0

## 2.0.1

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
  - @windyroad/decorate-fetch-response@3.0.1
  - @windyroad/wrap-fetch@3.0.1

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

## 1.0.0

### Major Changes

- c4fadec: Initial release
