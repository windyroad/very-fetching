import {test, beforeAll, afterAll} from 'vitest';
import {setupServer} from 'msw/node';
import {rest} from 'msw';
import {fetchLink} from './fetch-link.js';
import {type Link} from './link.js';

const server = setupServer(
	rest.get('https://example.com', async (request, response, ctx) => {
		console.log('request', request);
		const linkHeader =
			'<https://example.com/related>; rel="related"; type="text/html", <https://example.com/other>; rel="other"; type="text/plain"';
		return response(
			ctx.status(200),
			ctx.text('Example Domain'),
			ctx.set('Link', linkHeader),
		);
	}),
	rest.post(
		'https://jsonplaceholder.typicode.com/posts',
		async (request, response, ctx) => {
			const location = 'https://jsonplaceholder.typicode.com/posts/101';
			const linkHeader = `<${location}>; rel="self", <https://jsonplaceholder.typicode.com/posts>; rel="collection"`;
			return response(
				ctx.status(201),
				ctx.json({id: 101}),
				ctx.set('Link', linkHeader),
			);
		},
	),
	rest.get(
		'https://jsonplaceholder.typicode.com/posts',
		async (request, response, ctx) => {
			const linkHeader =
				'<https://jsonplaceholder.typicode.com/posts/1>; rel="item", <https://jsonplaceholder.typicode.com/posts/2>; rel="item", <https://jsonplaceholder.typicode.com/posts>; rel="self"';
			return response(
				ctx.status(200),
				ctx.json([{id: 1, title: 'foo', author: 'John Doe'}]),
				ctx.set('Link', linkHeader),
			);
		},
	),
	rest.get(
		'https://jsonplaceholder.typicode.com/posts/1',
		async (request, response, ctx) => {
			const linkHeader =
				'<https://jsonplaceholder.typicode.com/posts/1>; rel="self", <https://jsonplaceholder.typicode.com/posts>; rel="collection";';
			return response(
				ctx.status(200),
				ctx.json([{id: 1, title: 'foo', author: 'John Doe'}]),
				ctx.set('Link', linkHeader),
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

test('links method filters links by multiple properties', async ({expect}) => {
	const response = await fetchLink('https://example.com');
	console.log({header: response.headers.get('Link')});
	console.log({links: response.links()});
	expect(response.links({rel: 'related', type: 'text/html'})).toEqual([
		{
			uri: 'https://example.com/related',
			rel: 'related',
			type: 'text/html',
		},
	]);
	expect(response.links({rel: 'related', type: 'text/xml'})).toEqual([]);
});

test('fetchLink should follow links to related resources', async ({expect}) => {
	// Fetch the posts collection
	const collectionResponse = await fetchLink(
		'https://jsonplaceholder.typicode.com/posts',
	);
	const linksToItems = collectionResponse.links('item');
	expect(linksToItems).toBeDefined();
	expect(linksToItems).toHaveLength(2);

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

test('fetchLink should follow links to related resources', async ({expect}) => {
	// Fetch the collection using a URL
	const collectionResponse = await fetchLink(
		'https://jsonplaceholder.typicode.com/posts',
	);
	// Fetch the first item
	const itemResponse = await fetchLink(collectionResponse.links('item')[0]);
	// Fetch the collection from the item
	const collectionResponse2 = await fetchLink(
		itemResponse.links('collection')[0],
	);
});
