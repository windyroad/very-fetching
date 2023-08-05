/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {describe, it, expect} from 'vitest';
import {FragmentResponse} from './fragment-response';

describe('FragmentResponse', () => {
	describe('constructor', () => {
		it('should set the URL and JSON body properties', () => {
			const url = 'https://example.com';
			const jsonBody = {foo: 'bar'};
			const response = new FragmentResponse(jsonBody, {url});
			expect(response.url).toBe(url);
			expect(response.jsonBody).toBe(jsonBody);
		});
	});

	describe('json', () => {
		it('should return the JSON body of the response', async () => {
			const jsonBody = {foo: 'bar'};
			const response = new FragmentResponse(jsonBody);
			const result = await response.json();
			expect(result).toBe(jsonBody);
		});
	});

	describe('text', () => {
		it('should return a stringified version of the JSON body of the response', async () => {
			const jsonBody = {foo: 'bar'};
			const response = new FragmentResponse(jsonBody);
			const result = await response.text();
			expect(result).toBe(JSON.stringify(jsonBody));
		});
	});

	describe('body', () => {
		it('should return a ReadableStream of the JSON body of the response', async () => {
			const jsonBody = {foo: 'bar'};
			const response = new FragmentResponse(jsonBody);
			const result = response.body;
			expect(result).toBeInstanceOf(ReadableStream);
			expect(await streamToString(result)).toBe(JSON.stringify(jsonBody));
		});

		it('should return null if the JSON body is undefined', () => {
			const response = new FragmentResponse();
			const result = response.body;
			expect(result).toBeNull();
		});
	});
});

/**
 * Converts a ReadableStream to a string.
 * @param {ReadableStream<Uint8Array> | null} stream - The ReadableStream to convert.
 * @returns {Promise<string | undefined>} - A promise that resolves to the string representation of the ReadableStream, or `undefined` if the stream is `null`.
 */
async function streamToString(
	// eslint-disable-next-line @typescript-eslint/ban-types
	stream: ReadableStream<Uint8Array> | null,
): Promise<string | undefined> {
	if (!stream) return undefined;
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	let chunks = '';
	// eslint-disable-next-line no-constant-condition
	while (true) {
		// eslint-disable-next-line no-await-in-loop
		const {done, value} = await reader.read();
		if (done) break;
		chunks += decoder.decode(value);
	}

	return chunks;
}
