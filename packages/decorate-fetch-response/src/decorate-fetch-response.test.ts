import fc from 'fast-check';
import {test} from 'vitest';
import {decorateFetchResponse} from './decorate-fetch-response.js';

test('decorateFetch', () => {
	test('returns an ExtendedResponse object', () => {
		fc.asyncProperty(fc.object(), async (stuff) => {
			const decorator = (response: Response) => {
				return Object.assign(response, stuff);
			};

			const fetchImpl = (
				input: RequestInfo | URL,
				init?: RequestInit | undefined,
			) => Promise<Response>;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			const decoratedFetch = decorateFetchResponse(fetchImpl as any, decorator);
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
});
