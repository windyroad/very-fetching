import {test, beforeAll, afterAll} from 'vitest';
import {setupServer} from 'msw/node';
import {rest} from 'msw';
import {fetchLink} from './fetch-link.js';
import {type Link} from './link.js';

const server = setupServer(
	rest.get('https://example.com', async (request, response, ctx) => {
		return response(ctx.status(200), ctx.text('Example Domain'));
	}),
	rest.post(
		'https://jsonplaceholder.typicode.com/posts',
		async (request, response, ctx) => {
			return response(ctx.status(201), ctx.json({id: 101}));
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
	expect(data).toHaveLength(100);
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
