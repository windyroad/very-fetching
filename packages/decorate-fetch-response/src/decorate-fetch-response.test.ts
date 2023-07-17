import fc from 'fast-check';
import {describe, test, vi} from 'vitest';
import {decorateFetchResponse} from './decorate-fetch-response.js';

describe('decorateFetch', () => {
	test('returns an ExtendedResponse object', () => {
		fc.asyncProperty(fc.object(), async (stuff) => {
			const decorator = (response: Response) => {
				return Object.assign(response, stuff);
			};

			const fetchImpl = async (
				input: RequestInfo | URL,
				init?: RequestInit | undefined,
			): Promise<Response> => {
				return new Response();
			};

			const decoratedFetch = decorateFetchResponse(decorator, fetchImpl);
			return decoratedFetch('https://example.com').then((result) => {
				return (
					typeof result === 'object' &&
					result !== null &&
					!Array.isArray(result) &&
					'status' in result &&
					Object.keys(stuff).every((key) => result[key] === stuff[key])
				);
			});
		});
	});

	test('adds custom header to response', async ({expect}) => {
		const fetchImpl = vi.fn(
			async (...args: Parameters<typeof fetch>) => new Response(),
		);
		const fetchWithCustomHeader = decorateFetchResponse(async (response) => {
			response.headers.set('X-Custom-Header', 'custom-value');
			return response;
		}, fetchImpl);

		const response = await fetchWithCustomHeader('https://example.com');
		expect(response.headers.get('X-Custom-Header')).toBe('custom-value');
	});

	test('replaces response body with custom string', async ({expect}) => {
		const fetchImpl = vi.fn(
			async (...args: Parameters<typeof fetch>) => new Response(),
		);
		const fetchWithCustomBody = decorateFetchResponse(async (response) => {
			const body = await response.text();
			return new Response('custom-body', {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			});
		}, fetchImpl);

		const response = await fetchWithCustomBody('https://example.com');
		const body = await response.text();
		expect(body).toBe('custom-body');
	});

	test('handles 404 error and returns custom error message', async ({
		expect,
	}) => {
		const fetchImpl = vi.fn(
			async (...args: Parameters<typeof fetch>) =>
				new Response('error', {
					status: 404,
					statusText: 'Not Found',
				}),
		);
		const fetchWithCustomError = decorateFetchResponse(async (response) => {
			if (response.status === 404) {
				return new Response('custom-error', {
					status: 404,
					statusText: 'Not Found',
				});
			}

			return response;
		}, fetchImpl);

		const response = await fetchWithCustomError(
			'https://example.com/not-found',
		);
		const body = await response.text();
		expect(response.status).toBe(404);
		expect(body).toBe('custom-error');
	});
});
