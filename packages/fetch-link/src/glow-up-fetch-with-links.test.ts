import {test, vi, beforeAll, afterAll} from 'vitest';
import fc from 'fast-check';
import {setupServer} from 'msw/node';
import {rest} from 'msw';
import {glowUpFetchWithLinks} from './glow-up-fetch-with-links.js';

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

test('glowUpFetchWithLinks adds links method to response', async ({expect}) => {
	const fetchImpl = async (...arguments_: Parameters<typeof fetch>) => {
		const rval = new Response(null, {
			headers: {link: '<https://example.com>; rel="resource"'},
		});
		return rval;
	};

	const fetchWithLinks = glowUpFetchWithLinks(fetchImpl);
	const response = await fetchWithLinks('https://example.com');
	expect(response.links()).toEqual([
		{uri: 'https://example.com/', rel: 'resource'},
	]);
});

test('glowUpFetchWithLinks handles multiple link headers', async ({expect}) => {
	const fetchImpl = async (...arguments_: Parameters<typeof fetch>) =>
		new Response(null, {
			headers: {
				link: '<https://example.com>; rel="resource"',
				'link-template':
					'<https://example.com/%7Bid%7B>; rel="resource-template"',
			},
		});
	const fetchWithLinks = glowUpFetchWithLinks(fetchImpl);
	const response = await fetchWithLinks('https://example.com');
	expect(response.links()).toEqual([
		{uri: 'https://example.com/', rel: 'resource'},
		{uri: 'https://example.com/%7Bid%7B', rel: 'resource-template'},
	]);
});

test('glowUpFetchWithLinks handles empty link header', async ({expect}) => {
	const fetchImpl = async (...arguments_: Parameters<typeof fetch>) =>
		new Response(null, {headers: {link: ''}});
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
		async (...arguments_: Parameters<typeof fetch>) => new Response(),
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
		async (...arguments_: Parameters<typeof fetch>) => new Response(),
	);
	const decoratedFetch = glowUpFetchWithLinks(mockFetch);
	await decoratedFetch('https://example.com');
	expect(mockFetch).toBeCalledWith('https://example.com');
});

test('glowUpFetchWithLinks follows RFC8288 links', async ({expect}) => {
	const fetchImpl = async (...arguments_: Parameters<typeof fetch>) => {
		if (arguments_[0] === 'https://example.com') {
			return new Response(null, {
				headers: {
					link: '<https://example.com/related>; rel="related"',
				},
			});
		}

		if (arguments_[0] === 'https://example.com/related') {
			return new Response(null, {
				headers: {
					link: '<https://example.com/related/2>; rel="related"',
				},
			});
		}

		if (arguments_[0] === 'https://example.com/related/2') {
			return new Response('hello, world!', {
				headers: {
					'content-type': 'text/plain',
				},
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
