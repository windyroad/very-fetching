import fc from 'fast-check';
import {describe, test, it, vi, expect, beforeAll, afterAll} from 'vitest';
import {setupServer} from 'msw/node';
import {rest} from 'msw';
import {wrapFetch} from './wrap-fetch.js';

it('wraps fetch with a custom wrapper function', async () => {
	const fetchImpl = vi.fn(async () => new Response());
	const wrapper = vi.fn(
		async (fetchImpl: typeof fetch, ...args: Parameters<typeof fetch>) =>
			fetchImpl(...args),
	);

	const wrappedFetch = wrapFetch(wrapper, fetchImpl);

	const response = await wrappedFetch('https://example.com');

	expect(fetchImpl).toHaveBeenCalledWith('https://example.com');
	expect(wrapper).toHaveBeenCalledWith(fetchImpl, 'https://example.com');
	expect(response).toBeInstanceOf(Response);
});

it('passes all arguments to the wrapper function', async () => {
	const fetchImpl = vi.fn(
		async (...args: Parameters<typeof fetch>) => new Response(),
	);
	const wrapper = vi.fn(
		async (fetchImpl: typeof fetch, ...args: Parameters<typeof fetch>) =>
			fetchImpl(...args),
	);

	const wrappedFetch = wrapFetch(wrapper, fetchImpl);

	await fc.assert(
		fc.asyncProperty(
			fc.string(),
			fc.string(),
			fc.boolean(),
			async (url, referrer, keepalive) => {
				await wrappedFetch(url, {referrer, keepalive});
				expect(wrapper).toHaveBeenCalledWith(fetchImpl, url, {
					referrer,
					keepalive,
				});
			},
		),
	);
});

it('adds custom headers to requests', async () => {
	const fetchImpl = vi.fn(async () => new Response());
	const wrapper = vi.fn(
		async (
			fetchImpl: typeof fetch,
			input: Parameters<typeof fetch>[0],
			options: Parameters<typeof fetch>[1],
		) => {
			options = options ?? {};
			options.headers = {
				...options.headers,
				authorization: 'Bearer token',
			};
			return fetchImpl(input, options);
		},
	);

	const wrappedFetch = wrapFetch(wrapper, fetchImpl);

	const url = 'https://example.com';
	const options = {headers: {'Content-Type': 'application/json'}};
	const expectedOptions = {
		headers: {
			'Content-Type': 'application/json',
			authorization: 'Bearer token',
		},
	};

	const response = await wrappedFetch(url, options);

	expect(fetchImpl).toHaveBeenCalledWith(url, expectedOptions);
	expect(wrapper).toHaveBeenCalledWith(fetchImpl, url, options);
	expect(response).toBeInstanceOf(Response);
});

it('caches responses', async () => {
	const fetchImpl = vi.fn(async () => new Response());
	const cache = new Map<string, Awaited<ReturnType<typeof fetch>>>();
	const wrapper = vi.fn(
		async (fetchImpl: typeof fetch, ...args: Parameters<typeof fetch>) => {
			const key = JSON.stringify(args);
			if (cache.has(key)) {
				return cache.get(key);
			}

			const response = await fetchImpl(...args);
			cache.set(key, response);
			return response;
		},
	);

	const wrappedFetch = wrapFetch(wrapper, fetchImpl);

	const url = 'https://example.com';

	const response1 = await wrappedFetch(url);
	const response2 = await wrappedFetch(url);

	expect(fetchImpl).toHaveBeenCalledTimes(1);
	expect(wrapper).toHaveBeenCalledTimes(2);
	expect(response1).toBeInstanceOf(Response);
	expect(response2).toBeInstanceOf(Response);
	expect(response1).toBe(response2);
});

