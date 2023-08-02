import {test, describe, vi} from 'vitest';
import fc from 'fast-check';
import {decorateFetchResponseWithLinks} from './decorate-fetch-response-with-links';
import {findMatchingFragments} from './find-matching-fragments';

describe('decorateFetchResponseWithLinks', () => {
	test('decorateFetchResponseWithLinks adds links method to response', async ({
		expect,
	}) => {
		const mockFetch = async (...arguments_: Parameters<typeof fetch>) =>
			new Response();

		const decoratedFetch = decorateFetchResponseWithLinks(mockFetch);
		const response = await decoratedFetch('https://example.com');
		expect(response.links()).toEqual([]);
	});

	test('decorateFetchResponseWithLinks handles multiple link headers', async ({
		expect,
	}) => {
		const fetchImpl = async (...arguments_: Parameters<typeof fetch>) =>
			new Response(null, {
				headers: {
					link: '<https://example.com>; rel="resource"',
					'link-template':
						'<https://example.com/{id}>; rel="resource-template"',
				},
			});
		const decoratedFetch = decorateFetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('https://example.com');
		expect(response.links()).toEqual([
			{uri: 'https://example.com/', rel: 'resource'},
			{uri: 'https://example.com/{id}', rel: 'resource-template'},
		]);
	});

	test('decorateFetchResponseWithLinks handles undefined link header', async ({
		expect,
	}) => {
		const fetchImpl = async (...arguments_: Parameters<typeof fetch>) =>
			new Response(null, {headers: {}});
		const decoratedFetch = decorateFetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('https://example.com');
		expect(response.links()).toEqual([]);
	});

	test('decorateFetchResponseWithLinks passes through fetch errors', async ({
		expect,
	}) => {
		const fetchImpl = async (...arguments_: Parameters<typeof fetch>) => {
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
			async (...arguments_: Parameters<typeof fetch>) => new Response(),
		);

		const decoratedFetch = decorateFetchResponseWithLinks(mockFetch);
		await decoratedFetch('https://example.com');
		expect(mockFetch).toBeCalledWith('https://example.com');
	});

	test('decorateFetchResponseWithLinks passes through multiple fetch arguments', async ({
		expect,
	}) => {
		const mockFetch = vi.fn(
			async (...arguments_: Parameters<typeof fetch>) => new Response(),
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

	test('links method filters links by multiple properties', async ({
		expect,
	}) => {
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

	test('decorateFetchResponseWithLinks expands link templates with parameters', async ({
		expect,
	}) => {
		const fetchImpl = async (...arguments_: Parameters<typeof fetch>) =>
			new Response(null, {
				headers: {
					'link-template':
						'<https://example.com/{id}>; rel="resource-template"',
				},
			});

		const decoratedFetch = decorateFetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('https://example.com');

		expect(response.links(undefined, {id: '123'})).toEqual([
			{uri: 'https://example.com/123', rel: 'resource-template'},
		]);
	});

	test('decorateFetchResponseWithLinks does not expand link templates without parameters', async ({
		expect,
	}) => {
		const fetchImpl = async (...arguments_: Parameters<typeof fetch>) =>
			new Response(null, {
				headers: {
					'link-template':
						'<https://example.com/{foo}>; rel="resource-template"',
				},
			});

		const decoratedFetch = decorateFetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('https://example.com');

		expect(response.links('resource-template', {foo: 'bar'})).toEqual([
			{uri: 'https://example.com/bar', rel: 'resource-template'},
		]);
	});

	test('should add links with variables for a template hash', async ({
		expect,
	}) => {
		const json = {
			foo: [
				{id: 1, name: 'Alice'},
				{id: 2, name: 'Bob'},
			],
		};
		const fetchImpl = vi.fn().mockResolvedValue({
			headers: new Headers({
				link: '<#/foo/{index}>; rel="item"',
				'Content-Type': 'application/json',
			}),
			json: async () => json,
			clone() {},
			url: 'http://example.com',
		});
		const decoratedFetch = decorateFetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('http://example.com');
		const links = response.links();
		expect(links).toEqual([
			{uri: 'http://example.com/#/foo/0', rel: 'item'},
			{uri: 'http://example.com/#/foo/1', rel: 'item'},
		]);
	});

	test('should add links with variables for a nested template hash', async ({
		expect,
	}) => {
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
		const fetchImpl = vi.fn().mockResolvedValue({
			headers: new Headers({
				link: '<#/{key}/{index}>; rel="item"',
				'Content-Type': 'application/json',
			}),
			json: async () => json,
			clone() {},
			url: 'http://example.com',
		});
		const decoratedFetch = decorateFetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('http://example.com');
		const links = response.links();
		expect(links).toEqual([
			{uri: 'http://example.com/#/foo/0', rel: 'item'},
			{uri: 'http://example.com/#/foo/1', rel: 'item'},
			{uri: 'http://example.com/#/bar/0', rel: 'item'},
			{uri: 'http://example.com/#/bar/1', rel: 'item'},
		]);
	});

	test('should not add links with variables for a template hash of not json', async ({
		expect,
	}) => {
		const json = {
			foo: [
				{id: 1, name: 'Alice'},
				{id: 2, name: 'Bob'},
			],
		};
		const fetchImpl = vi.fn().mockResolvedValue({
			headers: new Headers({
				link: '<#/foo/{index}>; rel="item"',
			}),
			json: async () => json,
			clone() {},
			url: 'http://example.com',
		});
		const decoratedFetch = decorateFetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('http://example.com');
		const links = response.links();
		expect(links).toEqual([
			{uri: 'http://example.com/#/foo/{index}', rel: 'item'},
		]);
	});

	test('should add links with anchors for a template hash with anchor', async ({
		expect,
	}) => {
		const json = {
			foo: [
				{id: 1, name: 'Alice'},
				{id: 2, name: 'Bob'},
			],
		};
		const fetchImpl = vi.fn().mockResolvedValue({
			headers: new Headers({
				link: '<#/foo/{index}>; rel="item", <#/foo/{index}/name>; rel="name" anchor="#/foo/{index}"',
				'Content-Type': 'application/json',
			}),
			json: async () => json,
			clone() {},
			url: 'http://example.com',
		});
		const decoratedFetch = decorateFetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('http://example.com');
		const links = response.links();
		expect(links).toEqual([
			{uri: 'http://example.com/#/foo/0', rel: 'item'},
			{uri: 'http://example.com/#/foo/1', rel: 'item'},
			{uri: 'http://example.com/#/foo/0/name', rel: 'name', anchor: '#/foo/0'},
			{uri: 'http://example.com/#/foo/1/name', rel: 'name', anchor: '#/foo/1'},
		]);
	});

	test('should not add links for a non-matching hash', async ({expect}) => {
		const json = {
			foo: [
				{id: 1, name: 'Alice'},
				{id: 2, name: 'Bob'},
			],
		};
		const fetchImpl = vi.fn().mockResolvedValue({
			headers: new Headers({
				link: '<#/bar/{id}>; rel="item"',
				'Content-Type': 'application/json',
			}),
			json: async () => json,
			clone() {},
			url: 'http://example.com',
		});
		const decoratedFetch = decorateFetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('http://example.com');
		const links = response.links();
		expect(links).toEqual([]);
	});
});
