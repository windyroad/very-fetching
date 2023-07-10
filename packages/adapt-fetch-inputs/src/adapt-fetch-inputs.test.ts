import fc from 'fast-check';
import {describe, it, vi} from 'vitest';
import {adaptFetchInputs} from './adapt-fetch-inputs.js';

describe('adaptFetchInputs', () => {
	it('adds Authorization header to fetch inputs', async ({expect}) => {
		const mockFetch = vi.fn(
			async (...args: Parameters<typeof fetch>) => new Response(),
		);
		const url = 'https://example.com';
		const options = {method: 'GET'};
		const expectedInputs = [
			url,
			{method: 'GET', headers: {authorization: 'Bearer token'}},
		];

		const fetchWithAuth = adaptFetchInputs(
			mockFetch,
			(url, options): Parameters<typeof mockFetch> => {
				const token = 'token';
				const headers = options?.headers ?? {};
				return [
					url,
					{...options, headers: {...headers, authorization: `Bearer ${token}`}},
				];
			},
		);

		await fetchWithAuth(url, options);

		expect(mockFetch).toHaveBeenCalledWith(...expectedInputs);
	});

	it('modifies request body to JSON string', async ({expect}) => {
		const mockFetch = vi.fn(
			async (...args: Parameters<typeof fetch>) => new Response(),
		);
		const url = 'https://example.com';
		const originalOptions = {method: 'POST', body: {foo: 'bar'}, headers: {}};
		const expectedInputs = [
			url,
			{
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: '{"foo":"bar"}',
			},
		];

		const fetchWithJsonBody = adaptFetchInputs(
			mockFetch,
			(url, options: typeof originalOptions): Parameters<typeof mockFetch> => {
				const body = options?.body;
				const headers = options?.headers || {};
				return [
					url,
					{
						...options,
						headers: {...headers, 'Content-Type': 'application/json'},
						body: JSON.stringify(body),
					},
				];
			},
		);

		await fetchWithJsonBody(url, originalOptions);

		expect(mockFetch).toHaveBeenCalledWith(...expectedInputs);
	});
});
