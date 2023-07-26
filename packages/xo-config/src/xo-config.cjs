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
		'plugin:import/recommended',
		'plugin:jsonc/prettier',
	],
	rules: {
		'no-secrets/no-secrets': ['error', {ignoreContent: '^glowUp'}],
		'n/file-extension-in-import': 'off',
		'jsdoc/no-undefined-types': 'off',
		...jsdoc.configs['recommended-typescript-flavor-error'].rules,
		'jsdoc/require-param-type': 'off',
		'jsdoc/require-returns-type': 'off',
		'import/no-extraneous-dependencies': [
			'error',
			{
				devDependencies: [
					'**/*.test.ts',
					'**/test/**',
					'**/build-tools/**',
					'src/build/**',
				],
				optionalDependencies: false,
				peerDependencies: true,
			},
		],
		'import/no-unresolved': 'off', // Need to find why this is failing
		'unicorn/prevent-abbreviations': [
			'error',
			{
				replacements: {
					cmd: {
						command: true,
					},
					ctx: {
						context: true,
					},
					errCb: {
						handleError: true,
					},
				},
			},
		],
		'import/extensions': ['error', 'never'],
	},
};

module.exports = config;
