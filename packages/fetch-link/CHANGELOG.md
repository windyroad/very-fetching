# @windyroad/fetch-link

## 2.3.0

### Minor Changes

- d336fed: Added support for automatically expanding templated fragments links. For instance if a response has
  a body

  ```json
  {
    "foo": [1, 2, 3],
    "bar": ["a", "b"]
  }
  ```

  and a `link` `<#/{key}/{index}>; rel="item"`, then the `links()` response method will return the following links.

  - `#/foo/0`
  - `#/foo/1`
  - `#/foo/2`
  - `#/bar/0`
  - `#/bar/1`

### Patch Changes

- Updated dependencies [72a9b65]
  - @windyroad/fetch-fragment@1.1.0

## 2.2.0

### Minor Changes

- 65076a8: added support for fetching json fragments using `@windyroad/fetch-fragment`

## 2.1.0

### Minor Changes

- 8ed9ffd: The `links()` method on `LinkedResponse` now supports link templates, which allow for variables
  to be replaced with values to provide a concrete URL. To achieve this, a new optional parameters
  parameter has been added to the `links()` method, which accepts a set of name-value pairs to be
  interpolated into the link templates. This enhancement provides greater flexibility and
  customization for users of the `LinkedResponse` type.
- 26256c8: `fetchLinks()` and `glowUpFetchWithLinks()` now resolves relative URLs in `link`
  response headers as per [RFC 8288, Section 3.1](https://tools.ietf.org/html/rfc8288#section-3.1)

### Patch Changes

- Updated dependencies [5580a09]
  - @windyroad/decorate-fetch-response@2.1.0

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
