# @windyroad/eslint-config

## 3.0.1

### Patch Changes

- b944fce: build(deps-dev): bump eslint-plugin-import from 2.27.5 to 2.29.1
- ca17499: build(deps-dev): bump eslint-plugin-jsonc from 2.9.0 to 2.11.1

## 3.0.0

### Major Changes

- 5746658: The package `@windyroad/xo-config` has been renamed to `@windyroad/eslint-config`. This
  change allows for easier extension in both XO and ESLint.

  For instance, you can now extend the configuration like this:

  ```json
  {
    "extends": ["@windyroad"]
  }
  ```

## 2.0.2

### Patch Changes

- db2b939: build(deps-dev): bump eslint from 8.47.0 to 8.55.0

## 2.0.1

### Patch Changes

- 1033519: build(deps-dev): bump markdownlint from 0.29.0 to 0.31.1
- 7faa107: build(deps-dev): bump eslint-plugin-jsdoc from 46.5.0 to 46.8.2
  build(deps-dev): bump vitest from 0.33.0 to 0.34.6
- 7231435: build(deps-dev): bump markdownlint-cli2 from 0.8.1 to 0.10.0

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
