module.exports = {
    prettier: true,
    rules: {
      "import/extensions": [
        "warn",
        "never"
      ],
      "n/file-extension-in-import": [
        "error",
        "never",
        {
          ".config": "always"
        }
      ],
      "capitalized-comments": "off",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": "property",
          "filter": {
            "regex": "^\\d+$",
            "match": true
          },
          "format": null,
        },
        {
          "selector": "property",
          "format": [
            "camelCase",
            "PascalCase",
            "UPPER_CASE"
          ],
          "leadingUnderscore": "allow",
          "trailingUnderscore": "allow"
        },
        {
          "selector": "variable",
          "format": [
            "camelCase",
            "UPPER_CASE",
            "PascalCase"
          ],
          "leadingUnderscore": "allow",
          "trailingUnderscore": "allow"
        },
        {
          "selector": "typeLike",
          "format": [
            "PascalCase"
          ]
        },
        {
          "selector": "default",
          "format": [
            "camelCase",
            "PascalCase"
          ],
          "leadingUnderscore": "allow",
          "trailingUnderscore": "allow"
        }
      ],
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off"
    }
  }