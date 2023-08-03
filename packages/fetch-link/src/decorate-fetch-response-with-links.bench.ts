import {test, describe, vi, bench, expect} from 'vitest';
import fc from 'fast-check';
import {MockResponse} from '@windyroad/fetch-fragment';
import {JsonPointer} from 'json-ptr';
import {decorateFetchResponseWithLinks} from './decorate-fetch-response-with-links';
import {type Fragment, findMatchingFragments} from './find-matching-fragments';

describe('decorateFetchResponseWithLinks', () => {
	describe('fetching fragments can be done quickly', () => {
		const length = 4096 * 2;
		const mockResponseBody = {
			foo: Array.from({length}).map((x) => ({
				firstName: fc.string(),
				lastName: fc.string(),
			})),
		};
		const fetchImpl = vi.fn(
			async (...arguments_: Parameters<typeof fetch>) =>
				new MockResponse(JSON.stringify(mockResponseBody), {
					headers: new Headers({
						link: '<#/foo/{index}>; rel="item"',
						'Content-Type': 'application/json',
					}),
					url: 'http://example.com',
				}),
		);

		bench('iterate', async () => {
			const response = await fetchImpl('http://example.com');
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const json = await response.json();
			for (let index = 0; index < length; index++) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const item = json.foo[index];

				expect(item).toHaveProperty('firstName');
			}
		});

		bench('json-ptr', async () => {
			const response = await fetchImpl('http://example.com');
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const json = await response.json();
			for (let index = 0; index < length; index++) {
				const item = JsonPointer.get(json, `#/foo/${index}`);
				expect(item).toHaveProperty('firstName');
			}
		});

		const decoratedFetch = decorateFetchResponseWithLinks(fetchImpl);

		bench('fragment', async () => {
			const response = await decoratedFetch('http://example.com');
			const itemLinks = response.links('item');
			for (let index = 0; index < length; index++) {
				const response = itemLinks[index].fragment;
				expect(response?.value).toHaveProperty('firstName');
			}
		});
	});
});
