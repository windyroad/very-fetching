---
"@windyroad/xo-config": major
"@windyroad/decorate-fetch-response": patch
"@windyroad/adapt-fetch-inputs": patch
"@windyroad/fetch-fragment": patch
"@windyroad/fetch-link": patch
"@windyroad/wrap-fetch": patch
---

Our build was producing invalid JS, as relative imports were missing file extensions.
See [Compiled JavaScript import is missing file extension #40878](https://github.com/microsoft/TypeScript/issues/40878)
and ["module": "node16" should support extension rewriting #49083](https://github.com/microsoft/TypeScript/issues/49083#issuecomment-1435399267)
for details about this issue.

The xo-config for the Windy Road code style has been updated to check for extensions. This
will occasionally lead to false positives for imports like
`import {setupServer} from 'msw/node'`. These false positives can be disabled with an inline
eslint rule. e.g. `// eslint-disable-next-line n/file-extension-in-import`
