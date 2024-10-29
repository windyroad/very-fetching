const jsdoc = require('eslint-plugin-jsdoc');
/**
 * @type {ESLintConfig}
 */
const config = {
	...jsdoc.configs['recommended-typescript-flavor-error'],
	plugins: ['no-secrets', 'jsdoc'],
	extends: ['plugin:json/recommended-legacy', 'turbo'],
	rules: {
		'no-secrets/no-secrets': ['error', {ignoreContent: '^glowUp'}],
		'jsdoc/no-undefined-types': 'off',
		...jsdoc.configs['recommended-typescript-flavor-error'].rules,
		'jsdoc/require-param-type': 'off',
		'jsdoc/require-returns-type': 'off',
		'import/no-extraneous-dependencies': [
			'error',
			{
				devDependencies: [
					'**/*.bench.ts',
					'**/*.test.ts',
					'**/test/**',
					'**/build-tools/**',
					'src/build/**',
				],
				optionalDependencies: false,
				peerDependencies: true,
			},
		],
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
	},
};

module.exports = config;
