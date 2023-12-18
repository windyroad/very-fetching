const base = require('./src/eslint-config.cjs');
/**
 * @typedef {import('eslint').Linter.Config & { prettier?: boolean, extensions?: string[] }} ESLintConfig
 */

/**
 * @type {ESLintConfig}
 */
const config = {
	...base,
	extensions: ['ts', 'js', 'cjs', 'mjs', 'json'],
	prettier: true,
};

module.exports = config;
