# @windyroad/eslint-config

This package provides a shareable configurations for:

- [ESLint](https://eslint.org/), which is a wrapper around [ESLint](https://eslint.org/), and
- [XO](https://github.com/xojs/xo), which is a wrapper around [ESLint](https://eslint.org/), and
- [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)

It provides a consistent and opinionated set of rules for JavaScript and TypeScript projects.

## Installation

To use this configuration in your project, you can install it via npm:

```sh
npm install --save-dev @windyroad/eslint-config
```

## Usage

### XO

To use this configuration in your project, you can add it to your `package.json` file:

```json
{
  "xo": "@windyroad/eslint-config/xo-config.cjs"
}
```

Alternatively, you can create an `.xo-config.js` file in the root of your project and export the configuration:

```javascript
'use strict';
const config = require("@windyroad/eslint-config/xo-config.cjs")
module.exports = config
```

#### Extending

You can also extend the shared configuration by creating an `.xo-config.js` file in the root of
your project and export the configuration as follows:

```javascript
'use strict';
const config = require("@windyroad/eslint-config/xo-config.cjs")
module.exports = {
  ...config
  extends: ["@windyroad", 'some-other-shareable-configuration']
}
```

### ESLint

Add ESLint config to your `package.json`:

```json
 "eslintConfig": {
  "extends": [
   "@windyroad",
  ]
 }
```

Or to .eslintrc:

```json
{
 "extends": [
  "@windyroad",
 ]
}
```

### markdownlint-cli2

If you're using [markdownlint-cli2]((https://github.com/DavidAnson/markdownlint-cli2)), you can
also use the shared configuration provided by this package. To use it, create a
`.markdownlint-cli2.cjs` file in the root of your project and export the configuration:

```javascript
'use strict';
const config = require("@windyroad/eslint-config/markdownlint-cli2.cjs")
module.exports = config
```

## Configuration

This configuration extends the
[recommended TypeScript flavour error configuration](https://github.com/xojs/eslint-config-xo-typescript/blob/main/index.js)
from the [eslint-config-xo-typescript](https://github.com/xojs/eslint-config-xo-typescript)
package. It also includes the following plugins:

- [eslint-plugin-no-secrets](https://github.com/nickdeis/eslint-plugin-no-secrets)
- [eslint-plugin-jsdoc](https://github.com/gajus/eslint-plugin-jsdoc)
- [eslint-plugin-jsonc](https://github.com/zigomir/eslint-plugin-jsonc)

The configuration also includes the following rules:

- `no-secrets/no-secrets`: Enforces the use of `detect-secrets` to prevent secrets from being committed to version control.
- `jsdoc/no-undefined-types`: Disables the requirement to define types for JSDoc comments.
- `jsdoc/require-param-type`: Disables the requirement to define types for JSDoc parameters.
- `jsdoc/require-returns-type`: Disables the requirement to define a return type for JSDoc comments.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](../../CONTRIBUTING.md) for more information.

## License

`@windyroad/eslint-config` is lovingly licensed under the [MIT License](../../LICENSE). ❤️
