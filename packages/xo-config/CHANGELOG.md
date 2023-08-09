# @windyroad/xo-config

## 2.0.0

### Major Changes

- 599b478: Our build was producing invalid JS, as relative imports were missing file extensions.
  See [Compiled JavaScript import is missing file extension #40878](https://github.com/microsoft/TypeScript/issues/40878)
  and ["module": "node16" should support extension rewriting #49083](https://github.com/microsoft/TypeScript/issues/49083#issuecomment-1435399267)
  for details about this issue.

  The xo-config for the Windy Road code style has been updated to check for extensions. This
  will occasionally lead to false positives for imports like
  `import {setupServer} from 'msw/node'`. These false positives can be disabled with an inline
  eslint rule. e.g. `// eslint-disable-next-line n/file-extension-in-import`

## 1.3.1

### Patch Changes

- 6b0973b: `**/*.bench.ts` files are now treated as development files

## 1.3.0

### Minor Changes

- aecc6ee: - Improved XO configuration to use more descriptive variable names.
  - Renamed "cmd" to "command".
  - Renamed "ctx" to "context".
  - Renamed "errCb" to "handleError".

## 1.2.0

### Minor Changes

- b2ebb61: `import/no-extraneous-dependencies` rule now supports having `*.test.ts` files in the `src` directory

## 1.1.0

### Minor Changes

- af8d40b: Added shareable configuration for markdownlint