it('logs requests and responses', async () => {
	const fetchImpl = vi.fn(async () => new Response());
	const log = vi.fn();
	const wrapper = vi.fn(
		async (fetchImpl: typeof fetch, ...args: Parameters<typeof fetch>) => {
			log('Request:', args);
			const response = await fetchImpl(...args);
			log('Response:', response);
			return response;
		},
	);

	const wrappedFetch = wrapFetch(wrapper, fetchImpl);

	const url = 'https://example.com';

	const response = await wrappedFetch(url);

	expect(fetchImpl).toHaveBeenCalledWith(url);
	expect(wrapper).toHaveBeenCalledWith(fetchImpl, url);
	expect(response).toBeInstanceOf(Response);
	expect(log).toHaveBeenCalledTimes(2);
	expect(log).toHaveBeenCalledWith('Request:', [url]);
	expect(log).toHaveBeenCalledWith('Response:', response);
});

it('transforms responses', async () => {
	const fetchImpl = vi.fn(async () => new Response('{"foo": "bar"}'));
	const wrapper = vi.fn(
		async (fetchImpl: typeof fetch, ...args: Parameters<typeof fetch>) => {
			const response = await fetchImpl(...args);
			const data = (await response.json()) as unknown;
			return {...response, data};
		},
	);

	const wrappedFetch = wrapFetch(wrapper, fetchImpl);

	const url = 'https://example.com';

	const response = await wrappedFetch(url);

	expect(fetchImpl).toHaveBeenCalledWith(url);
	expect(wrapper).toHaveBeenCalledWith(fetchImpl, url);
	expect(response).toEqual(expect.objectContaining({data: {foo: 'bar'}}));
});

it('handles errors', async () => {
	const fetchImpl = vi.fn(
		async () => new Response('{"error": "Not found"}', {status: 404}),
	);
	const wrapper = vi.fn(
		async (fetchImpl: typeof fetch, ...args: Parameters<typeof fetch>) => {
			const response = await fetchImpl(...args);
			if (!response.ok) {
				const data = (await response.json()) as unknown;
				if (
					typeof data === 'object' &&
					data !== null &&
					'error' in data &&
					typeof data.error === 'string'
				) {
					throw new Error(data.error);
				} else {
					throw new Error('Invalid error response');
				}
			}

			return response;
		},
	);

	const wrappedFetch = wrapFetch(wrapper, fetchImpl);

	const url = 'https://example.com';

	await expect(wrappedFetch(url)).rejects.toThrow('Not found');
});

test('wrapFetch should wrap the global fetch function by default', async () => {
	const wrapper = vi.fn(async (fetchImpl, ...args) => {
		return 'wrapped';
	});
	const wrappedFetch = wrapFetch(wrapper);
	const result = await wrappedFetch('https://example.com');
	expect(wrapper).toBeCalledWith(globalThis.fetch, 'https://example.com');
});

describe('wrapFetch intercept', () => {
	const server = setupServer(
		rest.get(
			'https://jsonplaceholder.typicode.com/posts',
			async (request, response, ctx) => {
				return response(
					ctx.status(200),
					ctx.json([{id: 1, title: 'foo', author: 'John Doe'}]),
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

	test('wrapFetch should wrap the fetch function and apply the wrapper function', async ({
		expect,
	}) => {
		const wrapper = async (
			fetchImpl: typeof fetch,
			...args: Parameters<typeof fetch>
		) => {
			const response = await fetchImpl(...args);
			const data = (await response.json()) as unknown;
			return data;
		};

		const wrappedFetch = wrapFetch(wrapper);
		const result = await wrappedFetch(
			'https://jsonplaceholder.typicode.com/posts',
		);
		expect(Array.isArray(result)).toBeTruthy();
		expect((result as unknown[]).length).toBeGreaterThan(0);
		expect((result as unknown[])[0]).toHaveProperty('id', 1);
		expect((result as unknown[])[0]).toHaveProperty('title', 'foo');
		expect((result as unknown[])[0]).toHaveProperty('author', 'John Doe');
	});
});
