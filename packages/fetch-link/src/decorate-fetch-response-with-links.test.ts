import {test, vi} from 'vitest';
import fc from 'fast-check';
import {decorateFetchResponseWithLinks} from './decorate-fetch-response-with-links.js';

test('decorateFetchResponseWithLinks adds links method to response', async ({
	expect,
}) => {
	const mockFetch = async (...args: Parameters<typeof fetch>) => new Response();

	const decoratedFetch = decorateFetchResponseWithLinks(mockFetch);
	const response = await decoratedFetch('https://example.com');
	expect(response.links()).toEqual([]);
});

test('decorateFetchResponseWithLinks handles multiple link headers', async ({
	expect,
}) => {
	const fetchImpl = async (...args: Parameters<typeof fetch>) =>
		new Response(null, {
			headers: {
				link: '<https://example.com>; rel="resource"',
				'link-template': '<https://example.com/{id}>; rel="resource-template"',
			},
		});
	const decoratedFetch = decorateFetchResponseWithLinks(fetchImpl);
	const response = await decoratedFetch('https://example.com');
	expect(response.links()).toEqual([
		{uri: 'https://example.com', rel: 'resource'},
		{uri: 'https://example.com/{id}', rel: 'resource-template'},
	]);
});

test('decorateFetchResponseWithLinks handles undefined link header', async ({
	expect,
}) => {
	const fetchImpl = async (...args: Parameters<typeof fetch>) =>
		new Response(null, {headers: {}});
	const decoratedFetch = decorateFetchResponseWithLinks(fetchImpl);
	const response = await decoratedFetch('https://example.com');
	expect(response.links()).toEqual([]);
});

test('decorateFetchResponseWithLinks passes through fetch errors', async ({
	expect,
}) => {
	const fetchImpl = async (...args: Parameters<typeof fetch>) => {
		throw new Error('fetch error');
	};

	const decoratedFetch = decorateFetchResponseWithLinks(fetchImpl);
	await expect(decoratedFetch('https://example.com')).rejects.toThrow(
		'fetch error',
	);
});

test('decorateFetchResponseWithLinks passes through single fetch arguments', async ({
	expect,
}) => {
	const mockFetch = vi.fn(
		async (...args: Parameters<typeof fetch>) => new Response(),
	);

	const decoratedFetch = decorateFetchResponseWithLinks(mockFetch);
	await decoratedFetch('https://example.com');
	expect(mockFetch).toBeCalledWith('https://example.com');
});

test('decorateFetchResponseWithLinks passes through multiple fetch arguments', async ({
	expect,
}) => {
	const mockFetch = vi.fn(
		async (...args: Parameters<typeof fetch>) => new Response(),
	);

	const decoratedFetch = decorateFetchResponseWithLinks(mockFetch);
	await decoratedFetch('https://example.com', {
		method: 'POST',
	});
	expect(mockFetch).toBeCalledWith('https://example.com', {
		method: 'POST',
	});
});

test('links method filters links by rel', async ({expect}) => {
	const fetchImpl = async (input: RequestInfo, init?: RequestInit) => {
		return new Response(null, {
			headers: {
				link: '<https://example.com/related>; rel="related", <https://example.com/other>; rel="other"',
			},
		});
	};

	const fetchWithLinks = decorateFetchResponseWithLinks(fetchImpl);
	const response = await fetchWithLinks('https://example.com');
	expect(response.links('related')).toEqual([
		{uri: 'https://example.com/related', rel: 'related'},
	]);
	expect(response.links('other')).toEqual([
		{uri: 'https://example.com/other', rel: 'other'},
	]);
	expect(response.links('unrelated')).toEqual([]);
});

test('links method filters links by multiple properties', async ({expect}) => {
	const fetchImpl = async (input: RequestInfo, init?: RequestInit) => {
		return new Response(null, {
			headers: {
				link: '<https://example.com/related>; rel="related"; type="text/html", <https://example.com/other>; rel="related"; type="text/plain"',
			},
		});
	};

	const fetchWithLinks = decorateFetchResponseWithLinks(fetchImpl);
	const response = await fetchWithLinks('https://example.com');
	expect(response.links({rel: 'related', type: 'text/html'})).toEqual([
		{uri: 'https://example.com/related', rel: 'related', type: 'text/html'},
	]);
	expect(response.links({rel: 'related', type: 'text/plain'})).toEqual([
		{uri: 'https://example.com/other', rel: 'related', type: 'text/plain'},
	]);
});
