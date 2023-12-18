import {test, vi, beforeAll, afterAll, beforeEach, describe} from 'vitest';
import fc from 'fast-check';
import {setupServer} from 'msw/node';
import {rest} from 'msw';
import {type FragmentResponse, MockResponse} from '@windyroad/fetch-fragment';
import {isNode} from 'is-where';
import {glowUpFetchWithLinks} from './glow-up-fetch-with-links.js';
import {type LinkedResponse} from './linked-response.js';

describe('glowUpFetchWithLinks', () => {
	describe.runIf(isNode())('fetch', () => {
		const server = setupServer(
			rest.get('https://example.com', async (request, response, context) => {
				const linkHeader =
					'<https://example.com/related>; rel="related"; type="text/html", <https://example.com/other>; rel="other"; type="text/plain"';
				return response(
					context.status(200),
					context.text('Example Domain'),
					context.set('Link', linkHeader),
				);
			}),
			rest.post(
				'https://jsonplaceholder.typicode.com/posts',
				async (request, response, context) => {
					const location = 'https://jsonplaceholder.typicode.com/posts/101';
					const linkHeader = `<${location}>; rel="self", <https://jsonplaceholder.typicode.com/posts>; rel="collection"`;
					return response(
						context.status(201),
						context.json({id: 101}),
						context.set('Link', linkHeader),
					);
				},
			),
			rest.get(
				'https://jsonplaceholder.typicode.com/posts',
				async (request, response, context) => {
					const linkHeader =
						'<https://jsonplaceholder.typicode.com/posts/1>; rel="item", <https://jsonplaceholder.typicode.com/posts>; rel="collection"';
					return response(
						context.status(200),
						context.json([{id: 1, title: 'foo', author: 'John Doe'}]),
						context.set('Link', linkHeader),
					);
				},
			),
		);

		beforeAll(async () => {
			server.listen();
		});

		afterAll(async () => {
			server.close();
		});

		test('links method filters links by rel', async ({expect}) => {
			const fetchWithLink = glowUpFetchWithLinks(fetch);
			const response = await fetchWithLink('https://example.com');
			expect(response.links('related')).toEqual([
				{uri: 'https://example.com/related', rel: 'related', type: 'text/html'},
			]);
			expect(response.links('other')).toEqual([
				{uri: 'https://example.com/other', rel: 'other', type: 'text/plain'},
			]);
			expect(response.links('unrelated')).toEqual([]);
		});
	});

	test('glowUpFetchWithLinks adds links method to response', async ({
		expect,
	}) => {
		const fetchImpl = async (...arguments_: Parameters<typeof fetch>) => {
			const rval = new MockResponse(undefined, {
				headers: {link: '<https://example.com>; rel="resource"'},
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				url: arguments_[0].toString(),
			});
			return rval;
		};

		const fetchWithLinks = glowUpFetchWithLinks(fetchImpl);
		const response = await fetchWithLinks('https://example.com');
		expect(response.links()).toEqual([
			{uri: 'https://example.com/', rel: 'resource'},
		]);
	});

	test('glowUpFetchWithLinks handles multiple link headers', async ({
		expect,
	}) => {
		const fetchImpl = async (...arguments_: Parameters<typeof fetch>) =>
			new MockResponse(undefined, {
				headers: {
					link: '<https://example.com>; rel="resource"',
					'link-template':
						'<https://example.com/{id}>; rel="resource-template"',
				},
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				url: arguments_[0].toString(),
			});
		const fetchWithLinks = glowUpFetchWithLinks(fetchImpl);
		const response = await fetchWithLinks('https://example.com');
		expect(response.links()).toEqual([
			{uri: 'https://example.com/', rel: 'resource'},
			{uri: 'https://example.com/{id}', rel: 'resource-template'},
		]);
	});

	test('glowUpFetchWithLinks handles empty link header', async ({expect}) => {
		const fetchImpl = async (...arguments_: Parameters<typeof fetch>) =>
			new MockResponse(undefined, {
				headers: {link: ''},
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				url: arguments_[0].toString(),
			});
		const fetchWithLinks = glowUpFetchWithLinks(fetchImpl);
		const response = await fetchWithLinks('https://example.com');
		expect(response.links()).toEqual([]);
	});

	test('glowUpFetchWithLinks passes through fetch errors', async ({expect}) => {
		const fetchImpl = async (...arguments_: Parameters<typeof fetch>) => {
			throw new Error('fetch error');
		};

		const fetchWithLinks = glowUpFetchWithLinks(fetchImpl);
		await expect(fetchWithLinks('https://example.com')).rejects.toThrow(
			'fetch error',
		);
	});

	test('glowUpFetchWithLinks passes through multiple fetch arguments', async ({
		expect,
	}) => {
		const mockFetch = vi.fn(
			async (...arguments_: Parameters<typeof fetch>) =>
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				new MockResponse(undefined, {url: arguments_[0].toString()}),
		);
		const decoratedFetch = glowUpFetchWithLinks(mockFetch);
		await decoratedFetch('https://example.com', {
			method: 'POST',
		});
		expect(mockFetch).toBeCalledWith('https://example.com', {
			method: 'POST',
		});
	});

	test('glowUpFetchWithLinks passes through single fetch argument', async ({
		expect,
	}) => {
		const mockFetch = vi.fn(
			async (...arguments_: Parameters<typeof fetch>) =>
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				new MockResponse(undefined, {url: arguments_[0].toString()}),
		);
		const decoratedFetch = glowUpFetchWithLinks(mockFetch);
		await decoratedFetch('https://example.com');
		expect(mockFetch).toBeCalledWith('https://example.com');
	});

	test('glowUpFetchWithLinks follows RFC8288 links', async ({expect}) => {
		const fetchImpl = async (...arguments_: Parameters<typeof fetch>) => {
			if (arguments_[0] === 'https://example.com') {
				return new MockResponse(undefined, {
					headers: {
						link: '<https://example.com/related>; rel="related"',
					},
					url: arguments_[0].toString(),
				});
			}

			if (arguments_[0] === 'https://example.com/related') {
				return new MockResponse(undefined, {
					headers: {
						link: '<https://example.com/related/2>; rel="related"',
					},
					url: arguments_[0],
				});
			}

			if (arguments_[0] === 'https://example.com/related/2') {
				return new MockResponse('hello, world!', {
					headers: {
						'content-type': 'text/plain',
					},
					url: arguments_[0],
				});
			}

			throw new Error(`unexpected input`);
		};

		const fetchWithLinks = glowUpFetchWithLinks(fetchImpl);
		const response1 = await fetchWithLinks('https://example.com');
		expect(response1.links()).toEqual([
			{uri: 'https://example.com/related', rel: 'related'},
		]);
		const response2 = await fetchWithLinks(response1.links()[0]);
		const response3 = await fetchWithLinks(response2.links()[0]);
		expect(await response3.text()).toEqual('hello, world!');
	});

	describe('glowUpFetchWithLinks fragments', () => {
		let mockResponseBody: any = {};
		const mockResponseHeaders = new Headers();
		const mockResponseOptions = {
			status: 200,
			statusText: 'OK',
			headers: mockResponseHeaders,
			url: 'http://example.com',
		};
		const mockFetchImpl = vi.fn(
			async (...arguments_: Parameters<typeof fetch>) => {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				const url = new URL(arguments_[0].toString());
				url.hash = '';
				return new MockResponse(
					mockResponseBody ? JSON.stringify(mockResponseBody) : undefined,
					{...mockResponseOptions, url: url.toString()},
				);
			},
		);

		beforeEach(() => {
			vi.clearAllMocks();
			mockResponseHeaders.set('Content-Type', 'application/json');
		});

		test('returns a fragment from a JSON response', async ({expect}) => {
			const mockFragment = {foo: [1, 2, 4, 'a', 'b', 'c', {bar: 'baz'}]};
			mockResponseBody = mockFragment;
			mockResponseHeaders.set('link', '<#/{key}>; rel="item"');
			const fetchFragmentImpl = glowUpFetchWithLinks(mockFetchImpl);
			const response = await fetchFragmentImpl('https://example.com#/foo');
			expect(response.status).toBe(200);
			expect(response.headers.get('Content-Type')).toBe('application/json');
			expect(response.headers.get('Content-Length')).toBe(
				String(JSON.stringify(mockFragment.foo).length),
			);
			expect(await response.text()).toBe(JSON.stringify(mockFragment.foo));
			expect(response).toHaveProperty('parent');
			const {parent} = response as FragmentResponse<Response>;
			expect(parent).toBeDefined();
			expect(parent).toHaveProperty('links');

			const links = (
				parent as LinkedResponse<FragmentResponse<Response>>
			).links();
			expect(links).toHaveLength(1);
			expect(mockFetchImpl).toHaveBeenCalledTimes(1);
		});

		test('can fetch linked fragments', async ({expect}) => {
			const json = {
				foo: [
					{id: 1, name: 'Alice'},
					{id: 2, name: 'Bob'},
				],
				bar: [
					{id: 4, name: 'Jane'},
					{id: 6, name: 'Bruce'},
				],
			};
			mockResponseBody = json;
			mockResponseHeaders.set('link', '<#/{key}/{index}>; rel="item"');
			const decoratedFetch = glowUpFetchWithLinks(mockFetchImpl);
			const response = await decoratedFetch('http://example.com');
			const links = response.links();
			expect(links).toEqual([
				{
					uri: 'http://example.com/#/foo/0',
					rel: 'item',
					fragment: {
						path: '#/foo/0',
						value: json.foo[0],
						variables: {key: 'foo', index: '0'},
					},
				},
				{
					uri: 'http://example.com/#/foo/1',
					rel: 'item',
					fragment: {
						path: '#/foo/1',
						value: json.foo[1],
						variables: {key: 'foo', index: '1'},
					},
				},
				{
					uri: 'http://example.com/#/bar/0',
					rel: 'item',
					fragment: {
						path: '#/bar/0',
						value: json.bar[0],
						variables: {key: 'bar', index: '0'},
					},
				},
				{
					uri: 'http://example.com/#/bar/1',
					rel: 'item',
					fragment: {
						path: '#/bar/1',
						value: json.bar[1],
						variables: {key: 'bar', index: '1'},
					},
				},
			]);
			const fragment = await decoratedFetch(links[2]);
			expect(await fragment.json()).toEqual(json.bar[0]);
		});
	});

	test('should fetch tom', async ({expect}) => {
		const fetchImpl = async (...arguments_: Parameters<typeof fetch>) => {
			const rval = new MockResponse(
				JSON.stringify({
					data: {
						created: '2023-08-19T21:33:28.077Z',
						updated: '2023-08-19T21:33:28.943Z',
						count: 32_768,
						eventCount: 32_767,
					},
					metaData: {
						created: '2023-08-19T21:33:28.077Z',
						updated: '2023-08-19T21:33:28.943Z',
						version: 32_768,
					},
					nextAddress: {
						stream: 'tom',
						page: {lastId: '1692480808943-12'},
						event: {index: 1},
					},
				}),
				{
					headers: {
						// eslint-disable-next-line no-secrets/no-secrets
						link: `</api/tom>; rel=self, </api/tom>; rel="https://i-spent.io/rels/clear-events"; method=DELETE, </api/tom>; rel="https://i-spent.io/rels/add-event"; method=POST; params*=UTF-8'en'%7B%22event%22%3A%7B%7D%7D; accept*=UTF-8'en'application%2Fjson`,
					},
					url: 'http://127.0.0.1:7777/api/tom',
				},
			);
			return rval;
		};

		const fetchWithLinks = glowUpFetchWithLinks(fetchImpl);
		const response = await fetchWithLinks('http://127.0.0.1:7777/api/tom`');
		expect(response.links()[0]).toEqual({
			uri: 'http://127.0.0.1:7777/api/tom',
			rel: 'self',
		});
	});
});
