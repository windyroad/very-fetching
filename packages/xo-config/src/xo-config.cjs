const jsdoc = require('eslint-plugin-jsdoc');
/**
 * @typedef {import('eslint').Linter.Config & { prettier?: boolean, extensions?: string[] }} ESLintConfig
 */

/**
 * @type {ESLintConfig}
 */
const config = {
	prettier: true,
	extensions: ['.json', '.md'],
	...jsdoc.configs['recommended-typescript-flavor-error'],
	plugins: ['no-secrets', 'jsdoc', 'jsonc'],
	extends: [
		'plugin:jsonc/recommended-with-json',
		'plugin:jsonc/recommended-with-json',
		'plugin:jsonc/prettier',
	],
	rules: {
		'no-secrets/no-secrets': 'error',
		'n/file-extension-in-import': 'off',
		'jsdoc/no-undefined-types': 'off',
		...jsdoc.configs['recommended-typescript-flavor-error'].rules,
		'jsdoc/require-param-type': 'off',
		'jsdoc/require-returns-type': 'off',
	},
	overrides: [
		{
			files: ['*.md'],
			parser: 'eslint-plugin-markdownlint/parser',
			extends: ['plugin:markdownlint/recommended'],
			rules: {
				'markdownlint/md025': 'off',
				'markdownlint/md013': [
					'error',
					{
						// eslint-disable-next-line camelcase
						line_length: 100,
					},
				],
			},
		},
	],
};

module.exports = config;
