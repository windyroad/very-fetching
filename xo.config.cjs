'use strict';

const jsdocPlugin = require('eslint-plugin-jsdoc');
const noSecretsPlugin = require('eslint-plugin-no-secrets');
const jsonPlugin = require('eslint-plugin-json');
const turboPlugin = require('eslint-plugin-turbo');

module.exports = [
	{prettier: true},
	{
		plugins: {
			'no-secrets': noSecretsPlugin,
			jsdoc: jsdocPlugin,
			json: jsonPlugin,
			turbo: turboPlugin,
		},
		rules: {
			...jsdocPlugin.configs['flat/recommended-typescript-flavor-error'].rules,
			...turboPlugin.configs['flat/recommended'].rules,
			'no-secrets/no-secrets': ['error', {ignoreContent: '^glowUp'}],
			'jsdoc/no-undefined-types': 'off',
			'jsdoc/require-param-type': 'off',
			'jsdoc/require-returns-type': 'off',
			// Disabled: this codebase intentionally uses `any` for generic fetch wrappers
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/ban-types': 'off',
			'@typescript-eslint/no-restricted-types': 'off',
			'@typescript-eslint/switch-exhaustiveness-check': 'off',
			'import-x/no-extraneous-dependencies': [
				'error',
				{
					devDependencies: [
						'**/*.bench.ts',
						'**/*.test.ts',
						'**/test/**',
						'**/build-tools/**',
						'src/build/**',
						'xo.config.cjs',
						'**/xo.config.cjs',
						'vite.config.ts',
						'vite.config.*.ts',
						'vitest.workspace.ts',
					],
					optionalDependencies: false,
					peerDependencies: true,
				},
			],
			'unicorn/prevent-abbreviations': [
				'error',
				{
					replacements: {
						cmd: {command: true},
						ctx: {context: true},
						errCb: {handleError: true},
					},
				},
			],
		},
	},
];
