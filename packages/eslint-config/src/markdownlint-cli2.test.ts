import {test} from 'vitest';
import {lint} from 'markdownlint/promise';
import config from '../markdownlint-cli2.cjs';

test('markdownlint should pass with valid markdown', async ({expect}) => {
	const result = await lint({
		strings: {
			valid: '# Valid Markdown\n\nThis is a paragraph.',
		},
		config,
	});

	expect(result.valid).toHaveLength(1);
	expect(result.invalid).toBeUndefined();
});

test('markdownlint should fail with invalid markdown', async ({expect}) => {
	const result = await lint({
		strings: {
			invalid:
				'# Invalid Markdown\n\nThis is a paragraph that is too long. '.repeat(
					100,
				),
		},
		config,
	});

	expect(result.valid).toBeUndefined();
	expect(result.invalid.length).toBeGreaterThan(1);
});
