import {test} from 'vitest';

test('xo-config loads correctly', ({expect}) => {
	// Validate the xo config CJS module loads without errors
	// Full lint validation is done by CI via `npm run ci:lint`
	// eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module
	const config = require('../../../xo.config.cjs') as unknown[];
	expect(Array.isArray(config)).toBe(true);
	expect(config.length).toBeGreaterThanOrEqual(2);

	const rulesItem = config.find(
		(item) => typeof item === 'object' && item !== null && 'rules' in item,
	) as {rules: Record<string, unknown>} | undefined;
	expect(rulesItem).toBeDefined();
	expect(rulesItem!.rules['no-secrets/no-secrets']).toBeDefined();
	expect(rulesItem!.rules['jsdoc/no-undefined-types']).toBe('off');
	expect(rulesItem!.rules['unicorn/prevent-abbreviations']).toBeDefined();
});
