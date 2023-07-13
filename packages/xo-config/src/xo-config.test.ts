import {ESLint} from 'eslint';
import {describe, it} from 'vitest';
import config from './xo-config.cjs';

const {prettier, extensions, ...remainder} = config;

const eslint = new ESLint({
	useEslintrc: false,
	overrideConfig: remainder,
});

describe('xo-config', () => {
	it('should be a valid ESLint configuration', async ({expect}) => {
		const code = 'myVar = "23";';
		const lintResult = await eslint.lintText(code);
		expect(lintResult).toHaveProperty('length', 1);
		expect(lintResult[0].messages).toHaveProperty('length', 0);
	});

	it('secret should cause error', async ({expect}) => {
		const code =
			// eslint-disable-next-line no-secrets/no-secrets
			'A_SECRET = "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva";';
		const lintResult = await eslint.lintText(code);
		const {messages} = lintResult[0];
		expect(
			messages.filter((message) => {
				return message.ruleId === 'no-secrets/no-secrets';
			}),
		).toHaveProperty('length', 1);
		expect(messages[0]).toHaveProperty('severity', 2);
		expect(messages[0]).toHaveProperty('messageId', 'HIGH_ENTROPY');
	});

	it('ignored secret should not cause error', async ({expect}) => {
		const code =
			// eslint-disable-next-line no-secrets/no-secrets
			`// eslint-disable-next-line no-secrets/no-secrets
A_SECRET = "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva";`;
		const lintResult = await eslint.lintText(code);
		const {messages} = lintResult[0];
		expect(
			messages.filter((message) => {
				return message.ruleId === 'no-secrets/no-secrets';
			}),
		).toHaveProperty('length', 0);
	});
});
