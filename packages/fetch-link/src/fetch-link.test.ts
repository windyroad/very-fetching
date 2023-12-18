import {test, beforeAll, afterAll, describe} from 'vitest';
import {setupServer} from 'msw/node';
import {rest} from 'msw';
import {isNode} from 'is-where';
import {type Link} from '@windyroad/link-header';
import {fetchLink} from './fetch-link.js';

describe.runIf(isNode())('fetchLink', () => {
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
					'<https://jsonplaceholder.typicode.com/posts/1>; rel="item", <https://jsonplaceholder.typicode.com/posts/2>; rel="item", <https://jsonplaceholder.typicode.com/posts>; rel="self"';
				return response(
					context.status(200),
					context.json([{id: 1, title: 'foo', author: 'John Doe'}]),
					context.set('Link', linkHeader),
				);
			},
		),
		rest.get(
			'https://jsonplaceholder.typicode.com/posts/1',
			async (request, response, context) => {
				const linkHeader =
					'<https://jsonplaceholder.typicode.com/posts/1>; rel="self", <https://jsonplaceholder.typicode.com/posts>; rel="collection";';
				return response(
					context.status(200),
					context.json([{id: 1, title: 'foo', author: 'John Doe'}]),
					context.set('Link', linkHeader),
				);
			},
		),
		rest.get('https://examples.com', async (request, response, context) => {
			const linkHeader = '</related>; rel="related"; type="text/html"';
			return response(
				context.status(200),
				context.text('Example Domain'),
				context.set('Link', linkHeader),
			);
		}),
		rest.get(
			'https://examples.com/related',
			async (request, response, context) => {
				return response(context.status(200), context.text('Related Page'));
			},
		),
		rest.get(
			'http://127.0.0.1:7777/api/tom',
			async (request, response, context) => {
				// eslint-disable-next-line no-secrets/no-secrets
				const linkHeader = `</api/tom>; rel=self, </api/tom>; rel="https://i-spent.io/rels/clear-events"; method=DELETE, </api/tom>; rel="https://i-spent.io/rels/add-event"; method=POST; params*=UTF-8'en'%7B%22event%22%3A%7B%7D%7D; accept*=UTF-8'en'application%2Fjson`;
				return response(
					context.status(200),
					context.json({
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

	test('fetchLink should fetch a resource using a URL string', async ({
		expect,
	}) => {
		const response = await fetchLink('https://example.com');
		const data = await response.text();
		expect(data).toContain('Example Domain');
	});

	test('fetchLink should fetch a resource using a Link object', async ({
		expect,
	}) => {
		const link = {
			uri: 'https://jsonplaceholder.typicode.com/posts',
			type: 'application/json',
			rel: 'collection',
			hreflang: 'en',
			method: 'GET',
		};
		const response = await fetchLink(link);
		const data = (await response.json()) as unknown;
		expect(data).toHaveLength(1);
		expect((data as any)[0]).toEqual({
			author: 'John Doe',
			id: 1,
			title: 'foo',
		});
	});

	test('fetchLink should fetch a resource using a Request object', async ({
		expect,
	}) => {
		const request = new Request('https://jsonplaceholder.typicode.com/posts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({title: 'foo', body: 'bar', userId: 1}),
		});
		const response = await fetchLink(request);
		const data = (await response.json()) as unknown;
		expect(typeof data === 'object').toBeTruthy();
		expect((data as Record<string, unknown>).id).toBe(101);
	});

	test('fetchLink should handle invalid input', async ({expect}) => {
		await expect(fetchLink({} as unknown as Link)).rejects.toThrow();
	});

	test('links method filters links by rel', async ({expect}) => {
		const response = await fetchLink('https://example.com');
		expect(response.links('related')).toEqual([
			{uri: 'https://example.com/related', rel: 'related', type: 'text/html'},
		]);
		expect(response.links('other')).toEqual([
			{uri: 'https://example.com/other', rel: 'other', type: 'text/plain'},
		]);
		expect(response.links('unrelated')).toEqual([]);
	});

	test('links method filters links by multiple properties', async ({
		expect,
	}) => {
		const response = await fetchLink('https://example.com');
		expect(response.links({rel: 'related', type: 'text/html'})).toEqual([
			{
				uri: 'https://example.com/related',
				rel: 'related',
				type: 'text/html',
			},
		]);
		expect(response.links({rel: 'related', type: 'text/xml'})).toEqual([]);
	});

	test('fetchLink should follow links to related resources', async ({
		expect,
	}) => {
		// Fetch the posts collection
		const collectionResponse = await fetchLink(
			'https://jsonplaceholder.typicode.com/posts',
		);
		const linksToItems = collectionResponse.links('item');
		expect(linksToItems).toBeDefined();
		expect(linksToItems).toHaveLength(2);
		const linkToItem = linksToItems[0];
		// Fetch the item using the item link
		const itemResponse = await fetchLink(linksToItems[0]);
		const linksToCollections = itemResponse.links('collection');
		expect(linksToCollections).toBeDefined();
		expect(linksToCollections).toHaveLength(1);

		// Fetch the collection using the collection link from the item
		const collectionResponse2 = await fetchLink(linksToCollections[0]);
		const collectionLinks2 = collectionResponse2.links('self');
		expect(collectionResponse2).toBeDefined();

		// Verify that the collection link in the item links is the same as the original collection link
		expect(collectionResponse2.links('self')).toEqual(
			collectionResponse.links('self'),
		);
	});

	test('fetchLink should resolve relative URLs in link response headers', async ({
		expect,
	}) => {
		const response = await fetchLink('https://examples.com');
		const data = await response.text();
		expect(data).toContain('Example Domain');

		const relatedLink = response.links('related')[0];
		expect(relatedLink).toHaveProperty('uri', 'https://examples.com/related');
		const relatedResponse = await fetchLink(relatedLink);
		const relatedData = await relatedResponse.text();
		expect(relatedData).toContain('Related Page');
	});

	test('should fetch tom', async ({expect}) => {
		const response = await fetchLink(`http://127.0.0.1:7777/api/tom`);
		expect(response.status).toEqual(200);
	});
});
