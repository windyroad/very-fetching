/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {exec} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {describe, it} from 'vitest';
import {ESLint} from 'eslint';
import xo from 'xo';
import config from './eslint-config.cjs';

// Const execAsync = promisify(exec);

// const thisFile = fileURLToPath(import.meta.url);

// const __dirname = path.join(path.dirname(thisFile), 'xo-config.cjs');

const eslint = new ESLint({
	useEslintrc: false,
	overrideConfig: {
		...config,
		extends: [...(config.extends ?? []), 'xo', 'prettier'],
	},
});

describe('xo-config', () => {
	it('should be a valid XO configuration', async ({expect}) => {
		const result = await xo.lintText('const myVar = "23";');
		expect(result.results[0].messages).toHaveLength(3);
		expect(result.results[0].messages[0].message).toContain(
			'The variable `myVar` should be named `myVariable`',
		);
		expect(result.results[0].messages[1].message).toEqual(
			"'myVar' is assigned a value but never used.",
		);
		expect(result.results[0].messages[2].message).toContain(
			'Replace `"23";` with `\'23\'',
		);
	});

	it('secret should cause error', async ({expect}) => {
		const code =
			// eslint-disable-next-line no-secrets/no-secrets
			'A_SECRET = "ZWVTjPQSdDhwRgl204Hc51YCsDriDtMIzn8B=/p9UyeX7xu6KkAGqDfm3FJ+oObLDNEva";';
		const lintResult = await xo.lintText(code);
		const {messages} = lintResult.results[0];
		const noSecretsMessages = messages.filter((message) => {
			return message.ruleId === 'no-secrets/no-secrets';
		});
		console.log({noSecretsMessages});
		expect(noSecretsMessages).toHaveProperty('length', 1);
		expect(noSecretsMessages[0]).toHaveProperty('severity', 2);
		expect(noSecretsMessages[0]).toHaveProperty('messageId', 'HIGH_ENTROPY');
	});

	it('ignored secret should not cause error', async ({expect}) => {
		const code =
			// eslint-disable-next-line no-secrets/no-secrets
			`// eslint-disable-next-line no-secrets/no-secrets
A_SECRET = "ZWVTjPQSdDhwRgl204Hc51YCsDrDitMIzn8B=/p9UyeX7xu6KkAGqDfm3FJ+oObLDNEva";`;
		const lintResult = await xo.lintText(code);
		const {messages} = lintResult.results[0];
		expect(
			messages.filter((message) => {
				return message.ruleId === 'no-secrets/no-secrets';
			}),
		).toHaveProperty('length', 0);
	});
});
